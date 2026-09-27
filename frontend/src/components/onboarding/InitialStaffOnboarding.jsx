import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export default function InitialStaffOnboarding({ onComplete }) {
  const { isRtl } = useLanguage();
  const toast = useToast();

  const [memberRole, setMemberRole] = useState('TEACHER'); // 'TEACHER' | 'STAFF'
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    specialty: 'رياضيات',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      const res = await api.get('/developer/onboarded-members', { noCache: true }).catch(() => null);
      if (res && res.members) {
        setMembers(res.members);
        localStorage.setItem('registered_school_staff', JSON.stringify(res.members));
      } else {
        const local = localStorage.getItem('registered_school_staff');
        if (local) setMembers(JSON.parse(local));
      }
    } catch {
      const local = localStorage.getItem('registered_school_staff');
      if (local) setMembers(JSON.parse(local));
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error(isRtl ? 'يرجى كتابة الاسم الكامل والبريد الإلكتروني' : 'Name and email are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password.trim() || 'ChangeMe123!',
        role: memberRole,
        specialty: memberRole === 'TEACHER' ? form.specialty : 'إدارة شؤون طلاب',
        phone: form.phone.trim()
      };

      const res = await api.post('/developer/onboard-member', payload);
      if (res && (res.ok || res.member)) {
        toast.success(
          isRtl
            ? `تم تسجيل واعتماد ${memberRole === 'TEACHER' ? 'المعلم' : 'الموظف'} (${payload.fullName}) بنجاح!`
            : `Member ${payload.fullName} registered successfully!`
        );
        setForm({
          fullName: '',
          email: '',
          password: '',
          specialty: 'رياضيات',
          phone: ''
        });
        await fetchMembers();
      } else {
        const errorText = res?.error || (isRtl ? 'حدث خطأ أثناء تسجيل العضو' : 'Failed to add member');
        toast.error(errorText);
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('مسجل مسبقاً') || msg.includes('already')) {
        toast.info(isRtl ? 'هذا البريد الإلكتروني مسجل ومعتمد بالفعل في المنظومة!' : 'This email is already registered!');
        await fetchMembers();
      } else {
        toast.error(msg || (isRtl ? 'فشل تسجيل العضو في المنظومة' : 'Operation failed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (id) => {
    try {
      await api.delete(`/developer/onboarded-members/${id}`).catch(() => {});
      const updated = members.filter(m => m.id !== id);
      setMembers(updated);
      localStorage.setItem('registered_school_staff', JSON.stringify(updated));
      toast.info(isRtl ? 'تم حذف الحساب من القائمة' : 'Member removed');
    } catch {
      const updated = members.filter(m => m.id !== id);
      setMembers(updated);
      localStorage.setItem('registered_school_staff', JSON.stringify(updated));
    }
  };

  const handleFinishSetup = () => {
    localStorage.setItem('school_setup_completed', 'true');
    toast.success(
      isRtl
        ? 'تم اكتمال مرحلة التأسيس وتعيين الكادر بنجاح! مرحباً بك في لوحة التحكم الرئيسية للمدرسة.'
        : 'Setup completed successfully! Welcome to the main dashboard.'
    );
    if (onComplete) onComplete();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Onboarding Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0369a1 100%)',
        color: '#ffffff',
        borderRadius: 14,
        padding: '24px 28px',
        boxShadow: '0 10px 25px rgba(15, 23, 42, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 24 }}>🏫</span>
          <span style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.5px'
          }}>
            {isRtl ? 'مرحلة التأسيس والتهيئة الأولى للمدرسة' : 'Initial School Setup & Staff Onboarding'}
          </span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 8px 0' }}>
          {isRtl ? 'بوابة تعيين وتسجيل الكادر التعليمي والإداري الأول' : 'Designate Faculty & Administrative Staff'}
        </h1>
        <p style={{ margin: 0, fontSize: 13.5, opacity: 0.92, maxWidth: 800, lineHeight: 1.6 }}>
          {isRtl
            ? 'النظام الآن مهيأ ونظيف تماماً بدون أي طلاب أو معلمين وهميين. بصفتك مدير المدرسة، يرجى تسجيل المعلمين وموظفي شؤون الطلاب الفعليين. سيتم إنشاء حساب رسمي فوري لكل اسم تدخله، ليتمكن من تسجيل الدخول والعمل بصلاحياته الرسمية مباشرة.'
            : 'The platform is completely clean with zero dummy records. As the School Principal, register your real teachers and staff members below. Each entry generates a live, authenticated account ready for immediate login with appropriate role permissions.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)', gap: 20, alignItems: 'start' }}>
        {/* Registration Form Panel */}
        <div className="panel" style={{ padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>✍️</span>
              <span>{isRtl ? 'إضافة وتوثيق عضو جديد في الكادر' : 'Register New Staff / Faculty Member'}</span>
            </h3>
          </div>

          {/* Role Selector Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            <button
              type="button"
              onClick={() => setMemberRole('TEACHER')}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: memberRole === 'TEACHER' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                background: memberRole === 'TEACHER' ? '#eff6ff' : '#f8fafc',
                color: memberRole === 'TEACHER' ? '#1d4ed8' : '#64748b',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <span>👨‍🏫</span>
              <span>{isRtl ? 'معلم (هيئة تدريسية)' : 'Teacher (Faculty)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setMemberRole('STAFF')}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: memberRole === 'STAFF' ? '2px solid #059669' : '1px solid #cbd5e1',
                background: memberRole === 'STAFF' ? '#ecfdf5' : '#f8fafc',
                color: memberRole === 'STAFF' ? '#047857' : '#64748b',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <span>💼</span>
              <span>{isRtl ? 'موظف شؤون طلاب وإدارة' : 'Student Affairs (Staff)'}</span>
            </button>
          </div>

          <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>
                {memberRole === 'TEACHER' ? (isRtl ? 'الاسم الكامل للمعلم:' : 'Teacher Full Name:') : (isRtl ? 'اسم الموظف الكامل:' : 'Staff Full Name:')}
              </label>
              <input
                type="text"
                className="form-input"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder={memberRole === 'TEACHER' ? 'أ. أحمد خليل' : 'محمد السعيد'}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>
                {isRtl ? 'البريد الإلكتروني المعتمد للدخول:' : 'Login Email Address:'}
              </label>
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={memberRole === 'TEACHER' ? 'teacher1@school.local' : 'staff1@school.local'}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>
                  {isRtl ? 'كلمة المرور الأولية للحساب:' : 'Initial Password:'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="ChangeMe123!"
                />
              </div>

              {memberRole === 'TEACHER' ? (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>
                    {isRtl ? 'المادة / التخصص التعليمي:' : 'Subject Specialty:'}
                  </label>
                  <select
                    className="form-select"
                    value={form.specialty}
                    onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  >
                    <option value="رياضيات">{isRtl ? 'رياضيات' : 'Mathematics'}</option>
                    <option value="لغة عربية">{isRtl ? 'لغة عربية' : 'Arabic'}</option>
                    <option value="لغة إنجليزية">{isRtl ? 'لغة إنجليزية' : 'English'}</option>
                    <option value="علوم عامة">{isRtl ? 'علوم عامة' : 'General Science'}</option>
                    <option value="حاسوب وتكنولوجيا">{isRtl ? 'حاسوب وتكنولوجيا' : 'ICT & Computer'}</option>
                    <option value="تربية إسلامية">{isRtl ? 'تربية إسلامية' : 'Islamic Studies'}</option>
                    <option value="دراسات اجتماعية">{isRtl ? 'دراسات اجتماعية' : 'Social Studies'}</option>
                    <option value="تربية رياضية">{isRtl ? 'تربية رياضية' : 'Physical Education'}</option>
                    <option value="تربية فنية">{isRtl ? 'تربية فنية' : 'Art & Design'}</option>
                  </select>
                </div>
              ) : (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>
                    {isRtl ? 'رقم الهاتف / الجوال:' : 'Phone Number:'}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0599000000"
                  />
                </div>
              )}
            </div>

            {memberRole === 'TEACHER' && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>
                  {isRtl ? 'رقم الهاتف / الجوال للمعلم (اختياري):' : 'Teacher Phone (Optional):'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0599000000"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                marginTop: 8,
                padding: '12px 18px',
                borderRadius: 8,
                background: memberRole === 'TEACHER' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'linear-gradient(135deg, #059669, #047857)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 900,
                fontSize: 13.5,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
              }}
            >
              <span>➕</span>
              <span>
                {isSubmitting
                  ? (isRtl ? 'جاري الاعتماد والتسجيل...' : 'Registering...')
                  : (isRtl ? `حفظ واعتماد ${memberRole === 'TEACHER' ? 'المعلم' : 'الموظف'} فورياً` : 'Register & Authenticate Account')}
              </span>
            </button>
          </form>
        </div>

        {/* Live Roster of Onboarded Staff Panel */}
        <div className="panel" style={{ padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📋</span>
              <span>{isRtl ? 'سجل الكادر المعتمد حالياً' : 'Current Active School Roster'}</span>
            </h3>
            <span style={{
              background: '#f1f5f9',
              padding: '3px 10px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 800,
              color: '#334155'
            }}>
              {members.length} {isRtl ? 'عضو مسجل' : 'Registered'}
            </span>
          </div>

          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            {members.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px dashed #cbd5e1'
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
                <div style={{ fontWeight: 800, color: '#334155', fontSize: 13.5 }}>
                  {isRtl ? 'لم يتم تسجيل أي كادر حتى الآن' : 'No staff registered yet'}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  {isRtl ? 'أدخل أول معلم أو موظف من النموذج على اليمين' : 'Add your first teacher or staff member using the form'}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {members.map((m) => {
                  const isTeacherRole = m.role === 'TEACHER';
                  return (
                    <div
                      key={m.id}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: isTeacherRole ? '#eff6ff' : '#ecfdf5',
                          color: isTeacherRole ? '#2563eb' : '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: 14
                        }}>
                          {isTeacherRole ? '👨‍🏫' : '💼'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 13.5, color: '#0f172a' }}>
                            {m.fullName}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#64748b', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span>✉️ {m.email}</span>
                            {m.specialty && <span>📚 {m.specialty}</span>}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: isTeacherRole ? '#dbeafe' : '#d1fae5',
                          color: isTeacherRole ? '#1e40af' : '#065f46'
                        }}>
                          {isTeacherRole ? (isRtl ? 'معلم' : 'Teacher') : (isRtl ? 'شؤون طلاب' : 'Staff')}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(m.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: 14,
                            padding: 4
                          }}
                          title={isRtl ? 'حذف هذا الحساب' : 'Delete'}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action To Finalize & Transition To Default Layout */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
            <button
              type="button"
              onClick={handleFinishSetup}
              style={{
                width: '100%',
                padding: '13px 18px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 900,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(22, 101, 52, 0.3)'
              }}
            >
              <span>✅</span>
              <span>{isRtl ? 'إكمال التهيئة والذهاب إلى لوحة التحكم الرئيسية ←' : 'Finalize Setup & Open Main Dashboard →'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
