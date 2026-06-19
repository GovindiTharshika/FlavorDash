-- schema.sql

CREATE DATABASE IF NOT EXISTS foodorderinsys;
USE foodorderinsys;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30),
    address VARCHAR(500),
    city VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS food_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    category VARCHAR(100),
    stock_quantity INT NOT NULL DEFAULT 50,
    low_stock_threshold INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 4.99,
    tax DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    promo_code VARCHAR(50),
    order_status ENUM('pending', 'preparing', 'completed') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    food_item_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price_at_time DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE
);

-- Insert dummy admin
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin User', 'admin@flavordash.com', '$2a$10$w8T0Q5u7VzM/p9z6lS7BqOc3Q.7Qv3X1pM6w3wM6w3wM6w3wM6w3w', 'admin') -- 'password123'
ON DUPLICATE KEY UPDATE id=id;

-- Insert some dummy food items
INSERT INTO food_items (name, description, price, image_url, category) VALUES
('Classic Burger', 'Beef patty, lettuce, tomato, cheese', 8.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800', 'Burgers'),
('Margherita Pizza', 'Tomato sauce, mozzarella, basil', 12.50, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=800', 'Pizza'),
('Caesar Salad', 'Romaine lettuce, croutons, parmesan', 7.00, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=800', 'Salads')
ON DUPLICATE KEY UPDATE id=id;
