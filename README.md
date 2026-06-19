# FlavorDash

**A full-stack gourmet food ordering platform** — browse menus, manage carts, checkout with PayHere or cash on delivery, and operate a real-time admin dashboard.

Built with **React**, **Express**, and **MySQL** for a modern restaurant delivery experience.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Default Accounts](#default-accounts)
- [Application URLs](#application-urls)
- [API Reference](#api-reference)
- [Frontend Routes](#frontend-routes)
- [PayHere Integration](#payhere-integration)
- [Project Structure](#project-structure)
- [Development](#development)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Customer Experience
- Responsive storefront with hero, categories, and trending dishes
- Menu browsing with **search**, **category**, **price**, and **dietary** filters
- Shopping cart with quantity controls, promo codes, and special instructions
- Secure checkout with delivery address and profile prefill
- **PayHere** online payments (sandbox) and **Cash on Delivery**
- Order confirmation with live order details
- Customer profile with editable contact info and order history
- Google Sign-In (optional)

### Admin Dashboard
- Real-time sync (auto-refresh every 5 seconds)
- Order management with status updates (`pending` → `preparing` → `completed`)
- Menu CRUD — add, edit, delete food items
- Inventory management with stock levels and low-stock alerts
- User management — view customers, change roles, delete accounts
- Analytics overview — revenue, active orders, peak times, top sellers

### Platform
- JWT authentication with role-based access (`customer` / `admin`)
- RESTful API with MySQL persistence
- Image upload endpoint for menu assets
- PayHere payment hash generation and webhook verification

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite 5, React Router 7, Tailwind CSS 3, Axios, React Hot Toast |
| **Backend** | Node.js, Express 5, MySQL2, JWT, bcryptjs, Multer |
| **Database** | MySQL 8+ |
| **Payments** | PayHere (Sri Lanka) |
| **Auth** | Email/password + Google OAuth (optional) |

---

## Architecture

```mermaid
flowchart TB
    subgraph Client["Browser (React SPA)"]
        Home[Home / Menu / Cart]
        Checkout[Checkout]
        Admin[Admin Dashboard]
        Profile[Customer Profile]
    end

    subgraph API["Express API :5000"]
        Auth[/api/auth]
        Food[/api/food]
        Orders[/api/orders]
        Users[/api/users]
        Payment[/api/payment]
        Upload[/api/upload]
    end

    subgraph External["External Services"]
        PayHere[PayHere Gateway]
        Google[Google OAuth]
    end

    DB[(MySQL)]

    Client -->|REST + JWT| API
    API --> DB
    Checkout --> PayHere
    PayHere -->|Webhook| Payment
    Auth --> Google
```

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18 or higher |
| npm | 9 or higher |
| MySQL | 8.0 or higher |

---

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd foodorderinsys
```

### 2. Set up the database

```bash
mysql -u root -p < database/schema.sql
```

Run the profile/inventory migration (adds phone, address, stock columns):

```bash
cd backend
node scripts/migrate-profile-inventory.js
```

### 3. Configure the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` with your MySQL credentials and a strong `JWT_SECRET`.

### 4. Start the backend

```bash
node server.js
```

The API runs at **http://localhost:5000**.

### 5. Configure and start the frontend

```bash
cd frontend
npm install
```

Create `frontend/.env` (optional, for Google Sign-In):

```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

```bash
npm run dev
```

The app runs at **http://localhost:3000**.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | API port (default: `5000`) |
| `DB_HOST` | Yes | MySQL host |
| `DB_USER` | Yes | MySQL username |
| `DB_PASSWORD` | Yes | MySQL password |
| `DB_NAME` | Yes | Database name (`foodorderinsys`) |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `PAYHERE_MERCHANT_ID` | For payments | PayHere merchant ID |
| `PAYHERE_MERCHANT_SECRET` | For payments | Merchant secret from PayHere Dashboard → Integrations |
| `PAYHERE_SANDBOX` | No | `true` for sandbox (default), `false` for live |

> Use the **Merchant Secret**, not the API App Secret, for payment hashing.

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GOOGLE_CLIENT_ID` | No | Google OAuth client ID for Sign-In |

---

## Database Setup

### Schema

The main schema in `database/schema.sql` creates:

- `users` — accounts with roles and profile fields
- `food_items` — menu items with categories and stock
- `orders` — order headers with payment and status
- `order_items` — line items per order

### Migrations

| File | Purpose |
|------|---------|
| `database/migration_profile_inventory.sql` | SQL migration for profile + inventory columns |
| `backend/scripts/migrate-profile-inventory.js` | Node script to apply migration safely |

---

## Default Accounts

After importing the schema, seed data includes an admin account:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@flavordash.com` | `password123` |

> If admin login fails, the seeded password hash may be invalid. Register a new account and promote it to admin via MySQL:
>
> ```sql
> UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
> ```

Customers can register at `/register` or sign in with Google.

---

## Application URLs

| Service | URL |
|---------|-----|
| Frontend (dev) | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| Admin Dashboard | http://localhost:3000/admin |
| Uploaded images | http://localhost:5000/uploads/ |

---

## API Reference

All protected routes require `Authorization: Bearer <token>`.

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | — | Register with email and password |
| `POST` | `/api/auth/login` | — | Login, returns JWT + user |
| `POST` | `/api/auth/google` | — | Google Sign-In with ID token |

### Food / Menu

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/food` | — | List all menu items |
| `POST` | `/api/food` | Admin | Add menu item |
| `PUT` | `/api/food/:id` | Admin | Update menu item |
| `PATCH` | `/api/food/:id/stock` | Admin | Update stock quantity |
| `DELETE` | `/api/food/:id` | Admin | Delete menu item |

### Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/orders` | User | Place a new order |
| `GET` | `/api/orders` | User | List orders (all for admin, own for customer) |
| `GET` | `/api/orders/:id` | User | Get order by ID |
| `PUT` | `/api/orders/:id/status` | Admin | Update order status |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/users/me` | User | Get own profile |
| `PUT` | `/api/users/me` | User | Update own profile |
| `GET` | `/api/users` | Admin | List all users |
| `PUT` | `/api/users/:id/role` | Admin | Change user role |
| `DELETE` | `/api/users/:id` | Admin | Delete user |

### Payments & Uploads

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/payment/hash` | — | Generate PayHere payment hash |
| `POST` | `/api/payment/notify` | — | PayHere webhook (server-to-server) |
| `POST` | `/api/upload` | — | Upload image (`multipart/form-data`, field: `image`) |

### Example: Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@flavordash.com","password":"password123"}'
```

### Example: Place Order

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [{"food_item_id": 1, "name": "Classic Burger", "quantity": 2, "price": 8.99}],
    "subtotal": 17.98,
    "delivery_fee": 4.99,
    "tax": 1.68,
    "discount": 0,
    "total_amount": 24.65,
    "delivery_address": "123 Main St, Colombo",
    "phone": "+94771234567",
    "payment_method": "COD"
  }'
```

---

## Frontend Routes

| Path | Page | Access |
|------|------|--------|
| `/` | Home | Public |
| `/menu` | Menu (search & filters) | Public |
| `/cart` | Shopping cart | Public |
| `/checkout` | Checkout | Authenticated |
| `/order-confirmation` | Order confirmation | Authenticated |
| `/profile` | Customer profile | Customer |
| `/admin` | Admin dashboard | Admin |
| `/login` | Sign in | Public |
| `/register` | Create account | Public |
| `/categories` | Categories info | Public |
| `/about` | About us | Public |
| `/help` | Help center (FAQ) | Public |
| `/contact` | Contact support | Public |
| `/terms` | Terms of service | Public |

Additional static pages: `/featured-chefs`, `/corporate-dining`, `/gift-cards`, `/delivery-areas`, `/careers`, `/safety`, `/partner`.

---

## PayHere Integration

1. Create a PayHere sandbox account at [payhere.lk](https://www.payhere.lk).
2. Add `localhost` under **Integrations → Domain**.
3. Copy your **Merchant ID** and **Merchant Secret** into `backend/.env`.
4. At checkout, select **Pay securely online** to open the PayHere popup.
5. The webhook at `/api/payment/notify` updates `orders.payment_status` on success.

For local webhook testing, use a tunnel (e.g. ngrok) and set PayHere notify URL to your public endpoint.

---

## Project Structure

```
foodorderinsys/
├── backend/
│   ├── config/           # Database connection pool
│   ├── controllers/      # Route business logic
│   ├── middleware/       # JWT auth & admin authorization
│   ├── routes/           # Express route definitions
│   ├── scripts/          # Database migration scripts
│   ├── uploads/          # Uploaded menu images
│   ├── server.js         # API entry point
│   └── .env.example      # Environment template
├── frontend/
│   ├── src/
│   │   ├── components/   # Navbar, Footer
│   │   ├── context/      # AuthContext (JWT session)
│   │   ├── data/         # Static page content
│   │   ├── pages/        # Route-level components
│   │   ├── utils/        # Food filter helpers
│   │   └── api.js        # Axios client with JWT interceptor
│   ├── public/           # Static assets (favicon, placeholders)
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
└── database/
    ├── schema.sql
    └── migration_profile_inventory.sql
```

---

## Development

### Run both services

```bash
# Terminal 1 — API
cd backend && node server.js

# Terminal 2 — Frontend
cd frontend && npm run dev
```

### Build for production

```bash
cd frontend && npm run build
```

Preview the production build:

```bash
npm run preview
```

Serve built frontend with the included Express static server:

```bash
npm start
```

### Useful commands

| Command | Location | Description |
|---------|----------|-------------|
| `node server.js` | `backend/` | Start API server |
| `npm run dev` | `frontend/` | Start Vite dev server |
| `npm run build` | `frontend/` | Production build |
| `node scripts/migrate-profile-inventory.js` | `backend/` | Run DB migration |

---

## Production Deployment

1. **Database** — Use a managed MySQL instance; run `schema.sql` and migrations.
2. **Backend** — Deploy to a Node host (Railway, Render, VPS). Set all `.env` variables via secrets manager.
3. **Frontend** — Run `npm run build` and serve `dist/` via CDN, Nginx, or the included `server.js`.
4. **CORS** — Restrict `server.js` CORS to your production domain (currently allows localhost only).
5. **PayHere** — Switch `PAYHERE_SANDBOX=false` and use live merchant credentials.
6. **HTTPS** — Required for production payments and secure cookies.

Example with PM2:

```bash
cd backend
pm2 start server.js --name flavordash-api
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **403 on admin routes** | Log in as admin (`admin@flavordash.com`). Clear localStorage and re-login if role changed in DB. |
| **401 Unauthorized** | Token expired — log in again. JWT expires after 24 hours. |
| **Cannot connect to MySQL** | Verify `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `.env`. Ensure MySQL is running. |
| **PayHere "Unauthorized"** | Use **Merchant Secret** (not App Secret). Add `localhost` in PayHere domain settings. |
| **Invalid food_item_id on order** | Item was removed from menu. Clear cart and re-add items from the current menu. |
| **Admin login fails** | Re-hash password or promote user via SQL (see [Default Accounts](#default-accounts)). |
| **Upload fails** | Ensure `backend/uploads/` exists and is writable. |
| **API route not found after changes** | Restart the backend server after code changes. |

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit with clear messages: `git commit -m "Add feature description"`.
4. Push and open a Pull Request.

Please keep changes focused and match existing code style.

---

## License

This project is provided for educational and internship purposes. Add a `LICENSE` file to specify terms before public distribution.

---

<p align="center">
  <strong>FlavorDash</strong> — Gourmet flavors, delivered fast.
</p>
