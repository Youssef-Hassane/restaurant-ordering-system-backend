-- =============================================
-- MIGRATION: Add currency column to existing tables
-- =============================================

-- Add currency column to products (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'currency'
  ) THEN
    ALTER TABLE products ADD COLUMN currency VARCHAR(3) DEFAULT 'EGP' NOT NULL;
  END IF;
END $$;

-- Add currency column to orders (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'currency'
  ) THEN
    ALTER TABLE orders ADD COLUMN currency VARCHAR(3) DEFAULT 'EGP' NOT NULL;
  END IF;
END $$;

-- Add currency column to order_items (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'currency'
  ) THEN
    ALTER TABLE order_items ADD COLUMN currency VARCHAR(3) DEFAULT 'EGP' NOT NULL;
  END IF;
END $$;

-- Update existing products to EGP with new prices
UPDATE products SET 
  currency = 'EGP',
  price = CASE name
    WHEN 'Spring Rolls' THEN 89.00
    WHEN 'Garlic Bread' THEN 59.00
    WHEN 'Grilled Salmon' THEN 349.00
    WHEN 'Beef Burger' THEN 189.00
    WHEN 'Margherita Pizza' THEN 169.00
    WHEN 'Chicken Alfredo' THEN 219.00
    WHEN 'Chocolate Cake' THEN 99.00
    WHEN 'Fresh Lemonade' THEN 49.00
    ELSE price * 50  -- Rough USD to EGP conversion for any other products
  END
WHERE currency IS NULL OR currency = 'USD';

-- Update existing orders to EGP
UPDATE orders SET currency = 'EGP' WHERE currency IS NULL;

-- Update existing order_items to EGP
UPDATE order_items SET currency = 'EGP' WHERE currency IS NULL;

-- Add indexes for currency columns
CREATE INDEX IF NOT EXISTS idx_products_currency ON products(currency);
CREATE INDEX IF NOT EXISTS idx_orders_currency ON orders(currency);