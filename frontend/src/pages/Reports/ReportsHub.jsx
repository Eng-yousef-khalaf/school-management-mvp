import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import BulkCertificatesModal from './BulkCertificatesModal';
import { DownloadIcon, StudentsIcon, TeachersIcon, AttendanceIcon, GradesIcon } from '../../components/common/Icons';

export default function ReportsHub({ onNavigate }) {
  const toast = useToast();
  const { isStaff, canManageStudents } = useAuth();
  const { isRtl } = useLanguage();

  const [demographics, setDemographics] = useState(null);
  const [teachersWorkload, setTeachersWorkload] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBulkCertificatesOpen, setIsBulkCertificatesOpen] = useState(false);

  const loadHubData = async () => {
    try {
      setLoading(true);
      setError('');
      const [demo, workload] = await Promise.all([
        api.get('/reports/demographics'),
        api.get('/reports/teachers')
      ]);
      setDemographics(demo);
      setTeachersWorkload(workload);
    } catch (err) {
      setError(err.message || 'Failed to compile report summaries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHubData();
  }, []);

  const exportStudentsDirectory = async () => {
    try {
      toast.info('Downloading student directory report...');
      await api.download('/reports/students/export', 'student_directory_report.xlsx');
      toast.success('Downloaded student directory report!');
    } catch (err) {
      toast.error(err.message || 'Export failed');
    }
  };

  const exportTeachersReport = async () => {
    try {
      toast.info('Downloading teacher workload report...');
      await api.download('/reports/teachers/export', 'teacher_workload_report.xlsx');
      toast.success('Downloaded teacher workload report!');
    } catch (err) {
      toast.error(err.message || 'Export failed');
    }
  };

  if (loading) return <PageLoader text="Loading analytical reports hub..." />;
  if (error) return <ErrorAlert message={error} onRetry={loadHubData} />;

  return (
    <div>
      {/* Report Categories Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 28 }}>
        {/* Bulk Certificates Card - Accessible to Staff */}
        <div className="panel" style={{ padding: 20, border: '2px solid rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div className="stat-icon success" style={{ fontSize: 24 }}>
              📜
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#047857' }}>
                {isRtl ? 'إصدار وطباعة الشهادات المجمعة' : 'Official Bulk Certificates'}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {isRtl ? 'طباعة شهادات وإفادات رسمية لكافة الطلاب بضغطة واحدة' : 'Generate official student transcripts and certificates'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsBulkCertificatesOpen(true)}
              style={{ background: '#10b981', borderColor: '#10b981' }}
            >
              📜 {isRtl ? 'فتح نافذة طباعة الشهادات' : 'Open Bulk Certificates'}
            </button>
          </div>
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div className="stat-icon primary">
              <StudentsIcon />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                {isRtl ? 'كشف ودليل الطلاب الشامل' : 'Student Directory Report'}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {isRtl ? 'قائمة الطلاب مع تفاصيل أولياء الأمور والحالة' : 'Complete roster with parent details & status'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('students')}>
              {isRtl ? 'عرض في السجل' : 'View in Roster'}
            </button>
            <button className="btn btn-primary btn-sm" onClick={exportStudentsDirectory}>
              <DownloadIcon /> {isRtl ? 'تصدير Excel' : 'Export Excel'}
            </button>
          </div>
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div className="stat-icon success">
              <AttendanceIcon />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                {isRtl ? 'تقرير مراقبة الحضور والغياب' : 'Attendance Audit Report'}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {isRtl ? 'نسب الحضور، الغياب، والتأخير' : 'Presence, absences, tardiness trends'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('attendance-reports')}>
              {isRtl ? 'فتح تقارير الحضور' : 'Open Attendance Reports'}
            </button>
          </div>
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div className="stat-icon warning">
              <GradesIcon />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                {isRtl ? 'مصفوفة الدرجات والمعدلات الأكاديمية' : 'Academic Grade Matrix'}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {isRtl ? 'نتائج الامتحانات الشاملة لجميع المواد' : 'Cross-subject exam scores and rankings'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('grade-reports')}>
              {isRtl ? 'فتح كشوف الدرجات' : 'Open Grade Reports'}
            </button>
          </div>
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div className="stat-icon secondary">
              <TeachersIcon />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                {isRtl ? 'تقرير أنصبة الهيئة التدريسية' : 'Faculty Workload Report'}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {isRtl ? 'الصفوف والمواد المسندة لكل معلم' : 'Assigned classes and teaching subjects'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-primary btn-sm" onClick={exportTeachersReport}>
              <DownloadIcon /> {isRtl ? 'تصدير Excel' : 'Export Excel'}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Certificates Modal */}
      <BulkCertificatesModal
        isOpen={isBulkCertificatesOpen}
        onClose={() => setIsBulkCertificatesOpen(false)}
      />

      {/* Faculty Workload Table */}
      <div className="panel">
        <div className="panel-header">
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Faculty Workload & Class Assignment Summary</h3>
          <button className="btn btn-secondary btn-sm" onClick={exportTeachersReport}>
            <DownloadIcon /> Export Workload
          </button>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Employee No</th>
                <th>Faculty Name</th>
                <th>Specialty</th>
                <th>Total Assignments</th>
                <th>Assigned Classes</th>
                <th>Assigned Subjects</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {teachersWorkload.map((t, idx) => (
                <tr key={idx}>
                  <td><strong>{t.employeeNo}</strong></td>
                  <td><span style={{ fontWeight: 600 }}>{t.fullName}</span></td>
                  <td>{t.specialty}</td>
                  <td><strong>{t.totalAssignments}</strong></td>
                  <td>{t.classes}</td>
                  <td>{t.subjects}</td>
                  <td>
                    <span className={`badge ${t.active === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                      {t.active}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
