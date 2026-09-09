import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSwitcher({ className = '', style = {} }) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      className={`lang-switch-btn ${className}`}
      onClick={toggleLanguage}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'var(--primary-light)',
        color: 'var(--primary)',
        border: '1px solid rgba(79, 70, 229, 0.2)',
        borderRadius: 'var(--radius-md)',
        padding: '6px 12px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'var(--transition)',
        ...style
      }}
      title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
    >
      <span style={{ fontSize: '15px' }}>🌐</span>
      <span>{language === 'ar' ? 'English' : 'العربية'}</span>
    </button>
  );
}
