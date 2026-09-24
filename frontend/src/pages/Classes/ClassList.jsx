import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import AddEditClassModal from './AddEditClassModal';
import { PlusIcon, EyeIcon, EditIcon } from '../../components/common/Icons';

export default function ClassList({ onViewClass }) {
  const { isStaff, isAdmin } = useAuth();
  const { isRtl } = useLanguage();
  const { selectedYearId, isArchiveView, selectedYear, activeYear, allYears } = useAcademicYear();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const query = selectedYearId ? `?academicYearId=${selectedYearId}` : '';
      const cls = await api.get(`/classes${query}`);
      setClasses(cls || []);
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
        <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
              {isRtl ? 'الصفوف والشعب المسجلة لـ:' : 'Class Sections for:'}
            </span>
            <span className="badge" style={{
              background: isArchiveView ? '#fef3c7' : '#ecfdf5',
              color: isArchiveView ? '#92400e' : '#047857',
              border: `1px solid ${isArchiveView ? '#fde68a' : '#a7f3d0'}`,
              fontWeight: 800,
              fontSize: 13,
              padding: '6px 14px'
            }}>
              {isArchiveView ? `📁 ${selectedYear?.name} (أرشيف)` : `🟢 ${activeYear?.name || selectedYear?.name} (العام النشط)`}
            </span>
          </div>

          {isStaff && !isArchiveView && (
            <button
              className="btn btn-primary btn-sm"
              style={{ marginLeft: 'auto' }}
              onClick={() => {
                setEditingClass(null);
                setIsAddModalOpen(true);
              }}
            >
              <PlusIcon /> {isRtl ? 'إضافة شعبة دراسية جديدة' : 'Add Class Section'}
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
                  <th>Estimated Class Average</th>
                  <th>Attendance Rate</th>
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
                      <span
                        className="badge"
                        style={{
                          background: (c.estimatedAverage || 84) >= 85 ? 'var(--success-light)' : (c.estimatedAverage || 84) >= 70 ? 'rgba(14, 165, 233, 0.12)' : 'var(--warning-light)',
                          color: (c.estimatedAverage || 84) >= 85 ? 'var(--success)' : (c.estimatedAverage || 84) >= 70 ? 'var(--primary)' : 'var(--warning)',
                          fontWeight: 800,
                          fontSize: 13,
                          padding: '4px 10px'
                        }}
                      >
                        📊 {c.estimatedAverage || 84}%
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: (c.attendanceRate || 95) >= 90 ? 'var(--success)' : 'var(--warning)' }}>
                        {c.attendanceRate || 95}%
                      </span>
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
          academicYears={allYears || (activeYear ? [activeYear] : [])}
          onSaved={loadData}
        />
      )}
    </div>
  );
}
