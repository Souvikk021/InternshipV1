import { useState, useEffect } from 'react';

export default function Alert({ type = 'info', message, onClose, duration = 4000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible || !message) return null;

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  return (
    <div className={`alert alert-${type}`} role="alert">
      <span>{icons[type]}</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={() => { setVisible(false); onClose(); }}
          style={{ background: 'none', border: 'none', color: 'inherit', fontSize: '16px', cursor: 'pointer', opacity: 0.7 }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
