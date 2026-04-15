export default function TaskCard({ task, onEdit, onDelete, isAdmin }) {
  const statusMap = {
    TODO: { label: 'To Do', cls: 'badge-todo', icon: '○' },
    IN_PROGRESS: { label: 'In Progress', cls: 'badge-progress', icon: '◑' },
    DONE: { label: 'Done', cls: 'badge-done', icon: '●' },
  };

  const status = statusMap[task.status] || statusMap.TODO;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="task-card" id={`task-card-${task.id}`}>
      <div className="task-card-header">
        <h3 className="task-title">{task.title}</h3>
        <span className={`badge ${status.cls}`}>{status.icon} {status.label}</span>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-footer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span className="task-date">{formatDate(task.createdAt)}</span>
          {isAdmin && task.user && (
            <span className="task-owner">👤 {task.user.email}</span>
          )}
        </div>

        <div className="task-actions">
          <button
            id={`btn-edit-${task.id}`}
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="btn btn-ghost btn-sm"
            title="Edit task"
          >
            ✏️
          </button>
          <button
            id={`btn-delete-${task.id}`}
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            className="btn btn-danger btn-sm"
            title="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
