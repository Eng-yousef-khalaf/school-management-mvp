import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import ErrorAlert from '../../components/common/ErrorAlert';

export default function AddEditYearModal({ isOpen, onClose, academicYear, onSaved }) {
  const toast = useToast();
  const { t, isRtl } = useLanguage();
  const isEdit = Boolean(academicYear && academicYear.id);

  const [formData, setFormData] = useState({
    name: '2027/2028',
    startDate: '2027-09-01',
    endDate: '2028-06-30',
    active: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (academicYear) {
      setFormData({
        name: academicYear.name || '',
        startDate: academicYear.startDate ? academicYear.startDate.slice(0, 10) : '',
        endDate: academicYear.endDate ? academicYear.endDate.slice(0, 10) : '',
        active: Boolean(academicYear.active)
      });
    } else {
      setFormData({
        name: '2027/2028',
        startDate: '2027-09-01',
        endDate: '2028-06-30',
        active: false
      });
    }
    setError('');
  }, [academicYear, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/academic-years/${academicYear.id}`, formData);
        toast.success(isRtl ? 'تم تحديث بيانات السنة الدراسية!' : 'Academic year updated!');
      } else {
        await api.post('/academic-years', formData);
        toast.success(isRtl ? 'تم إنشاء السنة الدراسية بنجاح!' : 'Academic year created!');
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save academic year');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? (isRtl ? `تعديل السنة الدراسية: ${academicYear.name}` : `Edit Academic Year: ${academicYear.name}`) : (isRtl ? 'إضافة سنة دراسية جديدة' : 'Add Academic Year')}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            {isRtl ? 'إلغاء' : 'Cancel'}
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : isEdit ? (isRtl ? 'حفظ التعديلات' : 'Save Changes') : (isRtl ? 'إنشاء السنة الدراسية' : 'Create Year')}
          </button>
        </>
      }
    >
      {error && <ErrorAlert message={error} />}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">{isRtl ? 'مسمى السنة الدراسية' : 'Academic Year Name'} <span className="req">*</span></label>
          <input
            type="text"
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. 2027/2028"
            required
          />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">{isRtl ? 'تاريخ بداية العام الدراسي' : 'Start Date'} <span className="req">*</span></label>
            <input
              type="date"
              className="form-input"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{isRtl ? 'تاريخ نهاية العام الدراسي' : 'End Date'} <span className="req">*</span></label>
            <input
              type="date"
              className="form-input"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
            />
            <span>{isRtl ? 'تعيين كعام دراسي نشط وبدء الترحيل السنوي' : 'Set as Current Active Academic Year'}</span>
          </label>
        </div>

        {formData.active && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginTop: 10,
            fontSize: 12,
            color: '#92400e',
            lineHeight: 1.5
          }}>
            ⚠️ {isRtl
              ? 'ملاحظة هامة: تفعيل هذا العام سيقوم بأرشفة بيانات وسجلات العام السابق بأمان، وإيقاف حسابات المعلمين مؤقتاً لتتمكن من اختيار وتجديد المعلمين المستمرين للعام الجديد عبر النافذة المخصصة.'
              : 'Important: Setting this year active will archive previous year data and pause teacher accounts pending rollover selection.'}
          </div>
        )}
      </form>
    </Modal>
  );
}
