import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import Badge from '../../components/common/Badge';
import { EditIcon, DownloadIcon } from '../../components/common/Icons';

export default function StudentDetails({ studentId, onBack, onEdit }) {
  const { canManageStudents } = useAuth();
  const { t, isRtl } = useLanguage();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'grades' | 'attendance' | 'statement'

  const loadStudent = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get(`/students/${studentId}`);
      setStudent(data);
    } catch (err) {
      setError(err.message || 'Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      loadStudent();
    }
  }, [studentId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <PageLoader text={t('loading')} />;
  if (error) return <ErrorAlert message={error} onRetry={loadStudent} />;
  if (!student) return null;

  const { attendanceSummary, subjectSummary, overallAverage } = student;

  const getLetterGrade = (percentage) => {
    if (percentage >= 95) return { grade: 'A+', textAr: 'ممتاز مرتفع', textEn: 'High Distinction', color: '#059669', bg: 'var(--success-light)' };
    if (percentage >= 90) return { grade: 'A', textAr: 'ممتاز', textEn: 'Excellent', color: '#10b981', bg: 'var(--success-light)' };
    if (percentage >= 85) return { grade: 'B+', textAr: 'جيد جداً مرتفع', textEn: 'Very Good Plus', color: '#0284c7', bg: 'rgba(14, 165, 233, 0.1)' };
    if (percentage >= 75) return { grade: 'B', textAr: 'جيد جداً', textEn: 'Very Good', color: '#0369a1', bg: 'rgba(14, 165, 233, 0.1)' };
    if (percentage >= 65) return { grade: 'C', textAr: 'جيد', textEn: 'Good', color: '#d97706', bg: 'var(--warning-light)' };
    if (percentage >= 50) return { grade: 'D', textAr: 'مقبول', textEn: 'Pass', color: '#ea580c', bg: 'var(--warning-light)' };
    return { grade: 'F', textAr: 'راسب / بحاجة لمعالجة', textEn: 'Needs Improvement', color: '#dc2626', bg: 'var(--danger-light)' };
  };

  const gpaInfo = overallAverage !== null ? getLetterGrade(overallAverage) : null;

  return (
    <div className="student-details-container">
      {/* Action Header - Hidden during print */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={onBack}>
            {isRtl ? '← العودة لقائمة الطلاب' : '← Back to Students'}
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {isRtl ? 'استعلام شامل لولي الأمر وإدارة السجل الأكاديمي' : 'Student 360 & Parent Inquiry Portal'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={handlePrint} style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}>
            🖨️ {isRtl ? 'طباعة إفادة ولي الأمر' : 'Print Parent Statement'}
          </button>
          {canManageStudents && (
            <button className="btn btn-primary btn-sm" onClick={() => onEdit(student)}>
              <EditIcon /> {isRtl ? 'تعديل بيانات الطالب' : 'Edit Profile'}
            </button>
          )}
        </div>
      </div>

      {/* Main Student Header Card - Hidden during print */}
      <div className="panel no-print" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), #6366f1)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
            }}
          >
            {student.firstName?.charAt(0)}
          </div>

          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
                {student.firstName} {student.middleName ? student.middleName + ' ' : ''}{student.lastName}
              </h2>
              <Badge status={student.status} />
              <span className="badge badge-primary" style={{ fontSize: 13, padding: '4px 12px' }}>
                🏫 {student.currentClass || (isRtl ? 'غير مسجل بصف' : 'Unassigned')}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 20, color: 'var(--text-muted)', fontSize: 13, marginTop: 8, flexWrap: 'wrap' }}>
              <span><strong>{t('studentNumber')}:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{student.studentNumber}</span></span>
              <span><strong>{t('gender')}:</strong> {student.gender === 'MALE' ? t('male') : student.gender === 'FEMALE' ? t('female') : '—'}</span>
              <span><strong>{t('dob')}:</strong> {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '—'}</span>
              <span><strong>{isRtl ? 'السنة الدراسية:' : 'Academic Year:'}</strong> {student.academicYear || '2026/2027'}</span>
            </div>
          </div>

          {/* GPA & Attendance Quick KPI Boxes */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{
              background: gpaInfo ? gpaInfo.bg : 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              minWidth: 130
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: gpaInfo ? gpaInfo.color : 'var(--text-muted)', display: 'block' }}>
                {isRtl ? 'المعدل الأكاديمي' : 'OVERALL GPA'}
              </span>
              <div style={{ fontSize: 26, fontWeight: 900, color: gpaInfo ? gpaInfo.color : 'var(--text-main)', marginTop: 2 }}>
                {overallAverage !== null ? `${overallAverage}%` : '—'}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: gpaInfo ? gpaInfo.color : 'var(--text-muted)' }}>
                {gpaInfo ? (isRtl ? gpaInfo.textAr : gpaInfo.textEn) : 'No Exams'}
              </span>
            </div>

            <div style={{
              background: attendanceSummary.percentage >= 85 ? 'var(--success-light)' : 'var(--warning-light)',
              border: '1px solid var(--border-color)',
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              minWidth: 130
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: attendanceSummary.percentage >= 85 ? 'var(--success)' : 'var(--warning)', display: 'block' }}>
                {isRtl ? 'نسبة الحضور' : 'ATTENDANCE'}
              </span>
              <div style={{ fontSize: 26, fontWeight: 900, color: attendanceSummary.percentage >= 85 ? 'var(--success)' : 'var(--warning)', marginTop: 2 }}>
                {attendanceSummary.percentage}%
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
                {attendanceSummary.present} / {attendanceSummary.totalDays} {isRtl ? 'يوم' : 'days'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Hidden during print */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('overview')}
          >
            📋 {isRtl ? 'بيانات ولي الأمر والتواصل' : 'Guardian & Contact Info'}
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'grades' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('grades')}
          >
            📊 {isRtl ? 'كشف الدرجات والتقييمات' : 'Grades & Academic Transcript'}
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'attendance' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('attendance')}
          >
            📅 {isRtl ? 'سجل الحضور والغياب' : 'Attendance Records'}
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'statement' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('statement')}
            style={{ marginLeft: isRtl ? '0' : 'auto', marginRight: isRtl ? 'auto' : '0' }}
          >
            🖨️ {isRtl ? 'معاينة إفادة ولي الأمر الرسمية' : 'Official Statement Preview'}
          </button>
        </div>
      </div>

      {/* TAB 1: Overview & Guardian Contact */}
      {activeTab === 'overview' && (
        <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
          {/* Guardian Information Card */}
          <div className="panel" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
              <span style={{ fontSize: 20 }}>👨‍👦</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                {isRtl ? 'بيانات ولي الأمر والاتصال السريع' : 'Parent / Guardian Contact Card'}
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14 }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 12 }}>{t('parentName')}</span>
                <strong style={{ fontSize: 15, color: 'var(--text-main)' }}>{student.parentName || (isRtl ? 'غير محدد' : 'Not specified')}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 12 }}>{t('parentPhone')}</span>
                {student.parentPhone ? (
                  <a href={`tel:${student.parentPhone}`} style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    📞 {student.parentPhone}
                  </a>
                ) : (
                  <span>—</span>
                )}
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 12 }}>{t('phone')} (هاتف الطالب / الطوارئ)</span>
                <strong>{student.phone || '—'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 12 }}>{t('address')}</span>
                <strong>{student.address || '—'}</strong>
              </div>
            </div>
          </div>

          {/* Academic Placement & Status */}
          <div className="panel" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
              <span style={{ fontSize: 20 }}>🏫</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                {isRtl ? 'التسكين الأكاديمي الحالي' : 'Current Academic Placement'}
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14 }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 12 }}>{isRtl ? 'الشعبة / الصف الدراسي' : 'Current Class'}</span>
                <strong style={{ fontSize: 16, color: 'var(--primary)' }}>{student.currentClass || (isRtl ? 'غير مسجل بفصل' : 'Unassigned')}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 12 }}>{isRtl ? 'السنة الدراسية الحالية' : 'Academic Calendar'}</span>
                <strong>{student.academicYear || '2026/2027'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 12 }}>{isRtl ? 'تاريخ التسجيل بالمنظومة' : 'Enrolled In System Since'}</span>
                <strong>{new Date(student.createdAt).toLocaleDateString()}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 12 }}>{isRtl ? 'التقدير العام التراكمي' : 'Cumulative Standing'}</span>
                <strong style={{ color: gpaInfo ? gpaInfo.color : 'inherit' }}>
                  {gpaInfo ? `${gpaInfo.grade} (${isRtl ? gpaInfo.textAr : gpaInfo.textEn})` : '—'}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Grades & Academic Transcript */}
      {(activeTab === 'overview' || activeTab === 'grades') && (
        <div className="panel no-print" style={{ marginBottom: 24 }}>
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                {isRtl ? 'كشف درجات المواد الأكاديمية والامتحانات' : 'Curriculum Grades Transcript by Course'}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                {isRtl ? 'تفصيل درجات الطالب في كافة التقييمات والاختبارات الفصلية' : 'Detailed breakdown of all exam grades and continuous assessments'}
              </p>
            </div>
            {overallAverage !== null && (
              <span className="badge badge-primary" style={{ fontSize: 14, padding: '6px 14px' }}>
                {isRtl ? `المعدل الإجمالي: ${overallAverage}%` : `Overall Average: ${overallAverage}%`}
              </span>
            )}
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>{t('subjectCode')}</th>
                  <th>{t('subjectName')}</th>
                  <th>{isRtl ? 'التقييمات والامتحانات المرصودة' : 'Exam Records'}</th>
                  <th>{isRtl ? 'المعدل في المادة' : 'Subject Average'}</th>
                  <th>{isRtl ? 'التقدير' : 'Standing'}</th>
                </tr>
              </thead>
              <tbody>
                {subjectSummary && subjectSummary.length > 0 ? (
                  subjectSummary.map((sub, i) => {
                    const gradeLetter = getLetterGrade(sub.averagePercentage);
                    return (
                      <tr key={i}>
                        <td><strong>{sub.subjectCode}</strong></td>
                        <td><span style={{ fontWeight: 600 }}>{sub.subjectName}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {sub.scores.map((sc, j) => (
                              <span
                                key={j}
                                style={{
                                  background: '#f8fafc',
                                  border: '1px solid var(--border-color)',
                                  padding: '4px 10px',
                                  borderRadius: 6,
                                  fontSize: 12,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6
                                }}
                              >
                                <span style={{ color: 'var(--text-muted)' }}>{sc.examName}:</span>
                                <strong>{sc.score}/{sc.maxScore}</strong>
                                <span style={{ color: sc.percentage >= 75 ? 'var(--success)' : 'var(--primary)', fontWeight: 700 }}>
                                  ({sc.percentage}%)
                                </span>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <strong style={{ fontSize: 15, color: gradeLetter.color }}>
                            {sub.averagePercentage}%
                          </strong>
                        </td>
                        <td>
                          <span
                            style={{
                              background: gradeLetter.bg,
                              color: gradeLetter.color,
                              padding: '3px 8px',
                              borderRadius: 4,
                              fontWeight: 700,
                              fontSize: 12
                            }}
                          >
                            {gradeLetter.grade} - {isRtl ? gradeLetter.textAr : gradeLetter.textEn}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      {isRtl ? 'لا توجد درجات مرصودة لهذا الطالب حتى الآن' : 'No exam grades recorded for this student yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Attendance Summary & Records */}
      {(activeTab === 'overview' || activeTab === 'attendance') && (
        <div className="panel no-print" style={{ marginBottom: 24 }}>
          <div className="panel-header">
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>
              {isRtl ? 'ملخص وسجل الحضور والغياب' : 'Attendance & Discipline Record'}
            </h3>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{isRtl ? 'إجمالي الأيام' : 'TOTAL DAYS'}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)' }}>{attendanceSummary.totalDays}</div>
              </div>
              <div style={{ background: 'var(--success-light)', padding: 14, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#166534' }}>{t('present')}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)' }}>{attendanceSummary.present}</div>
              </div>
              <div style={{ background: 'var(--danger-light)', padding: 14, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#991b1b' }}>{t('absent')}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--danger)' }}>{attendanceSummary.absent}</div>
              </div>
              <div style={{ background: 'var(--warning-light)', padding: 14, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#9a3412' }}>{t('late')}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--warning)' }}>{attendanceSummary.late}</div>
              </div>
              <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: 14, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#0369a1' }}>{isRtl ? 'غياب بعذر' : 'Excused'}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0284c7' }}>{attendanceSummary.excused}</div>
              </div>
            </div>

            {student.attendance && student.attendance.length > 0 && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                  {isRtl ? 'آخر سجلات الحضور المسجلة:' : 'Recent Attendance Logs:'}
                </h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {student.attendance.map((att, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: '1px solid var(--border-color)',
                        fontSize: 12,
                        background: att.status === 'PRESENT' ? 'var(--success-light)' : att.status === 'ABSENT' ? 'var(--danger-light)' : 'var(--warning-light)',
                        color: att.status === 'PRESENT' ? 'var(--success)' : att.status === 'ABSENT' ? 'var(--danger)' : 'var(--warning)'
                      }}
                    >
                      <span>{new Date(att.date).toLocaleDateString()}: <strong>{att.status}</strong></span>
                      {att.note && <span style={{ opacity: 0.8, marginRight: 4, marginLeft: 4 }}>({att.note})</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* OFFICIAL PRINTABLE PARENT STATEMENT - Visible during print OR when statement tab is active */}
      <div
        className={`panel official-parent-statement ${activeTab === 'statement' ? '' : 'only-print'}`}
        style={{
          padding: 36,
          background: '#fff',
          border: '2px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          marginTop: 20
        }}
      >
        {/* Printable Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>
              {isRtl ? 'وزارة التربية والتعليم - إدارة المدارس' : 'Ministry of Education & School Administration'}
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              {isRtl ? 'نظام إدارة المدرسة الأكاديمي الشامل | قسم شؤون الطلاب والتسجيل' : 'Academic Management System | Registrar & Student Affairs'}
            </div>
          </div>
          <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>
              {isRtl ? 'إفادة درجات ومستوى أداء طالب' : 'Official Student Academic Statement'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              {isRtl ? 'تاريخ التحرير:' : 'Date Issued:'} {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Student & Parent Info Box */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, fontSize: 13 }}>
            <div>
              <strong>{isRtl ? 'اسم الطالب الرباعي:' : 'Student Full Name:'}</strong> {student.firstName} {student.middleName ? student.middleName + ' ' : ''}{student.lastName}
            </div>
            <div>
              <strong>{isRtl ? 'الرقم الأكاديمي:' : 'Student ID No:'}</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{student.studentNumber}</span>
            </div>
            <div>
              <strong>{isRtl ? 'الصف والشعبة:' : 'Class & Section:'}</strong> {student.currentClass || (isRtl ? 'مسجل' : 'Enrolled')}
            </div>
            <div>
              <strong>{isRtl ? 'السنة الدراسية:' : 'Academic Calendar:'}</strong> {student.academicYear || '2026/2027'}
            </div>
            <div>
              <strong>{isRtl ? 'اسم ولي الأمر:' : 'Guardian Name:'}</strong> {student.parentName || (isRtl ? 'غير محدد' : 'Not specified')}
            </div>
            <div>
              <strong>{isRtl ? 'هاتف ولي الأمر:' : 'Guardian Phone:'}</strong> {student.parentPhone || '—'}
            </div>
          </div>
        </div>

        {/* Grades Summary Table */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>
            {isRtl ? 'كشف الدرجات والتقييمات للمقررات الدراسية:' : 'Course Assessment & Transcript Results:'}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, border: '1px solid #cbd5e1' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '8px 12px', textAlign: isRtl ? 'right' : 'left', border: '1px solid #cbd5e1' }}>{t('subjectName')}</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{isRtl ? 'الامتحانات' : 'Assessments'}</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{isRtl ? 'الدرجة المئوية' : 'Percentage'}</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{isRtl ? 'التقدير العام' : 'Grade'}</th>
              </tr>
            </thead>
            <tbody>
              {subjectSummary && subjectSummary.length > 0 ? (
                subjectSummary.map((s, idx) => {
                  const gr = getLetterGrade(s.averagePercentage);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600, border: '1px solid #cbd5e1' }}>{s.subjectName} ({s.subjectCode})</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                        {s.scores.map(sc => `${sc.examName}: ${sc.score}/${sc.maxScore}`).join(' | ')}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, border: '1px solid #cbd5e1' }}>{s.averagePercentage}%</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: gr.color, border: '1px solid #cbd5e1' }}>{gr.grade} ({isRtl ? gr.textAr : gr.textEn})</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>
                    {isRtl ? 'لا توجد درجات مرصودة حتى الآن' : 'No grades recorded yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Overall Results & Attendance Statement */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 30 }}>
          <div style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: 12 }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>{isRtl ? 'المعدل التراكمي الإجمالي:' : 'Cumulative GPA:'}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: gpaInfo ? gpaInfo.color : 'inherit', marginTop: 4 }}>
              {overallAverage !== null ? `${overallAverage}% - ${isRtl ? gpaInfo.textAr : gpaInfo.textEn}` : '—'}
            </div>
          </div>
          <div style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: 12 }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>{isRtl ? 'نسبة المواظبة والحضور:' : 'Attendance Standing:'}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: attendanceSummary.percentage >= 85 ? '#059669' : '#d97706', marginTop: 4 }}>
              {attendanceSummary.percentage}% ({attendanceSummary.present} {isRtl ? 'يوم حضور من' : 'days out of'} {attendanceSummary.totalDays})
            </div>
          </div>
        </div>

        {/* Official Endorsement & Signatures */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 40, textAlign: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: 20 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 40 }}>
              {isRtl ? 'مسؤول شؤون الطلاب والتسجيل' : 'Registrar Officer'}
            </div>
            <div style={{ borderBottom: '1px solid #94a3b8', width: '80%', margin: '0 auto' }}></div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 40 }}>
              {isRtl ? 'مدير المدرسة / الاعتماد' : 'School Principal'}
            </div>
            <div style={{ borderBottom: '1px solid #94a3b8', width: '80%', margin: '0 auto' }}></div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 40 }}>
              {isRtl ? 'الختم الرسمي للمؤسسة التعليمية' : 'Official School Stamp'}
            </div>
            <div style={{ width: 64, height: 64, border: '2px dashed #94a3b8', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 10 }}>
              {isRtl ? 'الختم' : 'STAMP'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

