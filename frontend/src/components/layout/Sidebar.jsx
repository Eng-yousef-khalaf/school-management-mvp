import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
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

export default function Sidebar({ currentPage, onNavigate, isOpen, onClose }) {
  const { user, logout, isAdmin, isStaff, isTeacher } = useAuth();
  const { t, isRtl } = useLanguage();

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
      { id: 'dashboard', label: isRtl ? 'لوحة شؤون الطلاب' : 'Registrar Dashboard', icon: <DashboardIcon />, visible: true },
      { id: 'students', label: isRtl ? 'إدارة الطلاب وقبولهم' : 'Student Admissions & Import', icon: <StudentsIcon />, visible: true },
      { id: 'enrollment', label: isRtl ? 'تسكين وتوزيع الفصول' : 'Class Enrollment', icon: <EnrollmentIcon />, visible: true },
      { id: 'classes', label: isRtl ? 'الصفوف والشعب' : 'Classes & Sections', icon: <ClassesIcon />, visible: true },
      { id: 'subjects', label: isRtl ? 'المواد والمناهج' : 'Subjects Catalog', icon: <SubjectsIcon />, visible: true },
      { id: 'academic-years', label: isRtl ? 'السنوات الدراسية' : 'Academic Years', icon: <AcademicYearIcon />, visible: true },
      { id: 'teachers', label: isRtl ? 'دليل المعلمين' : 'Teachers Directory', icon: <TeachersIcon />, visible: true },
      { id: 'attendance', label: isRtl ? 'دفتر الحضور اليومي' : 'Daily Attendance', icon: <AttendanceIcon />, visible: true },
      { id: 'attendance-reports', label: isRtl ? 'تقارير الحضور والغياب' : 'Attendance Reports', icon: <ReportsIcon />, visible: true },
      { id: 'grades', label: isRtl ? 'رصد الدرجات والامتحانات' : 'Grades Entry', icon: <GradesIcon />, visible: true },
      { id: 'grade-reports', label: isRtl ? 'كشوف الدرجات والمعدلات' : 'Grade Matrix', icon: <ReportsIcon />, visible: true },
      { id: 'reports', label: isRtl ? 'مركز التقارير الشامل' : 'Reports Hub', icon: <ReportsIcon />, visible: true },
      { id: 'settings', label: isRtl ? 'إعدادات الحساب' : 'Account Settings', icon: <SettingsIcon />, visible: true }
    ];
  } else {
    // ADMIN (Executive & Governance Scope)
    navItems = [
      { id: 'dashboard', label: isRtl ? 'لوحة الإشراف العام' : 'Executive Overview', icon: <DashboardIcon />, visible: true },
      { id: 'users', label: isRtl ? 'إدارة المستخدمين والصلاحيات' : 'User Accounts & Roles', icon: <UsersIcon />, visible: true },
      { id: 'audit-logs', label: isRtl ? 'سجل الرقابة والتدقيق الأمني' : 'Security Audit Trail', icon: <AuditLogsIcon />, visible: true },
      { id: 'teachers', label: isRtl ? 'الهيئة التعليمية والمعلمون' : 'Faculty & Staff Directory', icon: <TeachersIcon />, visible: true },
      { id: 'classes', label: isRtl ? 'الصفوف والشعب الدراسية' : 'Classes & Sections', icon: <ClassesIcon />, visible: true },
      { id: 'subjects', label: isRtl ? 'المواد والمناهج' : 'Subjects Catalog', icon: <SubjectsIcon />, visible: true },
      { id: 'academic-years', label: isRtl ? 'السنوات والتقويم الدراسي' : 'Academic Years & Terms', icon: <AcademicYearIcon />, visible: true },
      { id: 'students', label: isRtl ? 'سجل الطلاب (إشراف وتقارير)' : 'Students Roster (Oversight)', icon: <StudentsIcon />, visible: true },
      { id: 'attendance-reports', label: isRtl ? 'تحليلات ونسب الحضور' : 'Institutional Attendance', icon: <ReportsIcon />, visible: true },
      { id: 'grade-reports', label: isRtl ? 'مصفوفة الدرجات والنتائج' : 'Grade Performance Matrix', icon: <ReportsIcon />, visible: true },
      { id: 'reports', label: isRtl ? 'مركز التقارير والتصدير' : 'Executive Reports Hub', icon: <ReportsIcon />, visible: true },
      { id: 'settings', label: isRtl ? 'إعدادات النظام والأمان' : 'System Security Settings', icon: <SettingsIcon />, visible: true }
    ];
  }

  const roleColor = user?.role === 'ADMIN' ? 'var(--primary)' : user?.role === 'STAFF' ? '#10b981' : '#0ea5e9';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo-icon" style={{ background: roleColor }}>
          {user?.role === 'ADMIN' ? '👔' : user?.role === 'STAFF' ? '📋' : '👨‍🏫'}
        </div>
        <div className="sidebar-brand">
          <h2>{t('appTitle')}</h2>
          <span style={{ color: roleColor, fontWeight: 700 }}>
            {user?.role === 'ADMIN' ? (isRtl ? 'بوابة المدير العام' : 'Admin Portal') : user?.role === 'STAFF' ? (isRtl ? 'بوابة شؤون الطلاب' : 'Staff Portal') : (isRtl ? 'بوابة المعلم' : 'Teacher Portal')}
          </span>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-title">
          {isRtl ? `مهام ${user?.role === 'ADMIN' ? 'الإدارة والرقابة' : user?.role === 'STAFF' ? 'التسجيل والشؤون' : 'المعلم'}` : `${user?.role} Navigation`}
        </div>
        {navItems
          .filter((item) => item.visible)
          .map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id || (currentPage.startsWith(item.id) && item.id !== 'dashboard') ? 'active' : ''}`}
              onClick={() => {
                onNavigate(item.id);
                if (onClose) onClose();
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-profile-badge">
          <div className="user-avatar" style={{ background: roleColor }}>
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.fullName || 'User'}</div>
            <div className="user-role-tag" style={{ color: roleColor }}>
              {user?.role === 'ADMIN' ? t('roleAdmin') : user?.role === 'STAFF' ? t('roleStaff') : t('roleTeacher')}
            </div>
          </div>
        </div>
        <button className="btn-logout" onClick={logout} title={t('logout')}>
          <LogoutIcon />
        </button>
      </div>
    </aside>
  );
}
