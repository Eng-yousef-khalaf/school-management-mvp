import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import AddEditClassModal from './AddEditClassModal';
import { PlusIcon, EyeIcon, EditIcon } from '../../components/common/Icons';

export default function ClassList({ onViewClass }) {
  const { isStaff } = useAuth();
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedYearId, setSelectedYearId] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [cls, years] = await Promise.all([
        api.get(selectedYearId ? `/classes?academicYearId=${selectedYearId}` : '/classes'),
        api.get('/academic-years')
      ]);
      setClasses(cls);
      setAcademicYears(years);
    } catch (err) {
      setError(err.message || 'Failed to fetch school classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedYearId]);

  return (
    <div>
      <div className="panel" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div className="toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Academic Year:</span>
            <select
              className="filter-select"
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
            >
              <option value="">All Academic Years</option>
              {academicYears.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name} {y.active ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          {isStaff && (
            <button
              className="btn btn-primary btn-sm"
              style={{ marginLeft: 'auto' }}
              onClick={() => {
                setEditingClass(null);
                setIsAddModalOpen(true);
              }}
            >
              <PlusIcon /> Add Class Section
            </button>
          )}
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={loadData} />}

      <div className="panel">
        <div className="table-responsive">
          {loading ? (
            <PageLoader text="Loading classes..." />
          ) : classes.length === 0 ? (
            <EmptyState
              title="No classes found"
              description="Create a new class section linked to an academic year."
              actionText={isStaff ? 'Add Class' : null}
              onAction={() => {
                setEditingClass(null);
                setIsAddModalOpen(true);
              }}
            />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Grade Level</th>
                  <th>Section</th>
                  <th>Academic Year</th>
                  <th>Enrolled Students</th>
                  <th>Assigned Teachers</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong
                        style={{ color: 'var(--primary)', cursor: 'pointer', fontSize: 15 }}
                        onClick={() => onViewClass(c.id)}
                      >
                        {c.name}
                      </strong>
                    </td>
                    <td>Grade {c.grade}</td>
                    <td>
                      <span className="badge" style={{ background: '#f1f5f9', color: 'var(--text-main)' }}>
                        Section {c.section || '—'}
                      </span>
                    </td>
                    <td>{c.academicYear?.name}</td>
                    <td>
                      <strong style={{ color: 'var(--text-main)' }}>{c.studentCount}</strong> Students
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {c.teachers && c.teachers.length > 0
                          ? [...new Set(c.teachers.map((t) => t.teacherName))].join(', ')
                          : 'None'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          className="btn btn-secondary btn-icon"
                          title="View Class Roster"
                          onClick={() => onViewClass(c.id)}
                        >
                          <EyeIcon />
                        </button>
                        {isStaff && (
                          <button
                            className="btn btn-secondary btn-icon"
                            title="Edit"
                            onClick={() => {
                              setEditingClass(c);
                              setIsAddModalOpen(true);
                            }}
                          >
                            <EditIcon />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <AddEditClassModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          schoolClass={editingClass}
          academicYears={academicYears}
          onSaved={loadData}
        />
      )}
    </div>
  );
}
