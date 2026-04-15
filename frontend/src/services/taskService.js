import api from './api';

export const taskService = {
  list: (params = {}) =>
    api.get('/tasks', { params }),

  create: (data) =>
    api.post('/tasks', data),

  get: (id) =>
    api.get(`/tasks/${id}`),

  update: (id, data) =>
    api.put(`/tasks/${id}`, data),

  delete: (id) =>
    api.delete(`/tasks/${id}`),
};

export const adminService = {
  listUsers: (params = {}) =>
    api.get('/admin/users', { params }),

  deleteUser: (id) =>
    api.delete(`/admin/users/${id}`),

  updateRole: (id, role) =>
    api.patch(`/admin/users/${id}/role`, { role }),
};
