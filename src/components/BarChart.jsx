import { useState } from 'react';
import '../css/BarChart.css';

function BarChart({ data = [], maxValue = 100, scale = 5, onScaleChange = null }) {
  
  // Calculate scaled max value
  let scaledMaxValue = Math.max(maxValue * (scale / 5), 5);
  
  // Round to nearest sensible increment (10, 20, 25, 50, 100, etc.)
  const roundToNicerNumber = (num) => {
    const magnitude = Math.pow(10, Math.floor(Math.log10(num)));
    const normalized = num / magnitude;
    
    let rounded;
    if (normalized <= 1) rounded = 1;
    else if (normalized <= 2) rounded = 2;
    else if (normalized <= 2.5) rounded = 2.5;
    else if (normalized <= 5) rounded = 5;
    else rounded = 10;
    
    return Math.ceil(rounded * magnitude);
  };
  
  scaledMaxValue = roundToNicerNumber(scaledMaxValue);

  // Generate y-axis labels from scaledMaxValue to 0 (top to bottom) - perfectly incremental whole numbers
  const interval = scaledMaxValue / 5;
  const yAxisLabels = Array.from({ length: 6 }, (_, i) => {
    return Math.round((5 - i) * interval);
  });

  const handleZoom = (direction) => {
    let newScale = scale;
    if (direction === 'in' && scale < 100) {
      newScale = scale + 5;
    } else if (direction === 'out' && scale > 3) {
      newScale = scale - 5;
    }
    if (onScaleChange && newScale !== scale) {
      onScaleChange(newScale);
    }
  };

  return (
    <div className="bar-chart-container">
      <div className="chart-controls">
        <button 
          className="zoom-btn" 
          onClick={() => handleZoom('out')}
          title="Zoom Out"
        >
          −
        </button>
        <span className="zoom-label">{Math.round((scale / 5) * 100)}%</span>
        <button 
          className="zoom-btn" 
          onClick={() => handleZoom('in')}
          title="Zoom In"
        >
          +
        </button>
      </div>
      <div className="bar-chart">
        <div className="chart-y-axis">
          {yAxisLabels.map((value) => (
            <div key={value} className="y-axis-label">
              {value}
            </div>
          ))}
        </div>
        <div className="chart-content">
          <div className="chart-bars">
            {data.map((item, index) => {
              const height = (item.value / scaledMaxValue) * 100;
              return (
                <div key={index} className="chart-bar-wrapper" style={{ position: 'relative' }}>
                  <div
                    className="chart-bar"
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${item.label}: ${item.value}`}
                  >
                    <span className="bar-value">{item.value}</span>
                  </div>
                  <div className="bar-label">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BarChart;

