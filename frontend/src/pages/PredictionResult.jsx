import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, Stethoscope, ArrowLeft, Pill, Hospital } from 'lucide-react';

const PredictionResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { prediction, symptoms } = location.state || {};

    // The backend AI service returns an "error" property inside the prediction object 
    // if the symptoms were invalid or out of vocabulary.
    const error = prediction?.error;

    if (!prediction && !error) { // If no prediction and no explicit error, show "No Data"
        return (
            <div className="text-center mt-4 page-transition">
                <h2>No Prediction Data</h2>
                <button className="btn btn-primary mt-2" onClick={() => navigate('/symptom-checker')}>Go Back</button>
            </div>
        );
    }

    // Determine badge severity
    const badgeClass = prediction && prediction.severity.toLowerCase().includes('severe')
        ? 'badge-severe'
        : prediction && prediction.severity.toLowerCase().includes('moderate')
            ? 'badge-moderate'
            : 'badge-mild';

    return (
        <div className="page-transition" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button className="btn btn-secondary flex items-center gap-2 mb-4" onClick={() => navigate('/symptom-checker')}>
                <ArrowLeft size={16} /> Back to Checker
            </button>

            {error && (
                <div className="mb-4 flex items-center gap-2 page-transition" style={{ color: '#B45309', background: '#FEF3C7', padding: '1rem', borderRadius: '12px', border: '1px solid #FDE68A' }}>
                    <AlertTriangle size={24} />
                    <div>
                        <h4 style={{ color: '#B91C1C' }}>Warning</h4>
                        <p style={{ fontSize: '0.9rem', color: '#991B1B' }}>{error}</p>
                    </div>
                </div>
            )}

            {prediction && !error && (
                <>
                    <div className="glass-panel" style={{ borderTop: '4px solid var(--primary)' }}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-secondary text-sm uppercase tracking-wide mb-1">AI Diagnosis</p>
                                <h1 className="gradient-text mb-2" style={{ fontSize: '2.5rem' }}>{prediction.disease}</h1>
                                <span className={`badge ${badgeClass} `}>{prediction.severity}</span>
                            </div>
                            <div style={{ background: 'rgba(110, 86, 255, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                                <Stethoscope color="var(--primary)" size={40} />
                            </div>
                        </div>

                        <div className="mb-4 p-4 rounded" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                            <h4 className="mb-2 text-secondary">Reported Symptoms</h4>
                            <p>"{symptoms}"</p>
                        </div>

                        <div className="grid mt-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <div className="glass card">
                                <div className="flex items-center gap-2 mb-2">
                                    <Pill color="var(--secondary)" />
                                    <h4 style={{ color: 'var(--secondary)' }}>Recommended Action</h4>
                                </div>
                                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                                    {prediction.medications.map((med, idx) => (
                                        <li key={idx} className="mb-1">{med}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="glass card" style={{ background: '#FEF3C7', borderColor: '#FDE68A' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Hospital color="var(--warning)" />
                                    <h4 style={{ color: '#B45309' }}>Next Steps</h4>
                                </div>
                                <p style={{ color: '#92400E' }}>
                                    If symptoms persist or worsen, please consult a medical professional immediately.
                                </p>
                                <button className="btn btn-secondary w-full mt-2 text-sm" onClick={() => navigate('/')} style={{ background: 'white', borderColor: '#FCD34D' }}>
                                    Find Specialist
                                </button>
                            </div>
                        </div>

                        {prediction.severity && prediction.severity.toLowerCase().includes('severe') && (
                            <div className="glass mt-4 flex items-center justify-between" style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '1.5rem' }}>
                                <div className="flex items-center gap-4">
                                    <AlertTriangle color="var(--danger)" size={32} />
                                    <div>
                                        <h4 style={{ color: '#B91C1C' }}>High Severity Warning</h4>
                                        <p style={{ fontSize: '0.9rem', color: '#991B1B' }}>This condition may require immediate medical attention.</p>
                                    </div>
                                </div>
                                <button className="btn btn-danger" onClick={() => alert('Dialing Emergency Services!')}>
                                    Call Emergency
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default PredictionResult;
