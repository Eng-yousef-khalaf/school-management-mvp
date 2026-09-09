import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import ErrorAlert from '../components/common/ErrorAlert';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const { t, isRtl } = useLanguage();

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
    }
  }, []);

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
      setEmail('teacher@school.local');
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
      <div className="login-card" style={{ maxWidth: '480px', width: '100%', position: 'relative' }}>
        {/* Language Switcher Header */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <LanguageSwitcher />
        </div>

        <div className="login-brand">
          <div className="login-logo" style={{ background: roleColor }}>
            {activeRole === 'ADMIN' ? '👔' : activeRole === 'STAFF' ? '📋' : '👨‍🏫'}
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{t('loginTitle')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: 4 }}>
            {t('loginSubtitle')}
          </p>
        </div>

        {/* Dedicated Role Selection Portals */}
        <div style={{ marginBottom: 20 }}>
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
              <span>{t('adminPortal')}</span>
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
              <span>{t('staffPortal')}</span>
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
              <span>{t('teacherPortal')}</span>
            </button>
          </div>
        </div>

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
          {isRtl ? 'نظام إدارة المدرسة - الإصدار الأكاديمي الشامل V2' : 'School Management System - Enterprise Academic V2'}
        </div>
      </div>
    </div>
  );
}
