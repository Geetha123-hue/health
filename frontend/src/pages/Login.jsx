import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { HeartPulse, ArrowRight } from 'lucide-react';

const Login = () => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await api.auth.login(name);
            localStorage.setItem('token', data.token);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--bg-color)' }}>
            <div className="glass-panel page-transition" style={{ maxWidth: '420px', width: '100%', padding: '3rem 2rem' }}>
                <div className="flex justify-center mb-4">
                    <div style={{ background: 'var(--primary)', padding: '1.2rem', borderRadius: '16px', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)' }}>
                        <HeartPulse color="white" size={48} />
                    </div>
                </div>

                <h2 className="text-center mb-2">Welcome to <span className="gradient-text">UrbanHealth</span></h2>
                <p className="text-center text-secondary mb-4" style={{ fontSize: '0.95rem' }}>
                    Professional AI-powered healthcare support.
                </p>

                {error && (
                    <div className="mb-4 text-center" style={{ color: 'var(--danger)', fontSize: '0.9rem', background: '#FEF2F2', padding: '0.8rem', borderRadius: '8px', border: '1px solid #FECACA' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label className="input-label">Your Name</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'} <ArrowRight size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
