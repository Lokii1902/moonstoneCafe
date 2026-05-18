const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkDb() {
    console.log('Connecting to DB:', process.env.DB_HOST);
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
        });

        console.log('✅ Connected.');

        // Check tables
        const [tables] = await connection.query('SHOW TABLES');
        console.log('Tables:', tables.map(t => Object.values(t)[0]));

        // Check admin_users
        try {
            const [users] = await connection.query('SELECT * FROM admin_users');
            console.log('Admin Users count:', users.length);
            if (users.length > 0) {
                console.log('Users:', users.map(u => u.username));
            }
        } catch (err) {
            console.log('❌ Error querying admin_users (likely table missing):', err.message);
        }

        await connection.end();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
    }
}

checkDb();
