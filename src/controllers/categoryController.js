const { Category, Product } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

// Get all categories with pagination and search
const getAllCategories = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const includeInactive = req.query.includeInactive === 'true';
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (!includeInactive) {
      whereClause.isActive = true;
    }

    const { count, rows: categories } = await Category.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Category,
          as: 'children',
          attributes: ['id', 'name', 'slug', 'isActive']
        }
      ],
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      data: {
        categories,
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

// Get category by ID
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Category,
          as: 'children',
          attributes: ['id', 'name', 'slug', 'isActive']
        },
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'name', 'price', 'stock', 'isActive'],
          through: { attributes: [] }
        }
      ]
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    res.json({
      data: {
        category
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get category by slug
const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({
      where: { slug },
      include: [
        {
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Category,
          as: 'children',
          attributes: ['id', 'name', 'slug', 'isActive']
        },
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'name', 'price', 'stock', 'isActive', 'images'],
          through: { attributes: [] },
          where: { isActive: true }
        }
      ]
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    res.json({
      data: {
        category
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new category
const createCategory = async (req, res, next) => {
  try {
    const { name, description, parentId } = req.body;

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      throw new AppError('Category with this name already exists', 409);
    }

    // Validate parent category if provided
    if (parentId) {
      const parentCategory = await Category.findByPk(parentId);
      if (!parentCategory) {
        throw new AppError('Parent category not found', 404);
      }
    }

    // Create category
    const category = await Category.create({
      name,
      description,
      parentId
    });

    res.status(201).json({
      message: 'Category created successfully',
      data: {
        category
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update category
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, parentId, isActive } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Check if name is being changed and if it's already taken
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ where: { name } });
      if (existingCategory) {
        throw new AppError('Category with this name already exists', 409);
      }
    }

    // Validate parent category if provided
    if (parentId) {
      if (parentId === id) {
        throw new AppError('Category cannot be its own parent', 400);
      }
      
      const parentCategory = await Category.findByPk(parentId);
      if (!parentCategory) {
        throw new AppError('Parent category not found', 404);
      }
    }

    // Update category
    await category.update({
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(parentId !== undefined && { parentId }),
      ...(typeof isActive === 'boolean' && { isActive })
    });

    res.json({
      message: 'Category updated successfully',
      data: {
        category
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete category
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'children'
        },
        {
          model: Product,
          as: 'products'
        }
      ]
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Check if category has children
    if (category.children && category.children.length > 0) {
      throw new AppError('Cannot delete category with subcategories', 400);
    }

    // Check if category has products
    if (category.products && category.products.length > 0) {
      throw new AppError('Cannot delete category with associated products', 400);
    }

    await category.destroy();

    res.json({
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get category tree (hierarchical structure)
const getCategoryTree = async (req, res, next) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';

    const whereClause = {};
    if (!includeInactive) {
      whereClause.isActive = true;
    }

    const categories = await Category.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'children',
          attributes: ['id', 'name', 'slug', 'isActive'],
          where: includeInactive ? {} : { isActive: true }
        }
      ],
      where: {
        parentId: null // Only root categories
      },
      order: [['name', 'ASC']]
    });

    res.json({
      data: {
        categories
      }
    });
  } catch (error) {
    next(error);
  }
};

// Toggle category active status
const toggleCategoryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    await category.update({ isActive: !category.isActive });

    res.json({
      message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        category
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  toggleCategoryStatus
}; 