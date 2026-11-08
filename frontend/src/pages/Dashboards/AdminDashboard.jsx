import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import StatCard from '../../components/common/StatCard';
import BarChart from '../../components/charts/BarChart';
import DonutChart from '../../components/charts/DonutChart';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import Badge from '../../components/common/Badge';
import {
  StudentsIcon,
  TeachersIcon,
  ClassesIcon,
  SubjectsIcon,
  UsersIcon,
  AuditLogsIcon,
  ReportsIcon
} from '../../components/common/Icons';

export default function AdminDashboard({ onNavigate }) {
  const { user } = useAuth();
  const { t, isRtl } = useLanguage();
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
      setError(err.message || 'Failed to load admin metrics');
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
              ? 'الرقابة الشاملة على العمليات الأكاديمية، إدارة المستخدمين، وسجل التدقيق والأمان المؤسسي'
              : 'Enterprise supervision across all academic operations, user directory permissions, and security audit logs'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => onNavigate('users')}
            className="btn"
            style={{ background: '#fff', color: 'var(--primary-dark)', fontWeight: 700 }}
          >
            <UsersIcon /> {isRtl ? 'إدارة المستخدمين' : 'Manage Users'}
          </button>
          <button
            onClick={() => onNavigate('audit-logs')}
            className="btn"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', fontWeight: 700 }}
          >
            <AuditLogsIcon /> {isRtl ? 'سجل الرقابة' : 'Audit Logs'}
          </button>
        </div>
      </div>

      {/* Admin Executive Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard
          title={isRtl ? 'الهيئة التعليمية والمعلمون' : 'Faculty Teachers'}
          value={overview.totalTeachers}
          subtext={isRtl ? 'معلم معتمد بالنظام' : 'Active faculty'}
          icon={<TeachersIcon />}
          color="success"
        />
        <StatCard
          title={isRtl ? 'الكادر والموظفون (Staff)' : 'Administrative Staff'}
          value={overview.totalStaff || 1}
          subtext={isRtl ? 'موظف شؤون طلاب وسجل' : 'Registrar & Staff'}
          icon={<UsersIcon />}
          color="secondary"
        />
        <StatCard
          title={isRtl ? 'إجمالي الطلاب المسجلين' : 'Total Students'}
          value={overview.totalStudents}
          subtext={`${overview.overallPassRate || 94}% ${isRtl ? 'نسبة النجاح العامة' : 'Pass rate'}`}
          icon={<StudentsIcon />}
          color="primary"
        />
        <StatCard
          title={isRtl ? 'المعدل الأكاديمي العام' : 'Overall Academic GPA'}
          value={`${overview.overallGradeAverage || 85}%`}
          subtext={isRtl ? 'متوسط درجات الطلاب كافة' : 'Schoolwide grade average'}
          icon={<ReportsIcon />}
          color="warning"
        />
      </div>

      {/* Admin Quick Tools Hub */}
      <div className="panel">
        <div className="panel-header">
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>
            {isRtl ? 'أدوات الإدارة والرقابة المؤسسية (Executive Controls)' : 'Executive Controls & Administration'}
          </h3>
        </div>
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <button
            onClick={() => onNavigate('users')}
            className="btn"
            style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, height: 'auto' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
              <UsersIcon />
              <span>{isRtl ? 'إدارة المستخدمين والأدوار' : 'User Accounts & Roles'}</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {isRtl ? 'إنشاء وتعديل وتفعيل حسابات المدراء والمعلمين والموظفين' : 'Create, activate accounts and assign RBAC roles'}
            </span>
          </button>

          <button
            onClick={() => onNavigate('audit-logs')}
            className="btn"
            style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, height: 'auto' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7c3aed', fontWeight: 700, fontSize: 15 }}>
              <AuditLogsIcon />
              <span>{isRtl ? 'سجل التدقيق والرقابة الأمني' : 'Security Audit Trail'}</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {isRtl ? 'تتبع زمني لكافة التعديلات والحركات الإدارية مع الـIP' : 'Chronological tracking of sensitive operations & IPs'}
            </span>
          </button>

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
              {isRtl ? 'إدارة سجلات المعلمين وتخصيص الجداول والمقررات' : 'Manage faculty records and teaching allocations'}
            </span>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="btn"
            style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, height: 'auto' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--warning)', fontWeight: 700, fontSize: 15 }}>
              <ReportsIcon />
              <span>{isRtl ? 'التقارير الشاملة وتصدير Excel' : 'Reports Hub & Exports'}</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {isRtl ? 'استخراج مصفوفة الدرجات ونسب الحضور الشاملة' : 'Export institutional grade sheets & attendance matrices'}
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
            color="var(--primary)"
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
            colors={['#4f46e5', '#ec4899', '#94a3b8']}
          />
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
    </div>
  );
}
