const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ error: 'Email already in use' });

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, hashedPassword]);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone || null,
                address: user.address || null,
                city: user.city || null,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Verify Google ID token and create or login user
exports.googleAuth = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ error: 'Missing idToken' });

        const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
        const payload = ticket.getPayload();
        const email = payload.email;
        const name = payload.name || '';

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        let user;
        if (users.length === 0) {
            // create new user with a random password hash
            const randomHash = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
            const result = await db.query('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, randomHash]);
            const insertId = result[0].insertId;
            user = { id: insertId, name, email, role: 'customer' };
        } else {
            user = users[0];
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone || null,
                address: user.address || null,
                city: user.city || null,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Google auth error:', err.message);
        res.status(500).json({ error: 'Google authentication failed' });
    }
};
