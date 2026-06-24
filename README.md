# Project Nexus

Project Nexus is a full-stack e-commerce application with a React frontend and an Express/MongoDB backend, including real-time Socket.io updates for product viewers and stock changes.

## Stack

- Frontend: React 19, Vite, Tailwind CSS v4, Framer Motion, Recharts, Socket.io client
- Backend: Node.js, Express, MongoDB (Mongoose), Socket.io, Zod, JWT, PDFKit

## Features

- Authentication: register, login, logout, current-user endpoint, Google token login
- Authorization: role-based permissions for admin/editor features
- Catalog: searchable and filterable product listing with product detail pages
- Reviews: create and read reviews with verified-purchase handling
- Cart: local + server cart sync and merge on login
- Coupons: coupon validation and discount application in checkout flow
- Orders: guest/user checkout, order history, admin order management, invoice download
- CMS: editable homepage sections and featured products
- Admin telemetry: health data, manual reseed, recovery job trigger, webhook simulation
- Real-time: live product spectator count and stock update broadcasts

## User Roles & Clearances

Project Nexus uses a role-based access control (RBAC) system with three distinct security clearance levels:

| Clearance Level | Primary Role | Key Capabilities & Accessible Modules | Pre-seeded Account |
| :--- | :--- | :--- | :--- |
| **Level 1** | `user` | Shop catalog, add items to cart, checkout, apply coupons, submit reviews, post Q&A questions, manage personal profile & addresses, download PDF invoices. | `test@example.com` |
| **Level 2** | `editor` | All `user` capabilities + full access to **Admin Nexus** and **System Control Room**. Can manage inventory (SKU stocks, categories, CSV import/export), update order fulfillment statuses, configure homepage CMS, check system health telemetry, trigger manual cart sweeps, and simulate Stripe webhooks. | `editor@nexus.io` |
| **Level 3** | `superadmin` | All `editor` capabilities + absolute operator access. Can view the list of all registered users in the database, delete user accounts, and execute database reseed/reset procedures. | `admin@nexus.io` |

*Note: All pre-seeded demo accounts use `password123` as their default credentials.*

## Project Layout

- backend: API server and business modules
- frontend: SPA client application

## Environment Variables

Sensitive values must live in environment variables only.

1. Copy backend/.env.example to backend/.env
2. Copy frontend/.env.example to frontend/.env
3. Fill in real secrets and deployment URLs

## Local Development

1. Install dependencies:

```powershell
cd backend
npm install
cd ..\frontend
npm install
```

2. Start backend:

```powershell
cd backend
npm run dev
```

3. Start frontend:

```powershell
cd frontend
npm run dev
```

## Vercel Hosting Notes

- Frontend and backend can both be hosted on Vercel.
- For this project scale (around 5 concurrent users), Socket.io traffic is manageable when configured correctly.
- Set backend CORS origins via backend environment variable CORS_ORIGINS.
- Set frontend dev proxy target via frontend environment variable VITE_BACKEND_URL.
- Ensure frontend points to backend API/socket origin in your Vercel setup.
