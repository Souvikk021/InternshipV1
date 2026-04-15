const prisma = require('../config/db');

/**
 * Get tasks — users see only their own, admins see all
 * @param {object} user - { id, role }
 * @param {object} filters - { status, page, limit }
 */
const getTasks = async (user, { status, page = 1, limit = 20 } = {}) => {
  const where = {};

  // IDOR prevention: scope by userId unless ADMIN
  if (user.role !== 'ADMIN') {
    where.userId = user.id;
  }
  if (status) {
    where.status = status;
  }

  const skip = (page - 1) * limit;

  const [tasks, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, role: true } },
      },
    }),
    prisma.task.count({ where }),
  ]);

  return {
    tasks,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Create a new task
 * @param {string} userId
 * @param {{ title, description, status }} data
 */
const createTask = async (userId, { title, description, status }) => {
  return prisma.task.create({
    data: { title, description, status: status || 'TODO', userId },
    include: { user: { select: { id: true, email: true, role: true } } },
  });
};

/**
 * Get a single task by ID (with ownership/admin check)
 * @param {string} taskId
 * @param {object} user - { id, role }
 */
const getTask = async (taskId, user) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { user: { select: { id: true, email: true, role: true } } },
  });

  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  // IDOR check: users can only access their own tasks
  if (user.role !== 'ADMIN' && task.userId !== user.id) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }

  return task;
};

/**
 * Update a task by ID (with ownership/admin check)
 * @param {string} taskId
 * @param {object} user - { id, role }
 * @param {{ title, description, status }} data
 */
const updateTask = async (taskId, user, data) => {
  // First check existence and ownership
  await getTask(taskId, user);

  return prisma.task.update({
    where: { id: taskId },
    data,
    include: { user: { select: { id: true, email: true, role: true } } },
  });
};

/**
 * Delete a task by ID (with ownership/admin check)
 * @param {string} taskId
 * @param {object} user - { id, role }
 */
const deleteTask = async (taskId, user) => {
  // First check existence and ownership
  await getTask(taskId, user);

  return prisma.task.delete({ where: { id: taskId } });
};

module.exports = { getTasks, createTask, getTask, updateTask, deleteTask };
