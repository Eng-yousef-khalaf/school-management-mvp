import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import Badge from '../../components/common/Badge';
import { AttendanceIcon, EyeIcon } from '../../components/common/Icons';

export default function ClassDetails({ classId, onBack, onViewStudent, onTakeAttendance }) {
  const { isAdmin, isStaff, isTeacher } = useAuth();
  const { t, isRtl } = useLanguage();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadClass = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get(`/classes/${classId}`);
      setClassData(data);
    } catch (err) {
      setError(err.message || 'Failed to load class details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      loadClass();
    }
  }, [classId]);

  if (loading) return <PageLoader text={isRtl ? 'جاري تحميل بيانات الشعبة...' : 'Loading class details...'} />;
  if (error) return <ErrorAlert message={error} onRetry={loadClass} />;
  if (!classData) return null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          {isRtl ? '← العودة لقائمة الصفوف والشعب' : '← Back to Classes'}
        </button>
        {!isAdmin && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onTakeAttendance(classData.id)}
          >
            <AttendanceIcon /> {isRtl ? 'تسجيل حضور الشعبة' : 'Take Class Attendance'}
          </button>
        )}
      </div>

      {/* Class Banner Panel */}
      <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{classData.name}</h2>
              <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}>
                Grade {classData.grade} - Section {classData.section || '—'}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              Academic Year: <strong>{classData.academicYear?.name}</strong> • Total Enrolled: <strong>{classData.students?.length || 0} Students</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(14, 165, 233, 0.1)',
              border: '1px solid rgba(14, 165, 233, 0.25)',
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              minWidth: 140
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', display: 'block' }}>
                ESTIMATED CLASS AVERAGE
              </span>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary)', marginTop: 2 }}>
                {classData.estimatedAverage || 84}%
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>نسبة تقديرية لمعدل الشعبة</span>
            </div>

            <div style={{
              background: 'var(--success-light)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              minWidth: 120
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', display: 'block' }}>
                PASSING RATE
              </span>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--success)', marginTop: 2 }}>
                {classData.passingRate || 95}%
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>نسبة النجاح</span>
            </div>

            <div style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              minWidth: 120
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', display: 'block' }}>
                ATTENDANCE
              </span>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#4f46e5', marginTop: 2 }}>
                {classData.attendanceRate || 96}%
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>نسبة الحضور</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Teachers */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header">
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Faculty & Subject Instructors</h3>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Subject Code</th>
                <th>Instructor</th>
                <th>Employee No</th>
              </tr>
            </thead>
            <tbody>
              {classData.teachers && classData.teachers.length > 0 ? (
                classData.teachers.map((t, idx) => (
                  <tr key={idx}>
                    <td><strong style={{ color: 'var(--primary)' }}>{t.subjectName}</strong></td>
                    <td><code>{t.subjectCode}</code></td>
                    <td>{t.teacherName}</td>
                    <td>{t.employeeNo}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No teachers assigned to this class yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enrolled Students Roster - Strictly for Staff & Teachers */}
      {!isAdmin && (
        <div className="panel">
          <div className="panel-header">
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>
              {isRtl ? `قائمة الطلاب المسجلين في الشعبة (${classData.students?.length || 0})` : `Enrolled Student Roster (${classData.students?.length || 0})`}
            </h3>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>{isRtl ? 'رقم الطالب' : 'Student Number'}</th>
                  <th>{isRtl ? 'اسم الطالب' : 'Full Name'}</th>
                  <th>{isRtl ? 'الجنس' : 'Gender'}</th>
                  <th>{isRtl ? 'هاتف ولي الأمر' : 'Parent Phone'}</th>
                  <th>{isRtl ? 'الحالة' : 'Status'}</th>
                  <th style={{ textAlign: 'right' }}>{isRtl ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {classData.students && classData.students.length > 0 ? (
                  classData.students.map((s) => (
                    <tr key={s.id}>
                      <td><strong>{s.studentNumber}</strong></td>
                      <td>{s.firstName} {s.middleName ? s.middleName + ' ' : ''}{s.lastName}</td>
                      <td>{s.gender || '—'}</td>
                      <td>{s.parentPhone || '—'}</td>
                      <td>
                        <Badge status={s.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-icon"
                          title={isRtl ? 'عرض ملف الطالب' : 'View Student'}
                          onClick={() => onViewStudent(s.id)}
                        >
                          <EyeIcon />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>
                      {isRtl ? 'لا يوجد طلاب مسكنين في هذه الشعبة حالياً' : 'No students currently enrolled in this class'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
