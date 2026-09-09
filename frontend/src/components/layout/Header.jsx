import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { AcademicYearIcon } from '../common/Icons';

export default function Header({ pageTitle, pageSubtitle, onToggleSidebar, activeYearName }) {
  const { user } = useAuth();
  const { t, isRtl } = useLanguage();

  const roleColor = user?.role === 'ADMIN' ? 'var(--primary)' : user?.role === 'STAFF' ? '#10b981' : '#0ea5e9';
  const roleIcon = user?.role === 'ADMIN' ? '👔' : user?.role === 'STAFF' ? '📋' : '👨‍🏫';
  const roleName = user?.role === 'ADMIN' ? t('roleAdmin') : user?.role === 'STAFF' ? t('roleStaff') : t('roleTeacher');

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          onClick={onToggleSidebar}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 8
          }}
          className="mobile-menu-btn"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" x2="21" y1="6" y2="6" />
            <line x1="3" x2="21" y1="12" y2="12" />
            <line x1="3" x2="21" y1="18" y2="18" />
          </svg>
        </button>
        <div className="topbar-title">
          <h1>{pageTitle}</h1>
          {pageSubtitle && <p>{pageSubtitle}</p>}
        </div>
      </div>

      <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        {/* Strict Role Identity Badge (Shows ONLY current logged-in role) */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-main)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-md)',
          border: `1px solid var(--border-color)`,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ fontSize: '16px' }}>{roleIcon}</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: roleColor }}>
            {roleName}
          </span>
          <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>|</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
            {user?.fullName}
          </span>
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {activeYearName && (
          <div className="academic-year-badge">
            <AcademicYearIcon style={{ width: 14, height: 14 }} />
            <span>{t('activeYear')}: {activeYearName}</span>
          </div>
        )}
      </div>
    </header>
  );
}
