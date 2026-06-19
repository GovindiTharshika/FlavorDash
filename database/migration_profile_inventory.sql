USE foodorderinsys;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone VARCHAR(30) NULL AFTER email,
    ADD COLUMN IF NOT EXISTS address VARCHAR(500) NULL AFTER phone,
    ADD COLUMN IF NOT EXISTS city VARCHAR(100) NULL AFTER address;

ALTER TABLE food_items
    ADD COLUMN IF NOT EXISTS stock_quantity INT NOT NULL DEFAULT 50 AFTER category,
    ADD COLUMN IF NOT EXISTS low_stock_threshold INT NOT NULL DEFAULT 10 AFTER stock_quantity;

UPDATE food_items SET stock_quantity = 50 WHERE stock_quantity IS NULL OR stock_quantity = 0;
UPDATE food_items SET low_stock_threshold = 10 WHERE low_stock_threshold IS NULL;
