# Healthcare Marketplace — PRD

## Original problem statement
Production-ready B2B healthcare marketplace. Multi-org platform (hospital, pharmacy, vendor, distributor). Roles: requestor (creates cart), approver (signs off + completes purchase). Buyers and sellers can be the same entity. Categories: medicines, consumables, medical equipment, used/refurbished. Tier-based pricing (qty-based), no negotiation. Order workflow: Draft → Pending Approval → Approved → Paid → Delivered. Quality metadata + used-equipment specifics. Tech: React + Node.js/Express + MongoDB + JWT.

## User choices (Feb 2026)
- Backend: Node.js + Express
- File storage: deferred (Emergent object storage available later)
- Auth: JWT, email/password
- Payments: mocked
- Scope: Core MVP + seed data

## Architecture
- **Backend** (`/app/backend`) — Node 20, Express 4, Mongoose 8, JWT, bcrypt, Zod
  - `server.js` boot + auto-seed
  - `src/{config,middleware,models,controllers,routes,seeders,utils}/`
  - All routes under `/api`
- **Frontend** (`/app/frontend`) — React 19 + Tailwind + shadcn-ui + framer-motion + sonner
  - Sage / bone / terracotta palette, Outfit + Figtree fonts
- Supervisor switched: `command=/usr/bin/node server.js` for backend program

## Personas
- **Hospital procurement officer (Approver)** — reviews carts, approves, pays
- **Hospital nurse (Requestor)** — drafts carts of consumables/medicines
- **Vendor sales rep** — manages product catalogue, marks delivery
- **Pharmacy buyer-seller** — both lists products and procures

## Implemented (2026-02)
- JWT register/login/me with org creation on first signup
- Org & team management (approver invites users, role per user)
- Product catalogue: 4 categories, tier pricing, quality metadata, used-equipment fields, soft delete
- Cart = draft Order; tier-aware unit-price calc on add/update; can't buy from own org
- Approval workflow: requestor submits → approver approves/rejects → approver pays (mock) → seller delivers
- Buyer/seller dual views on `/orders`
- Auto-seeder: 4 orgs, 6 users, 8 products
- Frontend: Landing, Login, Register, Dashboard (role-aware), Marketplace, Product detail, Cart, Orders, Order detail (lifecycle UI), Seller products, Product form, Team
- 27/27 backend tests pass (testing subagent iteration 1)
- Bug fix: state-transition endpoints now return populated order docs (was breaking subsequent action buttons)
- Toast copy fixed (no more "approveed"/"payed")

## Backlog (P1)
- File uploads via Emergent object storage for product images
- Detailed used-equipment listing flow (separate `/list/used`)
- Pagination on marketplace + orders
- Order export CSV
- Email notifications on state transitions

## Backlog (P2)
- Real Stripe payments
- Negotiation/RFQ module (explicitly out-of-scope per user)
- Multi-currency, tax, shipping
- Advanced reporting

## Test credentials
See `/app/memory/test_credentials.md`. All accounts use `Password123!`.
