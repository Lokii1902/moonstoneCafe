const db = require('../config/db');
const { emitEvent } = require('../utils/socket');

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
const submitMessage = async (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    try {
        await db.query(
            'INSERT INTO messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, subject, message]
        );
        
        // Emit live update to admin
        emitEvent('newMessage', { name, email, phone, subject, message, created_at: new Date() });

        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all messages
// @route   GET /api/contact
// @access  Private (Admin)
const getMessages = async (req, res) => {
    try {
        const [messages] = await db.query('SELECT * FROM messages ORDER BY created_at DESC');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit a reservation
// @route   POST /api/reservations
// @access  Public
const submitReservation = async (req, res) => {
    const { name, phone, date, time, guests } = req.body;
    try {
        await db.query(
            'INSERT INTO reservations (name, phone, reservation_date, reservation_time, guests) VALUES (?, ?, ?, ?, ?)',
            [name, phone, date, time, guests]
        );

        // Emit live update to admin
        emitEvent('newReservation', { name, phone, reservation_date: date, reservation_time: time, guests, created_at: new Date() });

        res.status(201).json({ message: 'Reservation request sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reservations
// @route   GET /api/reservations
// @access  Private
const getReservations = async (req, res) => {
    try {
        const [reservations] = await db.query('SELECT * FROM reservations ORDER BY reservation_date DESC');
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark message as read
// @route   PUT /api/contact/:id/read
// @access  Private (Admin)
const markMessageRead = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE messages SET is_read = 1 WHERE id = ?', [id]);
        res.json({ message: 'Message marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { submitMessage, getMessages, submitReservation, getReservations, markMessageRead };
