# Primetrade.ai Task Manager API

> 🚀 Production-ready full-stack application — Backend Developer Intern Assignment

A secure, scalable REST API with JWT authentication, role-based access control (RBAC), PostgreSQL database, structured logging, and a React frontend dashboard.

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
| Database | **PostgreSQL** + Prisma ORM v7 |
| Auth | JWT (HS256) + bcrypt (12 rounds) |
| Validation | Zod (password complexity enforced) |
| Logging | Pino + pino-http (structured JSON logs) |
| Docs | Swagger UI (OpenAPI 3.0) |
| Frontend | React + Vite |
| Testing | Jest + Supertest |
| Deployment | Docker + Docker Compose |

---

## ⚙️ Setup Instructions

### Option A — Docker (Recommended, Zero Setup)

```bash
git clone https://github.com/Souvikk021/InternshipV1.git
cd InternshipV1
docker-compose up --build
```

Runs PostgreSQL + Backend + Frontend automatically.
- App: http://localhost:5173
- API: http://localhost:3000
- Docs: http://localhost:3000/api-docs

---

### Option B — Manual Setup

#### Prerequisites
- Node.js 18+
- PostgreSQL 14+ running locally

#### 1. Clone the repo

```bash
git clone https://github.com/Souvikk021/InternshipV1.git
cd InternshipV1
```

#### 2. Backend Setup

```bash
cd backend
npm install
```

Copy and configure env:
```bash
copy .env.example .env
```

Edit `.env` with your PostgreSQL credentials:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/primetrade_db?schema=public"
JWT_ACCESS_SECRET="your_strong_secret_min_32_chars"
JWT_REFRESH_SECRET="your_refresh_secret_min_32_chars"
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

Run migrations & seed:
```bash
npx prisma migrate dev --name init
npx prisma generate
node prisma/seed.js
```

Start backend:
```bash
npm run dev
```

#### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## 🔐 API Endpoints

### Auth (`/api/v1/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /register | None | Register new user |
| POST | /login | None | Login + get JWT |
| POST | /refresh | Cookie | Refresh access token (rotation) |
| POST | /logout | None | Revoke refresh token |
| GET | /me | Bearer | Get current user info |

### Tasks (`/api/v1/tasks`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | Bearer | List tasks (own/all for admin) + pagination + filter |
| POST | / | Bearer | Create task |
| GET | /:id | Bearer | Get task (ownership check) |
| PUT | /:id | Bearer | Update task (ownership/admin) |
| DELETE | /:id | Bearer | Delete task (ownership/admin) |

### Admin (`/api/v1/admin`) — ADMIN role required
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /users | Bearer + ADMIN | List all users with task counts |
| DELETE | /users/:id | Bearer + ADMIN | Delete user |
| PATCH | /users/:id/role | Bearer + ADMIN | Update user role |

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

Covers:
- ✅ Registration, login, invalid credentials
- ✅ Protected route access (401 without token)
- ✅ Task CRUD with ownership checks
- ✅ RBAC: admin routes return 403 for regular users
- ✅ Token expiry and invalid token handling

---

## 🛡️ Security Implementation

| Measure | Implementation |
|---------|---------------|
| Password hashing | bcrypt with 12 salt rounds |
| Password complexity | Zod: min 8 chars + uppercase + number + special char |
| JWT | HS256, access tokens (15m) + refresh tokens (7d) |
| Token storage | Access token in memory; refresh token in httpOnly + Secure cookie |
| Refresh token rotation | Each refresh invalidates old token in DB |
| Input validation | Zod schemas on ALL endpoints |
| Rate limiting | 20 req/15min on auth; 200 req/15min globally |
| IDOR prevention | ALL queries scoped to `req.user.id` for non-admins |
| Security headers | helmet.js |
| CORS | Configured for frontend origin only |
| Logging | pino structured JSON logs (request + response) |

---

## 📐 Architecture & Scalability

This architecture supports **horizontal scaling** through stateless JWT authentication. No server-side session state means any instance can verify tokens independently.

```
┌─────────────────────────────────────────────────────┐
│              Load Balancer (nginx/AWS ALB)            │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   [API Server]  [API Server]  [API Server]   ← Stateless (JWT)
        │            │            │
        └────────────┼────────────┘
                     │
        ┌────────────┼────────────┐
        ▼                         ▼
  [PostgreSQL]              [Redis Cache]
  Primary + Replicas        Token blocklist
                            Rate limiting
                            Session cache
```

**Production scaling roadmap:**
- **Redis**: Token blocklist for instant logout, shared rate limiting across instances, response caching
- **PostgreSQL**: Read replicas for query scaling, PgBouncer for connection pooling
- **Docker + Kubernetes**: Zero-downtime rolling deployments, auto-scaling pods
- **Microservices**: Auth and Tasks can be extracted as independent services sharing the same JWT verification, with an API Gateway routing requests
- **Message Queue**: BullMQ + Redis for async notifications and background jobs
- **Monitoring**: Pino logs → Datadog/ELK Stack for observability

---

## 📁 Project Structure

```
InternshipV1/
├── docker-compose.yml       # One-command full-stack deployment
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── prisma/
│   │   ├── schema.prisma    # User + Task + RefreshToken models (PostgreSQL)
│   │   ├── seed.js          # Demo data seeding
│   │   └── migrations/      # Prisma migration files
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js        # Prisma client
│   │   │   ├── logger.js    # Pino structured logger
│   │   │   └── swagger.js   # OpenAPI 3.0 spec
│   │   ├── controllers/     # HTTP handlers (thin layer)
│   │   ├── middlewares/     # authenticate, authorize, validate, errorHandler
│   │   ├── routes/v1/       # Versioned routes with Swagger JSDoc
│   │   ├── services/        # Business logic (auth, tasks)
│   │   ├── utils/           # jwt.js, password.js, response.js
│   │   ├── validators/      # Zod schemas (password complexity enforced)
│   │   └── app.js           # Express app
│   └── tests/               # Jest + Supertest integration tests
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── components/      # Navbar, TaskCard, TaskModal, Alert, PrivateRoute
        ├── contexts/        # AuthContext (in-memory tokens, NOT localStorage)
        ├── pages/           # LoginPage, DashboardPage, AdminPage
        ├── services/        # api.js (interceptors), authService, taskService
        └── App.jsx          # Routes + auth guards
```

---

## 🚀 Deployment

### Render.com (Backend)
1. Connect GitHub repo, set root to `backend/`
2. Build: `npm install && npx prisma generate`
3. Start: `npx prisma migrate deploy && node src/app.js`
4. Add env vars: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV=production`

### Vercel (Frontend)
1. Connect GitHub repo, set root to `frontend/`
2. Build: `npm run build` → Output: `dist/`
3. Add `VITE_API_URL` pointing to your Render backend URL

### Docker (Self-hosted)
```bash
docker-compose up --build -d
```

---

## 📚 Interactive API Docs

Visit **http://localhost:3000/api-docs**

1. Click **Authorize** 🔒
2. Paste your access token from login response
3. Test any endpoint directly from the browser
