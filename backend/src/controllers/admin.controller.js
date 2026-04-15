const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * GET /api/v1/admin/users — List all users (admin only)
 */
const listUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { tasks: true } },
        },
      }),
      prisma.user.count(),
    ]);

    return sendSuccess(
      res,
      {
        users,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
      200,
      'Users retrieved'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/admin/users/:id — Delete a user (admin only)
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return sendError(res, 'You cannot delete your own account', 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    await prisma.user.delete({ where: { id } });
    return sendSuccess(res, null, 200, 'User deleted successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/admin/users/:id/role — Promote/demote user role
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return sendError(res, 'Role must be USER or ADMIN', 400);
    }

    if (id === req.user.id) {
      return sendError(res, 'You cannot change your own role', 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return sendError(res, 'User not found', 404);

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true, updatedAt: true },
    });

    return sendSuccess(res, { user: updated }, 200, 'User role updated');
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers, deleteUser, updateUserRole };
