import '../css/LoadingSpinner.css';

function LoadingSpinner({ size = 'medium', label = 'Loading...' }) {
  const sizeClass = `spinner-${size}`;

  return (
    <div className={`loading-spinner ${sizeClass}`}>
      <div className="spinner-inner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {label && <p className="spinner-label">{label}</p>}
    </div>
  );
}

export default LoadingSpinner;
