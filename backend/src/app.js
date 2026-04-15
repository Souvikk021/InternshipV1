require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const pinoHttp = require('pino-http');

const authRoutes = require('./routes/v1/auth.routes');
const taskRoutes = require('./routes/v1/task.routes');
const adminRoutes = require('./routes/v1/admin.routes');
const { errorHandler } = require('./middlewares/errorHandler');
const { swaggerUi, specs } = require('./config/swagger');
const logger = require('./config/logger');

const app = express();

// ─── HTTP Request Logging (pino) ──────────────────────────────────────────────
app.use(pinoHttp({ logger, autoLogging: process.env.NODE_ENV !== 'test' }));

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again after 15 minutes' },
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// ─── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  const prisma = require('./config/db');
  let dbStatus = 'connected';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'disconnected';
  }
  res.json({
    status: 'ok',
    uptime: `${Math.floor(process.uptime())}s`,
    db: dbStatus,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Docs ──────────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

// ─── API Routes (v1) ──────────────────────────────────────────────────────────
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/admin', adminRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`🚀 Server running at http://localhost:${PORT}`);
    logger.info(`📚 API Docs:     http://localhost:${PORT}/api-docs`);
    logger.info(`❤️  Health:       http://localhost:${PORT}/health`);
    logger.info(`🌍 Environment:  ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
