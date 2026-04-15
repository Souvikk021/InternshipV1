const { PrismaClient } = require('@prisma/client');

// Standard PrismaClient — reads DATABASE_URL from environment
// Works with PostgreSQL (production) and can be swapped for SQLite locally
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

module.exports = prisma;
