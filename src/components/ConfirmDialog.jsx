import { createPortal } from 'react-dom';
import '../css/ConfirmDialog.css';

function ConfirmDialog({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, isDangerous = false }) {
  return createPortal(
    <>
      <div className="confirm-overlay" onClick={onCancel}></div>
      <div className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 id="confirm-title" className="confirm-title">{title}</h2>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button
            type="button"
            className="confirm-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`confirm-btn ${isDangerous ? 'dangerous' : 'primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

export default ConfirmDialog;
