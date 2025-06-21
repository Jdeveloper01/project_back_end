const { Product, Category, ProductCategory } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Get all products with pagination, search, and filters
const getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const categoryId = req.query.categoryId;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    const isActive = req.query.isActive;
    const isFeatured = req.query.isFeatured;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'DESC';
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } }
      ];
    }

    // Price filters
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
    }

    // Status filters
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }
    if (isFeatured !== undefined) {
      whereClause.isFeatured = isFeatured === 'true';
    }

    // Category filter
    const includeClause = [
      {
        model: Category,
        as: 'categories',
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] }
      }
    ];

    if (categoryId) {
      includeClause[0].where = { id: categoryId };
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit,
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      data: {
        products,
        pagination: {
          page,
          limit,
          total: count,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get product by ID
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'categories',
          attributes: ['id', 'name', 'slug'],
          through: { attributes: [] }
        }
      ]
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get product by slug
const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({
      where: { slug, isActive: true },
      include: [
        {
          model: Category,
          as: 'categories',
          attributes: ['id', 'name', 'slug'],
          through: { attributes: [] }
        }
      ]
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new product
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      sku,
      stock,
      weight,
      dimensions,
      options,
      categoryIds,
      isFeatured,
      metaTitle,
      metaDescription
    } = req.body;

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ where: { sku } });
    if (existingProduct) {
      throw new AppError('Product with this SKU already exists', 409);
    }

    // Handle uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push(`/uploads/${file.filename}`);
      });
    }

    // Create product
    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      sku,
      stock: parseInt(stock) || 0,
      weight: weight ? parseFloat(weight) : null,
      dimensions: dimensions ? JSON.parse(dimensions) : null,
      options: options ? JSON.parse(options) : {},
      images,
      isFeatured: isFeatured === 'true',
      metaTitle,
      metaDescription
    });

    // Associate with categories
    if (categoryIds && categoryIds.length > 0) {
      const categoryIdArray = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
      await product.setCategories(categoryIdArray);
    }

    // Fetch product with categories
    const productWithCategories = await Product.findByPk(product.id, {
      include: [
        {
          model: Category,
          as: 'categories',
          attributes: ['id', 'name', 'slug'],
          through: { attributes: [] }
        }
      ]
    });

    res.status(201).json({
      message: 'Product created successfully',
      data: {
        product: productWithCategories
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update product
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      sku,
      stock,
      weight,
      dimensions,
      options,
      categoryIds,
      isFeatured,
      metaTitle,
      metaDescription
    } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Check if SKU is being changed and if it's already taken
    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({ where: { sku } });
      if (existingProduct) {
        throw new AppError('Product with this SKU already exists', 409);
      }
    }

    // Handle uploaded images
    let images = product.images || [];
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      images = [...images, ...newImages];
    }

    // Update product
    await product.update({
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(price && { price: parseFloat(price) }),
      ...(sku && { sku }),
      ...(stock !== undefined && { stock: parseInt(stock) }),
      ...(weight !== undefined && { weight: weight ? parseFloat(weight) : null }),
      ...(dimensions && { dimensions: JSON.parse(dimensions) }),
      ...(options && { options: JSON.parse(options) }),
      ...(images.length > 0 && { images }),
      ...(isFeatured !== undefined && { isFeatured: isFeatured === 'true' }),
      ...(metaTitle && { metaTitle }),
      ...(metaDescription && { metaDescription })
    });

    // Update category associations
    if (categoryIds !== undefined) {
      const categoryIdArray = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
      await product.setCategories(categoryIdArray);
    }

    // Fetch updated product with categories
    const updatedProduct = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'categories',
          attributes: ['id', 'name', 'slug'],
          through: { attributes: [] }
        }
      ]
    });

    res.json({
      message: 'Product updated successfully',
      data: {
        product: updatedProduct
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete product
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Delete associated images
    if (product.images && product.images.length > 0) {
      product.images.forEach(imagePath => {
        const fullPath = path.join(process.cwd(), imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    await product.destroy();

    res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Upload product images
const uploadProductImages = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (!req.files || req.files.length === 0) {
      throw new AppError('No images uploaded', 400);
    }

    // Add new images to existing ones
    const newImages = req.files.map(file => `/uploads/${file.filename}`);
    const updatedImages = [...(product.images || []), ...newImages];

    await product.update({ images: updatedImages });

    res.json({
      message: 'Images uploaded successfully',
      data: {
        images: updatedImages
      }
    });
  } catch (error) {
    next(error);
  }
};

// Remove product image
const removeProductImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imageIndex } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (!product.images || !Array.isArray(product.images)) {
      throw new AppError('No images found', 400);
    }

    if (imageIndex < 0 || imageIndex >= product.images.length) {
      throw new AppError('Invalid image index', 400);
    }

    // Remove image file
    const imagePath = product.images[imageIndex];
    const fullPath = path.join(process.cwd(), imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Remove from array
    const updatedImages = product.images.filter((_, index) => index !== parseInt(imageIndex));
    await product.update({ images: updatedImages });

    res.json({
      message: 'Image removed successfully',
      data: {
        images: updatedImages
      }
    });
  } catch (error) {
    next(error);
  }
};

// Toggle product active status
const toggleProductStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    await product.update({ isActive: !product.isActive });

    res.json({
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

// Toggle product featured status
const toggleProductFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    await product.update({ isFeatured: !product.isFeatured });

    res.json({
      message: `Product ${product.isFeatured ? 'marked as featured' : 'unmarked as featured'} successfully`,
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get featured products
const getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const products = await Product.findAll({
      where: {
        isActive: true,
        isFeatured: true
      },
      include: [
        {
          model: Category,
          as: 'categories',
          attributes: ['id', 'name', 'slug'],
          through: { attributes: [] }
        }
      ],
      limit,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      data: {
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  removeProductImage,
  toggleProductStatus,
  toggleProductFeatured,
  getFeaturedProducts
}; 