const db = require('../config/db');

exports.getProfile = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, name, email, phone, address, city, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (!users.length) return res.status(404).json({ message: 'User not found' });
        res.json(users[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, address, city } = req.body;
        await db.query(
            'UPDATE users SET name = ?, phone = ?, address = ?, city = ? WHERE id = ?',
            [name, phone || null, address || null, city || null, req.user.id]
        );
        const [users] = await db.query(
            'SELECT id, name, email, phone, address, city, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        res.json(users[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT u.id, u.name, u.email, u.phone, u.address, u.city, u.role, u.created_at,
                   COUNT(o.id) AS order_count,
                   COALESCE(SUM(o.total_amount), 0) AS total_spent
            FROM users u
            LEFT JOIN orders o ON o.user_id = u.id
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!['customer', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        if (Number(id) === Number(req.user.id) && role !== 'admin') {
            return res.status(400).json({ message: 'You cannot remove your own admin access' });
        }
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({ message: 'Role updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (Number(id) === Number(req.user.id)) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
