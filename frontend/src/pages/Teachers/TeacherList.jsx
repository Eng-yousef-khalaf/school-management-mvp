import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import AddEditTeacherModal from './AddEditTeacherModal';
import TeacherRolloverModal from './TeacherRolloverModal';
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
  const { t, isRtl } = useLanguage();

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
  const [isRolloverOpen, setIsRolloverOpen] = useState(false);
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

  const [reactivatingId, setReactivatingId] = useState(null);

  const handleQuickReactivate = async (teacher) => {
    try {
      setReactivatingId(teacher.id);
      await api.put(`/teachers/${teacher.id}`, { active: true });
      toast.success(
        isRtl
          ? `تم تفعيل حساب المعلم (${teacher.firstName} ${teacher.lastName}) بنجاح! يستطيع الآن تسجيل الدخول للنظام، وظهر إشعار لشؤون الطلاب لاستكمال تعيين الشعب والمواد.`
          : `Teacher ${teacher.firstName} ${teacher.lastName} reactivated! User can now log in and staff was notified.`
      );
      loadTeachers();
    } catch (err) {
      toast.error(err.message || 'Failed to reactivate teacher');
    } finally {
      setReactivatingId(null);
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

          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleExport} title="Export to Excel">
              <DownloadIcon /> Export Excel
            </button>
            {isAdmin && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsRolloverOpen(true)}
                style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#047857', borderColor: '#10b981', fontWeight: 700 }}
              >
                ✨ {isRtl ? 'تجديد وتفعيل المعلمين للعام الجديد' : 'Reactivate Faculty'}
              </button>
            )}
            {(isStaff || isAdmin) && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setEditingTeacher(null);
                  setIsAddModalOpen(true);
                }}
              >
                <PlusIcon /> {isRtl ? 'إضافة معلم جديد' : 'Add Teacher'}
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
                  <th>{isRtl ? 'الرقم الوظيفي' : 'Employee No'}</th>
                  <th>{isRtl ? 'اسم المعلم' : 'Full Name'}</th>
                  <th>{isRtl ? 'التخصص' : 'Specialty'}</th>
                  <th>{isRtl ? 'الشعب والمواد المسندة' : 'Assigned Classes & Subjects'}</th>
                  <th>{isRtl ? 'حالة التعيين' : 'Allocation Status'}</th>
                  <th>{isRtl ? 'البريد والهاتف' : 'Contact'}</th>
                  <th>{isRtl ? 'الحالة' : 'Status'}</th>
                  <th style={{ textAlign: 'right' }}>{isRtl ? 'الإجراءات' : 'Actions'}</th>
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
                      {t.user && (
                        <span style={{ display: 'block', fontSize: 11, color: 'var(--success)' }}>
                          ✓ {isRtl ? 'مرتبط بحساب نظام' : 'Linked User Account'}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="badge" style={{ background: '#f1f5f9', color: 'var(--text-main)' }}>
                        {t.specialty || 'General'}
                      </span>
                    </td>
                    <td>
                      {t.classes && t.classes.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                            🏫 {t.classes.join(', ')}
                          </span>
                          {t.subjects && t.subjects.length > 0 && (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              📖 {t.subjects.join(', ')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          {isRtl ? 'لا توجد شعب مسندة' : 'No classes assigned'}
                        </span>
                      )}
                    </td>
                    <td>
                      {t.pendingSetup || (!t.classes || t.classes.length === 0) ? (
                        <span className="badge badge-late" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontWeight: 700 }}>
                          ⚠️ {isRtl ? 'بانتظار استكمال الشعب' : 'Pending Allocation'}
                        </span>
                      ) : (
                        <span className="badge badge-active" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                          ✓ {isRtl ? `${t.classes.length} شعب معتمدة` : `${t.classes.length} Classes Assigned`}
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: 12 }}>
                        <div>{t.email || '—'}</div>
                        {t.phone && <div style={{ color: 'var(--text-muted)' }}>{t.phone}</div>}
                      </div>
                    </td>
                    <td>
                      <Badge status={t.active ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          className="btn btn-secondary btn-icon"
                          title={isRtl ? 'عرض ملف المعلم' : 'View Profile'}
                          onClick={() => onViewTeacher(t.id)}
                        >
                          <EyeIcon />
                        </button>
                        {(isStaff || isAdmin) && (
                          <button
                            className="btn btn-secondary btn-icon"
                            title={isRtl ? 'تعديل وتخصيص الشعب' : 'Edit & Allocate Classes'}
                            onClick={() => {
                              setEditingTeacher(t);
                              setIsAddModalOpen(true);
                            }}
                          >
                            <EditIcon />
                          </button>
                        )}
                        {isAdmin && !t.active && (
                          <button
                            className="btn btn-sm"
                            title={isRtl ? 'تفعيل المعلم للعام الجديد فوراً' : 'Reactivate Teacher'}
                            disabled={reactivatingId === t.id}
                            onClick={() => handleQuickReactivate(t)}
                            style={{
                              background: '#10b981',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: 12,
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-sm)'
                            }}
                          >
                            ⚡ {isRtl ? 'تفعيل' : 'Reactivate'}
                          </button>
                        )}
                        {isAdmin && t.active && (
                          <button
                            className="btn btn-secondary btn-icon"
                            title={isRtl ? 'تعطيل الحساب' : 'Deactivate'}
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

      {/* Rollover & Reactivation Modal */}
      {isRolloverOpen && (
        <TeacherRolloverModal
          isOpen={isRolloverOpen}
          onClose={() => setIsRolloverOpen(false)}
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
