import React from 'react';

export const CustomChartTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div 
      className="p-3 rounded-3 shadow-lg border"
      style={{
        backgroundColor: 'rgba(24, 20, 52, 0.92)',
        borderColor: 'rgba(167, 139, 250, 0.3)',
        backdropFilter: 'blur(10px)',
        minWidth: 150
      }}
    >
      {label && (
        <div className="text-light fw-bold small mb-2 border-bottom border-secondary border-opacity-25 pb-1 font-serif">
          {label}
        </div>
      )}
      <div className="d-flex flex-column gap-1">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="d-flex align-items-center justify-content-between gap-3 small">
            <span className="d-flex align-items-center gap-2 text-muted">
              <span
                className="d-inline-block rounded-circle flex-shrink-0"
                style={{ width: 8, height: 8, backgroundColor: entry.color || entry.fill || '#a78bfa' }}
              />
              <span>
                {entry.payload?.fullName 
                  ? `${entry.payload.fullName} (${entry.name})` 
                  : (entry.name || 'Cantidad')}:
              </span>
            </span>
            <span className="fw-bold text-light">
              {formatter ? formatter(entry.value, entry.name) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomChartTooltip;
