const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

router.get('/me', authenticate, userController.getProfile);
router.put('/me', authenticate, userController.updateProfile);
router.get('/', authenticate, authorizeAdmin, userController.getAllUsers);
router.put('/:id/role', authenticate, authorizeAdmin, userController.updateUserRole);
router.delete('/:id', authenticate, authorizeAdmin, userController.deleteUser);

module.exports = router;
