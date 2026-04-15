import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initial = user?.email?.[0]?.toUpperCase() || '?';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="logo-icon">⚡</div>
        <span>Primetrade<span style={{ color: 'var(--accent-light)' }}>.ai</span></span>
      </Link>

      {isAuthenticated && (
        <div className="navbar-actions">
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="btn btn-ghost btn-sm">
              🛡️ Admin
            </Link>
          )}
          <Link to="/" className="btn btn-ghost btn-sm">
            📋 Tasks
          </Link>

          <div className="navbar-user">
            <div className="user-avatar">{initial}</div>
            <div className="navbar-user-info">
              <span className="navbar-user-email">{user?.email}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.role}</span>
            </div>
          </div>

          <button id="btn-logout" onClick={handleLogout} className="btn btn-secondary btn-sm">
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
