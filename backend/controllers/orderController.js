const db = require('../config/db');
const { emitEvent } = require('../utils/socket');
const { checkIsOpen } = require('../utils/timeUtils');

// Create a new order for the authenticated user
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, total_price, customer_details } = req.body;

    // Check if restaurant is open
    const [info] = await db.query('SELECT * FROM restaurant_info LIMIT 1');
    if (info.length > 0 && !checkIsOpen(info[0])) {
      return res.status(403).json({ 
        message: 'Order failed: Restaurant is currently closed. Opening hours: 5:00 PM - 11:00 PM',
        is_closed: true 
      });
    }

    const [result] = await db.query(
      `INSERT INTO orders (user_id, items, total_price, customer_details) VALUES (?, ?, ?, ?)`,
      [userId, JSON.stringify(items), total_price, JSON.stringify(customer_details)]
    );

    // Emit live update to admin
    emitEvent('newOrder', { id: result.insertId, customer_details, total_price, created_at: new Date() });

    res.status(201).json({ message: 'Order placed', orderId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Create a COD order for guests or authenticated users
const createCodOrder = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { items, total_price, customer_details } = req.body;
    
    // Check if restaurant is open
    const [info] = await db.query('SELECT * FROM restaurant_info LIMIT 1');
    if (info.length > 0 && !checkIsOpen(info[0])) {
      return res.status(403).json({ 
        message: 'Order failed: Restaurant is currently closed. Opening hours: 5:00 PM - 11:00 PM',
        is_closed: true 
      });
    }

    const [result] = await db.query(
      `INSERT INTO orders (user_id, items, total_price, customer_details, payment_method, payment_status, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, JSON.stringify(items), total_price, JSON.stringify(customer_details), 'cod', 'pending', 'pending']
    );

    // Emit live update to admin
    emitEvent('newOrder', { id: result.insertId, customer_details, total_price, created_at: new Date() });

    res.status(201).json({ message: 'Order placed via COD', orderId: result.insertId });
  } catch (error) {
    console.error('COD Order Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get order history for the authenticated user
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all orders
const getAllOrdersAdmin = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT o.*, u.name as user_name, u.email as user_email 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const [result] = await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order status updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    const allowed = ['pending', 'paid', 'failed', 'refunded'];
    if (!allowed.includes(payment_status)) {
      return res.status(400).json({ message: `Invalid payment_status. Must be one of: ${allowed.join(', ')}` });
    }

    const [result] = await db.query('UPDATE orders SET payment_status = ? WHERE id = ?', [payment_status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Payment status updated', payment_status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// User: Cancel order (only if status is pending)
const cancelOrderByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if order exists and belongs to the user
    const [rows] = await db.query('SELECT status, user_id FROM orders WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = rows[0];

    // Allow cancellation if order belongs to user OR if current user is an admin
    const isOwner = String(order.user_id) === String(userId);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    // Case-insensitive status check
    if (order.status && order.status.toLowerCase() !== 'pending') {
      return res.status(400).json({ message: `Cannot cancel order with status: ${order.status}` });
    }

    // Update status to cancelled
    const [result] = await db.query('UPDATE orders SET status = ? WHERE id = ?', ['cancelled', id]);
    
    if (result.affectedRows === 0) {
      return res.status(500).json({ message: 'Failed to cancel order' });
    }

    // Notify all listeners (Admins)
    emitEvent('orderCancelled', { id, cancelledBy: isAdmin ? 'admin' : 'user', cancelledAt: new Date() });

    res.json({ 
      success: true,
      message: 'Order cancelled successfully', 
      orderId: id,
      newStatus: 'cancelled'
    });
  } catch (error) {
    console.error('[CANCEL_ORDER] Error:', error);
    res.status(500).json({ 
      message: 'Server error during cancellation', 
      error: error.message 
    });
  }
};

module.exports = { createOrder, createCodOrder, getMyOrders, getAllOrdersAdmin, updateOrderStatus, updatePaymentStatus, cancelOrderByUser };
