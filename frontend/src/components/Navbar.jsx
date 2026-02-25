import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, LogOut, Globe } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    // Default language is English
    const [language, setLanguage] = useState(localStorage.getItem('lang') || 'English');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleLanguageChange = (e) => {
        const selected = e.target.value;
        setLanguage(selected);
        localStorage.setItem('lang', selected);
    };

    return (
        <nav className="navbar">
            <Link to="/" className="nav-logo">
                <div style={{ background: 'var(--primary)', padding: '0.4rem', borderRadius: '10px', display: 'flex' }}>
                    <Stethoscope color="white" size={24} />
                </div>
                Urban<span className="gradient-text">Health</span>
            </Link>
            <div className="nav-links">
                <Link to="/" className="nav-link">Dashboard</Link>
                <Link to="/analytics" className="nav-link">Analytics</Link>

                {/* Language Selector */}
                <div className="flex items-center gap-2">
                    <Globe size={18} color="var(--text-secondary)" />
                    <select className="select-field text-sm" value={language} onChange={handleLanguageChange}>
                        <option value="English">English</option>
                        <option value="Spanish">Español</option>
                        <option value="French">Français</option>
                        <option value="Hindi">हिंदी</option>
                        <option value="Telugu">తెలుగు</option>
                    </select>
                </div>

                <button onClick={handleLogout} className="btn btn-secondary flex items-center gap-2 text-sm" style={{ padding: '0.6rem 1.2rem', borderRadius: '12px' }}>
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
