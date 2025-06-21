const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidationErrors
];

// Category validation rules
const validateCategoryCreate = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('parentId')
    .optional()
    .isUUID()
    .withMessage('Parent ID must be a valid UUID'),
  handleValidationErrors
];

const validateCategoryUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('parentId')
    .optional()
    .isUUID()
    .withMessage('Parent ID must be a valid UUID'),
  handleValidationErrors
];

// Product validation rules
const validateProductCreate = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('sku')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('SKU must be between 3 and 50 characters')
    .matches(/^[A-Za-z0-9-_]+$/)
    .withMessage('SKU can only contain letters, numbers, hyphens, and underscores'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  body('dimensions')
    .optional()
    .isObject()
    .withMessage('Dimensions must be an object'),
  body('options')
    .optional()
    .isObject()
    .withMessage('Options must be an object'),
  body('categoryIds')
    .optional()
    .isArray()
    .withMessage('Category IDs must be an array'),
  body('categoryIds.*')
    .optional()
    .isUUID()
    .withMessage('Each category ID must be a valid UUID'),
  handleValidationErrors
];

const validateProductUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('sku')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('SKU must be between 3 and 50 characters')
    .matches(/^[A-Za-z0-9-_]+$/)
    .withMessage('SKU can only contain letters, numbers, hyphens, and underscores'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  body('dimensions')
    .optional()
    .isObject()
    .withMessage('Dimensions must be an object'),
  body('options')
    .optional()
    .isObject()
    .withMessage('Options must be an object'),
  body('categoryIds')
    .optional()
    .isArray()
    .withMessage('Category IDs must be an array'),
  body('categoryIds.*')
    .optional()
    .isUUID()
    .withMessage('Each category ID must be a valid UUID'),
  handleValidationErrors
];

// Query validation rules
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  handleValidationErrors
];

// UUID parameter validation
const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('ID must be a valid UUID'),
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateCategoryCreate,
  validateCategoryUpdate,
  validateProductCreate,
  validateProductUpdate,
  validatePagination,
  validateUUID,
  handleValidationErrors
}; 