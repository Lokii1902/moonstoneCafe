const db = require('../config/db');
const { checkIsOpen } = require('../utils/timeUtils');
const { emitEvent } = require('../utils/socket');

// @desc    Get restaurant info
// @route   GET /api/restaurant
// @access  Public
const getRestaurantInfo = async (req, res) => {
    try {
        const [info] = await db.query('SELECT * FROM restaurant_info LIMIT 1');
        const restaurant = info[0];
        // Calculate dynamic open status
        const is_open = checkIsOpen(restaurant);
        
        res.json({ ...restaurant, is_open });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update restaurant info
// @route   PUT /api/restaurant
// @access  Private (Admin)
const updateRestaurantInfo = async (req, res) => { console.log("PUT /restaurant body:", req.body);
    const { name, address, phone, email, opening_hours, cuisine_type, is_manual_closed, extra_info, opening_time, closing_time, operating_mode } = req.body;
    try {
        // Check if row exists
        const [info] = await db.query('SELECT id FROM restaurant_info LIMIT 1');

        if (info.length === 0) {
            // Insert
            await db.query(
                'INSERT INTO restaurant_info (name, address, phone, email, opening_hours, cuisine_type, is_manual_closed, extra_info, opening_time, closing_time, operating_mode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [name, address, phone, email, opening_hours, cuisine_type, is_manual_closed ? 1 : 0, extra_info, opening_time, closing_time, operating_mode || 'auto']
            );
        } else {
            // Update
            await db.query(
                'UPDATE restaurant_info SET name=?, address=?, phone=?, email=?, opening_hours=?, cuisine_type=?, is_manual_closed=?, extra_info=?, opening_time=?, closing_time=?, operating_mode=? WHERE id=?',
                [name, address, phone, email, opening_hours, cuisine_type, is_manual_closed ? 1 : 0, extra_info, opening_time, closing_time, operating_mode || 'auto', info[0].id]
            );
        }

        // Notify all clients that restaurant info has changed
        emitEvent('restaurantUpdate', { message: 'Restaurant info updated' });

        res.json({ message: 'Restaurant info updated', success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRestaurantInfo,
    updateRestaurantInfo
};
