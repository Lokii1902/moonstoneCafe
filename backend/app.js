const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: true }));

// Serve uploaded dish images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Moonstone Café Server is Running', timestamp: new Date() });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userAuthRoutes = require('./routes/userAuthRoutes'); // New user routes
const profileRoutes = require('./routes/profileRoutes'); // User profiles
const orderRoutes = require('./routes/orderRoutes'); // User orders
const menuRoutes = require('./routes/menuRoutes');
const contactRoutes = require('./routes/contactRoutes');
const chatRoutes = require('./routes/chatRoutes'); // New
const restaurantRoutes = require('./routes/restaurantRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // Payment integration

app.use('/api/auth', authRoutes);
app.use('/api/users/auth', userAuthRoutes); // New user endpoints
app.use('/api/users/profile', profileRoutes); // Profile endpoints
app.use('/api/orders', orderRoutes); // Order endpoints
app.use('/api/menu', menuRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/chat', chatRoutes); // New Route
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/payment', paymentRoutes); // Payment endpoint

// Image upload endpoint for menu items (admin)
const upload = require('./middleware/uploadMiddleware');
app.post('/api/upload/image', require('./middleware/authMiddleware').protect, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded or invalid file type.' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
});

// Avatar upload endpoint for users
app.post('/api/upload/avatar', require('./middleware/authMiddleware').protect, upload.single('avatar'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded or invalid file type.' });
    }
    const avatarUrl = `/uploads/${req.file.filename}`;
    res.json({ avatarUrl });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

const http = require('http');
const socketUtils = require('./utils/socket');

// Inside server/app.js after importing all routes
const httpServer = http.createServer(app);
socketUtils.init(httpServer);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
