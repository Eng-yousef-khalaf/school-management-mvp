import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import SchoolLogo from '../../components/common/SchoolLogo';

export default function BulkCertificatesModal({ isOpen, onClose, initialClassId = '' }) {
  const toast = useToast();
  const { isRtl } = useLanguage();

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadClasses = async () => {
    try {
      const cls = await api.get('/classes');
      setClasses(cls);
    } catch {}
  };

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError('');
      const queryParams = new URLSearchParams();
      if (selectedClassId) queryParams.set('classId', selectedClassId);

      const data = await api.get(`/reports/bulk-certificates?${queryParams.toString()}`);
      setStudents(data);
    } catch (err) {
      setError(err.message || 'فشل تحميل بيانات الشهادات المجمعة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadClasses();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadCertificates();
    }
  }, [isOpen, selectedClassId]);

  if (!isOpen) return null;

  const handlePrintAll = () => {
    window.print();
  };

  const getLetterGrade = (percentage) => {
    if (percentage === null || percentage === undefined) return { grade: '—', textAr: 'غير متوفر', textEn: 'N/A', color: '#64748b', bg: '#f1f5f9' };
    if (percentage >= 95) return { grade: 'A+', textAr: 'ممتاز مرتفع', textEn: 'High Distinction', color: '#059669', bg: '#dcfce7' };
    if (percentage >= 90) return { grade: 'A', textAr: 'ممتاز', textEn: 'Excellent', color: '#10b981', bg: '#dcfce7' };
    if (percentage >= 85) return { grade: 'B+', textAr: 'جيد جداً مرتفع', textEn: 'Very Good Plus', color: '#0284c7', bg: '#e0f2fe' };
    if (percentage >= 75) return { grade: 'B', textAr: 'جيد جداً', textEn: 'Very Good', color: '#0369a1', bg: '#e0f2fe' };
    if (percentage >= 65) return { grade: 'C', textAr: 'جيد', textEn: 'Good', color: '#d97706', bg: '#fef3c7' };
    if (percentage >= 50) return { grade: 'D', textAr: 'مقبول', textEn: 'Pass', color: '#ea580c', bg: '#ffedd5' };
    return { grade: 'F', textAr: 'راسب / بحاجة لمعالجة', textEn: 'Needs Improvement', color: '#dc2626', bg: '#fee2e2' };
  };

  return (
    <div className="bulk-certificates-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      padding: '20px'
    }}>
      {/* Print Control Toolbar - Hidden during window.print() */}
      <div className="no-print" style={{
        background: '#1e293b',
        color: '#fff',
        padding: '14px 24px',
        borderRadius: '12px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        position: 'sticky',
        top: 0,
        zIndex: 10000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
            width: 40,
            height: 40,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            📜
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
              {isRtl ? 'إصدار وطباعة الشهادات والإفادات المجمعة' : 'Bulk Student Certificates & Transcripts'}
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
              {isRtl
                ? `مدرسة يوسف للتربية والتعليم - جاهز للطباعة وتصدير PDF لعدد (${students.length}) طالب`
                : `Youssef Educational School - Ready to print ${students.length} student certificates`}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Class Filter */}
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: '#334155',
              border: '1px solid #475569',
              color: '#f8fafc',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <option value="">{isRtl ? '🗂️ كافة الصفوف والشعب (جميع الطلاب)' : 'All Classes & Sections'}</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.academicYear?.name})
              </option>
            ))}
          </select>

          <button
            onClick={handlePrintAll}
            disabled={loading || students.length === 0}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: students.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: 16 }}>🖨️</span>
            <span>{isRtl ? `طباعة كافة الشهادات (${students.length})` : `Print All Certificates (${students.length})`}</span>
          </button>

          <button
            onClick={onClose}
            style={{
              background: '#475569',
              color: '#f8fafc',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {isRtl ? '✕ إغلاق' : '✕ Close'}
          </button>
        </div>
      </div>

      {/* Main Certificates View Container */}
      <div className="certificates-container" style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '40px' }}>
            <PageLoader text={isRtl ? 'جاري تجميع وإعداد الشهادات الأكاديمية لكافة الطلاب...' : 'Generating bulk student certificates...'} />
          </div>
        ) : error ? (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '20px' }}>
            <ErrorAlert message={error} onRetry={loadCertificates} />
          </div>
        ) : students.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '40px' }}>
            <EmptyState
              title={isRtl ? 'لا يوجد طلاب مسجلون في هذا الصف' : 'No students found'}
              description={isRtl ? 'يرجى اختيار صف آخر أو التأكد من تسجيل الطلاب وتوزيعهم.' : 'Select another class filter or enroll students.'}
            />
          </div>
        ) : (
          students.map((student, studentIdx) => {
            const gpa = getLetterGrade(student.overallAverage);
            const { attendanceSummary, subjectSummary } = student;

            return (
              <div
                key={student.id}
                className="certificate-page printable-sheet"
                style={{
                  background: '#ffffff',
                  color: '#0f172a',
                  borderRadius: '12px',
                  padding: '36px 42px',
                  marginBottom: '28px',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                  border: '3px solid #1e293b',
                  position: 'relative',
                  pageBreakAfter: 'always',
                  breakAfter: 'page',
                  minHeight: '260mm',
                  boxSizing: 'border-box'
                }}
              >
                {/* Decorative Frame Line */}
                <div style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  right: 8,
                  bottom: 8,
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  pointerEvents: 'none'
                }}></div>

                {/* Certificate Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 16, marginBottom: 20 }}>
                  <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#047857' }}>
                      {isRtl ? '🇵🇸 دولة فلسطين / وزارة التربية والتعليم' : 'State of Palestine / Ministry of Education & Higher Learning'}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#1e1b4b', marginTop: 3 }}>
                      مدرسة يوسف للتربية والتعليم
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 2 }}>
                      {isRtl ? 'قسم شؤون الطلاب والامتحانات المعتمدة' : 'Department of Student Affairs & Official Examinations'}
                    </div>
                  </div>

                  {/* Official Emblem Logo Badge */}
                  <div style={{ textAlign: 'center' }}>
                    <SchoolLogo size={62} />
                  </div>

                  <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                    <div style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      display: 'inline-block'
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                        {isRtl ? 'شهادة وإفادة أداء أكاديمي شامل' : 'Official Academic Transcript'}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        {isRtl ? 'العام الدراسي:' : 'Academic Year:'} <strong>{student.academicYear}</strong>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
                      {isRtl ? 'تاريخ التحرير:' : 'Issue Date:'} {new Date().toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                </div>

                {/* Student Personal Bio Card */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '14px 20px',
                  marginBottom: 20
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '13px' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>{isRtl ? 'اسم الطالب الرباعي:' : 'Student Name:'}</span>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px', marginTop: 2 }}>
                        {student.fullName}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>{isRtl ? 'الرقم الأكاديمي:' : 'Student ID:'}</span>
                      <div style={{ fontWeight: 700, fontFamily: 'monospace', color: '#4f46e5', fontSize: '14px', marginTop: 2 }}>
                        {student.studentNumber}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>{isRtl ? 'الصف والشعبة:' : 'Class & Section:'}</span>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px', marginTop: 2 }}>
                        {student.className}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>{isRtl ? 'اسم ولي الأمر:' : 'Guardian:'}</span>
                      <div style={{ fontWeight: 600, color: '#334155', marginTop: 2 }}>
                        {student.parentName || '—'}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>{isRtl ? 'هاتف ولي الأمر:' : 'Guardian Phone:'}</span>
                      <div style={{ fontWeight: 600, color: '#334155', marginTop: 2 }}>
                        {student.parentPhone || '—'}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>{isRtl ? 'الحالة الأكاديمية:' : 'Status:'}</span>
                      <div style={{ fontWeight: 700, color: '#059669', marginTop: 2 }}>
                        {student.status === 'ACTIVE' ? (isRtl ? 'منتظم ومقيد بالدراسة' : 'Active / Regular') : student.status}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Subject Grades Matrix Table */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 800,
                    marginBottom: 10,
                    color: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>{isRtl ? '📊 كشف درجات الامتحانات والتقييمات التفصيلية للمواد:' : 'Academic Subject Grades & Evaluations:'}</span>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
                      {isRtl ? 'المعدل من 100 لكل مادة' : 'Scale 100%'}
                    </span>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid #cbd5e1' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #94a3b8' }}>
                        <th style={{ padding: '8px 12px', textAlign: isRtl ? 'right' : 'left', border: '1px solid #cbd5e1' }}>{isRtl ? 'المادة الدراسية' : 'Subject'}</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{isRtl ? 'الامتحانات والتقييمات' : 'Assessments'}</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{isRtl ? 'النسبة المئوية' : 'Percentage'}</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{isRtl ? 'التقدير الأكاديمي' : 'Grade'}</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{isRtl ? 'حالة المادة' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectSummary && subjectSummary.length > 0 ? (
                        subjectSummary.map((sub, sIdx) => {
                          const subGrade = getLetterGrade(sub.averagePercentage);
                          return (
                            <tr key={sIdx} style={{ borderBottom: '1px solid #e2e8f0', background: sIdx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                              <td style={{ padding: '8px 12px', fontWeight: 700, border: '1px solid #cbd5e1' }}>
                                {sub.subjectName} <span style={{ color: '#64748b', fontSize: 11 }}>({sub.subjectCode})</span>
                              </td>
                              <td style={{ padding: '8px 12px', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                                {sub.scores.map(sc => `${sc.examName}: ${sc.score}/${sc.maxScore}`).join(' | ')}
                              </td>
                              <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 800, border: '1px solid #cbd5e1' }}>
                                {sub.averagePercentage}%
                              </td>
                              <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 800, color: subGrade.color, border: '1px solid #cbd5e1' }}>
                                {subGrade.grade} ({isRtl ? subGrade.textAr : subGrade.textEn})
                              </td>
                              <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, border: '1px solid #cbd5e1' }}>
                                <span style={{
                                  background: sub.averagePercentage >= 50 ? '#dcfce7' : '#fee2e2',
                                  color: sub.averagePercentage >= 50 ? '#15803d' : '#b91c1c',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: 11
                                }}>
                                  {sub.averagePercentage >= 50 ? (isRtl ? 'ناجح' : 'Passed') : (isRtl ? 'راسب' : 'Failed')}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                            {isRtl ? 'لا توجد درجات مسجلة لهذا الطالب حتى الآن' : 'No grades recorded yet'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Final GPA & Attendance Summary Boxes */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 26 }}>
                  <div style={{
                    border: '1.5px solid #cbd5e1',
                    borderRadius: 8,
                    padding: '12px 18px',
                    background: gpa.bg
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>
                      {isRtl ? 'المعدل التراكمي الإجمالي والتقدير العام:' : 'Cumulative GPA & Overall Standing:'}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: gpa.color, marginTop: 4 }}>
                      {student.overallAverage !== null ? `${student.overallAverage}%` : '—'} - {isRtl ? gpa.textAr : gpa.textEn}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                      {isRtl ? 'تم حساب المعدل وفقاً لمجموع الدرجات المعتمدة' : 'Calculated from weighted subject evaluations'}
                    </div>
                  </div>

                  <div style={{
                    border: '1.5px solid #cbd5e1',
                    borderRadius: 8,
                    padding: '12px 18px',
                    background: attendanceSummary.percentage >= 85 ? '#f0fdf4' : '#fffbeb'
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>
                      {isRtl ? 'سجل المواظبة والحضور المدرسي:' : 'Attendance Standing & Discipline:'}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: attendanceSummary.percentage >= 85 ? '#059669' : '#d97706', marginTop: 4 }}>
                      {attendanceSummary.percentage}%
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                      {attendanceSummary.present} {isRtl ? 'يوم حضور' : 'present days'} | {attendanceSummary.absent} {isRtl ? 'غياب' : 'absences'} | {attendanceSummary.late} {isRtl ? 'تأخير' : 'tardies'}
                    </div>
                  </div>
                </div>

                {/* Official Signatures & School Endorsement */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 20,
                  marginTop: 30,
                  textAlign: 'center',
                  borderTop: '2px dashed #94a3b8',
                  paddingTop: 18
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 36 }}>
                      {isRtl ? 'مسؤول شؤون الطلاب والتسجيل' : 'Registrar Officer'}
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginTop: 3 }}>
                        محمد
                      </div>
                    </div>
                    <div style={{ borderBottom: '1.5px solid #94a3b8', width: '75%', margin: '0 auto' }}></div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 36 }}>
                      {isRtl ? 'مدير المدرسة / الاعتماد الرسمي' : 'School Principal'}
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginTop: 3 }}>
                        يوسف
                      </div>
                    </div>
                    <div style={{ borderBottom: '1.5px solid #94a3b8', width: '75%', margin: '0 auto' }}></div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                      {isRtl ? 'الختم الرسمي لمدرسة يوسف' : 'Official School Seal'}
                    </div>
                    <div style={{
                      width: 68,
                      height: 68,
                      border: '2px dashed #4f46e5',
                      borderRadius: '50%',
                      margin: '0 auto',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4f46e5',
                      fontSize: 9,
                      fontWeight: 800
                    }}>
                      <span>مدرسة يوسف</span>
                      <span style={{ fontSize: 8 }}>الختم المعتمد</span>
                    </div>
                  </div>
                </div>

                {/* Footer Page Note */}
                <div style={{
                  marginTop: 20,
                  textAlign: 'center',
                  fontSize: 10,
                  color: '#94a3b8',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: 8
                }}>
                  {isRtl
                    ? `وثيقة رسمية صادرة إلكترونياً من مدرسة يوسف للتربية والتعليم - طالب رقم ${studentIdx + 1} من إجمالي ${students.length}`
                    : `Official document issued electronically by Youssef Educational School - Student ${studentIdx + 1} of ${students.length}`}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
