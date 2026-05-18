# ☕ Moonstone Café — Full-Stack Restaurant Management Platform

<p align="center">
  <strong>A premium, full-stack multicuisine restaurant web application with real-time order management, online payments, AI chatbot concierge, and a comprehensive admin dashboard.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5.2-000000?logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-TiDB_Cloud-4479A1?logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socket.io&logoColor=white" />
  <img src="https://img.shields.io/badge/Razorpay-Integrated-0B68FF?logo=razorpay&logoColor=white" />
  <img src="https://img.shields.io/badge/PWA-Enabled-5A0FC8?logo=pwa&logoColor=white" />
</p>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## About

**Moonstone Café** is a production-ready, full-stack restaurant management web application built for a multicuisine dining establishment. It features a luxury-themed customer-facing website, a real-time admin dashboard, Razorpay payment integration, an AI-powered chatbot concierge (Google Gemini), and WebSocket-driven live notifications.

### Target Users
- **Customers**: Browse menu, place orders (online/COD), manage profile and order history
- **Restaurant Admin**: Manage menu items, process orders, handle messages/reservations, control restaurant operations

---

## Features

### 🍽️ Customer Features
- **Interactive Menu** — Browse categorized menu items with filters and search
- **Cart System** — Add, remove, update quantities with persistent localStorage cart
- **Online Payments** — Razorpay integration for secure payment processing
- **Cash on Delivery** — COD option for flexibility
- **Order Tracking** — Full order history with status tracking and cancellation
- **User Authentication** — Email/Password + Google OAuth login
- **User Profiles** — Avatar upload, personal details, delivery address management
- **AI Chatbot** — Gemini-powered concierge for menu queries (commented out in production)
- **Real-time Status** — Live restaurant open/closed status via WebSockets
- **PWA Support** — Installable as a mobile app with offline caching

### 🛠️ Admin Features
- **Dashboard Overview** — Stats for orders, menu items, and unread messages
- **Order Management** — Update order status (pending → confirmed → preparing → delivered)
- **Payment Management** — Track and update payment statuses (pending/paid/refunded/failed)
- **Menu CRUD** — Add, edit, delete, toggle availability of menu items with image upload
- **Message Inbox** — View and manage customer contact messages
- **Restaurant Configuration** — Update restaurant info, operating hours, and open/close modes
- **Real-time Notifications** — Sound + browser notifications for new orders, messages, and reservations
- **Operations Control** — Force open/close or auto-schedule restaurant status

### 🎨 Design & UX
- **Heritage Design System** — Custom warm color palette (Saffron, Olive, Espresso, Gold)
- **Framer Motion Animations** — Page transitions, scroll effects, parallax
- **Responsive Design** — Mobile-first with elegant desktop layouts
- **Custom Cursor** — Enhanced browsing experience
- **Smooth Scrolling** — Lenis scroll library integration
- **Dark/Light Theme** — Toggle support (framework in place)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18.3, Vite 7, TailwindCSS 3.4 |
| **Backend** | Node.js, Express 5.2 |
| **Database** | MySQL (TiDB Cloud — Serverless) |
| **Authentication** | JWT (jsonwebtoken), bcrypt, Google OAuth 2.0 |
| **Payments** | Razorpay (Test Mode) |
| **Real-time** | Socket.IO 4.8 |
| **AI Chatbot** | Google Gemini API (gemini-flash-latest) |
| **File Upload** | Multer (disk storage) |
| **Validation** | Joi |
| **Security** | Helmet, CORS |
| **PWA** | vite-plugin-pwa, Workbox |
| **Animations** | Framer Motion, Lenis |
| **SEO** | react-helmet-async |
| **Notifications** | react-toastify, Web Notifications API |
| **HTTP Client** | Axios |
| **Routing** | React Router DOM v7 |
| **Hosting** | Netlify (Frontend), Render (Backend) |

---

## Architecture

```
┌────────────────────────┐       ┌──────────────────────┐
│   Frontend (React)     │◄─────►│   Backend (Express)  │
│   Netlify CDN          │ REST  │   Render.com         │
│                        │◄─────►│                      │
│   • Pages & Components │  WS   │   • Routes           │
│   • Context Providers  │       │   • Controllers      │
│   • Axios HTTP Client  │       │   • Middleware        │
│   • Socket.IO Client   │       │   • Socket.IO Server  │
└────────────────────────┘       └──────────┬───────────┘
                                            │
                                 ┌──────────▼───────────┐
                                 │   MySQL (TiDB Cloud)  │
                                 │   7 Tables             │
                                 │   admin_users, users,  │
                                 │   categories,          │
                                 │   menu_items, orders,  │
                                 │   messages,            │
                                 │   reservations,        │
                                 │   restaurant_info      │
                                 └────────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MySQL** database (local or TiDB Cloud)
- **Razorpay** account (for payments)
- **Google Cloud Console** project (for Google OAuth — optional)

### Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file (see Environment Variables section below)
cp .env.example .env

# 4. Set up the database tables
node setup_missing_tables.js

# 5. Seed initial data (admin user + categories)
node scripts/seed-db.js

# 6. Start development server
npm run dev
```

The server runs at `http://localhost:5000`

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The frontend runs at `http://localhost:5173`

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=5000
NODE_ENV=development
BACKEND_URL=http://localhost:5000

# Database (MySQL / TiDB Cloud)
DB_HOST=your_db_host
DB_PORT=4000
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=moonstone_cafe
DB_SSL=true

# Authentication
JWT_SECRET=your_super_secret_key

# AI Chatbot (Google Gemini)
AI_API_KEYS=your_gemini_api_key

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Frontend

The API base URL is currently hardcoded in:
- `frontend/src/utils/api.js` → `https://moonstonecafe.onrender.com/api`
- `frontend/src/context/SocketContext.jsx` → `https://moonstonecafe.onrender.com`

For local development, change these to `http://localhost:5000`.

---

## Database Setup

The database is MySQL (hosted on TiDB Cloud). Tables are created using:

```bash
# Create users and orders tables
node setup_missing_tables.js

# Seed admin user, categories, and restaurant info
node scripts/seed-db.js
```

**Default admin credentials:** `admin` / `password123`

---

## Scripts

### Backend

| Script | Command | Description |
|---|---|---|
| Start | `npm start` | Start production server |
| Dev | `npm run dev` | Start with nodemon (hot reload) |
| Seed DB | `node scripts/seed-db.js` | Seed database with initial data |
| Setup Tables | `node setup_missing_tables.js` | Create missing tables |
| Check DB | `node scripts/check-db.js` | Verify database connection |

### Frontend

| Script | Command | Description |
|---|---|---|
| Dev | `npm run dev` | Start Vite dev server |
| Build | `npm run build` | Production build |
| Preview | `npm run preview` | Preview production build |
| Lint | `npm run lint` | Run ESLint |

---

## Deployment

### Frontend → Netlify

1. Connect GitHub repository to Netlify
2. Set build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. The `netlify.toml` file handles SPA redirects automatically

### Backend → Render

1. Create a new Web Service on Render
2. Set:
   - **Build command**: `npm install`
   - **Start command**: `node app.js`
3. Add all environment variables from `.env`

---

## Project Structure

```
moonstone-cafe/
├── backend/
│   ├── config/
│   │   └── db.js                  # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js      # Admin login & registration
│   │   ├── userAuthController.js  # User login, register, Google OAuth
│   │   ├── menuController.js      # Menu CRUD operations
│   │   ├── orderController.js     # Order management
│   │   ├── paymentController.js   # Razorpay integration
│   │   ├── chatController.js      # AI chatbot (Gemini)
│   │   ├── contactController.js   # Messages & reservations
│   │   ├── profileController.js   # User profile management
│   │   └── restaurantController.js# Restaurant info & status
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification (protect, optionalAuth)
│   │   ├── uploadMiddleware.js    # Multer file upload config
│   │   └── validateMiddleware.js  # Joi schema validation
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth/*
│   │   ├── userAuthRoutes.js      # /api/users/auth/*
│   │   ├── menuRoutes.js          # /api/menu/*
│   │   ├── orderRoutes.js         # /api/orders/*
│   │   ├── paymentRoutes.js       # /api/payment/*
│   │   ├── chatRoutes.js          # /api/chat/*
│   │   ├── contactRoutes.js       # /api/contact/*
│   │   ├── profileRoutes.js       # /api/users/profile/*
│   │   └── restaurantRoutes.js    # /api/restaurant/*
│   ├── utils/
│   │   ├── socket.js              # Socket.IO initialization
│   │   └── timeUtils.js           # Restaurant open/closed logic
│   ├── scripts/
│   │   ├── seed-db.js             # Database seeder
│   │   ├── check-db.js            # DB connection tester
│   │   └── ...migration scripts
│   ├── saphire_db/
│   │   └── schema.sql             # SQL schema definition
│   ├── uploads/                   # Uploaded images storage
│   ├── app.js                     # Express server entry point
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   │   ├── manifest.json          # PWA manifest (customer)
│   │   ├── manifest-admin.json    # PWA manifest (admin)
│   │   ├── notification.mp3       # Notification sound
│   │   └── ...logos
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Main navigation with auth
│   │   │   ├── Footer.jsx         # Site footer
│   │   │   ├── CartModal.jsx      # Shopping cart sidebar
│   │   │   ├── CartWidget.jsx     # Cart floating button
│   │   │   ├── ChatWidget.jsx     # AI chatbot widget
│   │   │   ├── AdminSidebar.jsx   # Admin panel sidebar
│   │   │   ├── AdminNavbar.jsx    # Admin panel topbar
│   │   │   ├── CustomCursor.jsx   # Custom cursor effect
│   │   │   ├── SmoothScroll.jsx   # Lenis smooth scroll
│   │   │   ├── ThemeToggle.jsx    # Dark/light theme toggle
│   │   │   ├── SEO.jsx            # React Helmet SEO
│   │   │   └── PagePlaceholder.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Landing page with parallax
│   │   │   ├── Menu.jsx           # Menu browsing + cart
│   │   │   ├── About.jsx          # Restaurant story
│   │   │   ├── Gallery.jsx        # Photo gallery
│   │   │   ├── Contact.jsx        # Contact form + map
│   │   │   ├── Login.jsx          # User login/register
│   │   │   ├── Profile.jsx        # User profile editor
│   │   │   ├── Orders.jsx         # Order history + cancel
│   │   │   ├── AdminLogin.jsx     # Admin authentication
│   │   │   └── AdminDashboard.jsx # Full admin panel (971 lines)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # User auth state
│   │   │   ├── CartContext.jsx    # Shopping cart state
│   │   │   ├── RestaurantContext.jsx # Restaurant status
│   │   │   ├── SocketContext.jsx  # WebSocket connection
│   │   │   └── ThemeContext.jsx   # Dark/light mode
│   │   ├── hooks/
│   │   │   └── useNotifications.jsx # Browser + toast notifications
│   │   ├── utils/
│   │   │   └── api.js             # Axios instance + interceptors
│   │   ├── App.jsx                # Root component + routing
│   │   └── main.jsx               # Entry point + providers
│   ├── index.html
│   ├── vite.config.js             # Vite + PWA config
│   ├── tailwind.config.js         # Custom design system
│   └── package.json
├── netlify.toml                    # Netlify deployment config
└── .gitignore
```

---

## API Endpoints

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for the complete API reference.

### Quick Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Admin login | Public |
| POST | `/api/users/auth/register` | User registration | Public |
| POST | `/api/users/auth/login` | User login | Public |
| POST | `/api/users/auth/google` | Google OAuth | Public |
| GET | `/api/users/profile` | Get user profile | JWT |
| PUT | `/api/users/profile` | Update user profile | JWT |
| GET | `/api/menu/categories` | List categories | Public |
| GET | `/api/menu/items` | List available items | Public |
| POST | `/api/orders` | Place order | JWT |
| POST | `/api/orders/cod` | Place COD order | Optional |
| GET | `/api/orders/my-orders` | User order history | JWT |
| POST | `/api/payment/create-order` | Create Razorpay order | Optional |
| POST | `/api/payment/verify` | Verify payment | Optional |
| POST | `/api/contact` | Submit message | Public |
| GET | `/api/restaurant` | Get restaurant info | Public |
| POST | `/api/chat` | AI chatbot | Public |

---

## Screenshots

> 📸 Screenshots are available in the deployed application:
> - **Frontend**: [https://moonstonecafe.netlify.app](https://moonstonecafe.netlify.app)
> - **Admin Panel**: `/admin/login`

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the ISC License.

---

<p align="center">
  <strong>Built with ❤️ for Moonstone Café</strong><br/>
  <em>A culinary journey through spices and silk.</em>
</p>
