# 🗄️ Database Documentation — Moonstone Café

## Database Overview

| Property | Value |
|----------|-------|
| **Engine** | MySQL 8.0 (TiDB Cloud Serverless) |
| **Database Name** | `moonstone_cafe` |
| **Region** | `ap-southeast-1` (Singapore) |
| **SSL** | Enabled (`rejectUnauthorized: true`) |
| **Connection** | mysql2 promise pool (10 connections) |
| **Timezone** | UTC (`'Z'`) |

## Connection Configuration

Located in `backend/config/db.js`:
- Uses `mysql2.createPool()` with promise wrapper
- Supports `DATABASE_URL` for one-line connection strings
- Falls back to individual `DB_HOST`, `DB_USER`, etc. env vars
- Connection pool: max 10, with queue

---

## Schema — 8 Tables

### 1. `admin_users`

**Purpose**: Store admin panel credentials. Separate from regular users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Admin user ID |
| `username` | VARCHAR(50) | NOT NULL, UNIQUE | Login username |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |

**Default Seed**: `admin` / `password123` (created via `scripts/seed-db.js`)

---

### 2. `users`

**Purpose**: Store customer accounts (email/password or Google OAuth).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | User ID |
| `name` | VARCHAR(255) | NOT NULL | Display name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Email (login identifier) |
| `password_hash` | VARCHAR(255) | NULL | bcrypt hash (NULL for Google users) |
| `google_id` | VARCHAR(255) | NULL, UNIQUE | Google OAuth subject ID |
| `phone` | VARCHAR(20) | NULL | Phone number |
| `address` | TEXT | NULL | Delivery address |
| `avatar_url` | VARCHAR(500) | NULL | Profile picture URL |
| `role` | VARCHAR(50) | DEFAULT `'user'` | Role (currently: `user`) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Registration time |

**Notes**: 
- `password_hash` is NULL for Google OAuth-only users
- `google_id` is set during Google login, updated on re-login if missing
- Created via `setup_missing_tables.js` (not in original `schema.sql`)

---

### 3. `categories`

**Purpose**: Food categories for organizing the menu.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Category ID |
| `name` | VARCHAR(100) | NOT NULL | Display name |
| `slug` | VARCHAR(100) | NOT NULL, UNIQUE | URL-safe identifier |
| `image_url` | VARCHAR(500) | NULL | Category image |
| `sort_order` | INT | DEFAULT 0 | Display ordering |

**Seeded Categories** (8 total):
Biryani, Tandoori (BBQ), Shawarma, Pizza, Chinese Rice & Noodles, Burgers, Desserts, Milkshakes & Beverages

---

### 4. `menu_items`

**Purpose**: Individual food items on the menu.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Item ID |
| `category_id` | INT | FK → `categories(id)` ON DELETE SET NULL | Category reference |
| `name` | VARCHAR(150) | NOT NULL | Dish name |
| `description` | TEXT | NULL | Description of the dish |
| `price` | DECIMAL(10,2) | NOT NULL | Price in INR |
| `is_veg` | BOOLEAN | DEFAULT FALSE | Vegetarian flag |
| `image_url` | VARCHAR(500) | NULL | Dish photo URL |
| `is_available` | BOOLEAN | DEFAULT TRUE | Availability toggle |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |

**Relationships**: `category_id` → `categories.id` (ON DELETE SET NULL)

---

### 5. `orders`

**Purpose**: Customer orders with payment tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Order ID |
| `user_id` | INT | FK → `users(id)` ON DELETE SET NULL, NULL | Ordering user (NULL for guests) |
| `items` | JSON | NOT NULL | Array of ordered items `[{id, name, price, quantity}]` |
| `total_price` | DECIMAL(10,2) | NOT NULL | Total order amount |
| `customer_details` | JSON | NULL | `{name, phone, address}` |
| `payment_method` | VARCHAR(50) | DEFAULT `'cod'` | `cod` or `online` |
| `payment_status` | ENUM | DEFAULT `'pending'` | `pending`, `paid`, `failed`, `refunded` |
| `razorpay_order_id` | VARCHAR(255) | NULL | Razorpay order reference |
| `razorpay_payment_id` | VARCHAR(255) | NULL | Razorpay payment reference |
| `status` | ENUM | DEFAULT `'pending'` | `pending`, `confirmed`, `preparing`, `out for delivery`, `delivered`, `cancelled` |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Order time |

**Relationships**: `user_id` → `users.id` (ON DELETE SET NULL)

**Notes**: 
- `items` and `customer_details` are stored as JSON strings
- Both online and COD orders use this same table
- Created via `setup_missing_tables.js`

---

### 6. `messages`

**Purpose**: Contact form submissions from customers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Message ID |
| `name` | VARCHAR(100) | NOT NULL | Sender name |
| `email` | VARCHAR(100) | NOT NULL | Sender email |
| `phone` | VARCHAR(20) | NULL | Phone number |
| `subject` | VARCHAR(200) | NULL | Message subject |
| `message` | TEXT | NOT NULL | Message body |
| `is_read` | BOOLEAN | DEFAULT FALSE | Read status |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Submission time |

---

### 7. `reservations`

**Purpose**: Table reservation requests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Reservation ID |
| `name` | VARCHAR(100) | NOT NULL | Guest name |
| `phone` | VARCHAR(20) | NOT NULL | Contact phone |
| `reservation_date` | DATE | NOT NULL | Reservation date |
| `reservation_time` | TIME | NOT NULL | Reservation time |
| `guests` | INT | NOT NULL | Number of guests |
| `status` | ENUM | DEFAULT `'pending'` | `pending`, `confirmed`, `cancelled` |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Request time |

---

### 8. `restaurant_info`

**Purpose**: Store restaurant metadata used by the frontend and AI chatbot. Singleton row (only 1 record).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Record ID |
| `name` | VARCHAR(255) | DEFAULT `'Moonstone Café'` | Restaurant name |
| `address` | TEXT | NULL | Physical address |
| `phone` | VARCHAR(50) | NULL | Contact phone |
| `email` | VARCHAR(100) | NULL | Contact email |
| `opening_hours` | TEXT | NULL | Display text for hours |
| `cuisine_type` | VARCHAR(255) | NULL | Types of cuisine offered |
| `extra_info` | TEXT | NULL | Additional info for AI chatbot |
| `opening_time` | TIME | NULL | Auto-mode opening time |
| `closing_time` | TIME | NULL | Auto-mode closing time |
| `operating_mode` | VARCHAR | NULL | `auto`, `forced_open`, `forced_closed` |
| `is_manual_closed` | BOOLEAN | NULL | Legacy manual close flag |
| `updated_at` | TIMESTAMP | AUTO UPDATE | Last modification time |

---

## Entity Relationships

```
admin_users (standalone — no FK relationships)

users ─────────────────┐
  │                    │
  └──── orders ────────┘  (user_id FK, ON DELETE SET NULL)

categories ────────────┐
  │                    │
  └──── menu_items ────┘  (category_id FK, ON DELETE SET NULL)

messages     (standalone)
reservations (standalone)
restaurant_info (standalone, singleton)
```

## CRUD Operations Summary

| Table | Create | Read | Update | Delete |
|-------|--------|------|--------|--------|
| `admin_users` | Seed script | Login query | ✗ | ✗ |
| `users` | Register/Google | Profile, Auth check | Profile update | ✗ |
| `categories` | Admin POST | Public GET | ✗ | ✗ |
| `menu_items` | Admin POST | Public GET, Admin GET | Admin PUT | Admin DELETE |
| `orders` | User POST (2 routes) | User GET, Admin GET | Admin PUT (status) | ✗ |
| `messages` | Public POST | Admin GET | Admin PUT (mark read) | ✗ |
| `reservations` | Public POST | Admin GET | ✗ | ✗ |
| `restaurant_info` | Upsert via PUT | Public GET | Admin PUT | ✗ |

## Setup Scripts

| Script | Purpose |
|--------|---------|
| `saphire_db/schema.sql` | Original SQL schema (admin_users, categories, menu_items, messages, reservations, restaurant_info) |
| `setup_missing_tables.js` | Creates `users` and `orders` tables |
| `scripts/seed-db.js` | Seeds admin user (`admin`/`password123`) and 8 categories |
| `scripts/add-payment-columns.js` | Migration: adds payment columns to orders |
| `scripts/migrate-orders.js` | Migration: order table schema changes |
| `scripts/migrate_restaurant_info.js` | Migration: adds time/mode columns to restaurant_info |
| `scripts/add_extra_info_col.js` | Migration: adds extra_info to restaurant_info |
| `scripts/check-db.js` | Tests database connectivity |
