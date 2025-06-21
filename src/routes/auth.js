const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate
} = require('../middleware/validation');

// Public routes
router.post('/register', validateUserRegistration, authController.register);
router.post('/login', validateUserLogin, authController.login);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validateUserUpdate, authController.updateProfile);
router.post('/change-password', authenticateToken, authController.changePassword);
router.post('/refresh-token', authenticateToken, authController.refreshToken);

module.exports = router; 