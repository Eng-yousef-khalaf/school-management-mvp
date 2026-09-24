import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSchoolConfig } from '../../context/SchoolConfigContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  DashboardIcon,
  StudentsIcon,
  TeachersIcon,
  ClassesIcon,
  SubjectsIcon,
  AcademicYearIcon,
  EnrollmentIcon,
  AttendanceIcon,
  GradesIcon,
  ReportsIcon,
  UsersIcon,
  AuditLogsIcon,
  SettingsIcon,
  LogoutIcon
} from '../common/Icons';
import SchoolLogo from '../common/SchoolLogo';

export default function Sidebar({ currentPage, onNavigate, isOpen, onClose }) {
  const { user, logout, isAdmin, isStaff, isTeacher } = useAuth();
  const { t, isRtl } = useLanguage();
  const { config } = useSchoolConfig();
  const { unreadCount } = useNotifications();

  // Role-specific navigation definitions
  let navItems = [];

  if (isTeacher) {
    navItems = [
      { id: 'dashboard', label: isRtl ? 'لوحة المعلم' : 'Teacher Dashboard', icon: <DashboardIcon />, section: 'main' },
      { id: 'classes', label: isRtl ? 'صفوفي وموادي' : 'My Classes & Subjects', icon: <ClassesIcon />, section: 'daily' },
      { id: 'students', label: isRtl ? 'سجل طلابي' : 'My Students Roster', icon: <StudentsIcon />, section: 'daily' },
      { id: 'attendance', label: isRtl ? 'دفتر الحضور' : 'Class Attendance', icon: <AttendanceIcon />, section: 'daily' },
      { id: 'grades', label: isRtl ? 'رصد الدرجات' : 'Grades Entry', icon: <GradesIcon />, section: 'daily' },
      { id: 'grade-reports', label: isRtl ? 'كشف الدرجات' : 'Grade Reports', icon: <ReportsIcon />, section: 'reports' },
      { id: 'settings', label: isRtl ? 'إعدادات الحساب' : 'Account Settings', icon: <SettingsIcon />, section: 'system' }
    ];
  } else if (user?.role === 'STAFF') {
    navItems = [
      { id: 'dashboard', label: isRtl ? 'لوحة شؤون الطلاب' : 'Staff Dashboard', icon: <DashboardIcon />, section: 'main' },
      { id: 'students', label: isRtl ? 'إدارة وقبول الطلاب' : 'Student Admissions', icon: <StudentsIcon />, section: 'academic' },
      { id: 'enrollment', label: isRtl ? 'تسكين وتوزيع الفصول' : 'Class Enrollment', icon: <EnrollmentIcon />, section: 'academic' },
      { id: 'classes', label: isRtl ? 'الصفوف والشعب' : 'Classes & Sections', icon: <ClassesIcon />, section: 'academic' },
      { id: 'teachers', label: isRtl ? 'الهيئة التعليمية' : 'Teachers Allocation', icon: <TeachersIcon />, section: 'academic' },
      { id: 'teacher-tracker', label: isRtl ? 'دوام المعلمين' : 'Teacher Check-In', icon: <AttendanceIcon />, section: 'daily' },
      { id: 'fees', label: isRtl ? 'الرسوم والأقساط' : 'Tuition & Fees', icon: <span style={{ fontSize: 16 }}>💰</span>, section: 'daily', badge: unreadCount },
      { id: 'subjects', label: isRtl ? 'المواد والمناهج' : 'Subjects Catalog', icon: <SubjectsIcon />, section: 'daily' },
      { id: 'grade-reports', label: isRtl ? 'كشوف ونتائج الطلاب' : 'Grade Reports', icon: <ReportsIcon />, section: 'reports' },
      { id: 'attendance-reports', label: isRtl ? 'تقارير الحضور' : 'Attendance Reports', icon: <ReportsIcon />, section: 'reports' },
      { id: 'reports', label: isRtl ? 'مركز التقارير الشامل' : 'Reports Hub', icon: <ReportsIcon />, section: 'reports' },
      { id: 'settings', label: isRtl ? 'إعدادات الحساب' : 'Account Settings', icon: <SettingsIcon />, section: 'system' }
    ];
  } else {
    // ADMIN
    navItems = [
      { id: 'dashboard', label: isRtl ? 'لوحة الإشراف العام' : 'Executive Dashboard', icon: <DashboardIcon />, section: 'main' },
      { id: 'developer-hub', label: isRtl ? 'لوحة المطور ⚡' : 'Developer Hub ⚡', icon: <span style={{ fontSize: 16 }}>⚡</span>, section: 'main', visible: Boolean(user?.isDeveloper) },
      { id: 'fees', label: isRtl ? 'الرسوم وحسابات الطلاب' : 'Tuition & Fees', icon: <span style={{ fontSize: 16 }}>💰</span>, section: 'management' },
      { id: 'users', label: isRtl ? 'المستخدمين والصلاحيات' : 'User Accounts', icon: <UsersIcon />, section: 'management' },
      { id: 'teachers', label: isRtl ? 'الهيئة التعليمية' : 'Faculty Directory', icon: <TeachersIcon />, section: 'management' },
      { id: 'teacher-tracker', label: isRtl ? 'دوام المعلمين' : 'Teacher Attendance', icon: <AttendanceIcon />, section: 'management' },
      { id: 'classes', label: isRtl ? 'الصفوف والشعب' : 'Classes & Sections', icon: <ClassesIcon />, section: 'management' },
      { id: 'subjects', label: isRtl ? 'المواد والمناهج' : 'Subjects Catalog', icon: <SubjectsIcon />, section: 'management' },
      { id: 'academic-years', label: isRtl ? 'السنوات والتقويم' : 'Academic Years', icon: <AcademicYearIcon />, section: 'system' },
      { id: 'audit-logs', label: isRtl ? 'سجل التدقيق والأمان' : 'Security Audit Trail', icon: <AuditLogsIcon />, section: 'system' },
      { id: 'reports', label: isRtl ? 'مركز التقارير' : 'Executive Reports', icon: <ReportsIcon />, section: 'reports' },
      { id: 'settings', label: isRtl ? 'إعدادات النظام' : 'System Settings', icon: <SettingsIcon />, section: 'system' }
    ];
  }

  const roleColor = user?.isDeveloper ? '#818cf8' : user?.role === 'ADMIN' ? '#6366f1' : user?.role === 'STAFF' ? '#10b981' : '#0ea5e9';
  const roleName = user?.isDeveloper ? (isRtl ? 'المطور العام' : 'Lead Developer') : user?.role === 'ADMIN' ? (isRtl ? 'المدير العام' : 'Admin') : user?.role === 'STAFF' ? (isRtl ? 'شؤون الطلاب' : 'Staff') : (isRtl ? 'المعلم' : 'Teacher');
  const schoolName = isRtl ? config.schoolNameAr : config.schoolNameEn;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            {config.logoUrl ? (
              <img src={config.logoUrl} alt="Logo" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'contain' }} />
            ) : (
              <SchoolLogo size={36} />
            )}
            <div className="sidebar-brand" style={{ minWidth: 0, flex: 1 }}>
              <h2
                title={schoolName}
                style={{
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  fontSize: '13px',
                  fontWeight: 800,
                  lineHeight: '1.3',
                  margin: 0,
                  color: '#ffffff'
                }}
              >
                {schoolName}
              </h2>
              <span style={{ color: roleColor, fontWeight: 700, fontSize: '11px', marginTop: '2px', display: 'block' }}>
                {roleName}
              </span>
            </div>
          </div>

          <button className="mobile-sidebar-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Navigation Items */}
        <div className="sidebar-nav">
          {navItems
            .filter((item) => item.visible !== false)
            .map((item) => {
              const isActive = currentPage === item.id || (currentPage.startsWith(item.id) && item.id !== 'dashboard');
              return (
                <button
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    onNavigate(item.id);
                    if (onClose) onClose();
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, overflow: 'hidden' }}>
                    {item.icon}
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span style={{
                      background: '#ea580c',
                      color: '#ffffff',
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: 10
                    }}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
        </div>

        {/* User Badge & Logout */}
        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className="user-avatar" style={{ background: roleColor }}>
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="user-details">
              <div className="user-name" title={user?.fullName}>{user?.fullName || 'User'}</div>
              <div className="user-role-tag">{roleName}</div>
            </div>
          </div>

          <button className="btn-prominent-logout" onClick={logout}>
            <LogoutIcon />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
