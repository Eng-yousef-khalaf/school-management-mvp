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
      toast.success(isRtl ? `مرحباً بك يا مهندس ومطور المنظومة، ${devUser.fullName}!` : `Developer Master Session Unlocked: ${devUser.fullName}`);
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
        background: '#f8fafc',
        color: '#0f172a',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top Standalone Developer Bar */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
            }}
          >
            ⚡
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px' }}>
              {isRtl ? 'بوابة المطور ومهندس المنظومة المستقلة' : 'Standalone System Engineering Hub'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
              YOUSEF KHALAF • MASTER CONTROL & DATABASE TELEMETRY
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isUnlocked && (
            <div
              style={{
                background: '#ecfdf5',
                color: '#047857',
                padding: '6px 14px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 800,
                border: '1px solid #a7f3d0',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>🟢</span>
              <span>{isRtl ? 'جلسة المطور نشطة' : 'Developer Session Active'}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleExit}
            style={{
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '9px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            🏫 {isRtl ? 'الخروج لمنظومة المدرسة' : 'Exit to School App'}
          </button>

          {isUnlocked && (
            <button
              type="button"
              onClick={() => {
                logout();
                toast.success(isRtl ? 'تم قفل جلسة المطور' : 'Developer session locked');
              }}
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
                padding: '9px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🔒 {isRtl ? 'قفل الجلسة' : 'Lock'}
            </button>
          )}
        </div>
      </header>

      {/* Body: Gateway Login or Dashboard */}
      <main style={{ flex: 1, padding: '28px 32px' }}>
        {!isUnlocked ? (
          <div
            style={{
              maxWidth: 460,
              margin: '60px auto',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 18,
              padding: '40px 36px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 18,
                background: '#e0e7ff',
                border: '1px solid #c7d2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 34,
                margin: '0 auto 20px',
              }}
            >
              🔐
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, color: '#0f172a' }}>
              {isRtl ? 'مصادقة المطور العام' : 'Developer Master Authentication'}
            </h2>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 26, lineHeight: 1.6 }}>
              {isRtl
                ? 'بوابة تحكم سرية ومستقلة مخصصة للمطور (يوسف) لفحص الخادم، تشخيص قاعدة البيانات، والصيانة المباشرة.'
                : 'Isolated standalone gateway for platform engineering, database diagnostics, and direct maintenance.'}
            </p>

            {error && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  padding: '12px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 20,
                  textAlign: isRtl ? 'right' : 'left',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                  {isRtl ? 'مفتاح المطور السري (Developer Master Key):' : 'Developer Master Key:'}
                </label>
                <input
                  type="password"
                  value={masterKey}
                  onChange={(e) => setMasterKey(e.target.value)}
                  placeholder="••••••••••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: 8,
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: 15,
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'monospace',
                  }}
                />
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 6, fontWeight: 500 }}>
                  {isRtl ? 'المفتاح الافتراضي للتطوير: YOUSEF_MASTER_2026' : 'Default Master Key: YOUSEF_MASTER_2026'}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                  transition: 'opacity 0.2s',
                }}
              >
                {loading ? (isRtl ? 'جاري التحقق...' : 'Authenticating...') : (isRtl ? '🔓 فتح لوحة المطور' : '🔓 Unlock Developer Hub')}
              </button>
            </form>
          </div>
        ) : (
          <DeveloperFleetDashboard onNavigate={() => {}} />
        )}
      </main>
    </div>
  );
}
