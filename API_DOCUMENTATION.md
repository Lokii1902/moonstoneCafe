# 📡 API Documentation — Moonstone Café

> Base URL: `https://moonstonecafe.onrender.com/api`

---

## Authentication Headers

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

Tokens are stored in `localStorage` as `userToken` (customers) or `adminToken` (admin).

---

## 1. Admin Authentication

### POST `/api/auth/login`
**Purpose**: Authenticate admin user and receive JWT token.

| Field | Details |
|-------|---------|
| **Access** | Public |
| **Request Body** | `{ "username": "admin", "password": "password123" }` |
| **Success (200)** | `{ "id": 1, "username": "admin", "token": "eyJhbG..." }` |
| **Error (401)** | `{ "message": "Invalid credentials" }` |

### POST `/api/auth/register-seed`
**Purpose**: One-time admin user creation (should be disabled in production).

| Field | Details |
|-------|---------|
| **Access** | Public ⚠️ |
| **Request Body** | `{ "username": "admin", "password": "mypassword" }` |
| **Success (201)** | `{ "message": "Admin created", "id": 1 }` |

---

## 2. User Authentication

### POST `/api/users/auth/register`
**Purpose**: Register a new customer account.

| Field | Details |
|-------|---------|
| **Access** | Public |
| **Request Body** | `{ "name": "John", "email": "john@mail.com", "password": "pass123" }` |
| **Success (201)** | `{ "id": 5, "name": "John", "email": "john@mail.com", "token": "eyJ..." }` |
| **Error (400)** | `{ "message": "User already exists" }` |

### POST `/api/users/auth/login`
**Purpose**: Login with email and password.

| Field | Details |
|-------|---------|
| **Access** | Public |
| **Request Body** | `{ "email": "john@mail.com", "password": "pass123" }` |
| **Success (200)** | `{ "id": 5, "name": "John", "email": "...", "phone": "", "address": "", "token": "eyJ..." }` |
| **Error (401)** | `{ "message": "Invalid credentials" }` |
| **Error (400)** | `{ "message": "User signed up with an external provider..." }` |

### POST `/api/users/auth/google`
**Purpose**: Login or register via Google OAuth.

| Field | Details |
|-------|---------|
| **Access** | Public |
| **Request Body** | `{ "credential": "<google_id_token>" }` |
| **Success (200)** | `{ "id": 5, "name": "...", "email": "...", "avatar_url": "...", "token": "eyJ..." }` |
| **Error (401)** | `{ "message": "Invalid Google token" }` |

---

## 3. User Profile

### GET `/api/users/profile`
**Purpose**: Get the authenticated user's profile.

| Field | Details |
|-------|---------|
| **Access** | JWT Required |
| **Success (200)** | `{ "id": 5, "name": "John", "email": "...", "phone": "...", "address": "...", "avatar_url": "...", "role": "user", "created_at": "..." }` |
| **Error (404)** | `{ "message": "User not found" }` |

### PUT `/api/users/profile`
**Purpose**: Update user profile information.

| Field | Details |
|-------|---------|
| **Access** | JWT Required |
| **Request Body** | `{ "name": "John", "email": "...", "phone": "+91...", "address": "...", "avatar_url": "/uploads/dish-123.jpg" }` |
| **Success (200)** | `{ "message": "Profile updated successfully" }` |

---

## 4. Menu

### GET `/api/menu/categories`
**Purpose**: Get all food categories.

| Field | Details |
|-------|---------|
| **Access** | Public |
| **Success (200)** | `[{ "id": 1, "name": "Biryani", "slug": "biryani", "sort_order": 1 }, ...]` |

### GET `/api/menu/items`
**Purpose**: Get all available menu items (optionally filtered by category).

| Field | Details |
|-------|---------|
| **Access** | Public |
| **Query Params** | `?category_id=1` (optional) |
| **Success (200)** | `[{ "id": 1, "name": "Chicken Biryani", "price": 250.00, "is_veg": false, "category_name": "Biryani", ... }]` |

### GET `/api/menu/admin/items`
**Purpose**: Get ALL menu items including unavailable (admin view).

| Field | Details |
|-------|---------|
| **Access** | JWT Required (Admin) |
| **Success (200)** | Array of all menu items with `is_available` field |

### POST `/api/menu/categories`
**Purpose**: Create a new category.

| Field | Details |
|-------|---------|
| **Access** | JWT Required (Admin) |
| **Request Body** | `{ "name": "Starters", "slug": "starters", "image_url": "...", "sort_order": 9 }` |
| **Success (201)** | `{ "id": 9, "name": "Starters", "slug": "starters" }` |

### POST `/api/menu/items`
**Purpose**: Create a new menu item.

| Field | Details |
|-------|---------|
| **Access** | JWT Required (Admin) |
| **Request Body** | `{ "category_id": 1, "name": "Mutton Biryani", "description": "...", "price": 350, "is_veg": false, "image_url": "/uploads/dish-123.jpg" }` |
| **Success (201)** | `{ "id": 15, "name": "Mutton Biryani" }` |

### PUT `/api/menu/items/:id`
**Purpose**: Update an existing menu item.

| Field | Details |
|-------|---------|
| **Access** | JWT Required (Admin) |
| **URL Params** | `:id` — Menu item ID |
| **Request Body** | Full item object with updated fields |
| **Success (200)** | `{ "message": "Item updated" }` |

### DELETE `/api/menu/items/:id`
**Purpose**: Delete a menu item.

| Field | Details |
|-------|---------|
| **Access** | JWT Required (Admin) |
| **URL Params** | `:id` — Menu item ID |
| **Success (200)** | `{ "message": "Item deleted" }` |

---

## 5. Orders

### POST `/api/orders`
**Purpose**: Place a new order (authenticated users only).

| Field | Details |
|-------|---------|
| **Access** | JWT Required |
| **Request Body** | `{ "items": [{ "id": 1, "name": "...", "price": 250, "quantity": 2 }], "total_price": 500, "customer_details": { "name": "...", "phone": "...", "address": "..." } }` |
| **Success (201)** | `{ "message": "Order placed", "orderId": 42 }` |
| **Error (403)** | `{ "message": "Order failed: Restaurant is currently closed...", "is_closed": true }` |
| **Socket Event** | Emits `newOrder` to all connected clients |

### POST `/api/orders/cod`
**Purpose**: Place a Cash on Delivery order (guests allowed).

| Field | Details |
|-------|---------|
| **Access** | Optional Auth |
| **Request Body** | Same as `/api/orders` |
| **Success (201)** | `{ "message": "Order placed via COD", "orderId": 43 }` |

### GET `/api/orders/my-orders`
**Purpose**: Get order history for the authenticated user.

| Field | Details |
|-------|---------|
| **Access** | JWT Required |
| **Success (200)** | Array of order objects sorted by `created_at DESC` |

### PUT `/api/orders/:id/cancel`
**Purpose**: Cancel a pending order.

| Field | Details |
|-------|---------|
| **Access** | JWT Required (order owner or admin) |
| **Success (200)** | `{ "success": true, "message": "Order cancelled successfully", "orderId": 42, "newStatus": "cancelled" }` |
| **Error (400)** | `{ "message": "Cannot cancel order with status: preparing" }` |
| **Error (403)** | `{ "message": "Not authorized to cancel this order" }` |
| **Socket Event** | Emits `orderCancelled` |

### GET `/api/orders/admin/all`
**Purpose**: Get all orders with user info (admin).

| Field | Details |
|-------|---------|
| **Access** | JWT Required (Admin) |
| **Success (200)** | Array with joined `user_name` and `user_email` fields |

### PUT `/api/orders/:id/status`
**Purpose**: Update order status (admin).

| Field | Details |
|-------|---------|
| **Access** | JWT Required (Admin) |
| **Request Body** | `{ "status": "preparing" }` |
| **Allowed Values** | `pending`, `confirmed`, `preparing`, `out for delivery`, `delivered`, `cancelled` |

### PUT `/api/orders/:id/payment-status`
**Purpose**: Update payment status (admin).

| Field | Details |
|-------|---------|
| **Access** | JWT Required (Admin) |
| **Request Body** | `{ "payment_status": "paid" }` |
| **Allowed Values** | `pending`, `paid`, `failed`, `refunded` |

---

## 6. Payments (Razorpay)

### POST `/api/payment/create-order`
**Purpose**: Create a Razorpay order for payment initiation.

| Field | Details |
|-------|---------|
| **Access** | Optional Auth |
| **Request Body** | `{ "amount": 500 }` (amount in INR) |
| **Success (201)** | Razorpay order object `{ "id": "order_xxx", "amount": 50000, "currency": "INR", ... }` |

### POST `/api/payment/verify`
**Purpose**: Verify Razorpay payment signature and save order.

| Field | Details |
|-------|---------|
| **Access** | Optional Auth |
| **Request Body** | `{ "razorpay_order_id": "...", "razorpay_payment_id": "...", "razorpay_signature": "...", "order_details": { "items": [...], "total_price": 500, "customer_details": {...} } }` |
| **Success (201)** | `{ "message": "Payment verified and order placed", "orderId": 44 }` |
| **Error (400)** | `{ "message": "Invalid payment signature" }` |

---

## 7. Contact & Reservations

### POST `/api/contact`
**Purpose**: Submit a contact message.

| Field | Details |
|-------|---------|
| **Access** | Public |
| **Validation** | Joi schema: name (2-100), email (valid), phone (10-15 digits), message (min 10) |
| **Request Body** | `{ "name": "Jane", "email": "jane@mail.com", "phone": "9876543210", "subject": "Feedback", "message": "Great food!" }` |
| **Success (201)** | `{ "message": "Message sent successfully" }` |
| **Socket Event** | Emits `newMessage` |

### GET `/api/contact`
**Purpose**: Get all contact messages (admin).

| Field | Details |
|-------|---------|
| **Access** | JWT Required (Admin) |
| **Success (200)** | Array of message objects with `is_read` field |

### PUT `/api/contact/:id/read`
**Purpose**: Mark a message as read.

| Field | Details |
|-------|---------|
| **Access** | JWT Required (Admin) |
| **Success (200)** | `{ "message": "Message marked as read" }` |

### POST `/api/contact/reservations`
**Purpose**: Submit a table reservation.

| Field | Details |
|-------|---------|
| **Access** | Public |
| **Validation** | Joi schema: name, phone, date (ISO), time, guests (1-50) |
| **Request Body** | `{ "name": "...", "phone": "...", "date": "2026-06-01", "time": "19:00", "guests": 4 }` |
| **Success (201)** | `{ "message": "Reservation request sent" }` |
| **Socket Event** | Emits `newReservation` |

### GET `/api/contact/reservations`
**Purpose**: Get all reservations (admin).

| Field | Details |
|-------|---------|
| **Access** | JWT Required (Admin) |

---

## 8. Restaurant Info

### GET `/api/restaurant`
**Purpose**: Get restaurant information and live open/closed status.

| Field | Details |
|-------|---------|
| **Access** | Public |
| **Success (200)** | `{ "name": "Moonstone Café", "address": "...", "phone": "...", "opening_hours": "...", "is_open": true, "operating_mode": "auto", ... }` |

### PUT `/api/restaurant`
**Purpose**: Update restaurant configuration.

| Field | Details |
|-------|---------|
| **Access** | Public ⚠️ (should be protected) |
| **Request Body** | `{ "name": "...", "address": "...", "phone": "...", "email": "...", "opening_hours": "...", "cuisine_type": "...", "opening_time": "17:00", "closing_time": "23:00", "operating_mode": "auto", "is_manual_closed": false, "extra_info": "..." }` |
| **Socket Event** | Emits `restaurantUpdate` |

---

## 9. AI Chatbot

### POST `/api/chat`
**Purpose**: Send a message to the AI concierge (Google Gemini).

| Field | Details |
|-------|---------|
| **Access** | Public |
| **Request Body** | `{ "message": "What biryanis do you have?" }` |
| **Success (200)** | `{ "reply": "We offer several biryanis including..." }` |
| **Fallback** | If no API keys configured: `{ "reply": "Please configure my API keys..." }` |

---

## 10. File Upload

### POST `/api/upload/image`
**Purpose**: Upload menu item image.

| Field | Details |
|-------|---------|
| **Access** | JWT Required |
| **Content-Type** | `multipart/form-data` |
| **Field Name** | `image` |
| **Max Size** | 5 MB |
| **Allowed Types** | jpeg, jpg, png, gif, webp |
| **Success (200)** | `{ "imageUrl": "/uploads/dish-1234567890-123456789.jpg" }` |

### POST `/api/upload/avatar`
**Purpose**: Upload user profile avatar.

| Field | Details |
|-------|---------|
| **Access** | JWT Required |
| **Content-Type** | `multipart/form-data` |
| **Field Name** | `avatar` |
| **Success (200)** | `{ "avatarUrl": "/uploads/dish-1234567890-123456789.jpg" }` |

---

## Error Response Format

All errors follow this structure:
```json
{
  "message": "Human-readable error description"
}
```

Server errors (500):
```json
{
  "error": "Internal Server Error",
  "details": "Technical error message"
}
```
