import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { useSchoolConfig } from '../context/SchoolConfigContext';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import ErrorAlert from '../components/common/ErrorAlert';
import SchoolLogo from '../components/common/SchoolLogo';

export default function Login() {
  const { login, loginAsDeveloper } = useAuth();
  const toast = useToast();
  const { t, isRtl } = useLanguage();
  const { config } = useSchoolConfig();

  const [activeRole, setActiveRole] = useState('ADMIN');
  const [email, setEmail] = useState('admin@school.local');
  const [password, setPassword] = useState('ChangeMe123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check URL query parameters or hash on initial load (e.g. ?role=teacher or #teacher)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role')?.toUpperCase();
    const hashParam = window.location.hash.replace('#/', '').replace('#', '').toUpperCase();
    const targetRole = roleParam || hashParam;

    if (targetRole === 'TEACHER') {
      selectRole('TEACHER');
    } else if (targetRole === 'STAFF') {
      selectRole('STAFF');
    } else if (targetRole === 'ADMIN') {
      selectRole('ADMIN');
    } else if (targetRole === 'DEVELOPER' || targetRole === 'DEV') {
      handleDeveloperMasterLogin();
    }
  }, []);

  const handleDeveloperMasterLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const devUser = await loginAsDeveloper('YOUSEF_MASTER_2026');
      toast.success(isRtl ? `مرحباً بك يا مطور المنصة الرئيسي، ${devUser.fullName}!` : `Welcome Platform Lead Developer, ${devUser.fullName}!`);
    } catch (err) {
      setError(err.message || 'Developer login failed');
    } finally {
      setLoading(false);
    }
  };

  const teacherAccounts = [
    { name: 'أحمد خليل', subject: 'رياضيات', email: 'ahmed.khalil@school.local', classes: 'Grade 7 A, 8 A' },
    { name: 'سارة منصور', subject: 'لغة إنجليزية', email: 'sara.mansour@school.local', classes: 'Grade 7 A, 7 B' },
    { name: 'عمر فاروق', subject: 'لغة عربية', email: 'omar.farooq@school.local', classes: 'Grade 7 A, 8 A' },
    { name: 'ليلى حسن', subject: 'علوم', email: 'layla.hassan@school.local', classes: 'Grade 7 B, 8 B' },
    { name: 'طارق عزيز', subject: 'حاسوب', email: 'tareq.aziz@school.local', classes: 'Grade 8 A, 8 B' }
  ];

  const staffAccounts = [
    { name: 'محمد', roleDesc: 'شؤون المعلمين والطلاب', email: 'staff@school.local' },
    { name: 'خالد السعيد', roleDesc: 'موظف شؤون المعلمين والطلاب', email: 'khalid.staff@school.local' }
  ];

  const selectRole = (role) => {
    setActiveRole(role);
    setError('');
    if (role === 'ADMIN') {
      setEmail('admin@school.local');
      setPassword('ChangeMe123!');
    } else if (role === 'STAFF') {
      setEmail('staff@school.local');
      setPassword('ChangeMe123!');
    } else if (role === 'TEACHER') {
      setEmail('ahmed.khalil@school.local');
      setPassword('ChangeMe123!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      toast.success(`${t('welcomeBack')}, ${user.fullName}!`);
    } catch (err) {
      setError(err.message || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const roleColor = activeRole === 'ADMIN' ? 'var(--primary)' : activeRole === 'STAFF' ? '#10b981' : '#0ea5e9';

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: '520px', width: '100%', position: 'relative' }}>
        {/* Language Switcher Header */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <LanguageSwitcher />
        </div>

        <div className="login-brand" style={{ textAlign: 'center', marginBottom: 20 }}>
          {/* Official Emblem Logo */}
          <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
            {config.logoUrl ? (
              <img src={config.logoUrl} alt="School Logo" style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'contain' }} />
            ) : (
              <SchoolLogo size={78} />
            )}
          </div>

          {/* Ministry / Instance Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '12px',
            fontWeight: 800,
            color: 'var(--primary)',
            background: 'var(--primary-light)',
            border: '1px solid var(--border-color)',
            padding: '4px 14px',
            borderRadius: '9999px',
            marginBottom: 6
          }}>
            <span>🏫</span>
            <span>{config.schoolCode} • {isRtl ? 'المنظومة الأكاديمية السحابية' : 'Dedicated Cloud Academic Instance'}</span>
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#1e1b4b', margin: '4px 0' }}>
            {isRtl ? config.schoolNameAr : config.schoolNameEn}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0 0' }}>
            {isRtl ? config.schoolSloganAr : config.schoolSloganEn}
          </p>
        </div>

        {/* Dedicated Role Selection Portals */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
            {isRtl ? 'اختر بوابة الحساب لتسجيل الدخول:' : 'Select Portal Account:'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => selectRole('ADMIN')}
              style={{
                padding: '12px 8px',
                borderRadius: 'var(--radius-md)',
                border: activeRole === 'ADMIN' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                background: activeRole === 'ADMIN' ? 'var(--primary-light)' : 'var(--bg-main)',
                color: activeRole === 'ADMIN' ? 'var(--primary-dark)' : 'var(--text-main)',
                fontWeight: activeRole === 'ADMIN' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                transition: 'var(--transition)'
              }}
            >
              <span style={{ fontSize: '20px' }}>👔</span>
              <span>{isRtl ? 'المدير العام' : 'Admin'}</span>
            </button>

            <button
              type="button"
              onClick={() => selectRole('STAFF')}
              style={{
                padding: '12px 8px',
                borderRadius: 'var(--radius-md)',
                border: activeRole === 'STAFF' ? '2px solid #10b981' : '1px solid var(--border-color)',
                background: activeRole === 'STAFF' ? 'var(--success-light)' : 'var(--bg-main)',
                color: activeRole === 'STAFF' ? '#047857' : 'var(--text-main)',
                fontWeight: activeRole === 'STAFF' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                transition: 'var(--transition)'
              }}
            >
              <span style={{ fontSize: '20px' }}>📋</span>
              <span>{isRtl ? 'شؤون المعلمين والطلاب' : 'Staff Affairs'}</span>
            </button>

            <button
              type="button"
              onClick={() => selectRole('TEACHER')}
              style={{
                padding: '12px 8px',
                borderRadius: 'var(--radius-md)',
                border: activeRole === 'TEACHER' ? '2px solid #0ea5e9' : '1px solid var(--border-color)',
                background: activeRole === 'TEACHER' ? 'rgba(14, 165, 233, 0.1)' : 'var(--bg-main)',
                color: activeRole === 'TEACHER' ? '#0369a1' : 'var(--text-main)',
                fontWeight: activeRole === 'TEACHER' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                transition: 'var(--transition)'
              }}
            >
              <span style={{ fontSize: '20px' }}>👨‍🏫</span>
              <span>{isRtl ? 'المعلمون (فردي)' : 'Teachers'}</span>
            </button>
          </div>
        </div>

        {/* Quick Teacher / Staff Account Chips */}
        {activeRole === 'TEACHER' && (
          <div style={{
            background: 'rgba(14, 165, 233, 0.06)',
            border: '1px solid rgba(14, 165, 233, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1', marginBottom: '8px' }}>
              {isRtl ? 'اختر حساب المعلم المخصص للمعاينة والإسناد الأكاديمي:' : 'Select individual teacher account:'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {teacherAccounts.map((tch, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setEmail(tch.email);
                    setPassword('ChangeMe123!');
                  }}
                  style={{
                    background: email === tch.email ? '#0ea5e9' : '#ffffff',
                    color: email === tch.email ? '#ffffff' : '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: email === tch.email ? '0 2px 6px rgba(14, 165, 233, 0.3)' : 'none'
                  }}
                >
                  {tch.name} ({tch.subject})
                </button>
              ))}
            </div>
          </div>
        )}

        {activeRole === 'STAFF' && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#047857', marginBottom: '8px' }}>
              {isRtl ? 'اختر حساب موظف شؤون الطلاب:' : 'Select staff member account:'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {staffAccounts.map((stf, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setEmail(stf.email);
                    setPassword('ChangeMe123!');
                  }}
                  style={{
                    background: email === stf.email ? '#10b981' : '#ffffff',
                    color: email === stf.email ? '#ffffff' : '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: email === stf.email ? '0 2px 6px rgba(16, 185, 129, 0.3)' : 'none'
                  }}
                >
                  {stf.name} - {stf.roleDesc}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <ErrorAlert message={error} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('emailLabel')}</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@school.local"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('passwordLabel')}</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>
              {isRtl ? 'كلمة المرور التجريبية: ChangeMe123!' : 'Demo Password: ChangeMe123!'}
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '15px',
                fontWeight: 700,
                background: roleColor,
                borderColor: roleColor
              }}
              disabled={loading}
            >
              {loading ? t('signingIn') : `${t('signInBtn')} (${activeRole === 'ADMIN' ? (isRtl ? 'المدير' : 'Admin') : activeRole === 'STAFF' ? (isRtl ? 'شؤون الطلاب' : 'Staff') : (isRtl ? 'المعلم' : 'Teacher')})`}
            </button>
          </div>
        </form>

        <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '12px', color: 'var(--text-light)' }}>
          {isRtl ? `${config.schoolNameAr} — منظومة إدارة المدرسة الذكية` : `${config.schoolNameEn} — Smart School Management System`}
        </div>
      </div>
    </div>
  );
}
