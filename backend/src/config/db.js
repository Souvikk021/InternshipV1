const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

// Resolve DB path: supports file:./relative or absolute paths
const resolveDbPath = (url) => {
  if (!url) return path.resolve(process.cwd(), 'prisma/dev.db');
  const filePath = url.replace(/^file:\.?\//, '');
  return path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
};

const dbPath = resolveDbPath(process.env.DATABASE_URL);

// Prisma v7 adapter-better-sqlite3 takes a config object with `url`
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

module.exports = prisma;
