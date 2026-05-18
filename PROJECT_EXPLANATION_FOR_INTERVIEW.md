# 🎓 Project Explanation for Interviews — Moonstone Café

---

## 1. College Viva Explanation

### "Tell me about your project."

> **Moonstone Café** is a **full-stack web application** for a multicuisine restaurant. I built it using **React.js** for the frontend, **Node.js with Express** for the backend, and **MySQL** (hosted on TiDB Cloud) for the database.
>
> The application has **two interfaces**:
> 1. A **customer-facing website** where users can browse the menu, add items to cart, place orders with **online payment (Razorpay)** or **Cash on Delivery**, view their order history, and manage their profiles.
> 2. An **admin dashboard** where the restaurant owner can manage menu items, track orders in real-time, update order/payment statuses, read customer messages, and control restaurant operations (open/close).
>
> Key technical highlights include:
> - **JWT-based authentication** with separate flows for customers and admins
> - **Google OAuth** integration for easy sign-up
> - **Real-time notifications** using **Socket.IO** — when a new order comes in, the admin gets instant browser + sound notifications
> - **Razorpay payment gateway** with HMAC signature verification
> - **AI-powered chatbot** using Google Gemini API that knows the menu and restaurant info
> - **PWA (Progressive Web App)** — the app can be installed on mobile devices
> - **Responsive design** using TailwindCSS with a custom "Heritage" design system

### "What problem does it solve?"

> Traditional restaurants rely on phone calls and manual note-taking for orders. This system digitizes the entire workflow — customers can browse, order, and pay online. The admin gets real-time order updates and can manage everything from a single dashboard. It reduces human error, speeds up order processing, and provides a professional online presence.

### "What was the most challenging part?"

> The most challenging part was implementing the **real-time order system**. I had to integrate Socket.IO so that when a customer places an order, the admin dashboard instantly receives a notification — with sound, browser notification, and in-app toast. I also had to handle the **dual authentication system** where both admin tokens and user tokens work across shared middleware, using a request interceptor in Axios that intelligently routes the correct token based on the API endpoint.

### "What would you improve?"

> 1. **Split the AdminDashboard component** — it's currently 971 lines in a single file. I'd break it into separate tab components.
> 2. **Add pagination** to the orders and menu listing APIs for better performance at scale.
> 3. **Add role-based middleware** — currently the `protect` middleware doesn't verify if a user has admin privileges for admin-only routes.
> 4. **Add email/SMS notifications** for order status updates to customers.

---

## 2. Internship Interview Explanation

### "Walk me through the architecture."

> The project follows a **client-server architecture** with a **REST API** pattern:
>
> **Frontend (React + Vite)** → Deployed on **Netlify**
> - Built with React 18 and Vite for fast development
> - Uses **React Context API** for state management (5 contexts: Auth, Cart, Restaurant, Socket, Theme)
> - **Axios** with request interceptors for API communication
> - **Socket.IO client** for real-time updates
> - **Framer Motion** for animations, **TailwindCSS** for styling
> - **react-router-dom v7** for client-side routing (10 routes)
>
> **Backend (Express 5)** → Deployed on **Render**
> - RESTful API with 9 route modules and 9 controllers
> - **JWT authentication** with dual-table lookup (users + admin_users)
> - **Middleware pipeline**: Helmet (security) → CORS → Body parser → Route-specific (auth, validation, upload)
> - **Socket.IO server** for broadcasting events (new orders, messages, cancellations)
> - **Multer** for file uploads (menu images, user avatars)
> - **Joi** for request body validation
>
> **Database (MySQL on TiDB Cloud)**
> - 8 tables with foreign key relationships
> - Connection pooling with mysql2 promise API
> - Parameterized queries for SQL injection prevention

### "How does the payment flow work?"

> I integrated **Razorpay** using their server-to-server flow:
>
> 1. When the user clicks "Pay," the frontend sends the amount to `POST /api/payment/create-order`
> 2. The backend creates a Razorpay order using their SDK and returns the `order_id`
> 3. The frontend opens the Razorpay checkout modal with this `order_id`
> 4. After successful payment, Razorpay returns `razorpay_order_id`, `razorpay_payment_id`, and a `razorpay_signature`
> 5. The frontend sends all three to `POST /api/payment/verify`
> 6. The backend verifies the signature using **HMAC-SHA256**: it concatenates `order_id|payment_id`, hashes with the secret, and compares with the received signature
> 7. If valid, the order is saved to the database with `payment_status: 'paid'`
>
> This prevents tampering because only Razorpay's server can generate a valid signature.

### "How do you handle authentication?"

> I use **JWT (JSON Web Tokens)** with a 30-day expiry:
>
> - **Registration**: Password is hashed with `bcrypt` (10 salt rounds) and stored. A JWT is generated with `{ id, name, email }`.
> - **Login**: Password is compared using `bcrypt.compare()`. On match, a new JWT is issued.
> - **Google OAuth**: The frontend gets a credential token from Google, sends it to the backend, which verifies it using `google-auth-library`. If the user doesn't exist, they're auto-registered.
> - **Token Storage**: Tokens are stored in `localStorage` — `userToken` for customers, `adminToken` for admin.
> - **Middleware**: The `protect` middleware extracts the Bearer token, verifies it with `jwt.verify()`, then does a database lookup in BOTH the `users` and `admin_users` tables to handle both user types.
> - **Smart Interceptor**: The Axios interceptor in `api.js` automatically picks the right token based on the API route being called.

### "What real-time features did you implement?"

> I used **Socket.IO** for bidirectional communication:
>
> **Server-side** (`utils/socket.js`):
> - Initializes Socket.IO on the HTTP server
> - Exposes `emitEvent(eventName, data)` utility
> - Used in `orderController.js`, `contactController.js`, and `restaurantController.js`
>
> **Client-side** (`SocketContext.jsx`):
> - Connects to backend via WebSocket (with polling fallback)
> - Provides socket instance to all components via Context
>
> **Events**:
> - `newOrder` → Admin gets notified when customer places order
> - `newMessage` → Admin gets notified of new contact messages
> - `newReservation` → Admin gets notified of new reservations
> - `orderCancelled` → Admin's order list updates when user cancels
> - `restaurantUpdate` → All clients refresh restaurant open/close status
>
> On the admin side, the `useNotifications` custom hook triggers:
> 1. An audio alert (`notification.mp3`)
> 2. A browser Notification (with permission)
> 3. A react-toastify in-app toast

---

## 3. Placement Interview Explanation

### "Describe the database design."

> The database has **8 tables** in MySQL:
>
> - **`admin_users`** and **`users`**: Separated by design — admin credentials don't mix with customer data. Users can have `password_hash` (email login) or `google_id` (OAuth login), or both.
> - **`categories`** → **`menu_items`**: One-to-many relationship. Each menu item belongs to one category. `ON DELETE SET NULL` ensures items aren't lost if a category is removed.
> - **`orders`**: References `users` via `user_id` (nullable for guest COD orders). Uses JSON columns for `items` and `customer_details` to store flexible order data without a separate `order_items` junction table.
> - **`messages`** and **`reservations`**: Standalone tables for customer interactions, no FK dependencies.
> - **`restaurant_info`**: Singleton table (one row) storing restaurant metadata, operating hours, and mode. Used by the frontend and the AI chatbot for context.
>
> **Design decisions**:
> - JSON columns for orders reduce JOINs for read-heavy operations
> - Separate admin/user tables enable different auth flows
> - `operating_mode` field (`auto`/`forced_open`/`forced_closed`) provides flexible restaurant control

### "How would you scale this application?"

> **Immediate improvements**:
> 1. **Add pagination** — `GET /orders/admin/all` currently returns all orders. At 10,000+ orders, this becomes a performance bottleneck.
> 2. **Add Redis caching** — Cache frequently-read data like menu items and restaurant info.
> 3. **Split the monolithic AdminDashboard** — 971-line component should be broken into lazy-loaded sub-components.
>
> **Medium-term**:
> 4. **Database indexing** — Add indexes on `orders.user_id`, `orders.status`, `orders.created_at`, `messages.is_read`.
> 5. **API rate limiting** — Prevent abuse with `express-rate-limit`.
> 6. **CDN for images** — Move uploaded images to S3/Cloudinary instead of local disk storage.
>
> **Long-term**:
> 7. **Microservices** — Split order processing, payment, and notification into separate services.
> 8. **Message queue** — Use RabbitMQ/Bull for order processing pipeline.
> 9. **Horizontal scaling** — The stateless JWT design already supports multiple server instances behind a load balancer.
> 10. **Database read replicas** — For high-read scenarios, add MySQL read replicas.

### "What are the security concerns?"

> I've identified and can discuss these honestly:
>
> **What I implemented well**:
> - bcrypt for password hashing
> - Parameterized SQL queries (no injection risk)
> - Helmet.js for HTTP security headers
> - HMAC signature verification for payments
> - JWT for stateless auth
> - Multer file type validation
> - Joi schema validation for input
>
> **What needs improvement**:
> 1. The `PUT /api/restaurant` route lacks authentication — anyone can modify restaurant info. This needs the `protect` middleware.
> 2. The admin seed route (`POST /api/auth/register-seed`) is publicly accessible — it should be disabled after initial setup.
> 3. CORS and Socket.IO are configured with `origin: *` — should be restricted to the frontend domain.
> 4. There's no admin role verification — the `protect` middleware checks if a valid token exists but doesn't verify admin privileges for admin-only endpoints.
> 5. No rate limiting on login endpoints — vulnerable to brute force.
>
> I'm transparent about these because identifying security gaps is as important as implementing security features.

### "What technologies did you learn from this project?"

> - **Socket.IO** for real-time bidirectional communication
> - **Razorpay SDK** for payment gateway integration and signature verification
> - **Google OAuth 2.0** flow with ID token verification
> - **Framer Motion** for React animations (scroll-linked, exit animations)
> - **PWA architecture** with service workers and Workbox caching strategies
> - **TiDB Cloud** for serverless MySQL hosting
> - **Deployment pipeline** — Netlify for static frontend, Render for Node.js backend
> - **Multi-role authentication** with smart token routing

---

## 4. Project Summary Card

| Attribute | Details |
|-----------|---------|
| **Project Name** | Moonstone Café |
| **Type** | Full-Stack Restaurant Management Platform |
| **Frontend** | React 18, Vite, TailwindCSS, Framer Motion |
| **Backend** | Node.js, Express 5, Socket.IO |
| **Database** | MySQL (TiDB Cloud) — 8 tables |
| **Authentication** | JWT + Google OAuth 2.0 |
| **Payments** | Razorpay (HMAC-SHA256 verification) |
| **AI Feature** | Google Gemini chatbot concierge |
| **Real-time** | Socket.IO (orders, messages, status) |
| **PWA** | Service worker, offline caching, installable |
| **Hosting** | Netlify (frontend) + Render (backend) |
| **Lines of Code** | ~5,000+ (frontend) + ~1,500+ (backend) |
| **Key Pages** | Home, Menu, About, Gallery, Contact, Login, Profile, Orders, Admin |
| **Admin Features** | Dashboard, Order mgmt, Menu CRUD, Messages, Restaurant config |

---

## 5. User Guide

### For Customers

1. **Browse**: Visit the homepage → Click "Explore Menu" or navigate to "The Collection"
2. **Login**: Click "Login" → Register with email/password or use Google sign-in
3. **Order**: Browse menu → Click "Add to Order" → Adjust quantities → Click cart icon
4. **Checkout**: Fill delivery details (auto-filled from profile) → Choose "Pay Online" or "Cash on Delivery" → Submit
5. **Track**: Go to "Order History" → View status (Pending → Confirmed → Preparing → Out for Delivery → Delivered)
6. **Cancel**: On the Orders page, click "Cancel Order" on any pending order
7. **Profile**: Go to Profile → Edit name, phone, address, upload avatar → Save

### For Admin

1. **Login**: Navigate to `/admin/login` → Enter admin credentials
2. **Dashboard**: View overview stats (total orders, pending, menu items, unread messages)
3. **Orders Tab**: View all orders → Update status via dropdown → Update payment status
4. **Menu Tab**: Add new items (with image upload) → Edit/Delete items → Toggle availability
5. **Messages Tab**: Read customer messages → Mark as read
6. **Info Tab**: Update restaurant details → Control open/close mode (Auto/Forced Open/Forced Closed)
7. **Notifications**: Keep the dashboard open — real-time sound + browser alerts for new orders
