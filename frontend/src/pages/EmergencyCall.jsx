import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Square, ShieldAlert, ArrowLeft, Volume2 } from 'lucide-react';
import { api } from '../services/api';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const EmergencyCall = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const navigate = useNavigate();

    const recognition = useRef(null);

    useEffect(() => {
        if (!SpeechRecognition) {
            setError('Browser does not support Speech Recognition. Please type your emergency.');
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
            window.speechSynthesis.cancel();
        };
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognition.current?.stop();
            setIsListening(false);
        } else {
            // Stop TTS if speaking
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setAiResponse('');
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

    const handleSendEmergency = async () => {
        if (!transcript.trim()) {
            setError('Please describe your emergency first.');
            return;
        }

        setLoading(true);
        setError('');
        setAiResponse('');

        try {
            const data = await api.chat.emergencyChat(transcript);
            setAiResponse(data.reply);

            // Speak response text-to-speech if supported
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel(); // clear previous
                const utterance = new SpeechSynthesisUtterance(data.reply);

                const savedLang = localStorage.getItem('lang') || 'English';
                const langMap = {
                    'English': 'en-US',
                    'Spanish': 'es-ES',
                    'French': 'fr-FR',
                    'Hindi': 'hi-IN',
                    'Telugu': 'te-IN'
                };
                utterance.lang = langMap[savedLang] || 'en-US';

                utterance.onstart = () => setIsSpeaking(true);
                utterance.onend = () => setIsSpeaking(false);

                window.speechSynthesis.speak(utterance);
            }
        } catch (err) {
            setError(err.message || 'Error communicating with AI Emergency Agent.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-transition" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button className="btn btn-secondary mb-4" onClick={() => navigate(-1)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                <ArrowLeft size={16} /> Back
            </button>

            <div className="flex items-center gap-3 mb-4">
                <div style={{ background: 'var(--danger)', padding: '0.8rem', borderRadius: '50%' }}>
                    <ShieldAlert color="white" size={28} />
                </div>
                <h2>AI Emergency <span style={{ color: 'var(--danger)' }}>Agent</span></h2>
            </div>

            <p className="text-secondary mb-4">
                Describe your emergency. Our AI agent is integrated with direct speech-to-text to rapidly assess the situation and deliver critical first-aid instructions via audio.
            </p>

            {error && (
                <div className="mb-4 flex items-center gap-2" style={{ color: '#B45309', background: '#FEF3C7', padding: '1rem', borderRadius: '12px', border: '1px solid #FDE68A' }}>
                    <ShieldAlert size={20} />
                    {error}
                </div>
            )}

            <div className="glass-panel text-center mb-4" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(239, 68, 68, 0.2)' }}>
                <button
                    onClick={toggleListening}
                    className={`mic-btn ${isListening ? 'listening' : ''} mb-4`}
                    disabled={!SpeechRecognition || loading || isSpeaking}
                    style={isListening ? { borderColor: 'var(--danger)', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)' } : {}}
                >
                    {isListening ? <Square size={32} /> : <Mic size={32} />}
                </button>

                <h3 className="mb-2">
                    {isListening ? 'Listening for Emergency...' : 'Tap Mic to Speak'}
                </h3>
                <p className="text-secondary" style={{ maxWidth: '400px' }}>
                    "Someone has collapsed and is not breathing."
                </p>
                <p className="text-secondary" style={{ maxWidth: '400px', marginTop: '0.5rem' }}>
                    "I am experiencing severe chest pain."
                </p>
            </div>

            <div className="input-group">
                <label className="input-label" style={{ color: 'var(--danger)' }}>Emergency Transcript (Speech-to-Text)</label>
                <textarea
                    className="input-field"
                    rows="3"
                    placeholder="Speak to see live transcript or type here..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    disabled={isListening}
                    style={{ borderColor: transcript ? 'var(--warning)' : 'var(--border-color)' }}
                ></textarea>
            </div>

            <button
                className="btn btn-danger w-full mt-2 mb-4"
                onClick={handleSendEmergency}
                disabled={loading || isListening || !transcript.trim() || isSpeaking}
            >
                {loading ? 'Transmitting to AI...' : 'Request AI Emergency Advice'}
            </button>

            {/* AI Response Box */}
            {aiResponse && (
                <div className="glass-panel page-transition" style={{ borderLeft: '4px solid var(--danger)', padding: '1.5rem' }}>
                    <div className="flex items-center gap-2 mb-2">
                        <Volume2 size={20} color="var(--danger)" className={isSpeaking ? 'speaking-animation' : ''} />
                        <h4 style={{ color: 'var(--danger)' }}>AI Agent Response (Text-to-Speech)</h4>
                    </div>
                    <p style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                        {aiResponse}
                    </p>
                </div>
            )}

            <style>{`
                .speaking-animation {
                    animation: pulse 1s infinite alternate;
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.7; }
                    100% { transform: scale(1.2); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default EmergencyCall;
