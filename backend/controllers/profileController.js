const db = require('../config/db');

// Get current user's profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query('SELECT id, name, email, phone, address, avatar_url, role, created_at FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Update current user's profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, address, avatar_url } = req.body;
    const [result] = await db.query(
      `UPDATE users SET name = ?, email = ?, phone = ?, address = ?, avatar_url = ? WHERE id = ?`,
      [name, email, phone, address, avatar_url, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile };
