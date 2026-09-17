import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import DeveloperFleetDashboard from './DeveloperFleetDashboard';

export default function DeveloperPortalStandalone({ onExitToSchool }) {
  const { user, loginAsDeveloper, logout } = useAuth();
  const { isRtl } = useLanguage();
  const toast = useToast();

  const [masterKey, setMasterKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isUnlocked = user?.isDeveloper === true;

  const handleUnlock = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const devUser = await loginAsDeveloper(masterKey.trim());
      sessionStorage.removeItem(`school_welcome_seen_${devUser.id}`);
      sessionStorage.removeItem(`school_welcome_seen_${devUser.email}`);
      sessionStorage.removeItem(`school_welcome_seen_${devUser.role}`);
      sessionStorage.removeItem('school_welcome_seen_DEVELOPER');
      sessionStorage.removeItem('school_welcome_seen_ADMIN');
      toast.success(isRtl ? `مرحباً بك يا مهندس ومطور المنظومة، ${devUser.fullName}!` : `Developer Master Session Unlocked: ${devUser.fullName}`);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-daily-motivation'));
      }, 250);
    } catch (err) {
      setError(isRtl ? 'مفتاح المطور غير صحيح. يرجى التحقق من المفتاح السري.' : 'Invalid Developer Master Key.');
    } finally {
      setLoading(false);
    }
  };

  const handleExit = () => {
    if (onExitToSchool) {
      onExitToSchool();
    } else {
      window.location.href = window.location.origin;
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-main)',
        color: 'var(--text-main)',
        display: 'flex',
        flexDirection: 'column',
      }}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top Standalone Developer Bar */}
      <header
        className="topbar"
        style={{
          padding: '0 28px',
          height: 64,
          background: '#ffffff',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
            }}
          >
            ⚡
          </div>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              {isRtl ? 'بوابة المطور ومهندس المنظومة' : 'Standalone Engineering Hub'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
              YOUSEF KHALAF • MASTER CONTROL & DATABASE TELEMETRY
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isUnlocked && (
            <div
              style={{
                background: 'var(--success-light)',
                color: 'var(--success-text)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: 11.5,
                fontWeight: 800,
                border: '1px solid var(--success-border)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>🟢</span>
              <span>{isRtl ? 'جلسة المطور نشطة' : 'Session Active'}</span>
            </div>
          )}

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExit}
            style={{ fontWeight: 700 }}
          >
            🏫 {isRtl ? 'الخروج لمنظومة المدرسة' : 'Exit to School App'}
          </button>

          {isUnlocked && (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => {
                logout();
                toast.success(isRtl ? 'تم قفل جلسة المطور' : 'Developer session locked');
              }}
              style={{ fontWeight: 700 }}
            >
              🔒 {isRtl ? 'قفل الجلسة' : 'Lock'}
            </button>
          )}
        </div>
      </header>

      {/* Body: Gateway Login or Dashboard */}
      <main style={{ flex: 1, padding: '24px 28px', maxWidth: 1560, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {!isUnlocked ? (
          <div
            className="panel"
            style={{
              maxWidth: 440,
              margin: '60px auto',
              padding: '36px 32px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 'var(--radius-xl)',
                background: 'var(--primary-light)',
                border: '1px solid rgba(79, 70, 229, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                margin: '0 auto 16px',
                color: 'var(--primary)',
              }}
            >
              🔐
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
              {isRtl ? 'مصادقة المطور العام' : 'Developer Authentication'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 12.5, marginBottom: 24, lineHeight: 1.5 }}>
              {isRtl
                ? 'بوابة تحكم هندسية مخصصة لفحص الخادم، تشخيص قاعدة البيانات، والصيانة المباشرة.'
                : 'Standalone command gateway for platform engineering, database diagnostics, and direct maintenance.'}
            </p>

            {error && (
              <div className="alert alert-danger" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ textAlign: 'start' }}>
                <label className="form-label">{isRtl ? 'مفتاح المطور السري (Master Key):' : 'Developer Master Key:'}</label>
                <input
                  type="password"
                  className="form-input"
                  value={masterKey}
                  onChange={(e) => setMasterKey(e.target.value)}
                  placeholder="YOUSEF_MASTER_2026"
                  required
                  autoFocus
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {isRtl ? 'المفتاح الافتراضي: YOUSEF_MASTER_2026' : 'Default Master Key: YOUSEF_MASTER_2026'}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', fontWeight: 800 }}
                disabled={loading}
              >
                {loading ? (isRtl ? 'جاري التحقق...' : 'Authenticating...') : `⚡ ${isRtl ? 'فتح لوحة التحكم الهندسية' : 'Unlock Engineering Hub'}`}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setMasterKey('YOUSEF_MASTER_2026')}
                style={{ fontSize: 11.5 }}
              >
                ⚡ {isRtl ? 'تعبئة المفتاح السري تلقائياً' : 'Autofill Master Key'}
              </button>
            </form>
          </div>
        ) : (
          <DeveloperFleetDashboard onNavigate={onExitToSchool} />
        )}
      </main>
    </div>
  );
}
