const API_URL = 'http://localhost:5000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    auth: {
        login: async (name) => {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ name })
            });
            if (!res.ok) throw new Error('Login failed');
            return res.json();
        }
    },
    user: {
        getProfile: async () => {
            const res = await fetch(`${API_URL}/profile`, { headers: getHeaders() });
            if (!res.ok) throw new Error('Not authenticated');
            return res.json();
        }
    },
    ai: {
        predict: async (symptoms_text) => {
            const res = await fetch(`${API_URL}/predict`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ symptoms_text })
            });
            if (!res.ok) throw new Error('Prediction failed');
            return res.json();
        }
    },
    health: {
        getEmergency: async (type = '') => {
            const res = await fetch(`${API_URL}/emergency?type=${type}`, { headers: getHeaders() });
            return res.json();
        },
        getAnalytics: async () => {
            const res = await fetch(`${API_URL}/analytics`, { headers: getHeaders() });
            return res.json();
        }
    },
    chat: {
        sendMessage: async (message, language) => {
            const res = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ message, language })
            });
            return res.json();
        },
        emergencyChat: async (text) => {
            // Proxied through Node.js or called directly to AI service
            // We'll hit backend to proxy it or hit AI directly. Let's hit the backend proxy.
            const res = await fetch(`${API_URL}/emergency_chat`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ text })
            });
            return res.json();
        }
    }
};
