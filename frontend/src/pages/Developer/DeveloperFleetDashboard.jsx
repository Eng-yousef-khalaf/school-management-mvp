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

export default function DeveloperFleetDashboard({ onNavigate }) {
  const { t, isRtl } = useLanguage();
  const { user, loginAsDeveloper } = useAuth();
  const { config, setConfig } = useSchoolConfig();
  const toast = useToast();
  const logoFileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [fleetStats, setFleetStats] = useState(null);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [selectedDeliverySchool, setSelectedDeliverySchool] = useState(null);
  
  // New school onboarding state
  const [newSchoolData, setNewSchoolData] = useState({
    code: 'SCH-004',
    nameAr: 'مدرسة الإبداع الحديثة',
    nameEn: 'Al-Ebdaa Modern Academy',
    sloganAr: 'صناعة قادة المستقبل والتميز الأكاديمي',
    sloganEn: 'Empowering Future Leaders with Academic Excellence',
    logoType: 'FILE_UPLOAD', // DEFAULT | FILE_UPLOAD | CUSTOM_URL
    logoUrl: '',
    uploadedFileName: '',
    primaryColor: '#059669',
    supabaseUrl: 'postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres',
    allocatedMb: 500,
    adminChoice: 'DEFAULT', // DEFAULT | CUSTOM
    adminFullName: 'أ. محمود حسن (المدير العام)',
    adminEmail: 'admin@ebdaa.edu',
    adminPassword: 'EbdaaAdmin2026!',
  });

  const [activeTab, setActiveTab] = useState('overview'); // overview | storage | git

  // Mock / Live telemetry fleet data
  const initialFleetSchools = [
    {
      id: 'sch-001',
      code: 'SCH-ALNOOR',
      nameAr: 'مدرسة النور النموذجية',
      nameEn: 'Al-Noor Model School',
      sloganAr: 'الريادة والتميز في التعليم والتربية',
      sloganEn: 'Leadership and Excellence in Education',
      branch: 'school/al-noor',
      domain: 'https://al-noor.school-portal.com',
      supabaseHost: 'db.alnoor.supabase.co',
      status: 'ACTIVE',
      studentsCount: 1420,
      teachersCount: 78,
      storageUsedMb: 350,
      storageLimitMb: 500,
      storagePercent: 70,
      lastBackup: '2026-09-12 04:00 AM',
      color: '#4f46e5',
      logoUrl: '',
      adminFullName: 'أ. طارق عبد الرحمن (مدير المدرسة)',
      adminEmail: 'principal@alnoor.edu',
      adminPassword: 'NoorPrincipal2026!',
      version: 'v2.4.0 (Master Synced)',
    },
    {
      id: 'sch-002',
      code: 'SCH-ALROWAD',
      nameAr: 'مدارس الرواد العالمية',
      nameEn: 'Al-Rowad International Schools',
      sloganAr: 'تعليم عالمي بمعايير دولية رفيعة',
      sloganEn: 'World-Class International Education',
      branch: 'school/al-rowad',
      domain: 'https://al-rowad.school-portal.com',
      supabaseHost: 'db.alrowad.supabase.co',
      status: 'ACTIVE',
      studentsCount: 680,
      teachersCount: 42,
      storageUsedMb: 125,
      storageLimitMb: 500,
      storagePercent: 25,
      lastBackup: '2026-09-12 04:00 AM',
      color: '#0284c7',
      logoUrl: '',
      adminFullName: 'د. خالد الراشد (المدير التنفيذي)',
      adminEmail: 'admin@alrowad.edu',
      adminPassword: 'RowadAdmin2026!',
      version: 'v2.4.0 (Master Synced)',
    },
    {
      id: 'sch-003',
      code: 'SCH-ALAMAL',
      nameAr: 'مدرسة الأمل الأهلية',
      nameEn: 'Al-Amal Private School',
      sloganAr: 'غرس القيم وبناء الأجيال الواعدة',
      sloganEn: 'Instilling Values & Building Promising Generations',
      branch: 'school/al-amal',
      domain: 'https://al-amal.school-portal.com',
      supabaseHost: 'db.alamal.supabase.co',
      status: 'ACTIVE',
      studentsCount: 950,
      teachersCount: 56,
      storageUsedMb: 220,
      storageLimitMb: 500,
      storagePercent: 44,
      lastBackup: '2026-09-12 04:00 AM',
      color: '#d97706',
      logoUrl: '',
      adminFullName: 'أ. مريم العلي (مديرة المدرسة)',
      adminEmail: 'principal@alamal.edu',
      adminPassword: 'AmalAdmin2026!',
      version: 'v2.4.0 (Master Synced)',
    },
    {
      id: 'sch-master',
      code: 'SCH-MASTER',
      nameAr: 'النسخة الرئيسية (Master Core Engine)',
      nameEn: 'Master Core Template',
      sloganAr: 'المنصة الأكاديمية الشاملة لإدارة العمليات المدرسية',
      sloganEn: 'Comprehensive Academic & School Operations Platform',
      branch: 'main',
      domain: 'http://localhost:5173',
      supabaseHost: 'Local Dev (SQLite / PostgreSQL 16)',
      status: 'MASTER',
      studentsCount: 200,
      teachersCount: 15,
      storageUsedMb: 0.38,
      storageLimitMb: 500,
      storagePercent: 0.1,
      lastBackup: 'Local Database (Active)',
      color: '#4f46e5',
      logoUrl: '',
      adminFullName: 'المدير العام الافتراضي (Master Admin)',
      adminEmail: 'admin@school.local',
      adminPassword: 'ChangeMe123!',
      version: 'v2.4.0 (Source of Truth)',
    },
  ];

  const [schoolsList, setSchoolsList] = useState(initialFleetSchools);

  useEffect(() => {
    async function loadTelemetry() {
      try {
        setLoading(true);
        const res = await api.get('/developer/fleet-stats').catch(() => null);
        if (res && res.stats) {
          setFleetStats(res.stats);
          if (res.schools) setSchoolsList(res.schools);
        } else {
          const totalStudents = schoolsList.reduce((acc, s) => acc + s.studentsCount, 0);
          const totalTeachers = schoolsList.reduce((acc, s) => acc + s.teachersCount, 0);
          const totalStorageUsed = schoolsList.reduce((acc, s) => acc + s.storageUsedMb, 0);
          const totalStorageLimit = schoolsList.reduce((acc, s) => acc + s.storageLimitMb, 0);
          const fleetStoragePercent = Math.round((totalStorageUsed / totalStorageLimit) * 100);

          setFleetStats({
            totalSchools: schoolsList.filter((s) => s.status !== 'MASTER').length,
            totalStudents,
            totalTeachers,
            totalStorageUsedMb: parseFloat(totalStorageUsed.toFixed(2)),
            totalStorageLimitMb: totalStorageLimit,
            fleetStoragePercent,
            healthStatus: 'ALL_SYSTEMS_OPERATIONAL',
          });
        }
      } catch (err) {
        console.error('Failed to load fleet telemetry', err);
      } finally {
        setLoading(false);
      }
    }

    loadTelemetry();
  }, []);

  // Developer Quick Access: Instant Switch & Launch into specific school
  const handleDeveloperInstantAccess = (school) => {
    setConfig({
      ...config,
      schoolCode: school.code,
      schoolNameAr: school.nameAr,
      schoolNameEn: school.nameEn,
      schoolSloganAr: school.sloganAr || config.schoolSloganAr,
      schoolSloganEn: school.sloganEn || config.schoolSloganEn,
      logoUrl: school.logoUrl || '',
      primaryColor: school.color,
      instanceType: school.status === 'MASTER' ? 'MASTER' : 'DEDICATED_SCHOOL',
    });
    
    toast.success(
      isRtl
        ? `⚡ تم تسجيل دخول المطور الفوري إلى: ${school.nameAr} بصلاحيات Super Admin!`
        : `⚡ Instant Developer Super-Admin Access granted for: ${school.nameEn}!`
    );

    window.location.hash = '';
    window.location.search = '?role=admin';
    window.location.reload();
  };

  const handleCopyDeliverySlip = (school) => {
    const slipText = `======================================================
🏫 بطاقة تسليم منصة إدارة المدرسة وبيانات الدخول
======================================================
• المدرسة: ${school.nameAr} (${school.nameEn})
• رمز المنظومة: ${school.code}
• رابط المنصة الرسمي: ${school.domain}

👤 بيانات حساب مدير المدرسة (Super Admin):
------------------------------------------------------
• اسم المدير: ${school.adminFullName || 'المدير العام'}
• البريد الإلكتروني: ${school.adminEmail || 'admin@school.local'}
• كلمة المرور الأولية: ${school.adminPassword || 'ChangeMe123!'}
• الصلاحية: إدارة كاملة ورقابة مؤسسية (ADMIN)
------------------------------------------------------
🔒 يُرجى تغيير كلمة المرور عند أول تسجيل دخول لضمان أمان الحساب.
======================================================`;

    navigator.clipboard.writeText(slipText);
    toast.success(isRtl ? 'تم نسخ بطاقة التسليم بالكامل جاهزة للإرسال!' : 'Delivery Slip copied to clipboard!');
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = 'Pass_';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewSchoolData({ ...newSchoolData, adminPassword: pass });
    toast.success(isRtl ? 'تم توليد كلمة سر قوية للمدير!' : 'Generated strong admin password!');
  };

  const handleLogoFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(isRtl ? 'يرجى اختيار ملف صورة صالح (PNG, JPG, SVG, WebP)' : 'Please select a valid image file');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error(isRtl ? 'حجم الصورة كبير جداً، الحد الأقصى المسموح هو 3 ميجابايت' : 'Image size exceeds 3MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setNewSchoolData((prev) => ({
        ...prev,
        logoType: 'FILE_UPLOAD',
        logoUrl: uploadEvent.target?.result || '',
        uploadedFileName: file.name,
      }));
      toast.success(isRtl ? `تم تحميل الشعار من الجهاز: ${file.name}` : `Logo loaded: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateNewSchool = (e) => {
    e.preventDefault();
    const finalLogoUrl = (newSchoolData.logoType === 'CUSTOM_URL' || newSchoolData.logoType === 'FILE_UPLOAD') ? newSchoolData.logoUrl : '';
    const finalAdminName = newSchoolData.adminChoice === 'DEFAULT' ? 'المدير العام (Default Admin)' : newSchoolData.adminFullName;
    const finalAdminEmail = newSchoolData.adminChoice === 'DEFAULT' ? 'admin@school.local' : newSchoolData.adminEmail;
    const finalAdminPass = newSchoolData.adminChoice === 'DEFAULT' ? 'ChangeMe123!' : newSchoolData.adminPassword;

    const newSchool = {
      id: `sch-${Date.now()}`,
      code: newSchoolData.code,
      nameAr: newSchoolData.nameAr,
      nameEn: newSchoolData.nameEn,
      sloganAr: newSchoolData.sloganAr,
      sloganEn: newSchoolData.sloganEn,
      branch: `school/${newSchoolData.code.toLowerCase()}`,
      domain: `https://${newSchoolData.code.toLowerCase()}.school-portal.com`,
      supabaseHost: 'Supabase Isolated Project',
      status: 'ACTIVE',
      studentsCount: 0,
      teachersCount: 0,
      storageUsedMb: 5,
      storageLimitMb: newSchoolData.allocatedMb,
      storagePercent: 1,
      lastBackup: 'Just Created',
      color: newSchoolData.primaryColor,
      logoUrl: finalLogoUrl,
      adminFullName: finalAdminName,
      adminEmail: finalAdminEmail,
      adminPassword: finalAdminPass,
      version: 'v2.4.0 (Master Synced)',
    };

    setSchoolsList([newSchool, ...schoolsList]);
    setIsOnboardingModalOpen(false);
    setSelectedDeliverySchool(newSchool); // Automatically show delivery card!
    toast.success(isRtl ? `تم تدشين بيانات المدرسة ${newSchool.nameAr} بنجاح!` : `School ${newSchool.nameEn} provisioned successfully!`);
  };

  if (loading) {
    return <PageLoader text={isRtl ? 'جاري جلب إحصائيات الأسطول وقواعد البيانات...' : 'Loading Multi-School Fleet Telemetry...'} />;
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Banner: Soft, High-Contrast Executive Navy Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: 16,
          padding: '28px 32px',
          color: '#ffffff',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #334155',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>⚡</span>
              <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#c7d2fe', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, border: '1px solid rgba(199, 210, 254, 0.3)' }}>
                YOUSEF PLATFORM OWNER HUB
              </span>
              <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
                ● Fleet Live Telemetry
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 6px 0', letterSpacing: '-0.4px', color: '#f8fafc' }}>
              {isRtl ? 'لوحة تحكم المطور ومراقبة أسطول المدارس' : 'Multi-School Fleet & Database Master Dashboard'}
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: 14, maxWidth: 680, lineHeight: 1.5 }}>
              {isRtl
                ? 'مركز الإشراف الحصري على كافة نسخ المدارس المستقلة، مراقبة نسب التخزين لقواعد بيانات Supabase، وإدارة حسابات وروابط المدراء.'
                : 'Centralized command center to monitor dedicated school deployments, Supabase storage quotas, Git branches, and school principal credentials.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                color: '#ffffff',
                padding: '12px 22px',
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 14,
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.15s ease',
              }}
              onClick={() => setIsOnboardingModalOpen(true)}
            >
              <span>➕</span>
              <span>{isRtl ? 'تدشين مدرسة جديدة' : 'Onboard New School'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '10px 18px',
            background: activeTab === 'overview' ? '#4f46e5' : '#ffffff',
            color: activeTab === 'overview' ? '#ffffff' : '#475569',
            borderRadius: 8,
            border: '1px solid ' + (activeTab === 'overview' ? '#4f46e5' : '#e2e8f0'),
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'overview' ? '0 2px 6px rgba(79, 70, 229, 0.25)' : 'none',
          }}
        >
          📊 {isRtl ? 'نظرة عامة وأسطول المدارس' : 'Fleet Overview'}
        </button>
        <button
          onClick={() => setActiveTab('storage')}
          style={{
            padding: '10px 18px',
            background: activeTab === 'storage' ? '#4f46e5' : '#ffffff',
            color: activeTab === 'storage' ? '#ffffff' : '#475569',
            borderRadius: 8,
            border: '1px solid ' + (activeTab === 'storage' ? '#4f46e5' : '#e2e8f0'),
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'storage' ? '0 2px 6px rgba(79, 70, 229, 0.25)' : 'none',
          }}
        >
          💾 {isRtl ? 'تحليلات سعة وتخزين قواعد البيانات (Storage %)' : 'Database Storage & Quota Breakdown'}
        </button>
        <button
          onClick={() => setActiveTab('git')}
          style={{
            padding: '10px 18px',
            background: activeTab === 'git' ? '#4f46e5' : '#ffffff',
            color: activeTab === 'git' ? '#ffffff' : '#475569',
            borderRadius: 8,
            border: '1px solid ' + (activeTab === 'git' ? '#4f46e5' : '#e2e8f0'),
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'git' ? '0 2px 6px rgba(79, 70, 229, 0.25)' : 'none',
          }}
        >
          🌿 {isRtl ? 'إدارة فروع Git والتحديثات (Master vs Branches)' : 'Git Master & Branching Strategy'}
        </button>
      </div>

      {/* Fleet KPIs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', borderLeft: '4px solid #4f46e5', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ color: '#64748b', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
            {isRtl ? 'المدارس المستقلة النشطة' : 'Active Dedicated Schools'}
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span>{fleetStats?.totalSchools || 3}</span>
            <span style={{ fontSize: 13, color: '#10b981', fontWeight: 800 }}>+1 Master</span>
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            {isRtl ? 'نسخ معزولة تماماً (100% Isolated)' : '100% Isolated Supabase DBs'}
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', borderLeft: '4px solid #0284c7', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ color: '#64748b', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
            {isRtl ? 'إجمالي الطلاب المسجلين بالأسطول' : 'Total Students Managed'}
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>
            {(fleetStats?.totalStudents || 3250).toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            {isRtl ? 'عبر كافة فروع ومدارس المنظومة' : 'Across all deployed schools'}
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ color: '#64748b', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
            {isRtl ? 'إجمالي الكادر التعليمي والإداري' : 'Total Faculty & Staff'}
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>
            {(fleetStats?.totalTeachers || 191).toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            {isRtl ? 'حسابات نشطة في بوابات المدارس' : 'Active portal accounts'}
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ color: '#64748b', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
            {isRtl ? 'إجمالي استهلاك التخزين العام' : 'Total Fleet Storage Used'}
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span>{fleetStats?.totalStorageUsedMb || 695} MB</span>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>/ {fleetStats?.totalStorageLimitMb || 2000} MB</span>
          </div>
          <div style={{ fontSize: 12, color: '#10b981', fontWeight: 700, marginTop: 4 }}>
            {isRtl ? `نسبة الاستهلاك الكلي: ${fleetStats?.fleetStoragePercent || 35}% (مثالي)` : `Fleet Utilization: ${fleetStats?.fleetStoragePercent || 35}% (Optimal)`}
          </div>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & FLEET REGISTRY */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Schools Registry Table */}
          <div style={{ background: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px 0', color: '#0f172a' }}>
                  {isRtl ? 'قائمة نسخ المدارس وقواعد بيانات Supabase' : 'Active School Deployments & Supabase Instances'}
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                  {isRtl ? 'عرض حالة كل مدرسة، نسبة استهلاك قاعدة البيانات، بيانات المدير، ودخول المطور' : 'Live status, database storage %, admin credentials slip, and 1-click dev access'}
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '14px 20px' }}>{isRtl ? 'المدرسة والشعار' : 'School & Logo'}</th>
                    <th style={{ padding: '14px 20px' }}>{isRtl ? 'فرع Git والرابط' : 'Git Branch & URL'}</th>
                    <th style={{ padding: '14px 20px' }}>{isRtl ? 'حساب وبيانات المدير' : 'Principal Credentials'}</th>
                    <th style={{ padding: '14px 20px', minWidth: 190 }}>{isRtl ? 'استهلاك قاعدة البيانات (Storage %)' : 'Supabase Storage %'}</th>
                    <th style={{ padding: '14px 20px' }}>{isRtl ? 'الحالة' : 'Status'}</th>
                    <th style={{ padding: '14px 20px', textAlign: 'center' }}>{isRtl ? 'تحكم المطور وتسليم المدير' : 'Dev Access & Delivery'}</th>
                  </tr>
                </thead>
                <tbody>
                  {schoolsList.map((school) => {
                    const isHighUsage = school.storagePercent >= 70;
                    const isMediumUsage = school.storagePercent >= 40 && school.storagePercent < 70;
                    const progressColor = isHighUsage ? '#ef4444' : isMediumUsage ? '#f59e0b' : '#10b981';

                    return (
                      <tr key={school.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.15s' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {school.logoUrl ? (
                              <img src={school.logoUrl} alt="Logo" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'contain', border: '1px solid #e2e8f0' }} />
                            ) : (
                              <div
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 10,
                                  background: `${school.color}15`,
                                  color: school.color,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 900,
                                  fontSize: 14,
                                  border: `1.5px solid ${school.color}35`,
                                }}
                              >
                                {school.code.replace('SCH-', '').slice(0, 2)}
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 14 }}>
                                {isRtl ? school.nameAr : school.nameEn}
                              </div>
                              <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
                                {school.code} • {school.supabaseHost}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <span style={{ fontSize: 11, background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace', border: '1px solid #cbd5e1' }}>
                              🌿 {school.branch}
                            </span>
                          </div>
                          <a
                            href={school.domain}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: 12, color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}
                          >
                            🔗 {school.domain.replace('https://', '')}
                          </a>
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>👤</span>
                            <span>{school.adminFullName || 'المدير العام'}</span>
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace', marginTop: 2 }}>
                            📧 {school.adminEmail}
                          </div>
                          <div style={{ fontSize: 11, color: '#059669', fontWeight: 700, fontFamily: 'monospace', marginTop: 2 }}>
                            🔑 {school.adminPassword}
                          </div>
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                            <span style={{ color: progressColor }}>
                              {school.storageUsedMb} MB / {school.storageLimitMb} MB
                            </span>
                            <span style={{ color: progressColor, fontWeight: 800 }}>
                              {school.storagePercent}%
                            </span>
                          </div>
                          <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.min(school.storagePercent, 100)}%`,
                                height: '100%',
                                background: progressColor,
                                borderRadius: 99,
                                transition: 'width 0.4s ease',
                              }}
                            />
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                            {isHighUsage
                              ? isRtl ? '⚠️ قارب الامتلاء' : '⚠️ High usage'
                              : isRtl ? '✅ مساحة تخزين صحية' : '✅ Optimal quota'}
                          </div>
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          {school.status === 'MASTER' ? (
                            <Badge variant="primary">👑 Master Core</Badge>
                          ) : school.status === 'ACTIVE' ? (
                            <Badge variant="success">🟢 Live Active</Badge>
                          ) : (
                            <Badge variant="warning">🟡 In Setup</Badge>
                          )}
                        </td>

                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                              style={{
                                background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: 12,
                                fontWeight: 800,
                                cursor: 'pointer',
                                padding: '6px 12px',
                                borderRadius: 6,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)',
                              }}
                              onClick={() => handleDeveloperInstantAccess(school)}
                              title={isRtl ? 'دخول فوري للمطور إلى هذه النسخة بصلاحيات Super Admin' : 'Instant Super-Admin Dev Access'}
                            >
                              ⚡ {isRtl ? 'دخول فوري' : 'Launch'}
                            </button>
                            
                            <button
                              style={{
                                background: '#ecfdf5',
                                border: '1px solid #a7f3d0',
                                color: '#047857',
                                fontSize: 11,
                                fontWeight: 800,
                                cursor: 'pointer',
                                padding: '6px 10px',
                                borderRadius: 6,
                              }}
                              onClick={() => setSelectedDeliverySchool(school)}
                              title={isRtl ? 'عرض بطاقة تسليم بيانات المدير' : 'View Principal Delivery Slip'}
                            >
                              📋 {isRtl ? 'بطاقة المدير' : 'Slip'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATABASE STORAGE & QUOTA ANALYSIS */}
      {activeTab === 'storage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {schoolsList.map((school) => {
              const isHigh = school.storagePercent >= 70;
              const isMed = school.storagePercent >= 40 && school.storagePercent < 70;
              const badgeBg = isHigh ? '#fee2e2' : isMed ? '#fef3c7' : '#dcfce7';
              const badgeText = isHigh ? '#b91c1c' : isMed ? '#b45309' : '#15803d';

              return (
                <div key={school.id} style={{ background: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', borderTop: `4px solid ${school.color}`, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px 0', color: '#0f172a' }}>
                        {isRtl ? school.nameAr : school.nameEn}
                      </h4>
                      <span style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>
                        {school.code} • {school.supabaseHost}
                      </span>
                    </div>
                    <span style={{ background: badgeBg, color: badgeText, padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 800 }}>
                      {school.storagePercent}% {isRtl ? 'مستخدم' : 'Used'}
                    </span>
                  </div>

                  {/* Big Progress Bar */}
                  <div style={{ width: '100%', height: 10, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden', marginBottom: 14 }}>
                    <div
                      style={{
                        width: `${Math.min(school.storagePercent, 100)}%`,
                        height: '100%',
                        background: isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#10b981',
                        borderRadius: 99,
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 12 }}>
                    <span style={{ color: '#64748b' }}>{isRtl ? 'المساحة المستخدمة:' : 'Used Space:'}</span>
                    <strong style={{ color: '#0f172a' }}>{school.storageUsedMb} MB</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 12 }}>
                    <span style={{ color: '#64748b' }}>{isRtl ? 'السعة الكلية المخصصة:' : 'Total Supabase Quota:'}</span>
                    <strong style={{ color: '#0f172a' }}>{school.storageLimitMb} MB</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 16 }}>
                    <span style={{ color: '#64748b' }}>{isRtl ? 'المساحة المتبقية:' : 'Remaining Available:'}</span>
                    <strong style={{ color: '#10b981' }}>{(school.storageLimitMb - school.storageUsedMb).toFixed(1)} MB</strong>
                  </div>

                  {/* Table Distribution Details */}
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14, fontSize: 12, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 800, marginBottom: 8, color: '#334155' }}>
                      📊 {isRtl ? 'توزيع استهلاك سجلات قاعدة البيانات:' : 'Record Footprint Estimate:'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: '#475569' }}>📝 {isRtl ? 'سجلات الحضور والغياب اليومي:' : 'Daily Attendance Logs:'}</span>
                      <strong style={{ color: '#0f172a' }}>~{Math.round(school.storageUsedMb * 0.45)} MB</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: '#475569' }}>🎓 {isRtl ? 'درجات الاختبارات والتقييمات:' : 'Grades & Evaluations:'}</span>
                      <strong style={{ color: '#0f172a' }}>~{Math.round(school.storageUsedMb * 0.25)} MB</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: '#475569' }}>🛡️ {isRtl ? 'سجلات التدقيق والأمان (Audit):' : 'Audit Logs & Trails:'}</span>
                      <strong style={{ color: '#0f172a' }}>~{Math.round(school.storageUsedMb * 0.20)} MB</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#475569' }}>👥 {isRtl ? 'الطلاب والكادر والصفوف:' : 'Students & Faculty Data:'}</span>
                      <strong style={{ color: '#0f172a' }}>~{Math.round(school.storageUsedMb * 0.10)} MB</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: GIT MASTER & BRANCHING STRATEGY */}
      {activeTab === 'git' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a' }}>
              <span>🌿</span>
              <span>{isRtl ? 'دليل إدارة الفروع والنشر الآلي (Master vs School Branches)' : 'Git Master & Dedicated School Branching Strategy'}</span>
            </h3>
            <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
              {isRtl
                ? 'تتيح لك هذه المعمارية نشر أي ميزة جديدة لجميع المدارس بضغطة زر عبر الفرع الرئيسي (main)، مع إمكانية إضافة ميزات خاصة بمدرسة محددة على فرعها المستقل دون التأثير على بقية المدارس.'
                : 'This architecture allows you to ship global updates to all schools via the master branch (`main`), while keeping school-specific customizations isolated on dedicated branches.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
              {/* Box 1: Global Master Updates */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>🚀</span>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                    {isRtl ? '1. إضافة ميزة عامة لكافة المدارس' : '1. Ship Global Feature to All Schools'}
                  </h4>
                </div>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                  {isRtl ? 'تتم البرمجة والتطوير على فرع main مباشرة، ثم يتم سحب التحديث لجميع فروع المدارس:' : 'Commit to `main` branch, then merge down to school branches:'}
                </p>
                <pre
                  style={{
                    background: '#0f172a',
                    color: '#38bdf8',
                    padding: 14,
                    borderRadius: 8,
                    fontSize: 12,
                    fontFamily: 'monospace',
                    overflowX: 'auto',
                  }}
                >
{`# 1. تطوير الميزة ورفعها للماستر
git checkout main
git add .
git commit -m "feat: Add dynamic reports"
git push origin main

# 2. تحديث نسخة مدرسة معينة
git checkout school/al-noor
git merge main
git push origin school/al-noor`}
                </pre>
              </div>

              {/* Box 2: School Specific Customization */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>🎯</span>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                    {isRtl ? '2. إضافة ميزة مخصصة لمدرسة واحدة فقط' : '2. School-Only Custom Feature'}
                  </h4>
                </div>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                  {isRtl ? 'يتم التعديل فقط داخل فرع المدرسة دون دمجها مع الماستر:' : 'Commit only to that school branch without touching `main`:'}
                </p>
                <pre
                  style={{
                    background: '#0f172a',
                    color: '#34d399',
                    padding: 14,
                    borderRadius: 8,
                    fontSize: 12,
                    fontFamily: 'monospace',
                    overflowX: 'auto',
                  }}
                >
{`# التعديل فقط لمدرسة النور
git checkout school/al-noor
# قم ببرمجة التعديل المخصص...
git commit -m "custom: Special grading curve"
git push origin school/al-noor

# لن تتأثر النسخة الرئيسية أو أي مدرسة أخرى!`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding New School Modal with Logo & Admin Setup */}
      {isOnboardingModalOpen && (
        <Modal
          isOpen={isOnboardingModalOpen}
          onClose={() => setIsOnboardingModalOpen(false)}
          title={isRtl ? 'تدشين مدرسة جديدة وإعداد الهوية وحساب المدير' : 'Onboard New School & Admin Account Setup'}
        >
          <form onSubmit={handleCreateNewSchool} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">{isRtl ? 'رمز المدرسة (School Code)' : 'School Code'}</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={newSchoolData.code}
                  onChange={(e) => setNewSchoolData({ ...newSchoolData, code: e.target.value })}
                  placeholder="SCH-004"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{isRtl ? 'اللون الرئيسي للمنصة' : 'Brand Primary Color'}</label>
                <input
                  type="color"
                  className="form-input"
                  style={{ height: 42, padding: 4, cursor: 'pointer' }}
                  value={newSchoolData.primaryColor}
                  onChange={(e) => setNewSchoolData({ ...newSchoolData, primaryColor: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{isRtl ? 'اسم المدرسة (بالعربية)' : 'School Name (Arabic)'}</label>
              <input
                type="text"
                className="form-input"
                required
                value={newSchoolData.nameAr}
                onChange={(e) => setNewSchoolData({ ...newSchoolData, nameAr: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{isRtl ? 'اسم المدرسة (بالإنجليزية)' : 'School Name (English)'}</label>
              <input
                type="text"
                className="form-input"
                required
                value={newSchoolData.nameEn}
                onChange={(e) => setNewSchoolData({ ...newSchoolData, nameEn: e.target.value })}
              />
            </div>

            {/* Logo Options Section with Local Folder/File Upload Support */}
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  🖼️ {isRtl ? 'خيارات شعار وهوية المدرسة:' : 'School Logo & Emblem Options:'}
                </label>
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  {isRtl ? 'يدعم PNG, JPG, SVG, WebP' : 'Supports PNG, JPG, SVG, WebP'}
                </span>
              </div>

              {/* Hidden File Input for Folder Selection */}
              <input
                type="file"
                ref={logoFileInputRef}
                onChange={handleLogoFileSelect}
                accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                style={{ display: 'none' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
                <button
                  type="button"
                  onClick={() => {
                    setNewSchoolData({ ...newSchoolData, logoType: 'FILE_UPLOAD' });
                    if (!newSchoolData.logoUrl && logoFileInputRef.current) {
                      logoFileInputRef.current.click();
                    }
                  }}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 8,
                    border: newSchoolData.logoType === 'FILE_UPLOAD' ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                    background: newSchoolData.logoType === 'FILE_UPLOAD' ? '#e0e7ff' : '#ffffff',
                    color: newSchoolData.logoType === 'FILE_UPLOAD' ? '#3730a3' : '#334155',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 18 }}>📁</span>
                  <span>{isRtl ? 'رفع من الجهاز' : 'Upload File'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewSchoolData({ ...newSchoolData, logoType: 'DEFAULT' })}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 8,
                    border: newSchoolData.logoType === 'DEFAULT' ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                    background: newSchoolData.logoType === 'DEFAULT' ? '#e0e7ff' : '#ffffff',
                    color: newSchoolData.logoType === 'DEFAULT' ? '#3730a3' : '#334155',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 18 }}>🏛️</span>
                  <span>{isRtl ? 'الشعار الافتراضي' : 'Default Emblem'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewSchoolData({ ...newSchoolData, logoType: 'CUSTOM_URL' })}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 8,
                    border: newSchoolData.logoType === 'CUSTOM_URL' ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                    background: newSchoolData.logoType === 'CUSTOM_URL' ? '#e0e7ff' : '#ffffff',
                    color: newSchoolData.logoType === 'CUSTOM_URL' ? '#3730a3' : '#334155',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 18 }}>🔗</span>
                  <span>{isRtl ? 'رابط صورة (URL)' : 'Image URL'}</span>
                </button>
              </div>

              {/* File Upload Box (Local Folders Picker) */}
              {newSchoolData.logoType === 'FILE_UPLOAD' && (
                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      border: '2px dashed #818cf8',
                      background: '#eef2ff',
                      borderRadius: 10,
                      padding: 16,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onClick={() => logoFileInputRef.current?.click()}
                  >
                    <div style={{ fontSize: 24, marginBottom: 4 }}>📂</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#3730a3', marginBottom: 2 }}>
                      {isRtl ? 'انقر هنا لفتح المجلدات واختيار صورة الشعار' : 'Click to browse files & folders on your device'}
                    </div>
                    <div style={{ fontSize: 11, color: '#6366f1' }}>
                      {newSchoolData.uploadedFileName ? (
                        <span style={{ fontWeight: 700, color: '#047857' }}>
                          ✅ {isRtl ? 'الملف المختار حالياً:' : 'Selected:'} {newSchoolData.uploadedFileName}
                        </span>
                      ) : (
                        <span>PNG, JPG, SVG, WebP (بحد أقصى 3MB)</span>
                      )}
                    </div>
                  </div>
                  {newSchoolData.logoUrl && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewSchoolData({ ...newSchoolData, logoUrl: '', uploadedFileName: '' });
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        {isRtl ? '❌ إزالة الصورة والعودة' : 'Remove Image'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Custom URL Input */}
              {newSchoolData.logoType === 'CUSTOM_URL' && (
                <div style={{ marginBottom: 10 }}>
                  <label className="form-label">{isRtl ? 'رابط صورة الشعار عبر الويب (URL):' : 'Web Logo Image URL:'}</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://example.com/school-logo.png"
                    value={newSchoolData.logoUrl}
                    onChange={(e) => setNewSchoolData({ ...newSchoolData, logoUrl: e.target.value })}
                  />
                </div>
              )}

              {/* Live Preview Box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#ffffff', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#64748b' }}>
                  {isRtl ? 'المعاينة الحية للشعار:' : 'Live Logo Preview:'}
                </div>
                {(newSchoolData.logoType === 'CUSTOM_URL' || newSchoolData.logoType === 'FILE_UPLOAD') && newSchoolData.logoUrl ? (
                  <img
                    src={newSchoolData.logoUrl}
                    alt="Preview"
                    style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'contain', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/44'; }}
                  />
                ) : (
                  <SchoolLogo size={44} />
                )}
                <div>
                  <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 700 }}>
                    {newSchoolData.logoType === 'FILE_UPLOAD' && newSchoolData.logoUrl
                      ? (isRtl ? 'تم اختيار صورة مخصصة من الجهاز' : 'Custom Image Uploaded')
                      : newSchoolData.logoType === 'CUSTOM_URL'
                      ? (isRtl ? 'شعار عبر رابط خارجي' : 'External Web URL')
                      : (isRtl ? 'الشعار المؤسسي الافتراضي' : 'Default Official Emblem')}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {isRtl ? 'سيتم تطبيق هذا الشعار في كافة شهادات وبوابات المدرسة' : 'Applied across all portals and certificates'}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Credentials Setup Section */}
            <div style={{ background: '#f0fdf4', padding: 16, borderRadius: 10, border: '1.5px solid #86efac' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 900, color: '#14532d', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                  <span>👤</span>
                  <span>{isRtl ? 'إعداد حساب وكلمة سر مدير المدرسة (Principal Account):' : 'School Principal Setup:'}</span>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={() => setNewSchoolData({ ...newSchoolData, adminChoice: 'DEFAULT' })}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: newSchoolData.adminChoice === 'DEFAULT' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                    background: newSchoolData.adminChoice === 'DEFAULT' ? '#dcfce7' : '#ffffff',
                    color: newSchoolData.adminChoice === 'DEFAULT' ? '#14532d' : '#334155',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                >
                  <div>🏢 {isRtl ? 'الحساب الإداري الافتراضي' : 'Default Admin'}</div>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 500, marginTop: 2 }}>admin@school.local / ChangeMe123!</div>
                </button>

                <button
                  type="button"
                  onClick={() => setNewSchoolData({ ...newSchoolData, adminChoice: 'CUSTOM' })}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: newSchoolData.adminChoice === 'CUSTOM' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                    background: newSchoolData.adminChoice === 'CUSTOM' ? '#dcfce7' : '#ffffff',
                    color: newSchoolData.adminChoice === 'CUSTOM' ? '#14532d' : '#334155',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                >
                  <div>✍️ {isRtl ? 'تخصيص اسم وكلمة سر للمدير' : 'Custom Principal'}</div>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 500, marginTop: 2 }}>{isRtl ? 'إدخال اسم المدير وكلمة سر قوية' : 'Custom Name, Email & Password'}</div>
                </button>
              </div>

              {newSchoolData.adminChoice === 'CUSTOM' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#14532d', fontSize: 12 }}>
                      {isRtl ? 'اسم مدير المدرسة الكامل:' : 'Principal Full Name:'}
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={newSchoolData.adminFullName}
                      onChange={(e) => setNewSchoolData({ ...newSchoolData, adminFullName: e.target.value })}
                      placeholder="أ. محمود حسن (المدير العام)"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="form-group">
                      <label className="form-label" style={{ color: '#14532d', fontSize: 12 }}>
                        {isRtl ? 'البريد الإلكتروني للمدير:' : 'Principal Login Email:'}
                      </label>
                      <input
                        type="email"
                        className="form-input"
                        required
                        value={newSchoolData.adminEmail}
                        onChange={(e) => setNewSchoolData({ ...newSchoolData, adminEmail: e.target.value })}
                        placeholder="principal@school.edu"
                      />
                    </div>

                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label" style={{ color: '#14532d', fontSize: 12 }}>
                          {isRtl ? 'كلمة المرور للمدير:' : 'Principal Password:'}
                        </label>
                        <button
                          type="button"
                          onClick={generateRandomPassword}
                          style={{ background: 'transparent', border: 'none', color: '#15803d', fontSize: 11, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          🎲 {isRtl ? 'توليد كلمة سر' : 'Generate'}
                        </button>
                      </div>
                      <input
                        type="text"
                        className="form-input"
                        required
                        value={newSchoolData.adminPassword}
                        onChange={(e) => setNewSchoolData({ ...newSchoolData, adminPassword: e.target.value })}
                        placeholder="SecretPassword2026!"
                        style={{ fontFamily: 'monospace', fontWeight: 700 }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Supabase PostgreSQL Database URL Section with Clear Instructions */}
            <div className="form-group" style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  🗄️ {isRtl ? 'رابط قاعدة بيانات Supabase المستقلة (PostgreSQL URI):' : 'Supabase PostgreSQL Connection URI:'}
                </label>
                <span style={{ fontSize: 11, background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                  Dedicated DB
                </span>
              </div>
              <input
                type="text"
                className="form-input"
                required
                value={newSchoolData.supabaseUrl}
                onChange={(e) => setNewSchoolData({ ...newSchoolData, supabaseUrl: e.target.value })}
                placeholder="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
                style={{ fontFamily: 'monospace', fontSize: 12, marginBottom: 8 }}
              />
              
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#1e40af', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 800, marginBottom: 4 }}>
                  💡 {isRtl ? 'كيف تحصل على هذا الرابط عند إنشاء مشروع لمدرسة جديدة؟' : 'How to get this URI from your Supabase Dashboard:'}
                </div>
                <ol style={{ margin: 0, paddingInlineStart: 20 }}>
                  <li>{isRtl ? 'أنشئ New Project مجاني على Supabase باسم المدرسة.' : 'Create a New Project on Supabase for the school.'}</li>
                  <li>{isRtl ? 'اذهب إلى: Project Settings ⚙️ ➔ Database ➔ قسم Connection String.' : 'Go to Project Settings ➔ Database ➔ Connection String.'}</li>
                  <li>{isRtl ? 'اختر نمط (URI) وانسخ الرابط، ثم استبدل [PASSWORD] بكلمة سر قاعدة بياناتك.' : 'Select (URI), copy the connection string, and replace [PASSWORD] with your DB pass.'}</li>
                </ol>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsOnboardingModalOpen(false)}>
                {t('cancel')}
              </button>
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                  color: '#ffffff',
                  padding: '10px 22px',
                  borderRadius: 8,
                  fontWeight: 800,
                  fontSize: 14,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                🚀 {isRtl ? 'إتمام تدشين المدرسة واستخراج بطاقة التسليم' : 'Provision School & Get Slip'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* School Delivery & Principal Credentials Modal */}
      {selectedDeliverySchool && (
        <Modal
          isOpen={Boolean(selectedDeliverySchool)}
          onClose={() => setSelectedDeliverySchool(null)}
          title={isRtl ? '📋 بطاقة تسليم بيانات المنصة لمدير المدرسة' : 'School Principal Delivery Slip'}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>🎉</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#065f46' }}>
                    {isRtl ? 'تم تجهيز بيانات الاعتماد للمدير بنجاح' : 'School Instance & Credentials Ready'}
                  </h4>
                  <p style={{ margin: 0, fontSize: 12, color: '#047857' }}>
                    {isRtl ? 'يمكنك نسخ هذه البطاقة وإرسالها فوراً لمدير المدرسة عبر الواتساب أو البريد الإلكتروني.' : 'Copy and send this delivery slip directly to the school principal.'}
                  </p>
                </div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: 10, padding: 16, border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
                  <span style={{ color: '#64748b' }}>🏫 {isRtl ? 'اسم المدرسة:' : 'School Name:'}</span>
                  <strong style={{ color: '#0f172a' }}>{selectedDeliverySchool.nameAr}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
                  <span style={{ color: '#64748b' }}>🔗 {isRtl ? 'رابط المنصة الرسمي:' : 'Platform Live URL:'}</span>
                  <a href={selectedDeliverySchool.domain} target="_blank" rel="noreferrer" style={{ color: '#4f46e5', fontWeight: 700 }}>
                    {selectedDeliverySchool.domain}
                  </a>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
                  <span style={{ color: '#64748b' }}>👤 {isRtl ? 'اسم مدير المدرسة:' : 'Principal Name:'}</span>
                  <strong style={{ color: '#0f172a' }}>{selectedDeliverySchool.adminFullName || 'المدير العام'}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
                  <span style={{ color: '#64748b' }}>📧 {isRtl ? 'البريد الإلكتروني للدخول:' : 'Login Email:'}</span>
                  <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{selectedDeliverySchool.adminEmail}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
                  <span style={{ color: '#64748b' }}>🔑 {isRtl ? 'كلمة المرور الأولية:' : 'Password:'}</span>
                  <strong style={{ color: '#059669', fontFamily: 'monospace', fontSize: 14 }}>{selectedDeliverySchool.adminPassword}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>🛡️ {isRtl ? 'مستوى الصلاحية:' : 'Access Level:'}</span>
                  <Badge variant="primary">ADMIN (مدير عام المؤسسة)</Badge>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedDeliverySchool(null)}
              >
                {t('close')}
              </button>

              <button
                type="button"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontWeight: 800,
                  fontSize: 13,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 10px rgba(16, 185, 129, 0.35)',
                }}
                onClick={() => handleCopyDeliverySlip(selectedDeliverySchool)}
              >
                <span>📋</span>
                <span>{isRtl ? 'نسخ بطاقة التسليم كاملة' : 'Copy Delivery Slip'}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
