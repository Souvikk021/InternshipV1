require('dotenv').config();
const prisma = require('../src/config/db');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.refreshToken.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.create({
    data: { email: 'admin@primetrade.ai', passwordHash: adminHash, role: 'ADMIN' },
  });

  const userHash = await bcrypt.hash('User@1234', 12);
  const user = await prisma.user.create({
    data: { email: 'user@primetrade.ai', passwordHash: userHash, role: 'USER' },
  });

  await prisma.task.createMany({
    data: [
      { title: 'Set up project structure', description: 'Initialize backend and frontend', status: 'DONE', userId: admin.id },
      { title: 'Implement JWT auth', description: 'Register, login, refresh token rotation', status: 'DONE', userId: admin.id },
      { title: 'Write API tests', description: 'Jest + Supertest integration tests', status: 'IN_PROGRESS', userId: admin.id },
      { title: 'Build React dashboard', description: 'Task CRUD UI with auth context', status: 'TODO', userId: user.id },
      { title: 'Deploy to Render', description: 'Set env vars and deploy backend', status: 'TODO', userId: user.id },
    ],
  });

  console.log('✅ Seed complete!');
  console.log('👤 Admin:  admin@primetrade.ai / Admin@1234');
  console.log('👤 User:   user@primetrade.ai  / User@1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
