import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import Badge from '../../components/common/Badge';
import { AttendanceIcon, EyeIcon } from '../../components/common/Icons';

export default function ClassDetails({ classId, onBack, onViewStudent, onTakeAttendance }) {
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

  if (loading) return <PageLoader text="Loading class roster..." />;
  if (error) return <ErrorAlert message={error} onRetry={loadClass} />;
  if (!classData) return null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          ← Back to Classes
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => onTakeAttendance(classData.id)}
        >
          <AttendanceIcon /> Take Class Attendance
        </button>
      </div>

      {/* Class Banner Panel */}
      <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800 }}>{classData.name}</h2>
              <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                Grade {classData.grade} - Section {classData.section || '—'}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              Academic Year: <strong>{classData.academicYear?.name}</strong> • Total Enrolled: <strong>{classData.students?.length || 0} Students</strong>
            </p>
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

      {/* Enrolled Students Roster */}
      <div className="panel">
        <div className="panel-header">
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Enrolled Student Roster ({classData.students?.length || 0})</h3>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Student Number</th>
                <th>Full Name</th>
                <th>Gender</th>
                <th>Parent Phone</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
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
                        title="View Student"
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
                    No students currently enrolled in this class
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
