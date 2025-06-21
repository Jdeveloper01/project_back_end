const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 10 // Maximum 10 files
  }
});

// Single file upload
const uploadSingle = upload.single('image');

// Multiple files upload
const uploadMultiple = upload.array('images', 10);

// Wrapper for single file upload with error handling
const uploadSingleImage = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File too large',
          details: {
            maxSize: process.env.MAX_FILE_SIZE || '5MB'
          }
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          error: 'Too many files',
          details: {
            maxFiles: 10
          }
        });
      }
      return res.status(400).json({
        error: 'File upload error',
        details: err.message
      });
    } else if (err) {
      return res.status(400).json({
        error: 'File upload error',
        details: err.message
      });
    }
    next();
  });
};

// Wrapper for multiple files upload with error handling
const uploadMultipleImages = (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File too large',
          details: {
            maxSize: process.env.MAX_FILE_SIZE || '5MB'
          }
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          error: 'Too many files',
          details: {
            maxFiles: 10
          }
        });
      }
      return res.status(400).json({
        error: 'File upload error',
        details: err.message
      });
    } else if (err) {
      return res.status(400).json({
        error: 'File upload error',
        details: err.message
      });
    }
    next();
  });
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  upload
}; 