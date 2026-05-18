const db = require('../config/db');

// --- CATEGORIES ---

// @desc    Get all categories
// @route   GET /api/menu/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories ORDER BY sort_order ASC');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create category
// @route   POST /api/menu/categories
// @access  Private (Admin)
const createCategory = async (req, res) => {
    const { name, slug, image_url, sort_order } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO categories (name, slug, image_url, sort_order) VALUES (?, ?, ?, ?)',
            [name, slug, image_url, sort_order]
        );
        res.status(201).json({ id: result.insertId, name, slug });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- MENU ITEMS ---

// @desc    Get all menu items (optionally filter by category)
// @route   GET /api/menu/items
// @access  Public
const getMenuItems = async (req, res) => {
    const { category_id } = req.query;
    try {
        let query = 'SELECT m.*, c.name as category_name FROM menu_items m LEFT JOIN categories c ON m.category_id = c.id WHERE m.is_available = 1';
        let params = [];

        if (category_id) {
            query += ' AND m.category_id = ?';
            params.push(category_id);
        }

        const [items] = await db.query(query, params);
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all menu items for Admin (includes unavailable)
// @route   GET /api/menu/admin/items
// @access  Private
const getAllMenuItemsAdmin = async (req, res) => {
    try {
        const [items] = await db.query('SELECT m.*, c.name as category_name FROM menu_items m LEFT JOIN categories c ON m.category_id = c.id');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create menu item
// @route   POST /api/menu/items
// @access  Private
const createMenuItem = async (req, res) => {
    const { category_id, name, description, price, is_veg, image_url } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO menu_items (category_id, name, description, price, is_veg, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [category_id, name, description, price, is_veg, image_url, true]
        );
        res.status(201).json({ id: result.insertId, name });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update menu item
// @route   PUT /api/menu/items/:id
// @access  Private
const updateMenuItem = async (req, res) => {
    const { id } = req.params;
    const { category_id, name, description, price, is_veg, image_url, is_available } = req.body;
    try {
        await db.query(
            'UPDATE menu_items SET category_id=?, name=?, description=?, price=?, is_veg=?, image_url=?, is_available=? WHERE id=?',
            [category_id, name, description, price, is_veg, image_url, is_available, id]
        );
        res.json({ message: 'Item updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/items/:id
// @access  Private
const deleteMenuItem = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM menu_items WHERE id = ?', [id]);
        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCategories,
    createCategory,
    getMenuItems,
    getAllMenuItemsAdmin,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
};
