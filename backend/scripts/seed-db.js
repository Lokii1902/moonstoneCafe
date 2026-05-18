const db = require('../config/db');
const bcrypt = require('bcrypt');

const schema = [
    `CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        image_url VARCHAR(500),
        sort_order INT DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS menu_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        is_veg BOOLEAN DEFAULT FALSE,
        image_url VARCHAR(500),
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(200),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT FALSE
    )`,
    `CREATE TABLE IF NOT EXISTS reservations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        reservation_date DATE NOT NULL,
        reservation_time TIME NOT NULL,
        guests INT NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
];

async function seed() {
    console.log('🌱 Seeding Database...');

    try {
        console.log('✅ Connected via db pool.');

        // 1. Create Tables
        for (const query of schema) {
            await db.query(query);
        }
        console.log('✅ Tables created.');

        // 2. Create Admin
        const adminUsername = 'admin';
        const plainPassword = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(plainPassword, salt);

        try {
            await db.query('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)', [adminUsername, hash]);
            console.log(`✅ Admin created: ${adminUsername} / ${plainPassword}`);
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                console.log('ℹ️ Admin user already exists.');
            } else {
                throw err;
            }
        }

        // 3. Seed Categories
        const categories = [
            ['Biryani', 'biryani', 1],
            ['Tandoori (BBQ)', 'tandoori', 2],
            ['Shawarma', 'shawarma', 3],
            ['Pizza', 'pizza', 4],
            ['Chinese Rice & Noodles', 'chinese', 5],
            ['Burgers', 'burgers', 6],
            ['Desserts', 'desserts', 7],
            ['Milkshakes & Beverages', 'beverages', 8]
        ];

        for (const cat of categories) {
            try {
                await db.query('INSERT INTO categories (name, slug, sort_order) VALUES (?, ?, ?)', cat);
            } catch (err) {
                if (err.code !== 'ER_DUP_ENTRY') throw err;
            }
        }
        console.log('✅ Categories seeded.');

    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        process.exit(0);
    }
}

seed();
