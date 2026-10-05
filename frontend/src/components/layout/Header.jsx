import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { useSchoolConfig } from '../../context/SchoolConfigContext';
import { useNotifications } from '../../context/NotificationContext';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { AcademicYearIcon, LogoutIcon } from '../common/Icons';
import UserAvatar from '../common/UserAvatar';

export default function Header({ pageTitle, pageSubtitle, onToggleSidebar, onNavigate }) {
  const { user, isSuperAdmin, isBranchManager, logout } = useAuth();
  const { t, isRtl } = useLanguage();
  const { config } = useSchoolConfig();
  const toast = useToast();
  const { activeYear, allYears, selectedYearId, isArchiveView, setViewingYearId } = useAcademicYear();
  const { pendingNotices, unreadCount, showPopupForNotice } = useNotifications();
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

  const isGeneralDirector = isSuperAdmin || user?.role === 'SUPER_ADMIN' || (!user?.branchId && user?.role === 'ADMIN');
  const isBranchAdmin = isBranchManager || (Boolean(user?.branchId) && user?.role === 'ADMIN');

  const roleColor = isGeneralDirector ? '#ec4899' : isBranchAdmin ? '#4f46e5' : user?.role === 'STAFF' ? '#10b981' : '#0ea5e9';
  const roleName = isGeneralDirector
    ? (isRtl ? 'المدير العام (إشراف كافة الفروع)' : 'General Director (All Branches)')
    : isBranchAdmin
    ? (isRtl ? `مدير الفرع (${user?.branch?.name || 'فرع المدرسة'})` : `Branch Director (${user?.branch?.name || 'Branch'})`)
    : user?.role === 'STAFF'
    ? (isRtl ? 'شؤون الطلاب والقبول' : 'Staff & Admissions')
    : (isRtl ? 'المعلم' : 'Teacher');

  return (
    <header className="topbar">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="topbar-left">
        <button
          onClick={onToggleSidebar}
          className="mobile-menu-btn"
          aria-label="Toggle Menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="topbar-title">
          <h1>{pageTitle}</h1>
          {pageSubtitle && <p className="topbar-subtitle">{pageSubtitle}</p>}
        </div>
      </div>

      {/* Right: Academic Year, User Profile Chip, Notifications, Language */}
      <div className="topbar-right">
        {/* Academic Year Pill */}
        {activeYear && (
          <div
            className={`topbar-pill topbar-year-pill ${isArchiveView ? 'archive' : 'active'}`}
            title={isArchiveView ? (isRtl ? 'عرض الأرشيف' : 'Archive Inspection') : (isRtl ? 'العام الدراسي النشط' : 'Active Academic Year')}
          >
            <AcademicYearIcon />
            <span className="year-pill-text">{activeYear.name}</span>
            {isArchiveView && <span className="year-pill-tag">({isRtl ? 'أرشيف' : 'Archive'})</span>}
          </div>
        )}

        {/* Branch Context Pill */}
        {user?.branch ? (
          <div
            className="topbar-pill topbar-branch-pill"
            title={isRtl ? `فرع: ${user.branch.name}` : `Branch: ${user.branch.name}`}
          >
            <span>🏫</span>
            <span className="branch-pill-text">{user.branch.name}</span>
          </div>
        ) : isGeneralDirector ? (
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('branches')}
            className="topbar-pill topbar-branch-pill director-pill"
            title={isRtl ? 'عرض لوحة تحكم الفروع والمدير العام' : 'View General Director Branches Hub'}
          >
            <span>🏢</span>
            <span className="branch-pill-text">{isRtl ? 'المدير العام' : 'General Director'}</span>
          </button>
        ) : null}

        {/* User Profile Chip with Avatar */}
        <div
          className="topbar-user-chip"
          onClick={() => onNavigate && onNavigate('settings')}
          title={isRtl ? `الملف الشخصي (${user?.fullName || 'المستخدم'})` : `Account Profile (${user?.fullName || 'User'})`}
        >
          <UserAvatar
            src={user?.photoUrl || user?.teacher?.photoUrl}
            name={user?.fullName}
            role={user?.role}
            size={32}
            showRoleBadge={false}
          />
          <div className="topbar-user-info">
            <span className="user-name-text">
              {user?.fullName || 'User'}
            </span>
            <span className="user-role-text" style={{ color: roleColor }}>
              {roleName}
            </span>
          </div>
        </div>

        {/* Notifications Center (Strictly for STAFF: شؤون الطلاب) */}
        {user?.role === 'STAFF' && (
        <div style={{ position: 'relative' }} ref={notifDropdownRef}>
          <button
            onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
            className="topbar-icon-btn"
            aria-label="Notifications"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="topbar-badge-count">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Box */}
          {isNotifDropdownOpen && (
            <div
              className="notifications-dropdown-menu"
              style={{
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
        )}

        {/* Language Switcher */}
        <LanguageSwitcher />
      </div>
    </header>
  );
}
