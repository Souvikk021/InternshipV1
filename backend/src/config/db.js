const { PrismaClient } = require('@prisma/client');
const path = require('path');

// ─── Detect database type from URL ────────────────────────────────────────────
// Production: DATABASE_URL=postgresql://...  → standard PrismaClient
// Local dev:  DATABASE_URL=file:./dev.db     → better-sqlite3 adapter
const dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
const isPostgres = dbUrl.startsWith('postgresql') || dbUrl.startsWith('postgres');

let prisma;

if (isPostgres) {
  // ── PostgreSQL (production / Render / Docker) ──────────────────────────────
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
} else {
  // ── SQLite via better-sqlite3 adapter (local dev) ──────────────────────────
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  const filePath = dbUrl.replace(/^file:\.?\//, '');
  const absPath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  const adapter = new PrismaBetterSqlite3({ url: `file:${absPath}` });
  prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

module.exports = prisma;
