
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Mic, ShieldAlert, Heart, Siren, Stethoscope, Brain, Bone, Baby, Smile } from 'lucide-react';

const categories = [
    { title: 'General Checkup', icon: <Activity />, color: '#6E56FF' },
    { title: 'Cardiologist', icon: <Heart />, color: '#FF4A94' },
    { title: 'Dermatologist', icon: <ShieldAlert />, color: '#00E676' },
    { title: 'ENT Specialist', icon: <Stethoscope />, color: '#FFC400' },
    { title: 'Neurologist', icon: <Brain />, color: '#9C27B0' },
    { title: 'Orthopedist', icon: <Bone />, color: '#FF7043' },
    { title: 'Pediatrician', icon: <Baby />, color: '#42A5F5' },
    { title: 'Psychiatrist', icon: <Smile />, color: '#26A69A' }
];

const Dashboard = () => {
    const navigate = useNavigate();
    const [greeting] = useState(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    });

    return (
        <div className="page-transition">
            <header className="mb-4">
                <h1 className="mb-2">{greeting}, <span className="gradient-text">Resident</span></h1>
                <p style={{ color: 'var(--text-secondary)' }}>How can we help you with your health today?</p>
            </header>

            {/* AI Action Banner */}
            <div
                className="glass-panel mb-4 flex justify-between items-center"
                style={{ background: 'linear-gradient(to right, #EFF6FF, #F8FAFC)', cursor: 'pointer', border: '1px solid #BFDBFE' }}
                onClick={() => navigate('/symptom-checker')}
            >
                <div>
                    <h2>AI Symptom Checker</h2>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Speak your symptoms to get instant AI predictions and remedies.</p>
                </div>
                <div className="mic-btn" style={{ width: '60px', height: '60px', flexShrink: 0 }}>
                    <Mic size={24} />
                </div>
            </div>

            <h3 className="mb-2 mt-4">Specialist Categories</h3>
            <div className="grid">
                {categories.map((cat, idx) => (
                    <div
                        key={idx}
                        className="glass card flex items-center gap-4 flex-row"
                        style={{ borderLeft: `4px solid ${cat.color}` }}
                        onClick={() => navigate('/symptom-checker', { state: { category: cat.title } })}
                    >
                        <div style={{ background: `${cat.color}15`, padding: '1.2rem', borderRadius: '12px', color: cat.color }}>
                            {cat.icon}
                        </div>
                        <div>
                            <h4>{cat.title}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Book Consultation</p>
                        </div>
                    </div>
                ))}
            </div>

            <h3 className="mb-2 mt-4">Emergency Support</h3>
            <div className="glass-panel flex items-center justify-between" style={{ background: '#FEF2F2', borderColor: '#FECACA', padding: '1.5rem 2.5rem' }}>
                <div className="flex gap-4 items-center">
                    <div style={{ background: 'var(--danger)', padding: '1rem', borderRadius: '50%' }}>
                        <Siren color="white" />
                    </div>
                    <div>
                        <h4 style={{ color: 'var(--danger)' }}>24/7 Emergency Helpline</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Immediate response for critical situations.</p>
                    </div>
                </div>
                <button className="btn btn-danger" onClick={() => navigate('/emergency')}>
                    Call Now
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
