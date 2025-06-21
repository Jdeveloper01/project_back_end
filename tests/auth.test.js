const request = require('supertest');
const app = require('../src/server');
const { User } = require('../src/models');
const { sequelize } = require('../src/database/connection');

describe('Authentication Endpoints', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Sync database for testing
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear users table before each test
    await User.destroy({ where: {} });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data).toHaveProperty('token');
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123'
      };

      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Try to create second user with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.error).toBe('Email already registered');
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        name: 'T', // Too short
        email: 'invalid-email',
        password: '123' // Too short
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toHaveLength(3);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123'
      });
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'TestPass123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data).toHaveProperty('token');

      authToken = response.body.data.token;
    });

    it('should return error for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'TestPass123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid email or password');
    });

    it('should return error for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid email or password');
    });

    it('should return error for inactive user', async () => {
      // Deactivate user
      await testUser.update({ isActive: false });

      const loginData = {
        email: 'test@example.com',
        password: 'TestPass123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Account is deactivated');
    });
  });

  describe('GET /api/auth/profile', () => {
    beforeEach(async () => {
      // Create a test user and get token
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123'
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPass123'
        });

      authToken = loginResponse.body.data.token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.name).toBe('Test User');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return error without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    it('should return error with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toBe('Invalid token');
    });
  });

  describe('PUT /api/auth/profile', () => {
    beforeEach(async () => {
      // Create a test user and get token
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123'
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPass123'
        });

      authToken = loginResponse.body.data.token;
    });

    it('should update user profile successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.data.user.name).toBe(updateData.name);
      expect(response.body.data.user.email).toBe(updateData.email);
    });

    it('should return error for duplicate email', async () => {
      // Create another user
      await User.create({
        name: 'Another User',
        email: 'another@example.com',
        password: 'TestPass123'
      });

      const updateData = {
        email: 'another@example.com'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(409);

      expect(response.body.error).toBe('Email already registered');
    });
  });

  describe('POST /api/auth/change-password', () => {
    beforeEach(async () => {
      // Create a test user and get token
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123'
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPass123'
        });

      authToken = loginResponse.body.data.token;
    });

    it('should change password successfully', async () => {
      const passwordData = {
        currentPassword: 'TestPass123',
        newPassword: 'NewPass123'
      };

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body.message).toBe('Password changed successfully');
    });

    it('should return error for incorrect current password', async () => {
      const passwordData = {
        currentPassword: 'WrongPassword123',
        newPassword: 'NewPass123'
      };

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.error).toBe('Current password is incorrect');
    });
  });
}); 