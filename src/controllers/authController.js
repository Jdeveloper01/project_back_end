const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AppError } = require('../middleware/errorHandler');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Register new user
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    res.json({
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user.id;

    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new AppError('Email already registered', 409);
      }
    }

    // Update user
    const user = await User.findByPk(userId);
    await user.update({
      ...(name && { name }),
      ...(email && { email }),
      ...(password && { password })
    });

    res.json({
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Change password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Update password
    await user.update({ password: newPassword });

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token (optional - for token refresh functionality)
const refreshToken = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Token refreshed successfully',
      data: {
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken
}; 