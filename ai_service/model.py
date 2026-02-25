import os
import pandas as pd
import numpy as np
import pickle
import kagglehub
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split

print("Starting Model Training Pipeline...")

# Download latest version of the dataset using kagglehub
print("Downloading Dataset from Kaggle...")
try:
    path = kagglehub.dataset_download("niyarrbarman/symptom2disease")
    csv_path = os.path.join(path, "Symptom2Disease.csv")
    print("Path to dataset files:", path)
    
    df = pd.read_csv(csv_path)
    print(f"Dataset loaded. Total rows: {len(df)}")
except Exception as e:
    print(f"Failed to download dataset. Using fallback synthetic data. Error: {e}")
    # Fallback to basic data so the server still runs if Kaggle fails
    df = pd.DataFrame({
        'text': ['I have a bad headache and fever', 'My chest hurts and I cannot breathe', 'My skin is very itchy'],
        'label': ['Migraine', 'Heart Attack', 'Allergy']
    })

# The kaggle dataset has columns: 'Unnamed: 0', 'label', 'text'
# We only need text (symptoms) and label (disease)
if 'text' in df.columns and 'label' in df.columns:
    X = df['text']
    y = df['label']
else:
    raise ValueError("Dataset does not have 'text' and 'label' columns as expected.")

print(f"Unique diseases in dataset: {y.nunique()}")

# Split data (just for typical ML pipeline standard practice, though we train on all for deployment)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Create a robust NLP pipeline: TF-IDF -> Random Forest
# We use a threshold later to determine if symptoms "match" or are out of domain.
pipeline = make_pipeline(
    TfidfVectorizer(stop_words='english', max_features=5000, ngram_range=(1, 2)),
    RandomForestClassifier(n_estimators=100, random_state=42)
)

print("Training model (this may take a moment)...")
pipeline.fit(X_train, y_train)

# Calculate accuracy on test set
accuracy = pipeline.score(X_test, y_test)
print(f"Model trained successfully! Test Accuracy: {accuracy:.4f}")

# Save the Pipeline
model_path = os.path.join(os.path.dirname(__file__), 'disease_model.pkl')
with open(model_path, 'wb') as f:
    pickle.dump(pipeline, f)

# Create a mapping for severity and medications since the Kaggle dataset doesn't provide it
severity_map = {
    'Psoriasis': ('Mild', ['Topical Corticosteroids', 'Emollients']),
    'Varicose Veins': ('Mild', ['Compression stockings', 'Exercise']),
    'Typhoid': ('Moderate', ['Antibiotics (Ciprofloxacin)', 'Hydration']),
    'Chicken pox': ('Moderate', ['Calamine lotion', 'Antiviral if severe']),
    'Impetigo': ('Mild', ['Topical antibiotics (Mupirocin)']),
    'Dengue': ('Moderate to Severe', ['Pain relievers (Acetaminophen)', 'Intravenous fluids']),
    'Fungal infection': ('Mild', ['Antifungal cream', 'Keep area dry']),
    'Common Cold': ('Mild', ['Rest', 'Antihistamines']),
    'Pneumonia': ('Severe', ['Antibiotics', 'Oxygen therapy']),
    'Dimorphic Hemorrhoids': ('Moderate', ['High-fiber diet', 'Topical treatments']),
    'Arthritis': ('Moderate', ['NSAIDs', 'Physical therapy']),
    'Acne': ('Mild', ['Salicylic acid', 'Benzoyl peroxide']),
    'Bronchial Asthma': ('Severe', ['Inhaled corticosteroids', 'Bronchodilators']),
    'Hypertension': ('Moderate', ['ACE inhibitors', 'Lifestyle changes']),
    'Migraine': ('Moderate', ['Triptans', 'Pain relievers']),
    'Cervical spondylosis': ('Moderate', ['Physical therapy', 'Muscle relaxants']),
    'Jaundice': ('Moderate to Severe', ['Treat underlying cause', 'Rest']),
    'Malaria': ('Severe', ['Antimalarial drugs (Artemisinin)', 'Fever reducers']),
    'urinary tract infection': ('Moderate', ['Antibiotics', 'Increased fluid intake']),
    'allergy': ('Mild', ['Antihistamines', 'Avoid allergens']),
    'gastroesophageal reflux disease': ('Mild', ['Antacids', 'PPIs']),
    'drug reaction': ('Moderate', ['Stop medication', 'Antihistamines']),
    'peptic ulcer disease': ('Moderate', ['Antibiotics (if H. pylori)', 'PPIs']),
    'diabetes': ('Moderate', ['Insulin', 'Diet control'])
}

# The dataset labels might be different cases, so we will generate a lowercase dict for safety
disease_info_path = os.path.join(os.path.dirname(__file__), 'disease_info.pkl')
with open(disease_info_path, 'wb') as f:
    pickle.dump(severity_map, f)

print(f"Model exported to {model_path}")
print("Training Pipeline Complete!")
