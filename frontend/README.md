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

## User Clearances & Route Protection

The frontend restricts access to specific sectors of the client application depending on the current user's security role:

- **Anonymous / Guest & Regular Users (`user`)**:
  - Access to storefront, catalog directory, product details, cart, and profile views.
  - Hides `//_PLAYGROUND` and `//_ADMIN_NEXUS` links from the main navigation bar.
  - If a user tries to access `/playground` or `/admin` manually, they are blocked by the `<RequireAdmin>` route guard. If unlogged, they redirect to `/auth`. If logged in as `user`, they see a custom `ACCESS_DENIED` security terminal error.
- **Operators (`editor` & `superadmin`)**:
  - Full access to the storefront features.
  - Displays the `//_PLAYGROUND` and `//_ADMIN_NEXUS` options in the navigation bar.
  - Fully authorized to access the `/admin` and `/playground` pages to invoke operator controls.

### Quick Login Demo Buttons

The login card at `/auth` contains three quick-access credentials buttons to easily swap between clearances during development:
1. **`USER`**: morpheus.tester (credentials: `test@example.com` / `password123`)
2. **`EDITOR`**: trinity.editor (credentials: `editor@nexus.io` / `password123`)
3. **`SUPERADMIN`**: neo.superadmin (credentials: `admin@nexus.io` / `password123`)

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
