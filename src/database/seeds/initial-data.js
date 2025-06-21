const { User, Category, Product } = require('../../models');
const bcrypt = require('bcryptjs');

async function seedInitialData() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    const adminUser = await User.create({
      name: 'Administrador',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      isActive: true
    });
    console.log('✅ Admin user created');

    // Create regular user
    const userPassword = await bcrypt.hash('User123!', 12);
    const regularUser = await User.create({
      name: 'Usuário Teste',
      email: 'user@example.com',
      password: userPassword,
      role: 'user',
      isActive: true
    });
    console.log('✅ Regular user created');

    // Create categories
    const electronicsCategory = await Category.create({
      name: 'Eletrônicos',
      description: 'Produtos eletrônicos e gadgets',
      slug: 'eletronicos',
      isActive: true
    });

    const smartphonesCategory = await Category.create({
      name: 'Smartphones',
      description: 'Telefones celulares e smartphones',
      slug: 'smartphones',
      parentId: electronicsCategory.id,
      isActive: true
    });

    const computersCategory = await Category.create({
      name: 'Computadores',
      description: 'Computadores, notebooks e acessórios',
      slug: 'computadores',
      parentId: electronicsCategory.id,
      isActive: true
    });

    const clothingCategory = await Category.create({
      name: 'Vestuário',
      description: 'Roupas, calçados e acessórios',
      slug: 'vestuario',
      isActive: true
    });

    console.log('✅ Categories created');

    // Create products
    const product1 = await Product.create({
      name: 'Smartphone Galaxy S23',
      description: 'Smartphone Samsung Galaxy S23 com 128GB, tela de 6.1", câmera tripla',
      price: 3999.99,
      sku: 'SAMSUNG-S23-128',
      stock: 25,
      slug: 'smartphone-galaxy-s23',
      isActive: true,
      isFeatured: true,
      weight: 0.168,
      dimensions: { length: 15.0, width: 7.0, height: 0.8 },
      options: {
        colors: ['Preto', 'Branco', 'Verde'],
        storage: ['128GB', '256GB', '512GB']
      },
      metaTitle: 'Smartphone Galaxy S23 - Samsung',
      metaDescription: 'Smartphone Samsung Galaxy S23 com tecnologia avançada e câmera profissional'
    });

    const product2 = await Product.create({
      name: 'Notebook Dell Inspiron 15',
      description: 'Notebook Dell Inspiron 15" com Intel i5, 8GB RAM, SSD 256GB',
      price: 3499.99,
      sku: 'DELL-INSPIRON-15',
      stock: 15,
      slug: 'notebook-dell-inspiron-15',
      isActive: true,
      isFeatured: false,
      weight: 2.1,
      dimensions: { length: 35.8, width: 24.2, height: 1.9 },
      options: {
        processor: ['Intel i5', 'Intel i7'],
        ram: ['8GB', '16GB'],
        storage: ['256GB SSD', '512GB SSD', '1TB HDD']
      },
      metaTitle: 'Notebook Dell Inspiron 15 - Intel i5',
      metaDescription: 'Notebook Dell Inspiron 15 com processador Intel i5 e SSD para melhor performance'
    });

    const product3 = await Product.create({
      name: 'Camiseta Básica Algodão',
      description: 'Camiseta básica 100% algodão, disponível em várias cores e tamanhos',
      price: 29.99,
      sku: 'CAMISETA-BASICA-001',
      stock: 100,
      slug: 'camiseta-basica-algodao',
      isActive: true,
      isFeatured: false,
      weight: 0.15,
      dimensions: { length: 30, width: 20, height: 1 },
      options: {
        colors: ['Branco', 'Preto', 'Azul', 'Vermelho', 'Verde'],
        sizes: ['P', 'M', 'G', 'GG', 'XG']
      },
      metaTitle: 'Camiseta Básica Algodão - Confortável',
      metaDescription: 'Camiseta básica 100% algodão, confortável e durável'
    });

    console.log('✅ Products created');

    // Associate products with categories
    await product1.setCategories([smartphonesCategory.id]);
    await product2.setCategories([computersCategory.id]);
    await product3.setCategories([clothingCategory.id]);

    console.log('✅ Product-category associations created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Initial Data Summary:');
    console.log('- Admin user: admin@example.com / Admin123!');
    console.log('- Regular user: user@example.com / User123!');
    console.log('- Categories: Eletrônicos, Smartphones, Computadores, Vestuário');
    console.log('- Products: Galaxy S23, Dell Inspiron 15, Camiseta Básica');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedInitialData()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedInitialData }; 