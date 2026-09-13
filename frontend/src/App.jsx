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

export default function App() {
  const { user, loading, isAdmin, isStaff, isTeacher, switchPortalRole } = useAuth();
  const { t, isRtl } = useLanguage();

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

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [attendanceClassId, setAttendanceClassId] = useState('');

  // Auto-switch role or detect developer portal
  useEffect(() => {
    const handleUrlRoute = () => {
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      const isDev =
        path.includes('developer-hub') ||
        path.includes('dev-hub') ||
        hash.includes('developer') ||
        hash.includes('dev-hub') ||
        hash.includes('dev') ||
        search.includes('portal=dev') ||
        search.includes('portal=developer') ||
        search.includes('role=dev');

      setIsDeveloperPortal(isDev);

      const urlParams = new URLSearchParams(window.location.search);
      const roleParam = urlParams.get('role')?.toUpperCase();
      const hashParam = window.location.hash.replace('#/', '').replace('#', '').toUpperCase();
      const targetRole = roleParam || (['ADMIN', 'STAFF', 'TEACHER'].includes(hashParam) ? hashParam : null);

      if (targetRole && ['ADMIN', 'STAFF', 'TEACHER'].includes(targetRole)) {
        if (user?.role !== targetRole) {
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
  }, [user, switchPortalRole]);

  // If in standalone developer route, render isolated developer portal
  if (isDeveloperPortal) {
    return (
      <DeveloperPortalStandalone
        onExitToSchool={() => {
          window.location.hash = '';
          window.location.search = '';
          window.history.pushState({}, '', '/');
          setIsDeveloperPortal(false);
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
    return <Login />;
  }

  const navigateTo = (pageId, params = {}) => {
    if (params.studentId) setSelectedStudentId(params.studentId);
    if (params.teacherId) setSelectedTeacherId(params.teacherId);
    if (params.classId) setSelectedClassId(params.classId);
    if (params.attendanceClassId) setAttendanceClassId(params.attendanceClassId);
    setCurrentPage(pageId);
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
      case 'developer-fleet':
        return { 
          title: isRtl ? 'لوحة تحكم المطور والأسطول' : 'Developer Master Fleet Hub', 
          subtitle: isRtl ? 'مراقبة سعة التخزين لقواعد البيانات ونسخ المدارس المستقلة' : 'Monitor database storage quotas, isolated school deployments, and master updates' 
        };
      case 'settings':
        return { title: t('settingsTitle'), subtitle: t('settingsSubtitle') };
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

      {/* Student Directory - Strictly for Staff (and Teachers for their rosters) */}
      {currentPage === 'students' && (
        (isStaff || isTeacher) ? (
          <StudentList
            onViewStudent={(id) => navigateTo('student-details', { studentId: id })}
          />
        ) : (
          <AccessDenied requiredRole="STAFF" onBack={() => navigateTo('dashboard')} />
        )
      )}

      {currentPage === 'student-details' && (
        (isStaff || isTeacher) ? (
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

      {/* Subjects Catalog - Accessible by Admin and Staff */}
      {currentPage === 'subjects' && (
        (isAdmin || isStaff) ? (
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

      {/* Enrollment Management - Accessible by Staff */}
      {currentPage === 'enrollment' && (
        isStaff ? (
          <EnrollmentManagement />
        ) : (
          <AccessDenied requiredRole="STAFF" onBack={() => navigateTo('dashboard')} />
        )
      )}

      {/* Student Attendance Sheet - Strictly for Teachers & Staff */}
      {currentPage === 'attendance' && (
        (isTeacher || isStaff) ? (
          <AttendanceSheet initialClassId={attendanceClassId} />
        ) : (
          <AccessDenied requiredRole="TEACHER / STAFF" onBack={() => navigateTo('dashboard')} />
        )
      )}

      {/* Student Attendance Reports - For Teachers & Staff */}
      {currentPage === 'attendance-reports' && (
        (isTeacher || isStaff) ? (
          <AttendanceReports />
        ) : (
          <AccessDenied requiredRole="STAFF" onBack={() => navigateTo('dashboard')} />
        )
      )}

      {/* Grade Entry - For Teachers & Staff */}
      {currentPage === 'grades' && (
        (isTeacher || isStaff) ? (
          <GradeEntry />
        ) : (
          <AccessDenied requiredRole="TEACHER" onBack={() => navigateTo('dashboard')} />
        )
      )}

      {/* Grade Reports */}
      {currentPage === 'grade-reports' && (
        (isTeacher || isStaff) ? (
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

      {/* Settings - Accessible by all */}
      {currentPage === 'settings' && <SettingsPage />}

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
    </MainLayout>
  );
}
