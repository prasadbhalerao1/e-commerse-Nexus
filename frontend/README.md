# Project Nexus: Frontend Mainframe

This directory contains the single-page application client built with **Vite, React 19, Tailwind CSS v4, Framer Motion, and Recharts**. It is designed with the **Toxic Arcade // Industrial Quantum Brutalism** visual style, prioritizing high-contrast data overlays, raw telemetry layouts, and seamless micro-interactions.

---

## 🚀 Key Visual & Functional Features

### 1. Identity & Session Auth Uplink
- **Stateless Authentication:** Accesses protected endpoints via secure HttpOnly cookies set by the Node server.
- **Social SSO Simulation:** Single-click simulation of Google Sign-In, signing local payload tokens and synchronizing accounts in the backend.
- **Multi-Address Book:** User profile addresses CRUD interface supporting default shipping/billing labels.

### 2. Catalog Directory Viewport
- **Faceted Aggregation Filters:** Dynamic sidebar search panel allowing users to filter by:
  - Natural language semantic keywords (e.g. *glowing lens*)
  - Categories dynamically fetched from DB
  - Credit bounds (min/max price limits)
  - Trust ratings (average star ratings)
- **Cursor Pagination:** Avoids heavy page offsets. Retains a cursor reference to fetch subsequent records via the `FETCH_MORE_RECORDS` stream button.

### 3. Media-Rich PDP (Product Details Page)
- **Responsive Carousel:** Supports multiple thumbnails and high-res image transitions.
- **Detail Zoom Effect:** Hovering over the main product image applies a clean CSS scaling transform (`scale-125`) for detailed inspection.
- **Real-Time Spectators:** Active WebSocket connection showing how many other users are currently viewing the same product.
- **Community Q&A Logs:** Interactive Q&A submission form. Broadcasters receive immediate automated Compliance node responses.
- **Verified Purchase Badges:** Reviews from users with confirmed order fulfillment show a glowing green `VERIFIED_PURCHASER` badge.

### 4. Spring-Animated Cargo Inventory Drawer
- **Confetti Particle Burst:** Adding an item to the cart triggers a neon confetti blast from the toggle icon.
- **Hybrid Synchronization:** Carts merge local storage arrays with database profiles upon login for cross-device persistence.
- **Coupon Discount Processor:** Applies percentage/fixed discount codes with minimum spend thresholds, usage limits, and expiration checks.

### 5. Frictionless Checkout Uplink
- **Terminal checkout stepper:** Multi-step CLI dashboard detailing transaction statuses (*ESTABLISHING_LINK*, *ENCRYPTING_PAYLOAD*, *TRANSMITTING_FUNDS*).
- **Guest Checkout:** Allows users to place orders using guest emails, showing a prompt to register and claim their purchase post-checkout.

### 6. Operator Command Center (Admin Dashboard)
- **Real-Time Sales Graphs:** Recharts lines depicting Gross Merchandise Volume (GMV), active cart counts, and overall conversion rates.
- **Kanban Status Boards:** Drag-and-drop or status-dropdown workflows to move orders through *Unfulfilled*, *Processing*, *Shipped*, *Delivered*, and *Returned*.
- **SKU Inventory Adjusters:** Live stock incrementers and threshold limits warnings.
- **Bulk CSV Importers:** Dynamic parser allowing admins to copy/paste or upload CSV lines directly into the database.
- **CMS Layout Editor:** Updates homepage hero text, subtext, and featured product ID arrays on the fly.

---

## 🔐 System Demo Credentials

The remote MongoDB Atlas database is pre-seeded with the following operator accounts:

| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Superadmin** | `admin@nexus.io` | `password123` | Full dashboard access, financial graphs, Kanban status changes, SKU stock updates, CMS editors. |
| **Editor** | `editor@nexus.io` | `password123` | Limited dashboard access (no financial charts), Kanban status changes, SKU stock updates, CMS editors. |
| **User (Buyer)** | `buyer@nexus.io` | `password123` | Purchase flow, address book CRUD, reviews, verified purchases history. |
| **User (Tester)** | `test@example.com` | `password123` | Standard buyer account configured with intensive cart edge cases (depleted stock items, inactive assets). |

---

## 🎨 Industrial Brutalism Design Tokens

The styling system restricts active palettes to high-contrast hazard signals:
- **Void Black (`#000000`):** Core background panel.
- **Abyssal Sludge (`#0a0c0a`):** Cards, input panels, and modals.
- **Acid Green (`#39ff14`):** Primary actions, text glows, success indicators.
- **Hazard Yellow (`#ffea00`):** Inactive warnings, pending tags, coupon codes.
- **Blaze Orange (`#ff5500`):** Secondary warnings, delete buttons, checkout links.
- **Banned Palettes:** Zero pinks, blues, purples, or default browser color presets are allowed.

---

## 🛠️ Launching the Mainframe

To start the frontend dev server, run:
```powershell
# Navigate to the frontend workspace
cd frontend

# Launch Vite server
npm run dev
```

The client will initialize at `http://localhost:5173/`. All backend routes `/api` and `/socket.io` are automatically proxied to port `5000` via `vite.config.js`.
