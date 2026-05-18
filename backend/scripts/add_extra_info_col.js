const db = require('../config/db');

const addExtraInfoColumn = async () => {
    try {
        console.log('🔄 Checking for "extra_info" column...');

        const [columns] = await db.query('SHOW COLUMNS FROM restaurant_info');
        const hasColumn = columns.some(col => col.Field === 'extra_info');

        if (!hasColumn) {
            console.log('⚠️ Column "extra_info" missing. Adding it now...');
            await db.query('ALTER TABLE restaurant_info ADD COLUMN extra_info TEXT');
            console.log('✅ Column "extra_info" added successfully!');
        } else {
            console.log('✅ Column "extra_info" already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
};

addExtraInfoColumn();
