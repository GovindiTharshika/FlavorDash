const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

router.post('/', authenticate, orderController.placeOrder);
router.get('/', authenticate, orderController.getOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.put('/:id/status', authenticate, authorizeAdmin, orderController.updateOrderStatus);

module.exports = router;
