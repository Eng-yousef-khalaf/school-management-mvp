import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { useSchoolConfig } from '../../context/SchoolConfigContext';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { AcademicYearIcon, LogoutIcon } from '../common/Icons';

export default function Header({ pageTitle, pageSubtitle, onToggleSidebar, onNavigate }) {
  const { user, switchPortalRole, logout } = useAuth();
  const { t, isRtl } = useLanguage();
  const { config } = useSchoolConfig();
  const toast = useToast();
  const { activeYear, allYears, selectedYearId, isArchiveView, setViewingYearId } = useAcademicYear();
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
      toast.success(isRtl ? `تم التبديل بنجاح إلى ${targetRole === 'ADMIN' ? 'بوابة المدير' : targetRole === 'STAFF' ? 'بوابة شؤون المعلمين والطلاب' : 'بوابة المعلم'}` : `Switched to ${targetRole} Portal`);
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
            title={isRtl ? 'الانتقال المباشر إلى بوابة شؤون المعلمين والطلاب' : 'Switch to Faculty & Student Affairs Portal'}
          >
            <span>📋</span>
            <span>{isRtl ? 'شؤون المعلمين والطلاب' : 'Staff Affairs'}</span>
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

        {/* Daily Motivation Trigger */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('open-daily-motivation'))}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            color: '#92400e',
            border: '1px solid #fcd34d',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'var(--transition)'
          }}
          title={isRtl ? 'عرض رسالة وطاقة اليوم التحفيزية' : 'View Today’s Motivational Message'}
        >
          <span>✨</span>
          <span>{isRtl ? 'رسالة اليوم' : 'Daily Spark'}</span>
        </button>

        {/* School Instance Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          padding: '5px 10px',
          borderRadius: 'var(--radius-md)',
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--primary)'
        }}>
          <span>🏫</span>
          <span>{config.schoolCode}</span>
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

        {/* Academic Year Control */}
        {user?.role === 'ADMIN' ? (
          /* Admin Archive & Year Selector */
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: isArchiveView ? '#fffbeb' : '#ecfdf5',
              border: `1.5px solid ${isArchiveView ? '#f59e0b' : '#10b981'}`,
              borderRadius: 'var(--radius-md)',
              padding: '4px 10px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}>
              <span style={{ fontSize: 14 }}>{isArchiveView ? '📁' : '🟢'}</span>
              <select
                value={selectedYearId || ''}
                onChange={(e) => setViewingYearId(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                  color: isArchiveView ? '#92400e' : '#065f46',
                  cursor: 'pointer'
                }}
                title={isRtl ? 'تبديل العام الدراسي / استعراض الأرشيف للمدير' : 'Academic Year Selector (Admin Archive Inspection)'}
              >
                {allYears.map(y => (
                  <option key={y.id} value={y.id}>
                    {y.active
                      ? (isRtl ? `العام الحالي النشط: ${y.name}` : `Active Year: ${y.name}`)
                      : (isRtl ? `📁 أرشيف: ${y.name} (للمراجعة)` : `📁 Archive: ${y.name} (Read-Only)`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          /* Staff & Teachers: Strictly Locked to Current Active Year */
          activeYear && (
            <div className="academic-year-badge" style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46' }}>
              <AcademicYearIcon style={{ width: 14, height: 14, color: '#10b981' }} />
              <span>{isRtl ? `العام الدراسي: ${activeYear.name}` : `Active: ${activeYear.name}`}</span>
            </div>
          )
        )}

        {/* Prominent Quick Logout Button */}
        <button
          type="button"
          className="btn-header-logout"
          onClick={logout}
          title={isRtl ? 'تسجيل الخروج من الحساب والعودة لشاشة الدخول' : 'Sign out of your account'}
        >
          <LogoutIcon style={{ width: 16, height: 16 }} />
          <span className="logout-text">{isRtl ? 'تسجيل الخروج' : 'Logout'}</span>
        </button>
      </div>
    </header>
  );
}
