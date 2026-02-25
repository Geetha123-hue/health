import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mic, Square, Activity, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const SymptomChecker = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const category = location.state?.category || '';

    const recognition = useRef(null);

    useEffect(() => {
        if (!SpeechRecognition) {
            setError('Browser does not support Speech Recognition. Please type your symptoms.');
            return;
        }

        recognition.current = new SpeechRecognition();
        recognition.current.continuous = true;
        recognition.current.interimResults = true;

        const savedLang = localStorage.getItem('lang') || 'English';
        const langMap = {
            'English': 'en-US',
            'Spanish': 'es-ES',
            'French': 'fr-FR',
            'Hindi': 'hi-IN',
            'Telugu': 'te-IN'
        };
        recognition.current.lang = langMap[savedLang] || 'en-US';

        recognition.current.onresult = (event) => {
            let currentTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                currentTranscript += event.results[i][0].transcript;
            }
            setTranscript((prev) => prev + " " + currentTranscript);
        };

        recognition.current.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        return () => {
            if (recognition.current) {
                recognition.current.stop();
            }
        };
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognition.current?.stop();
            setIsListening(false);
        } else {
            setTranscript('');
            setError('');
            try {
                recognition.current?.start();
                setIsListening(true);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handlePredict = async () => {
        if (!transcript.trim()) {
            setError('Please describe your symptoms first.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = await api.ai.predict(transcript);

            // Speak response text-to-speech if supported
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(`Based on your symptoms, our AI suggests you might have ${data.disease}. The severity is ${data.severity}.`);
                window.speechSynthesis.speak(utterance);
            }

            // Pass state to next page
            navigate('/prediction', { state: { prediction: data, symptoms: transcript } });
        } catch (err) {
            setError(err.message || 'Error occurred while predicting disease.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-transition" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="flex justify-between items-center mb-4">
                <h2>AI Symptom <span className="gradient-text">Checker</span></h2>
            </div>

            {category && (
                <div className="mb-4">
                    <span className="badge badge-moderate">Specialty: {category}</span>
                </div>
            )}

            <p className="text-secondary mb-4">
                Describe how you are feeling. You can either type your symptoms or use the voice assistant.
            </p>

            {error && (
                <div className="mb-4 flex items-center gap-2" style={{ color: '#B45309', background: '#FEF3C7', padding: '1rem', borderRadius: '12px', border: '1px solid #FDE68A' }}>
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div className="glass-panel text-center mb-4" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <button
                    onClick={toggleListening}
                    className={`mic-btn ${isListening ? 'listening' : ''} mb-4`}
                    disabled={!SpeechRecognition || loading}
                >
                    {isListening ? <Square size={32} /> : <Mic size={32} />}
                </button>

                <h3 className="mb-2">
                    {isListening ? 'Listening...' : 'Tap to Speak'}
                </h3>
                <p className="text-secondary" style={{ maxWidth: '400px' }}>
                    "I have a severe headache, mild fever, and I've been coughing since yesterday."
                </p>
            </div>

            <div className="input-group">
                <label className="input-label">Symptoms Transcript</label>
                <textarea
                    className="input-field"
                    rows="4"
                    placeholder="Type or speak to fill your symptoms here..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    disabled={isListening}
                ></textarea>
            </div>

            <button
                className="btn btn-primary w-full mt-2"
                onClick={handlePredict}
                disabled={loading || isListening || !transcript.trim()}
            >
                {loading ? <span className="flex items-center gap-2"><Activity className="spinner" /> Analyzing...</span> : 'Analyze Symptoms'}
            </button>
            <style>{`.spinner { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default SymptomChecker;
