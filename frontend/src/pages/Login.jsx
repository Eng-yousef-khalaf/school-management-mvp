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

  const executeInstantLogin = async (targetEmail, targetPassword = 'ChangeMe123!') => {
    setError('');
    setLoading(true);
    try {
      const user = await login(targetEmail, targetPassword);
      toast.success(`${t('welcomeBack')}, ${user.fullName}!`);
    } catch (err) {
      setError(err.message || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    executeInstantLogin(email, password);
  };

  const roleColor = activeRole === 'ADMIN' ? 'var(--primary)' : activeRole === 'STAFF' ? '#10b981' : '#0ea5e9';

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: '450px', width: '100%', position: 'relative' }}>
        {/* Top Header: Language Switcher & Quick Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '11px',
            fontWeight: 800,
            color: 'var(--primary)',
            background: 'var(--primary-light)',
            border: '1px solid var(--border-color)',
            padding: '2px 10px',
            borderRadius: '9999px'
          }}>
            <span>🏫</span>
            <span>{config.schoolCode || 'MOE-SCH-2026'}</span>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Brand Header */}
        <div className="login-brand" style={{ textAlign: 'center', marginBottom: 12 }}>
          {/* Official Emblem Logo */}
          <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'center' }}>
            {config.logoUrl ? (
              <img src={config.logoUrl} alt="School Logo" style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'contain' }} />
            ) : (
              <SchoolLogo size={52} />
            )}
          </div>

          <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#1e1b4b', margin: '2px 0' }}>
            {isRtl ? config.schoolNameAr : config.schoolNameEn}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '11.5px', margin: '2px 0 0 0' }}>
            {isRtl ? config.schoolSloganAr : config.schoolSloganEn}
          </p>
        </div>

        {/* Dedicated Role Selection Portals with 1-Click Fast Actions */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
              {isRtl ? 'اختر البوابة للدخول المباشر:' : 'Select Portal for Instant Login:'}
            </div>
            <span style={{ fontSize: '10.5px', color: 'var(--primary)', fontWeight: 700 }}>⚡ {isRtl ? 'دخول فوري 0ms' : '0ms Instant'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
            <button
              type="button"
              onClick={() => {
                selectRole('ADMIN');
              }}
              onDoubleClick={() => executeInstantLogin('admin@school.local')}
              style={{
                padding: '6px 4px',
                borderRadius: '8px',
                border: activeRole === 'ADMIN' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                background: activeRole === 'ADMIN' ? 'var(--primary-light)' : 'var(--bg-main)',
                color: activeRole === 'ADMIN' ? 'var(--primary-dark)' : 'var(--text-main)',
                fontWeight: activeRole === 'ADMIN' ? 700 : 500,
                fontSize: '11.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                transition: 'var(--transition)'
              }}
              title={isRtl ? 'انقر للاختيار أو انقر نقراً مزدوجاً للدخول الفوري' : 'Click to select or double-click to login immediately'}
            >
              <span style={{ fontSize: '15px' }}>👔</span>
              <span>{isRtl ? 'المدير' : 'Admin'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                selectRole('STAFF');
              }}
              onDoubleClick={() => executeInstantLogin('staff@school.local')}
              style={{
                padding: '6px 4px',
                borderRadius: '8px',
                border: activeRole === 'STAFF' ? '2px solid #10b981' : '1px solid var(--border-color)',
                background: activeRole === 'STAFF' ? 'var(--success-light)' : 'var(--bg-main)',
                color: activeRole === 'STAFF' ? '#047857' : 'var(--text-main)',
                fontWeight: activeRole === 'STAFF' ? 700 : 500,
                fontSize: '11.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                transition: 'var(--transition)'
              }}
              title={isRtl ? 'انقر للاختيار أو انقر نقراً مزدوجاً للدخول الفوري' : 'Click to select or double-click to login immediately'}
            >
              <span style={{ fontSize: '15px' }}>📋</span>
              <span>{isRtl ? 'شؤون الطلاب' : 'Staff'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                selectRole('TEACHER');
              }}
              onDoubleClick={() => executeInstantLogin('ahmed.khalil@school.local')}
              style={{
                padding: '6px 4px',
                borderRadius: '8px',
                border: activeRole === 'TEACHER' ? '2px solid #0ea5e9' : '1px solid var(--border-color)',
                background: activeRole === 'TEACHER' ? 'rgba(14, 165, 233, 0.1)' : 'var(--bg-main)',
                color: activeRole === 'TEACHER' ? '#0369a1' : 'var(--text-main)',
                fontWeight: activeRole === 'TEACHER' ? 700 : 500,
                fontSize: '11.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                transition: 'var(--transition)'
              }}
              title={isRtl ? 'انقر للاختيار أو انقر نقراً مزدوجاً للدخول الفوري' : 'Click to select or double-click to login immediately'}
            >
              <span style={{ fontSize: '15px' }}>👨‍🏫</span>
              <span>{isRtl ? 'المعلمون' : 'Teachers'}</span>
            </button>
          </div>
        </div>

        {/* Quick Teacher / Staff Account Chips */}
        {activeRole === 'TEACHER' && (
          <div style={{
            background: 'rgba(14, 165, 233, 0.06)',
            border: '1px solid rgba(14, 165, 233, 0.25)',
            borderRadius: '6px',
            padding: '6px 10px',
            marginBottom: '10px'
          }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#0369a1', marginBottom: '5px' }}>
              {isRtl ? 'اختر حساب المعلم المخصص:' : 'Select individual teacher account:'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {teacherAccounts.map((tch, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setEmail(tch.email);
                    setPassword('ChangeMe123!');
                  }}
                  onDoubleClick={() => executeInstantLogin(tch.email)}
                  style={{
                    background: email === tch.email ? '#0ea5e9' : '#ffffff',
                    color: email === tch.email ? '#ffffff' : '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: email === tch.email ? '0 1px 4px rgba(14, 165, 233, 0.3)' : 'none'
                  }}
                  title={isRtl ? 'انقر للتحديد أو نقر مزدوج للدخول الفوري' : 'Click to select or double-click to login'}
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
            borderRadius: '6px',
            padding: '6px 10px',
            marginBottom: '10px'
          }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#047857', marginBottom: '5px' }}>
              {isRtl ? 'اختر حساب موظف شؤون الطلاب:' : 'Select staff member account:'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {staffAccounts.map((stf, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setEmail(stf.email);
                    setPassword('ChangeMe123!');
                  }}
                  onDoubleClick={() => executeInstantLogin(stf.email)}
                  style={{
                    background: email === stf.email ? '#10b981' : '#ffffff',
                    color: email === stf.email ? '#ffffff' : '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: email === stf.email ? '0 1px 4px rgba(16, 185, 129, 0.3)' : 'none'
                  }}
                  title={isRtl ? 'انقر للتحديد أو نقر مزدوج للدخول الفوري' : 'Click to select or double-click to login'}
                >
                  {stf.name} - {stf.roleDesc}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <ErrorAlert message={error} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 8 }}>
            <label className="form-label" style={{ fontSize: '12px', marginBottom: 2 }}>{t('emailLabel')}</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@school.local"
              style={{ padding: '7px 10px', fontSize: '13px' }}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label" style={{ fontSize: '12px', marginBottom: 2 }}>{t('passwordLabel')}</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{ padding: '7px 10px', fontSize: '13px' }}
              required
            />
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: 2 }}>
              {isRtl ? 'كلمة المرور التجريبية: ChangeMe123!' : 'Demo Password: ChangeMe123!'}
            </div>
          </div>

          <div>
            {/* Primary Instant Login Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '9px 14px',
                fontSize: '14px',
                fontWeight: 800,
                background: roleColor,
                borderColor: roleColor,
                boxShadow: `0 3px 10px ${roleColor}35`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                borderRadius: '8px'
              }}
              disabled={loading}
            >
              <span>⚡</span>
              <span>
                {loading ? t('signingIn') : `${t('signInBtn')} (${activeRole === 'ADMIN' ? (isRtl ? 'المدير العام' : 'Admin') : activeRole === 'STAFF' ? (isRtl ? 'شؤون الطلاب' : 'Staff') : (isRtl ? 'المعلم' : 'Teacher')})`}
              </span>
            </button>
          </div>
        </form>

        <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '11px', color: 'var(--text-light)' }}>
          {isRtl ? `${config.schoolNameAr} — منظومة إدارة المدرسة الذكية` : `${config.schoolNameEn} — Smart School Management System`}
        </div>
      </div>
    </div>
  );
}
