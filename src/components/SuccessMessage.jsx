import { useState, useEffect } from 'react';
import '../css/SuccessMessage.css';

function SuccessMessage({ message, duration = 4000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className="success-message" role="status" aria-live="polite">
      <div className="success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <p className="success-text">{message}</p>
      <button
        type="button"
        className="success-close"
        onClick={() => {
          setVisible(false);
          onClose?.();
        }}
        aria-label="Close success message"
      >
        ✕
      </button>
    </div>
  );
}

export default SuccessMessage;
