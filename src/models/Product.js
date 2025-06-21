const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [2, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50]
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  options: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Product options like size, color, etc.'
  },
  slug: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 200]
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  weight: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  dimensions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Product dimensions: {length, width, height}'
  },
  metaTitle: {
    type: DataTypes.STRING(60),
    allowNull: true
  },
  metaDescription: {
    type: DataTypes.STRING(160),
    allowNull: true
  }
}, {
  tableName: 'products',
  hooks: {
    beforeCreate: (product) => {
      if (!product.slug) {
        product.slug = product.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
    },
    beforeUpdate: (product) => {
      if (product.changed('name') && !product.changed('slug')) {
        product.slug = product.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
    }
  }
});

module.exports = Product; 