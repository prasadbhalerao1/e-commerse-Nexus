# Backend

Express API for Project Nexus with MongoDB, JWT auth, role-based access, and Socket.io real-time updates.

## Tech

- Node.js (ES modules), Express
- MongoDB with Mongoose
- Zod validation
- JWT + HttpOnly cookies
- Socket.io
- Swagger UI

## API Features

- Auth: register, login, logout, me, Google token login
- Users: profile read/update, address CRUD, admin user deletion
- Products: catalog filters, product detail, admin CRUD
- CMS: homepage content read/update
- Cart: get cart and sync cart items
- Coupons: create and validate coupons
- Reviews: create and list product reviews
- Orders: create order, user history, admin analytics/list/update, invoice PDF
- System Control: health telemetry, reseed, recovery sweep, webhook simulation (admin/editor only)

## Real-Time Features

- Product room spectator count updates
- Stock update broadcasts after inventory changes

## Environment Setup

Copy backend/.env.example to backend/.env and provide real values.

Required variables:

- PORT
- NODE_ENV
- MONGO_URI
- JWT_SECRET
- JWT_EXPIRES_IN
- GOOGLE_CLIENT_ID (recommended when Google login is enabled)
- CORS_ORIGINS (comma-separated list of allowed origins)

## Commands

```powershell
npm run dev
npm run start
npm run lint
npm run build
```

## Local Run

```powershell
cd backend
npm install
node seed.js
npm run dev
```

Swagger UI is available at /api-docs.

## Vercel Note

When deploying backend on Vercel, set all environment variables in the Vercel project and include your frontend Vercel URL in CORS_ORIGINS.
