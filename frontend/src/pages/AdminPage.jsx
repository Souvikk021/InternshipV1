import { useState, useEffect } from 'react';
import { adminService } from '../services/taskService';
import { useAuth } from '../contexts/AuthContext';
import Alert from '../components/Alert';

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.listUsers();
      setUsers(res.data.data.users || []);
    } catch {
      showAlert('error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user and all their tasks?')) return;
    try {
      await adminService.deleteUser(id);
      showAlert('success', 'User deleted');
      fetchUsers();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleRoleToggle = async (id, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Change role to ${newRole}?`)) return;
    try {
      await adminService.updateRole(id, newRole);
      showAlert('success', `Role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to update role');
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="page">
      <div className="container">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>🛡️ Admin Panel</h1>
            <p>Manage users and their roles</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge badge-admin">ADMIN ACCESS</span>
          </div>
        </div>

        {alert && (
          <div style={{ marginBottom: 16 }}>
            <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
          </div>
        )}

        <div className="stats-row" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <span className="stat-label">Total Users</span>
            <span className="stat-value accent">{users.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Admins</span>
            <span className="stat-value" style={{ color: 'var(--accent-light)' }}>
              {users.filter((u) => u.role === 'ADMIN').length}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Regular Users</span>
            <span className="stat-value" style={{ color: 'var(--info)' }}>
              {users.filter((u) => u.role === 'USER').length}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Tasks</span>
            <span className="stat-value success">
              {users.reduce((sum, u) => sum + (u._count?.tasks || 0), 0)}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay">
            <div className="spinner" />
            <span>Loading users...</span>
          </div>
        ) : (
          <div className="glass" style={{ overflow: 'hidden' }}>
            <table className="users-table" id="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Tasks</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    const initial = u.email[0].toUpperCase();
                    return (
                      <tr key={u.id} id={`user-row-${u.id}`}>
                        <td>
                          <div className="user-email-cell">
                            <div className="user-avatar" style={{ flexShrink: 0 }}>{initial}</div>
                            <div>
                              <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 13 }}>
                                {u.email}
                                {isSelf && <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--accent-light)' }}>(you)</span>}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.id.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${u.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {u._count?.tasks ?? 0}
                        </td>
                        <td>{formatDate(u.createdAt)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              id={`btn-role-${u.id}`}
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleRoleToggle(u.id, u.role)}
                              disabled={isSelf}
                              title={isSelf ? 'Cannot change own role' : `Switch to ${u.role === 'ADMIN' ? 'USER' : 'ADMIN'}`}
                            >
                              {u.role === 'ADMIN' ? '👤 → User' : '🛡️ → Admin'}
                            </button>
                            <button
                              id={`btn-del-user-${u.id}`}
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(u.id)}
                              disabled={isSelf}
                              title={isSelf ? 'Cannot delete yourself' : 'Delete user'}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
