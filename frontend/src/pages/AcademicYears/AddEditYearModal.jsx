import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ErrorAlert from '../../components/common/ErrorAlert';

export default function AddEditYearModal({ isOpen, onClose, academicYear, onSaved }) {
  const toast = useToast();
  const isEdit = Boolean(academicYear && academicYear.id);

  const [formData, setFormData] = useState({
    name: '2026/2027',
    startDate: '2026-09-01',
    endDate: '2027-06-30',
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
        name: '2026/2027',
        startDate: '2026-09-01',
        endDate: '2027-06-30',
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
        toast.success('Academic year updated!');
      } else {
        await api.post('/academic-years', formData);
        toast.success('Academic year created!');
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
      title={isEdit ? `Edit Academic Year: ${academicYear.name}` : 'Add Academic Year'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Year'}
          </button>
        </>
      }
    >
      {error && <ErrorAlert message={error} />}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Academic Year Name <span className="req">*</span></label>
          <input
            type="text"
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. 2026/2027"
            required
          />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Start Date <span className="req">*</span></label>
            <input
              type="date"
              className="form-input"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">End Date <span className="req">*</span></label>
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
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
            Set as Current Active Academic Year
          </label>
        </div>
      </form>
    </Modal>
  );
}
