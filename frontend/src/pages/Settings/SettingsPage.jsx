import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolConfig } from '../../context/SchoolConfigContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import ErrorAlert from '../../components/common/ErrorAlert';
import Badge from '../../components/common/Badge';
import SchoolLogo from '../../components/common/SchoolLogo';

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
  const { config, updateSchoolBranding, updateSchoolConfig, resetSchoolBranding } = useSchoolConfig();
  const { isRtl } = useLanguage();
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(isRtl ? 'كلمات المرور الجديدة غير متطابقة' : 'New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError(isRtl ? 'يجب أن تتكون كلمة المرور من 6 خانات على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      toast.success(isRtl ? 'تم تحديث كلمة المرور بنجاح!' : 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 880 }}>
      {/* Profile Overview */}
      <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          {isRtl ? 'الملف الشخصي والبيانات المعتمدة' : 'Authenticated Profile'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, fontSize: 14 }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 12 }}>{isRtl ? 'الاسم الكامل' : 'FULL NAME'}</span>
            <strong>{user?.fullName}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 12 }}>{isRtl ? 'البريد الإلكتروني' : 'EMAIL ADDRESS'}</span>
            <strong>{user?.email}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 12 }}>{isRtl ? 'الصلاحية والرتبة' : 'ASSIGNED ROLE'}</span>
            <Badge type={user?.role} />
          </div>
        </div>
      </div>

      {/* School Official Identity (Locked by System Developer) */}
      <div className="panel" style={{ padding: 24, marginBottom: 24, background: '#ffffff', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🏫</span>
              <span>{isRtl ? 'هوية وشعار المدرسة المعتمد' : 'Official School Emblem & Identity'}</span>
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              {isRtl
                ? 'الهوية المؤسسية المعتمدة التي تظهر في الشهادات المجمعة، بطاقات الطلاب، والتقارير التنفيذية للوزارة واليونيسيف.'
                : 'Approved institutional branding applied across all transcripts, student badges, and official reports.'}
            </p>
          </div>

          <div
            style={{
              background: 'rgba(79, 70, 229, 0.1)',
              color: 'var(--primary)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: 11.5,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid rgba(79, 70, 229, 0.2)',
            }}
          >
            <span>🔒</span>
            <span>{isRtl ? 'معتمد ومقفل من المطور' : 'Managed by System Developer'}</span>
          </div>
        </div>

        <div style={{ background: 'var(--bg-main)', padding: 18, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 4,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {config.logoUrl ? (
                <img src={config.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <SchoolLogo size={48} />
              )}
            </div>

            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>
                {config.schoolNameAr} ({config.schoolCode})
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {config.schoolNameEn} • {config.schoolSloganAr}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>
              <span>{isRtl ? 'اللون الأساسي:' : 'Brand Color:'}</span>
              <div style={{ width: 18, height: 18, borderRadius: 4, background: config.primaryColor || '#4f46e5' }} />
              <span style={{ fontFamily: 'monospace' }}>{config.primaryColor || '#4f46e5'}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>ℹ️</span>
          <span>
            {isRtl
              ? 'ملاحظة: لتغيير الشعار الرسمي أو اسم المدرسة أو ألوان النظام، يُرجى مراجعة مهندس ومطور المنظومة التقني.'
              : 'Notice: To modify official branding, logo, or system theme, please contact your technical system developer.'}
          </span>
        </div>
      </div>

      {/* Official Shift Start Time Panel (Admin Only) */}
      {isAdmin && (
        <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🕒</span>
            <span>{isRtl ? 'توقيت بدء الدوام المدرسي وطابور الصباح' : 'Official Shift Start Time'}</span>
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
            {isRtl
              ? 'يُستخدم هذا التوقيت كمعيار رسمي لاحتساب دقائق التأخير والانضباط الصباحي لجميع المعلمين تلقائياً في دفتر الدوام وكشوف الرقابة.'
              : 'This time serves as the benchmark to automatically calculate teacher tardiness minutes and morning punctuality logs.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 360 }}>
            <input
              type="time"
              className="form-input"
              value={config.schoolStartTime || '07:45'}
              onChange={(e) => {
                updateSchoolConfig({ schoolStartTime: e.target.value });
                toast.success(isRtl ? `تم تحديث بداية الدوام إلى ${e.target.value}` : `Start time updated to ${e.target.value}`);
              }}
              style={{ fontWeight: 700, fontSize: 15, padding: '8px 12px' }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
              {isRtl ? 'صباحاً (معتمد)' : 'AM (Approved)'}
            </span>
          </div>
        </div>
      )}


      {/* Change Password Panel */}
      <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          {isRtl ? 'الأمان وتغيير كلمة المرور' : 'Security & Change Password'}
        </h3>
        {error && <ErrorAlert message={error} />}

        <form onSubmit={handleChangePassword} style={{ maxWidth: 440 }}>
          <div className="form-group">
            <label className="form-label">{isRtl ? 'كلمة المرور الحالية' : 'Current Password'}</label>
            <input
              type="password"
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{isRtl ? 'كلمة المرور الجديدة' : 'New Password'}</label>
            <input
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{isRtl ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}</label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (isRtl ? 'جاري التحديث...' : 'Updating Password...') : (isRtl ? 'تحديث كلمة المرور' : 'Change Password')}
          </button>
        </form>
      </div>

      {/* System Information */}
      <div className="panel" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
          {isRtl ? 'معلومات النظام والبيئة التشغيلية' : 'System & Environment Information'}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          {isRtl
            ? 'نظام إدارة المدرسة الذكي مدعوم بقاعدة بيانات PostgreSQL مع Prisma ORM. كافة الشهادات والتقارير الموحدة متوافقة مع معايير وزارة التربية والتعليم ومنظمة اليونيسيف (UNICEF).'
            : 'Smart School Management System is backed by PostgreSQL and Prisma ORM. All certificates and unified reports adhere to Ministry of Education & UNICEF standard telemetry.'}
        </p>
      </div>
    </div>
  );
}
