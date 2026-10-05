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
        fontSize: '12.5px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'var(--transition)',
        flexShrink: 0,
        ...style
      }}
      title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
    >
      <span style={{ fontSize: '15px', lineHeight: 1 }}>🌐</span>
      <span className="lang-text-full">{language === 'ar' ? 'English' : 'العربية'}</span>
      <span className="lang-text-abbr">{language === 'ar' ? 'EN' : 'AR'}</span>
    </button>
  );
}
