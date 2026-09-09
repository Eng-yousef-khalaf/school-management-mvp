import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { PlusIcon, TrashIcon, EditIcon } from '../../components/common/Icons';

export default function TeacherDetails({ teacherId, onBack, onEdit }) {
  const toast = useToast();
  const { isStaff } = useAuth();

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Assign Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const loadTeacher = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get(`/teachers/${teacherId}`);
      setTeacher(data);
    } catch (err) {
      setError(err.message || 'Failed to load teacher profile');
    } finally {
      setLoading(false);
    }
  };

  const loadDropdowns = async () => {
    try {
      const [cls, subs] = await Promise.all([
        api.get('/classes'),
        api.get('/subjects')
      ]);
      setClasses(cls);
      setSubjects(subs);
      if (cls[0]) setSelectedClassId(cls[0].id);
      if (subs[0]) setSelectedSubjectId(subs[0].id);
    } catch {}
  };

  useEffect(() => {
    if (teacherId) {
      loadTeacher();
      loadDropdowns();
    }
  }, [teacherId]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedClassId || !selectedSubjectId) {
      toast.error('Please select both a class and a subject');
      return;
    }

    setAssigning(true);
    try {
      await api.post('/teachers/assign', {
        teacherId: teacher.id,
        classId: Number(selectedClassId),
        subjectId: Number(selectedSubjectId)
      });
      toast.success('Teaching assignment added successfully!');
      setIsAssignModalOpen(false);
      loadTeacher();
    } catch (err) {
      toast.error(err.message || 'Failed to assign class & subject');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAssignment = async (linkId) => {
    try {
      await api.delete(`/teachers/assign/${linkId}`);
      toast.success('Assignment removed');
      loadTeacher();
    } catch (err) {
      toast.error(err.message || 'Failed to remove assignment');
    }
  };

  if (loading) return <PageLoader text="Loading faculty profile..." />;
  if (error) return <ErrorAlert message={error} onRetry={loadTeacher} />;
  if (!teacher) return null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          ← Back to Teachers
        </button>
        {isStaff && (
          <button className="btn btn-primary btn-sm" onClick={() => onEdit(teacher)}>
            <EditIcon /> Edit Faculty Profile
          </button>
        )}
      </div>

      {/* Header Profile Panel */}
      <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 800
            }}
          >
            {teacher.firstName.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)' }}>
                {teacher.firstName} {teacher.lastName}
              </h2>
              <Badge status={teacher.active ? 'ACTIVE' : 'INACTIVE'} />
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                No: <strong>{teacher.employeeNo}</strong>
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              Specialty: <strong>{teacher.specialty || 'General Faculty'}</strong> • Email: <strong>{teacher.email || '—'}</strong> • Phone: <strong>{teacher.phone || '—'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Teaching Assignments Table */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Class & Subject Assignments</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Classes and subjects taught by this teacher</p>
          </div>
          {isStaff && (
            <button className="btn btn-primary btn-sm" onClick={() => setIsAssignModalOpen(true)}>
              <PlusIcon /> Assign Class & Subject
            </button>
          )}
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Class Section</th>
                <th>Grade</th>
                <th>Academic Year</th>
                <th>Curriculum Subject</th>
                <th>Subject Code</th>
                {isStaff && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {teacher.assignments && teacher.assignments.length > 0 ? (
                teacher.assignments.map((asg) => (
                  <tr key={asg.id}>
                    <td><strong>{asg.className}</strong></td>
                    <td>Grade {asg.grade}</td>
                    <td>{asg.academicYear || '—'}</td>
                    <td><strong style={{ color: 'var(--primary)' }}>{asg.subjectName}</strong></td>
                    <td><code>{asg.subjectCode}</code></td>
                    {isStaff && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-icon"
                          title="Remove assignment"
                          onClick={() => handleRemoveAssignment(asg.id)}
                          style={{ color: 'var(--danger)' }}
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isStaff ? 6 : 5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>
                    No class and subject assignments found for this teacher
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Class Modal */}
      {isAssignModalOpen && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Assign Class & Subject to ${teacher.firstName} ${teacher.lastName}`}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setIsAssignModalOpen(false)} disabled={assigning}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAssign} disabled={assigning}>
                {assigning ? 'Assigning...' : 'Assign'}
              </button>
            </>
          }
        >
          <form onSubmit={handleAssign}>
            <div className="form-group">
              <label className="form-label">Target Class <span className="req">*</span></label>
              <select
                className="form-select"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                required
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.academicYear?.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Curriculum Subject <span className="req">*</span></label>
              <select
                className="form-select"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                required
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
