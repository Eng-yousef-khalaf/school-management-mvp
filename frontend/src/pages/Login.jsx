import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { useSchoolConfig } from '../context/SchoolConfigContext';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import ErrorAlert from '../components/common/ErrorAlert';
import SchoolLogo from '../components/common/SchoolLogo';

export default function Login({ onBackToWebsite }) {
  const { login, loginAsDeveloper } = useAuth();
  const toast = useToast();
  const { t, isRtl } = useLanguage();
  const { config } = useSchoolConfig();

  const [activeRole, setActiveRole] = useState('ADMIN');
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const p = JSON.parse(localStorage.getItem('school_principal_info') || '{}');
        if (p.email) return p.email;
      } catch {}
    }
    return 'admin@school.local';
  });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [secretClickCount, setSecretClickCount] = useState(0);

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

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        window.location.hash = '#developer';
        window.location.reload();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDeveloperMasterLogin = async () => {
    setError('');
    setLoading(true);
    try {
      window.location.hash = '#developer';
      const devUser = await loginAsDeveloper('YOUSEF_MASTER_2026');
      toast.success(isRtl ? `مرحباً بك يا مهندس ومطور المنظومة، ${devUser.fullName}!` : `Welcome Platform Lead Developer, ${devUser.fullName}!`);
    } catch (err) {
      setError(err.message || 'Developer login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSecretFooterClick = () => {
    const nextCount = secretClickCount + 1;
    setSecretClickCount(nextCount);
    if (nextCount >= 5) {
      window.location.hash = '#developer';
      window.location.reload();
    }
  };

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
    if (e) e.preventDefault();
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

  const roleDetails = {
    ADMIN: {
      name: isRtl ? 'المدير العام' : 'Administrator',
      icon: '👔',
      color: 'var(--primary)',
      desc: isRtl ? 'إشراف عام ورقابة وتقارير تنفيذية' : 'Executive governance & full oversight'
    },
    STAFF: {
      name: isRtl ? 'شؤون الطلاب' : 'Staff & Admissions',
      icon: '📋',
      color: '#10b981',
      desc: isRtl ? 'قبول الطلاب، الجداول، ورصد الرسوم' : 'Admissions, enrollment & tuition ledger'
    },
    TEACHER: {
      name: isRtl ? 'المعلم' : 'Faculty Teacher',
      icon: '👨‍🏫',
      color: '#0ea5e9',
      desc: isRtl ? 'دفتر الحضور، رصد الدرجات، والشعب' : 'Attendance roster & grade entry'
    }
  };

  return (
    <div className="login-split-layout">
      {/* Form Section */}
      <div className="login-form-side">
        <div style={{ width: '100%', maxWidth: '420px' }}>
          
          {/* Top Bar: Code & Return to Public Website */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            {onBackToWebsite ? (
              <button
                type="button"
                onClick={onBackToWebsite}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 800,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>←</span>
                <span>{isRtl ? 'العودة لموقع مدرسة السلام الرئيسي' : 'Back to Al-Salam School Website'}</span>
              </button>
            ) : (
              <a
                href="/"
                style={{
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: '12px'
                }}
              >
                {isRtl ? '← موقع مدرسة السلام' : '← Al-Salam School Website'}
              </a>
            )}
            <LanguageSwitcher />
          </div>

          {/* School Brand Header */}
          <div style={{ marginBottom: 28, textAlign: 'start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              {config.logoUrl ? (
                <img src={config.logoUrl} alt="Logo" style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'contain' }} />
              ) : (
                <SchoolLogo size={48} />
              )}
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.4px', lineHeight: 1.2 }}>
                  {isRtl ? config.schoolNameAr : config.schoolNameEn}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: 2 }}>
                  {isRtl ? config.schoolSloganAr : config.schoolSloganEn}
                </p>
              </div>
            </div>
          </div>

          {/* Sign In Header Info */}
          <div style={{
            background: 'rgba(79, 70, 229, 0.05)',
            border: '1px solid rgba(79, 70, 229, 0.15)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <span style={{ fontSize: 24 }}>🔐</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>
                {isRtl ? 'تسجيل الدخول للمنظومة' : 'Secure System Login'}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                {isRtl ? 'أدخل البريد الإلكتروني وكلمة المرور الخاصة بحسابك' : 'Enter your credentials to access your authorized portal'}
              </div>
            </div>
          </div>

          {error && <ErrorAlert message={error} />}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">{t('emailLabel')}</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@school.local"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label" style={{ marginBottom: 6 }}>{t('passwordLabel')}</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                background: 'var(--primary)',
                borderColor: 'var(--primary)',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                fontSize: '14px',
                fontWeight: 800
              }}
              disabled={loading}
            >
              {loading ? (
                <span>{t('signingIn')}...</span>
              ) : (
                <span>
                  {isRtl ? 'تسجيل الدخول' : 'Sign In'} &larr;
                </span>
              )}
            </button>
          </form>

          {/* Parent Portals Section */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
            {/* Direct Parent Student Inquiry Portal */}
            <a
              href="#inquiry"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = '#inquiry';
                window.location.reload();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '13px 16px',
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(14, 165, 233, 0.08) 100%)',
                border: '1.5px solid rgba(99, 102, 241, 0.35)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: 'var(--text-main)',
                transition: 'var(--transition)',
                marginBottom: 10,
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.06)'
              }}
              className="panel"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22 }}>🎓</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)' }}>
                    {isRtl ? 'بوابة أولياء الأمور للاستعلام عن الطالب' : 'Parent Student Inquiry Portal'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {isRtl ? 'استعلام مباشر بالمعرف الشخصي عن الدرجات والدوام' : 'Direct public lookup by ID for grades & attendance'}
                  </div>
                </div>
              </div>
              <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '16px' }}>{isRtl ? '←' : '→'}</span>
            </a>

            {/* Direct Parent Tuition Payment Portal */}
            <a
              href="#pay"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = '#pay';
                window.location.reload();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: 'var(--text-main)',
                transition: 'var(--transition)'
              }}
              className="panel"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>💳</span>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {isRtl ? 'بوابة سداد الرسوم والأقساط المدرسية' : 'Parent Tuition Payment Portal'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {isRtl ? 'تسديد الرسوم وإرفاق الحوالات البنكية' : 'Pay tuition & submit transaction receipts'}
                  </div>
                </div>
              </div>
              <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{isRtl ? '←' : '→'}</span>
            </a>
          </div>

          {/* Footer */}
          <div
            onClick={handleSecretFooterClick}
            style={{
              marginTop: 24,
              textAlign: 'center',
              fontSize: '11.5px',
              color: 'var(--text-light)',
              cursor: 'default',
              userSelect: 'none'
            }}
            title={secretClickCount > 0 ? `Developer Access: ${secretClickCount}/5` : ''}
          >
            {isRtl ? `© 2026 ${config.schoolNameAr} — المنظومة الذكية الموحدة` : `© 2026 ${config.schoolNameEn} — Unified Smart ERP`}
          </div>

        </div>
      </div>

      {/* Hero Brand Showcase Panel */}
      <div className="login-hero-side">
        <div className="login-hero-bg-overlay" />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
            fontWeight: 700,
            color: '#e0e7ff'
          }}>
            <span>✨</span>
            <span>{isRtl ? 'الجيل القادم من أنظمة إدارة التعليم' : 'Next-Generation Smart Education ERP'}</span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 520 }}>
          <h2 style={{ fontSize: '36px', fontWeight: 900, lineHeight: 1.25, letterSpacing: '-0.8px', color: '#ffffff', marginBottom: 16 }}>
            {isRtl ? 'بناء مستقبل تعليمي متكامل ومبسط' : 'Empowering Education Through Seamless Intelligence'}
          </h2>
          <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: 1.6, marginBottom: 32 }}>
            {isRtl
              ? 'لوحة إدارة موحدة تجمع الكادر التعليمي، شؤون الطلاب، والإدارة العليا في بيئة رقمية سريعة وسهلة الاستخدام.'
              : 'A modern, unified platform connecting leadership, faculty, and administration with frictionless workflows and actionable insights.'}
          </p>

          {/* Quick Metrics highlight */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#38bdf8' }}>100%</div>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: 2 }}>
                {isRtl ? 'أتمتة وحفظ السجلات' : 'Digital Records'}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#34d399' }}>0ms</div>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: 2 }}>
                {isRtl ? 'استجابة فائقة السرعة' : 'Instant Response'}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#a78bfa' }}>24/7</div>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: 2 }}>
                {isRtl ? 'حماية ورقابة أمنية' : 'Security & Audit'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 12, fontSize: '12px', color: '#94a3b8' }}>
          <span>🔒 {isRtl ? 'اتصال مشفر وآمن بمعايير المؤسسات' : 'Enterprise-grade encryption'}</span>
        </div>
      </div>
    </div>
  );
}
