const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  validateUserUpdate,
  validatePagination,
  validateUUID
} = require('../middleware/validation');

// All routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// Get all users with pagination and search
router.get('/', validatePagination, userController.getAllUsers);

// Get user statistics
router.get('/stats', userController.getUserStats);

// Get user by ID
router.get('/:id', validateUUID, userController.getUserById);

// Create new user
router.post('/', validateUserUpdate, userController.createUser);

// Update user
router.put('/:id', validateUUID, validateUserUpdate, userController.updateUser);

// Delete user
router.delete('/:id', validateUUID, userController.deleteUser);

// Toggle user status
router.patch('/:id/toggle-status', validateUUID, userController.toggleUserStatus);

module.exports = router; 