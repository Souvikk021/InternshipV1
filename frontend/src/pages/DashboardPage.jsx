import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { taskService } from '../services/taskService';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import Alert from '../components/Alert';

const STATUS_FILTERS = ['ALL', 'TODO', 'IN_PROGRESS', 'DONE'];

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modal, setModal] = useState(null); // null | { task?: object }
  const [alert, setAlert] = useState(null);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchTasks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await taskService.list(params);
      setTasks(res.data.data.tasks || []);
      setPagination(res.data.data.pagination || {});
    } catch {
      showAlert('error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchTasks(1); }, [fetchTasks]);

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (modal.task?.id) {
        await taskService.update(modal.task.id, formData);
        showAlert('success', 'Task updated successfully ✅');
      } else {
        await taskService.create(formData);
        showAlert('success', 'Task created successfully 🎉');
      }
      setModal(null);
      fetchTasks(pagination.page);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save task';
      showAlert('error', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.delete(id);
      showAlert('success', 'Task deleted');
      fetchTasks(pagination.page);
    } catch {
      showAlert('error', 'Failed to delete task');
    }
  };

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'TODO').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    done: tasks.filter((t) => t.status === 'DONE').length,
  };

  return (
    <>
      <div className="page">
        <div className="container">
          {/* Header */}
          <div className="dashboard-header">
            <div className="dashboard-title">
              <h1>
                {isAdmin ? '🛡️ All Tasks' : '📋 My Tasks'}
              </h1>
              <p>
                {isAdmin
                  ? `Managing all ${pagination.total} tasks across all users`
                  : `You have ${pagination.total} task${pagination.total !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button
              id="btn-create-task"
              className="btn btn-primary"
              onClick={() => setModal({ task: null })}
            >
              ＋ New Task
            </button>
          </div>

          {/* Alert */}
          {alert && (
            <div style={{ marginBottom: 16 }}>
              <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            </div>
          )}

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-label">Total</span>
              <span className="stat-value accent">{stats.total}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">To Do</span>
              <span className="stat-value" style={{ color: 'var(--text-secondary)' }}>{stats.todo}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">In Progress</span>
              <span className="stat-value warning">{stats.inProgress}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Done</span>
              <span className="stat-value success">{stats.done}</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar">
            <input
              id="input-search"
              className="form-input filter-search"
              placeholder="🔍 Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              id="select-status-filter"
              className="form-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); }}
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === 'ALL' ? 'All Status' : s === 'IN_PROGRESS' ? 'In Progress' : s === 'TODO' ? 'To Do' : 'Done'}
                </option>
              ))}
            </select>
          </div>

          {/* Tasks Grid */}
          {loading ? (
            <div className="loading-overlay">
              <div className="spinner" />
              <span>Loading tasks...</span>
            </div>
          ) : (
            <>
              <div className="tasks-grid">
                {filtered.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>No tasks found</h3>
                    <p>
                      {search
                        ? `No tasks match "${search}"`
                        : 'Create your first task to get started'}
                    </p>
                  </div>
                ) : (
                  filtered.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isAdmin={isAdmin}
                      onEdit={(t) => setModal({ task: t })}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchTasks(pagination.page - 1)}
                  >
                    ← Prev
                  </button>
                  <span className="page-info">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchTasks(pagination.page + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Task Modal */}
      {modal && (
        <TaskModal
          task={modal.task}
          onSave={handleSave}
          onClose={() => setModal(null)}
          loading={saving}
        />
      )}
    </>
  );
}
