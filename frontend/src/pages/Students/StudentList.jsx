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
import AddEditStudentModal from './AddEditStudentModal';
import ImportStudentsModal from './ImportStudentsModal';
import BulkCertificatesModal from '../Reports/BulkCertificatesModal';
import { useNotifications } from '../../context/NotificationContext';
import UserAvatar from '../../components/common/UserAvatar';
import {
  SearchIcon,
  PlusIcon,
  DownloadIcon,
  UploadIcon,
  EyeIcon,
  EditIcon,
  TrashIcon
} from '../../components/common/Icons';

export default function StudentList({ onViewStudent, onNavigate }) {
  const toast = useToast();
  const { canManageStudents, isAdmin, isTeacher } = useAuth();
  const { t, isRtl } = useLanguage();
  const { pendingRegistrationsCount } = useNotifications();

  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Metadata dropdowns
  const [classes, setClasses] = useState([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBulkCertificatesOpen, setIsBulkCertificatesOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deactivatingStudent, setDeactivatingStudent] = useState(null);
  const [deactivatingLoading, setDeactivatingLoading] = useState(false);

  const loadClasses = async () => {
    try {
      const data = await api.get('/classes');
      setClasses(data);
    } catch {}
  };

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        q: search.trim(),
        status: statusFilter,
        gender: genderFilter,
        classId: classFilter
      });

      const res = await api.get(`/students?${queryParams.toString()}`);
      setStudents(res.items);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message || 'Failed to fetch students list');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, genderFilter, classFilter]);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleExport = async () => {
    try {
      toast.info(isRtl ? 'جاري تصدير ملف Excel...' : 'Generating Excel export...');
      const queryParams = new URLSearchParams({
        q: search.trim(),
        status: statusFilter,
        gender: genderFilter,
        classId: classFilter
      });
      await api.download(`/students/export?${queryParams.toString()}`, 'students_directory.xlsx');
      toast.success(isRtl ? 'تم تنزيل كشف الطلاب بنجاح!' : 'Excel export downloaded successfully!');
    } catch (err) {
      toast.error(err.message || 'Export failed');
    }
  };

  const handleDeactivate = async () => {
    if (!deactivatingStudent) return;
    try {
      setDeactivatingLoading(true);
      await api.delete(`/students/${deactivatingStudent.id}`);
      toast.success(`Student ${deactivatingStudent.firstName} deactivated`);
      setDeactivatingStudent(null);
      loadStudents();
    } catch (err) {
      toast.error(err.message || 'Failed to deactivate student');
    } finally {
      setDeactivatingLoading(false);
    }
  };

  return (
    <div>
      {/* Pending Online Registrations Alert Banner */}
      {pendingRegistrationsCount > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '1.5px solid #60a5fa',
          padding: '12px 18px',
          borderRadius: '12px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>🎓</span>
            <div>
              <strong style={{ fontSize: 13.5, color: '#1e40af', display: 'block' }}>
                {isRtl ? `يوجد ${pendingRegistrationsCount} طلب تسجيل إلكتروني جديد وحجز مقعد وارد من الموقع!` : `${pendingRegistrationsCount} new online student registration(s) pending review!`}
              </strong>
              <span style={{ fontSize: 12, color: '#3b82f6' }}>
                {isRtl ? 'تم سداد رسوم الحجز (20 شيكل) بانتظار التحقق وتسكين الطالب في الشعبة' : 'Requires verification of deposit and class assignment'}
              </span>
            </div>
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('enrollment')}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 800, padding: '7px 14px', borderRadius: 8, fontSize: 12 }}
            >
              {isRtl ? 'الانتقال لمعاينة واعتماد الطلبات ➜' : 'Review & Enroll ➜'}
            </button>
          )}
        </div>
      )}

      {/* Role Context Ribbon */}
      {isAdmin && (
        <div style={{
          background: 'var(--primary-light)',
          border: '1px solid rgba(79, 70, 229, 0.2)',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12.5px',
          color: 'var(--primary-dark)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>👔</span>
            <span>
              <strong>{isRtl ? 'وضع الإشراف والرقابة:' : 'Executive Oversight:'}</strong>{' '}
              {isRtl ? 'اطلاع وتصدير تقارير كافة سجلات وشهادات الطلاب.' : 'Full read-only inspection and export access.'}
            </span>
          </div>
          <span className="badge badge-primary">{isRtl ? 'إشراف عام' : 'Supervisory'}</span>
        </div>
      )}

      {isTeacher && (
        <div style={{
          background: 'var(--secondary-light)',
          border: '1px solid rgba(14, 165, 233, 0.2)',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12.5px',
          color: '#0369a1'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>👨‍🏫</span>
            <span>
              <strong>{isRtl ? 'سجل الشعب المسندة:' : 'Assigned Students Roster:'}</strong>{' '}
              {isRtl ? 'يتم عرض طلاب الصفوف والشعب التي تقوم بتدريسها فقط.' : 'Showing students enrolled in your assigned classes only.'}
            </span>
          </div>
          <span className="badge badge-secondary">{isRtl ? 'خاص بالمعلم' : 'Teacher Scoped'}</span>
        </div>
      )}

      {/* Clean Filters Toolbar */}
      <div className="panel" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div className="toolbar">
          <div className="search-box">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder={isRtl ? 'بحث بالاسم، الرقم الأكاديمي، الهاتف...' : 'Search by ID, Name, Phone...'}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">{isRtl ? 'كافة الحالات' : 'All Statuses'}</option>
            <option value="ACTIVE">{t('statusActive')}</option>
            <option value="INACTIVE">{t('statusInactive')}</option>
            <option value="GRADUATED">{t('statusGraduated')}</option>
            <option value="WITHDRAWN">{t('statusWithdrawn')}</option>
          </select>

          <select
            className="filter-select"
            value={genderFilter}
            onChange={(e) => {
              setGenderFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">{isRtl ? 'كافة الفئات' : 'All Genders'}</option>
            <option value="MALE">{t('male')}</option>
            <option value="FEMALE">{t('female')}</option>
          </select>

          <select
            className="filter-select"
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{isRtl ? 'كافة الصفوف' : 'All Classes'}</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: 8, marginInlineStart: 'auto' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleExport} title={t('exportExcel')}>
              <DownloadIcon /> {t('exportExcel')}
            </button>

            {canManageStudents && (
              <>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsBulkCertificatesOpen(true)}
                  style={{ color: '#059669', borderColor: '#a7f3d0' }}
                  title={isRtl ? 'طباعة الشهادات المجمعة' : 'Bulk Certificates'}
                >
                  📜 {isRtl ? 'الشهادات المجمعة' : 'Bulk Certificates'}
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsImportModalOpen(true)}
                  title={t('importExcel')}
                >
                  <UploadIcon /> {t('importExcel')}
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setEditingStudent(null);
                    setIsAddModalOpen(true);
                  }}
                >
                  <PlusIcon /> {t('addStudent')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={loadStudents} />}

      {/* Main Table */}
      <div className="panel">
        <div className="table-responsive">
          {loading ? (
            <PageLoader text={t('loading')} />
          ) : students.length === 0 ? (
            <EmptyState
              title={t('noDataFound')}
              description={isRtl ? 'جرب تغيير شروط البحث أو الفلاتر' : 'Try adjusting your search criteria.'}
              actionText={canManageStudents ? t('addStudent') : null}
              onAction={() => {
                setEditingStudent(null);
                setIsAddModalOpen(true);
              }}
            />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>{t('studentNumber')}</th>
                  <th>{t('fullName')}</th>
                  <th>{t('gender')}</th>
                  <th>{t('className')}</th>
                  <th>{t('parentName')}</th>
                  <th>{t('parentPhone')}</th>
                  <th>{t('status')}</th>
                  <th style={{ textAlign: isRtl ? 'left' : 'right' }}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <span
                        style={{
                          fontWeight: 800,
                          color: 'var(--primary)',
                          background: 'var(--primary-light)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontSize: 12
                        }}
                        onClick={() => onViewStudent(s.id)}
                      >
                        {s.studentNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <UserAvatar
                          src={s.photoUrl || s.avatar}
                          name={`${s.firstName} ${s.lastName}`}
                          role="STUDENT"
                          gender={s.gender}
                          size={34}
                          showRoleBadge={false}
                        />
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          {s.firstName} {s.middleName ? s.middleName + ' ' : ''}{s.lastName}
                        </span>
                      </div>
                    </td>
                    <td>
                      {s.gender === 'MALE' ? t('male') : s.gender === 'FEMALE' ? t('female') : '—'}
                    </td>
                    <td>
                      <span style={{
                        background: '#f1f5f9',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600,
                        fontSize: 12
                      }}>
                        {s.currentClass || '—'}
                      </span>
                    </td>
                    <td>{s.parentName || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{s.parentPhone || '—'}</td>
                    <td>
                      <Badge status={s.status} />
                    </td>
                    <td style={{ textAlign: isRtl ? 'left' : 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          className="btn btn-secondary btn-icon"
                          title={t('view')}
                          onClick={() => onViewStudent(s.id)}
                        >
                          <EyeIcon />
                        </button>
                        {canManageStudents && (
                          <>
                            <button
                              className="btn btn-secondary btn-icon"
                              title={t('edit')}
                              onClick={() => {
                                setEditingStudent(s);
                                setIsAddModalOpen(true);
                              }}
                            >
                              <EditIcon />
                            </button>
                            {s.status === 'ACTIVE' && (
                              <button
                                className="btn btn-secondary btn-icon"
                                title={t('delete')}
                                onClick={() => setDeactivatingStudent(s)}
                                style={{ color: 'var(--danger)' }}
                              >
                                <TrashIcon />
                              </button>
                            )}
                          </>
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

      {/* Add / Edit Student Modal */}
      {canManageStudents && isAddModalOpen && (
        <AddEditStudentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          student={editingStudent}
          onSaved={loadStudents}
          classes={classes}
        />
      )}

      {/* Import Students Modal */}
      {canManageStudents && isImportModalOpen && (
        <ImportStudentsModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImported={loadStudents}
        />
      )}

      {/* Confirm Deactivate Dialog */}
      {canManageStudents && deactivatingStudent && (
        <ConfirmDialog
          isOpen={Boolean(deactivatingStudent)}
          onClose={() => setDeactivatingStudent(null)}
          onConfirm={handleDeactivate}
          title={isRtl ? 'تعطيل سجل الطالب' : 'Deactivate Student'}
          message={isRtl
            ? `هل أنت متأكد من تعطيل حساب الطالب ${deactivatingStudent.firstName} ${deactivatingStudent.lastName} (${deactivatingStudent.studentNumber})؟`
            : `Are you sure you want to deactivate ${deactivatingStudent.firstName} ${deactivatingStudent.lastName} (${deactivatingStudent.studentNumber})?`}
          confirmText={isRtl ? 'تعطيل' : 'Deactivate'}
          isDanger={true}
          loading={deactivatingLoading}
        />
      )}

      {/* Bulk Certificates Modal */}
      {canManageStudents && (
        <BulkCertificatesModal
          isOpen={isBulkCertificatesOpen}
          onClose={() => setIsBulkCertificatesOpen(false)}
          initialClassId={classFilter}
        />
      )}
    </div>
  );
}
