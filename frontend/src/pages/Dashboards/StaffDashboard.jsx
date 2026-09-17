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
import AddEditTeacherModal from '../Teachers/AddEditTeacherModal';

export default function StaffDashboard({ onNavigate }) {
  const { user } = useAuth();
  const { t, isRtl } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Teacher Assignment Modal state
  const [assigningTeacher, setAssigningTeacher] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Staff Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: '#fff',
        padding: '16px 20px',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: '14px', fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>
            <span>📋</span>
            <span>{isRtl ? 'بوابة شؤون المعلمين والطلاب' : 'Faculty & Student Affairs Portal'}</span>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
            {isRtl ? `أهلاً بك، ${user?.fullName || ''} (شؤون المعلمين والطلاب)` : `Welcome, ${user?.fullName || ''} (Faculty & Student Affairs)`}
          </h2>
          <p style={{ margin: '3px 0 0', opacity: 0.9, fontSize: 12 }}>
            {isRtl
              ? 'إدارة شؤون المعلمين وتوزيع الشعب والمناهج، تسجيل وتسكين الطلاب، ومتابعة سجلات الدوام الأكاديمي والنتائج'
              : 'Faculty management, subject allocations, student admissions, attendance, and transcripts'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('teachers')}
            className="btn btn-sm"
            style={{ background: '#fff', color: '#059669', fontWeight: 800 }}
          >
            👨‍🏫 {isRtl ? 'دليل المعلمين وتعيين الشعب' : 'Teachers & Allocation'}
          </button>
          <button
            onClick={() => onNavigate('teacher-tracker')}
            className="btn btn-sm"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', fontWeight: 700 }}
          >
            🕒 {isRtl ? 'متابعة المعلمين والدوام' : 'Track Teachers'}
          </button>
          <button
            onClick={() => onNavigate('fees')}
            className="btn btn-sm"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', fontWeight: 700 }}
          >
            💰 {isRtl ? 'الرسوم والأقساط' : 'Fees & Payments'}
          </button>
          <button
            onClick={() => onNavigate('students')}
            className="btn btn-sm"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', fontWeight: 700 }}
          >
            <PlusIcon /> {isRtl ? 'تسجيل الطلاب' : 'Register Students'}
          </button>
        </div>
      </div>

      {/* Pending Teacher Setup Alert Banner (عند تسجيل معلم جديد من قبل المدير) */}
      {data.pendingTeachersList && data.pendingTeachersList.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
          border: '1px solid #f59e0b',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🔔</span>
              <div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#92400e' }}>
                  {isRtl ? 'تنبيه: يوجد معلمون جدد تم تسجيلهم بحاجة لاستكمال الشعب والمواد' : 'Action Required: Newly Registered Teachers Awaiting Class & Subject Allocation'}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#b45309' }}>
                  {isRtl
                    ? `قامت الإدارة بإضافة ${data.pendingTeachersList.length} معلم جديد. يرجى استكمال تعيين الشعب والمقررات الدراسية المناسبة لكل منهم:`
                    : `Administrator created ${data.pendingTeachersList.length} new teacher record(s). Please assign their classes and subjects below:`}
                </p>
              </div>
            </div>
            <span className="badge" style={{ background: '#f59e0b', color: '#fff', fontWeight: 800, fontSize: 11.5, padding: '4px 10px' }}>
              {data.pendingTeachersList.length} {isRtl ? 'معلم بانتظار التعيين' : 'Pending Allocation'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            {data.pendingTeachersList.map(t => (
              <div
                key={t.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #fde68a',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#1e293b' }}>
                    {t.firstName} {t.lastName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                    <span>{t.employeeNo}</span> • <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{t.specialty}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAssigningTeacher(t);
                    setIsAssignModalOpen(true);
                  }}
                  className="btn btn-sm"
                  style={{
                    background: '#f59e0b',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: 11,
                    padding: '6px 10px',
                    boxShadow: '0 2px 4px rgba(245, 158, 11, 0.25)'
                  }}
                >
                  ✏️ {isRtl ? 'استكمال التعيين الآن' : 'Assign Classes'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teacher Daily Presence Tracker Card */}
      {teacherAttSummary && (
        <div style={{
          background: '#fff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>👨‍🏫</span>
              <h4 style={{ fontSize: 13.5, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {isRtl ? 'حالة دوام وحضور المعلمين اليوم:' : "Today's Teacher Attendance Status:"}
              </h4>
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '3px 0 0' }}>
              {isRtl
                ? `إجمالي الهيئة التعليمية: ${teacherAttSummary.total} معلماً | حاضر: ${teacherAttSummary.present} | متأخر: ${teacherAttSummary.late} | غائب / إجازة: ${teacherAttSummary.absent + teacherAttSummary.excused}`
                : `Total Faculty: ${teacherAttSummary.total} | Present: ${teacherAttSummary.present} | Late: ${teacherAttSummary.late} | Absent/Excused: ${teacherAttSummary.absent + teacherAttSummary.excused}`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: 'var(--success-light)', color: 'var(--success)', fontWeight: 700, padding: '4px 8px', fontSize: 11.5 }}>
              🟢 {teacherAttSummary.present} {isRtl ? 'حاضر' : 'Present'}
            </span>
            <span className="badge" style={{ background: 'var(--warning-light)', color: 'var(--warning)', fontWeight: 700, padding: '4px 8px', fontSize: 11.5 }}>
              🟡 {teacherAttSummary.late} {isRtl ? 'متأخر' : 'Late'}
            </span>
            <span className="badge" style={{ background: 'var(--danger-light)', color: 'var(--danger)', fontWeight: 700, padding: '4px 8px', fontSize: 11.5 }}>
              🔴 {teacherAttSummary.absent} {isRtl ? 'غائب' : 'Absent'}
            </span>
            <button
              onClick={() => onNavigate('teacher-tracker')}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 700, marginRight: isRtl ? 6 : 0, marginLeft: isRtl ? 0 : 6 }}
            >
              {isRtl ? 'فتح سجل المتابعة التفصيلي ←' : 'Open Tracker →'}
            </button>
          </div>
        </div>
      )}

      {/* Parent & Student Rapid Inquiry Widget */}
      <div className="panel" style={{ padding: '16px 18px', border: '1.5px solid rgba(16, 185, 129, 0.25)', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18 }}>🔍</span>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {isRtl ? 'مركز استعلام أولياء الأمور والبحث السريع عن الطلاب' : 'Parent Inquiry & Instant Student 360 Lookup'}
              </h3>
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '2px 0 0' }}>
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
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input
            type="text"
            className="form-input"
            style={{
              padding: isRtl ? '9px 38px 9px 12px' : '9px 12px 9px 38px',
              fontSize: '13px',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--border-color)',
              background: '#f8fafc'
            }}
            placeholder={isRtl ? 'اكتب اسم الطالب، الرقم الأكاديمي، اسم ولي الأمر، أو رقم هاتف ولي الأمر...' : 'Search by student name, ID, parent name, or parent phone number...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '12px', top: '10px', fontSize: '15px', color: 'var(--text-muted)' }}>
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                [isRtl ? 'left' : 'right']: '10px',
                top: '9px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontSize: '13px'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Results Display */}
        {searchLoading ? (
          <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: 13 }}>
            {isRtl ? 'جاري البحث في قاعدة البيانات...' : 'Searching student records...'}
          </div>
        ) : searchResults.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
            {searchResults.map((s) => (
              <div
                key={s.id}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 12,
                  background: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 15
                    }}
                  >
                    {s.firstName?.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: 13 }}>{s.firstName} {s.middleName ? s.middleName + ' ' : ''}{s.lastName}</strong>
                      <span className="badge badge-primary" style={{ fontSize: 10.5 }}>{s.currentClass || (isRtl ? 'غير مسجل' : 'Unassigned')}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {s.studentNumber}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 4, fontSize: 11.5, display: 'flex', flexDirection: 'column', gap: 3 }}>
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

                <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
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
          <div style={{ textAlign: 'center', padding: '18px', background: '#f8fafc', borderRadius: 6, color: 'var(--text-muted)', fontSize: 12.5 }}>
            {isRtl ? `لم يتم العثور على طالب يطابق: "${searchQuery}"` : `No students found matching "${searchQuery}"`}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 6, border: '1px dashed rgba(16, 185, 129, 0.3)' }}>
            <span style={{ fontSize: 16 }}>💡</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
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
          <h3 className="panel-title">
            {isRtl ? 'المهام الأساسية لشؤون الطلاب (Registrar Operations)' : 'Registrar Operations & Tools'}
          </h3>
        </div>
        <div style={{ padding: 14 }}>
          <div className="action-hub-grid">
            <div
              onClick={() => onNavigate('students')}
              className="action-hub-card"
              style={{ borderInlineStart: '4px solid var(--primary)' }}
            >
              <div className="action-hub-card-header" style={{ color: 'var(--primary)' }}>
                <StudentsIcon />
                <span>{isRtl ? 'سجل الطلاب وقبول جديد' : 'Student Directory & Add'}</span>
              </div>
              <p className="action-hub-card-desc">
                {isRtl ? 'إضافة وتعديل بيانات الطلاب الشخصية وتفاصيل أولياء الأمور' : 'Create, edit student demographics and parent details'}
              </p>
            </div>

            <div
              onClick={() => onNavigate('enrollment')}
              className="action-hub-card"
              style={{ borderInlineStart: '4px solid var(--success)' }}
            >
              <div className="action-hub-card-header" style={{ color: 'var(--success)' }}>
                <EnrollmentIcon />
                <span>{isRtl ? 'تسكين وتوزيع الفصول' : 'Class Enrollment'}</span>
              </div>
              <p className="action-hub-card-desc">
                {isRtl ? 'توزيع الطلاب على الشعب الدراسية للسنة الحالية' : 'Assign students to active class sections'}
              </p>
            </div>

            <div
              onClick={() => onNavigate('attendance-reports')}
              className="action-hub-card"
              style={{ borderInlineStart: '4px solid var(--secondary)' }}
            >
              <div className="action-hub-card-header" style={{ color: 'var(--secondary)' }}>
                <AttendanceIcon />
                <span>{isRtl ? 'تقارير الحضور والإنذارات' : 'Attendance Reports'}</span>
              </div>
              <p className="action-hub-card-desc">
                {isRtl ? 'متابعة نسب الغياب واستخراج كشوف الحضور الشهرية' : 'Monitor absenteeism and export monthly attendance'}
              </p>
            </div>

            <div
              onClick={() => onNavigate('teacher-tracker')}
              className="action-hub-card"
              style={{ borderInlineStart: '4px solid #0d9488' }}
            >
              <div className="action-hub-card-header" style={{ color: '#0d9488' }}>
                <span>🕒</span>
                <span>{isRtl ? 'سجل متابعة حضور المعلمين' : 'Teacher Presence Tracker'}</span>
              </div>
              <p className="action-hub-card-desc">
                {isRtl ? 'تتبع حضور وتأخير وغياب المعلمين وتسجيل الملاحظات' : 'Monitor teacher check-ins, punctuality, and leaves'}
              </p>
            </div>

            <div
              onClick={() => onNavigate('grade-reports')}
              className="action-hub-card"
              style={{ borderInlineStart: '4px solid #6366f1' }}
            >
              <div className="action-hub-card-header" style={{ color: '#6366f1' }}>
                <span>📊</span>
                <span>{isRtl ? 'كشوف النتائج والشهادات الجاهزة' : 'Ready Grade Reports'}</span>
              </div>
              <p className="action-hub-card-desc">
                {isRtl ? 'استعراض درجات الطلاب المرفوعة من المعلمين واستخراج الشهادات' : 'Review submitted student exam grades and transcripts'}
              </p>
            </div>

            <div
              onClick={() => onNavigate('reports')}
              className="action-hub-card"
              style={{ borderInlineStart: '4px solid var(--warning)' }}
            >
              <div className="action-hub-card-header" style={{ color: 'var(--warning)' }}>
                <ReportsIcon />
                <span>{isRtl ? 'مركز تقارير Excel الشامل' : 'Excel Reports Hub'}</span>
              </div>
              <p className="action-hub-card-desc">
                {isRtl ? 'تصدير كشوف الدرجات، القوائم المدرسية، والإحصائيات' : 'Export grade sheets, rosters, and statistics to Excel'}
              </p>
            </div>
          </div>
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

      {/* Teacher Assignment Modal */}
      {isAssignModalOpen && (
        <AddEditTeacherModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setAssigningTeacher(null);
          }}
          teacher={assigningTeacher}
          onSaved={() => {
            loadDashboard();
          }}
        />
      )}
    </div>
  );
}
