import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { PlusIcon, TrashIcon, EditIcon } from '../../components/common/Icons';
import UserAvatar from '../../components/common/UserAvatar';

export default function TeacherDetails({ teacherId, onBack, onEdit }) {
  const toast = useToast();
  const { isStaff, isAdmin } = useAuth();
  const { t, isRtl } = useLanguage();

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Assign Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const loadTeacher = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get(`/teachers/${teacherId}`);
      setTeacher(data);
    } catch (err) {
      setError(err.message || 'Failed to load teacher profile');
    } finally {
      setLoading(false);
    }
  };

  const loadDropdowns = async () => {
    try {
      const [cls, subs] = await Promise.all([
        api.get('/classes'),
        api.get('/subjects')
      ]);
      setClasses(cls || []);
      setSubjects(subs || []);
      if (cls && cls[0]) setSelectedClassId(String(cls[0].id));
      if (subs && subs[0]) setSelectedSubjectId(String(subs[0].id));
    } catch {}
  };

  useEffect(() => {
    if (teacherId) {
      loadTeacher();
      loadDropdowns();
    }
  }, [teacherId]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedClassId || !selectedSubjectId) {
      toast.error(isRtl ? 'يرجى اختيار الصف والمادة أولاً' : 'Please select both a class and a subject');
      return;
    }

    setAssigning(true);
    try {
      await api.post('/teachers/assign', {
        teacherId: teacher.id,
        classId: Number(selectedClassId),
        subjectId: Number(selectedSubjectId)
      });
      toast.success(isRtl ? 'تمت إضافة التعيين بنجاح!' : 'Teaching assignment added successfully!');
      setIsAssignModalOpen(false);
      loadTeacher();
    } catch (err) {
      toast.error(err.message || 'Failed to assign class & subject');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAssignment = async (linkId) => {
    try {
      await api.delete(`/teachers/assign/${linkId}`);
      toast.success(isRtl ? 'تم حذف التعيين بنجاح' : 'Assignment removed');
      loadTeacher();
    } catch (err) {
      toast.error(err.message || 'Failed to remove assignment');
    }
  };

  const handleQuickPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.warning(isRtl ? 'حجم الصورة كبير جداً، يرجى اختيار ملف أقل من 5 ميجابايت' : 'Image is too large (max 5MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (uploadEvent) => {
      const dataUrl = uploadEvent.target.result;
      try {
        await api.put(`/teachers/${teacher.id}`, { photoUrl: dataUrl });
        setTeacher(prev => ({ ...prev, photoUrl: dataUrl }));
        toast.success(isRtl ? 'تم حفظ وتحديث صورة المعلم بنجاح! 📸' : 'Teacher photo updated successfully!');
      } catch (err) {
        toast.error(err.message || (isRtl ? 'فشل تحديث الصورة' : 'Failed to update photo'));
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <PageLoader text={t('loading')} />;
  if (error) return <ErrorAlert message={error} onRetry={loadTeacher} />;
  if (!teacherId || !teacher) {
    return (
      <div className="panel" style={{ padding: 40, textAlign: 'center', margin: '20px 0' }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-muted)' }}>
          {isRtl ? 'لم يتم العثور على سجل المعلم أو تم مسح المعرف.' : 'No faculty record found.'}
        </p>
        <button className="btn btn-primary btn-sm" onClick={onBack} style={{ marginTop: 12 }}>
          {isRtl ? '← العودة لقائمة المعلمين' : '← Back to Teachers'}
        </button>
      </div>
    );
  }

  const canEdit = isStaff || isAdmin;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          {isRtl ? '← العودة لقائمة المعلمين' : '← Back to Teachers'}
        </button>
        {canEdit && (
          <button className="btn btn-primary btn-sm" onClick={() => onEdit(teacher)}>
            <EditIcon /> {isRtl ? 'تعديل بيانات وتعيينات المعلم' : 'Edit Faculty Profile'}
          </button>
        )}
      </div>

      {/* Header Profile Panel */}
      <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <UserAvatar
              src={teacher.photoUrl}
              name={`${teacher.firstName} ${teacher.lastName}`}
              role="TEACHER"
              size={78}
              showRoleBadge={true}
            />
            {canEdit && (
              <label style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--primary)',
                cursor: 'pointer',
                padding: '3px 8px',
                background: 'var(--bg-main)',
                borderRadius: 12,
                border: '1px solid var(--border-color)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }} title={isRtl ? 'رفع أو تحديث صورة المعلم' : 'Upload teacher photo'}>
                <span>📷 {isRtl ? (teacher.photoUrl ? 'تحديث الصورة' : 'إرفاق صورة') : 'Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQuickPhotoUpload}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {teacher.firstName} {teacher.lastName}
              </h2>
              <Badge status={teacher.active ? 'ACTIVE' : 'INACTIVE'} />
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                {isRtl ? 'الرقم الوظيفي:' : 'Employee No:'} <strong>{teacher.employeeNo}</strong>
              </span>
              {teacher.user && (
                <span className="badge badge-active" style={{ fontSize: 12 }}>
                  ✓ {isRtl ? 'حساب نظام مفعل' : 'System User Linked'}
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
              {isRtl ? 'التخصص:' : 'Specialty:'} <strong>{teacher.specialty || 'General'}</strong> • {isRtl ? 'البريد:' : 'Email:'} <strong>{teacher.email || '—'}</strong> • {isRtl ? 'الهاتف:' : 'Phone:'} <strong>{teacher.phone || '—'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Teaching Assignments Table */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
              📚 {isRtl ? 'الشعب والمواد المسندة للمعلم' : 'Class & Subject Assignments'}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              {isRtl ? 'قائمة الفصول والشعب والمناهج التي يدرّسها المعلم حالياً' : 'Classes and curriculum subjects assigned to this teacher'}
            </p>
          </div>
          {canEdit && (
            <button className="btn btn-primary btn-sm" onClick={() => setIsAssignModalOpen(true)}>
              <PlusIcon /> {isRtl ? 'إسناد شعبة ومادة جديدة' : 'Assign Class & Subject'}
            </button>
          )}
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>{isRtl ? 'الصف والشعبة' : 'Class Section'}</th>
                <th>{isRtl ? 'المرحلة / الصف' : 'Grade'}</th>
                <th>{isRtl ? 'العام الدراسي' : 'Academic Year'}</th>
                <th>{isRtl ? 'المادة الدراسية' : 'Curriculum Subject'}</th>
                <th>{isRtl ? 'رمز المادة' : 'Subject Code'}</th>
                {canEdit && <th style={{ textAlign: 'right' }}>{isRtl ? 'الإجراءات' : 'Actions'}</th>}
              </tr>
            </thead>
            <tbody>
              {teacher.assignments && teacher.assignments.length > 0 ? (
                teacher.assignments.map((asg) => (
                  <tr key={asg.id}>
                    <td><strong>{asg.className}</strong></td>
                    <td>{asg.grade}</td>
                    <td>{asg.academicYear || '—'}</td>
                    <td><strong style={{ color: 'var(--primary)' }}>{asg.subjectName}</strong></td>
                    <td><code>{asg.subjectCode}</code></td>
                    {canEdit && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-icon"
                          title={isRtl ? 'حذف التعيين' : 'Remove assignment'}
                          onClick={() => handleRemoveAssignment(asg.id)}
                          style={{ color: 'var(--danger)' }}
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>
                    {isRtl ? 'لا توجد شعب أو مواد مسندة لهذا المعلم بعد' : 'No teaching assignments yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Assign Modal */}
      {isAssignModalOpen && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={isRtl ? `إسناد شعبة ومادة للمعلم: ${teacher.firstName} ${teacher.lastName}` : 'Assign Class & Subject'}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setIsAssignModalOpen(false)} disabled={assigning}>
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button className="btn btn-primary" onClick={handleAssign} disabled={assigning}>
                {assigning ? (isRtl ? 'جاري الإسناد...' : 'Assigning...') : (isRtl ? 'تأكيد الإسناد' : 'Confirm Assignment')}
              </button>
            </>
          }
        >
          <form onSubmit={handleAssign}>
            <div className="form-group">
              <label className="form-label">{isRtl ? 'الصف والشعبة' : 'Class Section'} <span className="req">*</span></label>
              <select
                className="form-select"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                required
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.section ? `- شعبة (${c.section})` : ''} [{c.grade}]
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{isRtl ? 'المادة الدراسية' : 'Curriculum Subject'} <span className="req">*</span></label>
              <select
                className="form-select"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                required
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
