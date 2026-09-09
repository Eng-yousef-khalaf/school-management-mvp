import React from 'react';
import { PlusIcon } from './Icons';

export default function EmptyState({
  title = 'No records found',
  description = 'There are no items matching your criteria or database is currently empty.',
  actionText,
  onAction
}) {
  return (
    <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#f1f5f9',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="8" x2="16" y1="12" y2="12" />
        </svg>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: 13, maxWidth: 400, margin: '0 auto 18px', color: 'var(--text-muted)' }}>{description}</p>
      {actionText && onAction && (
        <button className="btn btn-primary btn-sm" onClick={onAction}>
          <PlusIcon /> {actionText}
        </button>
      )}
    </div>
  );
}
