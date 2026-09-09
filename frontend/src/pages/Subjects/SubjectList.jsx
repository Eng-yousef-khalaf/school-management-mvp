import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import AddEditSubjectModal from './AddEditSubjectModal';
import { PlusIcon, EditIcon } from '../../components/common/Icons';

export default function SubjectList() {
  const { isStaff } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get('/subjects');
      setSubjects(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  return (
    <div>
      <div className="panel" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Curriculum Subjects Directory</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Manage academic subjects and instructor associations</p>
          </div>
          {isStaff && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingSubject(null);
                setIsModalOpen(true);
              }}
            >
              <PlusIcon /> Add Subject
            </button>
          )}
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={loadSubjects} />}

      <div className="panel">
        <div className="table-responsive">
          {loading ? (
            <PageLoader text="Loading subjects..." />
          ) : subjects.length === 0 ? (
            <EmptyState
              title="No subjects registered"
              description="Add your first curriculum subject."
              actionText={isStaff ? 'Add Subject' : null}
              onAction={() => {
                setEditingSubject(null);
                setIsModalOpen(true);
              }}
            />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Subject Name</th>
                  <th>Faculty Count</th>
                  <th>Assigned Teachers</th>
                  <th>Status</th>
                  {isStaff && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong style={{ color: 'var(--primary)', fontSize: 14 }}>{s.code}</strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{s.name}</span>
                    </td>
                    <td>
                      <strong>{s.teacherCount}</strong> Teachers
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {s.teachers && s.teachers.length > 0 ? s.teachers.join(', ') : 'None'}
                      </span>
                    </td>
                    <td>
                      <Badge status={s.active ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    {isStaff && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-icon"
                          title="Edit Subject"
                          onClick={() => {
                            setEditingSubject(s);
                            setIsModalOpen(true);
                          }}
                        >
                          <EditIcon />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <AddEditSubjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          subject={editingSubject}
          onSaved={loadSubjects}
        />
      )}
    </div>
  );
}
