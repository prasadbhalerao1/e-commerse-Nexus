# Frontend

React SPA for Project Nexus storefront, account, checkout, and admin dashboards.

## Tech

- React 19 + Vite
- Tailwind CSS v4
- Framer Motion
- Recharts
- Socket.io client

## UI Features

- Auth views: register/login and Google token login path
- Catalog page with search/filter controls and incremental loading
- Product details page with image gallery, reviews, Q&A simulation, live spectators, and stock updates
- Cart drawer with local and authenticated sync behavior
- Checkout flow with coupon validation and staged transaction UI
- Profile page for account/address management
- Admin dashboard for analytics, order status changes, inventory controls, and CMS updates
- System playground for operator-level backend control actions

## Environment Variables

Copy frontend/.env.example to frontend/.env.

- VITE_BACKEND_URL: backend URL used by Vite dev proxy

## Commands

```powershell
npm run dev
npm run lint
npm run build
npm run preview
```

## Vercel Note

Frontend and backend can be deployed on Vercel. For small concurrent usage (for example ~5 active users), the Socket.io features used in this project are practical when backend CORS and origins are configured correctly.
