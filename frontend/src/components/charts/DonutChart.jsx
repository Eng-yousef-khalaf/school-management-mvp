import React from 'react';

export default function DonutChart({
  data = [],
  labelKey = 'label',
  valueKey = 'count',
  size = 180,
  colors = ['#4f46e5', '#ec4899', '#06b6d4', '#10b981', '#f59e0b']
}) {
  const total = data.reduce((sum, item) => sum + (Number(item[valueKey]) || 0), 0);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div style={{ height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: 13 }}>
        No chart data
      </div>
    );
  }

  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const slices = data.map((item, index) => {
    const val = Number(item[valueKey]) || 0;
    const percent = val / total;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;

    return {
      ...item,
      color: colors[index % colors.length],
      percent: Math.round(percent * 100),
      strokeDasharray,
      strokeDashoffset,
      val
    };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="80" cy="80" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="24" />
          {slices.map((slice, i) => (
            <circle
              key={i}
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth="24"
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)' }}>{total}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 120 }}>
        {slices.map((slice, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: slice.color }} />
              <span style={{ color: 'var(--text-muted)' }}>{slice[labelKey]}</span>
            </div>
            <strong style={{ color: 'var(--text-main)' }}>{slice.val} ({slice.percent}%)</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
