import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Alert from '../components/Alert';

export default function LoginPage() {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.email, form.password);
      }
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      const errors = err.response?.data?.errors;
      setAlert({
        type: 'error',
        message: errors ? errors.map((e) => e.message).join(', ') : msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">⚡</div>
          <h1>Primetrade.ai</h1>
          <p>
            A production-ready task management platform with secure JWT authentication,
            role-based access control, and a real-time dashboard.
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <span className="auth-feature-icon">🔐</span>
              <span>JWT Auth with refresh token rotation</span>
            </div>
            <div className="auth-feature">
              <span className="auth-feature-icon">🛡️</span>
              <span>Role-based access control (USER / ADMIN)</span>
            </div>
            <div className="auth-feature">
              <span className="auth-feature-icon">📋</span>
              <span>Full CRUD with status tracking</span>
            </div>
            <div className="auth-feature">
              <span className="auth-feature-icon">⚙️</span>
              <span>Input validation with Zod schemas</span>
            </div>
            <div className="auth-feature">
              <span className="auth-feature-icon">📚</span>
              <span>Auto-generated Swagger API docs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-card">
          {/* Tab switcher */}
          <div className="auth-tabs">
            <button
              id="tab-login"
              className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => { setTab('login'); setAlert(null); }}
            >
              Sign In
            </button>
            <button
              id="tab-register"
              className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
              onClick={() => { setTab('register'); setAlert(null); }}
            >
              Register
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} id="auth-form">
            <div>
              <h2>{tab === 'login' ? 'Welcome back' : 'Create account'}</h2>
              <p className="subtitle">
                {tab === 'login'
                  ? 'Sign in to access your dashboard'
                  : 'Get started with your free account'}
              </p>
            </div>

            {alert && (
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
              />
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="input-email">Email address</label>
              <input
                id="input-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="input-password">Password</label>
              <input
                id="input-password"
                name="password"
                type="password"
                className="form-input"
                placeholder={tab === 'register' ? 'At least 8 characters' : 'Enter your password'}
                value={form.password}
                onChange={handleChange}
                required
                minLength={tab === 'register' ? 8 : 1}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            <button
              id="btn-auth-submit"
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
              {loading
                ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Processing...</>
                : tab === 'login' ? '→ Sign In' : '→ Create Account'}
            </button>

            {tab === 'login' && (
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                Demo Admin: <strong>admin@primetrade.ai</strong> / Admin@1234
                <br />Demo User: <strong>user@primetrade.ai</strong> / User@1234
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
