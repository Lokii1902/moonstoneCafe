const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (id, username) => {
    return jwt.sign({ id, username }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Auth admin & get token
// @route   POST /api/auth/login
// @access  Public
const loginAdmin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM admin_users WHERE username = ?', [username]);

        if (rows.length > 0) {
            const user = rows[0];
            const match = await bcrypt.compare(password, user.password_hash);

            if (match) {
                res.json({
                    id: user.id,
                    username: user.username,
                    token: generateToken(user.id, user.username)
                });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new admin (First time use helper)
// @route   POST /api/auth/register-seed
// @access  Public (Should be disabled in production or protected)
const registerAdminSeed = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.query('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)', [username, hashedPassword]);

        res.status(201).json({ message: 'Admin created', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { loginAdmin, registerAdminSeed };
