import React from 'react';

export default function StatCard({ title, value, subtext, icon, color = 'primary' }) {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <h3>{title}</h3>
        <div className="stat-value">{value ?? '—'}</div>
        {subtext && <div className="stat-sub">{subtext}</div>}
      </div>
      {icon && <div className={`stat-icon ${color}`}>{icon}</div>}
    </div>
  );
}
