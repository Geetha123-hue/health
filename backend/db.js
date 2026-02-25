const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'health.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Create schema
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                language TEXT DEFAULT 'en',
                profile_info TEXT
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS symptoms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                symptom_text TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                symptom_id INTEGER,
                predicted_disease TEXT,
                severity TEXT,
                medications TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(symptom_id) REFERENCES symptoms(id)
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS hospitals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                location TEXT,
                contact_info TEXT,
                specialization TEXT
            )`);

            // Insert mock hospital data if empty
            db.get(`SELECT count(*) as count FROM hospitals`, (err, row) => {
                if (row.count === 0) {
                    const stmt = db.prepare(`INSERT INTO hospitals (name, location, contact_info, specialization) VALUES (?, ?, ?, ?)`);
                    stmt.run('City General Hospital', 'Downtown', '123-456-7890', 'General');
                    stmt.run('Skin Care Clinic', 'Westside', '123-456-7891', 'Dermatologist');
                    stmt.run('Heart Center', 'Eastside', '123-456-7892', 'Cardiologist');
                    stmt.run('ENT Specialists', 'Northside', '123-456-7893', 'ENT');
                    stmt.finalize();
                }
            });
        });
    }
});

module.exports = db;
