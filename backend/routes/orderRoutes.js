const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { createOrder, createCodOrder, getMyOrders, getAllOrdersAdmin, updateOrderStatus, updatePaymentStatus, cancelOrderByUser } = require('../controllers/orderController');

router.post('/', protect, createOrder);
router.post('/cod', optionalAuth, createCodOrder);
router.get('/my-orders', protect, getMyOrders);

router.put('/:id/cancel', protect, cancelOrderByUser);
// Admin
router.get('/admin/all', protect, getAllOrdersAdmin);
router.put('/:id/status', protect, updateOrderStatus);
router.put('/:id/payment-status', protect, updatePaymentStatus);

module.exports = router;
