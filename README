# API Backend de E-commerce

Uma API backend robusta em Node.js/Express.js para uma plataforma de e-commerce com autenticação de usuários, gerenciamento de produtos e organização de categorias.

## 🚀 Funcionalidades

- **Autenticação e Autorização de Usuários**
  - Autenticação baseada em JWT
  - Registro e login de usuários
  - Controle de acesso baseado em roles (Admin/Usuário)
  - Funcionalidade de alteração de senha
  - Mecanismo de renovação de token

- **Gerenciamento de Produtos**
  - Operações CRUD para produtos
  - Suporte a upload de imagens (múltiplas imagens)
  - Categorização de produtos
  - Produtos em destaque
  - Gerenciamento de status de produtos
  - URLs de produtos baseadas em slug

- **Gerenciamento de Categorias**
  - Estrutura hierárquica de categorias
  - Operações CRUD para categorias
  - Relacionamentos pai-filho

- **Recursos de Segurança**
  - Helmet.js para headers de segurança
  - Limitação de taxa de requisições
  - Configuração CORS
  - Validação de entrada
  - Middleware de tratamento de erros

- **Banco de Dados**
  - Sequelize ORM com PostgreSQL
  - Migrações e seeds do banco de dados
  - Gerenciamento de relacionamentos

## 🛠️ Stack Tecnológica

- **Runtime**: Node.js
- **Framework**: Express.js
- **Banco de Dados**: PostgreSQL com Sequelize ORM
- **Autenticação**: JWT (JSON Web Tokens)
- **Upload de Arquivos**: Multer
- **Segurança**: Helmet, CORS, Rate Limiting
- **Validação**: Middleware de validação customizado
- **Testes**: Jest

## 📋 Pré-requisitos

- Node.js (v14 ou superior)
- Banco de dados PostgreSQL
- npm ou yarn como gerenciador de pacotes

## 🔧 Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositório>
   cd project_back_end-1
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configuração do Ambiente**
   Crie um arquivo `.env` no diretório raiz:
   ```env
   # Configuração do Servidor
   PORT=3000
   NODE_ENV=development
   
   # Configuração do Banco de Dados
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=nome_do_seu_banco
   DB_USER=seu_usuario_do_banco
   DB_PASSWORD=sua_senha_do_banco
   
   # Configuração JWT
   JWT_SECRET=sua_chave_secreta_jwt
   JWT_EXPIRES_IN=24h
   
   # Limitação de Taxa
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # Upload de Arquivos
   UPLOAD_PATH=uploads
   MAX_FILE_SIZE=5242880
   ```

4. **Configuração do Banco de Dados**
   ```bash
   # Crie o banco de dados
   createdb nome_do_seu_banco
   
   # Execute a sincronização do banco (desenvolvimento)
   npm run dev
   ```

5. **Inicie o servidor**
   ```bash
   # Modo desenvolvimento
   npm run dev
   
   # Modo produção
   npm start
   ```

## 📚 Documentação da API

### URL Base
```
http://localhost:3000/api
```

### Endpoints de Autenticação

#### Registrar Usuário
```http
POST /auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

#### Login do Usuário
```http
POST /auth/login
Content-Type: application/json

{
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

#### Obter Perfil do Usuário
```http
GET /auth/profile
Authorization: Bearer <token>
```

#### Atualizar Perfil
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "João Atualizado",
  "email": "joao.atualizado@exemplo.com"
}
```

#### Alterar Senha
```http
POST /auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "senhaantiga",
  "newPassword": "novasenha123"
}
```

### Endpoints de Produtos

#### Obter Todos os Produtos
```http
GET /products?page=1&limit=10&category=eletronicos
```

#### Obter Produtos em Destaque
```http
GET /products/featured
```

#### Obter Produto por ID
```http
GET /products/:id
```

#### Obter Produto por Slug
```http
GET /products/slug/:slug
```

#### Criar Produto (Apenas Admin)
```http
POST /products
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Nome do Produto",
  "description": "Descrição do produto",
  "price": 99.99,
  "categoryIds": ["uuid1", "uuid2"],
  "images": [arquivo1, arquivo2]
}
```

#### Atualizar Produto (Apenas Admin)
```http
PUT /products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Nome do Produto Atualizado",
  "price": 89.99
}
```

#### Deletar Produto (Apenas Admin)
```http
DELETE /products/:id
Authorization: Bearer <token>
```

### Endpoints de Categorias

#### Obter Todas as Categorias
```http
GET /categories
```

#### Obter Categoria por ID
```http
GET /categories/:id
```

#### Criar Categoria (Apenas Admin)
```http
POST /categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Eletrônicos",
  "description": "Dispositivos eletrônicos e acessórios",
  "parentId": "id-da-categoria-pai-opcional"
}
```

#### Atualizar Categoria (Apenas Admin)
```http
PUT /categories/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Nome da Categoria Atualizada"
}
```

#### Deletar Categoria (Apenas Admin)
```http
DELETE /categories/:id
Authorization: Bearer <token>
```

### Endpoints de Gerenciamento de Usuários

#### Obter Todos os Usuários (Apenas Admin)
```http
GET /users
Authorization: Bearer <token>
```

#### Obter Usuário por ID (Apenas Admin)
```http
GET /users/:id
Authorization: Bearer <token>
```

#### Atualizar Usuário (Apenas Admin)
```http
PUT /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Nome Atualizado",
  "email": "atualizado@exemplo.com",
  "role": "admin"
}
```

#### Deletar Usuário (Apenas Admin)
```http
DELETE /users/:id
Authorization: Bearer <token>
```

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header Authorization:

```
Authorization: Bearer <seu_token_jwt>
```

## 📁 Estrutura do Projeto

```
src/
├── controllers/          # Manipuladores de requisições
│   ├── authController.js
│   ├── categoryController.js
│   ├── productController.js
│   └── userController.js
├── database/            # Configuração do banco de dados
│   ├── connection.js
│   └── seeds/
├── middleware/          # Middleware customizado
│   ├── auth.js
│   ├── errorHandler.js
│   ├── upload.js
│   └── validation.js
├── models/             # Modelos Sequelize
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   └── ProductCategory.js
├── routes/             # Rotas da API
│   ├── auth.js
│   ├── products.js
│   ├── categories.js
│   └── users.js
└── server.js           # Arquivo principal da aplicação
```

## 🧪 Testes

Execute a suite de testes:

```bash
# Execute todos os testes
npm test

# Execute testes com cobertura
npm run test:coverage

# Execute testes em modo watch
npm run test:watch
```

## 🚀 Deploy

### Configuração de Produção

1. Configure as variáveis de ambiente para produção
2. Configure o banco de dados para produção
3. Configure proxy reverso (nginx)
4. Use PM2 para gerenciamento de processos

```bash
# Instale o PM2
npm install -g pm2

# Inicie a aplicação
pm2 start src/server.js --name "api-ecommerce"

# Monitore a aplicação
pm2 monit
```

## 📝 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `PORT` | Porta do servidor | 3000 |
| `NODE_ENV` | Ambiente | development |
| `DB_HOST` | Host do banco de dados | localhost |
| `DB_PORT` | Porta do banco de dados | 5432 |
| `DB_NAME` | Nome do banco de dados | - |
| `DB_USER` | Usuário do banco de dados | - |
| `DB_PASSWORD` | Senha do banco de dados | - |
| `JWT_SECRET` | Chave secreta JWT | - |
| `JWT_EXPIRES_IN` | Expiração JWT | 24h |
| `RATE_LIMIT_WINDOW_MS` | Janela de limitação de taxa | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Máximo de requisições por janela | 100 |

## 🤝 Contribuindo

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas, por favor:

1. Verifique as issues existentes
2. Crie uma nova issue com informações detalhadas
3. Entre em contato com a equipe de desenvolvimento

## 🔄 Verificação de Saúde

Verifique se a API está rodando:

```http
GET /health
```

Resposta:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```