const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const ProductCategory = require('./ProductCategory');

// User associations (if needed for future features)
// User.hasMany(Product, { as: 'createdProducts', foreignKey: 'createdBy' });

// Category associations
Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

// Product associations
Product.belongsToMany(Category, { 
  through: ProductCategory, 
  as: 'categories',
  foreignKey: 'productId',
  otherKey: 'categoryId'
});

Category.belongsToMany(Product, { 
  through: ProductCategory, 
  as: 'products',
  foreignKey: 'categoryId',
  otherKey: 'productId'
});

module.exports = {
  User,
  Category,
  Product,
  ProductCategory
}; 