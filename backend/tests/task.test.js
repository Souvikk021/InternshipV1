const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');

let userToken, adminToken, userId, adminId;

beforeAll(async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  // Create regular user (password meets complexity)
  const userReg = await request(app)
    .post('/api/v1/auth/register')
    .send({ email: 'user@test.com', password: 'UserPass@123' });
  userToken = userReg.body.data.accessToken;
  userId = userReg.body.data.user.id;

  // Create admin user
  const adminReg = await request(app)
    .post('/api/v1/auth/register')
    .send({ email: 'admin@test.com', password: 'AdminPass@123' });
  adminId = adminReg.body.data.user.id;

  // Promote to admin directly
  await prisma.user.update({ where: { id: adminId }, data: { role: 'ADMIN' } });

  const adminLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@test.com', password: 'AdminPass@123' });
  adminToken = adminLogin.body.data.accessToken;
});

afterAll(async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('Task API', () => {
  let taskId;

  describe('POST /api/v1/tasks', () => {
    it('should create a task for authenticated user', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'My first task', description: 'Test task', status: 'TODO' });

      expect(res.status).toBe(201);
      expect(res.body.data.task.title).toBe('My first task');
      expect(res.body.data.task.userId).toBe(userId);
      taskId = res.body.data.task.id;
    });

    it('should return 401 without auth', async () => {
      const res = await request(app).post('/api/v1/tasks').send({ title: 'No auth task' });
      expect(res.status).toBe(401);
    });

    it('should return 400 for missing title', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ description: 'No title' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/tasks', () => {
    it("should return only the authenticated user's tasks", async () => {
      const res = await request(app)
        .get('/api/v1/tasks')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.tasks.every((t) => t.userId === userId)).toBe(true);
    });

    it('should return all tasks for admin', async () => {
      const res = await request(app)
        .get('/api/v1/tasks')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.tasks)).toBe(true);
    });
  });

  describe('GET /api/v1/tasks/:id', () => {
    it('should return a task owned by the user', async () => {
      const res = await request(app)
        .get(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.task.id).toBe(taskId);
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app)
        .get('/api/v1/tasks/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/v1/tasks/:id', () => {
    it('should update a task', async () => {
      const res = await request(app)
        .put(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'IN_PROGRESS', title: 'Updated Title' });
      expect(res.status).toBe(200);
      expect(res.body.data.task.status).toBe('IN_PROGRESS');
    });

    it('should allow admin to update any task', async () => {
      const res = await request(app)
        .put(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Admin updated' });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    it('should delete a task', async () => {
      const res = await request(app)
        .delete(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
    });

    it('should return 404 after deletion', async () => {
      const res = await request(app)
        .get(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('RBAC: Admin routes', () => {
    it('should allow admin to list users', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.users)).toBe(true);
    });

    it('should block non-admin from admin routes', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });
  });
});
