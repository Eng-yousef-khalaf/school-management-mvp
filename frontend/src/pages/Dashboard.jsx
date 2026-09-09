import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
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
  PlusIcon
} from '../components/common/Icons';

export default function Dashboard({ onNavigate }) {
  const { t } = useLanguage();
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
  const { todayAttendance } = overview;

  return (
    <div>
      {/* Top Stat Cards Grid */}
      <div className="grid-cards-4">
        <StatCard
          title={t('totalStudents')}
          value={overview.totalStudents}
          subtext={`${overview.activeStudents} ${t('statusActive')}`}
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
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>{t('attendanceTodayTitle')}</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('attendanceSubtitle')}</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('attendance')}>
            <AttendanceIcon /> {t('attendance')}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, padding: 20 }}>
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('todayAttendanceRate')}</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
              {todayAttendance.rate}%
            </div>
          </div>
          <div style={{ background: 'var(--success-light)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
            <span style={{ fontSize: 12, color: '#166534' }}>{t('present')}</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)', marginTop: 4 }}>
              {todayAttendance.present}
            </div>
          </div>
          <div style={{ background: 'var(--danger-light)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
            <span style={{ fontSize: 12, color: '#991b1b' }}>{t('absent')}</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--danger)', marginTop: 4 }}>
              {todayAttendance.absent}
            </div>
          </div>
          <div style={{ background: 'var(--warning-light)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid #fed7aa' }}>
            <span style={{ fontSize: 12, color: '#9a3412' }}>{t('late')}</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--warning)', marginTop: 4 }}>
              {todayAttendance.late}
            </div>
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
            size={180}
            colors={['#4f46e5', '#ec4899', '#94a3b8']}
          />
        </div>
      </div>

      {/* Quick Action Hub & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        <div className="panel" style={{ height: 'fit-content' }}>
          <div className="panel-header">
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>{t('actions')}</h3>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-primary" style={{ justifyContent: 'flex-start' }} onClick={() => onNavigate('students')}>
              <PlusIcon /> {t('addStudent')}
            </button>
            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => onNavigate('attendance')}>
              <AttendanceIcon /> {t('attendance')}
            </button>
            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => onNavigate('grades')}>
              <PlusIcon /> {t('grades')}
            </button>
            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => onNavigate('reports')}>
              <PlusIcon /> {t('reports')}
            </button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>{t('recentActivitiesTitle')}</h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('auditLogs')}</span>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>{t('auditAction')}</th>
                  <th>{t('auditEntity')}</th>
                  <th>{t('auditUser')}</th>
                  <th>{t('auditTime')}</th>
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
      </div>
    </div>
  );
}
