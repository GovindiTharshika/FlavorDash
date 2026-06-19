require('dotenv').config();
const db = require('../config/db');

const alters = [
    'ALTER TABLE users ADD COLUMN phone VARCHAR(30) NULL',
    'ALTER TABLE users ADD COLUMN address VARCHAR(500) NULL',
    'ALTER TABLE users ADD COLUMN city VARCHAR(100) NULL',
    'ALTER TABLE food_items ADD COLUMN stock_quantity INT NOT NULL DEFAULT 50',
    'ALTER TABLE food_items ADD COLUMN low_stock_threshold INT NOT NULL DEFAULT 10',
];

(async () => {
    for (const q of alters) {
        try {
            await db.query(q);
            console.log('OK:', q);
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('Already exists:', q);
            } else {
                console.error('Error:', e.message);
            }
        }
    }
    await db.query('UPDATE food_items SET stock_quantity = 50 WHERE stock_quantity IS NULL OR stock_quantity = 0');
    await db.query('UPDATE food_items SET low_stock_threshold = 10 WHERE low_stock_threshold IS NULL');
    console.log('Migration complete');
    process.exit(0);
})();
