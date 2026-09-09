import React from 'react';

export default function BarChart({ data = [], xKey = 'className', yKey = 'count', height = 220, color = 'var(--primary)' }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: 13 }}>
        No chart data available
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => Number(d[yKey]) || 0), 1);
  const chartHeight = height - 40;

  return (
    <div style={{ width: '100%', height }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', height: chartHeight, gap: 12, paddingBottom: 8, borderBottom: '1px solid var(--border-color)' }}>
        {data.map((item, idx) => {
          const val = Number(item[yKey]) || 0;
          const barHeightPercent = Math.max(8, (val / maxVal) * 100);
          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                {val}
              </span>
              <div
                style={{
                  width: '100%',
                  maxWidth: 42,
                  height: `${barHeightPercent}%`,
                  background: `linear-gradient(180deg, ${color}, #818cf8)`,
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.4s ease-out'
                }}
                title={`${item[xKey]}: ${val}`}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        {data.map((item, idx) => (
          <div key={idx} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item[xKey]}
          </div>
        ))}
      </div>
    </div>
  );
}
