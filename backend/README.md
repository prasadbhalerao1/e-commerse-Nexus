# Project Nexus: Cybernetic Backend Uplink

Welcome to the backend core of **Project Nexus**—a high-performance, toxic-arcade cybernetic e-commerce platform built on the MERN stack. This system serves as the mainframe orchestrating secure authentication, product search vectors, real-time WebSockets inventory, automated cart recovery crons, and order processing.

---

## 🛠️ Mainframe Tech Stack
- **Runtime:** Node.js (ESModules)
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Mongoose ORM)
- **Real-Time Uplink:** Socket.io (WebSockets)
- **Security:** Bcryptjs (12 salt rounds), JSON Web Tokens (JWT), Helmet.js, Express-Rate-Limit
- **Validation:** Zod
- **Utilities:** PDFKit (server-side invoice compilation), Winston (event logging)

---

## 🎨 Theme & Visual Philosophy
Project Nexus rejects standard sterile design patterns. It operates within the **Industrial Quantum Brutalism // Toxic Arcade** styling system:
- **Void Black (`#000000`)** — Primary backing
- **Abyssal Sludge (`#0a0c0a`)** — Secondary container backgrounds (faint dark green-black)
- **Acid Green (`#39ff14`)** — Primary alerts, active statuses, standard CTA borders
- **Hazard Yellow (`#ffea00`)** — Secondary warnings, discount labels, search overlays
- **Blaze Orange (`#ff5500`)** — Critical triggers, checkout buttons, urgent stock depletion notifications
- **Monochrome White (`#f0f0f0`)** — Primary clean text output

---

## 📡 Architecture & Directory Design
The directory layout follows a clean, decoupled, **flat module structure** under `src/modules/` without nesting folders inside modules to prevent navigation bloat:

```text
backend/
├── seed.js                   # Main database seeding utility
├── src/
│   ├── app/
│   │   ├── app.js            # Express app config & global middleware setup
│   │   ├── routes.js         # API Route multiplexer
│   │   └── server.js         # HTTP and WebSockets socket.io bootstrap
│   ├── config/
│   │   ├── database.js       # MongoDB Mongoose connector
│   │   ├── env.js            # Env variables validation schema (Zod)
│   │   ├── logger.js         # Winston logging system
│   │   └── redis.js          # In-memory mock cache stub client
│   ├── core/
│   │   ├── errors.js         # Consolidated custom error classes
│   │   ├── exceptions/
│   │   │   └── globalErrorHandler.js # Express catcher
│   │   ├── responses/
│   │   │   └── ApiResponse.js        # Standardized API response wrapper
│   │   └── security/
│   │       ├── bcrypt.js     # Passwords salt-hashing
│   │       └── jwt.js        # Tokens signing/verification
│   ├── common/
│   │   ├── middleware/       # Rate-limiting, validation, RBAC, protect guards
│   │   ├── services/         # Mail notifications client
│   │   └── utils/            # Async helpers, paginator, cookie tokens
│   ├── jobs/
│   │   └── cartRecovery.js   # Background Cron scanning for abandoned carts
│   └── modules/              # FLAT DOMAIN MODULES
│       ├── auth/             # Login, register, logout, Google SSO
│       ├── cart/             # Hybrid localStorage/database sync
│       ├── cms/              # Homepage hero configurations
│       ├── coupons/          # Discounts, spend-thresholds, and expiries
│       ├── notifications/    # Socket.io connection events and room triggers
│       ├── orders/           # Checkout, checkout-inventory deduct, invoices
│       ├── products/         # Faceted catalog pipelines, categories
│       ├── reviews/          # Verified purchaser 1-5 reviews
│       └── users/            # Shipping address book, user profile admin
```

---

## ⚡ Mainframe Modules & API Enclave

### 1. Identity & Auth (`/api/auth`)
Stateless security enclave using **HttpOnly cookies** to protect tokens against XSS. Includes Google Single Sign-On (SSO) integration using Node 22 native global `fetch`.
- `POST /api/auth/register` — Initial user registration
- `POST /api/auth/login` — Sign in and issue HttpOnly token cookies
- `POST /api/auth/logout` — Wipe cookie payloads
- `POST /api/auth/google` — Secure OAuth 2.0 onboarding

### 2. User Profiles & Addresses (`/api/users`)
User database containing accounts, search wishlists, and customizable address books.
- `GET /api/users/profile` — Fetch active profile details
- `PUT /api/users/profile` — Modify profile data
- `POST /api/users/addresses` — Append new shipping address
- `GET /api/users/addresses` — View address directory
- `DELETE /api/users/addresses/:addressId` — Prune selected address
- `DELETE /api/users/:id` — Admin-only user termination

### 3. Catalog & Discovery (`/api/products` & `/api/cms`)
Heavy aggregation-based search system. Features pagination, filters, and dynamic homepage banners.
- `GET /api/products/catalog` — Faceted filtering pipeline. Supports:
  - Natural text matching
  - Slug-based category separation
  - Dynamic bounds (`minPrice`, `maxPrice`)
  - Minimum average rating checks
- `GET /api/products/:slug` — Individual product specification detail
- `POST /api/products` — Admin creation utility
- `PUT /api/products/:id` — Admin update tool
- `DELETE /api/products/:id` — Admin product archiving
- `GET /api/cms` — Retreive current homepage hero banners
- `PUT /api/cms` — Admin CMS updater

### 4. Cargo Inventory (`/api/cart`)
Tracks user basket selections. Features a **Hybrid Cart Synchronization** logic:
- `GET /api/cart` — Retrieve active cart items, populated with product name, price, images, and current stock.
- `POST /api/cart/sync` — Merge offline local storage items from guest states with database entries on user login.

### 5. Coupon Enclave (`/api/coupons`)
Applies promo codes during transaction validation.
- `POST /api/coupons` — Admin coupon creation (percentage/fixed, spend thresholds, expiries)
- `GET /api/coupons/validate` — Checks active coupon usability on specific subtotal totals

### 6. Social Proof (`/api/reviews`)
Limits reviews to unique purchaser pairs and recalculates ratings.
- `POST /api/reviews/:productId` — Submit rating and comment. Checks database order logs to automatically tag with **"Verified Purchaser"** badges.
- `GET /api/reviews/:productId` — Retrieve comments/reviews sorted by date.

### 7. Order Mainframe (`/api/orders`)
Validates pricing, coordinates stock deductions, emails confirmations, and compiles invoices.
- `POST /api/orders` — Checkout handler. Locks prices, verifies stock availability, deducts inventory, and marks payment status.
- `GET /api/orders/my` — Fetch customer order timeline.
- `GET /api/orders/admin/analytics` — Recharts analytics feed (GMV calculation, cart conversion rates).
- `GET /api/orders/admin/all` — Admin master order tracker list.
- `PUT /api/orders/admin/:id` — Admin order fulfillment status updates (Unfulfilled -> Processing -> Shipped -> Delivered).
- `GET /api/orders/:id` — Fetch order details.
- `GET /api/orders/:id/invoice` — Compiles a high-contrast terminal-style PDF document on the server using `pdfkit` and streams it back.

---

## 📡 WebSockets: Socket.io Real-Time Enclave
Enables dynamic interactive feedback loops to the UI:
1. **Spectator Counter:** Subscribes connected clients to room channels matching specific product IDs. Tracks and broadcasts visitor count changes in real-time (*"X runners looking at this datapad"*).
2. **Instant Stock Sync:** Emits stock depletion signals (`stockUpdate`) during successful checkouts, automatically prompting connected users if stock drops (*"Only Y items remaining!"*).

---

## 🤖 Abandoned Cargo Sweep (Recovery Service)
An autonomous scheduler runs in the background. It continuously scans for inactive database carts:
- Identifies carts that have been idle for over 24 hours.
- Dispatches a recovery reminder via `mailService` to prompt purchase continuation.
- Flags the cart as notified (`abandonedEmailSent: true`) to avoid spamming.

---

## 🚀 Uplink Instructions

### 1. Configure Mainframe Environment
Create a `backend/.env` file in the root of the backend folder:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.j5jbdv6.mongodb.net/project-nexus
JWT_SECRET=supersecretcyberkey101
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=mock_client_id
```

### 2. Populate Test Records
Run the data seed utility to configure admin accounts and default cyberware stock:
```powershell
cd backend
node seed.js
```

### 3. Initialize Server
Boot the Node API server:
```powershell
npm run start
```
For continuous hot-reloading:
```powershell
npm run dev
```

### 4. Interactive API Sandbox
Access the Swagger documentation suite in your browser to inspect or test routes:
```text
http://localhost:5000/api-docs
```
