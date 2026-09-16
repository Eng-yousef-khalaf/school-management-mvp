import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { useSchoolConfig } from '../../context/SchoolConfigContext';
import { useNotifications } from '../../context/NotificationContext';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { AcademicYearIcon, LogoutIcon } from '../common/Icons';

export default function Header({ pageTitle, pageSubtitle, onToggleSidebar, onNavigate }) {
  const { user, switchPortalRole, logout } = useAuth();
  const { t, isRtl } = useLanguage();
  const { config } = useSchoolConfig();
  const toast = useToast();
  const { activeYear, allYears, selectedYearId, isArchiveView, setViewingYearId } = useAcademicYear();
  const { pendingNotices, unreadCount, isStaffOnly, showPopupForNotice } = useNotifications();
  const [switching, setSwitching] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const notifDropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

          {/* Direct Developer Engineering Hub Switcher */}
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#developer';
              window.location.reload();
            }}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #4338ca',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              color: '#c7d2fe',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'var(--transition)',
              boxShadow: '0 2px 6px rgba(49, 46, 129, 0.2)'
            }}
            title={isRtl ? 'الانتقال إلى لوحة تحكم وتشخيص مهندس المنظومة' : 'Open Developer Engineering Hub'}
          >
            <span>⚡</span>
            <span>{isRtl ? 'المطور' : 'Dev Hub'}</span>
          </button>
        </div>

        {/* Staff-Exclusive Incoming Payment Notices Bell */}
        {isStaffOnly && (
          <div style={{ position: 'relative' }} ref={notifDropdownRef}>
            <button
              type="button"
              onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                background: unreadCount > 0 ? '#0284c7' : 'var(--bg-main)',
                color: unreadCount > 0 ? '#ffffff' : 'var(--text-muted)',
                border: unreadCount > 0 ? '1px solid #38bdf8' : '1px solid var(--border-color)',
                cursor: 'pointer',
                fontSize: 16,
                boxShadow: unreadCount > 0 ? '0 0 14px rgba(56, 189, 248, 0.5)' : 'var(--shadow-sm)',
                transition: 'var(--transition)'
              }}
              title={isRtl ? `إشعارات الحوالات الواردة (${unreadCount})` : `Payment Notices (${unreadCount})`}
              aria-label="Payment Notifications"
            >
              <span style={{ transform: unreadCount > 0 ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s' }}>🔔</span>
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -5,
                    right: isRtl ? 'auto' : -5,
                    left: isRtl ? -5 : 'auto',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: 900,
                    width: 19,
                    height: 19,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(239, 68, 68, 0.6)',
                    border: '2px solid #ffffff'
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {isNotifDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '46px',
                  right: isRtl ? 'auto' : 0,
                  left: isRtl ? 0 : 'auto',
                  width: '340px',
                  background: 'linear-gradient(135deg, #091a2b 0%, #0c2b44 100%)',
                  border: '1.5px solid #38bdf8',
                  borderRadius: '14px',
                  boxShadow: '0 16px 36px rgba(0, 0, 0, 0.45), 0 0 20px rgba(56, 189, 248, 0.25)',
                  zIndex: 9999,
                  color: '#ffffff',
                  padding: '14px',
                  animation: 'fadeIn 0.2s ease',
                  direction: isRtl ? 'rtl' : 'ltr'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: 10, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16 }}>📬</span>
                    <strong style={{ fontSize: 13.5, color: '#ffffff' }}>
                      {isRtl ? 'إشعارات التحويل الواردة' : 'Incoming Payment Proofs'}
                    </strong>
                  </div>
                  <span style={{ background: unreadCount > 0 ? '#ea580c' : '#10b981', color: '#ffffff', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 12 }}>
                    {unreadCount} {isRtl ? 'قيد الاعتماد' : 'Pending'}
                  </span>
                </div>

                {/* List of Pending Notices */}
                <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pendingNotices.length > 0 ? (
                    pendingNotices.map((notice) => (
                      <div
                        key={notice.id}
                        style={{
                          background: 'rgba(3, 14, 26, 0.75)',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          borderRadius: '10px',
                          padding: '10px 12px',
                          fontSize: 12.5,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <strong style={{ color: '#ffffff', fontSize: 13 }}>{notice.studentName}</strong>
                            <div style={{ color: '#7dd3fc', fontSize: 11 }}>{notice.studentNumber} • {notice.className}</div>
                          </div>
                          <span style={{ color: '#34d399', fontWeight: 900, fontSize: 14 }}>{notice.amount} ₪</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{notice.method === 'BANK_OF_PALESTINE' ? 'بنك فلسطين' : notice.method === 'JAWWAL_PAY' ? 'جوال باي' : notice.method}</span>
                          <code style={{ color: '#38bdf8' }}>{notice.transactionRef}</code>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsNotifDropdownOpen(false);
                            if (onNavigate) onNavigate('fees');
                          }}
                          style={{
                            background: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: 11.5,
                            fontWeight: 800,
                            marginTop: 4,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4
                          }}
                        >
                          <span>👁️</span>
                          <span>{isRtl ? 'معاينة واعتماد بنقرة واحدة' : '1-Click Review & Approve'}</span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '16px 0', color: '#94a3b8', fontSize: 12.5 }}>
                      <span>✓ {isRtl ? 'لا توجد إشعارات تحويل معلقة حالياً' : 'No pending payment notices'}</span>
                    </div>
                  )}
                </div>

                {/* Footer link to full fees page */}
                <div style={{ borderTop: '1px solid rgba(56, 189, 248, 0.2)', paddingTop: 10, marginTop: 10, textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotifDropdownOpen(false);
                      if (onNavigate) onNavigate('fees');
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#38bdf8',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    {isRtl ? 'الانتقال إلى صفحة الرسوم والأقساط كاملة ⤶' : 'Go to All Fees & Ledger ⤶'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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
