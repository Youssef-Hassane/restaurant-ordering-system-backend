-- =============================================
-- RESTAURANT ORDERING DATABASE SCHEMA
-- With Authentication & Order Numbers
-- Default Currency: EGP (Egyptian Pound)
-- =============================================

-- =============================================
-- USERS TABLE (Cashiers/Staff)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'cashier' NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ORDER NUMBER SEQUENCE
-- =============================================
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001;

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EGP' NOT NULL,
  image_url TEXT,
  category VARCHAR(100) NOT NULL,
  available BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number INTEGER UNIQUE DEFAULT nextval('order_number_seq'),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  total_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EGP' NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ORDER ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EGP' NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- REFRESH TOKENS TABLE (for JWT)
-- =============================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(available);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON products(created_by);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON orders(created_by);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- =============================================
-- CONSTRAINTS
-- =============================================
ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_user_role;
ALTER TABLE users ADD CONSTRAINT valid_user_role 
  CHECK (role IN ('admin', 'manager', 'cashier'));

ALTER TABLE products DROP CONSTRAINT IF EXISTS valid_currency_products;
ALTER TABLE products ADD CONSTRAINT valid_currency_products 
  CHECK (currency IN ('USD', 'EUR', 'GBP', 'EGP', 'SAR', 'AED', 'JPY', 'CAD', 'AUD'));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS valid_currency_orders;
ALTER TABLE orders ADD CONSTRAINT valid_currency_orders 
  CHECK (currency IN ('USD', 'EUR', 'GBP', 'EGP', 'SAR', 'AED', 'JPY', 'CAD', 'AUD'));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS valid_order_status;
ALTER TABLE orders ADD CONSTRAINT valid_order_status 
  CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'));

ALTER TABLE products DROP CONSTRAINT IF EXISTS positive_price_products;
ALTER TABLE products ADD CONSTRAINT positive_price_products CHECK (price >= 0);

ALTER TABLE orders DROP CONSTRAINT IF EXISTS positive_total_orders;
ALTER TABLE orders ADD CONSTRAINT positive_total_orders CHECK (total_amount >= 0);

ALTER TABLE order_items DROP CONSTRAINT IF EXISTS positive_quantity;
ALTER TABLE order_items ADD CONSTRAINT positive_quantity CHECK (quantity > 0);