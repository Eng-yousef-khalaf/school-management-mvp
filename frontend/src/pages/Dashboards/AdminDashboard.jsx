import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAcademicYear } from '../../context/AcademicYearContext';
import StatCard from '../../components/common/StatCard';
import BarChart from '../../components/charts/BarChart';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import Badge from '../../components/common/Badge';
import TeacherRolloverModal from '../Teachers/TeacherRolloverModal';
import {
  TeachersIcon,
  ClassesIcon,
  AttendanceIcon,
  UsersIcon,
  AuditLogsIcon,
  ReportsIcon
} from '../../components/common/Icons';

export default function AdminDashboard({ onNavigate }) {
  const { user } = useAuth();
  const { t, isRtl } = useLanguage();
  const { selectedYearId, isArchiveView, selectedYear } = useAcademicYear();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRolloverOpen, setIsRolloverOpen] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const query = selectedYearId ? `?academicYearId=${selectedYearId}` : '';
      const res = await api.get(`/dashboard${query}`);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load admin metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [selectedYearId]);

  if (loading) return <PageLoader text={t('loading')} />;
  if (error) return <ErrorAlert message={error} onRetry={loadDashboard} />;
  if (!data) return null;

  const { overview, charts, recentActivities, teacherPerformanceList, pendingTeachersList } = data;
  const tAtt = overview.todayTeacherAttendance || { total: overview.totalTeachers, present: 0, late: 0, absent: overview.totalTeachers, excused: 0, rate: 0 };
  const fMetrics = overview.facultyMetrics || { totalTeachers: overview.totalTeachers, assignedTeachersCount: overview.totalTeachers, pendingTeachersCount: 0, classesCovered: overview.totalClasses, totalClasses: overview.totalClasses, classCoverageRate: 100 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Admin Executive Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        color: '#fff',
        padding: '24px 28px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.35)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
            <span>👔</span>
            <span>{isRtl ? 'بوابة المدير العام (صلاحيات كاملة)' : 'Executive Admin Portal (Full Authority)'}</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
            {isRtl ? `مرحباً بك، مدير النظام (${user?.fullName || 'Administrator'})` : `Welcome, Administrator (${user?.fullName || 'Administrator'})`}
          </h2>
          <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: 14 }}>
            {isRtl
              ? 'متابعة نسب حضور والتزام المعلمين، تقييم الأداء الأكاديمي وتغطية الشعب، وسجل التدقيق والأمان المؤسسي'
              : 'Executive supervision over faculty daily attendance rates, teacher academic performance, and institutional security'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsRolloverOpen(true)}
            className="btn"
            style={{ background: '#10b981', color: '#fff', border: 'none', fontWeight: 800, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)' }}
          >
            ✨ {isRtl ? 'تجديد وتفعيل المعلمين للعام الجديد' : 'Reactivate Faculty for New Year'}
          </button>
          <button
            onClick={() => onNavigate('teacher-tracker')}
            className="btn"
            style={{ background: '#fff', color: 'var(--primary-dark)', fontWeight: 800 }}
          >
            🕒 {isRtl ? 'دفتر دوام المعلمين' : 'Teacher Timecards'}
          </button>
          <button
            onClick={() => onNavigate('teachers')}
            className="btn"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', fontWeight: 700 }}
          >
            <TeachersIcon /> {isRtl ? 'الهيئة التعليمية' : 'Faculty Directory'}
          </button>
          <button
            onClick={() => onNavigate('users')}
            className="btn"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', fontWeight: 700 }}
          >
            <UsersIcon /> {isRtl ? 'المستخدمون' : 'Users'}
          </button>
        </div>
      </div>

      {/* Admin Executive Stat Cards (Focused Exclusively on Teachers & Performance) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard
          title={isRtl ? 'نسبة حضور المعلمين اليوم' : "Today's Teacher Attendance Rate"}
          value={`${tAtt.rate}%`}
          subtext={isRtl ? `حاضر: ${tAtt.present} | متأخر: ${tAtt.late} | غائب: ${tAtt.absent}` : `Present: ${tAtt.present} | Late: ${tAtt.late} | Absent: ${tAtt.absent}`}
          icon={<AttendanceIcon />}
          color={tAtt.rate >= 90 ? 'success' : tAtt.rate >= 75 ? 'warning' : 'danger'}
        />

        <StatCard
          title={isRtl ? 'جاهزية وتعيين الهيئة التعليمية' : 'Faculty Allocation Readiness'}
          value={`${fMetrics.assignedTeachersCount} / ${fMetrics.totalTeachers}`}
          subtext={isRtl ? `${fMetrics.pendingTeachersCount} معلمين بانتظار استكمال الشعب` : `${fMetrics.pendingTeachersCount} pending class setup`}
          icon={<TeachersIcon />}
          color={fMetrics.pendingTeachersCount === 0 ? 'success' : 'warning'}
        />

        <StatCard
          title={isRtl ? 'نسبة تغطية الشعب بالمعلمين' : 'Class Section Coverage'}
          value={`${fMetrics.classCoverageRate}%`}
          subtext={isRtl ? `تغطية ${fMetrics.classesCovered} من أصل ${fMetrics.totalClasses} شعبة` : `${fMetrics.classesCovered} of ${fMetrics.totalClasses} sections covered`}
          icon={<ClassesIcon />}
          color="primary"
        />

        <StatCard
          title={isRtl ? 'شؤون المعلمين والطلاب (Staff)' : 'Faculty & Student Affairs Staff'}
          value={overview.totalStaff || 1}
          subtext={isRtl ? 'فريق المتابعة والتسجيل واستكمال الشعب' : 'Registrar & Operations Team'}
          icon={<UsersIcon />}
          color="secondary"
        />
      </div>

      {/* Teacher Attendance & Weekly Punctuality Hub */}
      <div className="panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🕒</span>
              <span>{isRtl ? 'تحليل ومؤشرات دوام المعلمين والتزام الحضور' : 'Teacher Attendance & Punctuality Analytics'}</span>
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              {isRtl
                ? 'متابعة الحضور اليومي للكادر التعليمي، نسب التأخير والغياب، ومؤشر الالتزام خلال الأسبوع'
                : 'Daily attendance rates, check-in timestamps, and 7-day punctuality trends for teaching staff.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: '#ecfdf5', color: '#047857', fontWeight: 700, padding: '6px 12px', fontSize: 13 }}>
              🟢 {tAtt.present} {isRtl ? 'حاضر بالموعد' : 'Present'}
            </span>
            <span className="badge" style={{ background: '#fef3c7', color: '#b45309', fontWeight: 700, padding: '6px 12px', fontSize: 13 }}>
              🟡 {tAtt.late} {isRtl ? 'متأخر' : 'Late'}
            </span>
            <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c', fontWeight: 700, padding: '6px 12px', fontSize: 13 }}>
              🔴 {tAtt.absent} {isRtl ? 'غائب / لم يسجل' : 'Absent'}
            </span>
            <button
              onClick={() => onNavigate('teacher-tracker')}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 700 }}
            >
              {isRtl ? 'عرض سجل الدوام التفصيلي ←' : 'Full Attendance Log →'}
            </button>
          </div>
        </div>

        {/* 7-Day Attendance Chart */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
            📊 {isRtl ? 'مؤشر حضور وتواجد المعلمين خلال آخر 7 أيام:' : '7-Day Faculty Presence & Punctuality Trend:'}
          </div>
          {charts.teacherAttendanceTrend && charts.teacherAttendanceTrend.length > 0 ? (
            <BarChart
              data={charts.teacherAttendanceTrend}
              xKey="date"
              yKey="present"
              height={220}
              color="#10b981"
            />
          ) : (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              {isRtl ? 'لا توجد بيانات حضور سابقة مسجلة' : 'No historical attendance recorded'}
            </div>
          )}
        </div>
      </div>

      {/* Teacher Academic Performance & Workload Supervision Table */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>
              👨‍🏫 {isRtl ? 'سجل أداء وتعيينات الهيئة التعليمية' : 'Faculty Performance & Teaching Workload'}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              {isRtl ? 'توزيع الشعب الدراسية والمقررات، حالة دوام اليوم، وجاهزية الكادر التعليمي' : 'Workload allocation, today attendance status, and section assignments across all active teachers'}
            </p>
          </div>
          <button onClick={() => onNavigate('teachers')} className="btn btn-secondary btn-sm">
            <TeachersIcon /> {isRtl ? 'إدارة المعلمين وتخصيص الشعب' : 'Manage Teachers'}
          </button>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>{isRtl ? 'الرقم الوظيفي' : 'Employee No'}</th>
                <th>{isRtl ? 'اسم المعلم' : 'Faculty Member'}</th>
                <th>{isRtl ? 'التخصص' : 'Specialty'}</th>
                <th>{isRtl ? 'النصاب التدريسي (الشعب والمواد)' : 'Teaching Load (Classes & Subjects)'}</th>
                <th>{isRtl ? 'حالة الدوام اليوم' : "Today's Attendance"}</th>
                <th>{isRtl ? 'حالة التعيين' : 'Allocation Status'}</th>
                <th style={{ textAlign: 'right' }}>{isRtl ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {teacherPerformanceList && teacherPerformanceList.length > 0 ? (
                teacherPerformanceList.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong
                        style={{ color: 'var(--primary)', cursor: 'pointer' }}
                        onClick={() => onNavigate('teacher-details', { teacherId: t.id })}
                      >
                        {t.employeeNo}
                      </strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{t.fullName}</span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: '#f1f5f9', color: '#334155' }}>
                        {t.specialty}
                      </span>
                    </td>
                    <td>
                      {t.classesCount > 0 ? (
                        <div>
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                            🏫 {t.classesCount} {isRtl ? 'شعب' : 'Classes'} ({t.classes.join(', ')})
                          </span>
                          <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)' }}>
                            📖 {t.subjectsCount} {isRtl ? 'مواد' : 'Subjects'} ({t.subjects.join(', ')})
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>
                          {isRtl ? 'لم تسند له شعب بعد' : 'No classes assigned'}
                        </span>
                      )}
                    </td>
                    <td>
                      {t.attendanceStatus === 'PRESENT' ? (
                        <span className="badge badge-active">
                          🟢 {isRtl ? 'حاضر' : 'Present'} {t.checkIn ? `(${t.checkIn})` : ''}
                        </span>
                      ) : t.attendanceStatus === 'LATE' ? (
                        <span className="badge badge-late">
                          🟡 {isRtl ? 'متأخر' : 'Late'} {t.checkIn ? `(${t.checkIn})` : ''}
                        </span>
                      ) : t.attendanceStatus === 'EXCUSED' ? (
                        <span className="badge badge-excused">
                          🔵 {isRtl ? 'إجازة / عذر' : 'Excused'}
                        </span>
                      ) : (
                        <span className="badge badge-inactive">
                          🔴 {isRtl ? 'لم يسجل / غائب' : 'Not Checked In'}
                        </span>
                      )}
                    </td>
                    <td>
                      {t.isPending ? (
                        <span className="badge badge-late" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontWeight: 700 }}>
                          ⚠️ {isRtl ? 'بانتظار استكمال الشعب' : 'Pending Allocation'}
                        </span>
                      ) : (
                        <span className="badge badge-active" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                          ✓ {isRtl ? 'مكتمل التعيين' : 'Ready & Assigned'}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => onNavigate('teachers')}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 12 }}
                      >
                        {isRtl ? 'تعديل الشعب' : 'Edit Allocation'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                    {t('noDataFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Quick Controls Hub */}
      <div className="panel">
        <div className="panel-header">
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>
            {isRtl ? 'أدوات الإدارة والرقابة المؤسسية (Executive Controls)' : 'Executive Controls & Administration'}
          </h3>
        </div>
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <button
            onClick={() => onNavigate('teachers')}
            className="btn"
            style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, height: 'auto' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)', fontWeight: 700, fontSize: 15 }}>
              <TeachersIcon />
              <span>{isRtl ? 'الهيئة التعليمية والمعلمون' : 'Faculty Management'}</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {isRtl ? 'إضافة وتعديل سجلات المعلمين وتخصيص الجداول والشعب' : 'Register teachers, allocate classes and subjects'}
            </span>
          </button>

          <button
            onClick={() => onNavigate('teacher-tracker')}
            className="btn"
            style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, height: 'auto' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
              <AttendanceIcon />
              <span>{isRtl ? 'تقارير ونسب دوام المعلمين' : 'Teacher Attendance Logs'}</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {isRtl ? 'سجل البصمة والدوام اليومي ومتابعة التزام المعلمين' : 'Live timecards, punctuality logs and attendance rates'}
            </span>
          </button>

          <button
            onClick={() => onNavigate('users')}
            className="btn"
            style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, height: 'auto' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7c3aed', fontWeight: 700, fontSize: 15 }}>
              <UsersIcon />
              <span>{isRtl ? 'إدارة المستخدمين والأدوار' : 'User Accounts & Roles'}</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {isRtl ? 'إنشاء وتعديل وتفعيل حسابات المدراء والمعلمين وشؤون المعلمين والطلاب' : 'Create, activate accounts and assign RBAC roles'}
            </span>
          </button>

          <button
            onClick={() => onNavigate('audit-logs')}
            className="btn"
            style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, height: 'auto' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--warning)', fontWeight: 700, fontSize: 15 }}>
              <AuditLogsIcon />
              <span>{isRtl ? 'سجل التدقيق والرقابة الأمني' : 'Security Audit Trail'}</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {isRtl ? 'تتبع زمني لكافة التعديلات والحركات الإدارية مع الـIP' : 'Chronological tracking of sensitive operations & IPs'}
            </span>
          </button>
        </div>
      </div>

      {/* Security Audit Log Stream for Admin */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>
              {isRtl ? 'سجل العمليات والرقابة الأمنية المباشر' : 'Live Security Audit Stream'}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {isRtl ? 'مراقبة فورية لكافة الحركات والتعديلات المسجلة بالنظام' : 'Real-time administrative transaction tracking'}
            </p>
          </div>
          <button onClick={() => onNavigate('audit-logs')} className="btn btn-secondary btn-sm">
            <AuditLogsIcon /> {isRtl ? 'عرض السجل الكامل' : 'View Full Log'}
          </button>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>{isRtl ? 'العملية' : 'Action'}</th>
                <th>{isRtl ? 'الكيان' : 'Entity'}</th>
                <th>{isRtl ? 'المستخدم المسؤول' : 'Performed By'}</th>
                <th>{isRtl ? 'التوقيت' : 'Time'}</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities && recentActivities.length > 0 ? (
                recentActivities.map((act) => (
                  <tr key={act.id}>
                    <td>
                      <strong style={{ fontSize: 13, color: 'var(--text-main)' }}>{act.action}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{act.entity} {act.entityId ? `#${act.entityId}` : ''}</span>
                    </td>
                    <td>
                      <Badge type={act.role} label={act.user} />
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    {t('noDataFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rollover & Reactivation Modal */}
      {isRolloverOpen && (
        <TeacherRolloverModal
          isOpen={isRolloverOpen}
          onClose={() => setIsRolloverOpen(false)}
          onSaved={() => {
            loadDashboard();
          }}
        />
      )}
    </div>
  );
}
