const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Middleware to verify JWT and attach user to request
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Verify user exists and attach to request
    // 1. Check standard users table
    let [rows] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
    
    // 2. If not found, check admin_users table (handles tokens from loginAdmin)
    if (rows.length === 0) {
      [rows] = await db.query('SELECT id, username as name, NULL as email, "admin" as role FROM admin_users WHERE id = ?', [decoded.id]);
    }

    if (rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = rows[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Verify user exists and attach to request
    let [rows] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
    
    if (rows.length === 0) {
      [rows] = await db.query('SELECT id, username as name, NULL as email, "admin" as role FROM admin_users WHERE id = ?', [decoded.id]);
    }

    if (rows.length > 0) {
      req.user = rows[0];
    }
  } catch (error) {
    console.error('Optional auth token invalid, proceeding as guest', error);
  }
  next();
};

module.exports = { protect, optionalAuth };
