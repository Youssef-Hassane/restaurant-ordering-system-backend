-- =============================================
-- SEED DATA
-- =============================================

-- Clear existing data
DELETE FROM refresh_tokens;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM users;

-- Reset order number sequence
ALTER SEQUENCE order_number_seq RESTART WITH 1001;

-- =============================================
-- INSERT DEFAULT USERS
-- Password: "admin123" (hashed with bcrypt)
-- =============================================
INSERT INTO users (id, email, password_hash, name, role, is_active) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'admin@restaurant.com',
  '$2b$10$rQZ5Z5Z5Z5Z5Z5Z5Z5Z5ZOK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K',
  'Admin User',
  'admin',
  true
),
(
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'cashier@restaurant.com',
  '$2b$10$rQZ5Z5Z5Z5Z5Z5Z5Z5Z5ZOK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K',
  'Ahmed Cashier',
  'cashier',
  true
);

-- =============================================
-- INSERT PRODUCTS (with created_by)
-- =============================================
INSERT INTO products (name, description, price, currency, image_url, category, available, created_by) VALUES
('Spring Rolls', 'Crispy vegetable spring rolls served with sweet chili sauce', 89.00, 'EGP', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', 'Appetizers', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('Garlic Bread', 'Toasted artisan bread with garlic butter and fresh herbs', 59.00, 'EGP', 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400', 'Appetizers', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('Grilled Salmon', 'Fresh Atlantic salmon with lemon butter sauce and seasonal vegetables', 349.00, 'EGP', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', 'Main Courses', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('Beef Burger', 'Premium Angus beef patty with cheese, lettuce, tomato, and special sauce', 189.00, 'EGP', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 'Main Courses', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('Margherita Pizza', 'Classic Italian pizza with San Marzano tomatoes, fresh mozzarella, and basil', 169.00, 'EGP', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', 'Main Courses', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('Chicken Alfredo', 'Creamy fettuccine pasta with tender grilled chicken breast', 219.00, 'EGP', 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400', 'Main Courses', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('Chocolate Cake', 'Rich three-layer chocolate cake with dark chocolate ganache', 99.00, 'EGP', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', 'Desserts', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('Fresh Lemonade', 'House-made lemonade with fresh mint leaves', 49.00, 'EGP', 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400', 'Beverages', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');