const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

router.get('/', foodController.getAllFood);
router.post('/', authenticate, authorizeAdmin, foodController.addFood);
router.put('/:id', authenticate, authorizeAdmin, foodController.updateFood);
router.patch('/:id/stock', authenticate, authorizeAdmin, foodController.updateStock);
router.delete('/:id', authenticate, authorizeAdmin, foodController.deleteFood);

module.exports = router;
