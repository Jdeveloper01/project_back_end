const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 100]
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    }
  }
}, {
  tableName: 'categories',
  hooks: {
    beforeCreate: (category) => {
      if (!category.slug) {
        category.slug = category.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
    },
    beforeUpdate: (category) => {
      if (category.changed('name') && !category.changed('slug')) {
        category.slug = category.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
    }
  }
});

module.exports = Category; 