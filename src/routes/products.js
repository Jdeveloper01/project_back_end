const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadMultipleImages } = require('../middleware/upload');
const {
  validateProductCreate,
  validateProductUpdate,
  validatePagination,
  validateUUID
} = require('../middleware/validation');

// Public routes (no authentication required)
router.get('/', validatePagination, productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', validateUUID, productController.getProductById);

// Protected routes (require authentication and admin role)
router.use(authenticateToken, requireAdmin);

// Create new product with image upload
router.post('/', uploadMultipleImages, validateProductCreate, productController.createProduct);

// Update product
router.put('/:id', validateUUID, validateProductUpdate, productController.updateProduct);

// Delete product
router.delete('/:id', validateUUID, productController.deleteProduct);

// Upload product images
router.post('/:id/images', validateUUID, uploadMultipleImages, productController.uploadProductImages);

// Remove product image
router.delete('/:id/images', validateUUID, productController.removeProductImage);

// Toggle product status
router.patch('/:id/toggle-status', validateUUID, productController.toggleProductStatus);

// Toggle product featured status
router.patch('/:id/toggle-featured', validateUUID, productController.toggleProductFeatured);

module.exports = router; 