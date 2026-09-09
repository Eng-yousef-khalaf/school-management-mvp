import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ErrorAlert from '../../components/common/ErrorAlert';

export default function AddEditClassModal({ isOpen, onClose, schoolClass, onSaved, academicYears = [] }) {
  const toast = useToast();
  const isEdit = Boolean(schoolClass && schoolClass.id);

  const [formData, setFormData] = useState({
    name: '',
    grade: '7',
    section: 'A',
    academicYearId: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (schoolClass) {
      setFormData({
        name: schoolClass.name || '',
        grade: schoolClass.grade || '7',
        section: schoolClass.section || 'A',
        academicYearId: schoolClass.academicYearId || ''
      });
    } else {
      const activeYear = academicYears.find(y => y.active) || academicYears[0];
      setFormData({
        name: 'Grade 7 A',
        grade: '7',
        section: 'A',
        academicYearId: activeYear ? activeYear.id : ''
      });
    }
    setError('');
  }, [schoolClass, academicYears, isOpen]);

  const handleGradeSectionChange = (grade, section) => {
    setFormData(prev => ({
      ...prev,
      grade,
      section,
      name: `Grade ${grade} ${section}`.trim()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/classes/${schoolClass.id}`, formData);
        toast.success('Class updated successfully!');
      } else {
        await api.post('/classes', formData);
        toast.success('Class created successfully!');
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Class: ${schoolClass.name}` : 'Create New School Class'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Class'}
          </button>
        </>
      }
    >
      {error && <ErrorAlert message={error} />}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Academic Year <span className="req">*</span></label>
          <select
            className="form-select"
            value={formData.academicYearId}
            onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
            required
          >
            <option value="">Select Academic Year...</option>
            {academicYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name} {y.active ? '(Active)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Grade Level <span className="req">*</span></label>
            <input
              type="text"
              className="form-input"
              value={formData.grade}
              onChange={(e) => handleGradeSectionChange(e.target.value, formData.section)}
              placeholder="e.g. 7 or Grade 7"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Section</label>
            <input
              type="text"
              className="form-input"
              value={formData.section}
              onChange={(e) => handleGradeSectionChange(formData.grade, e.target.value)}
              placeholder="e.g. A, B, C"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Display Name <span className="req">*</span></label>
          <input
            type="text"
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Grade 7 A"
            required
          />
        </div>
      </form>
    </Modal>
  );
}
