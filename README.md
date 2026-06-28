# 🛒 Premium MERN E-Commerce Platform

A professional, full-stack, and high-performance e-commerce platform built using the **MERN** stack (MongoDB, Express, React, Node.js) with end-to-end **TypeScript** support and styled using **Tailwind CSS v4**. 

This application features a modular frontend structure, modern React routing, state management via Context APIs, and a secure RESTful API backed by Mongoose schemas.

---

## 🌟 Key Features

### 👤 Customer Experience
- **Dynamic Product Catalog**: Browse products with client-side searching, categories, and real-time stock indicators.
- **Detailed Product View**: Multi-image product gallery, stock statuses, descriptions, and ratings.
- **Persistent Cart System**: Authenticated cart sync with operations to add, modify, and delete cart items.
- **Secure Checkout Flow**: Input shipping details, review order items, and place orders with instant validation.
- **Comprehensive Profile Management**: View and edit user details, and check personal order histories with detailed statuses.
- **Token-Based Authentication**: Seamless registration, login, and profile protection using JSON Web Tokens (JWT) and Bcrypt hashing.

### 🔑 Administrative Control (Admin Dashboard)
- **Product Management**: Complete CRUD operations (Create, Read, Update, Delete) for products.
- **Order Tracking**: Review all customer orders and update shipping or processing statuses (e.g., Pending, Processing, Shipped, Delivered, Cancelled).
- **User Directory**: List registered users and elevate standard users to Admin roles.

---

## 🛠️ Technology Stack

### Frontend
- **React 19 & TypeScript**: Robust, type-safe UI component modeling.
- **Vite**: Ultra-fast next-generation frontend bundling and HMR.
- **React Router DOM v7**: Modern declarative routing with nested layout systems.
- **Tailwind CSS v4**: Beautiful, highly responsive utilities and styling.
- **Axios**: Clean API communications using global client instances and request interceptors to auto-attach tokens.

### Backend & Database
- **Node.js & Express**: Extensible and lightweight backend server.
- **TypeScript & ts-node-dev**: Strong typing throughout controllers, middlewares, models, and routes.
- **MongoDB & Mongoose**: Flexible document database schema definitions and querying.
- **JWT (JsonWebToken)**: Secure, stateless authentication middleware.
- **Bcryptjs**: Industrial-strength password salting and hashing.

---

## 📁 Repository Structure

```text
MERN_E-comm/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── api/            # Axios API client setup and interceptors
│   │   ├── components/     # Route guards (ProtectedRoute, AdminRoute) and reusable components
│   │   ├── context/        # Global states (AuthContext, CartContext)
│   │   ├── layouts/        # Application shells (MainLayout)
│   │   ├── pages/          # Home, Products, Details, Checkout, Orders, Admin, Auth
│   │   ├── routes/         # Routing configurations (react-router-dom)
│   │   ├── services/       # Feature-specific API request methods
│   │   ├── types/          # Shared TypeScript type definitions
│   │   └── utils/          # Formatting & local helper functions
│   ├── index.html
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── server/                 # Backend Node/Express Server
    ├── src/
    │   ├── config/         # Database and third-party configuration
    │   ├── controllers/    # Request/Response handlers
    │   ├── middleware/     # Authentication & authorization guards
    │   ├── models/         # Mongoose schema declarations
    │   ├── routes/         # API endpoint maps
    │   ├── seed/           # Seed scripts utilizing mock data
    │   ├── utils/          # Helper utilities
    │   └── app.ts          # Express app configurations
    ├── tsconfig.json
    └── package.json
```

---

## ⚙️ Getting Started & Installation

### Prerequisites
Make sure you have the following installed on your local machine:
- **Node.js** (v18.x or higher recommended)
- **MongoDB** (Local instance or MongoDB Atlas URI)
- **npm** (comes with Node.js)

---

### Backend Configuration

1. Navigate to the server folder:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mern_ecommerce
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

5. **(Optional) Seed the Database**:
   Populate your MongoDB database with pre-configured mock products fetched dynamically from the DummyJSON API:
   ```bash
   npm run seed
   ```

6. Start the development backend:
   ```bash
   npm run dev
   ```
   *The server will run on `http://localhost:5000`.*

---

### Frontend Configuration

1. Navigate to the client folder:
   ```bash
   cd ../client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The web app will run locally (typically at `http://localhost:5173`).*

---

## 📡 API Endpoints

All backend endpoints are prefixed with `/api`.

### 🔐 User & Auth Endpoints (`/api/users`)
| Method | Endpoint | Description | Auth Requirement |
| :--- | :--- | :--- | :--- |
| **POST** | `/register` | Registers a new user account | Public |
| **POST** | `/login` | Authenticates a user and returns a token | Public |
| **GET** | `/profile` | Retrieves current user profile | Private (User) |

### 🛍️ Products Endpoints (`/api/products`)
| Method | Endpoint | Description | Auth Requirement |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Retrieves list of all products | Public |
| **GET** | `/:id` | Retrieves single product details by ID | Public |

### 🛒 Cart Endpoints (`/api/cart`)
| Method | Endpoint | Description | Auth Requirement |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Fetch user's cart | Private (User) |
| **POST** | `/add` | Add product item to cart | Private (User) |
| **PUT** | `/:productId` | Update quantity of a cart item | Private (User) |
| **DELETE** | `/:productId` | Remove specific product from cart | Private (User) |
| **DELETE** | `/` | Clear whole cart | Private (User) |

### 📦 Orders Endpoints (`/api/orders`)
| Method | Endpoint | Description | Auth Requirement |
| :--- | :--- | :--- | :--- |
| **POST** | `/` | Create a new order | Private (User) |
| **GET** | `/my-orders` | Fetch orders placed by authenticated user | Private (User) |
| **GET** | `/:id` | Fetch specific order details | Private (User) |

### 🛠️ Admin Dashboard Endpoints (`/api/admin`)
| Method | Endpoint | Description | Auth Requirement |
| :--- | :--- | :--- | :--- |
| **GET** | `/products` | Get list of products for admin view | Private (Admin) |
| **POST** | `/products` | Create a new product | Private (Admin) |
| **PUT** | `/products/:id` | Update an existing product | Private (Admin) |
| **DELETE** | `/products/:id` | Delete a product | Private (Admin) |
| **GET** | `/orders` | Get all customer orders | Private (Admin) |
| **PUT** | `/orders/:id/status` | Update shipping/processing status of an order | Private (Admin) |
| **GET** | `/users` | Get lists of all registered users | Private (Admin) |
| **PUT** | `/users/:id/role` | Elevate/demote user permissions/roles | Private (Admin) |

---

## 🏃 available Scripts

### Backend (`/server`)
- `npm run dev`: Runs the TypeScript backend using `ts-node-dev` with hot reload.
- `npm run build`: Compiles the server codebase into raw Javascript in `/dist`.
- `npm run start`: Runs the built production server using NodeJS.
- `npm run seed`: Clears existing products and imports a batch of products from DummyJSON.

### Frontend (`/client`)
- `npm run dev`: Runs Vite dev server.
- `npm run build`: Compiles frontend asset bundle using typescript checker and Vite builder.
- `npm run lint`: Analyzes code conventions and errors using ESLint.
- `npm run preview`: Previews the compiled build locally.

---

## 📝 License

Distributed under the ISC License. See `LICENSE` in the respective subfolders for more information.
