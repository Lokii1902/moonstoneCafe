const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.post('/create-order', optionalAuth, createOrder);
router.post('/verify', optionalAuth, verifyPayment);

module.exports = router;
