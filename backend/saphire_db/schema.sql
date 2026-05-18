-- Database Schema for Moonstone Café Multicuisine
CREATE DATABASE IF NOT EXISTS moonstone_cafe;
USE moonstone_cafe;

-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    image_url VARCHAR(500),
    sort_order INT DEFAULT 0
);

-- 3. Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
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
);

-- 4. Messages Table (Contact Form)
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    guests INT NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Data Seeding (Optional)
INSERT IGNORE INTO admin_users (username, password_hash) 
VALUES ('admin', '$2b$10$YourHashedPasswordHere'); -- Password needs to be hashed manually or via registration script

INSERT IGNORE INTO categories (name, slug, sort_order) VALUES 
('Biryani', 'biryani', 1),
('Tandoori (BBQ)', 'tandoori', 2),
('Shawarma', 'shawarma', 3),
('Pizza', 'pizza', 4),
('Chinese Rice & Noodles', 'chinese', 5),
('Burgers', 'burgers', 6),
('Desserts', 'desserts', 7),
('Milkshakes & Beverages', 'beverages', 8);

-- 6. Restaurant Info Table
CREATE TABLE IF NOT EXISTS restaurant_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) DEFAULT 'Moonstone Café',
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    opening_hours TEXT,
    cuisine_type VARCHAR(255),
    extra_info TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Initial Restaurant Info
INSERT IGNORE INTO restaurant_info (id, name, address, phone, email, opening_hours, cuisine_type) 
VALUES (1, 'Moonstone Café', '123 Luxury Lane, Food City', '+91 98765 43210', 'info@moonstonecafe.com', 'Mon-Sun: 11:00 AM - 11:00 PM', 'Multicuisine (Biryani, Tandoori, Chinese, Continental)');

