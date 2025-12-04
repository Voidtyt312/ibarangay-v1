import { useState } from 'react';
import '../css/ErrorAlert.css';

function ErrorAlert({ message, onRetry, onDismiss, type = 'error', autoClose = false }) {
  const [visible, setVisible] = useState(true);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  const handleRetry = () => {
    onRetry?.();
  };

  if (!visible) return null;

  const iconMap = {
    error: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    warning: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    success: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  };

  return (
    <div className={`error-alert alert-${type}`}>
      <div className="alert-icon">{iconMap[type]}</div>
      <div className="alert-content">
        <p className="alert-message">{message}</p>
      </div>
      <div className="alert-actions">
        {onRetry && (
          <button type="button" className="alert-retry" onClick={handleRetry}>
            Retry
          </button>
        )}
        <button type="button" className="alert-dismiss" onClick={handleDismiss}>
          ✕
        </button>
      </div>
    </div>
  );
}

export default ErrorAlert;
