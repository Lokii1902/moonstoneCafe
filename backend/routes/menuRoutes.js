const express = require('express');
const router = express.Router();
const {
    getCategories,
    createCategory,
    getMenuItems,
    getAllMenuItemsAdmin,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
} = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.get('/categories', getCategories);
router.get('/items', getMenuItems);

// Protected (Admin)
router.post('/categories', protect, createCategory);
router.get('/admin/items', protect, getAllMenuItemsAdmin);
router.post('/items', protect, createMenuItem);
router.put('/items/:id', protect, updateMenuItem);
router.delete('/items/:id', protect, deleteMenuItem);

module.exports = router;
