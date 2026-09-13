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
  const { config, updateSchoolBranding, resetSchoolBranding } = useSchoolConfig();
  const { isRtl } = useLanguage();
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // School Identity state for Admin
  const [brandingNameAr, setBrandingNameAr] = useState(config.schoolNameAr || '');
  const [brandingNameEn, setBrandingNameEn] = useState(config.schoolNameEn || '');
  const [brandingSloganAr, setBrandingSloganAr] = useState(config.schoolSloganAr || '');
  const [brandingLogoUrl, setBrandingLogoUrl] = useState(config.logoUrl || '');
  const [brandingColor, setBrandingColor] = useState(config.primaryColor || '#4f46e5');
  const [uploadedLogoName, setUploadedLogoName] = useState('');
  const [brandingSavedSuccess, setBrandingSavedSuccess] = useState(false);
  const logoInputRef = useRef(null);

  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast.error(isRtl ? 'حجم الملف يتجاوز 4 ميجابايت' : 'File size exceeds 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target.result;
      setBrandingLogoUrl(dataUrl);
      setUploadedLogoName(file.name);
      toast.success(isRtl ? 'تم تحميل الشعار الجديد بنجاح من جهازك!' : 'New logo selected successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSchoolBranding = (e) => {
    e.preventDefault();
    updateSchoolBranding({
      schoolNameAr: brandingNameAr.trim() || config.schoolNameAr,
      schoolNameEn: brandingNameEn.trim() || config.schoolNameEn,
      schoolSloganAr: brandingSloganAr.trim() || config.schoolSloganAr,
      logoUrl: brandingLogoUrl,
      primaryColor: brandingColor,
    });
    setBrandingSavedSuccess(true);
    toast.success(isRtl ? 'تم تحديث هوية وشعار المدرسة وتطبيقها على كافة الشهادات والتقارير بنجاح!' : 'School identity & logo updated across all certificates and reports!');
    setTimeout(() => setBrandingSavedSuccess(false), 4000);
  };

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

      {/* Admin-Only: Official School Identity & Universal Logo Config */}
      {isAdmin && (
        <div className="panel" style={{ padding: 24, marginBottom: 24, border: '2px solid rgba(79, 70, 229, 0.3)', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🏫</span>
                <span>{isRtl ? 'هوية وشعار المدرسة الرسمي الشامل' : 'Official School Identity & Universal Logo'}</span>
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {isRtl ? 'هذا الشعار والهوية يدخلان تلقائياً في كافة الشهادات المجمعة، بطاقات الطلاب، والتقارير التنفيذية للوزارة واليونيسيف' : 'This custom logo is applied automatically across all transcripts, student badges, and official UNICEF/MoE reports'}
              </p>
            </div>
            {brandingSavedSuccess && (
              <span className="badge badge-active" style={{ fontSize: 12, padding: '4px 10px' }}>
                ✅ {isRtl ? 'تم الحفظ والتعميم' : 'Saved & Propagated'}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSchoolBranding}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 20 }}>
              {/* Logo Selection & Preview */}
              <div style={{ background: '#f8fafc', padding: 18, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <label className="form-label" style={{ fontWeight: 800, color: '#334155' }}>
                  {isRtl ? 'شعار المدرسة المعتمد:' : 'Official School Logo:'}
                </label>

                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                  style={{ display: 'none' }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '14px 0' }}>
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: 12,
                    border: '2px solid #cbd5e1',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 4,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                  }}>
                    {brandingLogoUrl ? (
                      <img
                        src={brandingLogoUrl}
                        alt="Logo"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8 }}
                      />
                    ) : (
                      <SchoolLogo size={56} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                      {brandingLogoUrl ? (isRtl ? 'تم تعيين شعار مخصص للمدرسة' : 'Custom School Logo Active') : (isRtl ? 'الشعار المؤسسي الافتراضي' : 'Default Official Emblem')}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                      {uploadedLogoName || (brandingLogoUrl ? (isRtl ? 'شعار محفوظ' : 'Stored logo') : (isRtl ? 'شعار المنظومة الأكاديمية' : 'Default emblem'))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => logoInputRef.current?.click()}
                    style={{ background: '#eef2ff', borderColor: '#818cf8', color: '#4338ca', fontWeight: 700 }}
                  >
                    📁 {isRtl ? 'اختيار صورة من الجهاز' : 'Browse Local Files'}
                  </button>

                  {brandingLogoUrl && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        setBrandingLogoUrl('');
                        setUploadedLogoName('');
                      }}
                      style={{ fontSize: 11 }}
                    >
                      ❌ {isRtl ? 'إعادة للافتراضي' : 'Reset Logo'}
                    </button>
                  )}
                </div>

                <div style={{ marginTop: 12 }}>
                  <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>
                    {isRtl ? 'أو أدخل رابط صورة خارجي (URL):' : 'Or direct Image URL:'}
                  </label>
                  <input
                    type="url"
                    className="form-input"
                    style={{ fontSize: 12 }}
                    placeholder="https://example.com/logo.png"
                    value={brandingLogoUrl.startsWith('data:') ? '' : brandingLogoUrl}
                    onChange={(e) => setBrandingLogoUrl(e.target.value)}
                  />
                </div>
              </div>

              {/* School Names & Slogan */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="form-label">{isRtl ? 'اسم المدرسة (بالعربية):' : 'School Name (Arabic):'}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={brandingNameAr}
                    onChange={(e) => setBrandingNameAr(e.target.value)}
                    placeholder="مدرسة القدس الأساسية النموذجية"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">{isRtl ? 'اسم المدرسة (بالإنجليزية):' : 'School Name (English):'}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={brandingNameEn}
                    onChange={(e) => setBrandingNameEn(e.target.value)}
                    placeholder="Al-Quds Model School"
                  />
                </div>

                <div>
                  <label className="form-label">{isRtl ? 'شعار / شعار المدرسة اللفظي (Slogan):' : 'School Slogan:'}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={brandingSloganAr}
                    onChange={(e) => setBrandingSloganAr(e.target.value)}
                    placeholder="التميز الأكاديمي والتربوي"
                  />
                </div>

                <div>
                  <label className="form-label">{isRtl ? 'اللون الأساسي للنظام:' : 'Brand Primary Color:'}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="color"
                      value={brandingColor}
                      onChange={(e) => setBrandingColor(e.target.value)}
                      style={{ width: 42, height: 38, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }}
                    />
                    <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700 }}>{brandingColor}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <button type="submit" className="btn btn-primary">
                💾 {isRtl ? 'حفظ وتعميم هوية وشعار المدرسة' : 'Save & Propagate School Identity'}
              </button>
            </div>
          </form>
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
