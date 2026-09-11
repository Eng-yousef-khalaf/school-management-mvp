import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ErrorAlert from '../../components/common/ErrorAlert';

export default function AddEditUserModal({ isOpen, onClose, targetUser, onSaved, teachers = [] }) {
  const toast = useToast();
  const isEdit = Boolean(targetUser && targetUser.id);

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    role: 'STAFF',
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
        active: targetUser.active !== undefined ? targetUser.active : true,
        teacherId: targetUser.teacherId || ''
      });
    } else {
      setFormData({
        email: '',
        fullName: '',
        password: 'ChangeMe123!',
        role: 'STAFF',
        active: true,
        teacherId: ''
      });
    }
    setError('');
  }, [targetUser, isOpen]);

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
