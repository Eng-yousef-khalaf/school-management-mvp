import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import AddEditYearModal from './AddEditYearModal';
import { PlusIcon, EditIcon, CheckIcon } from '../../components/common/Icons';

export default function AcademicYearList() {
  const toast = useToast();
  const { isStaff } = useAuth();
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState(null);

  const loadYears = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get('/academic-years');
      setYears(data);
    } catch (err) {
      setError(err.message || 'Failed to load academic years');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadYears();
  }, []);

  const handleSetActive = async (yearId) => {
    try {
      await api.post(`/academic-years/${yearId}/set-active`);
      toast.success('Active academic year updated!');
      loadYears();
    } catch (err) {
      toast.error(err.message || 'Failed to activate academic year');
    }
  };

  return (
    <div>
      <div className="panel" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Academic Years Management</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Configure academic terms and set active enrollment calendar</p>
          </div>
          {isStaff && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingYear(null);
                setIsModalOpen(true);
              }}
            >
              <PlusIcon /> Add Academic Year
            </button>
          )}
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={loadYears} />}

      <div className="panel">
        <div className="table-responsive">
          {loading ? (
            <PageLoader text="Loading academic years..." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Academic Year</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Class Sections</th>
                  <th>Enrollments</th>
                  <th>Active Status</th>
                  {isStaff && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {years.map((y) => (
                  <tr key={y.id}>
                    <td>
                      <strong style={{ fontSize: 15, color: y.active ? 'var(--primary)' : 'var(--text-main)' }}>
                        {y.name}
                      </strong>
                    </td>
                    <td>{new Date(y.startDate).toLocaleDateString()}</td>
                    <td>{new Date(y.endDate).toLocaleDateString()}</td>
                    <td>{y._count?.classes || 0} Classes</td>
                    <td>{y._count?.enrollments || 0} Students</td>
                    <td>
                      {y.active ? (
                        <span className="badge badge-active">
                          <CheckIcon /> Current Active Year
                        </span>
                      ) : (
                        <span className="badge" style={{ background: '#f1f5f9', color: 'var(--text-muted)' }}>
                          Archived
                        </span>
                      )}
                    </td>
                    {isStaff && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {!y.active && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleSetActive(y.id)}
                            >
                              Set as Active Year
                            </button>
                          )}
                          <button
                            className="btn btn-secondary btn-icon"
                            title="Edit Year"
                            onClick={() => {
                              setEditingYear(y);
                              setIsModalOpen(true);
                            }}
                          >
                            <EditIcon />
                          </button>
                        </div>
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
        <AddEditYearModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          academicYear={editingYear}
          onSaved={loadYears}
        />
      )}
    </div>
  );
}
