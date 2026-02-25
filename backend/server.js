const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'super-secret-key-for-dev';

// Helper: Verify JWT Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// 1. Authentication Service
app.post('/api/auth/login', (req, res) => {
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: 'Name is required' });

    // Upsert user
    db.get(`SELECT * FROM users WHERE name = ?`, [name], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
            // User exists
            const token = jwt.sign({ id: row.id, name: row.name }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ token, user: row, isNewUser: false });
        } else {
            // New user
            db.run(`INSERT INTO users (name) VALUES (?)`, [name], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                const token = jwt.sign({ id: this.lastID, name }, JWT_SECRET, { expiresIn: '24h' });
                res.json({ token, user: { id: this.lastID, name, language: 'en' }, isNewUser: true });
            });
        }
    });
});

// 2. Profile Management
app.get('/api/profile', authenticateToken, (req, res) => {
    db.get(`SELECT id, name, language, profile_info FROM users WHERE id = ?`, [req.user.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'User not found' });
        res.json(row);
    });
});

app.post('/api/profile', authenticateToken, (req, res) => {
    const { name, language, profile_info } = req.body;
    db.run(
        `UPDATE users SET name = ?, language = ?, profile_info = ? WHERE id = ?`,
        [name, language, profile_info, req.user.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Profile updated successfully' });
        }
    );
});

// 3. Emergency & Location Service
app.get('/api/emergency', (req, res) => {
    const { type } = req.query; // e.g., 'Cardiologist', 'General'
    let query = `SELECT * FROM hospitals`;
    let params = [];

    if (type) {
        query += ` WHERE specialization = ?`;
        params.push(type);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
            hospitals: rows,
            helpline: '911 or local equivalent 1-800-HEALTH'
        });
    });
});

// 4. Analytics & Reporting (For Dashboard)
app.get('/api/analytics', (req, res) => {
    // Generate some dummy analytics data for the dashboard
    res.json({
        disease_trends: {
            'Cold/Flu': 45,
            'Allergy': 25,
            'Skin Infection': 15,
            'Migraine': 15
        },
        high_risk_zones: ['Downtown', 'Northside'],
        total_predictions_today: 124
    });
});

// 5. Chatbot Mock API
app.post('/api/chat', authenticateToken, (req, res) => {
    const { message, language } = req.body;
    let reply = "";

    // Simulate translation/mock response
    if (language === 'Spanish') {
        reply = "¿En qué más puedo ayudarte? Recuerda que el AI puede analizar tus síntomas para mayor precisión.";
    } else if (language === 'French') {
        reply = "Comment puis-je vous aider ? N'oubliez pas que l'IA peut analyser vos symptômes pour plus de précision.";
    } else if (language === 'Hindi') {
        reply = "मैं आपकी कैसे मदद कर सकता हूँ? याद रखें कि एआई अधिक सटीकता के लिए आपके लक्षणों का विश्लेषण कर सकता है।";
    } else {
        reply = "How else can I assist you? Remember that the AI can analyze your symptoms for greater accuracy.";
    }

    // Mock delay for realism
    setTimeout(() => {
        res.json({ reply });
    }, 1000);
});

// 6. Proxy AI Prediction (Will be implemented after AI service is ready)
// We will use node-fetch or similar, but for now just a placeholder
app.post('/api/predict', authenticateToken, async (req, res) => {
    const { symptoms_text } = req.body;

    if (!symptoms_text) {
        return res.status(400).json({ error: 'Symptoms text required' });
    }

    try {
        // Log symptom in DB
        db.run(`INSERT INTO symptoms (user_id, symptom_text) VALUES (?, ?)`, [req.user.id, symptoms_text], async function (err) {
            if (err) console.error(err);
            const symptom_id = this.lastID;

            try {
                // Call Python API
                const aiResponse = await fetch('http://127.0.0.1:8000/predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: symptoms_text })
                });

                if (!aiResponse.ok) {
                    throw new Error(`AI service responded with ${aiResponse.status}`);
                }

                const data = await aiResponse.json();

                // Save prediction
                db.run(`INSERT INTO predictions (user_id, symptom_id, predicted_disease, severity, medications) VALUES (?, ?, ?, ?, ?)`,
                    [req.user.id, symptom_id, data.disease, data.severity, JSON.stringify(data.medications)]
                );

                res.json(data);
            } catch (error) {
                console.error("AI service error", error);

                // Fallback mock response if Python server is unreachable
                const fallbackData = {
                    disease: 'Unknown - Model Offline',
                    severity: 'Moderate',
                    medications: ['Consult a doctor']
                };
                res.json(fallbackData);
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
