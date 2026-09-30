import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import { DownloadIcon, PalestineFlagIcon } from '../../components/common/Icons';
import SchoolLogo from '../../components/common/SchoolLogo';
import { useSchoolConfig } from '../../context/SchoolConfigContext';
import BulkCertificatesModal from '../Reports/BulkCertificatesModal';

export default function GradeReports() {
  const toast = useToast();
  const { user, isAdmin, isStaff, isTeacher, canManageStudents } = useAuth();
  const { t, isRtl } = useLanguage();
  const { config } = useSchoolConfig();

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
    const wrapper = document.getElementById('grade-matrix-printable');
    if (!wrapper) { window.print(); return; }

    // Remove any stale iframe
    const old = document.getElementById('grade-matrix-print-iframe');
    if (old) old.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'grade-matrix-print-iframe';
    Object.assign(iframe.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' });
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(
      '<!DOCTYPE html>' +
      '<html dir="rtl" lang="ar">' +
      '<head><meta charset="utf-8">' +
      '<title>كشف_الدرجات_والنتائج_مجموعة_السلام_التعليمية_الخاصة</title>' +
      '<link rel="preconnect" href="https://fonts.googleapis.com">' +
      '<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">' +
      '<style>' +
      '@page { size: A4 portrait; margin: 10mm 10mm 10mm 10mm; }' +
      '* { box-sizing: border-box; font-family: "Cairo", sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }' +
      'html, body { background: #ffffff; color: #0f172a; margin: 0; padding: 0; }' +
      'table { border-collapse: collapse; width: 100%; font-size: 9pt; }' +
      'th { background: #f1f5f9 !important; font-weight: 800; border: 1px solid #94a3b8; padding: 6px 8px; }' +
      'td { border: 1px solid #cbd5e1; padding: 5px 8px; color: #0f172a; }' +
      'tr:nth-child(even) td { background: #f8fafc; }' +
      '.print-header { border-bottom: 2.5px solid #0f172a; padding-bottom: 12px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }' +
      '.print-footer { margin-top: 22px; padding-top: 14px; border-top: 2px dashed #cbd5e1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; text-align: center; }' +
      '.sig-label { font-size: 10pt; font-weight: 700; color: #475569; margin-bottom: 24px; }' +
      '.sig-line { border-bottom: 1.5px solid #94a3b8; width: 80%; margin: 0 auto; }' +
      '.seal { width: 56px; height: 56px; border: 2px dashed #166534; border-radius: 50%; margin: 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #166534; font-size: 7pt; font-weight: 800; background: #f0fdf4; }' +
      '</style>' +
      '</head><body>' +
      wrapper.innerHTML +
      '</body></html>'
    );
    doc.close();
    setTimeout(() => { iframe.contentWindow.focus(); iframe.contentWindow.print(); }, 450);
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

      {/* Grade Matrix Table and Official Printable Sheet */}
      <div id="grade-matrix-printable" className="panel grade-matrix-print-wrapper" style={{ padding: '24px 28px', background: '#ffffff' }}>

        {/* Official Header for Print Mode Only */}
        <div className="only-print" style={{ marginBottom: 20, borderBottom: '2.5px solid #0f172a', paddingBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#047857', display: 'flex', alignItems: 'center', gap: 6 }}>
                <PalestineFlagIcon />
                <span>{isRtl ? 'دولة فلسطين / وزارة التربية والتعليم' : 'State of Palestine / Ministry of Education'}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#166534', marginTop: 3 }}>
                {isRtl ? config?.schoolNameAr || 'روضة ومدرسة مجموعة السلام التعليمية الخاصة' : config?.schoolNameEn || 'Al-Salam Educational Group Private School & Kindergarten'}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 2 }}>
                {isRtl ? 'الإدارة العامة للتقويم التربوي والامتحانات' : 'Department of Educational Evaluation & Examinations'}
              </div>
            </div>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <SchoolLogo size={62} />
            </div>

            <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>
                {isRtl ? 'كشف ومصفوفة الدرجات والنتائج العامة' : 'Official Grade Matrix & Transcript Sheet'}
              </div>
              <div style={{ fontSize: 11.5, color: '#334155', marginTop: 3 }}>
                <strong>{selectedClassId ? (classes.find(c => String(c.id) === String(selectedClassId))?.name || 'الصف المحدد') : (isRtl ? 'كافة الصفوف والشعب' : 'All Classes')}</strong>
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                {isRtl ? 'تاريخ الإصدار:' : 'Date:'} {new Date().toLocaleDateString('ar-EG')}
              </div>
            </div>
          </div>
        </div>

        {/* Screen Header */}
        <div className="panel-header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>
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
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '10px 12px', textAlign: isRtl ? 'right' : 'left', fontWeight: 800 }}>{isRtl ? 'الرقم الأكاديمي' : 'Student Number'}</th>
                  <th style={{ padding: '10px 12px', textAlign: isRtl ? 'right' : 'left', fontWeight: 800 }}>{isRtl ? 'اسم الطالب' : 'Student Name'}</th>
                  <th style={{ padding: '10px 12px', textAlign: isRtl ? 'right' : 'left', fontWeight: 800 }}>{isRtl ? 'الصف والشعبة' : 'Class'}</th>
                  {subjects.map((sub) => (
                    <th key={sub.id} style={{ textAlign: 'center', padding: '10px 8px', fontWeight: 800 }}>
                      {sub.name} <span style={{ fontSize: 11, color: '#64748b' }}>({sub.code})</span>
                    </th>
                  ))}
                  <th style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 900 }}>{isRtl ? 'المعدل العام' : 'Overall Average'}</th>
                </tr>
              </thead>
              <tbody>
                {report.map((row, idx) => (
                  <tr key={row.studentId} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ padding: '9px 12px', fontFamily: 'monospace', fontWeight: 800, color: '#166534' }}>{row.studentNumber}</td>
                    <td style={{ padding: '9px 12px' }}><span style={{ fontWeight: 800, color: '#0f172a' }}>{row.studentName}</span></td>
                    <td style={{ padding: '9px 12px', color: '#475569', fontWeight: 600 }}>{row.className}</td>
                    {subjects.map((sub) => {
                      const gradeInfo = row.subjectGrades[sub.code];
                      return (
                        <td key={sub.id} style={{ textAlign: 'center', padding: '9px 8px' }}>
                          {gradeInfo ? (
                            <div>
                              <strong style={{ fontSize: 13, color: '#0f172a' }}>{gradeInfo.score} <span style={{ fontSize: 10.5, color: '#94a3b8' }}>/ {gradeInfo.maxScore}</span></strong>
                              <div style={{ fontSize: 11, fontWeight: 700, color: gradeInfo.percentage >= 80 ? '#15803d' : gradeInfo.percentage >= 60 ? '#d97706' : '#b91c1c' }}>
                                {gradeInfo.percentage}%
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>—</span>
                          )}
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'center', padding: '9px 12px' }}>
                      {row.average !== null ? (
                        <span
                          style={{
                            fontSize: 12.5,
                            padding: '3px 10px',
                            fontWeight: 800,
                            borderRadius: '6px',
                            background: row.average >= 80 ? '#dcfce7' : row.average >= 60 ? '#fef3c7' : '#fee2e2',
                            color: row.average >= 80 ? '#15803d' : row.average >= 60 ? '#b45309' : '#b91c1c',
                            display: 'inline-block'
                          }}
                        >
                          {row.average}%
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Official Signatures Footer for Print Mode Only */}
        <div className="only-print" style={{ marginTop: 28, paddingTop: 18, borderTop: '2px dashed #cbd5e1' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 26 }}>
                {isRtl ? 'مربي الصف / معلم المادة' : 'Class Teacher'}
              </div>
              <div style={{ borderBottom: '1.5px solid #94a3b8', width: '80%', margin: '0 auto' }}></div>
            </div>

            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 26 }}>
                {isRtl ? 'المشرف التربوي ورئيس القسم' : 'Academic Supervisor'}
              </div>
              <div style={{ borderBottom: '1.5px solid #94a3b8', width: '80%', margin: '0 auto' }}></div>
            </div>

            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 26 }}>
                {isRtl ? 'مدير المدرسة / الاعتماد الرسمي' : 'School Principal'}
              </div>
              <div style={{ borderBottom: '1.5px solid #94a3b8', width: '80%', margin: '0 auto' }}></div>
            </div>

            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                {isRtl ? 'خاتم المدرسة المعتمد' : 'Official School Seal'}
              </div>
              <div style={{
                width: 58,
                height: 58,
                border: '2px dashed #166534',
                borderRadius: '50%',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#166534',
                fontSize: 8,
                fontWeight: 800,
                background: '#f0fdf4'
              }}>
                <span>{isRtl ? config?.schoolNameAr || 'مدرسة السلام' : config?.schoolNameEn || 'Al-Salam School'}</span>
                <span style={{ fontSize: 7 }}>{isRtl ? 'الختم المعتمد' : 'Official Seal'}</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 9.5, color: '#64748b', marginTop: 14, textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 6 }}>
            {isRtl
              ? `كشف درجات رسمي صادر إلكترونياً من ${config?.schoolNameAr || 'روضة ومدرسة مجموعة السلام التعليمية الخاصة'} - دولة فلسطين`
              : `Official grade transcript issued electronically by ${config?.schoolNameEn || 'Al-Salam Educational Group Private School & Kindergarten'}`}
          </div>
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
