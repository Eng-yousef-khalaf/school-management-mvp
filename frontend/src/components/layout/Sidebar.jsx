import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSchoolConfig } from '../../context/SchoolConfigContext';
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
  const { user, logout, isAdmin, isStaff, isTeacher, isDeveloper } = useAuth();
  const { t, isRtl } = useLanguage();
  const { config } = useSchoolConfig();

  // Role-specific navigation definitions
  let navItems = [];

  if (isTeacher) {
    navItems = [
      { id: 'dashboard', label: isRtl ? 'لوحة المعلم' : 'Teacher Dashboard', icon: <DashboardIcon />, visible: true },
      { id: 'classes', label: isRtl ? 'صفوفي وموادي' : 'My Classes & Subjects', icon: <ClassesIcon />, visible: true },
      { id: 'students', label: isRtl ? 'سجل طلابي' : 'My Students Roster', icon: <StudentsIcon />, visible: true },
      { id: 'attendance', label: isRtl ? 'دفتر الحضور' : 'Class Attendance', icon: <AttendanceIcon />, visible: true },
      { id: 'grades', label: isRtl ? 'رصد الدرجات' : 'Grades Entry', icon: <GradesIcon />, visible: true },
      { id: 'grade-reports', label: isRtl ? 'كشف الدرجات' : 'Grade Reports', icon: <ReportsIcon />, visible: true },
      { id: 'settings', label: isRtl ? 'حسابي وكلمة المرور' : 'My Profile & Security', icon: <SettingsIcon />, visible: true }
    ];
  } else if (user?.role === 'STAFF') {
    navItems = [
      { id: 'dashboard', label: isRtl ? 'لوحة شؤون المعلمين والطلاب' : 'Faculty & Student Affairs Dashboard', icon: <DashboardIcon />, visible: true },
      { id: 'teachers', label: isRtl ? 'الهيئة التعليمية وتعيين الشعب' : 'Teachers & Class Allocation', icon: <TeachersIcon />, visible: true },
      { id: 'students', label: isRtl ? 'إدارة وقبول الطلاب' : 'Student Admissions & Import', icon: <StudentsIcon />, visible: true },
      { id: 'enrollment', label: isRtl ? 'تسكين وتوزيع الفصول' : 'Class Enrollment', icon: <EnrollmentIcon />, visible: true },
      { id: 'classes', label: isRtl ? 'الصفوف والشعب' : 'Classes & Sections', icon: <ClassesIcon />, visible: true },
      { id: 'teacher-tracker', label: isRtl ? 'مكتب تسجيل دوام المعلمين' : 'Teacher Check-In Desk', icon: <AttendanceIcon />, visible: true },
      { id: 'grade-reports', label: isRtl ? 'كشوف ونتائج الطلاب' : 'Grade Reports & Results', icon: <ReportsIcon />, visible: true },
      { id: 'subjects', label: isRtl ? 'المواد والمناهج' : 'Subjects Catalog', icon: <SubjectsIcon />, visible: true },
      { id: 'academic-years', label: isRtl ? 'السنوات الدراسية' : 'Academic Years', icon: <AcademicYearIcon />, visible: true },
      { id: 'attendance-reports', label: isRtl ? 'تقارير الحضور والغياب' : 'Attendance Reports', icon: <ReportsIcon />, visible: true },
      { id: 'reports', label: isRtl ? 'مركز التقارير الشامل' : 'Reports Hub', icon: <ReportsIcon />, visible: true },
      { id: 'settings', label: isRtl ? 'إعدادات الحساب' : 'Account Settings', icon: <SettingsIcon />, visible: true }
    ];
  } else {
    // ADMIN (Executive & Governance Scope)
    navItems = [
      { id: 'dashboard', label: isRtl ? 'لوحة الإشراف العام' : 'Executive Overview', icon: <DashboardIcon />, visible: true },
      { id: 'users', label: isRtl ? 'إدارة المستخدمين والصلاحيات' : 'User Accounts & Roles', icon: <UsersIcon />, visible: true },
      { id: 'audit-logs', label: isRtl ? 'سجل التدقيق والرقابة الأمني' : 'Security Audit Trail', icon: <AuditLogsIcon />, visible: true },
      { id: 'teachers', label: isRtl ? 'الهيئة التعليمية والمعلمون' : 'Faculty & Staff Directory', icon: <TeachersIcon />, visible: true },
      { id: 'teacher-tracker', label: isRtl ? 'تقارير ونسب دوام المعلمين' : 'Teacher Attendance Overview', icon: <AttendanceIcon />, visible: true },
      { id: 'classes', label: isRtl ? 'الصفوف والشعب والمعدلات' : 'Classes & Section Averages', icon: <ClassesIcon />, visible: true },
      { id: 'subjects', label: isRtl ? 'المواد والمناهج' : 'Subjects Catalog', icon: <SubjectsIcon />, visible: true },
      { id: 'academic-years', label: isRtl ? 'السنوات والتقويم الدراسي' : 'Academic Years & Terms', icon: <AcademicYearIcon />, visible: true },
      { id: 'reports', label: isRtl ? 'مركز التقارير والتصدير' : 'Executive Reports Hub', icon: <ReportsIcon />, visible: true },
      { id: 'settings', label: isRtl ? 'إعدادات النظام والأمان' : 'System Security Settings', icon: <SettingsIcon />, visible: true }
    ];
  }

  const roleColor = user?.isDeveloper ? '#6366f1' : user?.role === 'ADMIN' ? 'var(--primary)' : user?.role === 'STAFF' ? '#10b981' : '#0ea5e9';
  const schoolName = isRtl ? config.schoolNameAr : config.schoolNameEn;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          {config.logoUrl ? (
            <img src={config.logoUrl} alt="Logo" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'contain' }} />
          ) : (
            <SchoolLogo size={40} />
          )}
          <div className="sidebar-brand" style={{ maxWidth: 155 }}>
            <h2 style={{ fontSize: 13, fontWeight: 900, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={schoolName}>
              {schoolName}
            </h2>
            <span style={{ color: roleColor, fontWeight: 700, fontSize: 11 }}>
              {user?.isDeveloper ? (isRtl ? '👑 المطور العام (Master)' : '👑 Lead Developer') : user?.role === 'ADMIN' ? (isRtl ? 'بوابة المدير العام' : 'Admin Portal') : user?.role === 'STAFF' ? (isRtl ? 'بوابة شؤون المعلمين والطلاب' : 'Faculty & Students Portal') : (isRtl ? 'بوابة المعلم' : 'Teacher Portal')}
            </span>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          className="mobile-sidebar-close-btn"
          onClick={onClose}
          title={isRtl ? 'إغلاق القائمة' : 'Close Sidebar'}
          aria-label="Close Sidebar"
        >
          ✕
        </button>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-title">
          {isRtl ? `مهام ${user?.isDeveloper ? 'المطور العام' : user?.role === 'ADMIN' ? 'الإدارة والرقابة' : user?.role === 'STAFF' ? 'شؤون المعلمين والطلاب' : 'المعلم'}` : `${user?.role} Navigation`}
        </div>
        {navItems
          .filter((item) => item.visible)
          .map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id || (currentPage.startsWith(item.id) && item.id !== 'dashboard' && item.id !== 'developer-fleet') ? 'active' : ''}`}
              style={item.id === 'developer-fleet' ? { borderLeft: isRtl ? 'none' : '3px solid #6366f1', borderRight: isRtl ? '3px solid #6366f1' : 'none', background: 'rgba(99, 102, 241, 0.08)' } : {}}
              onClick={() => {
                onNavigate(item.id);
                if (onClose) onClose();
              }}
            >
              {item.icon}
              <span style={item.id === 'developer-fleet' ? { color: '#a5b4fc', fontWeight: 700 } : {}}>{item.label}</span>
            </button>
          ))}
      </div>

      {/* Prominent High-Visibility Footer & Logout Block */}
      <div className="sidebar-footer">
        <div className="user-profile-badge">
          <div className="user-avatar" style={{ background: roleColor }}>
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="user-details">
            <div className="user-name" title={user?.fullName}>{user?.fullName || 'User'}</div>
            <div className="user-role-tag" style={{ color: roleColor }}>
              {user?.isDeveloper ? 'SUPER ADMIN' : user?.role === 'ADMIN' ? t('roleAdmin') : user?.role === 'STAFF' ? t('roleStaff') : t('roleTeacher')}
            </div>
          </div>
        </div>

        {/* Prominent Red Logout Button */}
        <button
          className="btn-prominent-logout"
          onClick={logout}
          title={isRtl ? 'تسجيل الخروج من الحساب والعودة لشاشة الدخول' : 'Sign out of your account'}
        >
          <LogoutIcon style={{ width: 18, height: 18 }} />
          <span>{isRtl ? 'تسجيل الخروج' : 'Log Out'}</span>
        </button>
      </div>
    </aside>
  );
}
