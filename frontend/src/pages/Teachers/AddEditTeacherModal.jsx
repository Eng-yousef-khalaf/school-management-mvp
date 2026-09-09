import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ErrorAlert from '../../components/common/ErrorAlert';

export default function AddEditTeacherModal({ isOpen, onClose, teacher, onSaved }) {
  const toast = useToast();
  const isEdit = Boolean(teacher && teacher.id);

  const [formData, setFormData] = useState({
    employeeNo: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    specialty: '',
    active: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (teacher) {
      setFormData({
        employeeNo: teacher.employeeNo || '',
        firstName: teacher.firstName || '',
        lastName: teacher.lastName || '',
        phone: teacher.phone || '',
        email: teacher.email || '',
        specialty: teacher.specialty || '',
        active: teacher.active !== undefined ? teacher.active : true
      });
    } else {
      setFormData({
        employeeNo: `TCH-${Math.floor(1000 + Math.random() * 9000)}`,
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        specialty: '',
        active: true
      });
    }
    setError('');
  }, [teacher, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/teachers/${teacher.id}`, formData);
        toast.success('Teacher updated successfully!');
      } else {
        await api.post('/teachers', formData);
        toast.success('Teacher added successfully!');
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save teacher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Faculty Member: ${teacher.firstName} ${teacher.lastName}` : 'Add New Teacher'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Teacher'}
          </button>
        </>
      }
    >
      {error && <ErrorAlert message={error} />}

      <form onSubmit={handleSubmit}>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Employee Number <span className="req">*</span></label>
            <input
              type="text"
              className="form-input"
              value={formData.employeeNo}
              onChange={(e) => handleChange('employeeNo', e.target.value)}
              placeholder="e.g. TCH-1001"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Specialty / Subject</label>
            <input
              type="text"
              className="form-input"
              value={formData.specialty}
              onChange={(e) => handleChange('specialty', e.target.value)}
              placeholder="e.g. Mathematics, Science"
            />
          </div>
        </div>

        <div className="form-grid-2">
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

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="teacher@school.local"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Phone</label>
            <input
              type="text"
              className="form-input"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+962 7 9000 0000"
            />
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => handleChange('active', e.target.checked)}
            />
            Active Faculty Member
          </label>
        </div>
      </form>
    </Modal>
  );
}
