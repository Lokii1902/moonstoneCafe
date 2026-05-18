const db = require('../config/db');

const migrateOrdersTable = async () => {
    try {
        console.log('🔄 Updating "orders" table schema...');

        // 1. Add customer_details column if not exists
        const [columns] = await db.query('SHOW COLUMNS FROM orders');
        const hasCustomerDetails = columns.some(col => col.Field === 'customer_details');

        if (!hasCustomerDetails) {
            console.log('🔹 Adding "customer_details" column...');
            await db.query('ALTER TABLE orders ADD COLUMN customer_details JSON AFTER total_price');
        }

        // 2. Update status ENUM
        console.log('🔹 Updating "status" ENUM options...');
        // We use MODIFY to update the ENUM list. Existing values outside the list might be affected depending on DB version, 
        // but 'pending', 'confirmed', 'delivered', 'cancelled' are preserved.
        await db.query(`
            ALTER TABLE orders 
            MODIFY COLUMN status ENUM('pending', 'confirmed', 'preparing', 'out for delivery', 'delivered', 'cancelled') 
            DEFAULT 'pending'
        `);

        console.log('✅ Orders table updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
};

migrateOrdersTable();
