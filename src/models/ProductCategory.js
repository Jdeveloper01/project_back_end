const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const ProductCategory = sequelize.define('ProductCategory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  }
}, {
  tableName: 'product_categories',
  indexes: [
    {
      unique: true,
      fields: ['productId', 'categoryId']
    }
  ]
});

module.exports = ProductCategory; 