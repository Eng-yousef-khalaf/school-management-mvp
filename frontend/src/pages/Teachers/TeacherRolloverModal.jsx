import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import Badge from '../../components/common/Badge';
import { SearchIcon, CheckIcon, TeachersIcon, UsersIcon } from '../../components/common/Icons';

export default function TeacherRolloverModal({ isOpen, onClose, onSaved }) {
  const toast = useToast();
  const { isRtl } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [activeYear, setActiveYear] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);

  // Selection state
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');

  const loadPool = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get('/academic-years/teachers-pool');
      setActiveYear(data.activeYear);
      setTeachers(data.teachers || []);
      setStaffMembers(data.staffMembers || []);

      // Pre-select active teachers or all teachers by default
      const preSelectedTeachers = (data.teachers || []).filter(t => t.active).map(t => t.id);
      setSelectedTeacherIds(preSelectedTeachers.length > 0 ? preSelectedTeachers : (data.teachers || []).map(t => t.id));

      // Pre-select active staff members
      const preSelectedStaff = (data.staffMembers || []).filter(s => s.active).map(s => s.id);
      setSelectedStaffIds(preSelectedStaff.length > 0 ? preSelectedStaff : (data.staffMembers || []).map(s => s.id));
    } catch (err) {
      setError(err.message || 'Failed to load faculty pool');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPool();
    }
  }, [isOpen]);

  const toggleTeacher = (id) => {
    setSelectedTeacherIds(prev =>
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  const toggleStaff = (id) => {
    setSelectedStaffIds(prev =>
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  // Add new staff form state
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaffData, setNewStaffData] = useState({
    fullName: '',
    email: '',
    password: 'ChangeMe123!'
  });
  const [creatingStaff, setCreatingStaff] = useState(false);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!newStaffData.fullName.trim() || !newStaffData.email.trim()) {
      toast.warning(isRtl ? 'يرجى إدخال الاسم والبريد الإلكتروني' : 'Please provide name and email');
      return;
    }

    try {
      setCreatingStaff(true);
      const createdUser = await api.post('/users', {
        fullName: newStaffData.fullName.trim(),
        email: newStaffData.email.trim().toLowerCase(),
        password: newStaffData.password || 'ChangeMe123!',
        role: 'STAFF',
        active: true
      });

      toast.success(isRtl ? `تمت إضافة موظف شؤون الطلاب (${createdUser.fullName}) وتفعيله بنجاح!` : `Staff member ${createdUser.fullName} created!`);
      setStaffMembers(prev => [...prev, createdUser]);
      setSelectedStaffIds(prev => [...prev, createdUser.id]);
      setNewStaffData({ fullName: '', email: '', password: 'ChangeMe123!' });
      setIsAddingStaff(false);
    } catch (err) {
      toast.error(err.message || 'Failed to create staff member');
    } finally {
      setCreatingStaff(false);
    }
  };

  const handleSelectAllTeachers = () => {
    if (selectedTeacherIds.length === filteredTeachers.length) {
      setSelectedTeacherIds([]);
    } else {
      setSelectedTeacherIds(filteredTeachers.map(t => t.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedTeacherIds.length === 0 && selectedStaffIds.length === 0) {
      toast.warning(isRtl ? 'يرجى تحديد معلم واحد أو موظف شؤون طلاب على الأقل' : 'Please select at least one teacher or staff member');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await api.post('/academic-years/rollover-reactivate', {
        teacherIds: selectedTeacherIds,
        staffUserIds: selectedStaffIds
      });

      toast.success(
        isRtl
          ? `تم تجديد وتفعيل ${res.reactivatedTeachersCount} معلماً و ${res.reactivatedStaffCount} من شؤون المعلمين والطلاب بنجاح للعام الجديد!`
          : `Reactivated ${res.reactivatedTeachersCount} teachers and ${res.reactivatedStaffCount} staff members!`
      );

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reactivate selected faculty');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered teachers list
  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = !search.trim() ||
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.employeeNo.toLowerCase().includes(search.toLowerCase()) ||
      (t.email && t.email.toLowerCase().includes(search.toLowerCase()));

    const matchesSpecialty = specialtyFilter === 'ALL' || t.specialty === specialtyFilter;

    return matchesSearch && matchesSpecialty;
  });

  const specialties = ['ALL', ...new Set(teachers.map(t => t.specialty).filter(Boolean))];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>✨</span>
          <span>{isRtl ? 'تجديد وإعادة تفعيل المعلمين للعام الدراسي الجديد' : 'Reactivate Faculty for New Academic Year'}</span>
        </div>
      }
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
            <span>{isRtl ? 'تم تحديد:' : 'Selected:'} </span>
            <span style={{ color: 'var(--primary)', fontWeight: 800 }}>
              {selectedTeacherIds.length} {isRtl ? 'معلمين' : 'Teachers'}
            </span>
            {' • '}
            <span style={{ color: '#10b981', fontWeight: 800 }}>
              {selectedStaffIds.length} {isRtl ? 'شؤون طلاب ومعلمين' : 'Staff'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting || (selectedTeacherIds.length === 0 && selectedStaffIds.length === 0)}
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
              {submitting
                ? (isRtl ? 'جاري التفعيل...' : 'Reactivating...')
                : (isRtl ? '✓ تأكيد تجديد وتفعيل المحددين للعام الجديد' : '✓ Confirm & Activate for New Year')}
            </button>
          </div>
        </div>
      }
    >
      {error && <ErrorAlert message={error} />}

      {loading ? (
        <PageLoader text={isRtl ? 'جاري جلب سجلات الكادر التعليمي السابق...' : 'Loading faculty pool...'} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Active Year Info Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(124, 58, 237, 0.05))',
            border: '1px solid rgba(79, 70, 229, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>
                🏫 {isRtl ? `العام الدراسي النشط: ${activeYear?.name || 'غير محدد'}` : `Active Academic Year: ${activeYear?.name || 'None'}`}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                {isRtl
                  ? 'تم حفظ وأرشفة كافة بيانات العام السابق بالكامل. حدد موظفي شؤون الطلاب والمعلمين المستمرين للعام الجديد، أو أضف موظف شؤون طلاب جديد لتسليمه مهام التسكين.'
                  : 'All previous year data is fully archived. Select retained faculty & staff or create a new registrar to manage new section assignments.'}
              </p>
            </div>
            <span className="badge badge-active" style={{ fontSize: 13, padding: '6px 12px' }}>
              ✓ {isRtl ? 'العام الحالي' : 'Active Year'}
            </span>
          </div>

          {/* Section 1: Staff Members (Previous + Add New) */}
          <div className="panel" style={{ padding: 20, border: '1.5px solid #cbd5e1', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a' }}>
                  <UsersIcon />
                  <span>{isRtl ? '1. طاقم «شؤون المعلمين والطلاب» (Staff)' : '1. Faculty & Student Affairs Staff'}</span>
                </h4>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  {isRtl ? 'حدد موظف شؤون الطلاب القديم المراد تفعيله، أو أضف موظفاً جديداً:' : 'Select existing staff or register a new staff member:'}
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setIsAddingStaff(!isAddingStaff)}
                style={{ background: '#10b981', borderColor: '#10b981', fontWeight: 700 }}
              >
                {isAddingStaff ? (isRtl ? '✕ إغلاق النموذج' : '✕ Close') : (isRtl ? '➕ إضافة موظف جديد' : '➕ Add New Staff')}
              </button>
            </div>

            {/* Inline Add New Staff Form */}
            {isAddingStaff && (
              <div style={{
                background: '#fff',
                border: '2px solid #10b981',
                borderRadius: 'var(--radius-md)',
                padding: '16px 18px',
                marginBottom: 16,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
              }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#047857', marginBottom: 12 }}>
                  👤 {isRtl ? 'بيانات موظف شؤون المعلمين والطلاب الجديد:' : 'New Staff Account Details:'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: 12 }}>{isRtl ? 'الاسم الكامل' : 'Full Name'} *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={isRtl ? 'مثال: أسامة النجار' : 'e.g. Osama Al-Najjar'}
                      value={newStaffData.fullName}
                      onChange={(e) => setNewStaffData({ ...newStaffData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 12 }}>{isRtl ? 'البريد الإلكتروني' : 'Email'} *</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="osama.staff@school.local"
                      value={newStaffData.email}
                      onChange={(e) => setNewStaffData({ ...newStaffData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 12 }}>{isRtl ? 'كلمة المرور' : 'Password'}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newStaffData.password}
                      onChange={(e) => setNewStaffData({ ...newStaffData, password: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsAddingStaff(false)}
                    disabled={creatingStaff}
                  >
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleCreateStaff}
                    disabled={creatingStaff || !newStaffData.fullName || !newStaffData.email}
                    style={{ background: '#10b981', borderColor: '#10b981' }}
                  >
                    {creatingStaff ? (isRtl ? 'جاري الإنشاء...' : 'Creating...') : (isRtl ? '✓ حفظ وتعيين للعام الجديد' : '✓ Create & Assign')}
                  </button>
                </div>
              </div>
            )}

            {/* List of Previous & Existing Staff */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
              {staffMembers.map((s) => {
                const isChecked = selectedStaffIds.includes(s.id);
                return (
                  <label
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      background: isChecked ? 'rgba(16, 185, 129, 0.08)' : '#fff',
                      border: `1.5px solid ${isChecked ? '#10b981' : '#e2e8f0'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: isChecked ? '0 2px 6px rgba(16, 185, 129, 0.2)' : 'none'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleStaff(s.id)}
                      style={{ width: 18, height: 18, accentColor: '#10b981' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{s.fullName}</span>
                        {isChecked && (
                          <span style={{ fontSize: 11, color: '#047857', fontWeight: 800 }}>✓ {isRtl ? 'معتمد' : 'Selected'}</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.email}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 2: Teachers Selection */}
          <div className="panel" style={{ padding: 18, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TeachersIcon />
                  <span>{isRtl ? '2. تحديد المعلمين السابقين المراد تجديدهم وتفعيلهم للعام الجديد' : '2. Select Teachers to Retain & Reactivate'}</span>
                </h4>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  {isRtl ? 'المعلمون المختارون ستُعاد حالة تعيينهم إلى "بانتظار استكمال الشعب والمواد" ليتم تسكينهم من قبل شؤون الطلاب.' : 'Selected teachers will be activated and flagged for new class/subject allocations.'}
                </p>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleSelectAllTeachers}
                style={{ fontWeight: 700 }}
              >
                {selectedTeacherIds.length === filteredTeachers.length
                  ? (isRtl ? 'إلغاء تحديد الكل' : 'Deselect All')
                  : (isRtl ? '✓ تحديد الكل' : '✓ Select All')}
              </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
                <SearchIcon className="search-icon" />
                <input
                  type="text"
                  placeholder={isRtl ? 'بحث بالاسم، الرقم الوظيفي، أو التخصص...' : 'Search by name, employee no...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="filter-select"
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                style={{ width: 180 }}
              >
                {specialties.map(spec => (
                  <option key={spec} value={spec}>
                    {spec === 'ALL' ? (isRtl ? 'كافة التخصصات' : 'All Specialties') : spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Teachers Table */}
            <div className="table-responsive" style={{ maxHeight: 340, overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>
                      <input
                        type="checkbox"
                        checked={filteredTeachers.length > 0 && selectedTeacherIds.length === filteredTeachers.length}
                        onChange={handleSelectAllTeachers}
                        style={{ width: 16, height: 16 }}
                      />
                    </th>
                    <th>{isRtl ? 'الرقم الوظيفي' : 'Employee No'}</th>
                    <th>{isRtl ? 'اسم المعلم' : 'Teacher Name'}</th>
                    <th>{isRtl ? 'التخصص' : 'Specialty'}</th>
                    <th>{isRtl ? 'البريد والهاتف' : 'Contact'}</th>
                    <th>{isRtl ? 'السجلات السابقة' : 'Past Records'}</th>
                    <th>{isRtl ? 'الحالة الحالية' : 'Current Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.length > 0 ? (
                    filteredTeachers.map((t) => {
                      const isChecked = selectedTeacherIds.includes(t.id);
                      return (
                        <tr
                          key={t.id}
                          style={{
                            background: isChecked ? 'rgba(79, 70, 229, 0.04)' : undefined,
                            cursor: 'pointer'
                          }}
                          onClick={() => toggleTeacher(t.id)}
                        >
                          <td onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleTeacher(t.id)}
                              style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                            />
                          </td>
                          <td>
                            <strong style={{ color: 'var(--primary)' }}>{t.employeeNo}</strong>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700 }}>{t.fullName}</span>
                            {t.hasAccount && (
                              <span style={{ display: 'block', fontSize: 11, color: 'var(--success)' }}>
                                ✓ {isRtl ? 'حساب دخول موجود' : 'User Account Linked'}
                              </span>
                            )}
                          </td>
                          <td>
                            <span className="badge" style={{ background: '#f1f5f9', color: '#334155' }}>
                              {t.specialty}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: 12 }}>
                              <div>{t.email || '—'}</div>
                              {t.phone && <div style={{ color: 'var(--text-muted)' }}>{t.phone}</div>}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {t.pastAssignmentsCount} {isRtl ? 'أنصبة سابقة' : 'assignments'}
                            </span>
                          </td>
                          <td>
                            {t.active ? (
                              <span className="badge badge-active">
                                🟢 {isRtl ? 'مفعل حالياً' : 'Active'}
                              </span>
                            ) : (
                              <span className="badge badge-inactive">
                                ⚪ {isRtl ? 'بانتظار التجديد' : 'Inactive'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                        {isRtl ? 'لا يوجد معلمون مطابقون للبحث' : 'No teachers match the criteria'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
