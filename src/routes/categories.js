const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  validateCategoryCreate,
  validateCategoryUpdate,
  validatePagination,
  validateUUID
} = require('../middleware/validation');

// Public routes (no authentication required)
router.get('/', validatePagination, categoryController.getAllCategories);
router.get('/tree', categoryController.getCategoryTree);
router.get('/slug/:slug', categoryController.getCategoryBySlug);
router.get('/:id', validateUUID, categoryController.getCategoryById);

// Protected routes (require authentication and admin role)
router.use(authenticateToken, requireAdmin);

// Create new category
router.post('/', validateCategoryCreate, categoryController.createCategory);

// Update category
router.put('/:id', validateUUID, validateCategoryUpdate, categoryController.updateCategory);

// Delete category
router.delete('/:id', validateUUID, categoryController.deleteCategory);

// Toggle category status
router.patch('/:id/toggle-status', validateUUID, categoryController.toggleCategoryStatus);

module.exports = router; 