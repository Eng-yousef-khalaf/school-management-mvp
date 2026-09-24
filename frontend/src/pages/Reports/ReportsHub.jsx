import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import BulkCertificatesModal from './BulkCertificatesModal';
import UnicefAnalyticalReportModal from './UnicefAnalyticalReportModal';
import UnicefLogo from '../../components/common/UnicefLogo';
import { DownloadIcon, StudentsIcon, TeachersIcon, AttendanceIcon, GradesIcon } from '../../components/common/Icons';

export default function ReportsHub({ onNavigate }) {
  const toast = useToast();
  const { isAdmin, isStaff, canManageStudents } = useAuth();
  const { isRtl } = useLanguage();

  const [demographics, setDemographics] = useState(null);
  const [teachersWorkload, setTeachersWorkload] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBulkCertificatesOpen, setIsBulkCertificatesOpen] = useState(false);
  const [isUnicefReportOpen, setIsUnicefReportOpen] = useState(false);
  const [isExportingUnified, setIsExportingUnified] = useState(false);

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
      toast.info(isRtl ? 'جاري تحميل دليل الطلاب...' : 'Downloading student directory report...');
      await api.download('/reports/students/export', 'student_directory_report.xlsx');
      toast.success(isRtl ? 'تم تحميل دليل الطلاب بنجاح!' : 'Downloaded student directory report!');
    } catch (err) {
      toast.error(err.message || 'Export failed');
    }
  };

  const exportTeachersReport = async () => {
    try {
      toast.info(isRtl ? 'جاري تحميل كشف أنصبة المعلمين...' : 'Downloading teacher workload report...');
      await api.download('/reports/teachers/export', 'teacher_workload_report.xlsx');
      toast.success(isRtl ? 'تم تحميل كشف المعلمين بنجاح!' : 'Downloaded teacher workload report!');
    } catch (err) {
      toast.error(err.message || 'Export failed');
    }
  };

  const exportUnifiedMinistryExcel = async () => {
    try {
      setIsExportingUnified(true);
      toast.info(isRtl ? 'جاري تجهيز السجل الموحد الموجه للوزارة واليونيسيف...' : 'Preparing unified Ministry/UNICEF register...');
      const dateStr = new Date().toISOString().slice(0, 10);
      await api.download('/reports/unified-export', `Ministry_UNICEF_Register_${dateStr}.xlsx`);
      toast.success(isRtl ? 'تم تنزيل السجل الموحد المعتمد لوزارة التربية والتعليم واليونيسيف بنجاح!' : 'Downloaded official Ministry & UNICEF register!');
    } catch (err) {
      toast.error(err.message || 'Failed to export unified register');
    } finally {
      setIsExportingUnified(false);
    }
  };

  if (loading) return <PageLoader text={isRtl ? 'جاري تحميل مركز التقارير التحليلي...' : 'Loading analytical reports hub...'} />;
  if (error) return <ErrorAlert message={error} onRetry={loadHubData} />;

  return (
    <div>
      {/* Background Reports Hub Interface (Hidden completely on Print) */}
      <div className="no-print">
        {/* Prime Hero Banner: 1-Click Ministry of Education & UNICEF Official Center (Principal / Admin Only) */}
        {isAdmin && (
          <div
            style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1e3a8a 100%)',
              borderRadius: 12,
              padding: '16px 20px',
              color: '#ffffff',
              marginBottom: 16,
              boxShadow: '0 4px 16px rgba(30, 27, 75, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 14
            }}
          >
            <div style={{ maxWidth: 640 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <div style={{ background: '#ffffff', padding: '4px 10px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}>
                  <UnicefLogo height={22} />
                </div>
                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.18)',
                    padding: '3px 10px',
                    borderRadius: 16,
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: 0.4,
                    border: '1px solid rgba(255, 255, 255, 0.25)'
                  }}
                >
                  {isRtl ? 'مصمم لتلبية المتطلبات المؤسسية والإنسانية • خاص بالإدارة' : 'INSTITUTIONAL & HUMANITARIAN REPORTING • PRINCIPAL ONLY'}
                </span>
              </div>

              <h2 style={{ fontSize: 17, fontWeight: 900, color: '#ffffff', margin: '2px 0 6px 0' }}>
                {isRtl ? 'السجل والتقرير التحليلي المؤسسي الموجه لوزارة التربية والتعليم واليونيسيف (UNICEF)' : 'Institutional & Humanitarian Analytical Telemetry for UNICEF & MoE'}
              </h2>

              <p style={{ fontSize: 12, color: '#e0e7ff', lineHeight: 1.5, margin: 0 }}>
                {isRtl
                  ? 'تنزيل بنقرة واحدة لكافة بيانات وسجلات المعلمين والطلاب مجمعة في ملف Excel، أو استعراض وطباعة التتقرير التحليلي المؤسسي (PDF) المصمم وفق معايير الرصد الإنساني والتربوي لتسليمه لوزارة التربية والتعليم واليونيسيف.'
                  : 'One-click export of complete student & faculty telemetry formatted for Ministry of Education & UNICEF, or view the institutional printable analytical report (PDF) designed for humanitarian reporting requirements.'}
              </p>
            </div>


            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {/* 1-Click Excel Export Button */}
              <button
                onClick={exportUnifiedMinistryExcel}
                disabled={isExportingUnified}
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: 16 }}>📥</span>
                <span>
                  {isExportingUnified
                    ? (isRtl ? 'جاري تجهيز الملف...' : 'Exporting...')
                    : (isRtl ? 'تصدير السجل الموحد (Excel)' : 'Export Unified Excel')}
                </span>
              </button>

              {/* Executive PDF Report Button */}
              <button
                onClick={() => setIsUnicefReportOpen(true)}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: 16 }}>📊</span>
                <span>{isRtl ? 'التقرير التحليلي المؤسسي (PDF)' : 'Institutional Analytical Report (PDF)'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Report Categories Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginBottom: 20 }}>
          {/* Staff & Admin: Bulk Certificates */}
          <div className="panel" style={{ padding: '14px 16px', border: '1.5px solid rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div className="stat-icon success" style={{ fontSize: 20, width: 32, height: 32 }}>
                📜
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#047857' }}>
                  {isRtl ? 'إصدار وطباعة الشهادات المجمعة' : 'Official Bulk Certificates'}
                </h3>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {isRtl ? 'طباعة شهادات وإفادات رسمية لكافة الطلاب بشعار المدرسة المعتمد' : 'Generate official student transcripts with school emblem'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsBulkCertificatesOpen(true)}
                style={{ background: '#10b981', borderColor: '#10b981', padding: '6px 12px', fontSize: 12 }}
              >
                📜 {isRtl ? 'فتح نافذة طباعة الشهادات' : 'Open Bulk Certificates'}
              </button>
            </div>
          </div>

          {/* Staff & Admin: Student Directory */}
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

          {/* Staff & Admin: Student Attendance Report */}
          <div className="panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <div className="stat-icon success">
                <AttendanceIcon />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                  {isRtl ? 'تقرير مراقبة حضور الطلاب' : 'Student Attendance Report'}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {isRtl ? 'نسب حضور وغياب وتأخير الطلاب' : 'Student attendance trends and logs'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button className="btn btn-primary btn-sm" onClick={() => onNavigate('attendance-reports')}>
                {isRtl ? 'فتح تقارير الحضور' : 'Open Attendance Reports'}
              </button>
            </div>
          </div>

          {/* Staff & Admin: Grade Reports */}
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

          {/* Faculty Workload Report */}
          <div className="panel" style={{ padding: 20, border: '2px solid rgba(79, 70, 229, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <div className="stat-icon secondary">
                <TeachersIcon />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                  {isRtl ? 'تقرير أنصبة وتعيينات الهيئة التعليمية' : 'Faculty Workload & Allocation Report'}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {isRtl ? 'كشف شامل بالصفوف والمواد المسندة وتوزيع الكادر' : 'Assigned classes and teaching subjects summary'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button className="btn btn-primary btn-sm" onClick={exportTeachersReport}>
                <DownloadIcon /> {isRtl ? 'تصدير كشف المعلمين (Excel)' : 'Export Workload (Excel)'}
              </button>
            </div>
          </div>

          {/* Admin-Focused Executive Cards */}
          {isAdmin && (
            <>
              <div className="panel" style={{ padding: 20, border: '2px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                  <div className="stat-icon success">
                    <AttendanceIcon />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                      {isRtl ? 'تقرير دوام والتزام المعلمين' : 'Teacher Attendance & Punctuality'}
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {isRtl ? 'معدلات الحضور اليومية ونسب التأخير للكادر التعليمي' : 'Daily presence, check-in logs and punctuality analysis'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('teacher-tracker')}>
                    🕒 {isRtl ? 'فتح دفتر دوام المعلمين' : 'Open Teacher Tracker'}
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
                      {isRtl ? 'سجل الرقابة والعمليات الأمنية' : 'Security Audit & Activity Trail'}
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {isRtl ? 'متابعة كافة التغييرات والعمليات الإدارية الحساسة' : 'System-wide audit trail with IP & user logging'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('audit-logs')}>
                    🛡️ {isRtl ? 'فتح سجل التدقيق الأمني' : 'Open Security Logs'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Faculty Workload Table */}
        <div className="panel">
          <div className="panel-header">
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>
              {isRtl ? 'ملخص أنصبة وتوزيع الهيئة التعليمية على الصفوف' : 'Faculty Workload & Class Assignment Summary'}
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={exportTeachersReport}>
              <DownloadIcon /> {isRtl ? 'تصدير كشف المعلمين' : 'Export Workload'}
            </button>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>{isRtl ? 'الرقم الوظيفي' : 'Employee No'}</th>
                  <th>{isRtl ? 'اسم المعلم' : 'Faculty Name'}</th>
                  <th>{isRtl ? 'التخصص' : 'Specialty'}</th>
                  <th>{isRtl ? 'إجمالي الحصص' : 'Total Assignments'}</th>
                  <th>{isRtl ? 'الصفوف المسندة' : 'Assigned Classes'}</th>
                  <th>{isRtl ? 'المواد المسندة' : 'Assigned Subjects'}</th>
                  <th>{isRtl ? 'الحالة' : 'Status'}</th>
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
                        {t.active === 'Active' ? (isRtl ? 'نشط' : 'Active') : (isRtl ? 'غير نشط' : 'Inactive')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bulk Certificates Modal */}
      <BulkCertificatesModal
        isOpen={isBulkCertificatesOpen}
        onClose={() => setIsBulkCertificatesOpen(false)}
      />

      {/* Executive UNICEF & Ministry Analytical Report Modal (Principal / Admin Only) */}
      {isAdmin && (
        <UnicefAnalyticalReportModal
          isOpen={isUnicefReportOpen}
          onClose={() => setIsUnicefReportOpen(false)}
        />
      )}
    </div>
  );
}
