const db = require('../config/db');

exports.getAllFood = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM food_items ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addFood = async (req, res) => {
    try {
        const { name, description, price, image_url, category, stock_quantity, low_stock_threshold } = req.body;
        const stock = stock_quantity ?? 50;
        const threshold = low_stock_threshold ?? 10;
        const [result] = await db.query(
            'INSERT INTO food_items (name, description, price, image_url, category, stock_quantity, low_stock_threshold) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, description, price, image_url, category, stock, threshold]
        );
        res.status(201).json({
            id: result.insertId,
            name,
            description,
            price,
            image_url,
            category,
            stock_quantity: stock,
            low_stock_threshold: threshold
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateFood = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, image_url, category, stock_quantity, low_stock_threshold } = req.body;
        await db.query(
            'UPDATE food_items SET name=?, description=?, price=?, image_url=?, category=?, stock_quantity=?, low_stock_threshold=? WHERE id=?',
            [name, description, price, image_url, category, stock_quantity, low_stock_threshold, id]
        );
        res.json({ message: 'Food item updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock_quantity, low_stock_threshold } = req.body;
        await db.query(
            'UPDATE food_items SET stock_quantity = ?, low_stock_threshold = ? WHERE id = ?',
            [stock_quantity, low_stock_threshold, id]
        );
        const [rows] = await db.query('SELECT * FROM food_items WHERE id = ?', [id]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteFood = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM food_items WHERE id=?', [id]);
        res.json({ message: 'Food item deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
