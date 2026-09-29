import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ErrorAlert from '../../components/common/ErrorAlert';
import UserAvatar from '../../components/common/UserAvatar';

export default function AddEditUserModal({ isOpen, onClose, targetUser, onSaved, teachers = [] }) {
  const toast = useToast();
  const isEdit = Boolean(targetUser && targetUser.id);

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    role: 'STAFF',
    photoUrl: '',
    active: true,
    teacherId: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (targetUser) {
      setFormData({
        email: targetUser.email || '',
        fullName: targetUser.fullName || '',
        password: '',
        role: targetUser.role || 'STAFF',
        photoUrl: targetUser.photoUrl || '',
        active: targetUser.active !== undefined ? targetUser.active : true,
        teacherId: targetUser.teacherId || ''
      });
    } else {
      setFormData({
        email: '',
        fullName: '',
        password: 'ChangeMe123!',
        role: 'STAFF',
        photoUrl: '',
        active: true,
        teacherId: ''
      });
    }
    setError('');
  }, [targetUser, isOpen]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.warning('حجم الصورة كبير جداً، يرجى اختيار ملف أقل من 5 ميجابايت');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFormData((prev) => ({ ...prev, photoUrl: uploadEvent.target.result }));
      toast.success('تم تحميل صورة المستخدم بنجاح');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/users/${targetUser.id}`, formData);
        toast.success('User updated successfully!');
      } else {
        await api.post('/users', formData);
        toast.success('User created successfully!');
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save user account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit User: ${targetUser.fullName}` : 'Create New System User'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create User'}
          </button>
        </>
      }
    >
      {error && <ErrorAlert message={error} />}

      <form onSubmit={handleSubmit}>
        {/* Photo Upload Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: 'var(--bg-main, #f8fafc)',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid var(--border-color, #e2e8f0)',
          marginBottom: 16
        }}>
          <UserAvatar
            src={formData.photoUrl}
            name={formData.fullName}
            role={formData.role}
            size={56}
            showRoleBadge={true}
          />
          <div style={{ flex: 1 }}>
            <label className="form-label" style={{ marginBottom: 4, fontWeight: 700 }}>
              صورة المستخدم / الكادر الإداري
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
                  onClick={() => setFormData(p => ({ ...p, photoUrl: '' }))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  حذف الصورة
                </button>
              )}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted, #64748b)' }}>
              يتم حفظ الصورة بصورة دائمة وتظهر في كافة اللوحات والترويسة
            </span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Full Name <span className="req">*</span></label>
          <input
            type="text"
            className="form-input"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="e.g. John Doe"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address <span className="req">*</span></label>
          <input
            type="email"
            className="form-input"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="user@school.local"
            required
          />
        </div>

        {!isEdit && (
          <div className="form-group">
            <label className="form-label">Initial Password <span className="req">*</span></label>
            <input
              type="password"
              className="form-input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
              required
            />
          </div>
        )}

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Role Authorization <span className="req">*</span></label>
            <select
              className="form-select"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="ADMIN">ADMIN (المدير العام - Full System Access)</option>
              <option value="STAFF">STAFF (شؤون المعلمين والطلاب - Faculty & Student Affairs)</option>
              <option value="TEACHER">TEACHER (معلم - Class & Grade Ops)</option>
            </select>
          </div>

          {formData.role === 'TEACHER' && (
            <div className="form-group">
              <label className="form-label">Link to Teacher Profile</label>
              <select
                className="form-select"
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              >
                <option value="">Select Faculty Profile...</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName} ({t.employeeNo})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
            Account Active (Can log in)
          </label>
        </div>
      </form>
    </Modal>
  );
}
