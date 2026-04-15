# Primetrade.ai Task Manager API

> 🚀 Production-ready full-stack application — Backend Intern Assignment

A secure, scalable REST API with JWT authentication, role-based access control (RBAC), and a React frontend dashboard.

---

## 🌐 Live URLs (Local Dev)

| Service | URL |
|---------|-----|
| Backend API | http://localhost:3000 |
| Swagger Docs | http://localhost:3000/api-docs |
| Health Check | http://localhost:3000/health |
| Frontend | http://localhost:5173 |

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@primetrade.ai | Admin@1234 |
| User | user@primetrade.ai | User@1234 |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20+ LTS |
| Framework | Express.js |
| Database | SQLite + Prisma ORM (v7) |
| Auth | JWT (HS256) + bcrypt |
| Validation | Zod |
| Docs | Swagger UI (OpenAPI 3.0) |
| Frontend | React + Vite |
| Testing | Jest + Supertest |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Git

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd Intership
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Copy the example env:
```bash
copy .env.example .env
```

The defaults in `.env` work out of the box with SQLite.

Apply the database schema:
```bash
node -e "const Database = require('better-sqlite3'); const fs = require('fs'); const path = require('path'); const db = new Database(path.resolve('prisma/dev.db')); const sql = fs.readFileSync('prisma/migrations/20260415160035_init/migration.sql', 'utf8'); db.exec(sql); db.close(); console.log('Done');"
```

Or run the Prisma migration (requires TypeScript setup):
```bash
npx prisma generate
```

Seed the database:
```bash
node prisma/seed.js
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## 🔐 API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/v1/auth/register | None | Register new user |
| POST | /api/v1/auth/login | None | Login + get JWT |
| POST | /api/v1/auth/refresh | Cookie | Refresh access token |
| POST | /api/v1/auth/logout | None | Revoke refresh token |
| GET | /api/v1/auth/me | Bearer | Get current user |

### Tasks
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/v1/tasks | Bearer | List tasks (own/all for admin) |
| POST | /api/v1/tasks | Bearer | Create task |
| GET | /api/v1/tasks/:id | Bearer | Get task |
| PUT | /api/v1/tasks/:id | Bearer | Update task |
| DELETE | /api/v1/tasks/:id | Bearer | Delete task |

### Admin (ADMIN role required)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/v1/admin/users | Bearer + ADMIN | List all users |
| DELETE | /api/v1/admin/users/:id | Bearer + ADMIN | Delete user |
| PATCH | /api/v1/admin/users/:id/role | Bearer + ADMIN | Update user role |

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

Tests cover:
- Registration, login, invalid credentials
- Protected route access
- Task CRUD with ownership checks
- RBAC enforcement (admin vs user)
- Token expiry handling

---

## 🛡️ Security Implementation

| Measure | Implementation |
|---------|---------------|
| Password hashing | bcrypt with 12 salt rounds |
| JWT | HS256 with short-lived access tokens (15m) + refresh tokens (7d) |
| Token storage | Access token in memory; refresh token in httpOnly cookie |
| Input validation | Zod schemas on all endpoints |
| Rate limiting | 20 req/15min on auth; 200 req/15min globally |
| IDOR prevention | All queries scoped to `req.user.id` for non-admins |
| Security headers | Helmet.js |
| CORS | Configured for frontend origin only |
| Refresh token rotation | Each refresh invalidates old token in DB |

---

## 📐 Architecture & Scalability

This architecture supports horizontal scaling through **stateless JWT authentication** — no server-side session state means any instance can verify tokens independently.

**For production scaling:**
- **Redis** for token blocklist (instant logout) and rate limiting across instances
- **Connection pooling** via PgBouncer / native PostgreSQL pooling
- **Docker + Kubernetes** for zero-downtime deployments with load balancing
- **Microservices extraction**: Auth and Tasks can be split into separate services sharing the same JWT verification logic, with an API Gateway routing requests
- **PostgreSQL** swap is trivial — just change `schema.prisma` provider and `DATABASE_URL`
- **Async job queue** (BullMQ + Redis) for notifications and background tasks

The layered architecture (routes → controllers → services → DB) keeps concerns separated, making each layer independently testable and replaceable.

---

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma    # DB models + enums
│   ├── seed.js          # Demo data seed
│   └── migrations/      # DB migration files
├── src/
│   ├── config/          # DB, Swagger config
│   ├── controllers/     # HTTP layer (thin wrappers)
│   ├── middlewares/     # Auth, validate, errorHandler
│   ├── routes/v1/       # API routes with Swagger JSDoc
│   ├── services/        # Business logic
│   ├── utils/           # JWT, password, response helpers
│   ├── validators/      # Zod schemas
│   └── app.js           # Express app + middleware chain
└── tests/               # Jest + Supertest integration tests

frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # AuthContext (global auth state)
│   ├── pages/           # LoginPage, DashboardPage, AdminPage
│   ├── services/        # API, auth, task service wrappers
│   └── App.jsx          # Root with routing + auth guards
└── index.html
```

---

## 🚀 Deployment

### Backend → Render.com
1. Connect GitHub repo
2. Set build command: `npm install`
3. Set start command: `node src/app.js`
4. Add env vars: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL`, `NODE_ENV=production`

### Frontend → Vercel
1. Connect GitHub repo, set root to `frontend/`
2. Build command: `npm run build`
3. Update `VITE_API_URL` env var to your Render backend URL

---

## 📚 Interactive API Docs

Visit **http://localhost:3000/api-docs** to explore all endpoints with Swagger UI.

Click **Authorize** and paste your access token to test protected routes directly.
