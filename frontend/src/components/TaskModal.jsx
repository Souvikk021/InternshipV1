import { useState, useEffect } from 'react';

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];

export default function TaskModal({ task, onSave, onClose, loading }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'TODO',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'TODO',
      });
    }
  }, [task]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    await onSave(form);
  };

  const isEdit = !!task?.id;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? '✏️ Edit Task' : '➕ New Task'}</h2>
          <button className="modal-close" onClick={onClose} id="btn-modal-close">✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit} id="task-form">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              id="input-task-title"
              name="title"
              className="form-input"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={handleChange}
              autoFocus
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              id="input-task-description"
              name="description"
              className="form-input"
              placeholder="Add more details (optional)"
              value={form.description}
              onChange={handleChange}
              rows={3}
              maxLength={1000}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              id="select-task-status"
              name="status"
              className="form-select"
              value={form.status}
              onChange={handleChange}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === 'TODO' ? '○ To Do' : s === 'IN_PROGRESS' ? '◑ In Progress' : '● Done'}
                </option>
              ))}
            </select>
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary" id="btn-modal-cancel">
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              id="btn-modal-save"
              disabled={loading}
            >
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Saving...</> : isEdit ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
