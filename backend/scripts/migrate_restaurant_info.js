const db = require('../config/db');

const migrateRestaurantInfo = async () => {
    try {
        console.log('🔄 Checking for restaurant_info table...');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS restaurant_info (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) DEFAULT 'Moonstone Café',
                address TEXT,
                phone VARCHAR(50),
                email VARCHAR(100),
                opening_hours TEXT,
                cuisine_type VARCHAR(255),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `;

        await db.query(createTableQuery);
        console.log('✅ Table "restaurant_info" ensured.');

        // Check if data exists
        const [rows] = await db.query('SELECT COUNT(*) as count FROM restaurant_info');
        if (rows[0].count === 0) {
            console.log('🔄 Seeding initial data...');
            const insertQuery = `
                INSERT INTO restaurant_info (id, name, address, phone, email, opening_hours, cuisine_type) 
                VALUES (1, 'Moonstone Café', '123 Luxury Lane, Food City', '+91 98765 43210', 'info@moonstonecafe.com', 'Mon-Sun: 11:00 AM - 11:00 PM', 'Multicuisine (Biryani, Tandoori, Chinese, Continental)');
            `;
            await db.query(insertQuery);
            console.log('✅ Initial data inserted.');
        } else {
            console.log('✅ Data already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrateRestaurantInfo();
