const db = require('../config/db');

const addPaymentColumns = async () => {
    try {
        console.log('🔄 Updating "orders" table for payments...');

        const [columns] = await db.query('SHOW COLUMNS FROM orders');
        const columnNames = columns.map(col => col.Field);

        if (!columnNames.includes('razorpay_order_id')) {
            console.log('🔹 Adding razorpay_order_id...');
            await db.query('ALTER TABLE orders ADD COLUMN razorpay_order_id VARCHAR(255) AFTER customer_details');
        }

        if (!columnNames.includes('razorpay_payment_id')) {
            console.log('🔹 Adding razorpay_payment_id...');
            await db.query('ALTER TABLE orders ADD COLUMN razorpay_payment_id VARCHAR(255) AFTER razorpay_order_id');
        }

        if (!columnNames.includes('payment_status')) {
            console.log('🔹 Adding payment_status...');
            await db.query("ALTER TABLE orders ADD COLUMN payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending' AFTER razorpay_payment_id");
        }

        console.log('✅ Orders table updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
};

addPaymentColumns();
