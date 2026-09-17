import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import BarChart from '../components/charts/BarChart';
import DonutChart from '../components/charts/DonutChart';
import { PageLoader } from '../components/common/Loader';
import ErrorAlert from '../components/common/ErrorAlert';
import Badge from '../components/common/Badge';
import {
  StudentsIcon,
  TeachersIcon,
  ClassesIcon,
  SubjectsIcon,
  AttendanceIcon,
  PlusIcon,
  ReportsIcon
} from '../components/common/Icons';

export default function Dashboard({ onNavigate }) {
  const { t, isRtl } = useLanguage();
  const { user, isAdmin, isStaff, isTeacher } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/dashboard');
      setData(res);
    } catch (err) {
      setError(err.message || t('noDataFound'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) return <PageLoader text={t('loading')} />;
  if (error) return <ErrorAlert message={error} onRetry={loadDashboard} />;
  if (!data) return null;

  const { overview, charts, recentActivities } = data;
  const { todayAttendance } = overview || { todayAttendance: { rate: 95, present: 0, absent: 0, late: 0 } };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 700, marginBottom: 4 }}>
            <span>📅</span>
            <span>{new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.3px', margin: 0 }}>
            {isRtl ? `مرحباً بك، ${user?.fullName || 'المستخدم'}` : `Welcome back, ${user?.fullName || 'User'}`} 👋
          </h2>
          <p style={{ fontSize: '12px', color: '#cbd5e1', marginTop: 3, maxWidth: 500 }}>
            {isRtl
              ? 'إليك ملخص مؤشرات الأداء والعمليات اليومية في المدرسة لهذا اليوم.'
              : 'Here is the high-level summary of your school daily operations and performance.'}
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(isAdmin || isStaff) && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onNavigate('students')}
              style={{ background: '#4f46e5', borderColor: '#4f46e5', boxShadow: '0 2px 8px rgba(79, 70, 229, 0.35)' }}
            >
              <PlusIcon /> {isRtl ? 'إدارة وقبول الطلاب' : 'Admissions'}
            </button>
          )}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate(isTeacher ? 'attendance' : 'teacher-tracker')}
            style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.25)' }}
          >
            <AttendanceIcon /> {isRtl ? 'دفتر الحضور' : 'Attendance'}
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="btn btn-secondary btn-sm"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.25)' }}
          >
            <ReportsIcon /> {isRtl ? 'مركز التقارير' : 'Reports'}
          </button>
        </div>
      </div>

      {/* Top 4 Stat Cards Grid */}
      <div className="grid-cards-4">
        <StatCard
          title={t('totalStudents')}
          value={overview.totalStudents}
          subtext={`↑ ${overview.activeStudents} ${t('statusActive')}`}
          icon={<StudentsIcon />}
          color="primary"
        />
        <StatCard
          title={t('totalFaculty')}
          value={overview.totalTeachers}
          subtext={t('teachersSubtitle')}
          icon={<TeachersIcon />}
          color="success"
        />
        <StatCard
          title={t('totalClassesCount')}
          value={overview.totalClasses}
          subtext={t('classesSubtitle')}
          icon={<ClassesIcon />}
          color="secondary"
        />
        <StatCard
          title={t('totalSubjectsCount')}
          value={overview.totalSubjects}
          subtext={t('subjectsSubtitle')}
          icon={<SubjectsIcon />}
          color="warning"
        />
      </div>

      {/* Today Attendance Highlights Card */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header">
          <div>
            <h3 className="panel-title">{t('attendanceTodayTitle')}</h3>
            <p className="panel-subtitle">{t('attendanceSubtitle')}</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('attendance')}>
            <AttendanceIcon /> {t('attendance')}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, padding: 20 }}>
          <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{t('todayAttendanceRate')}</span>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)', marginTop: 4 }}>
              {todayAttendance.rate}%
            </div>
            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${todayAttendance.rate}%`, background: 'var(--primary)', borderRadius: 3 }} />
            </div>
          </div>

          <div style={{ background: 'var(--success-light)', padding: '16px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--success-border)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--success-text)' }}>{t('present')}</span>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--success)', marginTop: 4 }}>
              {todayAttendance.present}
            </div>
            <div style={{ fontSize: 11, color: 'var(--success-text)', marginTop: 4 }}>{isRtl ? 'حضور مؤكد' : 'Confirmed'}</div>
          </div>

          <div style={{ background: 'var(--danger-light)', padding: '16px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--danger-border)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--danger-text)' }}>{t('absent')}</span>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--danger)', marginTop: 4 }}>
              {todayAttendance.absent}
            </div>
            <div style={{ fontSize: 11, color: 'var(--danger-text)', marginTop: 4 }}>{isRtl ? 'غياب مسجل' : 'Absent'}</div>
          </div>

          <div style={{ background: 'var(--warning-light)', padding: '16px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--warning-border)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--warning-text)' }}>{t('late')}</span>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--warning)', marginTop: 4 }}>
              {todayAttendance.late}
            </div>
            <div style={{ fontSize: 11, color: 'var(--warning-text)', marginTop: 4 }}>{isRtl ? 'تأخر بالدخول' : 'Late'}</div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="charts-grid-2">
        <div className="chart-card">
          <div className="card-header-flex">
            <div>
              <div className="card-title">{t('studentsByClassTitle')}</div>
              <div className="card-subtitle">{t('classesSubtitle')}</div>
            </div>
          </div>
          <BarChart
            data={charts.studentsByClass}
            xKey="className"
            yKey="count"
            height={240}
            color="var(--primary)"
          />
        </div>

        <div className="chart-card">
          <div className="card-header-flex">
            <div>
              <div className="card-title">{t('studentsByGenderTitle')}</div>
              <div className="card-subtitle">{t('studentsTitle')}</div>
            </div>
          </div>
          <DonutChart
            data={charts.studentsByGender}
            labelKey="gender"
            valueKey="count"
            height={240}
          />
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">{t('recentActivitiesTitle')}</h3>
            <p className="panel-subtitle">{t('recentActivitiesSubtitle')}</p>
          </div>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>{t('activity')}</th>
                <th>{t('user')}</th>
                <th>{t('role')}</th>
                <th>{t('time')}</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities && recentActivities.length > 0 ? (
                recentActivities.map((act) => (
                  <tr key={act.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          width: 32,
                          height: 32,
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 14
                        }}>
                          📌
                        </span>
                        <span style={{ fontWeight: 600 }}>{act.details || act.action}</span>
                      </div>
                    </td>
                    <td>{act.user?.fullName || 'System'}</td>
                    <td>
                      <Badge status={act.role || 'ACTIVE'} />
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {new Date(act.timestamp || act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    {t('noDataFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
