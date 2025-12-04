import { useState } from 'react';
import '../css/Tooltip.css';

function Tooltip({ text, children, position = 'top', delay = 200 }) {
  const [visible, setVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => setVisible(true), delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setVisible(false);
  };

  return (
    <div
      className="tooltip-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {visible && (
        <div className={`tooltip tooltip-${position}`} role="tooltip">
          {text}
          <div className="tooltip-arrow"></div>
        </div>
      )}
    </div>
  );
}

export default Tooltip;
