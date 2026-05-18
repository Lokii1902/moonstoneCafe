const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = '508825841965-trhil23cc52o2m2crr35sr3krt65ifl6.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const generateToken = (id, name, email) => {
    return jwt.sign({ id, name, email }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
};

// @desc    Register a new user (Email/Password)
// @route   POST /api/users/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.query('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, hashedPassword]);

        res.status(201).json({
            id: result.insertId,
            name,
            email,
            token: generateToken(result.insertId, name, email)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user (Email/Password)
// @route   POST /api/users/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length > 0) {
            const user = rows[0];

            if (!user.password_hash) {
                return res.status(400).json({ message: 'User signed up with an external provider. Please login appropriately.' });
            }

            const match = await bcrypt.compare(password, user.password_hash);

            if (match) {
                res.json({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone || '',
                    address: user.address || '',
                    token: generateToken(user.id, user.name, user.email)
                });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Google Login
// @route   POST /api/users/auth/google
// @access  Public
const googleLogin = async (req, res) => {
    const { credential } = req.body;
    
    if (!credential) {
        return res.status(400).json({ message: 'Google credential missing' });
    }
    
    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        const { email, name, picture, sub } = payload;
        
        let [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        let user;
        
        if (rows.length === 0) {
            const [result] = await db.query('INSERT INTO users (name, email, google_id, avatar_url) VALUES (?, ?, ?, ?)', [name, email, sub, picture]);
            user = { id: result.insertId, name, email, google_id: sub, avatar_url: picture };
        } else {
            user = rows[0];
            if (!user.google_id || user.avatar_url !== picture) {
                await db.query('UPDATE users SET google_id = ?, avatar_url = ? WHERE id = ?', [sub, picture, user.id]);
                user.google_id = sub;
                user.avatar_url = picture;
            }
        }
        
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            address: user.address || '',
            avatar_url: user.avatar_url || '',
            token: generateToken(user.id, user.name, user.email)
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ message: 'Invalid Google token' });
    }
};

module.exports = { registerUser, loginUser, googleLogin };
