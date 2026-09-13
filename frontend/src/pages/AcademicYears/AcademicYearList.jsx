import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import AddEditYearModal from './AddEditYearModal';
import TeacherRolloverModal from '../Teachers/TeacherRolloverModal';
import { PlusIcon, EditIcon, CheckIcon } from '../../components/common/Icons';

export default function AcademicYearList() {
  const toast = useToast();
  const { isStaff, isAdmin, canManageAcademicYears } = useAuth();
  const { t, isRtl } = useLanguage();
  const { setViewingYearId } = useAcademicYear();
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRolloverOpen, setIsRolloverOpen] = useState(false);
  const [editingYear, setEditingYear] = useState(null);

  const canManage = canManageAcademicYears ?? isAdmin;

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
      toast.success(
        isRtl
          ? 'تم تفعيل العام الدراسي الجديد وأرشفة العام السابق بنجاح! يمكنك الآن تجديد وتفعيل المعلمين.'
          : 'New academic year activated! Previous year data archived.'
      );
      await loadYears();
      setIsRolloverOpen(true);
    } catch (err) {
      toast.error(err.message || 'Failed to activate academic year');
    }
  };

  return (
    <div>
      {/* Top Header Card */}
      <div className="panel" style={{ padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
              📅 {isRtl ? 'إدارة وتقويم السنوات والسنوات الدراسية' : 'Academic Years & Calendar Management'}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              {isRtl
                ? 'تهيئة الفترات الدراسية، أرشفة بيانات السنوات السابقة تلقائياً، وتفعيل العام الجديد'
                : 'Configure academic sessions, archive historic records, and activate current enrollment year'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {isAdmin && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsRolloverOpen(true)}
                style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#047857', borderColor: '#10b981', fontWeight: 700 }}
              >
                ✨ {isRtl ? 'تجديد وتفعيل المعلمين للعام الجديد' : 'Reactivate Faculty'}
              </button>
            )}
            {canManage && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setEditingYear(null);
                  setIsModalOpen(true);
                }}
              >
                <PlusIcon /> {isRtl ? 'إضافة سنة دراسية جديدة' : 'Add Academic Year'}
              </button>
            )}
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={loadYears} />}

      {/* Main Years Table */}
      <div className="panel">
        <div className="table-responsive">
          {loading ? (
            <PageLoader text={isRtl ? 'جاري جلب السنوات الدراسية...' : 'Loading academic years...'} />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>{isRtl ? 'السنة الدراسية' : 'Academic Year'}</th>
                  <th>{isRtl ? 'تاريخ البدء' : 'Start Date'}</th>
                  <th>{isRtl ? 'تاريخ الانتهاء' : 'End Date'}</th>
                  <th>{isRtl ? 'الصفوف والشعب' : 'Class Sections'}</th>
                  <th>{isRtl ? 'إجمالي الطلاب' : 'Enrollments'}</th>
                  <th>{isRtl ? 'الحالة والأرشفة' : 'Active Status'}</th>
                  {canManage && <th style={{ textAlign: 'right' }}>{isRtl ? 'الإجراءات' : 'Actions'}</th>}
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
                    <td>{y._count?.classes || 0} {isRtl ? 'شعب' : 'Classes'}</td>
                    <td>{y._count?.enrollments || 0} {isRtl ? 'طلاب' : 'Students'}</td>
                    <td>
                      {y.active ? (
                        <span className="badge badge-active" style={{ fontWeight: 800 }}>
                          <CheckIcon /> {isRtl ? 'العام الدراسي النشط حالياً' : 'Current Active Year'}
                        </span>
                      ) : (
                        <span className="badge" style={{ background: '#f1f5f9', color: 'var(--text-muted)' }}>
                          📁 {isRtl ? 'مؤرشف وسجلاته محفوظة' : 'Archived (Preserved)'}
                        </span>
                      )}
                    </td>
                    {canManage && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {!y.active && isAdmin && (
                            <button
                              className="btn btn-sm"
                              onClick={() => setViewingYearId(y.id)}
                              style={{ background: '#f59e0b', color: '#fff', fontWeight: 700, fontSize: 12, padding: '4px 10px', border: 'none' }}
                              title={isRtl ? 'استعراض بيانات وصفحات هذا العام دون تفعيله (للقراءة فقط)' : 'Review archived data without activating'}
                            >
                              🔍 {isRtl ? 'مراجعة الأرشيف' : 'Review Archive'}
                            </button>
                          )}
                          {!y.active && isAdmin && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleSetActive(y.id)}
                              style={{ color: 'var(--primary)', borderColor: 'var(--primary)', fontWeight: 700, fontSize: 12 }}
                            >
                              {isRtl ? 'تفعيل كعام نشط' : 'Set as Active'}
                            </button>
                          )}
                          <button
                            className="btn btn-secondary btn-icon"
                            title={isRtl ? 'تعديل التواريخ' : 'Edit Year'}
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
          onSaved={() => {
            loadYears();
            setIsRolloverOpen(true);
          }}
        />
      )}

      {isRolloverOpen && (
        <TeacherRolloverModal
          isOpen={isRolloverOpen}
          onClose={() => setIsRolloverOpen(false)}
          onSaved={loadYears}
        />
      )}
    </div>
  );
}
