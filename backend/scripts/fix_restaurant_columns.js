const db = require('../config/db');

async function fix() {
    try {
        await db.query(`ALTER TABLE restaurant_info ADD COLUMN is_manual_closed TINYINT(1) DEFAULT 0`);
        console.log('Added is_manual_closed');
    } catch(e) { console.log('is_manual_closed error:', e.message) }

    try {
        await db.query(`ALTER TABLE restaurant_info ADD COLUMN extra_info TEXT`);
        console.log('Added extra_info');
    } catch(e) { console.log('extra_info error:', e.message) }

    try {
        await db.query(`ALTER TABLE restaurant_info ADD COLUMN opening_time VARCHAR(20) DEFAULT '10:00'`);
        console.log('Added opening_time');
    } catch(e) { console.log('opening_time error:', e.message) }

    try {
        await db.query(`ALTER TABLE restaurant_info ADD COLUMN closing_time VARCHAR(20) DEFAULT '23:59'`);
        console.log('Added closing_time');
    } catch(e) { console.log('closing_time error:', e.message) }

    try {
        await db.query(`ALTER TABLE restaurant_info ADD COLUMN operating_mode VARCHAR(50) DEFAULT 'auto'`);
        console.log('Added operating_mode');
    } catch(e) { console.log('operating_mode error:', e.message) }

    console.log("Script finished.");
    process.exit(0);
}

fix();
