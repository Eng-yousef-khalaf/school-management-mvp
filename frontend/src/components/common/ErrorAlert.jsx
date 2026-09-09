import React from 'react';
import { AlertCircleIcon } from './Icons';

export default function ErrorAlert({ message, onRetry }) {
  if (!message) return null;
  return (
    <div
      style={{
        background: 'var(--danger-light)',
        border: '1px solid #fecaca',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        color: 'var(--danger)',
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        margin: '16px 0'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertCircleIcon />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: 'transparent',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            borderRadius: 4,
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
