# 🛠️ Developer Guide — Moonstone Café

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Project Architecture](#project-architecture)
- [Coding Conventions](#coding-conventions)
- [Key Workflows](#key-workflows)
- [Debugging Guide](#debugging-guide)
- [Git Workflow](#git-workflow)
- [Common Issues & Solutions](#common-issues--solutions)
- [Security Considerations](#security-considerations)
- [Performance Optimization](#performance-optimization)
- [Scalability Roadmap](#scalability-roadmap)

---

## Quick Start

```bash
# Clone the repository
git clone <repo-url>
cd lokii1

# Backend
cd backend
npm install
cp .env.example .env  # Configure your DB and API keys
node setup_missing_tables.js
node scripts/seed-db.js
npm run dev            # Runs on :5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev            # Runs on :5173
```

**Important**: For local development, update the API URLs:
1. `frontend/src/utils/api.js` → Change base URL to `http://localhost:5000/api`
2. `frontend/src/context/SocketContext.jsx` → Change to `http://localhost:5000`

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 18.x | Runtime |
| npm | ≥ 9.x | Package manager |
| MySQL | 8.0+ | Database (local or TiDB Cloud) |
| Git | Any | Version control |

**Optional:**
- Razorpay Test Account (for payment testing)
- Google Cloud Console project (for OAuth)
- Google Gemini API key (for chatbot)

---

## Local Development Setup

### 1. Database Setup

**Option A: TiDB Cloud (Recommended)**
- Create a free serverless cluster at [tidbcloud.com](https://tidbcloud.com)
- Copy the connection details to your `.env`

**Option B: Local MySQL**
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE moonstone_cafe;"

# Set .env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=moonstone_cafe
DB_SSL=false
```

### 2. Run Migrations & Seed

```bash
cd backend
node setup_missing_tables.js   # Creates users + orders tables
node scripts/seed-db.js        # Seeds admin user + categories
```

### 3. Test the Backend

```bash
# Start server
npm run dev

# Test root endpoint
curl http://localhost:5000
# Expected: { "message": "Moonstone Café Server is Running", "timestamp": "..." }

# Test admin login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` — the app should load.

---

## Project Architecture

### Backend: MVC-like Pattern

```
Request → Route → [Middleware] → Controller → Database → Response
```

- **Routes** (`routes/`): Define HTTP method + path + middleware chain
- **Controllers** (`controllers/`): Business logic, DB queries, socket events
- **Middleware** (`middleware/`): Auth verification, validation, file upload
- **Utils** (`utils/`): Shared helpers (socket, time calculations)
- **Config** (`config/`): Database connection pool

### Frontend: Context + Pages Pattern

```
Provider Tree → Router → Pages → Components
                              ↕
                          Context (State)
                              ↕
                         API (api.js)
```

- **Context** (`context/`): Global state management (Auth, Cart, Restaurant, Socket, Theme)
- **Pages** (`pages/`): Route-level components (10 pages)
- **Components** (`components/`): Reusable UI elements (12 components)
- **Hooks** (`hooks/`): Custom React hooks (notifications)
- **Utils** (`utils/`): API client with interceptors

---

## Coding Conventions

### General
- **Filenames**: PascalCase for components (`CartModal.jsx`), camelCase for utilities (`timeUtils.js`)
- **Functions**: `camelCase` for all functions
- **Constants**: `UPPER_SNAKE_CASE` for constants (e.g., `IMAGES` array in Gallery)
- **CSS**: TailwindCSS utility classes exclusively (no custom CSS files except `index.css`, `App.css`)

### Backend
- Controllers export named functions: `module.exports = { functionName }`
- Database queries use parameterized queries (`?` placeholders) — **never** string concatenation
- Error handling: try/catch with `res.status(xxx).json({ message: ... })`
- JSDoc-style comments: `// @desc`, `// @route`, `// @access`

### Frontend
- Functional components with hooks only (no class components)
- Context API for state (no Redux)
- `useAuth()`, `useCart()`, `useRestaurant()`, `useSocket()` — custom hooks via context
- Toast notifications via `react-toastify` for all user feedback
- `api.js` interceptor handles auth token attachment automatically

---

## Key Workflows

### Adding a New API Endpoint

1. **Create controller** in `backend/controllers/`:
```javascript
const db = require('../config/db');

const myFunction = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM table');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { myFunction };
```

2. **Create route** in `backend/routes/`:
```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { myFunction } = require('../controllers/myController');

router.get('/', protect, myFunction);
module.exports = router;
```

3. **Mount route** in `backend/app.js`:
```javascript
const myRoutes = require('./routes/myRoutes');
app.use('/api/myresource', myRoutes);
```

### Adding a New Frontend Page

1. Create `frontend/src/pages/MyPage.jsx`
2. Add route in `App.jsx`:
```jsx
import MyPage from './pages/MyPage';
// Inside <Routes>:
<Route path="/mypage" element={<MyPage />} />
```
3. Add nav link in `Navbar.jsx` if needed

### Adding a Database Table

1. Write the CREATE TABLE SQL
2. Add it to `setup_missing_tables.js` or create a new migration script
3. Run the script: `node scripts/my_migration.js`

---

## Debugging Guide

### Backend Debugging

```bash
# Start with nodemon (auto-restart on changes)
npm run dev

# Check DB connection
node scripts/check-db.js

# Check environment variables
node -e "require('dotenv').config(); console.log(process.env.DB_HOST)"
```

**Common Debug Points:**
- `authMiddleware.js:29` — Auth errors logged here
- `paymentController.js:29` — Razorpay errors logged with full stack
- `chatController.js:63` — AI API key attempts logged
- Socket connections logged at `socket.js:13`

### Frontend Debugging

- **React DevTools**: Install browser extension for component tree inspection
- **Network Tab**: Check API calls, look for 401/403/500 errors
- **localStorage**: Check `userToken`, `adminToken`, `cart`, `theme` values
- **Console**: Socket connection events logged with emoji prefixes (⚡, ❌, 🔄)

### Token Debugging

```javascript
// Decode JWT in browser console
const token = localStorage.getItem('userToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload); // { id, name, email, iat, exp }
```

---

## Git Workflow

### Branch Strategy
- `main` — Production-ready code
- `feature/*` — New features
- `fix/*` — Bug fixes
- `hotfix/*` — Urgent production fixes

### Commit Convention
```
feat: add reservation management to admin dashboard
fix: resolve token attachment for cancel order API
refactor: extract time utils to separate module
docs: update API documentation
style: improve mobile menu animations
```

### Pre-commit Checklist
- [ ] `npm run lint` passes (frontend)
- [ ] No hardcoded secrets in committed code
- [ ] API URLs point to environment variables (not localhost)
- [ ] New endpoints have proper auth middleware
- [ ] Database queries use parameterized inputs

---

## Common Issues & Solutions

### 1. "CORS Error" in browser
**Cause**: Backend CORS not configured for frontend URL.
**Fix**: `cors()` is currently set to allow all origins. For production, specify exact origin.

### 2. "Not authorized, token missing"
**Cause**: JWT token not being sent with request.
**Fix**: Check that `localStorage.getItem('userToken')` returns a valid token. Check `api.js` interceptor logic.

### 3. "Cannot cancel order with status: preparing"
**Cause**: Only `pending` orders can be cancelled.
**Fix**: This is intentional business logic. Order must be in `pending` status.

### 4. Frontend shows blank page after build
**Cause**: SPA routing not configured on hosting.
**Fix**: Ensure `_redirects` file exists in `public/` with `/* /index.html 200`, or use `netlify.toml` redirects.

### 5. Socket connection fails
**Cause**: WebSocket URL mismatch.
**Fix**: Ensure `SocketContext.jsx` points to correct backend URL (no `/api` suffix).

### 6. Images not loading
**Cause**: Image URLs are relative paths (`/uploads/...`) but frontend is on different domain.
**Fix**: Menu.jsx and AdminDashboard.jsx prepend `https://moonstonecafe.onrender.com` to relative paths.

---

## Security Considerations

### Current Security Measures ✅
- **Helmet.js**: Sets security headers (XSS, HSTS, etc.)
- **bcrypt**: Password hashing with salt rounds (10)
- **JWT**: Stateless authentication with 30-day expiry
- **Parameterized queries**: SQL injection prevention
- **Multer file filter**: Only image types allowed (5MB limit)
- **Joi validation**: Input validation for contact/reservation/menu forms
- **HMAC-SHA256**: Razorpay payment signature verification

### Known Security Gaps ⚠️

1. **`PUT /api/restaurant` is unprotected** — Anyone can update restaurant info. Add `protect` middleware.
2. **`POST /api/auth/register-seed` is public** — Admin registration endpoint should be disabled in production.
3. **CORS is set to `*`** — Should restrict to frontend domain in production.
4. **Socket.IO CORS is `*`** — Should restrict to frontend domain.
5. **No rate limiting** — API is vulnerable to brute-force attacks. Add `express-rate-limit`.
6. **No CSRF protection** — JWT mitigates this for APIs, but consider for cookie-based flows.
7. **JWT secret is weak** — `supersecretluxurykey123` should be a strong random string.
8. **Secrets in `.env` committed to repo** — `.env` should be in `.gitignore` (it is, but actual values visible in codebase).
9. **No input sanitization** — XSS possible via stored messages. Add `xss-clean` or similar.
10. **No admin role verification** — `protect` middleware doesn't check if user is actually admin for admin routes.
11. **Razorpay key hardcoded in frontend** — `CartModal.jsx` has the test key inline.
12. **Google OAuth Client ID is placeholder** — `YOUR_GOOGLE_CLIENT_ID` needs real value.

### Recommended Fixes
```javascript
// 1. Protect restaurant route
router.put('/', protect, updateRestaurantInfo);

// 2. Add rate limiting
const rateLimit = require('express-rate-limit');
app.use('/api/auth', rateLimit({ windowMs: 15*60*1000, max: 20 }));

// 3. Add admin check middleware
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({message:'Forbidden'});
    next();
};

// 4. Restrict CORS
app.use(cors({ origin: 'https://moonstonecafe.netlify.app' }));
```

---

## Performance Optimization

### Frontend
- ✅ PWA with Workbox caching (fonts, API responses)
- ✅ Vite code splitting (lazy route loading possible)
- ✅ Image loading from CDN (Unsplash)
- ⚠️ **AdminDashboard.jsx is 971 lines** — Should be split into sub-components
- ⚠️ No `React.lazy()` or `Suspense` for route-level code splitting
- ⚠️ No image optimization (no next-gen formats, no responsive sizes)
- ⚠️ External Unsplash images not optimized for performance

### Backend
- ✅ MySQL connection pooling (10 connections)
- ✅ Promise-based async/await throughout
- ⚠️ No response caching (Redis)
- ⚠️ No pagination on list endpoints (`GET /orders/admin/all` returns ALL orders)
- ⚠️ No database indexing strategy beyond PKs and UKs
- ⚠️ `fetchData()` in AdminDashboard makes 5 parallel API calls on every tab switch

### Recommendations
1. Add `React.lazy()` for `AdminDashboard` (68KB component)
2. Add pagination: `GET /orders/admin/all?page=1&limit=20`
3. Split `AdminDashboard.jsx` into: `OverviewTab`, `OrdersTab`, `MenuTab`, `MessagesTab`, `InfoTab`
4. Add Redis caching for `GET /api/menu/items` and `GET /api/restaurant`
5. Add database indexes on `orders.user_id`, `orders.status`, `messages.is_read`

---

## Scalability Roadmap

### Phase 1: Code Quality
- [ ] Split AdminDashboard into sub-components
- [ ] Add TypeScript types
- [ ] Add unit tests (Jest + React Testing Library)
- [ ] Add API integration tests

### Phase 2: Security Hardening
- [ ] Add `adminOnly` middleware for admin routes
- [ ] Protect `PUT /api/restaurant` endpoint
- [ ] Remove `register-seed` endpoint
- [ ] Add rate limiting
- [ ] Add input sanitization

### Phase 3: Performance
- [ ] Implement pagination for all list endpoints
- [ ] Add Redis caching layer
- [ ] Implement lazy loading for routes
- [ ] Optimize image delivery (compress, WebP, responsive)

### Phase 4: Features
- [ ] Email notifications (Nodemailer)
- [ ] SMS notifications (Twilio)
- [ ] Multi-branch restaurant support
- [ ] Inventory management
- [ ] Loyalty points / rewards system
- [ ] Table QR code ordering
- [ ] Kitchen display system (KDS)
- [ ] Analytics dashboard with charts
- [ ] Export orders to CSV/PDF

### Phase 5: Infrastructure
- [ ] Docker containerization
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Database migrations tool (Knex.js or Prisma)
- [ ] Logging service (Winston + ELK)
- [ ] Health check endpoints
- [ ] Load balancing setup
