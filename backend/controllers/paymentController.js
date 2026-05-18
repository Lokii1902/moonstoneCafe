const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/db');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log('💳 Razorpay Initialized:', { 
    key_id: process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.substring(0, 8)}...` : 'MISSING',
    has_secret: !!process.env.RAZORPAY_KEY_SECRET 
});

// 1. Create a Razorpay Order
const createOrder = async (req, res) => {
    try {
        const { amount } = req.body; // Amount in INR
        
        const options = {
            amount: Math.round(amount * 100), // convert to paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.status(201).json(order);
    } catch (error) {
        console.error('CRITICAL Razorpay Order Error:', {
            message: error.message,
            stack: error.stack,
            error: error
        });
        res.status(500).json({ 
            message: 'Internal Server Error',
            error: error.message 
        });
    }
};

// 2. Verify Payment and Save Final Order
const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            order_details // items, total_price, customer_details, user_id (optional)
        } = req.body;

        const userId = req.user ? req.user.id : null;

        // Verify signature
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Save order to database
        const { items, total_price, customer_details } = order_details;
        
        const [result] = await db.query(
            `INSERT INTO orders (user_id, items, total_price, customer_details, razorpay_order_id, razorpay_payment_id, payment_status) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, 
                JSON.stringify(items), 
                total_price, 
                JSON.stringify(customer_details), 
                razorpay_order_id, 
                razorpay_payment_id, 
                'paid'
            ]
        );

        res.status(201).json({ 
            message: 'Payment verified and order placed', 
            orderId: result.insertId 
        });

    } catch (error) {
        console.error('Payment Verification Error:', error);
        res.status(500).json({ message: 'Payment verification failed' });
    }
};

module.exports = { createOrder, verifyPayment };
