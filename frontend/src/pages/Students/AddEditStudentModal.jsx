import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import ErrorAlert from '../../components/common/ErrorAlert';
import UserAvatar from '../../components/common/UserAvatar';
import { compressImageFile } from '../../utils/imageCompressor';

export default function AddEditStudentModal({ isOpen, onClose, student, onSaved, classes = [] }) {
  const toast = useToast();
  const { user, isSuperAdmin } = useAuth();
  const isEdit = Boolean(student && student.id);

  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    studentNumber: '',
    nationalId: '',
    branchId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    gender: 'MALE',
    dateOfBirth: '',
    phone: '',
    parentName: '',
    parentPhone: '',
    address: '',
    status: 'ACTIVE',
    classId: '',
    photoUrl: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load branches for Super Admin or branch assignment
  useEffect(() => {
    if (isOpen) {
      api.get('/branches').then(res => {
        if (Array.isArray(res)) setBranches(res);
      }).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (student) {
      setFormData({
        studentNumber: student.studentNumber || '',
        nationalId: student.nationalId || '',
        branchId: student.branchId || student.branch?.id || user?.branchId || '',
        firstName: student.firstName || '',
        middleName: student.middleName || '',
        lastName: student.lastName || '',
        gender: student.gender || 'MALE',
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.slice(0, 10) : '',
        phone: student.phone || '',
        parentName: student.parentName || '',
        parentPhone: student.parentPhone || '',
        address: student.address || '',
        status: student.status || 'ACTIVE',
        classId: student.currentClassId || '',
        photoUrl: student.photoUrl || student.avatar || ''
      });
    } else {
      setFormData({
        studentNumber: `STU-2026-${Math.floor(100 + Math.random() * 900)}`,
        nationalId: '',
        branchId: user?.branchId || (branches[0]?.id || ''),
        firstName: '',
        middleName: '',
        lastName: '',
        gender: 'MALE',
        dateOfBirth: '2013-01-01',
        phone: '',
        parentName: '',
        parentPhone: '',
        address: '',
        status: 'ACTIVE',
        classId: classes[0]?.id || '',
        photoUrl: ''
      });
    }
    setError('');
  }, [student, classes, isOpen, user, branches]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 800, 800, 0.85);
      handleChange('photoUrl', dataUrl);
      toast.success('تم تحميل ومعالجة صورة الطالب بنجاح 📸');
    } catch (err) {
      console.error('Failed to compress student photo', err);
      toast.error('تعذر معالجة الصورة، يرجى اختيار ملف صورة صالح');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.nationalId && String(formData.nationalId).trim()) {
      const cleanId = String(formData.nationalId).trim();
      if (!/^\d{9}$/.test(cleanId)) {
        setError('رقم الهوية يجب أن يتكون من 9 أرقام بالضبط (مثال: 405123456)');
        return;
      }
    }

    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/students/${student.id}`, formData);
        toast.success('تم تحديث بيانات الطالب بنجاح!');
      } else {
        await api.post('/students', formData);
        toast.success('تم تسجيل الطالب بنجاح وحجز هويته!');
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'فشل في حفظ بيانات الطالب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `تعديل ملف الطالب: ${student.firstName} ${student.lastName}` : 'إضافة طالب جديد للنظام'}
      size="lg"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            إلغاء
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديلات' : 'تسجيل وحجز الطالب'}
          </button>
        </>
      }
    >
      {error && <ErrorAlert message={error} />}

      <form onSubmit={handleSubmit}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary)', marginBottom: 12 }}>
          1. الهوية الأكاديمية والرسمية للطالب
        </div>

        {/* National ID & Branch Row */}
        <div className="form-grid-2" style={{
          background: 'rgba(99, 102, 241, 0.04)',
          border: '1px dashed #c7d2fe',
          padding: '14px',
          borderRadius: '12px',
          marginBottom: '16px'
        }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label className="form-label" style={{ fontWeight: 800, color: '#1e293b', marginBottom: 0 }}>
                🪪 رقم الهوية الوطنية (9 أرقام) <span className="req">*</span>
              </label>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 6,
                background: formData.nationalId?.length === 9 ? '#dcfce7' : '#fef3c7',
                color: formData.nationalId?.length === 9 ? '#15803d' : '#b45309'
              }}>
                {formData.nationalId?.length === 9 ? '🟢 مكتمل (9 أرقام)' : `🟡 ${formData.nationalId?.length || 0} / 9 أرقام`}
              </span>
            </div>
            <input
              type="text"
              maxLength={9}
              className="form-input"
              value={formData.nationalId}
              onChange={(e) => handleChange('nationalId', e.target.value.replace(/\D/g, ''))}
              placeholder="مثال: 405123456"
              style={{ fontWeight: 700, letterSpacing: '2px', fontSize: '15px' }}
              required
            />
            <small style={{ fontSize: 11, color: '#64748b' }}>
              المعرف الأساسي لمنع التكرار وحجز قيد الطالب حتى في حال تشابه الأسماء
            </small>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontWeight: 800, color: '#1e293b' }}>
              🏫 الفرع المدرسي (School Branch)
            </label>
            {isSuperAdmin && branches.length > 0 ? (
              <select
                className="form-select"
                value={formData.branchId}
                onChange={(e) => handleChange('branchId', e.target.value)}
              >
                <option value="">-- اختر الفرع --</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city || 'غزة'})
                  </option>
                ))}
              </select>
            ) : (
              <div style={{
                padding: '9px 12px',
                background: '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontWeight: 700,
                color: '#334155',
                fontSize: 13
              }}>
                {user?.branch?.name || branches.find(b => b.id === Number(formData.branchId))?.name || 'الفرع الرئيسي'}
              </div>
            )}
            <small style={{ fontSize: 11, color: '#64748b' }}>
              الفرع التابع له قيد الطالب وكافة سجلاته
            </small>
          </div>
        </div>

        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">رقم القيد الأكاديمي <span className="req">*</span></label>
            <input
              type="text"
              className="form-input"
              value={formData.studentNumber}
              onChange={(e) => handleChange('studentNumber', e.target.value)}
              placeholder="e.g. STU-2026-001"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">حالة القيد</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="ACTIVE">نشط (ACTIVE)</option>
              <option value="INACTIVE">غير نشط (INACTIVE)</option>
              <option value="GRADUATED">متخرج (GRADUATED)</option>
              <option value="WITHDRAWN">منسحب (WITHDRAWN)</option>
            </select>
          </div>
          {!isEdit && (
            <div className="form-group">
              <label className="form-label">الصف والشعبة الأولية</label>
              <select
                className="form-select"
                value={formData.classId}
                onChange={(e) => handleChange('classId', e.target.value)}
              >
                <option value="">اختر الصف...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.academicYear?.name})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary)', margin: '16px 0 12px' }}>
          2. البيانات الشخصية والصورة الرسمية
        </div>

        {/* Student Photo Upload & Preview */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: '#f8fafc',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: 16
        }}>
          <UserAvatar
            src={formData.photoUrl}
            name={`${formData.firstName} ${formData.lastName}`}
            role="STUDENT"
            gender={formData.gender}
            size={56}
            showRoleBadge={true}
          />
          <div style={{ flex: 1 }}>
            <label className="form-label" style={{ marginBottom: 4, fontWeight: 700 }}>
              صورة الطالب الشخصية (Student Photo)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ fontSize: 12 }}
              />
              {formData.photoUrl && (
                <button
                  type="button"
                  onClick={() => handleChange('photoUrl', '')}
                  className="btn btn-sm"
                  style={{ color: '#ef4444', border: '1px solid #fecaca', background: '#fff', fontSize: 11 }}
                >
                  حذف الصورة
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">First Name <span className="req">*</span></label>
            <input
              type="text"
              className="form-input"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Middle Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.middleName}
              onChange={(e) => handleChange('middleName', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name <span className="req">*</span></label>
            <input
              type="text"
              className="form-input"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select
              className="form-select"
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              className="form-input"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Student Phone</label>
            <input
              type="text"
              className="form-input"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+962 7 9000 0000"
            />
          </div>
        </div>

        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary)', margin: '16px 0 12px' }}>
          3. Parent & Contact Details
        </div>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Parent / Guardian Full Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.parentName}
              onChange={(e) => handleChange('parentName', e.target.value)}
              placeholder="e.g. Ali Mansour"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Parent Phone Number</label>
            <input
              type="text"
              className="form-input"
              value={formData.parentPhone}
              onChange={(e) => handleChange('parentPhone', e.target.value)}
              placeholder="+962 7 8000 0000"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Residential Address</label>
          <input
            type="text"
            className="form-input"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="e.g. Amman, 7th Circle, Al-Madina St."
          />
        </div>
      </form>
    </Modal>
  );
}
