import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Activity, MapPin, Users, TrendingUp } from 'lucide-react';

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.health.getAnalytics();
                setData(res);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return <div className="text-center mt-4">Loading Analytics...</div>;
    }

    if (!data) return <div className="text-center mt-4 text-warning">Error loading data.</div>;

    const totalDiseases = Object.values(data.disease_trends).reduce((a, b) => a + b, 0);

    return (
        <div className="page-transition">
            <header className="mb-4">
                <h2 className="mb-2">Urban Health <span className="gradient-text">Analytics</span></h2>
                <p className="text-secondary">Community insights and disease trends overview.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="glass-panel text-center">
                    <div className="flex justify-center mb-2">
                        <div style={{ background: '#EFF6FF', padding: '1rem', borderRadius: '50%' }}>
                            <Users color="var(--primary)" size={28} />
                        </div>
                    </div>
                    <h3 style={{ fontSize: '2.5rem' }}>{data.total_predictions_today}</h3>
                    <p className="text-secondary font-medium">Predictions Today</p>
                </div>

                <div className="glass-panel text-center">
                    <div className="flex justify-center mb-2">
                        <div style={{ background: '#D1FAE5', padding: '1rem', borderRadius: '50%' }}>
                            <TrendingUp color="var(--secondary)" size={28} />
                        </div>
                    </div>
                    <h3 style={{ fontSize: '2.5rem' }}>{Object.keys(data.disease_trends).length}</h3>
                    <p className="text-secondary font-medium">Tracked Epidemics</p>
                </div>

                <div className="glass-panel text-center">
                    <div className="flex justify-center mb-2">
                        <div style={{ background: '#FEF2F2', padding: '1rem', borderRadius: '50%' }}>
                            <MapPin color="var(--danger)" size={28} />
                        </div>
                    </div>
                    <h3 style={{ fontSize: '2.5rem' }}>{data.high_risk_zones.length}</h3>
                    <p className="text-secondary font-medium">High Risk Zones</p>
                </div>
            </div>

            <div className="grid mt-4" style={{ gridTemplateColumns: '2fr 1fr' }}>
                <div className="glass card">
                    <h4 className="mb-4 flex items-center gap-2"><Activity size={20} color="var(--primary)" /> Disease Trends</h4>
                    {Object.entries(data.disease_trends).map(([disease, count], idx) => {
                        const percentage = Math.round((count / totalDiseases) * 100);
                        return (
                            <div key={idx} className="mb-4">
                                <div className="flex justify-between mb-2" style={{ fontSize: '0.95rem', fontWeight: '500' }}>
                                    <span>{disease}</span>
                                    <span className="text-secondary">{percentage}%</span>
                                </div>
                                <div style={{ width: '100%', background: '#E2E8F0', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                                    <div style={{ width: `${percentage}%`, background: 'var(--primary)', height: '100%', borderRadius: '5px' }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="glass card">
                    <h4 className="mb-4 flex items-center gap-2" style={{ color: 'var(--danger)' }}><MapPin size={20} /> High Risk Zones</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {data.high_risk_zones.map((zone, idx) => (
                            <li key={idx} className="mb-2 flex items-center gap-2" style={{ padding: '0.8rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                                <div style={{ width: '10px', height: '10px', background: 'var(--danger)', borderRadius: '50%' }}></div>
                                <span style={{ fontWeight: '500' }}>{zone}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
