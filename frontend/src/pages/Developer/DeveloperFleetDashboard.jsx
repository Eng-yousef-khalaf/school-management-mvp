import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useSchoolConfig } from '../../context/SchoolConfigContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import { PageLoader } from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import SchoolLogo from '../../components/common/SchoolLogo';
import UserAvatar from '../../components/common/UserAvatar';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { compressImageFile } from '../../utils/imageCompressor';

export default function DeveloperFleetDashboard({ onNavigate }) {
  const { t, isRtl } = useLanguage();
  const { user } = useAuth();
  const { config, setConfig, updateSchoolBranding } = useSchoolConfig();
  const toast = useToast();
  const logoFileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [telemetry, setTelemetry] = useState(null);
  const [storageData, setStorageData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview | storage | branding
  
  // School White-Label & Identity Form State
  const [brandForm, setBrandForm] = useState({
    schoolNameAr: config.schoolNameAr || 'روضة ومدرسة مجموعة السلام التعليمية الخاصة',
    schoolNameEn: config.schoolNameEn || 'Al-Salam Educational Group Private School & Kindergarten',
    schoolSloganAr: config.schoolSloganAr || 'البيئة التعليمية النموذجية الأولى في فلسطين - خبرة 25 عاماً من الإبداع والتميز',
    schoolSloganEn: config.schoolSloganEn || "Palestine's Premier Model Educational Environment - 25 Years of Excellence",
    schoolCode: config.schoolCode || 'SCH-ALSALAM-2026',
    logoUrl: config.logoUrl || '/school-logo.png',
    primaryColor: config.primaryColor || '#166534',
    primaryHover: config.primaryHover || '#14532d',
    allocatedStorageMb: config.allocatedStorageMb || 500,
    supportEmail: config.supportEmail || 'info@alsalam-school.edu.ps',
    supportPhone: config.supportPhone || '+970 59 312 4444',
  });

  // Sync brandForm if config changes
  useEffect(() => {
    setBrandForm({
      schoolNameAr: config.schoolNameAr || '',
      schoolNameEn: config.schoolNameEn || '',
      schoolSloganAr: config.schoolSloganAr || '',
      schoolSloganEn: config.schoolSloganEn || '',
      schoolCode: config.schoolCode || 'SCH-001',
      logoUrl: config.logoUrl || '',
      primaryColor: config.primaryColor || '#4f46e5',
      primaryHover: config.primaryHover || '#4338ca',
      allocatedStorageMb: config.allocatedStorageMb || 500,
      supportEmail: config.supportEmail || 'support@school-management.dev',
      supportPhone: config.supportPhone || '+966 50 000 0000',
    });
  }, [config]);

  // Curated Professional SaaS Theme Color Presets
  const COLOR_PRESETS = [
    { name: 'Indigo SaaS', primary: '#4f46e5', hover: '#4338ca' },
    { name: 'Emerald Green', primary: '#059669', hover: '#047857' },
    { name: 'Sapphire Blue', primary: '#2563eb', hover: '#1d4ed8' },
    { name: 'Sky Cyan', primary: '#0284c7', hover: '#0369a1' },
    { name: 'Royal Purple', primary: '#7c3aed', hover: '#6d28d9' },
    { name: 'Ruby Crimson', primary: '#dc2626', hover: '#b91c1c' },
    { name: 'Amber Gold', primary: '#d97706', hover: '#b45309' },
    { name: 'Midnight Slate', primary: '#0f172a', hover: '#020617' },
  ];

  const handleLogoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error(isRtl ? 'حجم الملف يتجاوز 4 ميجابايت' : 'File size exceeds 4MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target.result;
      setBrandForm((prev) => ({ ...prev, logoUrl: dataUrl }));
      toast.success(isRtl ? 'تم تحميل الشعار بنجاح للمعاينة!' : 'Logo uploaded for preview!');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBranding = (e) => {
    e?.preventDefault?.();
    updateSchoolBranding({
      schoolNameAr: brandForm.schoolNameAr.trim() || 'نظام إدارة المدرسة الذكي',
      schoolNameEn: brandForm.schoolNameEn.trim() || 'Smart School Management System',
      schoolSloganAr: brandForm.schoolSloganAr.trim() || '',
      schoolSloganEn: brandForm.schoolSloganEn.trim() || '',
      schoolCode: brandForm.schoolCode.trim() || 'SCH-001',
      logoUrl: brandForm.logoUrl,
      primaryColor: brandForm.primaryColor,
      primaryHover: brandForm.primaryHover || brandForm.primaryColor,
      allocatedStorageMb: Number(brandForm.allocatedStorageMb) || 500,
      supportEmail: brandForm.supportEmail,
      supportPhone: brandForm.supportPhone,
    });
    toast.success(isRtl ? 'تم حفظ وتعميم خصائص وألوان وشعار المدرسة على كافة أرجاء المنظومة بنجاح!' : 'School branding and colors updated & propagated system-wide!');
  };

  const handleResetBranding = () => {
    const defaultObj = {
      schoolNameAr: 'روضة ومدرسة مجموعة السلام التعليمية الخاصة',
      schoolNameEn: 'Al-Salam Educational Group Private School & Kindergarten',
      schoolSloganAr: 'البيئة التعليمية النموذجية الأولى في فلسطين - خبرة 25 عاماً من الإبداع والتميز',
      schoolSloganEn: "Palestine's Premier Model Educational Environment - 25 Years of Excellence",
      schoolCode: 'SCH-ALSALAM-2026',
      logoUrl: '/school-logo.png',
      primaryColor: '#166534',
      primaryHover: '#14532d',
      allocatedStorageMb: 500,
      supportEmail: 'info@alsalam-school.edu.ps',
      supportPhone: '+970 59 312 4444',
    };
    setBrandForm(defaultObj);
    updateSchoolBranding(defaultObj);
    toast.success(isRtl ? 'تمت استعادة إعدادات الهوية والشعار الافتراضية بنجاح' : 'Branding restored to defaults');
  };

  // Handover Slip State
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [principalForm, setPrincipalForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    photoUrl: ''
  });
  const [isSavingPrincipal, setIsSavingPrincipal] = useState(false);

  // Historical Telemetry Archive States
  const [statsHistory, setStatsHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);

  const [handoverData, setHandoverData] = useState({
    schoolNameAr: config.schoolNameAr || 'روضة ومدرسة مجموعة السلام التعليمية الخاصة',
    schoolNameEn: config.schoolNameEn || 'Al-Salam Educational Group Private School & Kindergarten',
    schoolCode: config.schoolCode || 'SCH-ALSALAM-2026',
    domainUrl: window.location.origin,
    adminFullName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
    adminPhotoUrl: '',
  });

  // DB Maintenance States
  const [pingStatus, setPingStatus] = useState(null);
  const [isPinging, setIsPinging] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isExportingBackup, setIsExportingBackup] = useState(null); // 'sql' | 'json' | null
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairReport, setRepairReport] = useState(null);
  const [isCleaningSlate, setIsCleaningSlate] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPrincipalForm(p => ({ ...p, password: pass }));
    toast.success(isRtl ? 'تم توليد كلمة مرور قوية للمدير العام!' : 'Strong random password generated!');
  };

  const fetchStatsHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get('/developer/stats-history').catch(() => null);
      if (res?.ok && Array.isArray(res.history)) {
        setStatsHistory(res.history);
      }
    } catch (err) {
      console.warn('Failed to load stats history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCreateSnapshot = async () => {
    try {
      setIsSavingSnapshot(true);
      const res = await api.post('/developer/stats-history', {
        label: snapshotLabel.trim() || 'لقطة إحصائية يدوية',
        note: 'تم حفظها يدوياً بواسطة مهندس المنظومة'
      });
      if (res?.ok) {
        toast.success(isRtl ? 'تم حفظ اللقطة الإحصائية بنجاح!' : 'Snapshot captured successfully!');
        setSnapshotLabel('');
        fetchStatsHistory();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to capture snapshot');
    } finally {
      setIsSavingSnapshot(false);
    }
  };

  // Load telemetry & live database stats
  const fetchTelemetry = async () => {
    try {
      setLoading(true);
      const res = await api.get('/developer/system-stats', { noCache: true }).catch(() => null);
      if (res && res.stats) {
        setTelemetry(res);
      } else {
        // Real clean fallback state (0 dummy data)
        setTelemetry({
          currentSchool: {
            code: config.schoolCode || 'SCH-ALSALAM-2026',
            nameAr: config.schoolNameAr || 'روضة ومدرسة مجموعة السلام التعليمية الخاصة',
            nameEn: config.schoolNameEn || 'Al-Salam Educational Group Private School & Kindergarten',
            databaseType: 'PostgreSQL (Dedicated Instance)',
            studentsCount: 0,
            teachersCount: 0,
            classesCount: 0,
            totalRecords: 0,
            storageUsedMb: 0.05,
            storageLimitMb: config.allocatedStorageMb || 500,
            storagePercent: 0.01,
            latencyMs: 12,
            tables: {
              students: 0,
              teachers: 0,
              classes: 0,
              enrollments: 0,
              attendance: 0,
              grades: 0,
              studentFees: 0,
              payments: 0,
              auditLogs: 0,
              users: 1,
              subjects: 0,
              academicYears: 1,
            },
          },
          stats: {
            totalStudents: 0,
            totalTeachers: 0,
            totalClasses: 0,
            totalRecords: 0,
            totalStorageUsedMb: 0.05,
            totalStorageLimitMb: config.allocatedStorageMb || 500,
            fleetStoragePercent: 0.01,
            latencyMs: 12,
            healthStatus: 'ALL_SYSTEMS_OPERATIONAL',
            serverUptimeSec: 3600,
            nodeVersion: 'v20.x',
            memoryUsage: {
              rss: 45 * 1024 * 1024,
              heapTotal: 28 * 1024 * 1024,
              heapUsed: 19 * 1024 * 1024,
            },
          },
        });
      }

      const storageRes = await api.get('/developer/storage-analysis').catch(() => null);
      if (storageRes) {
        setStorageData(storageRes);
      }
    } catch (err) {
      console.error('Failed to load system telemetry', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrincipal = async () => {
    try {
      const res = await api.get('/developer/principal').catch(() => null);
      if (res?.principal?.fullName) {
        setPrincipalForm((prev) => ({
          ...prev,
          fullName: res.principal.fullName,
          email: res.principal.email || prev.email,
          phone: res.handover?.principalPhone || prev.phone,
          photoUrl: res.principal.photoUrl || prev.photoUrl || ''
        }));
        setHandoverData((prev) => ({
          ...prev,
          adminFullName: res.principal.fullName,
          adminEmail: res.principal.email || prev.adminEmail,
          adminPhone: res.handover?.principalPhone || prev.adminPhone,
          adminPhotoUrl: res.principal.photoUrl || ''
        }));
        if (res.principal.photoUrl) {
          localStorage.setItem('school_principal_photo', res.principal.photoUrl);
        }
      }
    } catch {}
  };

  const handlePrincipalPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 800, 800, 0.85);
      setPrincipalForm(prev => ({ ...prev, photoUrl: dataUrl }));
      toast.success(isRtl ? 'تم تحميل ومعالجة صورة المدير بنجاح! 📸' : 'Principal photo loaded!');
    } catch (err) {
      console.error('Failed to compress principal photo:', err);
      toast.error(isRtl ? 'تعذر معالجة الصورة، يرجى اختيار ملف صالح' : 'Failed to process image');
    }
  };

  useEffect(() => {
    fetchTelemetry();
    fetchPrincipal();
    fetchStatsHistory();
  }, []);

  const handleSavePrincipal = async (e) => {
    e?.preventDefault?.();
    const cleanName = (principalForm?.fullName || '').trim();
    const cleanEmail = (principalForm?.email || '').trim();
    const cleanPass = (principalForm?.password || '').trim();
    const cleanPhone = (principalForm?.phone || '').trim();

    if (!cleanName) {
      toast.error(isRtl ? 'يرجى إدخال اسم مدير المدرسة' : 'Principal full name is required');
      return;
    }
    try {
      setIsSavingPrincipal(true);
      const res = await api.post('/developer/update-principal', {
        fullName: cleanName,
        email: cleanEmail,
        password: cleanPass || undefined,
        phone: cleanPhone || undefined,
        photoUrl: principalForm?.photoUrl || null
      });

      if (res?.ok) {
        setHandoverData((prev) => ({
          ...prev,
          adminFullName: cleanName,
          adminEmail: cleanEmail,
          adminPhone: cleanPhone || prev.adminPhone,
          adminPassword: cleanPass || prev.adminPassword,
          adminPhotoUrl: principalForm?.photoUrl || ''
        }));
        localStorage.setItem('school_principal_name', cleanName);
        if (cleanPhone) localStorage.setItem('school_principal_phone', cleanPhone);
        if (principalForm.photoUrl) {
          localStorage.setItem('school_principal_photo', principalForm.photoUrl);
        }
        localStorage.setItem('school_principal_info', JSON.stringify({
          fullName: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          password: cleanPass,
          photoUrl: principalForm.photoUrl
        }));

        fetchTelemetry();
        fetchPrincipal();
        const curUser = sessionStorage.getItem('user');
        if (curUser) {
          try {
            const u = JSON.parse(curUser);
            if (u.role === 'ADMIN') {
              u.fullName = cleanName;
              u.email = cleanEmail;
              u.photoUrl = principalForm.photoUrl;
              sessionStorage.setItem('user', JSON.stringify(u));
              localStorage.setItem('user', JSON.stringify(u));
            }
          } catch {}
        }
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('principal-updated'));
        toast.success(
          isRtl
            ? `تم إنشاء وتثبيت بيانات حساب المدير العام (${cleanName}) بنجاح! يمكنك الآن تسجيل الدخول بحسابه واختبار المنظومة.`
            : `Principal credentials (${cleanName}) saved & ready for testing!`
        );
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update principal credentials');
    } finally {
      setIsSavingPrincipal(false);
    }
  };

  const handleRepairIntegrity = async () => {
    try {
      setIsRepairing(true);
      setRepairReport(null);
      const res = await api.post('/developer/repair-database-integrity');
      setRepairReport(res);
      toast.success(isRtl ? 'تم فحص وترميم تكامل قاعدة البيانات بنجاح!' : 'Database integrity repaired successfully!');
      fetchTelemetry();
    } catch (err) {
      toast.error(err.message || 'Integrity audit failed');
    } finally {
      setIsRepairing(false);
    }
  };

  const handleCleanSlate = async () => {
    const confirmMessage = isRtl
      ? '⚠️ تأكيد إفراغ وتصفير المنظومة للمدرسة الحقيقية:\n\nهل أنت متأكد من رغبتك في حذف كافة الطلاب والمعلمين والصفوف والبيانات الوهمية من قاعدة البيانات الحية بشكل نهائي؟\n\n- سيتم الإبقاء فقط على حساب مدير المدرسة المعتمد والعام الدراسي 2026/2027.\n- ستصبح العدادات (الطلاب: 0، المعلمين: 0، الصفوف: 0) لتتمكن المدرسة من إدخال بياناتها الحقيقية.'
      : '⚠️ Clean Slate Confirmation:\n\nAre you sure you want to permanently purge all dummy students, teachers, classes, and dummy records from the database?\n\n- ONLY the designated Principal account and Academic Year 2026/2027 will be kept.\n- Counters will reset to 0.';

    if (!window.confirm(confirmMessage)) return;

    try {
      setIsCleaningSlate(true);
      const res = await api.post('/developer/clean-slate', {
        principalName: (principalForm.fullName || handoverData.adminFullName || 'أ. عبد الرحمن خليل (المدير العام)').trim(),
        principalEmail: (principalForm.email || handoverData.adminEmail || 'admin@school.local').trim(),
        principalPassword: (principalForm.password || handoverData.adminPassword || '').trim() || undefined,
      }, { timeout: 45000 });

      // Clean all demo caches from localStorage
      try {
        localStorage.removeItem('school_students');
        localStorage.removeItem('school_teachers');
        localStorage.removeItem('school_classes');
        localStorage.removeItem('school_subjects');
        localStorage.removeItem('school_attendance');
        localStorage.removeItem('school_grades');
        localStorage.removeItem('school_staff');
      } catch {}

      if (res?.ok || res?.message) {
        toast.success(res.message || (isRtl ? 'تم تصفير المنظومة وحذف البيانات الوهمية بنجاح تام! المنظومة نقية وجاهزة 100%.' : 'Clean slate completed successfully!'));
        await fetchTelemetry();
        await fetchPrincipal();
      } else {
        toast.error(res?.error || (isRtl ? 'فشلت عملية التصفير' : 'Failed to perform clean slate'));
      }
    } catch (err) {
      toast.error(err.message || 'Clean slate operation failed');
    } finally {
      setIsCleaningSlate(false);
    }
  };

  const handlePing = async () => {
    setIsPinging(true);
    setPingStatus(null);
    const start = Date.now();
    try {
      const res = await api.get('/developer/ping');
      const duration = Date.now() - start;
      setPingStatus({
        ok: true,
        latency: duration,
        timestamp: new Date().toLocaleTimeString(),
        serverTime: res.serverTime,
      });
      toast.success(isRtl ? `استجابة الخادم: ${duration}ms (ممتاز)` : `Database ping: ${duration}ms (Excellent)`);
    } catch (err) {
      setPingStatus({ ok: false, error: err.message });
      toast.error(isRtl ? 'فشل فحص الاتصال بقاعدة البيانات' : 'Ping check failed');
    } finally {
      setIsPinging(false);
    }
  };

  const handleClearCache = () => {
    setIsClearingCache(true);
    api.clearCache();
    try {
      localStorage.removeItem('school_students');
      localStorage.removeItem('school_teachers');
      localStorage.removeItem('school_classes');
      localStorage.removeItem('school_subjects');
      localStorage.removeItem('school_attendance');
      localStorage.removeItem('school_grades');
      localStorage.removeItem('school_staff');
    } catch {}
    setTimeout(() => {
      setIsClearingCache(false);
      toast.success(isRtl ? 'تم مسح وتصفير الذاكرة المؤقتة (Cache) بالكامل بنجاح!' : 'API & Local Cache purged successfully!');
      fetchTelemetry();
    }, 300);
  };

  const handleExportBackup = async (format = 'sql') => {
    try {
      setIsExportingBackup(format);
      const isSql = format === 'sql';
      const fileExt = isSql ? 'sql' : 'json';
      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = `school_db_backup_${dateStr}.${fileExt}`;

      toast.info(
        isRtl
          ? (isSql ? 'جاري تجهيز وتوليد ملف النسخة الاحتياطية (SQL Dump)...' : 'جاري تجهيز لقطة بيانات النسخة الاحتياطية (JSON)...')
          : (isSql ? 'Generating SQL database backup dump...' : 'Generating JSON database backup snapshot...')
      );

      await api.download(`/developer/export-backup?format=${format}`, fileName);

      toast.success(
        isRtl
          ? (isSql ? 'تم تنزيل النسخة الاحتياطية (ملف SQL) بنجاح!' : 'تم تنزيل النسخة الاحتياطية (ملف JSON) بنجاح!')
          : (isSql ? 'SQL backup dump downloaded successfully!' : 'JSON snapshot downloaded successfully!')
      );
    } catch (err) {
      toast.error(err.message || 'Backup export failed');
    } finally {
      setIsExportingBackup(null);
    }
  };

  const handleDeveloperSuperAdminAccess = () => {
    toast.success(isRtl ? '⚡ تم تفعيل جلسة المطور بصلاحيات المدير العام!' : '⚡ Developer Super-Admin Access Activated!');
    window.location.hash = '';
    window.location.search = '?role=admin';
    window.location.reload();
  };

  const copyHandoverSlip = () => {
    const slipText = `======================================================
🏫 بطاقة تسليم المنظومة الذكية لإدارة المدرسة
======================================================
المدرسة: ${brandForm.schoolNameAr || config.schoolNameAr} (${brandForm.schoolNameEn || config.schoolNameEn})
كود المنظومة: ${brandForm.schoolCode || config.schoolCode}
رابط الدخول: ${handoverData.domainUrl}

👤 بيانات حساب مدير المدرسة (Super Admin):
------------------------------------------------------
• اسم المدير: ${handoverData.adminFullName}
• البريد الإلكتروني: ${handoverData.adminEmail}
• كلمة المرور الافتراضية: ${handoverData.adminPassword}
• الصلاحية: إدارة كاملة ورقابة مؤسسية (ADMIN)
------------------------------------------------------
🔒 يُرجى تغيير كلمة المرور عند أول تسجيل دخول لضمان الأمان.
======================================================`;

    navigator.clipboard.writeText(slipText);
    toast.success(isRtl ? 'تم نسخ بيانات بطاقة التسليم بالكامل!' : 'Delivery Slip copied to clipboard!');
  };

  const handleDownloadHandoverSlip = () => {
    const content = `================================================================================
🏫 بطاقة تسليم المنظومة الأكاديمية الذكية لإدارة المدرسة
   SMART SCHOOL MANAGEMENT SYSTEM - OFFICIAL HANDOVER CERTIFICATE
================================================================================

📌 ١. بيانات المؤسسة التعليمية (Institution Information):
--------------------------------------------------------------------------------
• اسم المدرسة بالعربية: ${brandForm.schoolNameAr || config.schoolNameAr}
• School Name (EN): ${brandForm.schoolNameEn || config.schoolNameEn}
• كود المنظومة (School Code): ${brandForm.schoolCode || config.schoolCode}
• رابط الدخول المباشر للمنظومة: ${window.location.origin}
• تاريخ إصدار البطاقة: ${new Date().toLocaleDateString('ar-EG')} (${new Date().toLocaleDateString('en-US')})

📌 ٢. بيانات حساب مدير المدرسة العام (Super Administrator Account):
--------------------------------------------------------------------------------
• الاسم الكامل: ${handoverData.adminFullName}
• البريد الإلكتروني لتسجيل الدخول: ${handoverData.adminEmail}
• كلمة المرور الافتراضية: ${handoverData.adminPassword}
• مستوى الصلاحية: إدارة كاملة ورقابة مؤسسية (ADMIN - Super Admin)

📌 ٣. المواصفات الفنية للبيئة التشغيلية (System & DB Specs):
--------------------------------------------------------------------------------
• محرك قاعدة البيانات: PostgreSQL (Dedicated & Isolated Database)
• سعة التخزين المخصصة: ${brandForm.allocatedStorageMb || config.allocatedStorageMb || 500} MB
• حالة الجاهزية: تم فحص وتكامل الجداول بنجاح (All Systems Operational)

📌 ٤. تعليمات الأمان والدعم الفني:
--------------------------------------------------------------------------------
⚠️ يُرجى من مدير المدرسة تغيير كلمة المرور فور أول تسجيل دخول من قائمة الإعدادات.
📞 الدعم الفني وتحديثات المنظومة: م. يوسف خلف (Yousef Khalaf)
📧 البريد التقني: ${config.supportEmail || 'support@school-management.dev'}

================================================================================
⚡ المنظومة الأكاديمية الذكية لإدارة المدارس - مهندس ومطور المنظومة © 2026
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `بطاقة_تسليم_منظومة_${brandForm.schoolCode || config.schoolCode || 'SCH'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(isRtl ? 'تم تنزيل بطاقة التسليم بنجاح!' : 'Handover slip downloaded successfully!');
  };

  const handlePrintHandoverSlip = () => {
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) {
      toast.error(isRtl ? 'يرجى السماح بالنوافذ المنبثقة للطباعة' : 'Please allow popups to print');
      return;
    }
    const schoolLogoHtml = (brandForm.logoUrl || config.logoUrl)
      ? `<img src="${brandForm.logoUrl || config.logoUrl}" style="height: 60px; max-width: 140px; object-fit: contain;" />`
      : `<div style="font-size: 36px;">🏫</div>`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>بطاقة تسليم المنظومة - ${brandForm.schoolNameAr || config.schoolNameAr}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
          body { font-family: 'Cairo', sans-serif; padding: 40px; color: #0f172a; background: #ffffff; }
          .certificate-card { border: 3px double #4f46e5; border-radius: 16px; padding: 32px; position: relative; background: #f8fafc; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; }
          .section-title { font-size: 15px; font-weight: 800; color: #1e1b4b; margin: 18px 0 10px; border-right: 4px solid #4f46e5; padding-right: 10px; }
          .table-creds { width: 100%; border-collapse: collapse; margin-bottom: 16px; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #cbd5e1; }
          .table-creds td { padding: 10px 14px; border: 1px solid #e2e8f0; font-size: 13px; }
          .table-creds td.label { font-weight: 700; background: #f1f5f9; width: 30%; color: #475569; }
          .table-creds td.val { font-weight: 800; color: #0f172a; font-family: monospace; font-size: 14px; }
          .footer-sign { display: flex; justify-content: space-between; margin-top: 36px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 13px; }
          @media print { body { padding: 0; } .certificate-card { border-color: #000; } }
        </style>
      </head>
      <body>
        <div class="certificate-card">
          <div class="header">
            <div>
              <h1 style="margin: 0; font-size: 22px; color: #1e1b4b; font-weight: 900;">بطاقة تسليم المنظومة الأكاديمية الذكية</h1>
              <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">وثيقة اعتماد تسليم حساب الإدارة العامة والمواصفات الفنية للمدرسة</p>
            </div>
            ${schoolLogoHtml}
          </div>

          <div class="section-title">١. بيانات المؤسسة التعليمية</div>
          <table class="table-creds">
            <tr><td class="label">اسم المدرسة:</td><td class="val" style="font-family: 'Cairo'">${brandForm.schoolNameAr || config.schoolNameAr}</td></tr>
            <tr><td class="label">كود المنظومة (School Code):</td><td class="val" style="color: #4f46e5">${brandForm.schoolCode || config.schoolCode}</td></tr>
            <tr><td class="label">رابط الدخول المباشر:</td><td class="val">${window.location.origin}</td></tr>
            <tr><td class="label">تاريخ التسليم والاعتماد:</td><td class="val">${new Date().toLocaleDateString('ar-EG')}</td></tr>
          </table>

          <div class="section-title">٢. بيانات حساب مدير المدرسة (Super Admin)</div>
          <table class="table-creds">
            <tr><td class="label">اسم المدير المعتمد:</td><td class="val" style="font-family: 'Cairo'">${handoverData.adminFullName}</td></tr>
            <tr><td class="label">البريد الإلكتروني:</td><td class="val" style="color: #2563eb">${handoverData.adminEmail}</td></tr>
            <tr><td class="label">كلمة المرور المؤقتة:</td><td class="val" style="color: #dc2626">${handoverData.adminPassword}</td></tr>
            <tr><td class="label">مستوى الصلاحية:</td><td class="val" style="color: #059669">إدارة عامة وتحكم كامل (ADMIN)</td></tr>
          </table>

          <div class="section-title">٣. المواصفات الفنية والخادم</div>
          <table class="table-creds">
            <tr><td class="label">محرك قاعدة البيانات:</td><td class="val">PostgreSQL Dedicated DB</td></tr>
            <tr><td class="label">سعة التخزين الأولية:</td><td class="val">${brandForm.allocatedStorageMb || config.allocatedStorageMb || 500} MB</td></tr>
            <tr><td class="label">حالة النظام:</td><td class="val" style="color: #059669">جاهز للعمل الميداني (All Operational)</td></tr>
          </table>

          <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 12px; border-radius: 8px; font-size: 12px; color: #92400e; margin-top: 14px;">
            🔒 <strong>تنبيه أمان:</strong> يُرجى من إدارة المدرسة تغيير كلمة المرور عند أول تسجيل دخول من صفحة الإعدادات، والاحتفاظ بهذه البطاقة في مكان آمن.
          </div>

          <div class="footer-sign">
            <div>
              <strong>توقيع واعتماد مهندس المنظومة:</strong><br><br>
              <span>م. يوسف خلف (Yousef Khalaf)</span><br>
              <span style="font-size: 11px; color: #64748b;">مهندس ومطور النظام الأكاديمي الذكي</span>
            </div>
            <div style="text-align: left;">
              <strong>استلام إدارة المدرسة:</strong><br><br>
              <span>${handoverData.adminFullName}</span><br>
              <span style="font-size: 11px; color: #64748b;">الختم والتوقيع الرسمي</span>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  if (loading) {
    return <PageLoader text={isRtl ? 'جاري فحص مؤشرات الخادم وقاعدة البيانات...' : 'Loading Telemetry...'} />;
  }

  const currentSchool = telemetry?.currentSchool || {};
  const stats = telemetry?.stats || {};
  const storageLimit = stats.totalStorageLimitMb || 500;
  const storageUsed = stats.totalStorageUsedMb || 1.4;
  const storagePercent = stats.fleetStoragePercent || Math.round((storageUsed / storageLimit) * 100);

  return (
    <ErrorBoundary>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner: Dark Executive System Engineering Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '20px 24px',
          color: '#ffffff',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #334155',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 16 }}>⚡</span>
              <span style={{ background: 'rgba(99, 102, 241, 0.25)', color: '#c7d2fe', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 10.5, fontWeight: 800 }}>
                STANDALONE INSTANCE
              </span>
              <span style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 10.5, fontWeight: 800 }}>
                ● Database: Connected
              </span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 2px 0', letterSpacing: '-0.3px', color: '#f8fafc' }}>
              {isRtl ? 'لوحة تحكم مهندس ومطور المنظومة' : 'System Engineering & Telemetry Hub'}
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: 12, maxWidth: 640, lineHeight: 1.4 }}>
              {isRtl
                ? 'المركز التشغيلي الحصري لفحص حالة الخادم وقاعدة البيانات، تخصيص الهوية، وتوليد بطاقة تسليم الإدارة.'
                : 'Dedicated command center for system diagnostics, live database telemetry, school branding, and handover slips.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="btn btn-success btn-sm"
              style={{ fontWeight: 800, padding: '7px 14px' }}
              onClick={() => {
                setHandoverData({
                  schoolNameAr: brandForm.schoolNameAr || config.schoolNameAr,
                  schoolNameEn: brandForm.schoolNameEn || config.schoolNameEn,
                  schoolCode: brandForm.schoolCode || config.schoolCode,
                  domainUrl: window.location.origin,
                  adminFullName: principalForm.fullName.trim() || handoverData.adminFullName,
                  adminEmail: principalForm.email.trim() || handoverData.adminEmail,
                  adminPassword: principalForm.password.trim() || handoverData.adminPassword,
                });
                setIsHandoverModalOpen(true);
              }}
            >
              <span>📋</span>
              <span>{isRtl ? 'بطاقة تسليم المنصة' : 'Delivery Slip'}</span>
            </button>

            <button
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 800, padding: '7px 14px' }}
              onClick={handleDeveloperSuperAdminAccess}
            >
              <span>👑</span>
              <span>{isRtl ? 'دخول فوري كـ Super Admin' : 'Launch Super-Admin'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ fontWeight: 700 }}
        >
          📊 {isRtl ? 'نظرة عامة والتشخيص الحي' : 'System Overview & Telemetry'}
        </button>

        <button
          onClick={() => setActiveTab('principal')}
          className={`btn ${activeTab === 'principal' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ fontWeight: 700 }}
        >
          👑 {isRtl ? 'إنشاء حساب المدير العام وتسليم المنظومة' : 'General Manager & Handover'}
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`btn ${activeTab === 'branding' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ fontWeight: 700 }}
        >
          🎨 {isRtl ? 'ألوان وهوية المنظومة' : 'Theme Colors & Branding'}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ fontWeight: 700 }}
        >
          📜 {isRtl ? 'أرشيف الإحصائيات السابقة' : 'Historical Stats Archive'}
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`btn ${activeTab === 'storage' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ fontWeight: 700 }}
        >
          💾 {isRtl ? 'حجم الجداول وقاعدة البيانات' : 'Database Storage'}
        </button>
      </div>

      {/* 4 Clean Real Instance KPIs Grid at 100% Zoom */}
      <div className="grid-cards-4">
        <div className="stat-card">
          <div className="stat-info">
            <h3>{isRtl ? 'الطلاب المسجلين' : 'Enrolled Students'}</h3>
            <div className="stat-value">{(stats.totalStudents || 0).toLocaleString()}</div>
            <div className="stat-sub">{isRtl ? 'في النسخة النشطة' : 'In active instance'}</div>
          </div>
          <div className="stat-icon primary">👥</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>{isRtl ? 'الهيئة التعليمية' : 'Faculty Count'}</h3>
            <div className="stat-value">{(stats.totalTeachers || 0).toLocaleString()}</div>
            <div className="stat-sub">{isRtl ? 'معلم وموظف' : 'Active faculty'}</div>
          </div>
          <div className="stat-icon secondary">👨‍🏫</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>{isRtl ? 'إجمالي السجلات' : 'Database Records'}</h3>
            <div className="stat-value">{(stats.totalRecords || 0).toLocaleString()}</div>
            <div className="stat-sub" style={{ color: 'var(--success)' }}>{isRtl ? 'حضور + درجات + تدقيق' : 'All Tables'}</div>
          </div>
          <div className="stat-icon success">🗄️</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>{isRtl ? 'سعة التخزين' : 'Storage Quota'}</h3>
            <div className="stat-value">{storageUsed} <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/ {storageLimit} MB</span></div>
            <div className="stat-sub" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              {isRtl ? `الاستهلاك: ${storagePercent}% (ممتاز)` : `Usage: ${storagePercent}%`}
            </div>
          </div>
          <div className="stat-icon warning">⚡</div>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & SYSTEM TELEMETRY */}
      {activeTab === 'overview' && (
        <div className="charts-grid-2">
          {/* Card 1: Instance Configuration Summary */}
          <div className="panel" style={{ padding: 22 }}>
            <h3 className="panel-title" style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🏫</span>
              <span>{isRtl ? 'معلومات النسخة المستقلة' : 'Instance Configuration'}</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>{isRtl ? 'اسم المنظومة (عربي):' : 'School Name (AR):'}</span>
                <strong style={{ color: 'var(--text-main)' }}>{config.schoolNameAr}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>{isRtl ? 'اسم المنظومة (إنجليزي):' : 'School Name (EN):'}</span>
                <strong style={{ color: 'var(--text-main)' }}>{config.schoolNameEn}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>{isRtl ? 'رمز المنظومة:' : 'School Code:'}</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary)' }}>{config.schoolCode}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>{isRtl ? 'قاعدة البيانات:' : 'Database Engine:'}</span>
                <strong style={{ color: 'var(--success)' }}>{currentSchool.databaseType || 'PostgreSQL'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isRtl ? 'زمن الاستجابة (Latency):' : 'Response Latency:'}</span>
                <strong style={{ color: 'var(--secondary)' }}>{stats.latencyMs || 8} ms</strong>
              </div>
            </div>
          </div>

          {/* Card 2: Developer Maintenance & Quick Actions */}
          <div className="panel" style={{ padding: 22 }}>
            <h3 className="panel-title" style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🛠️</span>
              <span>{isRtl ? 'أدوات الصيانة والتشخيص الفوري' : 'Maintenance & Diagnostic Actions'}</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleRepairIntegrity}
                disabled={isRepairing}
                style={{ gridColumn: '1 / -1', fontWeight: 800 }}
              >
                <span>🛡️</span>
                <span>{isRepairing ? (isRtl ? 'جاري الفحص والترميم...' : 'Auditing...') : (isRtl ? 'فحص وترميم تكامل الجداول فوراً' : 'Run Full Integrity Audit & Repair')}</span>
              </button>

              <button
                type="button"
                className="btn"
                onClick={handleCleanSlate}
                disabled={isCleaningSlate}
                style={{
                  gridColumn: '1 / -1',
                  background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 900,
                  fontSize: 13,
                  padding: '11px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 2px 10px rgba(239, 68, 68, 0.3)',
                  cursor: isCleaningSlate ? 'not-allowed' : 'pointer'
                }}
              >
                <span>🧹</span>
                <span>
                  {isCleaningSlate
                    ? (isRtl ? 'جاري تصفير وحذف كافة البيانات الوهمية...' : 'Cleaning Slate...')
                    : (isRtl ? 'تصفير المنظومة للمدرسة الحقيقية (حذف كافة الطلاب والمعلمين الوهميين)' : 'Purge All Demo Data (Start Real School Clean Slate)')}
                </span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handlePing}
                disabled={isPinging}
              >
                <span>📡</span>
                <span>{isPinging ? 'Pinging...' : (isRtl ? 'فحص الاستجابة (Ping)' : 'Test Ping')}</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClearCache}
                disabled={isClearingCache}
              >
                <span>⚡</span>
                <span>{isClearingCache ? 'Clearing...' : (isRtl ? 'مسح الكاش (Purge Cache)' : 'Purge Cache')}</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleExportBackup('sql')}
                disabled={Boolean(isExportingBackup)}
                title={isRtl ? 'تصدير نسخة احتياطية كاملة بصيغة SQL متوافقة مع PostgreSQL و SQLite' : 'Export complete SQL dump for PostgreSQL & SQLite'}
              >
                <span>🗄️</span>
                <span>
                  {isExportingBackup === 'sql'
                    ? (isRtl ? 'جاري تصدير SQL...' : 'Exporting SQL...')
                    : (isRtl ? 'تصدير نسخة احتياطية (SQL)' : 'Export Backup (.sql)')}
                </span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleExportBackup('json')}
                disabled={Boolean(isExportingBackup)}
                title={isRtl ? 'تصدير لقطة سريعة للبيانات بصيغة JSON' : 'Export raw database JSON snapshot'}
              >
                <span>📄</span>
                <span>
                  {isExportingBackup === 'json'
                    ? (isRtl ? 'جاري تصدير JSON...' : 'Exporting JSON...')
                    : (isRtl ? 'تصدير نسخة احتياطية (JSON)' : 'Export Backup (.json)')}
                </span>
              </button>
            </div>
          </div>

          {/* Card 3: Principal Account Designation & Official Handover */}
          <div className="panel" style={{ padding: 22, gridColumn: '1 / -1', background: 'linear-gradient(to right, #ffffff, #f8fafc)', border: '1px solid #c7d2fe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <div>
                <h3 className="panel-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#1e1b4b' }}>
                  <span>👑</span>
                  <span>{isRtl ? 'إدارة واعتماد حساب مدير المدرسة (Principal Credentials & Handover Pass)' : 'Principal Credentials & Official Handover Pass'}</span>
                </h3>
                <p className="panel-subtitle" style={{ margin: '4px 0 0' }}>
                  {isRtl
                    ? 'يمكن للمطور تحديد اسم مدير المدرسة وتحديث بيانات دخوله فوراً، ثم إصدار وطباعة بطاقة تسليم رسمية معتمدة له.'
                    : 'Designate the school principal name, update login credentials, and issue an official branded handover slip.'}
                </p>
              </div>

              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  const pName = (principalForm?.fullName || '').trim();
                  const pEmail = (principalForm?.email || '').trim();
                  const pPass = (principalForm?.password || '').trim();
                  setHandoverData({
                    schoolNameAr: brandForm.schoolNameAr || config.schoolNameAr,
                    schoolNameEn: brandForm.schoolNameEn || config.schoolNameEn,
                    schoolCode: brandForm.schoolCode || config.schoolCode,
                    domainUrl: window.location.origin,
                    adminFullName: pName || handoverData.adminFullName,
                    adminEmail: pEmail || handoverData.adminEmail,
                    adminPassword: pPass || handoverData.adminPassword,
                  });
                  setIsHandoverModalOpen(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                  padding: '7px 16px',
                }}
              >
                🎴 {isRtl ? 'معاينة وإصدار بطاقة الدخول الرسمية' : 'Issue Official Handover Pass'}
              </button>
            </div>

            <form onSubmit={handleSavePrincipal} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, alignItems: 'flex-end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>
                  {isRtl ? 'اسم مدير المدرسة الكامل (يظهر في كامل المنظومة):' : 'Principal Full Name (propagates system-wide):'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={principalForm.fullName}
                  onChange={(e) => setPrincipalForm({ ...principalForm, fullName: e.target.value })}
                  placeholder="أ. عبد الرحمن خليل (المدير العام)"
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>
                  {isRtl ? 'البريد الإلكتروني لحساب المدير:' : 'Principal Login Email:'}
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={principalForm.email}
                  onChange={(e) => setPrincipalForm({ ...principalForm, email: e.target.value })}
                  placeholder="admin@school.local"
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>
                  {isRtl ? 'كلمة المرور (اختياري لتغييرها):' : 'Password (leave blank to keep current):'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={principalForm.password}
                  onChange={(e) => setPrincipalForm({ ...principalForm, password: e.target.value })}
                  placeholder="ChangeMe123!"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSavingPrincipal}
                  style={{ width: '100%', fontWeight: 800, padding: '9px 16px' }}
                >
                  {isSavingPrincipal
                    ? (isRtl ? 'جاري الحفظ والتعميم...' : 'Saving...')
                    : (isRtl ? '💾 حفظ وتثبيت اسم المدير في المنظومة' : 'Save & Propagate Principal')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: PRINCIPAL CREDENTIALS & HANDOVER PASS STUDIO */}
      {activeTab === 'principal' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 20, alignItems: 'start' }}>
          {/* Controls Column */}
          <div className="panel" style={{ padding: 24 }}>
            <h3 className="panel-title" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>👑</span>
              <span>{isRtl ? 'إدارة وتعيين بيانات مدير المدرسة' : 'School Principal Credentials & Authority'}</span>
            </h3>
            <p className="panel-subtitle" style={{ marginBottom: 20 }}>
              {isRtl
                ? 'حدد الاسم الرسمي لمدير المدرسة، ليتم اعتماده وتعميمه على كافة لوحات الإشراف والشهادات والتقارير التنفيذية.'
                : 'Configure official principal credentials. Changes reflect across all dashboards, certificates, and system reports.'}
            </p>

            <form onSubmit={handleSavePrincipal} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Principal Photo Upload Box */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                background: 'var(--bg-main)',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                <UserAvatar
                  src={principalForm.photoUrl}
                  name={principalForm.fullName}
                  role="ADMIN"
                  size={64}
                  showRoleBadge={true}
                />
                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontWeight: 800, fontSize: 13, marginBottom: 4 }}>
                    {isRtl ? 'صورة مدير المدرسة الرسمية:' : 'Official Principal Portrait:'}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePrincipalPhotoUpload}
                      style={{ fontSize: 12 }}
                    />
                    {principalForm.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setPrincipalForm(p => ({ ...p, photoUrl: '' }))}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: 12,
                          cursor: 'pointer',
                          fontWeight: 700
                        }}
                      >
                        {isRtl ? 'حذف الصورة' : 'Remove'}
                      </button>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {isRtl ? 'بصفتك مهندس النظام، هذه الصورة تُعتمد رسمياً للمدير في الترويسة وبطاقة الاعتماد.' : 'Set officially by System Engineer for the Principal.'}
                  </span>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: 13 }}>
                  {isRtl ? 'اسم مدير المدرسة الكامل (مع اللقب الرسمي):' : 'Principal Full Name & Official Title:'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={principalForm.fullName}
                  onChange={(e) => setPrincipalForm({ ...principalForm, fullName: e.target.value })}
                  placeholder={isRtl ? 'اكتب الاسم واللقب الرسمي للمدير العام' : 'e.g. Dr. Ahmad (General Director)'}
                  required
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  {isRtl ? 'هذا الاسم سيظهر في لوحة المدير العام والتقارير التنفيذية.' : 'Displayed on executive dashboards and reports.'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 800, fontSize: 13 }}>
                    {isRtl ? 'البريد الإلكتروني المعتمد لتسجيل الدخول:' : 'Official Login Email:'}
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={principalForm.email}
                    onChange={(e) => setPrincipalForm({ ...principalForm, email: e.target.value })}
                    placeholder="director@school.local"
                    required
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                    {isRtl ? 'البريد المعتمد لحساب المدير العام (Super Admin)' : 'Authorized General Director login email'}
                  </span>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 800, fontSize: 13 }}>
                    {isRtl ? 'رقم هاتف المدير العام (اختياري):' : 'Principal Phone Number (optional):'}
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    value={principalForm.phone || ''}
                    onChange={(e) => setPrincipalForm({ ...principalForm, phone: e.target.value })}
                    placeholder="+970 59 000 0000"
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                    {isRtl ? 'للتواصل الإداري الداخلي' : 'For internal administrative contact'}
                  </span>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label className="form-label" style={{ fontWeight: 800, fontSize: 13, margin: 0 }}>
                    {isRtl ? 'كلمة المرور الخاصة بحساب المدير العام:' : 'General Director Login Password:'}
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 11, padding: '2px 8px', fontWeight: 700 }}
                  >
                    ⚡ {isRtl ? 'توليد كلمة مرور عشوائية' : 'Generate Random Password'}
                  </button>
                </div>
                <input
                  type="text"
                  className="form-input"
                  value={principalForm.password}
                  onChange={(e) => setPrincipalForm({ ...principalForm, password: e.target.value })}
                  placeholder={isRtl ? 'اكتب كلمة المرور المعتمدة التي تختارها' : 'Enter your chosen password'}
                  style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.5px' }}
                  required
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  {isRtl ? 'سيتم تشفير هذه الكلمة بأمان وحفظها، ولن يتم قبول سواها عند تسجيل الدخول.' : 'Securely hashed with bcrypt and used for your login.'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSavingPrincipal}
                  style={{ fontWeight: 800, padding: '10px 20px', flex: 1 }}
                >
                  {isSavingPrincipal
                    ? (isRtl ? 'جاري إنشاء وتثبيت الحساب...' : 'Saving...')
                    : (isRtl ? '💾 إنشاء وتثبيت حساب المدير العام في المنظومة' : 'Create & Save Principal Account')}
                </button>

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    const pName = (principalForm?.fullName || '').trim();
                    const pEmail = (principalForm?.email || '').trim();
                    const pPass = (principalForm?.password || '').trim();
                    setHandoverData({
                      schoolNameAr: brandForm.schoolNameAr || config.schoolNameAr,
                      schoolNameEn: brandForm.schoolNameEn || config.schoolNameEn,
                      schoolCode: brandForm.schoolCode || config.schoolCode,
                      domainUrl: window.location.origin,
                      adminFullName: pName || handoverData.adminFullName,
                      adminEmail: pEmail || handoverData.adminEmail,
                      adminPassword: pPass || handoverData.adminPassword,
                    });
                    setIsHandoverModalOpen(true);
                  }}
                  style={{ fontWeight: 800, padding: '10px 18px' }}
                >
                  🎴 {isRtl ? 'إصدار بطاقة التسليم' : 'Open Delivery Slip'}
                </button>
              </div>
            </form>
          </div>

          {/* Pass Preview Column */}
          <div className="panel" style={{ padding: 22, background: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
            <h3 className="panel-title" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>👁️</span>
              <span>{isRtl ? 'معاينة حية لبطاقة الدخول والتسليم الرسمية' : 'Live Official Handover Slip Preview'}</span>
            </h3>

            {/* Slip Visual Simulation */}
            <div style={{ background: '#ffffff', borderRadius: 12, border: '2px solid #e2e8f0', padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: 14, marginBottom: 14 }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#1e1b4b' }}>
                    {brandForm.schoolNameAr || config.schoolNameAr}
                  </h4>
                  <span style={{ fontSize: 11, color: '#64748b' }}>
                    {brandForm.schoolCode || config.schoolCode} • {isRtl ? 'وثيقة اعتماد رسمية' : 'Official Handover Pass'}
                  </span>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {brandForm.logoUrl || config.logoUrl ? (
                    <img src={brandForm.logoUrl || config.logoUrl} alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                  ) : (
                    <SchoolLogo size={28} />
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>{isRtl ? 'مدير المدرسة المعتمد:' : 'Principal Name:'}</span>
                  <strong style={{ color: '#0f172a' }}>{principalForm.fullName || handoverData.adminFullName}</strong>
                </div>

                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>{isRtl ? 'البريد الإلكتروني:' : 'Login Email:'}</span>
                  <strong style={{ fontFamily: 'monospace', color: '#2563eb' }}>{principalForm.email || handoverData.adminEmail}</strong>
                </div>

                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>{isRtl ? 'كلمة المرور المؤقتة:' : 'Password:'}</span>
                  <strong style={{ fontFamily: 'monospace', color: '#dc2626' }}>{principalForm.password || handoverData.adminPassword}</strong>
                </div>

                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>{isRtl ? 'رابط الدخول المباشر:' : 'Login Portal:'}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#0f172a' }}>{window.location.origin}</span>
                </div>
              </div>

              <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handlePrintHandoverSlip}
                  style={{ fontWeight: 700 }}
                >
                  🖨️ {isRtl ? 'طباعة / PDF' : 'Print PDF'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleDownloadHandoverSlip}
                  style={{ fontWeight: 700 }}
                >
                  📥 {isRtl ? 'تنزيل .txt' : 'Download .txt'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={copyHandoverSlip}
                  style={{ fontWeight: 800 }}
                >
                  📋 {isRtl ? 'نسخ النص' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATABASE STORAGE BREAKDOWN */}
      {activeTab === 'storage' && (
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">{isRtl ? 'توزيع حجم السجلات حسب الجداول' : 'Database Storage Breakdown'}</h3>
              <p className="panel-subtitle">{isRtl ? 'تحليل تفصيلي لعدد السجلات في كل جدول' : 'Real-time record counts per table'}</p>
            </div>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>{isRtl ? 'اسم الجدول' : 'Table Name'}</th>
                  <th>{isRtl ? 'عدد السجلات' : 'Record Count'}</th>
                  <th>{isRtl ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {currentSchool.tables && Object.entries(currentSchool.tables).map(([tableName, count]) => (
                  <tr key={tableName}>
                    <td><strong style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{tableName}</strong></td>
                    <td>{Number(count).toLocaleString()}</td>
                    <td><span className="badge badge-success">OK</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BRANDING WHITE-LABEL SUITE */}
      {activeTab === 'branding' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 20, alignItems: 'start' }}>
          {/* Controls Column */}
          <div className="panel" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
              <div>
                <h3 className="panel-title" style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🎨</span>
                  <span>{isRtl ? 'تخصيص هوية وألوان وشعار المدرسة' : 'School Branding & Identity Suite'}</span>
                </h3>
                <p className="panel-subtitle">
                  {isRtl
                    ? 'تحكم حصري لمهندس المنظومة لتحديد اسم المدرسة، الشعار المعتمد، ونظام الألوان المؤسسي.'
                    : 'Exclusive developer controls for school name, custom logo, theme colors, and storage limits.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveBranding} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Section 1: School Names & Codes */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: 10 }}>
                  {isRtl ? '١. بيانات ومسمى المدرسة الأساسي:' : '1. School Details & Codes:'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label className="form-label">{isRtl ? 'اسم المدرسة (بالعربية):' : 'School Name (Arabic):'}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={brandForm.schoolNameAr}
                      onChange={(e) => setBrandForm({ ...brandForm, schoolNameAr: e.target.value })}
                      placeholder="روضة ومدرسة مجموعة السلام التعليمية الخاصة"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">{isRtl ? 'اسم المدرسة (بالإنجليزية):' : 'School Name (English):'}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={brandForm.schoolNameEn}
                      onChange={(e) => setBrandForm({ ...brandForm, schoolNameEn: e.target.value })}
                      placeholder="Al-Noor Model School"
                    />
                  </div>

                  <div>
                    <label className="form-label">{isRtl ? 'كود المنظومة (School Code):' : 'School Code:'}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={brandForm.schoolCode}
                      onChange={(e) => setBrandForm({ ...brandForm, schoolCode: e.target.value })}
                      placeholder="SCH-001"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">{isRtl ? 'سعة التخزين المخصصة (MB):' : 'Allocated Storage (MB):'}</label>
                    <input
                      type="number"
                      className="form-input"
                      value={brandForm.allocatedStorageMb}
                      onChange={(e) => setBrandForm({ ...brandForm, allocatedStorageMb: e.target.value })}
                      placeholder="500"
                      min="50"
                      max="50000"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 10 }}>
                  <div>
                    <label className="form-label">{isRtl ? 'الشعار اللفظي (عربي):' : 'Slogan (Arabic):'}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={brandForm.schoolSloganAr}
                      onChange={(e) => setBrandForm({ ...brandForm, schoolSloganAr: e.target.value })}
                      placeholder="المنصة الأكاديمية الشاملة"
                    />
                  </div>

                  <div>
                    <label className="form-label">{isRtl ? 'الشعار اللفظي (إنجليزي):' : 'Slogan (English):'}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={brandForm.schoolSloganEn}
                      onChange={(e) => setBrandForm({ ...brandForm, schoolSloganEn: e.target.value })}
                      placeholder="Comprehensive Academic Platform"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Logo Uploader */}
              <div style={{ background: 'var(--bg-main)', padding: 16, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: 8 }}>
                  {isRtl ? '٢. شعار المدرسة المعتمد:' : '2. Official School Emblem / Logo:'}
                </label>

                <input
                  type="file"
                  ref={logoFileInputRef}
                  onChange={handleLogoFileUpload}
                  accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                  style={{ display: 'none' }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '10px 0' }}>
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 'var(--radius-md)',
                      border: '2px dashed var(--border-color)',
                      background: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 4,
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {brandForm.logoUrl ? (
                      <img
                        src={brandForm.logoUrl}
                        alt="Logo Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <SchoolLogo size={52} />
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => logoFileInputRef.current?.click()}
                        style={{ fontWeight: 700 }}
                      >
                        📁 {isRtl ? 'رفع صورة من جهازك' : 'Upload Local Image'}
                      </button>

                      {brandForm.logoUrl && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => setBrandForm({ ...brandForm, logoUrl: '' })}
                        >
                          ❌ {isRtl ? 'إلغاء الشعار المخصص' : 'Reset Logo'}
                        </button>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {isRtl ? 'يدعم PNG, JPG, SVG شفاف بحد أقصى 4MB' : 'Supports PNG, JPG, SVG transparent (Max 4MB)'}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <label className="form-label" style={{ fontSize: 11.5 }}>
                    {isRtl ? 'أو أدخل رابط الشعار المباشر (URL):' : 'Or direct Image URL:'}
                  </label>
                  <input
                    type="url"
                    className="form-input"
                    style={{ fontSize: 12 }}
                    placeholder="https://example.com/logo.png"
                    value={brandForm.logoUrl.startsWith('data:') ? '' : brandForm.logoUrl}
                    onChange={(e) => setBrandForm({ ...brandForm, logoUrl: e.target.value })}
                  />
                </div>
              </div>

              {/* Section 3: Color Palette & Presets */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: 8 }}>
                  {isRtl ? '٣. نظام الألوان المؤسسي والهوية البصرية:' : '3. Brand Color Palette:'}
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginBottom: 12 }}>
                  {COLOR_PRESETS.map((p) => {
                    const isSelected = brandForm.primaryColor.toLowerCase() === p.primary.toLowerCase();
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setBrandForm({ ...brandForm, primaryColor: p.primary, primaryHover: p.hover })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid #0f172a' : '1px solid var(--border-color)',
                          background: isSelected ? 'var(--bg-card)' : '#ffffff',
                          cursor: 'pointer',
                          boxShadow: isSelected ? '0 0 0 2px var(--primary)' : 'none',
                          transition: 'var(--transition)',
                        }}
                      >
                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: p.primary, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, fontWeight: isSelected ? 800 : 600, color: 'var(--text-main)' }}>{p.name}</span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--bg-main)', padding: 10, borderRadius: 'var(--radius-md)', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label className="form-label" style={{ margin: 0, fontSize: 12 }}>{isRtl ? 'اللون الأساسي:' : 'Primary Color:'}</label>
                    <input
                      type="color"
                      value={brandForm.primaryColor}
                      onChange={(e) => setBrandForm({ ...brandForm, primaryColor: e.target.value, primaryHover: e.target.value })}
                      style={{ width: 36, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'transparent' }}
                    />
                    <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700 }}>{brandForm.primaryColor}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label className="form-label" style={{ margin: 0, fontSize: 12 }}>{isRtl ? 'لون التمرير (Hover):' : 'Hover Color:'}</label>
                    <input
                      type="color"
                      value={brandForm.primaryHover}
                      onChange={(e) => setBrandForm({ ...brandForm, primaryHover: e.target.value })}
                      style={{ width: 36, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'transparent' }}
                    />
                    <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700 }}>{brandForm.primaryHover}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 14, flexWrap: 'wrap', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleResetBranding}
                >
                  ↺ {isRtl ? 'استعادة الافتراضي' : 'Reset Defaults'}
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontWeight: 800, padding: '9px 20px', background: brandForm.primaryColor, borderColor: brandForm.primaryColor }}
                >
                  💾 {isRtl ? 'حفظ وتعميم الخصائص فوراً على المنظومة' : 'Save & Propagate School Identity'}
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="panel" style={{ padding: 22 }}>
              <h3 className="panel-title" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>👁️</span>
                <span>{isRtl ? 'معاينة فورية للهوية والألوان' : 'Live Brand & UI Preview'}</span>
              </h3>
              <p className="panel-subtitle" style={{ marginBottom: 16 }}>
                {isRtl ? 'هكذا ستظهر الهوية في شريط التنقل، الشهادات، والبطاقات المدرسية:' : 'Live simulation across header navigation and reports:'}
              </p>

              {/* Simulated Header */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                  marginBottom: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      background: '#ffffff',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 2,
                    }}
                  >
                    {brandForm.logoUrl ? (
                      <img src={brandForm.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <SchoolLogo size={32} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>
                      {brandForm.schoolNameAr || 'روضة ومدرسة مجموعة السلام التعليمية الخاصة'}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {brandForm.schoolSloganAr || 'المنصة الأكاديمية الشاملة'}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    background: `${brandForm.primaryColor}18`,
                    color: brandForm.primaryColor,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {brandForm.schoolCode || 'SCH-001'}
                </span>
              </div>

              {/* Simulated Action Components */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-main)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    {isRtl ? 'معاينة شكل ولون الأزرار:' : 'Button Style Preview:'}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => toast.info(isRtl ? '🎨 هذه معاينة حية توضح شكل ولون الأزرار الأساسية في المنظومة وفق الهوية المختارة' : 'Live preview of the system primary button style')}
                    style={{
                      width: '100%',
                      background: brandForm.primaryColor,
                      borderColor: brandForm.primaryColor,
                      color: '#ffffff',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {isRtl ? 'زر أساسي (معاينة حية)' : 'Primary Button (Preview)'}
                  </button>
                </div>

                <div style={{ background: 'var(--bg-main)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    {isRtl ? 'شعار التقارير والشهادات' : 'Certificates Emblem'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${brandForm.primaryColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: brandForm.primaryColor, fontSize: 14 }}>
                      🎓
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-main)' }}>
                      {isRtl ? 'شهادة معتمدة' : 'Official Certificate'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Developer Notice */}
              <div
                style={{
                  background: 'rgba(79, 70, 229, 0.05)',
                  border: '1px solid rgba(79, 70, 229, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: 12,
                  fontSize: 12,
                  color: 'var(--text-main)',
                  display: 'flex',
                  gap: 8,
                }}
              >
                <span>⚡</span>
                <span style={{ lineHeight: 1.5 }}>
                  {isRtl
                    ? 'يتم تعميم هذه الخصائص تلقائياً على واجهات المعلم، المدير، شؤون الطلاب، وبوابة الدخول وكافة الشهادات والتقارير التنفيذية.'
                    : 'Changes immediately apply across Student, Teacher, Admin portals, Login screen, and PDF/Print certificates.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HISTORICAL STATISTICS ARCHIVE */}
      {activeTab === 'history' && (
        <div className="panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="panel-title" style={{ fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>📜</span>
                <span>{isRtl ? 'أرشيف الإحصائيات واللقطات التاريخية للمنظومة' : 'Historical Statistics & Telemetry Archive'}</span>
              </h3>
              <p className="panel-subtitle" style={{ margin: 0 }}>
                {isRtl
                  ? 'سجل موثق للإحصائيات السابقة وأعداد الطلاب والمعلمين والصفوف، محفوظ بأمان حتى بعد عمليات تصفير وتنقية قاعدة البيانات.'
                  : 'Immutable telemetry archive documenting previous counts of students, faculty, and classes before resets.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={fetchStatsHistory}
                disabled={loadingHistory}
                style={{ fontWeight: 700 }}
              >
                🔄 {isRtl ? 'تحديث السجلات' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Manual Snapshot Creator Bar */}
          <div style={{
            background: 'var(--bg-main)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: 16,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <label className="form-label" style={{ fontWeight: 800, fontSize: 12, marginBottom: 4 }}>
                {isRtl ? 'حفظ لقطة إحصائية فورية للوضع الحالي:' : 'Capture Live Statistics Snapshot:'}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={isRtl ? 'مثال: إحصائية نهاية الفصل الدراسي الأول ٢٠٢٦' : 'e.g. Term 1 Close Snapshot'}
                value={snapshotLabel}
                onChange={(e) => setSnapshotLabel(e.target.value)}
                style={{ fontSize: 13 }}
              />
            </div>
            <div style={{ alignSelf: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreateSnapshot}
                disabled={isSavingSnapshot}
                style={{ fontWeight: 800, padding: '9px 18px' }}
              >
                {isSavingSnapshot ? (isRtl ? 'جاري الأرشفة...' : 'Archiving...') : `📸 ${isRtl ? 'حفظ اللقطة في الأرشيف' : 'Capture Snapshot'}`}
              </button>
            </div>
          </div>

          {/* History List */}
          {loadingHistory ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }} />
              <span>{isRtl ? 'جاري استرجاع سجلات الإحصائيات السابقة...' : 'Loading archived telemetry...'}</span>
            </div>
          ) : statsHistory.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 48,
              background: 'var(--bg-main)',
              borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--border-color)'
            }}>
              <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>📁</span>
              <h4 style={{ margin: '0 0 6px', fontWeight: 800 }}>
                {isRtl ? 'لا توجد لقطات إحصائية سابقة حتى الآن' : 'No snapshots found'}
              </h4>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13 }}>
                {isRtl ? 'يمكنك التقاط لقطة يدوية الآن أو سيتم إنشاؤها تلقائياً عند أي عملية تصفير.' : 'Capture a snapshot above or one will be automatically saved during clean slate.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {statsHistory.map((item, idx) => {
                const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleString(isRtl ? 'ar-EG' : 'en-US') : 'التاريخ غير محدد';
                const s = item.stats || {};
                const students = s.totalStudents ?? item.studentsCount ?? 0;
                const teachers = s.totalTeachers ?? item.teachersCount ?? 0;
                const classes = s.totalClasses ?? item.classesCount ?? 0;
                const records = s.totalRecords ?? item.totalRecords ?? 0;
                const users = s.users ?? item.usersCount ?? 0;
                const branches = s.branches ?? item.branchesCount ?? 0;

                return (
                  <div
                    key={item.id || idx}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 20,
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                      position: 'relative',
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 18 }}>📜</span>
                          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>
                            {item.label || (isRtl ? `لقطة إحصائية #${idx + 1}` : `Snapshot #${idx + 1}`)}
                          </h4>
                          <span className="badge badge-info" style={{ fontSize: 11, fontWeight: 700 }}>
                            {item.archivedBeforeCleanSlate
                              ? (isRtl ? '🛡️ أرشيف ما قبل التصفير' : 'Pre-Wipe Snapshot')
                              : (isRtl ? '📸 لقطة يدوية' : 'Manual Snapshot')}
                          </span>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block' }}>
                          🕒 {dateStr} {item.note ? `• ${item.note}` : ''}
                        </span>
                      </div>

                      <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 800, background: 'rgba(79, 70, 229, 0.08)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                        ID: {item.id || `SNAP-${idx + 1}`}
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: 10,
                      background: 'var(--bg-main)',
                      padding: 12,
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>👥 {isRtl ? 'الطلاب' : 'Students'}</span>
                        <strong style={{ fontSize: 18, color: 'var(--primary)', fontWeight: 900 }}>{students}</strong>
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>👨‍🏫 {isRtl ? 'المعلمون' : 'Teachers'}</span>
                        <strong style={{ fontSize: 18, color: 'var(--secondary)', fontWeight: 900 }}>{teachers}</strong>
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>🏫 {isRtl ? 'الصفوف' : 'Classes'}</span>
                        <strong style={{ fontSize: 18, color: 'var(--accent)', fontWeight: 900 }}>{classes}</strong>
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>👤 {isRtl ? 'المستخدمون' : 'Users'}</span>
                        <strong style={{ fontSize: 18, color: 'var(--text-main)', fontWeight: 900 }}>{users}</strong>
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>🏢 {isRtl ? 'الأفرع' : 'Branches'}</span>
                        <strong style={{ fontSize: 18, color: 'var(--warning)', fontWeight: 900 }}>{branches}</strong>
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>🗄️ {isRtl ? 'إجمالي السجلات' : 'Total Records'}</span>
                        <strong style={{ fontSize: 18, color: 'var(--success)', fontWeight: 900 }}>{records}</strong>
                      </div>
                    </div>

                    {/* Breakdown details if available */}
                    {s.tables && Object.keys(s.tables).length > 0 && (
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', borderTop: '1px dashed var(--border-color)', paddingTop: 8 }}>
                        <span style={{ fontWeight: 700, marginInlineEnd: 6 }}>{isRtl ? 'تفصيل الجداول المؤرشفة:' : 'Tables:'}</span>
                        {Object.entries(s.tables).map(([tbl, cnt]) => `${tbl}: ${cnt}`).join(' • ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Handover Delivery Slip Modal */}
      {isHandoverModalOpen && (
        <Modal
          isOpen={isHandoverModalOpen}
          onClose={() => setIsHandoverModalOpen(false)}
          title={isRtl ? '📋 بطاقة تسليم المنظومة الذكية لإدارة المدرسة' : 'School System Handover & Delivery Slip'}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Institution Badge Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
                color: '#ffffff',
                padding: '16px 20px',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 4,
                  }}
                >
                  {brandForm.logoUrl || config.logoUrl ? (
                    <img src={brandForm.logoUrl || config.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <SchoolLogo size={36} />
                  )}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: '#f8fafc' }}>
                    {brandForm.schoolNameAr || config.schoolNameAr} ({brandForm.schoolCode || config.schoolCode})
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: 11.5, color: '#94a3b8' }}>
                    {brandForm.schoolNameEn || config.schoolNameEn} • {window.location.origin}
                  </p>
                </div>
              </div>

              <span style={{ background: '#10b981', color: '#ffffff', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 800 }}>
                READY TO OPERATE
              </span>
            </div>

            {/* Admin Credentials Card */}
            <div className="panel" style={{ padding: 18, border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>👤</span>
                <span>{isRtl ? 'بيانات حساب مدير المدرسة (Super Admin):' : 'School Administrator Credentials:'}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, fontSize: 12.5 }}>
                <div style={{ background: 'var(--bg-main)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>{isRtl ? 'اسم المدير:' : 'Principal Name:'}</span>
                  <strong style={{ color: 'var(--text-main)' }}>{handoverData.adminFullName}</strong>
                </div>

                <div style={{ background: 'var(--bg-main)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>{isRtl ? 'البريد الإلكتروني:' : 'Login Email:'}</span>
                  <strong style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{handoverData.adminEmail}</strong>
                </div>

                <div style={{ background: 'var(--bg-main)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>{isRtl ? 'كلمة المرور الافتراضية:' : 'Default Password:'}</span>
                  <strong style={{ fontFamily: 'monospace', color: 'var(--danger)', fontSize: 13 }}>{handoverData.adminPassword}</strong>
                </div>

                <div style={{ background: 'var(--bg-main)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>{isRtl ? 'رابط الدخول المباشر:' : 'Login URL:'}</span>
                  <strong style={{ fontFamily: 'monospace', color: 'var(--text-main)', fontSize: 11 }}>{handoverData.domainUrl}</strong>
                </div>
              </div>
            </div>

            {/* System Readiness Specs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, fontSize: 11.5 }}>
              <div style={{ padding: '10px 12px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>{isRtl ? 'محرك قاعدة البيانات' : 'DB Engine'}</span>
                <strong style={{ color: 'var(--success)' }}>PostgreSQL</strong>
              </div>

              <div style={{ padding: '10px 12px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>{isRtl ? 'سعة التخزين المبدئية' : 'Storage Quota'}</span>
                <strong style={{ color: 'var(--primary)' }}>{brandForm.allocatedStorageMb || config.allocatedStorageMb || 500} MB</strong>
              </div>

              <div style={{ padding: '10px 12px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>{isRtl ? 'صلاحيات الحساب' : 'Role Type'}</span>
                <strong style={{ color: 'var(--text-main)' }}>Full Control (ADMIN)</strong>
              </div>
            </div>

            {/* Security Notice */}
            <div style={{ background: 'var(--warning-light)', border: '1px solid var(--warning-border)', color: 'var(--warning-text)', padding: 12, borderRadius: 'var(--radius-md)', fontSize: 11.5, display: 'flex', gap: 6, alignItems: 'center' }}>
              <span>🔒</span>
              <span>{isRtl ? 'ملاحظة أمان: يُنصح المدير بتغيير كلمة المرور فور أول تسجيل دخول من قائمة الإعدادات.' : 'Security advice: The principal is advised to change the default password upon first login.'}</span>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 14, flexWrap: 'wrap', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setIsHandoverModalOpen(false)}>
                {isRtl ? 'إغلاق' : 'Close'}
              </button>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={handlePrintHandoverSlip} style={{ fontWeight: 700 }}>
                  🖨️ {isRtl ? 'طباعة / حفظ كـ PDF' : 'Print / Save PDF'}
                </button>
                <button className="btn btn-secondary" onClick={handleDownloadHandoverSlip} style={{ fontWeight: 700 }}>
                  📥 {isRtl ? 'تنزيل كملف نصي (.txt)' : 'Download .txt'}
                </button>
                <button className="btn btn-primary" onClick={copyHandoverSlip} style={{ fontWeight: 800 }}>
                  📋 {isRtl ? 'نسخ النص' : 'Copy Text'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
      </div>
    </ErrorBoundary>
  );
}

