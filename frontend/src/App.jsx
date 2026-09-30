import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import Login from './pages/Login';
import MainLayout from './components/layout/MainLayout';
import { PageLoader } from './components/common/Loader';
import AccessDenied from './components/common/AccessDenied';

// Dashboards
import AdminDashboard from './pages/Dashboards/AdminDashboard';
import StaffDashboard from './pages/Dashboards/StaffDashboard';
import TeacherDashboard from './pages/Dashboards/TeacherDashboard';

// Pages
import StudentList from './pages/Students/StudentList';
import StudentDetails from './pages/Students/StudentDetails';
import AddEditStudentModal from './pages/Students/AddEditStudentModal';
import TeacherList from './pages/Teachers/TeacherList';
import TeacherDetails from './pages/Teachers/TeacherDetails';
import AddEditTeacherModal from './pages/Teachers/AddEditTeacherModal';
import TeacherTracker from './pages/Teachers/TeacherTracker';
import ClassList from './pages/Classes/ClassList';
import ClassDetails from './pages/Classes/ClassDetails';
import SubjectList from './pages/Subjects/SubjectList';
import AcademicYearList from './pages/AcademicYears/AcademicYearList';
import EnrollmentManagement from './pages/Enrollment/EnrollmentManagement';
import AttendanceSheet from './pages/Attendance/AttendanceSheet';
import AttendanceReports from './pages/Attendance/AttendanceReports';
import GradeEntry from './pages/Grades/GradeEntry';
import GradeReports from './pages/Grades/GradeReports';
import ReportsHub from './pages/Reports/ReportsHub';
import UserList from './pages/Users/UserList';
import AuditLogList from './pages/AuditLogs/AuditLogList';
import SettingsPage from './pages/Settings/SettingsPage';
import DeveloperPortalStandalone from './pages/Developer/DeveloperPortalStandalone';
import DeveloperFleetDashboard from './pages/Developer/DeveloperFleetDashboard';
import DailyMotivationalModal from './components/common/DailyMotivationalModal';
import FeeManagement from './pages/Fees/FeeManagement';
import ParentPaymentPortalStandalone from './pages/Fees/ParentPaymentPortalStandalone';
import ParentInquiryPortal from './pages/Parent/ParentInquiryPortal';
import JothoorPublicWebsite from './pages/Public/JothoorPublicWebsite';
import ErrorBoundary from './components/common/ErrorBoundary';

export default function App() {
  const { user, loading, isAdmin, isStaff, isTeacher, switchPortalRole, logout } = useAuth();
  const { t, isRtl } = useLanguage();

  const [showLoginScreen, setShowLoginScreen] = useState(() => {
    const search = window.location.search.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    return (
      path.includes('login') ||
      hash.includes('login') ||
      search.includes('portal=login')
    );
  });

  const [isParentInquiryPortal, setIsParentInquiryPortal] = useState(() => {
    const search = window.location.search.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    return (
      path.includes('inquiry') ||
      path.includes('parent-inquiry') ||
      path.includes('parents') ||
      hash.includes('inquiry') ||
      hash.includes('parent-inquiry') ||
      hash.includes('parents') ||
      search.includes('portal=inquiry') ||
      search.includes('portal=parents') ||
      search.includes('inquiry=') ||
      search.includes('studentid=')
    );
  });

  const [isDeveloperPortal, setIsDeveloperPortal] = useState(() => {
    const search = window.location.search.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    return (
      path.includes('developer-hub') ||
      path.includes('dev-hub') ||
      hash.includes('developer') ||
      hash.includes('dev-hub') ||
      hash.includes('dev') ||
      search.includes('portal=dev') ||
      search.includes('portal=developer') ||
      search.includes('role=dev')
    );
  });

  const [isParentPortal, setIsParentPortal] = useState(() => {
    const search = window.location.search.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    return (
      path.includes('pay') ||
      path.includes('parent-pay') ||
      hash.includes('pay') ||
      hash.includes('parent-pay') ||
      hash.includes('tuition') ||
      search.includes('portal=pay') ||
      search.includes('portal=parent') ||
      search.includes('role=parent')
    );
  });

  const VALID_PAGES = new Set([
    'dashboard',
    'students',
    'student-details',
    'teachers',
    'teacher-details',
    'teacher-tracker',
    'classes',
    'class-details',
    'subjects',
    'academic-years',
    'enrollment',
    'attendance',
    'attendance-reports',
    'grades',
    'grade-reports',
    'reports',
    'fees',
    'users',
    'audit-logs',
    'developer-hub',
    'developer-fleet',
    'settings',
    'public-website'
  ]);

  const getPageFromUrl = () => {
    if (typeof window === 'undefined') return 'dashboard';
    const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0].toLowerCase();
    if (VALID_PAGES.has(hash)) return hash;

    const path = window.location.pathname.replace(/^\//, '').split('/')[0].toLowerCase();
    if (VALID_PAGES.has(path)) return path;

    const saved = sessionStorage.getItem('current_page');
    if (saved && VALID_PAGES.has(saved)) return saved;

    return 'dashboard';
  };

  const getUrlParams = () => {
    if (typeof window === 'undefined') return {};
    const searchParams = new URLSearchParams(window.location.search);
    const hashParts = window.location.hash.split('?');
    const hashParams = hashParts.length > 1 ? new URLSearchParams(hashParts[1]) : new URLSearchParams();

    return {
      studentId: searchParams.get('studentId') || hashParams.get('studentId'),
      teacherId: searchParams.get('teacherId') || hashParams.get('teacherId'),
      classId: searchParams.get('classId') || hashParams.get('classId'),
      attendanceClassId: searchParams.get('attendanceClassId') || hashParams.get('attendanceClassId'),
    };
  };

  const [currentPage, setCurrentPage] = useState(() => getPageFromUrl());
  const initialParams = getUrlParams();
  const [selectedStudentId, setSelectedStudentId] = useState(initialParams.studentId || null);
  const [selectedTeacherId, setSelectedTeacherId] = useState(initialParams.teacherId || null);
  const [selectedClassId, setSelectedClassId] = useState(initialParams.classId || null);
  const [attendanceClassId, setAttendanceClassId] = useState(initialParams.attendanceClassId || '');

  // Clean #login hash if user is already authenticated
  useEffect(() => {
    if (user && (window.location.hash.includes('login') || window.location.hash === '#login')) {
      window.location.hash = '';
      if (window.history.pushState) {
        window.history.pushState(null, '', window.location.pathname);
      }
    }
  }, [user]);

  // Auto-switch role or detect developer/parent portal and sync routes
  useEffect(() => {
    const handleUrlRoute = () => {
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();

      // Check if user requested explicit login or logout via URL
      if (
        path.includes('logout') ||
        hash.includes('logout') ||
        search.includes('logout')
      ) {
        if (user) logout();
        setShowLoginScreen(true);
        setIsParentInquiryPortal(false);
        setIsParentPortal(false);
        setIsDeveloperPortal(false);
        return;
      }

      if (
        !user && (
          path.includes('login') ||
          hash.includes('login') ||
          search.includes('portal=login')
        )
      ) {
        setShowLoginScreen(true);
        setIsParentInquiryPortal(false);
        setIsParentPortal(false);
        setIsDeveloperPortal(false);
        return;
      }

      const isParentInq =
        path.includes('inquiry') ||
        path.includes('parent-inquiry') ||
        path.includes('parents') ||
        hash.includes('inquiry') ||
        hash.includes('parent-inquiry') ||
        hash.includes('parents') ||
        search.includes('portal=inquiry') ||
        search.includes('portal=parents') ||
        search.includes('inquiry=') ||
        search.includes('studentid=');

      const isDev =
        path.includes('developer-hub') ||
        path.includes('dev-hub') ||
        hash.includes('developer') ||
        hash.includes('dev-hub') ||
        hash.includes('dev') ||
        search.includes('portal=dev') ||
        search.includes('portal=developer') ||
        search.includes('role=dev');

      const isParent =
        path.includes('pay') ||
        path.includes('parent-pay') ||
        hash.includes('pay') ||
        hash.includes('parent-pay') ||
        hash.includes('tuition') ||
        search.includes('portal=pay') ||
        search.includes('portal=parent') ||
        search.includes('role=parent');

      setIsParentInquiryPortal(isParentInq);
      setIsDeveloperPortal(isDev);
      setIsParentPortal(isParent);

      // If neither login nor standalone portal, reset showLoginScreen if not logged in
      if (!user && !path.includes('login') && !hash.includes('login') && !search.includes('portal=login')) {
        setShowLoginScreen(false);
      }

      // If user is authenticated, sync page and parameters from URL
      if (user && !isParentInq && !isParent && !isDev) {
        const pageFromUrl = getPageFromUrl();
        if (pageFromUrl && VALID_PAGES.has(pageFromUrl)) {
          setCurrentPage(pageFromUrl);
          sessionStorage.setItem('current_page', pageFromUrl);
          const params = getUrlParams();
          if (params.studentId) setSelectedStudentId(params.studentId);
          if (params.teacherId) setSelectedTeacherId(params.teacherId);
          if (params.classId) setSelectedClassId(params.classId);
          if (params.attendanceClassId) setAttendanceClassId(params.attendanceClassId);
        }
      }

      const urlParams = new URLSearchParams(window.location.search);
      const roleParam = urlParams.get('role')?.toUpperCase();
      const hashParam = window.location.hash.replace('#/', '').replace('#', '').toUpperCase();
      const targetRole = roleParam || (['ADMIN', 'STAFF', 'TEACHER'].includes(hashParam) ? hashParam : null);

      // Only switch role if user is ALREADY authenticated! Never auto-login unauthenticated visitors.
      if (targetRole && ['ADMIN', 'STAFF', 'TEACHER'].includes(targetRole)) {
        if (user && user.role !== targetRole) {
          switchPortalRole(targetRole).then(() => {
            setCurrentPage('dashboard');
          }).catch(console.error);
        }
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);
    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, [user, switchPortalRole, logout]);

  // If in standalone parent inquiry portal route, render parent student inquiry portal
  if (isParentInquiryPortal) {
    return (
      <ParentInquiryPortal
        onBackToHome={() => {
          setIsParentInquiryPortal(false);
          setIsParentPortal(false);
          setIsDeveloperPortal(false);
          setShowLoginScreen(false);
          window.location.hash = '';
          if (window.history.pushState) {
            window.history.pushState(null, '', '/');
          }
        }}
        onExitToSchool={() => {
          setIsParentInquiryPortal(false);
          setIsParentPortal(false);
          setIsDeveloperPortal(false);
          window.location.hash = '';
          if (window.history.pushState) {
            window.history.pushState(null, '', '/');
          }
          if (user) {
            setCurrentPage('dashboard');
          } else {
            setShowLoginScreen(true);
          }
        }}
        onNavigateToFees={() => {
          setIsParentInquiryPortal(false);
          setIsParentPortal(true);
          window.location.hash = 'pay';
        }}
      />
    );
  }

  // If in standalone parent payment portal route, render parent portal
  if (isParentPortal) {
    return (
      <ParentPaymentPortalStandalone
        onBackToHome={() => {
          setIsParentPortal(false);
          setIsParentInquiryPortal(false);
          setIsDeveloperPortal(false);
          setShowLoginScreen(false);
          window.location.hash = '';
          if (window.history.pushState) {
            window.history.pushState(null, '', '/');
          }
        }}
        onExitToSchool={() => {
          setIsParentPortal(false);
          setIsParentInquiryPortal(false);
          setIsDeveloperPortal(false);
          window.location.hash = '';
          if (window.history.pushState) {
            window.history.pushState(null, '', '/');
          }
          if (user) {
            setCurrentPage('dashboard');
          } else {
            setShowLoginScreen(true);
          }
        }}
      />
    );
  }

  // If in standalone developer route OR user is explicitly logged in as Developer, render isolated developer portal
  if (isDeveloperPortal || user?.isDeveloper || user?.role === 'DEVELOPER') {
    return (
      <DeveloperPortalStandalone
        onExitToSchool={() => {
          setIsDeveloperPortal(false);
          setIsParentInquiryPortal(false);
          setIsParentPortal(false);
          window.location.hash = '';
          if (window.history.pushState) {
            window.history.pushState(null, '', window.location.pathname.replace(/(\/developer|\/dev-hub).*$/, '') || '/');
          }
          if (user) {
            setCurrentPage('dashboard');
          } else {
            setShowLoginScreen(true);
          }
        }}
      />
    );
  }

  // Editing Modals from details
  const [editingStudentFromDetails, setEditingStudentFromDetails] = useState(null);
  const [editingTeacherFromDetails, setEditingTeacherFromDetails] = useState(null);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <PageLoader text={t('loading')} />
      </div>
    );
  }

  if (!user) {
    if (showLoginScreen) {
      return (
        <Login
          onBackToWebsite={() => {
            setShowLoginScreen(false);
            window.location.hash = '';
            if (window.history.pushState) {
              window.history.pushState(null, '', window.location.pathname);
            }
          }}
        />
      );
    }
    return (
      <JothoorPublicWebsite
        onNavigateToLogin={() => {
          setShowLoginScreen(true);
          window.location.hash = 'login';
        }}
        onNavigateToInquiry={() => {
          setIsParentInquiryPortal(true);
          window.location.hash = 'inquiry';
        }}
        onNavigateToFees={() => {
          setIsParentPortal(true);
          window.location.hash = 'pay';
        }}
      />
    );
  }

  const navigateTo = (pageId, params = {}) => {
    if (params.studentId !== undefined) setSelectedStudentId(params.studentId);
    if (params.teacherId !== undefined) setSelectedTeacherId(params.teacherId);
    if (params.classId !== undefined) setSelectedClassId(params.classId);
    if (params.attendanceClassId !== undefined) setAttendanceClassId(params.attendanceClassId);
    
    setCurrentPage(pageId);
    sessionStorage.setItem('current_page', pageId);

    // Update URL hash cleanly with parameters if present
    let hashUrl = `#${pageId}`;
    const queryEntries = Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '');
    if (queryEntries.length > 0) {
      const q = new URLSearchParams(queryEntries).toString();
      hashUrl += `?${q}`;
    }

    if (window.location.hash !== hashUrl) {
      if (window.history.pushState) {
        window.history.pushState(null, '', hashUrl);
      } else {
        window.location.hash = hashUrl;
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageInfo = () => {
    switch (currentPage) {
      case 'dashboard':
        if (isTeacher) return { title: isRtl ? 'لوحة المعلم والمقررات' : 'Teacher Portal Dashboard', subtitle: isRtl ? 'إدارة الشعب والحضور والدرجات المسندة للمعلم' : 'Manage your assigned classes, attendance, and student evaluations' };
        if (user?.role === 'STAFF') return { title: isRtl ? 'لوحة شؤون المعلمين والطلاب' : 'Faculty & Student Affairs Dashboard', subtitle: isRtl ? 'إدارة الهيئة التعليمية وتعيين الشعب، شؤون الطلاب، واستيراد البيانات والتقارير' : 'Faculty directory, subject allocations, student admissions, and Excel reports' };
        return { title: isRtl ? 'لوحة الإشراف العام' : 'Executive Admin Dashboard', subtitle: isRtl ? 'الرقابة الشاملة على المؤسسة والمستخدمين وسجل الأمان' : 'Enterprise supervision across all school operations & security audit trail' };
      case 'students':
        return { title: t('studentsTitle'), subtitle: t('studentsSubtitle') };
      case 'student-details':
        return { title: t('studentProfile'), subtitle: t('studentsSubtitle') };
      case 'teachers':
        return { title: t('teachersTitle'), subtitle: t('teachersSubtitle') };
      case 'teacher-details':
        return { title: t('teacherProfile'), subtitle: t('teachersSubtitle') };
      case 'teacher-tracker':
        return { 
          title: isRtl ? 'متابعة دوام ونشاط المعلمين' : 'Teacher Attendance & Activity Tracker', 
          subtitle: isRtl ? 'تتبع حضور وغياب وتأخير الكادر التعليمي وتوزيع الحصص والأنشطة' : 'Live tracking of teacher daily attendance, check-ins, and active teaching loads' 
        };
      case 'classes':
        return { title: t('classesTitle'), subtitle: t('classesSubtitle') };
      case 'class-details':
        return { title: t('classesTitle'), subtitle: t('classesSubtitle') };
      case 'subjects':
        return { title: t('subjectsTitle'), subtitle: t('subjectsSubtitle') };
      case 'academic-years':
        return { title: t('academicYearsTitle'), subtitle: t('academicYearsSubtitle') };
      case 'enrollment':
        return { title: t('enrollmentTitle'), subtitle: t('enrollmentSubtitle') };
      case 'attendance':
        return { title: t('attendanceTitle'), subtitle: t('attendanceSubtitle') };
      case 'attendance-reports':
        return { title: t('attendanceReports'), subtitle: t('attendanceSubtitle') };
      case 'grades':
        return { title: t('gradesTitle'), subtitle: t('gradesSubtitle') };
      case 'grade-reports':
        return { title: t('gradeReports'), subtitle: t('gradesSubtitle') };
      case 'reports':
        return { title: t('reportsTitle'), subtitle: t('reportsSubtitle') };
      case 'users':
        return { title: t('usersTitle'), subtitle: t('usersSubtitle') };
      case 'audit-logs':
        return { title: t('auditLogsTitle'), subtitle: t('auditLogsSubtitle') };
      case 'developer-hub':
      case 'developer-fleet':
        return { 
          title: isRtl ? 'لوحة تحكم مهندس ومطور المنظومة' : 'Developer Engineering & Diagnostics Hub', 
          subtitle: isRtl ? 'فحص الخادم وقاعدة البيانات، مراقبة استهلاك الجداول، وأدوات الصيانة' : 'Server health diagnostics, live database table analysis, and maintenance utilities' 
        };
      case 'fees':
        return {
          title: isRtl ? (user?.role === 'STAFF' ? 'الرسوم والأقساط والمقبوضات' : 'الرسوم المالية وحسابات الطلاب') : 'Student Tuition & Fee Management',
          subtitle: isRtl ? 'إدارة الذمم المالية للطلاب، تسديد الدفعات، إصدار السندات الرسمية، وتنبيهات الأقساط' : 'Tuition ledgers, payment recording, official digital receipts & installment alerts'
        };
      case 'settings':
        return { title: t('settingsTitle'), subtitle: t('settingsSubtitle') };
      case 'public-website':
        return {
          title: isRtl ? 'الموقع التعريفي العام لروضة ومدرسة السلام' : 'Al-Salam School Showcase Website',
          subtitle: isRtl ? 'الموقع التعريفي، طلبات حجز المقاعد (20ش)، والخدمات العامة' : 'Official public landing page, 20 NIS admissions & portals'
        };
      default:
        return { title: t('appTitle'), subtitle: t('appSubtitle') };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <MainLayout
      currentPage={currentPage}
      onNavigate={navigateTo}
      pageTitle={title}
      pageSubtitle={subtitle}
    >
      <ErrorBoundary key={currentPage} resetKey={currentPage} onReset={() => navigateTo('dashboard')}>
        {/* Role-Specific Dashboards */}
      {currentPage === 'dashboard' && (
        isTeacher ? (
          <TeacherDashboard onNavigate={navigateTo} />
        ) : user?.role === 'STAFF' ? (
          <StaffDashboard onNavigate={navigateTo} />
        ) : (
          <AdminDashboard onNavigate={navigateTo} />
        )
      )}

      {/* Student Directory - Accessible by Admin, Staff, and Teachers for their rosters */}
      {currentPage === 'students' && (
        (isStaff || isTeacher || isAdmin) ? (
          <StudentList
            onViewStudent={(id) => navigateTo('student-details', { studentId: id })}
            onNavigate={navigateTo}
          />
        ) : (
          <AccessDenied requiredRole="STAFF" onBack={() => navigateTo('dashboard')} />
        )
      )}

      {currentPage === 'student-details' && (
        (isStaff || isTeacher || isAdmin) ? (
          <StudentDetails
            studentId={selectedStudentId}
            onBack={() => navigateTo('students')}
            onEdit={(s) => setEditingStudentFromDetails(s)}
          />
        ) : (
          <AccessDenied requiredRole="STAFF" onBack={() => navigateTo('dashboard')} />
        )
      )}

      {/* Teachers Directory - Accessible by Admin and Staff */}
      {currentPage === 'teachers' && (
        (isAdmin || isStaff) ? (
          <TeacherList
            onViewTeacher={(id) => navigateTo('teacher-details', { teacherId: id })}
          />
        ) : (
          <AccessDenied requiredRole="ADMIN / STAFF" onBack={() => navigateTo('dashboard')} />
        )
      )}

      {currentPage === 'teacher-details' && (
        (isAdmin || isStaff) ? (
          <TeacherDetails
            teacherId={selectedTeacherId}
            onBack={() => navigateTo('teachers')}
            onEdit={(t) => setEditingTeacherFromDetails(t)}
          />
        ) : (
          <AccessDenied requiredRole="ADMIN / STAFF" onBack={() => navigateTo('dashboard')} />
        )
      )}

      {/* Teacher Attendance & Activity Tracker - Accessible by Staff and Admin */}
      {currentPage === 'teacher-tracker' && (
        (isAdmin || isStaff) ? (
          <TeacherTracker
            onViewTeacher={(id) => navigateTo('teacher-details', { teacherId: id })}
          />
        ) : (
          <AccessDenied requiredRole="ADMIN / STAFF" onBack={() => navigateTo('dashboard')} />
        )
      )}

      {/* Classes & Sections - Accessible by all */}
      {currentPage === 'classes' && (
        <ClassList
          onViewClass={(id) => navigateTo('class-details', { classId: id })}
        />
      )}

      {currentPage === 'class-details' && (
        <ClassDetails
          classId={selectedClassId}
          onBack={() => navigateTo('classes')}
          onViewStudent={(id) => navigateTo('student-details', { studentId: id })}
          onTakeAttendance={(id) => navigateTo('attendance', { attendanceClassId: id })}
        />
      )}

      {/* Subjects Catalog - Accessible by Admin, Staff, and Teachers */}
      {currentPage === 'subjects' && (
        (isAdmin || isStaff || isTeacher) ? (
          <SubjectList />
        ) : (
          <AccessDenied requiredRole="ADMIN / STAFF" onBack={() => navigateTo('dashboard')} />
        )
      )}

      {/* Academic Years - Accessible by Admin and Staff */}
      {currentPage === 'academic-years' && (
        (isAdmin || isStaff) ? (
          <AcademicYearList />
        ) : (
          <AccessDenied requiredRole="ADMIN / STAFF" onBack={() => navigateTo('dashboard')} />
        )
      )}

      {/* Enrollment Management - Accessible by Staff & Admin */}
      {currentPage === 'enrollment' && (
        (isStaff || isAdmin) ? (
          <EnrollmentManagement />
        ) : (
          <AccessDenied requiredRole="STAFF" onBack={() => navigateTo('dashboard')} />
        )
      )}

      {/* Student Attendance Sheet - Strictly for Teachers, Staff & Admin */}
      {currentPage === 'attendance' && (
        (isTeacher || isStaff || isAdmin) ? (
          <AttendanceSheet initialClassId={attendanceClassId} />
        ) : (
          <AccessDenied requiredRole="TEACHER / STAFF" onBack={() => navigateTo('dashboard')} />
        )
      )}

      {/* Student Attendance Reports - For Teachers, Staff & Admin */}
      {currentPage === 'attendance-reports' && (
        (isTeacher || isStaff || isAdmin) ? (
          <AttendanceReports />
        ) : (
          <AccessDenied requiredRole="STAFF" onBack={() => navigateTo('dashboard')} />
        )
      )}

      {/* Grade Entry - For Teachers, Staff & Admin */}
      {currentPage === 'grades' && (
        (isTeacher || isStaff || isAdmin) ? (
          <GradeEntry />
        ) : (
          <AccessDenied requiredRole="TEACHER" onBack={() => navigateTo('dashboard')} />
        )
      )}

      {/* Grade Reports - For Teachers, Staff & Admin */}
      {currentPage === 'grade-reports' && (
        (isTeacher || isStaff || isAdmin) ? (
          <GradeReports />
        ) : (
          <AccessDenied requiredRole="STAFF" onBack={() => navigateTo('dashboard')} />
        )
      )}

      {/* Reports Hub - Accessible by Admin and Staff */}
      {currentPage === 'reports' && (
        (isAdmin || isStaff) ? (
          <ReportsHub onNavigate={navigateTo} />
        ) : (
          <AccessDenied requiredRole="ADMIN / STAFF" onBack={() => navigateTo('dashboard')} />
        )
      )}

      {/* Student Tuition & Fee Management - Accessible by Admin and Staff */}
      {currentPage === 'fees' && (
        (isAdmin || isStaff) ? (
          <FeeManagement
            onViewStudent={(id) => navigateTo('student-details', { studentId: id })}
          />
        ) : (
          <AccessDenied requiredRole="ADMIN / STAFF" onBack={() => navigateTo('dashboard')} />
        )
      )}

      {/* User Management - Admin only */}
      {currentPage === 'users' && (
        isAdmin ? (
          <UserList />
        ) : (
          <AccessDenied requiredRole="ADMIN" onBack={() => navigateTo('dashboard')} />
        )
      )}

      {/* Audit Logs - Admin only */}
      {currentPage === 'audit-logs' && (
        isAdmin ? (
          <AuditLogList />
        ) : (
          <AccessDenied requiredRole="ADMIN" onBack={() => navigateTo('dashboard')} />
        )
      )}

      {/* Developer Engineering Hub - Inside MainLayout */}
      {(currentPage === 'developer-hub' || currentPage === 'developer-fleet') && (
        <DeveloperFleetDashboard onNavigate={navigateTo} />
      )}

      {/* Settings - Accessible by all */}
      {currentPage === 'settings' && <SettingsPage />}

      {/* Public Showcase Website Preview from within Admin/Staff/Teacher Layout */}
      {currentPage === 'public-website' && (
        <div style={{ margin: '-24px', position: 'relative' }}>
          <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            background: 'linear-gradient(135deg, #065f46, #047857)',
            color: '#fff',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>
              🌐 {isRtl ? 'أنت تتصفح حالياً الموقع العام لروضة ومدرسة السلام كعضو في الكادر/الإدارة' : 'Browsing official school public landing page'}
            </span>
            <button
              onClick={() => navigateTo('dashboard')}
              className="btn btn-sm"
              style={{ background: '#fff', color: '#065f46', fontWeight: 800, border: 'none' }}
            >
              {isRtl ? '← العودة للوحة الإدارة' : '← Return to Dashboard'}
            </button>
          </div>
          <JothoorPublicWebsite
            onNavigateToLogin={() => navigateTo('dashboard')}
            onNavigateToInquiry={() => setIsParentInquiryPortal(true)}
            onNavigateToFees={() => setIsParentPortal(true)}
          />
        </div>
      )}

      {/* Editing student modal from details */}
      {editingStudentFromDetails && (
        <AddEditStudentModal
          isOpen={Boolean(editingStudentFromDetails)}
          onClose={() => setEditingStudentFromDetails(null)}
          student={editingStudentFromDetails}
          onSaved={() => {
            setSelectedStudentId(selectedStudentId);
          }}
        />
      )}

      {/* Editing teacher modal from details */}
      {editingTeacherFromDetails && (
        <AddEditTeacherModal
          isOpen={Boolean(editingTeacherFromDetails)}
          onClose={() => setEditingTeacherFromDetails(null)}
          teacher={editingTeacherFromDetails}
          onSaved={() => {
            setSelectedTeacherId(selectedTeacherId);
          }}
        />
      )}

      {/* Daily Motivational & Welcoming Modal for Admin, Staff & Teachers */}
      <DailyMotivationalModal />
      </ErrorBoundary>
    </MainLayout>
  );
}
