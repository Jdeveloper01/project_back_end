const request = require('supertest');
const app = require('../src/server');
const { User, Product, Category } = require('../src/models');
const { sequelize } = require('../src/database/connection');
const path = require('path');

describe('Product Endpoints', () => {
  let adminUser;
  let adminToken;
  let testCategory;
  let testProduct;

  beforeAll(async () => {
    // Sync database for testing
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear tables before each test
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'AdminPass123',
      role: 'admin'
    });

    // Get admin token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'AdminPass123'
      });

    adminToken = loginResponse.body.data.token;

    // Create test category
    testCategory = await Category.create({
      name: 'Test Category',
      description: 'Test category description',
      slug: 'test-category'
    });
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {
      // Create test products
      testProduct = await Product.create({
        name: 'Test Product',
        description: 'Test product description',
        price: 99.99,
        sku: 'TEST-001',
        stock: 10,
        slug: 'test-product'
      });

      await testProduct.setCategories([testCategory.id]);
    });

    it('should get all products with pagination', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.pagination).toHaveProperty('page');
      expect(response.body.data.pagination).toHaveProperty('total');
      expect(response.body.data.products[0].name).toBe('Test Product');
    });

    it('should filter products by search term', async () => {
      const response = await request(app)
        .get('/api/products?search=Test')
        .expect(200);

      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].name).toBe('Test Product');
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get(`/api/products?categoryId=${testCategory.id}`)
        .expect(200);

      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].categories).toHaveLength(1);
      expect(response.body.data.products[0].categories[0].id).toBe(testCategory.id);
    });

    it('should filter products by price range', async () => {
      const response = await request(app)
        .get('/api/products?minPrice=50&maxPrice=150')
        .expect(200);

      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].price).toBe(99.99);
    });
  });

  describe('GET /api/products/featured', () => {
    beforeEach(async () => {
      // Create featured product
      testProduct = await Product.create({
        name: 'Featured Product',
        description: 'Featured product description',
        price: 199.99,
        sku: 'FEAT-001',
        stock: 5,
        isFeatured: true,
        slug: 'featured-product'
      });
    });

    it('should get featured products', async () => {
      const response = await request(app)
        .get('/api/products/featured')
        .expect(200);

      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].isFeatured).toBe(true);
    });
  });

  describe('GET /api/products/:id', () => {
    beforeEach(async () => {
      testProduct = await Product.create({
        name: 'Test Product',
        description: 'Test product description',
        price: 99.99,
        sku: 'TEST-001',
        stock: 10,
        slug: 'test-product'
      });
    });

    it('should get product by ID', async () => {
      const response = await request(app)
        .get(`/api/products/${testProduct.id}`)
        .expect(200);

      expect(response.body.data.product.id).toBe(testProduct.id);
      expect(response.body.data.product.name).toBe('Test Product');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      const response = await request(app)
        .get(`/api/products/${fakeId}`)
        .expect(404);

      expect(response.body.error).toBe('Product not found');
    });
  });

  describe('GET /api/products/slug/:slug', () => {
    beforeEach(async () => {
      testProduct = await Product.create({
        name: 'Test Product',
        description: 'Test product description',
        price: 99.99,
        sku: 'TEST-001',
        stock: 10,
        slug: 'test-product',
        isActive: true
      });
    });

    it('should get product by slug', async () => {
      const response = await request(app)
        .get('/api/products/slug/test-product')
        .expect(200);

      expect(response.body.data.product.slug).toBe('test-product');
      expect(response.body.data.product.name).toBe('Test Product');
    });

    it('should return 404 for non-existent slug', async () => {
      const response = await request(app)
        .get('/api/products/slug/non-existent')
        .expect(404);

      expect(response.body.error).toBe('Product not found');
    });
  });

  describe('POST /api/products', () => {
    it('should create product successfully', async () => {
      const productData = {
        name: 'New Product',
        description: 'New product description',
        price: 149.99,
        sku: 'NEW-001',
        stock: 20,
        categoryIds: [testCategory.id]
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.message).toBe('Product created successfully');
      expect(response.body.data.product.name).toBe(productData.name);
      expect(response.body.data.product.sku).toBe(productData.sku);
      expect(response.body.data.product.categories).toHaveLength(1);
    });

    it('should create product with image upload', async () => {
      const productData = {
        name: 'Product with Image',
        description: 'Product with image description',
        price: 199.99,
        sku: 'IMG-001',
        stock: 15
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('name', productData.name)
        .field('description', productData.description)
        .field('price', productData.price)
        .field('sku', productData.sku)
        .field('stock', productData.stock)
        .attach('images', path.join(__dirname, 'fixtures/test-image.jpg'))
        .expect(201);

      expect(response.body.data.product.images).toHaveLength(1);
      expect(response.body.data.product.images[0]).toMatch(/^\/uploads\//);
    });

    it('should return error for duplicate SKU', async () => {
      // Create first product
      await Product.create({
        name: 'First Product',
        description: 'First product description',
        price: 99.99,
        sku: 'DUPLICATE-001',
        stock: 10,
        slug: 'first-product'
      });

      // Try to create second product with same SKU
      const productData = {
        name: 'Second Product',
        description: 'Second product description',
        price: 149.99,
        sku: 'DUPLICATE-001',
        stock: 20
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(409);

      expect(response.body.error).toBe('Product with this SKU already exists');
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        name: 'T', // Too short
        price: -10, // Negative price
        sku: 'A' // Too short
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('PUT /api/products/:id', () => {
    beforeEach(async () => {
      testProduct = await Product.create({
        name: 'Test Product',
        description: 'Test product description',
        price: 99.99,
        sku: 'TEST-001',
        stock: 10,
        slug: 'test-product'
      });
    });

    it('should update product successfully', async () => {
      const updateData = {
        name: 'Updated Product',
        price: 149.99,
        stock: 25
      };

      const response = await request(app)
        .put(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Product updated successfully');
      expect(response.body.data.product.name).toBe(updateData.name);
      expect(response.body.data.product.price).toBe(updateData.price);
      expect(response.body.data.product.stock).toBe(updateData.stock);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData = { name: 'Updated Product' };

      const response = await request(app)
        .put(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe('Product not found');
    });
  });

  describe('DELETE /api/products/:id', () => {
    beforeEach(async () => {
      testProduct = await Product.create({
        name: 'Test Product',
        description: 'Test product description',
        price: 99.99,
        sku: 'TEST-001',
        stock: 10,
        slug: 'test-product'
      });
    });

    it('should delete product successfully', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Product deleted successfully');

      // Verify product is deleted
      const deletedProduct = await Product.findByPk(testProduct.id);
      expect(deletedProduct).toBeNull();
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .delete(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.error).toBe('Product not found');
    });
  });

  describe('POST /api/products/:id/images', () => {
    beforeEach(async () => {
      testProduct = await Product.create({
        name: 'Test Product',
        description: 'Test product description',
        price: 99.99,
        sku: 'TEST-001',
        stock: 10,
        slug: 'test-product',
        images: []
      });
    });

    it('should upload product images successfully', async () => {
      const response = await request(app)
        .post(`/api/products/${testProduct.id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('images', path.join(__dirname, 'fixtures/test-image.jpg'))
        .expect(200);

      expect(response.body.message).toBe('Images uploaded successfully');
      expect(response.body.data.images).toHaveLength(1);
      expect(response.body.data.images[0]).toMatch(/^\/uploads\//);
    });

    it('should return error for non-existent product', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .post(`/api/products/${fakeId}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('images', path.join(__dirname, 'fixtures/test-image.jpg'))
        .expect(404);

      expect(response.body.error).toBe('Product not found');
    });
  });

  describe('PATCH /api/products/:id/toggle-status', () => {
    beforeEach(async () => {
      testProduct = await Product.create({
        name: 'Test Product',
        description: 'Test product description',
        price: 99.99,
        sku: 'TEST-001',
        stock: 10,
        slug: 'test-product',
        isActive: true
      });
    });

    it('should toggle product status successfully', async () => {
      const response = await request(app)
        .patch(`/api/products/${testProduct.id}/toggle-status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toContain('deactivated');
      expect(response.body.data.product.isActive).toBe(false);
    });
  });

  describe('PATCH /api/products/:id/toggle-featured', () => {
    beforeEach(async () => {
      testProduct = await Product.create({
        name: 'Test Product',
        description: 'Test product description',
        price: 99.99,
        sku: 'TEST-001',
        stock: 10,
        slug: 'test-product',
        isFeatured: false
      });
    });

    it('should toggle product featured status successfully', async () => {
      const response = await request(app)
        .patch(`/api/products/${testProduct.id}/toggle-featured`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toContain('marked as featured');
      expect(response.body.data.product.isFeatured).toBe(true);
    });
  });
}); 