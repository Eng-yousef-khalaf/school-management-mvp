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
  const { pendingNotices, unreadCount, showPopupForNotice } = useNotifications();
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

  const handleRoleChange = async (targetRole) => {
    if (user?.role === targetRole || switching) return;
    setSwitching(true);
    try {
      await switchPortalRole(targetRole);
      if (onNavigate) onNavigate('dashboard');
      toast.success(isRtl ? `تم التبديل إلى ${targetRole === 'ADMIN' ? 'بوابة المدير' : targetRole === 'STAFF' ? 'بوابة شؤون الطلاب' : 'بوابة المعلم'}` : `Switched to ${targetRole} Portal`);
    } catch (err) {
      toast.error(err.message || 'Failed to switch role');
    } finally {
      setSwitching(false);
    }
  };

  const roleColor = user?.role === 'ADMIN' ? 'var(--primary)' : user?.role === 'STAFF' ? '#10b981' : '#0ea5e9';
  const roleName = user?.role === 'ADMIN' ? (isRtl ? 'المدير' : 'Admin') : user?.role === 'STAFF' ? (isRtl ? 'شؤون الطلاب' : 'Staff') : (isRtl ? 'المعلم' : 'Teacher');

  return (
    <header className="topbar">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="topbar-left">
        <button
          onClick={onToggleSidebar}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            color: 'var(--text-main)'
          }}
          className="mobile-menu-btn"
          aria-label="Toggle Menu"
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

      {/* Right: Academic Year, Role Switcher, Notifications, Language */}
      <div className="topbar-right">
        {/* Academic Year Pill */}
        {activeYear && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: isArchiveView ? 'var(--warning-light)' : 'var(--primary-light)',
            color: isArchiveView ? 'var(--warning-text)' : 'var(--primary-dark)',
            border: `1px solid ${isArchiveView ? 'var(--warning-border)' : 'rgba(79, 70, 229, 0.2)'}`,
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
            fontWeight: 700
          }}>
            <AcademicYearIcon />
            <span>{activeYear.name}</span>
            {isArchiveView && <span style={{ fontSize: 10, opacity: 0.8 }}>({isRtl ? 'أرشيف' : 'Archive'})</span>}
          </div>
        )}

        {/* Quick Portal Role Switcher */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: '#f1f5f9',
          padding: '3px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          gap: '2px'
        }}>
          <button
            type="button"
            onClick={() => handleRoleChange('ADMIN')}
            disabled={switching}
            style={{
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: user?.role === 'ADMIN' ? 'var(--primary)' : 'transparent',
              color: user?.role === 'ADMIN' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '11.5px',
              fontWeight: user?.role === 'ADMIN' ? 800 : 600,
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            👔 {isRtl ? 'المدير' : 'Admin'}
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('STAFF')}
            disabled={switching}
            style={{
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: user?.role === 'STAFF' ? '#10b981' : 'transparent',
              color: user?.role === 'STAFF' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '11.5px',
              fontWeight: user?.role === 'STAFF' ? 800 : 600,
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            📋 {isRtl ? 'شؤون الطلاب' : 'Staff'}
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('TEACHER')}
            disabled={switching}
            style={{
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: user?.role === 'TEACHER' ? '#0ea5e9' : 'transparent',
              color: user?.role === 'TEACHER' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '11.5px',
              fontWeight: user?.role === 'TEACHER' ? 800 : 600,
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            👨‍🏫 {isRtl ? 'المعلم' : 'Teacher'}
          </button>
        </div>

        {/* Notifications Center */}
        <div style={{ position: 'relative' }} ref={notifDropdownRef}>
          <button
            onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
            style={{
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              color: 'var(--text-main)',
              transition: 'var(--transition)'
            }}
            aria-label="Notifications"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -4,
                right: isRtl ? 'auto' : -4,
                left: isRtl ? -4 : 'auto',
                background: '#ef4444',
                color: '#ffffff',
                fontSize: 10,
                fontWeight: 900,
                width: 18,
                height: 18,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Box */}
          {isNotifDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                width: 350,
                right: isRtl ? 'auto' : 0,
                left: isRtl ? 0 : 'auto',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: 14,
                boxShadow: '0 20px 35px -5px rgba(15, 23, 42, 0.3), 0 10px 15px -5px rgba(15, 23, 42, 0.15)',
                zIndex: 10000,
                overflow: 'hidden',
                animation: 'slideInPopup 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                direction: isRtl ? 'rtl' : 'ltr'
              }}
            >
              {/* Solid High-Contrast Header */}
              <div
                style={{
                  padding: '14px 18px',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #334155'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🔔</span>
                  <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: '-0.2px' }}>
                    {isRtl ? 'مركز الإشعارات والتنبيهات' : 'Notifications Center'}
                  </span>
                </div>
                {unreadCount > 0 ? (
                  <span
                    style={{
                      background: '#ef4444',
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 12,
                      boxShadow: '0 2px 6px rgba(239, 68, 68, 0.5)'
                    }}
                  >
                    {unreadCount} {isRtl ? 'جديد' : 'new'}
                  </span>
                ) : (
                  <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
                    {isRtl ? 'مُحدّث' : 'Up to date'}
                  </span>
                )}
              </div>

              {/* Notification Content List */}
              <div style={{ maxHeight: 290, overflowY: 'auto', background: '#ffffff' }}>
                {pendingNotices && pendingNotices.length > 0 ? (
                  pendingNotices.map((n, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                        background: '#ffffff'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                      onClick={() => {
                        if (showPopupForNotice) showPopupForNotice(n);
                        setIsNotifDropdownOpen(false);
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>
                          💳 {n.title || (isRtl ? 'إشعار تحويل مالي' : 'Payment Transfer Notice')}
                        </span>
                        <span style={{ fontSize: 10, color: '#059669', background: '#ecfdf5', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                          {isRtl ? 'تحويل بنكي' : 'Transfer'}
                        </span>
                      </div>
                      <div style={{ color: '#334155', fontSize: 12, lineHeight: 1.5, fontWeight: 600 }}>
                        {n.studentName ? (isRtl ? `طالب: ${n.studentName}` : `Student: ${n.studentName}`) : (n.message || '')}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, fontSize: 11, color: '#64748b' }}>
                        <span>💰 {n.amount ? `${n.amount} شيكل` : (n.notes || '')}</span>
                        <span style={{ color: '#2563eb', fontWeight: 700 }}>{isRtl ? 'مراجعة واعتَماد ←' : 'Review →'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '36px 20px', textAlign: 'center', background: '#ffffff' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🔕</div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', marginBottom: 4 }}>
                      {isRtl ? 'لا توجد إشعارات جديدة حالياً' : 'No new notifications'}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748b' }}>
                      {isRtl ? 'أنت على اطلاع دائم بكافة التنبيهات والأقساط' : 'You are completely caught up!'}
                    </div>
                  </div>
                )}
              </div>

              {/* Solid Footer */}
              <div
                style={{
                  padding: '10px 16px',
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}
              >
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 800,
                    color: '#2563eb',
                    cursor: 'pointer'
                  }}
                  onClick={() => setIsNotifDropdownOpen(false)}
                >
                  {isRtl ? 'إغلاق القائمة' : 'Close Menu'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher />
      </div>
    </header>
  );
}
