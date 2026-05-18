const db = require('./config/db');

const queries = [
    `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NULL,
        google_id VARCHAR(255) NULL UNIQUE,
        phone VARCHAR(20) NULL,
        address TEXT NULL,
        avatar_url VARCHAR(500) NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        items JSON NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        customer_details JSON NULL,
        payment_method VARCHAR(50) DEFAULT 'cod',
        payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
        razorpay_order_id VARCHAR(255) NULL,
        razorpay_payment_id VARCHAR(255) NULL,
        status ENUM('pending', 'confirmed', 'preparing', 'out for delivery', 'delivered', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )`
];

async function setup() {
    try {
        console.log('🚀 Setting up users and orders tables...');
        
        for (const query of queries) {
            await db.query(query);
        }
        
        console.log('✅ Missing tables created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up tables:', error.message);
        process.exit(1);
    }
}

setup();
