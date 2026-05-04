# Green Card eCommerce Marketplace (MERN)

Short, modern shopping web app with buyer & seller flows, built with a React frontend and a Node/Express backend backed by MongoDB. This repo contains the full client + server for a small commerce platform (products, cart, orders, sellers, refunds, uploads, email).

What this README is: a compact case-study for devs... quick setup, architecture, core features, and near-term improvements. Gen Z dev voice = clear, direct, and pragmatic.

**Quick TL;DR**: frontend in `client/`, backend in `server/`. Work locally with separate dev servers. Use MongoDB for data persistence and local `uploads/` for images.

**Highlights**
- Buyer features: browse categories, view product details, cart, checkout, order tracking, profile, addresses.
- Seller features: seller signup/login, product management, seller dashboard, seller inbox/orders.
- Admin-ish: product and refund endpoints, basic user order management.
- Utilities: image upload, email sending, auth, protected routes.

**User stories (core)**
1. ✔️ Browse products by category and search.
2. ✔️ View product details and add to cart.
3. ✔️ Create account / login (buyers & sellers).
4. ✔️ Seller flows: add products, list products, manage orders.
5. ✔️ Checkout + order creation; view order history & tracking.
6. ✔️ Upload profile/product images (local `uploads/`).
7. ✔️ Request refunds and seller/admin can process refunds.

## Tech Stack
- Frontend: React (Vite), JSX, plain CSS
- Backend: Node.js, Express
- DB: MongoDB (mongoose models in `server/models`)
- Auth: JWT-based (server routes enforce protected access)
- Misc: nodemailer (email), multer (file upload)

## Repo layout
- client/ — React app (components, pages, context, routes)
- server/ — Express API, `routes/`, `models/`, `utils/`, `uploads/`
- server/conn/conn.js — MongoDB connection
- public/ — client public assets

See the code for details: frontend pages in `client/src/pages/`, components in `client/src/components/`, and server routes in `server/routes/`.

## Architecture (short)
- React SPA talks to Express REST API.
- Auth flow: login/signup -> server returns JWT -> client stores token (context) -> protected routes include token in requests.
- Images uploaded via `server/routes/upload.js` -> stored in `server/uploads/` and served statically.

## Getting started (dev)
Prereqs: Node.js (16+), npm, MongoDB (local or Atlas).

1) Install deps for client and server:

```bash
cd client && npm install
cd ../server && npm install
```

2) Start dev servers (two terminals):

```bash
# terminal 1 (server)
cd server
npm run dev

# terminal 2 (client)
cd client
npm run dev
```

3) Open the client URL printed by Vite (usually http://localhost:5173) and the server runs on the port in `server/server.js` (default 5000).

## Environment variables (server)
Create a `.env` in `server/` with at least:

- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — secret for signing tokens
- `EMAIL_USER` / `EMAIL_PASS` — for nodemailer (optional)
- `CLIENT_URL` — origin for CORS if needed

## API (high-level)
- `POST /api/auth/register` — register buyer or seller
- `POST /api/auth/login` — login, returns token
- `GET /api/products` — list products
- `GET /api/products/:id` — product detail
- `POST /api/cart` & `GET /api/cart` — cart endpoints
- `POST /api/orders` — create order
- `POST /api/upload` — file uploads (multer)
- `POST /api/refunds` — request refund

Check `server/routes/` for full route list and payload shapes.

## Dev notes & conventions
- Keep UI stateless where possible: pages fetch via context/hooks.
- `client/context/AppContext.jsx` centralizes auth + cart state.
- Seller flows live under `client/src/pages/Seller/` and use `server/routes/seller.js`.

## Testing / Quick checks
- Use Postman or a browser for public GET routes.
- For protected routes, obtain a token from `/api/auth/login` and set `Authorization: Bearer <token>`.

## Future improvements (short roadmap)
- Switch image storage to S3 or Cloudinary (scales better than local `uploads/`).
- Add role-based admin UI + RBAC on backend.
- Integrate payment gateway (Stripe) for real checkout flow.
- Add E2E tests (Cypress) + automated CI.
- Improve UX: pagination, product filters, and better mobile layout.


