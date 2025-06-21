const { User } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

// Get all users with pagination and search
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] }
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      data: {
        users,
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

// Get user by ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new user (admin only)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });

    res.status(201).json({
      message: 'User created successfully',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user (admin only)
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new AppError('Email already registered', 409);
      }
    }

    // Update user
    await user.update({
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role }),
      ...(typeof isActive === 'boolean' && { isActive })
    });

    res.json({
      message: 'User updated successfully',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (admin only)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      throw new AppError('Cannot delete your own account', 400);
    }

    await user.destroy();

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Toggle user active status (admin only)
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent admin from deactivating themselves
    if (id === req.user.id) {
      throw new AppError('Cannot deactivate your own account', 400);
    }

    await user.update({ isActive: !user.isActive });

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user statistics (admin only)
const getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const inactiveUsers = await User.count({ where: { isActive: false } });
    const adminUsers = await User.count({ where: { role: 'admin' } });
    const regularUsers = await User.count({ where: { role: 'user' } });

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await User.count({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    res.json({
      data: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        admins: adminUsers,
        regular: regularUsers,
        recentRegistrations
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats
}; 