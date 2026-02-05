# 🍽️ Restaurant Ordering API

A comprehensive REST API for a restaurant ordering system built with Express.js, TypeScript, and Supabase.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [API Endpoints](#-api-endpoints)
- [Authentication](#-authentication)
- [Default Users](#-default-users)
- [Error Handling](#-error-handling)
- [Project Structure](#-project-structure)

---

## ✨ Features

- 🔐 **JWT Authentication** - Secure login with access & refresh tokens
- 👥 **Role-Based Access Control** - Admin, Manager, and Cashier roles
- 🍔 **Product Management** - Full CRUD operations with category filtering
- 📋 **Order Management** - Create, update, and track orders
- 🔢 **Auto Order Numbers** - Simple, memorable order numbers (1001, 1002, etc.)
- 💰 **Multi-Currency Support** - EGP, USD, EUR, GBP, SAR, AED, JPY, CAD, AUD
- 👤 **Audit Trail** - Track who created/updated products and orders
- 🔍 **Search & Filter** - Search products and filter orders by status

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js 5** | Web framework |
| **TypeScript** | Type safety |
| **Supabase** | PostgreSQL database |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account ([supabase.com](https://supabase.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/restaurant-backend.git
   cd restaurant-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Set up the database**
   - Go to Supabase SQL Editor
   - Run `database/schema.sql`
   - Run `database/seed.sql`

5. **Create users with hashed passwords**
   ```bash
   # Generate password hash
   node -e "require('bcryptjs').hash('password123', 10, (err, hash) => console.log(hash))"
   
   # Copy the hash and update users in Supabase
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Build for production**
   ```bash
   npm run build
   npm start
   ```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

---

## 🗄️ Database Setup

### Tables Overview

| Table | Description |
|-------|-------------|
| `users` | Staff accounts (admin, manager, cashier) |
| `products` | Menu items with prices and categories |
| `orders` | Customer orders with status tracking |
| `order_items` | Individual items within orders |
| `refresh_tokens` | JWT refresh token storage |

### Run Schema

Execute in Supabase SQL Editor:

```sql
-- See database/schema.sql for full schema
-- See database/seed.sql for sample data
```

---

## 📡 API Endpoints

### Base URL
```
http://localhost:3001/api
```

---

### 🏥 Health Check

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/health` | Check API status | No |

**Response:**
```json
{
  "success": true,
  "message": "Restaurant API is running!",
  "timestamp": "2026-02-05T12:00:00.000Z"
}
```

---

### 🔐 Authentication

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `POST` | `/auth/login` | Login user | No | - |
| `POST` | `/auth/register` | Register new user | Yes | Admin |
| `POST` | `/auth/refresh` | Refresh access token | No | - |
| `POST` | `/auth/logout` | Logout user | Yes | Any |
| `GET` | `/auth/me` | Get current user | Yes | Any |

#### POST /auth/login

**Request:**
```json
{
  "email": "admin@restaurant.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@restaurant.com",
      "name": "Admin User",
      "role": "admin",
      "is_active": true,
      "created_at": "2026-02-05T12:00:00.000Z",
      "updated_at": "2026-02-05T12:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### POST /auth/register (Admin Only)

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "email": "newuser@restaurant.com",
  "password": "password123",
  "name": "New User",
  "role": "cashier"
}
```

#### POST /auth/refresh

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 🍔 Products

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/products` | Get all products | No | - |
| `GET` | `/products/categories` | Get categories | No | - |
| `GET` | `/products/currencies` | Get currencies | No | - |
| `GET` | `/products/:id` | Get product by ID | No | - |
| `POST` | `/products` | Create product | Yes | Admin/Manager |
| `PUT` | `/products/:id` | Full update | Yes | Admin/Manager |
| `PATCH` | `/products/:id` | Partial update | Yes | Admin/Manager |
| `PATCH` | `/products/:id/availability` | Toggle availability | Yes | Admin/Manager |
| `DELETE` | `/products/:id` | Delete product | Yes | Admin |

#### GET /products

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category |
| `available` | boolean | Filter by availability (`true`/`false`) |
| `search` | string | Search in name/description |
| `currency` | string | Filter by currency |

**Example:**
```
GET /api/products?category=Main Courses&available=true&search=burger
```

**Response:**
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "id": "uuid",
      "name": "Beef Burger",
      "description": "Premium Angus beef patty with cheese...",
      "price": 189.00,
      "currency": "EGP",
      "image_url": "https://images.unsplash.com/...",
      "category": "Main Courses",
      "available": true,
      "created_by": "uuid",
      "updated_by": "uuid",
      "created_at": "2026-02-05T12:00:00.000Z",
      "updated_at": "2026-02-05T12:00:00.000Z"
    }
  ]
}
```

#### POST /products

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Koshari",
  "description": "Traditional Egyptian dish with rice, pasta, and lentils",
  "price": 75.00,
  "currency": "EGP",
  "image_url": "https://images.unsplash.com/...",
  "category": "Main Courses",
  "available": true
}
```

#### GET /products/categories

**Response:**
```json
{
  "success": true,
  "data": ["Appetizers", "Beverages", "Desserts", "Main Courses"]
}
```

#### GET /products/currencies

**Response:**
```json
{
  "success": true,
  "defaultCurrency": "EGP",
  "data": [
    { "code": "USD", "symbol": "$", "isDefault": false },
    { "code": "EUR", "symbol": "€", "isDefault": false },
    { "code": "EGP", "symbol": "E£", "isDefault": true },
    { "code": "SAR", "symbol": "﷼", "isDefault": false }
  ]
}
```

---

### 📋 Orders

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/orders` | Get all orders | Yes | Any |
| `GET` | `/orders/statuses` | Get order statuses | Yes | Any |
| `GET` | `/orders/:id` | Get order by ID or number | Yes | Any |
| `POST` | `/orders` | Create order | Yes | Any |
| `PUT` | `/orders/:id` | Update order | Yes | Any |
| `PATCH` | `/orders/:id` | Partial update | Yes | Any |
| `PATCH` | `/orders/:id/status` | Update status | Yes | Any |
| `DELETE` | `/orders/:id` | Delete order | Yes | Admin/Manager |

#### GET /orders

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status |
| `customer_name` | string | Search by customer name |
| `order_number` | number | Search by order number |
| `limit` | number | Results per page (default: 50) |
| `offset` | number | Pagination offset |
| `sort` | string | Sort field (default: created_at) |
| `order` | string | Sort order (`asc`/`desc`) |

**Example:**
```
GET /api/orders?status=pending&order_number=1001
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "uuid",
      "order_number": 1001,
      "customer_name": "Ahmed Mohamed",
      "customer_email": "ahmed@example.com",
      "customer_phone": "+20 123 456 7890",
      "total_amount": 378.00,
      "currency": "EGP",
      "status": "pending",
      "notes": "Extra spicy please",
      "created_by": "uuid",
      "updated_by": "uuid",
      "created_at": "2026-02-05T12:00:00.000Z",
      "updated_at": "2026-02-05T12:00:00.000Z"
    }
  ]
}
```

#### POST /orders

**Request:**
```json
{
  "customer_name": "Ahmed Mohamed",
  "customer_email": "ahmed@example.com",
  "customer_phone": "+20 123 456 7890",
  "items": [
    {
      "product_id": "product-uuid-1",
      "quantity": 2
    },
    {
      "product_id": "product-uuid-2",
      "quantity": 1
    }
  ],
  "notes": "Extra spicy please"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order #1001 created successfully!",
  "data": {
    "id": "uuid",
    "order_number": 1001,
    "customer_name": "Ahmed Mohamed",
    "total_amount": 378.00,
    "currency": "EGP",
    "status": "pending",
    "items": [
      {
        "id": "item-uuid",
        "product_id": "product-uuid",
        "product_name": "Beef Burger",
        "quantity": 2,
        "unit_price": 189.00,
        "total_price": 378.00
      }
    ]
  }
}
```

#### GET /orders/:id

You can get an order by **UUID** or **order number**:

```
GET /api/orders/1001
GET /api/orders/550e8400-e29b-41d4-a716-446655440000
```

#### PATCH /orders/:id/status

**Request:**
```json
{
  "status": "confirmed"
}
```

**Valid Statuses:**
- `pending` - Order received
- `confirmed` - Order confirmed
- `preparing` - Being prepared
- `ready` - Ready for pickup
- `completed` - Order completed
- `cancelled` - Order cancelled

---

### 🛒 Order Items

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/orders/:id/items` | Add item to order | Yes |
| `PATCH` | `/orders/:id/items/:itemId` | Update item quantity | Yes |
| `DELETE` | `/orders/:id/items/:itemId` | Remove item | Yes |

#### POST /orders/:id/items

**Request:**
```json
{
  "product_id": "product-uuid",
  "quantity": 2
}
```

#### PATCH /orders/:id/items/:itemId

**Request:**
```json
{
  "quantity": 3
}
```

---

## 🔐 Authentication

### Using Access Tokens

Include the access token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Token Expiration

| Token Type | Default Expiration |
|------------|-------------------|
| Access Token | 15 minutes |
| Refresh Token | 7 days |

### Refreshing Tokens

When the access token expires, use the refresh token to get new tokens:

```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

---

## 👥 Default Users

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| `admin@restaurant.com` | `password123` | Admin | Full access |
| `cashier@restaurant.com` | `password123` | Cashier | Create orders, view products |

### Role Permissions

| Action | Admin | Manager | Cashier |
|--------|-------|---------|---------|
| View products | ✅ | ✅ | ✅ |
| Create products | ✅ | ✅ | ❌ |
| Update products | ✅ | ✅ | ❌ |
| Delete products | ✅ | ❌ | ❌ |
| View orders | ✅ | ✅ | ✅ |
| Create orders | ✅ | ✅ | ✅ |
| Update orders | ✅ | ✅ | ✅ |
| Delete orders | ✅ | ✅ | ❌ |
| Register users | ✅ | ❌ | ❌ |

---

## ❌ Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Invalid/missing token |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found |
| `500` | Internal Server Error |

### Example Errors

**Invalid credentials:**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

**Token expired:**
```json
{
  "success": false,
  "error": "Access token has expired"
}
```

**Insufficient permissions:**
```json
{
  "success": false,
  "error": "You do not have permission to perform this action"
}
```

---

## 📁 Project Structure

```
backend/
├── database/
│   ├── schema.sql              # Database tables & constraints
│   ├── seed.sql                # Sample data
│   └── migration_add_currency.sql
├── src/
│   ├── config/
│   │   └── supabase.ts         # Supabase client
│   ├── controllers/
│   │   ├── auth/
│   │   │   ├── index.ts
│   │   │   ├── login.ts
│   │   │   ├── logout.ts
│   │   │   ├── me.ts
│   │   │   ├── refreshToken.ts
│   │   │   └── register.ts
│   │   ├── orders/
│   │   │   ├── index.ts
│   │   │   ├── createOrder.ts
│   │   │   ├── getAllOrders.ts
│   │   │   ├── getOrderById.ts
│   │   │   ├── updateOrder.ts
│   │   │   ├── updateOrderStatus.ts
│   │   │   ├── deleteOrder.ts
│   │   │   ├── addOrderItem.ts
│   │   │   ├── updateOrderItem.ts
│   │   │   ├── removeOrderItem.ts
│   │   │   └── getOrderStatuses.ts
│   │   └── products/
│   │       ├── index.ts
│   │       ├── getAllProducts.ts
│   │       ├── getProductById.ts
│   │       ├── getCategories.ts
│   │       ├── getCurrencies.ts
│   │       ├── createProduct.ts
│   │       ├── updateProduct.ts
│   │       ├── patchProduct.ts
│   │       ├── deleteProduct.ts
│   │       └── toggleAvailability.ts
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication
│   │   └── errorHandler.ts     # Error handling
│   ├── routes/
│   │   └── v1_routes/
│   │       ├── auth.ts
│   │       ├── orders.ts
│   │       └── products.ts
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── utils/
│   │   ├── helpers/
│   │   │   ├── authHelpers.ts
│   │   │   └── orderHelpers.ts
│   │   └── validators/
│   │       ├── authValidators.ts
│   │       ├── orderValidators.ts
│   │       └── productValidators.ts
│   └── server.ts               # Express app entry point
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🧪 Testing with Postman

Import the Postman collection from `restaurant-api-v2.postman_collection.json` for easy API testing.

### Quick Test Flow

1. **Login** → Saves tokens automatically
2. **Get Products** → Lists all menu items
3. **Create Order** → Places a new order
4. **Get Order** → View order by number (e.g., 1001)
5. **Update Status** → Change order status

---

## 📜 Scripts

```bash
# Development (with hot reload)
npm run dev

# Build TypeScript
npm run build

# Production
npm start
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Youssef Hassane AKA Almasy**

