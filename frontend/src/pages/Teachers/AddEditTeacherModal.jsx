import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import ErrorAlert from '../../components/common/ErrorAlert';
import { PlusIcon, TrashIcon } from '../../components/common/Icons';
import UserAvatar from '../../components/common/UserAvatar';

export default function AddEditTeacherModal({ isOpen, onClose, teacher, onSaved }) {
  const toast = useToast();
  const { isRtl } = useLanguage();
  const isEdit = Boolean(teacher && teacher.id);

  const [formData, setFormData] = useState({
    employeeNo: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    specialty: '',
    active: true,
    photoUrl: '',
    createUserAccount: false,
    userPassword: 'ChangeMe123!'
  });

  // Teaching Assignments state
  const [assignments, setAssignments] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [error, setError] = useState('');

  // Load dropdown catalogs
  useEffect(() => {
    if (!isOpen) return;

    const loadCatalogs = async () => {
      try {
        const [cls, subs] = await Promise.all([
          api.get('/classes'),
          api.get('/subjects')
        ]);
        setClassesList(cls || []);
        setSubjectsList(subs || []);
        if (cls && cls[0]) setSelectedClassId(String(cls[0].id));
        if (subs && subs[0]) setSelectedSubjectId(String(subs[0].id));
      } catch (err) {
        console.error('Failed to load classes and subjects catalog', err);
      }
    };

    loadCatalogs();
  }, [isOpen]);

  // Load teacher details on edit or reset on create
  useEffect(() => {
    if (!isOpen) return;

    if (teacher && teacher.id) {
      setFormData({
        employeeNo: teacher.employeeNo || '',
        firstName: teacher.firstName || '',
        lastName: teacher.lastName || '',
        phone: teacher.phone || '',
        email: teacher.email || '',
        specialty: teacher.specialty || '',
        active: teacher.active !== undefined ? teacher.active : true,
        photoUrl: teacher.photoUrl || '',
        createUserAccount: false,
        userPassword: 'ChangeMe123!'
      });

      // Fetch teacher's full assignments
      setFetchingDetails(true);
      api.get(`/teachers/${teacher.id}`)
        .then(fullTeacher => {
          if (fullTeacher && fullTeacher.assignments) {
            setAssignments(fullTeacher.assignments.map(a => ({
              classId: a.classId,
              className: a.className,
              subjectId: a.subjectId,
              subjectName: a.subjectName,
              subjectCode: a.subjectCode
            })));
          } else {
            setAssignments([]);
          }
        })
        .catch(() => setAssignments([]))
        .finally(() => setFetchingDetails(false));
    } else {
      setFormData({
        employeeNo: `TCH-${Math.floor(1000 + Math.random() * 9000)}`,
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        specialty: '',
        active: true,
        photoUrl: '',
        createUserAccount: true,
        userPassword: 'ChangeMe123!'
      });
      setAssignments([]);
    }
    setError('');
  }, [teacher, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.warning(isRtl ? 'حجم الصورة كبير جداً، يفضل اختيار صورة أقل من 2 ميجابايت' : 'Image is too large (max 2MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      handleChange('photoUrl', event.target.result);
      toast.success(isRtl ? 'تم تحميل صورة المعلم بنجاح' : 'Teacher photo uploaded successfully');
    };
    reader.readAsDataURL(file);
  };

  // Add Assignment Pair
  const handleAddAssignment = () => {
    if (!selectedClassId || !selectedSubjectId) {
      toast.warning(isRtl ? 'يرجى اختيار الصف والمادة أولاً' : 'Please select both class and subject');
      return;
    }

    const cId = Number(selectedClassId);
    const sId = Number(selectedSubjectId);

    // Duplicate check
    const exists = assignments.some(a => a.classId === cId && a.subjectId === sId);
    if (exists) {
      toast.warning(isRtl ? 'هذا التعيين (الصف والمادة) مضاف مسبقاً لهذا المعلم' : 'This class and subject is already assigned');
      return;
    }

    const foundClass = classesList.find(c => c.id === cId);
    const foundSubject = subjectsList.find(s => s.id === sId);

    setAssignments(prev => [
      ...prev,
      {
        classId: cId,
        className: foundClass ? `${foundClass.name} ${foundClass.section ? `(${foundClass.section})` : ''}` : `Class #${cId}`,
        subjectId: sId,
        subjectName: foundSubject ? foundSubject.name : `Subject #${sId}`,
        subjectCode: foundSubject?.code || ''
      }
    ]);
  };

  // Remove Assignment Pair
  const handleRemoveAssignment = (index) => {
    setAssignments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        assignments: assignments.map(a => ({
          classId: a.classId,
          subjectId: a.subjectId
        }))
      };

      if (isEdit) {
        await api.put(`/teachers/${teacher.id}`, payload);
        toast.success(isRtl ? 'تم تحديث بيانات وتعيينات المعلم بنجاح!' : 'Teacher updated successfully!');
      } else {
        await api.post('/teachers', payload);
        toast.success(isRtl ? 'تمت إضافة المعلم بنجاح!' : 'Teacher added successfully!');
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
      title={
        isEdit
          ? (isRtl ? `تعديل بيانات وتعيينات المعلم: ${teacher.firstName} ${teacher.lastName}` : `Edit Faculty Member: ${teacher.firstName} ${teacher.lastName}`)
          : (isRtl ? 'إضافة معلم جديد وتحديد الشعب والمواد' : 'Register New Faculty Member')
      }
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            {isRtl ? 'إلغاء' : 'Cancel'}
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : isEdit ? (isRtl ? 'حفظ التعديلات' : 'Save Changes') : (isRtl ? 'اعتماد وتسجيل المعلم' : 'Create Teacher')}
          </button>
        </>
      }
    >
      {error && <ErrorAlert message={error} />}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Basic Info Section */}
        <div style={{ background: 'var(--bg-main)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>
            📋 {isRtl ? 'البيانات الأساسية والوظيفية' : 'Personal & Employment Details'}
          </h4>

          {/* Teacher Photo Upload & Preview */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: 'var(--card-bg, #ffffff)',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            marginBottom: 16
          }}>
            <UserAvatar
              src={formData.photoUrl}
              name={`${formData.firstName} ${formData.lastName}`}
              role="TEACHER"
              size={56}
              showRoleBadge={true}
            />
            <div style={{ flex: 1 }}>
              <label className="form-label" style={{ marginBottom: 4, fontWeight: 700 }}>
                {isRtl ? 'صورة المعلم الشخصية (اختياري)' : 'Teacher Profile Photo (Optional)'}
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
                    {isRtl ? 'حذف الصورة' : 'Remove Photo'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">{isRtl ? 'الرقم الوظيفي' : 'Employee Number'} <span className="req">*</span></label>
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
              <label className="form-label">{isRtl ? 'التخصص الرئيسي' : 'Specialty / Field'}</label>
              <input
                type="text"
                className="form-input"
                value={formData.specialty}
                onChange={(e) => handleChange('specialty', e.target.value)}
                placeholder={isRtl ? 'مثال: رياضيات، علوم، لغة عربية' : 'e.g. Mathematics, Science'}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">{isRtl ? 'الاسم الأول' : 'First Name'} <span className="req">*</span></label>
              <input
                type="text"
                className="form-input"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">{isRtl ? 'اسم العائلة' : 'Last Name'} <span className="req">*</span></label>
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
              <label className="form-label">{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="teacher@school.local"
              />
            </div>
            <div className="form-group">
              <label className="form-label">{isRtl ? 'رقم الهاتف' : 'Contact Phone'}</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+962 7 9000 0000"
              />
            </div>
          </div>
        </div>

        {/* Teaching Assignments Section (المواد والشعب المخصصة) */}
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                📚 {isRtl ? 'التعيينات التدريسية (تحديد المواد والصفوف/الشعب)' : 'Teaching Allocations (Subjects & Classes)'}
              </h4>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                {isRtl
                  ? 'حدد المواد والشعب التي سيدرّسها المعلم. يمكن للمدير حفظ المعلم الآن وتكليف شؤون المعلمين والطلاب باستكمال الشعب لاحقاً.'
                  : 'Specify which subjects and class sections this teacher is assigned to teach.'}
              </p>
            </div>
            <span className="badge" style={{ background: '#e2e8f0', color: '#334155', fontWeight: 700 }}>
              {assignments.length} {isRtl ? 'شعب/مواد مخصصة' : 'Assignments'}
            </span>
          </div>

          {/* Selector Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end', marginBottom: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 12 }}>{isRtl ? 'اختر المادة الدراسية' : 'Select Subject'}</label>
              <select
                className="form-select"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
              >
                {subjectsList.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 12 }}>{isRtl ? 'اختر الصف والشعبة' : 'Select Class & Section'}</label>
              <select
                className="form-select"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                {classesList.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.section ? `- شعبة (${c.section})` : ''} [{c.grade}]</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddAssignment}
              style={{ height: 38, padding: '0 14px', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
            >
              <PlusIcon /> {isRtl ? 'إضافة الشعبة' : 'Add'}
            </button>
          </div>

          {/* Current Assignments List */}
          {fetchingDetails ? (
            <div style={{ padding: 12, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
              {isRtl ? 'جاري تحميل التعيينات الحالية...' : 'Loading assignments...'}
            </div>
          ) : assignments.length === 0 ? (
            <div style={{
              padding: '14px',
              textAlign: 'center',
              borderRadius: 'var(--radius-sm)',
              background: '#fff',
              border: '1px dashed #cbd5e1',
              color: 'var(--text-muted)',
              fontSize: 13
            }}>
              {isRtl
                ? 'لم يتم تحديد شعب أو مواد بعد (سيظهر تنبيه لشؤون المعلمين والطلاب لاستكمال التعيين).'
                : 'No classes assigned yet (Staff can complete allocation later).'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto', background: '#fff', padding: 8, borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
              {assignments.map((item, idx) => (
                <div
                  key={`${item.classId}-${item.subjectId}-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#f8fafc',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    fontSize: 13
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>📖 {item.subjectName}</span>
                    <span style={{ color: '#94a3b8' }}>➔</span>
                    <span style={{ fontWeight: 600, color: '#334155' }}>🏫 {item.className}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAssignment(idx)}
                    style={{
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: 4,
                      padding: '3px 8px',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                    title={isRtl ? 'حذف هذا التعيين' : 'Remove Assignment'}
                  >
                    ✕ {isRtl ? 'إزالة' : 'Remove'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Account & Login Link Section */}
        {!isEdit && (
          <div style={{ background: '#f0fdf4', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#166534' }}>
              <input
                type="checkbox"
                checked={formData.createUserAccount}
                onChange={(e) => handleChange('createUserAccount', e.target.checked)}
              />
              🔑 {isRtl ? 'إنشاء حساب مستخدم للمعلم فوراً (ربط Faculty Link تلقائياً)' : 'Create User Login Account & Link Automatically'}
            </label>
            {formData.createUserAccount && (
              <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="form-label" style={{ fontSize: 11 }}>{isRtl ? 'البريد المستخدم للدخول' : 'Login Email'}</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="teacher@school.local"
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: 11 }}>{isRtl ? 'كلمة المرور الافتراضية' : 'Default Password'}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.userPassword}
                    onChange={(e) => handleChange('userPassword', e.target.value)}
                    placeholder="ChangeMe123!"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => handleChange('active', e.target.checked)}
            />
            {isRtl ? 'معلم نشط في الهيئة التدريسية' : 'Active Faculty Member'}
          </label>
        </div>
      </form>
    </Modal>
  );
}
