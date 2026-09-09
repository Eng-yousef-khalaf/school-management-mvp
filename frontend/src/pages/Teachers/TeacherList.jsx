import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import AddEditTeacherModal from './AddEditTeacherModal';
import {
  SearchIcon,
  PlusIcon,
  DownloadIcon,
  EyeIcon,
  EditIcon,
  TrashIcon
} from '../../components/common/Icons';

export default function TeacherList({ onViewTeacher }) {
  const toast = useToast();
  const { isStaff, isAdmin } = useAuth();

  const [teachers, setTeachers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [deactivatingTeacher, setDeactivatingTeacher] = useState(null);
  const [deactivatingLoading, setDeactivatingLoading] = useState(false);

  const loadTeachers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        q: search.trim(),
        active: activeFilter,
        specialty: specialtyFilter
      });

      const res = await api.get(`/teachers?${queryParams.toString()}`);
      setTeachers(res.items);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message || 'Failed to fetch teachers list');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, activeFilter, specialtyFilter]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const handleExport = async () => {
    try {
      toast.info('Generating Excel export...');
      const queryParams = new URLSearchParams({
        q: search.trim(),
        active: activeFilter,
        specialty: specialtyFilter
      });
      await api.download(`/teachers/export?${queryParams.toString()}`, 'teachers_directory.xlsx');
      toast.success('Teachers directory exported successfully!');
    } catch (err) {
      toast.error(err.message || 'Export failed');
    }
  };

  const handleDeactivate = async () => {
    if (!deactivatingTeacher) return;
    try {
      setDeactivatingLoading(true);
      await api.delete(`/teachers/${deactivatingTeacher.id}`);
      toast.success(`Teacher ${deactivatingTeacher.firstName} deactivated`);
      setDeactivatingTeacher(null);
      loadTeachers();
    } catch (err) {
      toast.error(err.message || 'Failed to deactivate teacher');
    } finally {
      setDeactivatingLoading(false);
    }
  };

  return (
    <div>
      {/* Top Toolbar */}
      <div className="panel" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div className="toolbar">
          <div className="search-box">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Search by Employee No, Name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className="filter-select"
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="true">Active Faculty</option>
            <option value="false">Inactive</option>
          </select>

          <input
            type="text"
            className="form-input"
            style={{ width: 180 }}
            placeholder="Filter Specialty..."
            value={specialtyFilter}
            onChange={(e) => {
              setSpecialtyFilter(e.target.value);
              setPage(1);
            }}
          />

          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleExport} title="Export to Excel">
              <DownloadIcon /> Export Excel
            </button>
            {isStaff && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setEditingTeacher(null);
                  setIsAddModalOpen(true);
                }}
              >
                <PlusIcon /> Add Teacher
              </button>
            )}
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={loadTeachers} />}

      {/* Main Table */}
      <div className="panel">
        <div className="table-responsive">
          {loading ? (
            <PageLoader text="Fetching faculty list..." />
          ) : teachers.length === 0 ? (
            <EmptyState
              title="No teachers found"
              description="No faculty members match the search query."
              actionText={isStaff ? 'Add New Teacher' : null}
              onAction={() => {
                setEditingTeacher(null);
                setIsAddModalOpen(true);
              }}
            />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Employee No</th>
                  <th>Full Name</th>
                  <th>Specialty</th>
                  <th>Assigned Classes</th>
                  <th>Contact Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong
                        style={{ color: 'var(--primary)', cursor: 'pointer' }}
                        onClick={() => onViewTeacher(t.id)}
                      >
                        {t.employeeNo}
                      </strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{t.firstName} {t.lastName}</span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: '#f1f5f9', color: 'var(--text-main)' }}>
                        {t.specialty || 'General'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {t.classes.length > 0 ? t.classes.join(', ') : 'None'}
                      </span>
                    </td>
                    <td>{t.email || '—'}</td>
                    <td>{t.phone || '—'}</td>
                    <td>
                      <Badge status={t.active ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          className="btn btn-secondary btn-icon"
                          title="View Profile"
                          onClick={() => onViewTeacher(t.id)}
                        >
                          <EyeIcon />
                        </button>
                        {isStaff && (
                          <button
                            className="btn btn-secondary btn-icon"
                            title="Edit"
                            onClick={() => {
                              setEditingTeacher(t);
                              setIsAddModalOpen(true);
                            }}
                          >
                            <EditIcon />
                          </button>
                        )}
                        {isAdmin && t.active && (
                          <button
                            className="btn btn-secondary btn-icon"
                            title="Deactivate"
                            onClick={() => setDeactivatingTeacher(t)}
                            style={{ color: 'var(--danger)' }}
                          >
                            <TrashIcon />
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

        {pagination && (
          <Pagination
            pagination={pagination}
            onPageChange={(p) => setPage(p)}
            onLimitChange={(l) => {
              setLimit(l);
              setPage(1);
            }}
          />
        )}
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <AddEditTeacherModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          teacher={editingTeacher}
          onSaved={loadTeachers}
        />
      )}

      {/* Confirm Deactivate Dialog */}
      {deactivatingTeacher && (
        <ConfirmDialog
          isOpen={Boolean(deactivatingTeacher)}
          onClose={() => setDeactivatingTeacher(null)}
          onConfirm={handleDeactivate}
          title="Deactivate Faculty Member"
          message={`Are you sure you want to deactivate ${deactivatingTeacher.firstName} ${deactivatingTeacher.lastName} (${deactivatingTeacher.employeeNo})?`}
          confirmText="Deactivate"
          isDanger={true}
          loading={deactivatingLoading}
        />
      )}
    </div>
  );
}
