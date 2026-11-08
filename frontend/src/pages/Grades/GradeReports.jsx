import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import { DownloadIcon } from '../../components/common/Icons';
import BulkCertificatesModal from '../Reports/BulkCertificatesModal';

export default function GradeReports() {
  const toast = useToast();
  const { user, isAdmin, isStaff, isTeacher, canManageStudents } = useAuth();
  const { t, isRtl } = useLanguage();

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [examFilter, setExamFilter] = useState('');
  const [isBulkCertificatesOpen, setIsBulkCertificatesOpen] = useState(false);

  const [reportData, setReportData] = useState({ subjects: [], report: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadClasses = async () => {
    try {
      const cls = await api.get('/classes');
      setClasses(cls);
    } catch {}
  };

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const queryParams = new URLSearchParams();
      if (selectedClassId) queryParams.set('classId', selectedClassId);
      if (examFilter) queryParams.set('examName', examFilter);

      const res = await api.get(`/grades/report?${queryParams.toString()}`);
      setReportData(res);
    } catch (err) {
      setError(err.message || 'Failed to load grade report');
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, examFilter]);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleExport = async () => {
    try {
      toast.info(isRtl ? 'جاري تصدير مصفوفة الدرجات إلى Excel...' : 'Generating grade matrix Excel export...');
      const queryParams = new URLSearchParams();
      if (selectedClassId) queryParams.set('classId', selectedClassId);
      if (examFilter) queryParams.set('examName', examFilter);

      await api.download(`/grades/export?${queryParams.toString()}`, 'grades_matrix_report.xlsx');
      toast.success(isRtl ? 'تم تنزيل كشف الدرجات بنجاح!' : 'Grade matrix report downloaded!');
    } catch (err) {
      toast.error(err.message || 'Export failed');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const { subjects = [], report = [] } = reportData;

  return (
    <div>
      {/* Role Informational Banner */}
      <div className="no-print" style={{
        background: isAdmin ? 'rgba(79, 70, 229, 0.08)' : isStaff ? 'rgba(16, 185, 129, 0.08)' : 'rgba(14, 165, 233, 0.08)',
        border: `1px solid ${isAdmin ? 'rgba(79, 70, 229, 0.25)' : isStaff ? 'rgba(16, 185, 129, 0.25)' : 'rgba(14, 165, 233, 0.25)'}`,
        padding: '12px 18px',
        borderRadius: 'var(--radius-md)',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>{isAdmin ? '👔' : isStaff ? '📋' : '👨‍🏫'}</span>
          <div>
            <strong style={{ color: isAdmin ? 'var(--primary-dark)' : isStaff ? '#059669' : '#0284c7', fontSize: 13 }}>
              {isAdmin
                ? (isRtl ? 'مصفوفة الدرجات والنتائج العامة (اطلاع ومراقبة أداء):' : 'Executive Grade Matrix (Read-Only Oversight):')
                : isStaff
                ? (isRtl ? 'كشوف نتائج الطلاب الجاهزة (جاهزة للاستعلام والطباعة والشهادات):' : 'Compiled Student Grade Results & Transcripts:')
                : (isRtl ? 'كشف درجات ونتائج مقرراتك وشعبك المسندة:' : 'My Assigned Courses Grade Report:')}
            </strong>
            <span style={{ color: 'var(--text-muted)', fontSize: 12, marginRight: 8, marginLeft: 8 }}>
              {isAdmin
                ? (isRtl ? 'عرض نتائج الفصول والمعدلات العامة ونسب النجاح دون تعديل.' : 'View institutional grades and class passing averages without mutation.')
                : isStaff
                ? (isRtl ? 'تظهر هنا الدرجات المرصودة من قبل المعلمين مباشرة للاطلاع وإصدار الكشوفات والشهادات.' : 'Live grades recorded by faculty are ready here for student transcripts and printing.')
                : (isRtl ? 'عرض نتائج ودرجات الطلاب المقيدين في موادك وشعبك.' : 'View performance of students in your assigned subjects.')}
            </span>
          </div>
        </div>
        <span className="badge" style={{
          background: isAdmin ? 'rgba(79, 70, 229, 0.15)' : isStaff ? 'rgba(16, 185, 129, 0.15)' : 'rgba(14, 165, 233, 0.15)',
          color: isAdmin ? 'var(--primary-dark)' : isStaff ? '#059669' : '#0284c7',
          fontSize: 11,
          fontWeight: 700
        }}>
          {isRtl ? 'بيانات معتمدة' : 'Official Transcripts'}
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="panel no-print" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div className="toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <select
              className="filter-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              <option value="">{isRtl ? 'كافة الصفوف والشعب' : 'All Classes'}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.academicYear?.name})
                </option>
              ))}
            </select>

            <input
              type="text"
              className="form-input"
              style={{ width: 220 }}
              placeholder={isRtl ? 'تصفية باسم الامتحان (مثال: منتصف)...' : 'Filter Exam Name (e.g. Midterm)...'}
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, marginLeft: isRtl ? '0' : 'auto', marginRight: isRtl ? 'auto' : '0' }}>
            {isStaff && (
              <>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsBulkCertificatesOpen(true)}
                  style={{ color: '#059669', borderColor: '#10b981', fontWeight: 600 }}
                  title={isRtl ? 'طباعة الشهادات والإفادات المجمعة لكافة الطلاب' : 'Print Bulk Certificates'}
                >
                  📜 {isRtl ? 'طباعة الشهادات المجمعة' : 'Bulk Certificates'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
                  🖨️ {isRtl ? 'طباعة الكشف' : 'Print Matrix'}
                </button>
              </>
            )}
            <button className="btn btn-primary btn-sm" onClick={handleExport}>
              <DownloadIcon /> {isRtl ? 'تصدير Excel' : 'Export Excel'}
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={loadReport} />}

      {/* Grade Matrix Table */}
      <div className="panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>
            {isRtl ? `كشف الدرجات والنتائج العامة (${report.length} طالب)` : `Curriculum Grade Matrix (${report.length} Students)`}
          </h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {isRtl ? `المواد المشمولة في التقرير: ${subjects.length} مواد` : `Curriculum Subjects: ${subjects.length}`}
          </span>
        </div>
        <div className="table-responsive">
          {loading ? (
            <PageLoader text={isRtl ? 'جاري تجميع مصفوفة درجات ومعدلات الطلاب...' : 'Compiling curriculum grade matrix...'} />
          ) : report.length === 0 ? (
            <EmptyState
              title={isRtl ? 'لا توجد بيانات درجات متوفرة' : 'No grades data available'}
              description={isRtl ? 'لا توجد درجات مرصودة تطابق الفلاتر المحددة حالياً.' : 'No student grades match the specified filters.'}
            />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>{isRtl ? 'الرقم الأكاديمي' : 'Student Number'}</th>
                  <th>{isRtl ? 'اسم الطالب' : 'Student Name'}</th>
                  <th>{isRtl ? 'الصف والشعبة' : 'Class'}</th>
                  {subjects.map((sub) => (
                    <th key={sub.id} style={{ textAlign: 'center' }}>
                      {sub.name} ({sub.code})
                    </th>
                  ))}
                  <th style={{ textAlign: 'center' }}>{isRtl ? 'المعدل العام' : 'Overall Average'}</th>
                </tr>
              </thead>
              <tbody>
                {report.map((row) => (
                  <tr key={row.studentId}>
                    <td><strong>{row.studentNumber}</strong></td>
                    <td><span style={{ fontWeight: 600 }}>{row.studentName}</span></td>
                    <td>{row.className}</td>
                    {subjects.map((sub) => {
                      const gradeInfo = row.subjectGrades[sub.code];
                      return (
                        <td key={sub.id} style={{ textAlign: 'center' }}>
                          {gradeInfo ? (
                            <div>
                              <strong style={{ fontSize: 13 }}>{gradeInfo.score} / {gradeInfo.maxScore}</strong>
                              <div style={{ fontSize: 11, color: gradeInfo.percentage >= 75 ? 'var(--success)' : 'var(--text-muted)' }}>
                                ({gradeInfo.percentage}%)
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-light)' }}>—</span>
                          )}
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'center' }}>
                      {row.average !== null ? (
                        <span
                          className={`badge ${
                            row.average >= 80 ? 'badge-active' : row.average >= 60 ? 'badge-late' : 'badge-inactive'
                          }`}
                          style={{ fontSize: 13, padding: '4px 10px', fontWeight: 700 }}
                        >
                          {row.average}%
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-light)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Bulk Certificates Modal */}
      {isStaff && (
        <BulkCertificatesModal
          isOpen={isBulkCertificatesOpen}
          onClose={() => setIsBulkCertificatesOpen(false)}
          initialClassId={selectedClassId}
        />
      )}
    </div>
  );
}
