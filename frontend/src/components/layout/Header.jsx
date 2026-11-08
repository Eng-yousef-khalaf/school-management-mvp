import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { AcademicYearIcon } from '../common/Icons';

export default function Header({ pageTitle, pageSubtitle, onToggleSidebar, activeYearName, onNavigate }) {
  const { user, switchPortalRole } = useAuth();
  const { t, isRtl } = useLanguage();
  const toast = useToast();
  const [switching, setSwitching] = useState(false);

  const roleColor = user?.role === 'ADMIN' ? 'var(--primary)' : user?.role === 'STAFF' ? '#10b981' : '#0ea5e9';
  const roleIcon = user?.role === 'ADMIN' ? '👔' : user?.role === 'STAFF' ? '📋' : '👨‍🏫';
  const roleName = user?.role === 'ADMIN' ? t('roleAdmin') : user?.role === 'STAFF' ? t('roleStaff') : t('roleTeacher');

  const handleRoleChange = async (targetRole) => {
    if (user?.role === targetRole || switching) return;
    setSwitching(true);
    try {
      await switchPortalRole(targetRole);
      if (onNavigate) onNavigate('dashboard');
      toast.success(isRtl ? `تم التبديل بنجاح إلى ${targetRole === 'ADMIN' ? 'بوابة المدير' : targetRole === 'STAFF' ? 'بوابة شؤون الطلاب' : 'بوابة المعلم'}` : `Switched to ${targetRole} Portal`);
    } catch (err) {
      toast.error(err.message || 'Failed to switch role');
    } finally {
      setSwitching(false);
    }
  };

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

      <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Quick Portal Role Switcher */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'var(--bg-main)',
          padding: '3px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          gap: '3px'
        }}>
          <button
            type="button"
            onClick={() => handleRoleChange('ADMIN')}
            disabled={switching}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: user?.role === 'ADMIN' ? '1px solid var(--primary)' : '1px solid transparent',
              background: user?.role === 'ADMIN' ? 'var(--primary)' : 'transparent',
              color: user?.role === 'ADMIN' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: user?.role === 'ADMIN' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'var(--transition)'
            }}
            title={isRtl ? 'الانتقال المباشر إلى بوابة المدير' : 'Switch to Admin Portal'}
          >
            <span>👔</span>
            <span>{isRtl ? 'المدير' : 'Admin'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('STAFF')}
            disabled={switching}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: user?.role === 'STAFF' ? '1px solid #10b981' : '1px solid transparent',
              background: user?.role === 'STAFF' ? '#10b981' : 'transparent',
              color: user?.role === 'STAFF' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: user?.role === 'STAFF' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'var(--transition)'
            }}
            title={isRtl ? 'الانتقال المباشر إلى بوابة شؤون الطلاب' : 'Switch to Staff Portal'}
          >
            <span>📋</span>
            <span>{isRtl ? 'شؤون الطلاب' : 'Staff'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('TEACHER')}
            disabled={switching}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: user?.role === 'TEACHER' ? '1px solid #0ea5e9' : '1px solid transparent',
              background: user?.role === 'TEACHER' ? '#0ea5e9' : 'transparent',
              color: user?.role === 'TEACHER' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: user?.role === 'TEACHER' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'var(--transition)'
            }}
            title={isRtl ? 'الانتقال المباشر إلى بوابة المعلم' : 'Switch to Teacher Portal'}
          >
            <span>👨‍🏫</span>
            <span>{isRtl ? 'المعلم' : 'Teacher'}</span>
          </button>
        </div>

        {/* Current Role Identity Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-main)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-md)',
          border: `1px solid var(--border-color)`,
          boxShadow: 'var(--shadow-sm)'
        }}>
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
