const db = require('../config/db');

exports.placeOrder = async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();
        const { items, subtotal, delivery_fee, tax, discount, total_amount, promo_code, delivery_address, phone, payment_method } = req.body;
        const user_id = req.user.id;

        console.log('placeOrder called by user:', req.user?.id, 'body:', JSON.stringify(req.body, null, 2));

        // Validate items BEFORE inserting anything
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'No items provided for order', error: 'No items provided for order' });
        }
        for (let item of items) {
            if (!item.food_item_id) {
                console.error('Invalid item found:', JSON.stringify(item));
                return res.status(400).json({ message: `Invalid item: missing food_item_id. Got: ${JSON.stringify(item)}`, error: 'Invalid item: missing food_item_id' });
            }
        }

        // Verify all referenced food_item_ids exist in a single query to avoid FK errors
        const itemIds = items.map(i => i.food_item_id);
        const uniqueIds = Array.from(new Set(itemIds));
        if (uniqueIds.length > 0) {
            const placeholders = uniqueIds.map(() => '?').join(',');
            const [existingRows] = await connection.query(
                `SELECT id, name, stock_quantity FROM food_items WHERE id IN (${placeholders})`,
                uniqueIds
            );
            const existingMap = Object.fromEntries(existingRows.map(r => [r.id, r]));
            const missing = uniqueIds.filter(id => !existingMap[id]);
            if (missing.length > 0) {
                try { await connection.rollback(); } catch (rbErr) { console.error('Rollback error:', rbErr); }
                return res.status(400).json({ message: `Invalid food_item_id(s): ${missing.join(',')}`, invalid_ids: missing });
            }
            for (let item of items) {
                const food = existingMap[item.food_item_id];
                if (food && Number(food.stock_quantity) < Number(item.quantity)) {
                    try { await connection.rollback(); } catch (rbErr) { console.error('Rollback error:', rbErr); }
                    return res.status(400).json({
                        message: `Insufficient stock for ${food.name}. Only ${food.stock_quantity} left.`,
                        out_of_stock: food.id
                    });
                }
            }
        }

        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, subtotal, delivery_fee, tax, discount, total_amount, promo_code, delivery_address, phone, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [user_id, subtotal, delivery_fee, tax, discount, total_amount, promo_code, delivery_address || null, phone || null, payment_method || 'PayHere']
        );
        const order_id = orderResult.insertId;

            for (let item of items) {
                if (!item.food_item_id) {
                    throw new Error('Invalid item: missing food_item_id');
                }
                // verify the referenced food_item exists to avoid FK errors
                const [rows] = await connection.query('SELECT id FROM food_items WHERE id = ?', [item.food_item_id]);
                if (!rows || rows.length === 0) {
                    throw new Error(`Invalid food_item_id: ${item.food_item_id}`);
                }
                await connection.query(
                    'INSERT INTO order_items (order_id, food_item_id, name, quantity, price_at_time, special_instructions) VALUES (?, ?, ?, ?, ?, ?)',
                    [order_id, item.food_item_id, item.name, item.quantity, item.price, item.special_instructions || null]
                );
                await connection.query(
                    'UPDATE food_items SET stock_quantity = stock_quantity - ? WHERE id = ?',
                    [item.quantity, item.food_item_id]
                );
            }

        await connection.commit();

        const [orderItems] = await db.query(
            `SELECT oi.*, fi.image_url
             FROM order_items oi
             LEFT JOIN food_items fi ON oi.food_item_id = fi.id
             WHERE oi.order_id = ?`,
            [order_id]
        );

        res.status(201).json({
            message: 'Order placed successfully',
            order_id,
            order: {
                id: order_id,
                user_id,
                subtotal,
                delivery_fee,
                tax,
                discount,
                total_amount,
                promo_code,
                delivery_address: delivery_address || null,
                phone: phone || null,
                payment_method: payment_method || 'PayHere',
                payment_status: 'pending',
                order_status: 'pending',
                items: orderItems
            }
        });
    } catch (err) {
        console.error('Error in placeOrder:', err && err.stack ? err.stack : err);
        try {
            if (connection) await connection.rollback();
        } catch (rbErr) {
            console.error('Rollback error:', rbErr);
        }
        res.status(500).json({ message: err.message || 'Internal Server Error', error: err.message || 'Internal Server Error' });
    } finally {
        try {
            if (connection) connection.release();
        } catch (relErr) {
            console.error('Connection release error:', relErr);
        }
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
        if (!orders.length) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = orders[0];
        if (req.user.role !== 'admin' && Number(order.user_id) !== Number(req.user.id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [items] = await db.query(
            `SELECT oi.*, fi.image_url
             FROM order_items oi
             LEFT JOIN food_items fi ON oi.food_item_id = fi.id
             WHERE oi.order_id = ?`,
            [id]
        );
        order.items = items;

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        let query = `
            SELECT o.*, u.name AS customer_name, u.email AS customer_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `;
        let params = [];
        if (req.user.role !== 'admin') {
            query = `
                SELECT o.*, u.name AS customer_name, u.email AS customer_email
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                WHERE o.user_id = ?
                ORDER BY o.created_at DESC
            `;
            params = [req.user.id];
        }
        
        const [orders] = await db.query(query, params);
        
        // Fetch order items for each order
        for (let order of orders) {
            const [items] = await db.query(
                'SELECT * FROM order_items WHERE order_id = ?',
                [order.id]
            );
            order.items = items;
        }
        
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await db.query('UPDATE orders SET order_status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Order status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
