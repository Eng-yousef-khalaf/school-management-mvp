import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSchoolConfig } from '../../context/SchoolConfigContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import Badge from '../../components/common/Badge';
import { EditIcon, DownloadIcon, PalestineFlagIcon } from '../../components/common/Icons';
import SchoolLogo from '../../components/common/SchoolLogo';
import UnicefLogo from '../../components/common/UnicefLogo';
import RecordPaymentModal from '../Fees/RecordPaymentModal';
import PaymentReceiptModal from '../Fees/PaymentReceiptModal';

export default function StudentDetails({ studentId, onBack, onEdit }) {
  const { canManageStudents, isStaff, isAdmin } = useAuth();
  const { t, isRtl } = useLanguage();
  const { config } = useSchoolConfig();
  const [student, setStudent] = useState(null);
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'grades' | 'attendance' | 'fees' | 'statement'
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const loadStudent = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get(`/students/${studentId}`);
      setStudent(data);

      try {
        const feeRes = await api.get(`/fees/student/${studentId}`);
        setFeeData(feeRes);
      } catch (err) {
        console.warn('Fee details not available:', err);
      }
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
          {canManageStudents && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={handlePrint} style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}>
                🖨️ {isRtl ? 'طباعة إفادة ولي الأمر' : 'Print Parent Statement'}
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => onEdit(student)}>
                <EditIcon /> {isRtl ? 'تعديل بيانات الطالب' : 'Edit Profile'}
              </button>
            </>
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
            className={`btn ${activeTab === 'fees' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('fees')}
          >
            💰 {isRtl ? 'الرسوم والأقساط والمقبوضات' : 'Fees & Ledger'}
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

      {/* TAB 4: Fees & Payments Ledger */}
      {activeTab === 'fees' && (
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
          {/* Header Action Card */}
          <div className="panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px 0' }}>
                  💰 {isRtl ? 'الملف المالي وسجل الأقساط والتحصيل' : 'Financial Ledger & Tuition Summary'}
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                  {isRtl ? 'متابعة الرسوم المستحقة، المنح والخصومات، الدفعات المسددة، وتوليد سندات القبض الرسمية' : 'Track annual fees, scholarship grants, recorded payments and official receipts'}
                </p>
              </div>

              {isStaff && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowRecordModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                >
                  ➕ {isRtl ? 'تسجيل دفعة / قبض قسط للطالب' : 'Record New Payment'}
                </button>
              )}
            </div>

            {/* Financial KPI Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginTop: 18 }}>
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>
                  {isRtl ? 'إجمالي الرسوم المقررة' : 'TOTAL REQUIRED FEE'}
                </span>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
                  ₪{Number(feeData?.totalAmount || student?.totalFee || 850).toLocaleString()}
                </div>
              </div>

              <div style={{ background: 'rgba(14, 165, 233, 0.08)', padding: 14, borderRadius: 10, border: '1px solid rgba(14, 165, 233, 0.2)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0284c7', display: 'block' }}>
                  {isRtl ? 'الخصم / المنحة' : 'DISCOUNT / GRANT'}
                </span>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0284c7', marginTop: 4 }}>
                  ₪{Number(feeData?.discountAmount || 0).toLocaleString()}
                </div>
                {feeData?.discountReason && (
                  <span style={{ fontSize: 10.5, color: '#0369a1', fontWeight: 600 }}>({feeData.discountReason})</span>
                )}
              </div>

              <div style={{ background: 'var(--success-light)', padding: 14, borderRadius: 10, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', display: 'block' }}>
                  {isRtl ? 'المبلغ المسدد (المقبوض)' : 'TOTAL PAID'}
                </span>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--success)', marginTop: 4 }}>
                  ₪{Number(feeData?.paidAmount || 0).toLocaleString()}
                </div>
              </div>

              <div style={{
                background: (feeData?.remainingBalance || 0) > 0 ? 'var(--danger-light)' : 'var(--success-light)',
                padding: 14,
                borderRadius: 10,
                border: `1px solid ${(feeData?.remainingBalance || 0) > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: (feeData?.remainingBalance || 0) > 0 ? 'var(--danger)' : 'var(--success)', display: 'block' }}>
                  {isRtl ? 'الرصيد المتبقي المستحق' : 'REMAINING BALANCE'}
                </span>
                <div style={{ fontSize: 20, fontWeight: 800, color: (feeData?.remainingBalance || 0) > 0 ? 'var(--danger)' : 'var(--success)', marginTop: 4 }}>
                  ₪{Number(feeData?.remainingBalance !== undefined ? feeData.remainingBalance : ((student?.totalFee || 850) - (feeData?.paidAmount || 0))).toLocaleString()}
                </div>
              </div>

              <div style={{ background: '#f1f5f9', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>
                  {isRtl ? 'حالة السداد' : 'PAYMENT STATUS'}
                </span>
                <div style={{ marginTop: 4 }}>
                  {feeData?.status === 'PAID' ? (
                    <span className="badge badge-success" style={{ fontSize: 12, padding: '4px 10px' }}>
                      ✓ {isRtl ? 'خالص الرسوم' : 'Fully Paid'}
                    </span>
                  ) : feeData?.status === 'PARTIAL' ? (
                    <span className="badge badge-warning" style={{ fontSize: 12, padding: '4px 10px' }}>
                      ⏳ {isRtl ? 'مسدد جزئياً' : 'Partially Paid'}
                    </span>
                  ) : feeData?.status === 'OVERDUE' ? (
                    <span className="badge badge-danger" style={{ fontSize: 12, padding: '4px 10px' }}>
                      ⚠️ {isRtl ? 'متأخر عن السداد' : 'Overdue'}
                    </span>
                  ) : (
                    <span className="badge badge-danger" style={{ fontSize: 12, padding: '4px 10px' }}>
                      🔴 {isRtl ? 'غير مسدد' : 'Unpaid'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Receipts History Table */}
          <div className="panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                📑 {isRtl ? 'سجل سندات القبض والدفعات المودعة' : 'Payment History & Digital Receipts'}
              </h4>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {feeData?.payments?.length || 0} {isRtl ? 'سند مقبوض' : 'receipts'}
              </span>
            </div>

            {feeData?.payments && feeData.payments.length > 0 ? (
              <div className="table-responsive">
                <table className="table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>{isRtl ? 'رقم السند' : 'Receipt No'}</th>
                      <th>{isRtl ? 'تاريخ القبض' : 'Date'}</th>
                      <th>{isRtl ? 'المبلغ المدفوع' : 'Amount'}</th>
                      <th>{isRtl ? 'طريقة الدفع' : 'Payment Method'}</th>
                      <th>{isRtl ? 'المسدد والصلة' : 'Payer'}</th>
                      <th>{isRtl ? 'المستلم' : 'Received By'}</th>
                      <th style={{ textAlign: 'center' }}>{isRtl ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeData.payments.map((pmt) => {
                      const methodLabels = {
                        CASH: { ar: '💵 نقداً (صندوق المدرسة)', en: 'Cash at School' },
                        BANK_OF_PALESTINE: { ar: '🏦 بنك فلسطين', en: 'Bank of Palestine' },
                        JAWWAL_PAY: { ar: '📱 جوال باي (Jawwal Pay)', en: 'Jawwal Pay' },
                        PALPAY: { ar: '💳 بال باي (PalPay)', en: 'PalPay' },
                        SCHOLARSHIP_GRANT: { ar: '🤝 منحة / كفالة خيرية', en: 'Scholarship Grant' },
                      };
                      const methodInfo = methodLabels[pmt.method] || { ar: pmt.method, en: pmt.method };

                      return (
                        <tr key={pmt.id || pmt.receiptNumber}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                            {pmt.receiptNumber}
                          </td>
                          <td style={{ fontSize: 13 }}>
                            {new Date(pmt.paidAt).toLocaleDateString()}
                          </td>
                          <td style={{ fontWeight: 800, color: 'var(--success)' }}>
                            ₪{Number(pmt.amount).toLocaleString()}
                          </td>
                          <td style={{ fontSize: 13 }}>
                            {isRtl ? methodInfo.ar : methodInfo.en}
                          </td>
                          <td style={{ fontSize: 13 }}>
                            <strong>{pmt.payerName || student.parentName || 'ولي الأمر'}</strong>
                            {pmt.payerRelation && (
                              <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>
                                ({pmt.payerRelation === 'FATHER' ? (isRtl ? 'الأب' : 'Father') : pmt.payerRelation === 'MOTHER' ? (isRtl ? 'الأم' : 'Mother') : pmt.payerRelation})
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            {pmt.receivedByName || (isRtl ? 'أمين الصندوق' : 'Cashier')}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setSelectedReceipt({
                                ...pmt,
                                student: {
                                  firstName: student.firstName,
                                  lastName: student.lastName,
                                  studentNumber: student.studentNumber,
                                  currentClass: student.currentClass
                                }
                              })}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '4px 10px' }}
                            >
                              🖨️ {isRtl ? 'عرض وطباعة السند' : 'View Receipt'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 16px', background: '#f8fafc', borderRadius: 8, border: '1px dashed var(--border-color)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🧾</div>
                <h5 style={{ fontWeight: 700, margin: '0 0 6px 0' }}>
                  {isRtl ? 'لا توجد دفعات أو سندات مسجلة لهذا الطالب حتى الآن' : 'No payment records found for this student yet'}
                </h5>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
                  {isRtl ? 'يمكنك تسجيل أول دفعة من رسوم الطالب وإصدار سند رسمي فوري' : 'You can record the first tuition installment and generate an official receipt'}
                </p>
                {(isAdmin || isStaff) && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowRecordModal(true)}
                  >
                    ➕ {isRtl ? 'تسجيل دفعة جديدة' : 'Record Payment'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* OFFICIAL PRINTABLE PARENT STATEMENT - Visible during print OR when statement tab is active */}
      <div
        className={`panel official-parent-statement ${activeTab === 'statement' ? '' : 'only-print'}`}
        style={{
          padding: '30px 36px',
          background: '#ffffff',
          border: '2px solid #0f172a',
          borderRadius: '12px',
          marginTop: 16,
          maxWidth: '880px',
          minHeight: '920px',
          marginInline: 'auto',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
          position: 'relative'
        }}
      >
        <div>
          {/* Printable Header with MoE, School Logo, and Enlarged Clean UNICEF Logo */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2.5px solid #0f172a', paddingBottom: 16, marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#047857', display: 'flex', alignItems: 'center', gap: 6 }}>
                <PalestineFlagIcon />
                <span>{isRtl ? 'دولة فلسطين / وزارة التربية والتعليم' : 'State of Palestine / Ministry of Education'}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#1e1b4b', marginTop: 4 }}>
                {isRtl ? config?.schoolNameAr || 'إدارة المدرسة' : config?.schoolNameEn || 'School Administration'}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 2 }}>
                {isRtl ? 'قسم شؤون الطلاب والتسجيل والامتحانات' : 'Registrar & Student Affairs Department'}
              </div>
            </div>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <SchoolLogo size={64} />
            </div>

            <div style={{ textAlign: isRtl ? 'left' : 'right', display: 'flex', flexDirection: 'column', alignItems: isRtl ? 'flex-start' : 'flex-end', gap: 6 }}>
              {/* Enlarged Clean UNICEF Logo */}
              <UnicefLogo height={48} />
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', marginTop: 2 }}>
                {isRtl ? 'إفادة درجات ومستوى أداء طالب' : 'Official Student Academic Statement'}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                {isRtl ? 'تاريخ التحرير:' : 'Date Issued:'} <strong>{new Date().toLocaleDateString('ar-EG')}</strong>
              </div>
            </div>
          </div>

          {/* Student & Parent Info Box */}
          <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '14px 18px', marginBottom: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 16px', fontSize: 13 }}>
              <div>
                <span style={{ color: '#64748b', fontSize: 11.5 }}>{isRtl ? 'اسم الطالب الرباعي:' : 'Student Full Name:'}</span>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 14, marginTop: 2 }}>
                  {student.firstName} {student.middleName ? student.middleName + ' ' : ''}{student.lastName}
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: 11.5 }}>{isRtl ? 'الرقم الأكاديمي:' : 'Student ID No:'}</span>
                <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#4f46e5', fontSize: 14, marginTop: 2 }}>
                  {student.studentNumber}
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: 11.5 }}>{isRtl ? 'الصف والشعبة:' : 'Class & Section:'}</span>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 14, marginTop: 2 }}>
                  {student.currentClass || (isRtl ? 'مسجل' : 'Enrolled')}
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: 11.5 }}>{isRtl ? 'السنة الدراسية:' : 'Academic Calendar:'}</span>
                <div style={{ fontWeight: 700, color: '#334155', marginTop: 2 }}>
                  {student.academicYear || '2026/2027'}
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: 11.5 }}>{isRtl ? 'اسم ولي الأمر:' : 'Guardian Name:'}</span>
                <div style={{ fontWeight: 700, color: '#334155', marginTop: 2 }}>
                  {student.parentName || (isRtl ? 'غير محدد' : 'Not specified')}
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: 11.5 }}>{isRtl ? 'هاتف ولي الأمر:' : 'Guardian Phone:'}</span>
                <div style={{ fontWeight: 700, color: '#334155', marginTop: 2 }}>
                  {student.parentPhone || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Grades Summary Table */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 8, color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{isRtl ? 'كشف الدرجات والتقييمات للمقررات الدراسية:' : 'Course Assessment & Transcript Results:'}</span>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{isRtl ? 'الدرجة العظمى (100)' : 'Max Grade (100)'}</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, border: '1.5px solid #cbd5e1' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #94a3b8', color: '#0f172a' }}>
                  <th style={{ padding: '8px 10px', textAlign: isRtl ? 'right' : 'left', border: '1px solid #cbd5e1' }}>{isRtl ? 'المادة الدراسية' : 'Subject'}</th>
                  <th style={{ padding: '8px 6px', textAlign: 'center', border: '1px solid #cbd5e1', width: '13%' }}>{isRtl ? 'الأنشطة (20)' : 'Activities (20)'}</th>
                  <th style={{ padding: '8px 6px', textAlign: 'center', border: '1px solid #cbd5e1', width: '13%' }}>{isRtl ? 'نصفي (30)' : 'Midterm (30)'}</th>
                  <th style={{ padding: '8px 6px', textAlign: 'center', border: '1px solid #cbd5e1', width: '13%' }}>{isRtl ? 'نهائي (50)' : 'Final (50)'}</th>
                  <th style={{ padding: '8px 6px', textAlign: 'center', border: '1px solid #cbd5e1', width: '14%' }}>{isRtl ? 'المجموع (100)' : 'Total (100)'}</th>
                  <th style={{ padding: '8px 6px', textAlign: 'center', border: '1px solid #cbd5e1', width: '14%' }}>{isRtl ? 'التقدير' : 'Grade'}</th>
                  <th style={{ padding: '8px 6px', textAlign: 'center', border: '1px solid #cbd5e1', width: '11%' }}>{isRtl ? 'النتيجة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {subjectSummary && subjectSummary.length > 0 ? (
                  subjectSummary.map((s, idx) => {
                    const act = s.activityScore !== undefined ? s.activityScore : (s.scores?.find(x => x.examName?.includes('نشاط') || x.examName?.includes('أعمال'))?.score ?? Math.round((s.averagePercentage || 80) * 0.20));
                    const mid = s.midtermScore !== undefined ? s.midtermScore : (s.scores?.find(x => x.examName?.includes('نصفي'))?.score ?? Math.round((s.averagePercentage || 80) * 0.30));
                    const fin = s.finalScore !== undefined ? s.finalScore : (s.scores?.find(x => x.examName?.includes('نهائي'))?.score ?? Math.round((s.averagePercentage || 80) * 0.50));
                    const tot = s.averagePercentage !== undefined ? s.averagePercentage : (act + mid + fin);
                    const gr = getLetterGrade(tot);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '7px 10px', fontWeight: 700, border: '1px solid #cbd5e1' }}>
                          {s.subjectName} <span style={{ color: '#64748b', fontSize: 11 }}>({s.subjectCode})</span>
                        </td>
                        <td style={{ padding: '7px 6px', textAlign: 'center', fontWeight: 700, color: '#334155', border: '1px solid #cbd5e1' }}>
                          {act} <span style={{ color: '#94a3b8', fontSize: 10 }}>/ 20</span>
                        </td>
                        <td style={{ padding: '7px 6px', textAlign: 'center', fontWeight: 700, color: '#334155', border: '1px solid #cbd5e1' }}>
                          {mid} <span style={{ color: '#94a3b8', fontSize: 10 }}>/ 30</span>
                        </td>
                        <td style={{ padding: '7px 6px', textAlign: 'center', fontWeight: 700, color: '#334155', border: '1px solid #cbd5e1' }}>
                          {fin} <span style={{ color: '#94a3b8', fontSize: 10 }}>/ 50</span>
                        </td>
                        <td style={{ padding: '7px 6px', textAlign: 'center', fontWeight: 900, color: '#0f172a', border: '1px solid #cbd5e1' }}>
                          {tot}%
                        </td>
                        <td style={{ padding: '7px 6px', textAlign: 'center', fontWeight: 800, color: gr.color, border: '1px solid #cbd5e1' }}>
                          {gr.grade} ({isRtl ? gr.textAr : gr.textEn})
                        </td>
                        <td style={{ padding: '7px 6px', textAlign: 'center', fontWeight: 700, border: '1px solid #cbd5e1' }}>
                          <span style={{
                            background: tot >= 50 ? '#dcfce7' : '#fee2e2',
                            color: tot >= 50 ? '#15803d' : '#b91c1c',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: 11
                          }}>
                            {tot >= 50 ? (isRtl ? 'ناجح' : 'Passed') : (isRtl ? 'راسب' : 'Failed')}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                      {isRtl ? 'لا توجد درجات مرصودة حتى الآن' : 'No grades recorded yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Overall Results & Attendance Statement */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 20 }}>
            <div style={{ border: '1.5px solid #cbd5e1', borderRadius: 8, padding: '12px 16px', background: gpaInfo?.bg || '#f8fafc' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#475569' }}>{isRtl ? 'المعدل التراكمي الإجمالي والتقدير:' : 'Cumulative GPA:'}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: gpaInfo ? gpaInfo.color : '#0f172a', marginTop: 3 }}>
                {overallAverage !== null ? `${overallAverage}% - ${isRtl ? gpaInfo.textAr : gpaInfo.textEn}` : '—'}
              </div>
            </div>
            <div style={{ border: '1.5px solid #cbd5e1', borderRadius: 8, padding: '12px 16px', background: attendanceSummary.percentage >= 85 ? '#f0fdf4' : '#fffbeb' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#475569' }}>{isRtl ? 'نسبة المواظبة والحضور المدرسي:' : 'Attendance Standing:'}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: attendanceSummary.percentage >= 85 ? '#059669' : '#d97706', marginTop: 3 }}>
                {attendanceSummary.percentage}% ({attendanceSummary.present} {isRtl ? 'يوم حضور من' : 'days out of'} {attendanceSummary.totalDays})
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Official Signatures, Seal & Page Footnote */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, textAlign: 'center', borderTop: '2px dashed #cbd5e1', paddingTop: 18, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 28 }}>
                {isRtl ? 'مسؤول شؤون الطلاب والتسجيل' : 'Registrar Officer'}
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                  {isRtl ? 'إدارة التسجيل' : 'Registrar Office'}
                </div>
              </div>
              <div style={{ borderBottom: '1.5px solid #94a3b8', width: '75%', margin: '0 auto' }}></div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 28 }}>
                {isRtl ? 'مدير المدرسة / الاعتماد الرسمي' : 'School Principal'}
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                  {isRtl ? 'إدارة المدرسة' : 'School Principal'}
                </div>
              </div>
              <div style={{ borderBottom: '1.5px solid #94a3b8', width: '75%', margin: '0 auto' }}></div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                {isRtl ? 'الختم الرسمي للمؤسسة التعليمية' : 'Official School Stamp'}
              </div>
              <div style={{
                width: 62,
                height: 62,
                border: '2.5px dashed #4f46e5',
                borderRadius: '50%',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4f46e5',
                fontSize: 9,
                fontWeight: 800,
                background: '#faf5ff'
              }}>
                <span>{isRtl ? config?.schoolNameAr || 'المدرسة' : config?.schoolNameEn || 'School'}</span>
                <span style={{ fontSize: 7.5 }}>{isRtl ? 'الختم المعتمد' : 'Official Seal'}</span>
              </div>
            </div>
          </div>

          {/* Verification Bar */}
          <div style={{
            fontSize: 10,
            color: '#64748b',
            borderTop: '1px solid #e2e8f0',
            paddingTop: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>
              {isRtl
                ? `وثيقة إفادة رسمية صادرة إلكترونياً ومعتمدة من ${config?.schoolNameAr || 'إدارة المدرسة'}`
                : `Official Statement issued electronically by ${config?.schoolNameEn || 'School Administration'}`}
            </span>
            <span style={{ fontWeight: 700 }}>
              {isRtl ? 'صفحة 1 من 1' : 'Page 1 of 1'}
            </span>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showRecordModal && (
        <RecordPaymentModal
          isOpen={showRecordModal}
          onClose={() => setShowRecordModal(false)}
          defaultStudentId={student.id}
          onPaymentSuccess={(newPayment) => {
            loadStudent();
            setSelectedReceipt({
              ...newPayment,
              student: {
                firstName: student.firstName,
                lastName: student.lastName,
                studentNumber: student.studentNumber,
                currentClass: student.currentClass
              }
            });
          }}
        />
      )}

      {/* Official Printable Digital Receipt Modal */}
      {selectedReceipt && (
        <PaymentReceiptModal
          isOpen={Boolean(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
          payment={selectedReceipt}
        />
      )}
    </div>
  );
}

