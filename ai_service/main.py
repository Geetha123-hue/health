import pickle
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model and Info Maps dynamically
model_path = os.path.join(os.path.dirname(__file__), 'disease_model.pkl')
info_path = os.path.join(os.path.dirname(__file__), 'disease_info.pkl')

if os.path.exists(model_path) and os.path.exists(info_path):
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    with open(info_path, 'rb') as f:
        disease_info_map = pickle.load(f)
else:
    raise RuntimeError("Model files not found. Please run model.py first.")

class SymptomRequest(BaseModel):
    text: str

class PredictionResponse(BaseModel):
    disease: str
    severity: Optional[str] = None
    medications: Optional[List[str]] = None
    error: Optional[str] = None

class EmergencyRequest(BaseModel):
    text: str

class EmergencyResponse(BaseModel):
    reply: str

@app.get("/")
def read_root():
    return {"status": "AI Service is running"}

@app.post("/emergency_chat", response_model=EmergencyResponse)
def emergency_chat(request: EmergencyRequest):
    text = request.text.lower()
    
    # Simple keyword-based emergency AI logic
    if any(word in text for word in ["heart", "chest", "attack", "pain"]):
        reply = "This sounds like a cardiovascular emergency. Please remain calm, chew an aspirin if available, and wait for emergency services. Paramedics have been notionally dispatched."
    elif any(word in text for word in ["breathe", "choking", "breathing", "asthma"]):
        reply = "If you are having severe difficulty breathing, please sit upright. If you have an inhaler or epipen, use it immediately. Ensure doors are unlocked for first responders."
    elif any(word in text for word in ["bleeding", "blood", "cut", "wound"]):
        reply = "For severe bleeding, apply firm, direct pressure to the wound using a clean cloth. Do not remove the cloth if it soaks through, add another on top. Keep the injured area elevated."
    elif any(word in text for word in ["head", "concussion", "dizzy", "faint", "passed out"]):
        reply = "Stay seated or lay down to prevent a fall. Do not move abruptly. If someone is unconscious, ensure their airway is clear and roll them onto their side."
    elif any(word in text for word in ["fire", "burn"]):
        reply = "Move away from the source of the burn. Run cool, not cold, water over the affected area for 10 minutes. Do not pop blisters or apply ice directly."
    else:
        reply = "I am the Emergency AI Agent. We have registered your call. Please stay on the line and stay calm. An operator will be with you shortly. If you can, tell me more about your symptoms."
        
    return EmergencyResponse(reply=reply)

@app.post("/predict", response_model=PredictionResponse)
def predict_disease(request: SymptomRequest):
    if not model:
        raise HTTPException(status_code=500, detail="Model is not loaded.")
    
    if not request.text or len(request.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Symptom text cannot be empty.")
        
    try:
        # 1. Strict Vocabulary Validation
        vectorizer = model.steps[0][1] 
        X_vec = vectorizer.transform([request.text])
        
        # Count words in request
        word_count = len(request.text.split())
        
        # We only reject if it's completely out of vocabulary for very long sentences
        if X_vec.nnz == 0 and word_count > 2:
            return PredictionResponse(
                disease="Unknown Condition",
                severity="Unknown",
                medications=[],
                error="The symptoms provided do not match enough known medical terms in our database. Please type your correct symptoms."
            )

        # 2. Probability Validation
        proba = model.predict_proba([request.text])[0]
        max_prob = max(proba)
        
        if max_prob < 0.12:
            return PredictionResponse(
                disease="Unknown Condition",
                severity="Unknown",
                medications=[],
                error="We could not confidently determine a diagnosis from these symptoms. Please provide more medical details."
            )

        # Predict normally
        disease = model.predict([request.text])[0]
        
        # Look up severity/meds
        severity = "Consult Doctor"
        medications = ["Seek medical advice"]
        
        # Look up severity/meds using case-insensitive partial matching
        for k, v in disease_info_map.items():
            if k.lower() in disease.lower() or disease.lower() in k.lower():
                severity, medications = v
                break
        
        return PredictionResponse(
            disease=disease,
            severity=severity,
            medications=medications,
            error=None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
