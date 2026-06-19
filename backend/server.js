const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const foodRoutes = require('./routes/food');
const orderRoutes = require('./routes/orders');
const db = require('./config/db');

const app = express();
// Allow local frontend dev servers (ports 5173+) during development
app.use(cors({
    origin: (origin, cb) => {
        // allow requests with no origin (e.g., curl, server-to-server)
        if (!origin) return cb(null, true);
        try {
            const url = new URL(origin);
            // Allow any localhost / 127.0.0.1 origin for development (any port)
            if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return cb(null, true);
        } catch (e) {
            // ignore
        }
        cb(null, false);
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // needed for PayHere notify (form-encoded)

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', require('./routes/users'));

// ─── Serve Uploaded Files ───────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Image Upload Endpoint ──────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }
    const imageUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
    res.json({ imageUrl });
});

// ─── PayHere: Generate payment hash for frontend checkout ───────────────────
// POST /api/payment/hash
// Body: { order_id, amount, currency }
app.post('/api/payment/hash', (req, res) => {
    const { order_id, amount, currency = 'LKR' } = req.body;
    const merchant_id = process.env.PAYHERE_MERCHANT_ID;
    const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET;

    if (!merchant_id || !merchant_secret) {
        return res.status(500).json({
            message: 'PayHere is not configured. Set PAYHERE_MERCHANT_ID and PAYHERE_MERCHANT_SECRET in backend/.env (Merchant Secret is under PayHere Dashboard → Integrations, not the API App Secret).'
        });
    }

    // Hash = MD5(merchant_id + order_id + amount_formatted + currency + MD5(merchant_secret).toUpperCase())
    const secretHash = crypto.createHash('md5').update(merchant_secret).digest('hex').toUpperCase();
    const amountFormatted = parseFloat(amount).toFixed(2);
    const orderId = String(order_id);
    const rawString = `${merchant_id}${orderId}${amountFormatted}${currency}${secretHash}`;
    const hash = crypto.createHash('md5').update(rawString).digest('hex').toUpperCase();

    res.json({
        hash,
        merchant_id,
        sandbox: process.env.PAYHERE_SANDBOX !== 'false'
    });
});

// ─── PayHere: Payment notification webhook ──────────────────────────────────
// POST /api/payment/notify  (called by PayHere servers)
app.post('/api/payment/notify', async (req, res) => {
    try {
        const {
            merchant_id, order_id, payhere_amount,
            payhere_currency, status_code, md5sig
        } = req.body;

        const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET;
        const secretHash = crypto.createHash('md5').update(merchant_secret).digest('hex').toUpperCase();
        const localSig = crypto.createHash('md5')
            .update(`${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${secretHash}`)
            .digest('hex').toUpperCase();

        if (localSig !== md5sig) {
            console.warn('PayHere notify: signature mismatch');
            return res.status(400).send('Invalid signature');
        }

        // status_code 2 = success, -1 = cancelled, -2 = failed, -3 = chargedback
        const paymentStatus = status_code === '2' ? 'paid' : 'failed';
        await db.query('UPDATE orders SET payment_status = ? WHERE id = ?', [paymentStatus, order_id]);

        console.log(`Order ${order_id} payment: ${paymentStatus}`);
        res.status(200).send('OK');
    } catch (err) {
        console.error('PayHere notify error:', err.message);
        res.status(500).send('Error');
    }
});

const PORT = process.env.PORT || 5000;
// Global error handlers to surface crashes in logs
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION - server will exit:', err && err.stack ? err.stack : err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

process.on('SIGINT', () => {
    console.log('SIGINT received - shutting down gracefully');
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
