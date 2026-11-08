import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import StatCard from '../../components/common/StatCard';
import BarChart from '../../components/charts/BarChart';
import DonutChart from '../../components/charts/DonutChart';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import {
  StudentsIcon,
  ClassesIcon,
  AttendanceIcon,
  EnrollmentIcon,
  PlusIcon,
  ReportsIcon
} from '../../components/common/Icons';

export default function StaffDashboard({ onNavigate }) {
  const { user } = useAuth();
  const { t, isRtl } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Parent & Student Rapid Inquiry Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [teacherAttSummary, setTeacherAttSummary] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const [res, tAttRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/teachers/attendance/today').catch(() => null)
      ]);
      setData(res);
      if (tAttRes) setTeacherAttSummary(tAttRes.summary);
    } catch (err) {
      setError(err.message || 'Failed to load staff metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Debounced search for parent/student inquiry
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await api.get(`/students?q=${encodeURIComponent(searchQuery.trim())}&limit=8`);
        setSearchResults(res.items || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (loading) return <PageLoader text={t('loading')} />;
  if (error) return <ErrorAlert message={error} onRetry={loadDashboard} />;
  if (!data) return null;

  const { overview, charts } = data;
  const { todayAttendance } = overview;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Staff Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: '#fff',
        padding: '24px 28px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
            <span>📋</span>
            <span>{isRtl ? 'بوابة شؤون الطلاب والتسجيل والموظفين' : 'Registrar & Admissions Portal'}</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
            {isRtl ? `أهلاً بك، ${user?.fullName || ''} (شؤون الطلاب والمتابعة)` : `Welcome, ${user?.fullName || ''} (Registrar Staff)`}
          </h2>
          <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: 14 }}>
            {isRtl
              ? 'تسجيل وتسكين الطلاب، متابعة حضور وحالة المعلمين، واستعراض نتائج وتقارير الدرجات الجاهزة'
              : 'Manage student admissions, section enrollments, track teacher daily attendance, and review final grade transcripts'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('teacher-tracker')}
            className="btn"
            style={{ background: '#fff', color: '#059669', fontWeight: 800 }}
          >
            🕒 {isRtl ? 'متابعة المعلمين والدوام' : 'Track Teachers'}
          </button>
          <button
            onClick={() => onNavigate('grade-reports')}
            className="btn"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', fontWeight: 700 }}
          >
            📊 {isRtl ? 'النتائج والشهادات الجاهزة' : 'Ready Grade Reports'}
          </button>
          <button
            onClick={() => onNavigate('students')}
            className="btn"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', fontWeight: 700 }}
          >
            <PlusIcon /> {isRtl ? 'تسجيل الطلاب' : 'Register Students'}
          </button>
        </div>
      </div>

      {/* Teacher Daily Presence Tracker Card */}
      {teacherAttSummary && (
        <div style={{
          background: '#fff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>👨‍🏫</span>
              <h4 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {isRtl ? 'حالة دوام وحضور المعلمين اليوم:' : "Today's Teacher Attendance Status:"}
              </h4>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              {isRtl
                ? `إجمالي الهيئة التعليمية: ${teacherAttSummary.total} معلماً | حاضر: ${teacherAttSummary.present} | متأخر: ${teacherAttSummary.late} | غائب / إجازة: ${teacherAttSummary.absent + teacherAttSummary.excused}`
                : `Total Faculty: ${teacherAttSummary.total} | Present: ${teacherAttSummary.present} | Late: ${teacherAttSummary.late} | Absent/Excused: ${teacherAttSummary.absent + teacherAttSummary.excused}`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="badge" style={{ background: 'var(--success-light)', color: 'var(--success)', fontWeight: 700, padding: '6px 12px', fontSize: 13 }}>
              🟢 {teacherAttSummary.present} {isRtl ? 'حاضر' : 'Present'}
            </span>
            <span className="badge" style={{ background: 'var(--warning-light)', color: 'var(--warning)', fontWeight: 700, padding: '6px 12px', fontSize: 13 }}>
              🟡 {teacherAttSummary.late} {isRtl ? 'متأخر' : 'Late'}
            </span>
            <span className="badge" style={{ background: 'var(--danger-light)', color: 'var(--danger)', fontWeight: 700, padding: '6px 12px', fontSize: 13 }}>
              🔴 {teacherAttSummary.absent} {isRtl ? 'غائب' : 'Absent'}
            </span>
            <button
              onClick={() => onNavigate('teacher-tracker')}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 700, marginRight: isRtl ? 8 : 0, marginLeft: isRtl ? 0 : 8 }}
            >
              {isRtl ? 'فتح سجل المتابعة التفصيلي ←' : 'Open Tracker →'}
            </button>
          </div>
        </div>
      )}

      {/* Parent & Student Rapid Inquiry Widget */}
      <div className="panel" style={{ padding: '24px', border: '2px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-lg)', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>🔍</span>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {isRtl ? 'مركز استعلام أولياء الأمور والبحث السريع عن الطلاب' : 'Parent Inquiry & Instant Student 360 Lookup'}
              </h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              {isRtl
                ? 'استعلم فورياً عن درجات وسجل حضور أي طالب عند مراجعة ولي الأمر، مع إمكانية طباعة إفادة رسمية فورية'
                : 'Instantly lookup student academic standing, exams, and attendance logs when a parent inquires'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('students')}
            className="btn btn-secondary btn-sm"
          >
            {isRtl ? 'سجل الطلاب الكامل ←' : 'Full Student Directory →'}
          </button>
        </div>

        {/* Live Search Input */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <input
            type="text"
            className="form-input"
            style={{
              padding: isRtl ? '12px 42px 12px 16px' : '12px 16px 12px 42px',
              fontSize: '15px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border-color)',
              background: '#f8fafc'
            }}
            placeholder={isRtl ? 'اكتب اسم الطالب، الرقم الأكاديمي، اسم ولي الأمر، أو رقم هاتف ولي الأمر...' : 'Search by student name, ID, parent name, or parent phone number...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '14px', top: '14px', fontSize: '18px', color: 'var(--text-muted)' }}>
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                [isRtl ? 'left' : 'right']: '12px',
                top: '12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontSize: '14px'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Results Display */}
        {searchLoading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: 14 }}>
            {isRtl ? 'جاري البحث في قاعدة البيانات...' : 'Searching student records...'}
          </div>
        ) : searchResults.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
            {searchResults.map((s) => (
              <div
                key={s.id}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: 16,
                  background: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 18
                    }}
                  >
                    {s.firstName?.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: 15 }}>{s.firstName} {s.middleName ? s.middleName + ' ' : ''}{s.lastName}</strong>
                      <span className="badge badge-primary" style={{ fontSize: 11 }}>{s.currentClass || (isRtl ? 'غير مسجل' : 'Unassigned')}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {s.studentNumber}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 6, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{isRtl ? 'ولي الأمر:' : 'Guardian:'}</span>
                    <strong>{s.parentName || (isRtl ? 'غير محدد' : '—')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{isRtl ? 'هاتف ولي الأمر:' : 'Phone:'}</span>
                    {s.parentPhone ? (
                      <a href={`tel:${s.parentPhone}`} style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                        📞 {s.parentPhone}
                      </a>
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button
                    onClick={() => onNavigate('student-details', { studentId: s.id })}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    👁️ {isRtl ? 'كشف الدرجات والإفادة' : 'Grades & Statement'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery.trim() !== '' ? (
          <div style={{ textAlign: 'center', padding: '24px', background: '#f8fafc', borderRadius: 8, color: 'var(--text-muted)' }}>
            {isRtl ? `لم يتم العثور على طالب يطابق: "${searchQuery}"` : `No students found matching "${searchQuery}"`}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 8, border: '1px dashed rgba(16, 185, 129, 0.3)' }}>
            <span style={{ fontSize: 20 }}>💡</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {isRtl
                ? 'نصيحة لشؤون الطلاب: عندما يتصل ولي أمر أو يحضر للمدرسة، اكتب اسمه أو رقم هاتفه أو اسم ابنه مباشرة أعلاه لرؤية درجاته، حضوره، وطباعة إفادة رسمية فوراً.'
                : 'Registrar Tip: When a parent calls or visits, search by their phone number or child name above to instantly inspect grades, attendance, and print statements.'}
            </span>
          </div>
        )}
      </div>

      {/* Staff Key Metrics Grid */}
      <div className="grid-cards-4">
        <StatCard
          title={isRtl ? 'إجمالي الطلاب المسجلين' : 'Total Enrolled Students'}
          value={overview.totalStudents}
          subtext={`${overview.activeStudents} ${isRtl ? 'طالب نشط' : 'active'}`}
          icon={<StudentsIcon />}
          color="success"
        />
        <StatCard
          title={isRtl ? 'الشعب والفصول الدراسية' : 'Class Sections'}
          value={overview.totalClasses}
          subtext={isRtl ? 'طاقة الفصول المتاحة' : 'Active class rooms'}
          icon={<ClassesIcon />}
          color="primary"
        />
        <StatCard
          title={isRtl ? 'حضور اليوم الإجمالي' : 'Today Presence Rate'}
          value={`${todayAttendance.rate}%`}
          subtext={`${todayAttendance.present} ${isRtl ? 'حاضر' : 'present'} / ${todayAttendance.absent} ${isRtl ? 'غائب' : 'absent'}`}
          icon={<AttendanceIcon />}
          color="secondary"
        />
        <StatCard
          title={isRtl ? 'المقررات التعليمية' : 'Curriculum Courses'}
          value={overview.totalSubjects}
          subtext={isRtl ? 'المواد النشطة' : 'Active courses'}
          icon={<ReportsIcon />}
          color="warning"
        />
      </div>

      {/* Staff Registrar Quick Action Hub */}
      <div className="panel">
        <div className="panel-header">
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>
            {isRtl ? 'المهام الأساسية لشؤون الطلاب (Registrar Operations)' : 'Registrar Operations & Tools'}
          </h3>
        </div>
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <button
            onClick={() => onNavigate('students')}
            className="btn"
            style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, height: 'auto' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
              <StudentsIcon />
              <span>{isRtl ? 'سجل الطلاب وقبول جديد' : 'Student Directory & Add'}</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {isRtl ? 'إضافة وتعديل بيانات الطلاب الشخصية وتفاصيل أولياء الأمور' : 'Create, edit student demographics and parent details'}
            </span>
          </button>

          <button
            onClick={() => onNavigate('enrollment')}
            className="btn"
            style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, height: 'auto' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)', fontWeight: 700, fontSize: 15 }}>
              <EnrollmentIcon />
              <span>{isRtl ? 'تسكين وتوزيع الفصول' : 'Class Enrollment'}</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {isRtl ? 'توزيع الطلاب على الشعب الدراسية للسنة الحالية' : 'Assign students to active class sections'}
            </span>
          </button>

          <button
            onClick={() => onNavigate('attendance-reports')}
            className="btn"
            style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, height: 'auto' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--secondary)', fontWeight: 700, fontSize: 15 }}>
              <AttendanceIcon />
              <span>{isRtl ? 'تقارير الحضور والإنذارات' : 'Attendance Reports'}</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {isRtl ? 'متابعة نسب الغياب واستخراج كشوف الحضور الشهرية' : 'Monitor absenteeism and export monthly attendance'}
            </span>
          </button>

          <button
            onClick={() => onNavigate('teacher-tracker')}
            className="btn"
            style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, height: 'auto' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0d9488', fontWeight: 700, fontSize: 15 }}>
              <span>🕒</span>
              <span>{isRtl ? 'سجل متابعة حضور المعلمين' : 'Teacher Presence Tracker'}</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {isRtl ? 'تتبع حضور وتأخير وغياب المعلمين وتسجيل الملاحظات' : 'Monitor teacher check-ins, punctuality, and leaves'}
            </span>
          </button>

          <button
            onClick={() => onNavigate('grade-reports')}
            className="btn"
            style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, height: 'auto' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
              <span>📊</span>
              <span>{isRtl ? 'كشوف النتائج والشهادات الجاهزة' : 'Ready Grade Reports'}</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {isRtl ? 'استعراض درجات الطلاب المرفوعة من المعلمين واستخراج الشهادات' : 'Review submitted student exam grades and transcripts'}
            </span>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="btn"
            style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, height: 'auto' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--warning)', fontWeight: 700, fontSize: 15 }}>
              <ReportsIcon />
              <span>{isRtl ? 'مركز تقارير Excel الشامل' : 'Excel Reports Hub'}</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {isRtl ? 'تصدير كشوف الدرجات، القوائم المدرسية، والإحصائيات' : 'Export grade sheets, rosters, and statistics to Excel'}
            </span>
          </button>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="charts-grid-2">
        <div className="chart-card">
          <div className="card-header-flex">
            <div>
              <div className="card-title">{isRtl ? 'توزيع الطلاب حسب الصفوف' : 'Students by Class Section'}</div>
              <div className="card-subtitle">{isRtl ? 'نسب إشغال الشعب المدرسية' : 'Section occupancy and distribution'}</div>
            </div>
          </div>
          <BarChart
            data={charts.studentsByClass}
            xKey="className"
            yKey="count"
            height={240}
            color="var(--success)"
          />
        </div>

        <div className="chart-card">
          <div className="card-header-flex">
            <div>
              <div className="card-title">{isRtl ? 'توزيع الطلاب حسب الجنس' : 'Students Demographic by Gender'}</div>
              <div className="card-subtitle">{isRtl ? 'الإحصاء الديموغرافي' : 'Gender demographic breakdown'}</div>
            </div>
          </div>
          <DonutChart
            data={charts.studentsByGender}
            labelKey="gender"
            valueKey="count"
            size={180}
            colors={['#10b981', '#0ea5e9', '#94a3b8']}
          />
        </div>
      </div>

      {/* Staff Scope Notice */}
      <div style={{
        background: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        padding: '16px 20px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: 14
      }}>
        <span style={{ fontSize: 24 }}>🛡️</span>
        <div>
          <strong style={{ color: 'var(--text-main)', fontSize: 14 }}>
            {isRtl ? 'نطاق صلاحيات موظف المدرسة والسجل (Staff Role Scope):' : 'Staff Role Permissions Scope:'}
          </strong>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
            {isRtl
              ? 'صلاحياتك تشمل إدارة شؤون الطلاب، الفصول، المواد، التسجيل، واستخراج كافة التقارير. إدارة حسابات الدخول وسجل الأمان مخصصة لمدير النظام.'
              : 'Your scope includes student admissions, class enrollment, curriculum management, and institutional reporting. User credentials and security audit logs are managed exclusively by System Administrators.'}
          </div>
        </div>
      </div>
    </div>
  );
}
