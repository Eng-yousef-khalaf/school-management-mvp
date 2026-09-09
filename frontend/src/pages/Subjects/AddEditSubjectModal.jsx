import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ErrorAlert from '../../components/common/ErrorAlert';

export default function AddEditSubjectModal({ isOpen, onClose, subject, onSaved }) {
  const toast = useToast();
  const isEdit = Boolean(subject && subject.id);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    active: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (subject) {
      setFormData({
        code: subject.code || '',
        name: subject.name || '',
        active: subject.active !== undefined ? subject.active : true
      });
    } else {
      setFormData({
        code: '',
        name: '',
        active: true
      });
    }
    setError('');
  }, [subject, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/subjects/${subject.id}`, formData);
        toast.success('Subject updated successfully!');
      } else {
        await api.post('/subjects', formData);
        toast.success('Subject added to curriculum!');
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save subject');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Subject: ${subject.name}` : 'Add Curriculum Subject'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Subject'}
          </button>
        </>
      }
    >
      {error && <ErrorAlert message={error} />}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Subject Code <span className="req">*</span></label>
          <input
            type="text"
            className="form-input"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="e.g. MATH, ENG, SCI"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Subject Name <span className="req">*</span></label>
          <input
            type="text"
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Mathematics, English Language"
            required
          />
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
            Active Subject in Curriculum
          </label>
        </div>
      </form>
    </Modal>
  );
}
