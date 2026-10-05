import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSchoolConfig } from '../../context/SchoolConfigContext';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { PageLoader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorAlert from '../../components/common/ErrorAlert';
import Badge from '../../components/common/Badge';

export default function GeneralDirectorDashboard({ onNavigate }) {
  const { t, isRtl } = useLanguage();
  const { user, isSuperAdmin, switchBranch } = useAuth();
  const { config } = useSchoolConfig();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [selectedBranchForReport, setSelectedBranchForReport] = useState(null);

  // Add Branch Modal State
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [branchSubmitting, setBranchSubmitting] = useState(false);
  const [addBranchError, setAddBranchError] = useState('');
  const [newBranchData, setNewBranchData] = useState({
    name: '',
    code: '',
    city: 'غزة',
    address: '',
    phone: '',
    principalName: '',
    managerFullName: '',
    managerEmail: '',
    managerPassword: '',
    managerConfirmPassword: ''
  });

  // Edit Branch Modal State
  const [editingBranch, setEditingBranch] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get('/branches/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to load branch stats:', err);
      setError(err.message || 'فشل في تحميل إحصائيات الفروع');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleOpenAddModal = () => {
    const randomCode = `BR-${Math.floor(100 + Math.random() * 900)}`;
    setNewBranchData({
      name: '',
      code: randomCode,
      city: 'غزة',
      address: '',
      phone: '',
      principalName: '',
      managerFullName: '',
      managerEmail: '',
      managerPassword: '',
      managerConfirmPassword: ''
    });
    setAddBranchError('');
    setIsAddBranchOpen(true);
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    setAddBranchError('');

    if (!newBranchData.name.trim()) {
      setAddBranchError('يرجى إدخال اسم الفرع');
      return;
    }

    if (newBranchData.managerEmail) {
      if (!newBranchData.managerPassword) {
        setAddBranchError('يرجى تحديد كلمة مرور لحساب مدير الفرع');
        return;
      }
      if (newBranchData.managerPassword !== newBranchData.managerConfirmPassword) {
        setAddBranchError('كلمة المرور وتأكيدها غير متطابقين');
        return;
      }
    }

    setBranchSubmitting(true);
    try {
      const payload = {
        name: newBranchData.name.trim(),
        code: newBranchData.code.trim().toUpperCase(),
        city: newBranchData.city.trim(),
        address: newBranchData.address.trim(),
        phone: newBranchData.phone.trim(),
        principalName: newBranchData.managerFullName || newBranchData.principalName,
        managerFullName: newBranchData.managerFullName.trim(),
        managerEmail: newBranchData.managerEmail.trim(),
        managerPassword: newBranchData.managerPassword
      };

      const result = await api.post('/branches', payload);
      toast.success(`تم فتح (${result.branch.name}) بنجاح وتعيين المدير المسؤول! 🎉`);
      setIsAddBranchOpen(false);
      loadStats();
    } catch (err) {
      setAddBranchError(err.message || 'فشل في إنشاء الفرع الجديد');
    } finally {
      setBranchSubmitting(false);
    }
  };

  const handleSaveEditBranch = async (e) => {
    e.preventDefault();
    if (!editingBranch) return;
    setEditError('');
    setEditSubmitting(true);
    try {
      await api.put(`/branches/${editingBranch.id}`, editingBranch);
      toast.success('تم تحديث بيانات الفرع بنجاح');
      setEditingBranch(null);
      loadStats();
    } catch (err) {
      setEditError(err.message || 'فشل في تحديث بيانات الفرع');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleToggleBranchActive = async (branch) => {
    const actionText = branch.active ? 'تجميد' : 'تفعيل';
    if (!window.confirm(`هل أنت متأكد من رغبتك في ${actionText} (${branch.name})؟`)) {
      return;
    }
    try {
      await api.put(`/branches/${branch.id}`, { active: !branch.active });
      toast.success(`تم ${actionText} الفرع بنجاح`);
      loadStats();
    } catch (err) {
      toast.error(err.message || 'فشل في تغيير حالة الفرع');
    }
  };

  const handleSwitchToBranchView = (branch) => {
    switchBranch(branch.id);
    setSelectedBranchForReport(branch);
  };

  if (loading && !stats) {
    return <PageLoader text="جاري تحميل مؤشرات ولوحة تحكم المدير العام..." />;
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 40 }}>
      {/* Executive Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
        color: '#ffffff',
        padding: '28px 32px',
        borderRadius: '20px',
        marginBottom: '24px',
        boxShadow: '0 20px 40px -15px rgba(6, 78, 59, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: '28px' }}>🏢</span>
            <span style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1px'
            }}>
              SUPER ADMIN / GENERAL DIRECTOR
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, margin: '0 0 6px', color: '#fff' }}>
            لوحة تحكم المدير العام - {config?.schoolNameAr || 'إدارة الفروع والمؤشرات المركزية'}
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#a7f3d0', maxWidth: 700, lineHeight: 1.5 }}>
            الإشراف الإداري والمالي الموحد على كافة فروع المؤسسة، متابعة مجموع المعلمين، التحصيل المالي العام لكل فرع، ونسب النجاح الأكاديمي. (تسجيل وقبول وتسكين الطلاب يتم محلياً في كل فرع عبر شؤون الطلاب وإدارة الفرع).
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={loadStats}
            className="btn btn-secondary"
            style={{ background: 'rgba(255, 255, 255, 0.12)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.3)', fontWeight: 700 }}
          >
            🔄 تحديث المؤشرات
          </button>
          <button
            onClick={handleOpenAddModal}
            className="btn"
            style={{
              background: '#f59e0b',
              color: '#1e293b',
              fontWeight: 900,
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 8px 20px rgba(245, 158, 11, 0.4)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '15px'
            }}
          >
            <span>➕</span>
            <span>فتح فرع جديد وتعيين مدير</span>
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={loadStats} />}

      {/* Global Executive KPIs Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* KPI 1: Branches Count */}
        <div className="panel" style={{ padding: '22px 24px', borderTop: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>الفروع المعتمدة</span>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#065f46', marginTop: 4 }}>
                {stats?.totalBranches || 0}
              </div>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              🏫
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#059669', marginTop: 10, fontWeight: 700 }}>
            🟢 {stats?.activeBranches || 0} فروع نشطة وتعمل بكامل طاقتها
          </div>
        </div>

        {/* KPI 2: Total Faculty Teachers */}
        <div className="panel" style={{ padding: '22px 24px', borderTop: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>مجموع المعلمين الموحد</span>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#6d28d9', marginTop: 4 }}>
                {stats?.totalTeachers || 0}
              </div>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              👨‍🏫
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#7c3aed', marginTop: 10, fontWeight: 700 }}>
            📚 كادر تدريسي موزع عبر {stats?.totalClasses || 0} شعبة دراسية
          </div>
        </div>

        {/* KPI 3: Academic Success Rate */}
        <div className="panel" style={{ padding: '22px 24px', borderTop: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>نسبة النجاح الأكاديمي العام</span>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#1e40af', marginTop: 4 }}>
                {stats?.overallSuccessRate || 92}%
              </div>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              📈
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#2563eb', marginTop: 10, fontWeight: 700 }}>
            ⭐ معدل تميز وكفاءة كادر الفروع التعليمي
          </div>
        </div>

        {/* KPI 4: Financial Collection */}
        <div className="panel" style={{ padding: '22px 24px', borderTop: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>التحصيل المالي العام</span>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#b45309', marginTop: 4 }}>
                {stats?.overallCollectionRate || 0}%
              </div>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              💰
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#d97706', marginTop: 10, fontWeight: 700 }}>
            تم تحصيل {(stats?.grandCollected || 0).toLocaleString()} ₪ من أصل {(stats?.grandExpected || 0).toLocaleString()} ₪
          </div>
        </div>
      </div>

      {/* Branches Grid Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px', color: '#1e293b' }}>
            فروع المؤسسة التعليمية المستقلة ({stats?.branches?.length || 0})
          </h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            كل فرع يمتلك قاعدة بيانات وكادراً وطلاباً معزولين تماماً، ويديره مدير فرع مخصص
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate && onNavigate('branches-report')}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 800, color: '#0369a1', borderColor: '#bae6fd', background: '#f0f9ff' }}
          >
            📑 فتح التقرير التحليلي التنفيذي الشامل (KPI)
          </button>
          <button
            onClick={handleOpenAddModal}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 800, color: '#065f46', borderColor: '#a7f3d0', background: '#ecfdf5' }}
          >
            ➕ إضافة فرع جديد
          </button>
        </div>
      </div>

      {/* Branches Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: '18px',
        marginBottom: '28px'
      }}>
        {stats?.branches?.map((branch) => (
          <div
            key={branch.id}
            className="panel"
            style={{
              padding: '24px',
              borderRadius: '16px',
              border: branch.active ? '1px solid #e2e8f0' : '1px dashed #cbd5e1',
              background: branch.active ? '#ffffff' : '#f8fafc',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease'
            }}
          >
            <div>
              {/* Branch Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                      {branch.name}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      fontSize: 11,
                      background: '#ede9fe',
                      color: '#5b21b6',
                      padding: '2px 8px',
                      borderRadius: 6
                    }}>
                      {branch.code}
                    </span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>
                      📍 {branch.city || 'غزة'} {branch.address ? `• ${branch.address}` : ''}
                    </span>
                  </div>
                </div>

                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: 20,
                  background: branch.active ? '#dcfce7' : '#fee2e2',
                  color: branch.active ? '#15803d' : '#b91c1c'
                }}>
                  {branch.active ? '🟢 نشط' : '🔴 مجمد'}
                </span>
              </div>

              {/* Branch Manager Box */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '12px 14px',
                borderRadius: '12px',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 16
                }}>
                  👔
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>مدير الفرع المسؤول (Sub-Director)</div>
                  <strong style={{ fontSize: 13.5, color: '#1e293b' }}>
                    {branch.principalName || branch.manager?.fullName || 'لم يتم تعيين مدير'}
                  </strong>
                  {branch.manager?.email && (
                    <div style={{ fontSize: 11, color: '#4f46e5', direction: 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
                      ✉️ {branch.manager.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Branch Metrics Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
                textAlign: 'center',
                marginBottom: 16
              }}>
                <div style={{ background: '#f5f3ff', padding: '10px 8px', borderRadius: 10 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#6d28d9' }}>{branch.teachersCount}</div>
                  <span style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 700 }}>مجموع المعلمين</span>
                </div>
                <div style={{ background: '#eff6ff', padding: '10px 8px', borderRadius: 10 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#1d4ed8' }}>{branch.successRate || 92}%</div>
                  <span style={{ fontSize: 11, color: '#3b82f6', fontWeight: 700 }}>نسبة نجاح الكادر</span>
                </div>
                <div style={{ background: '#ecfdf5', padding: '10px 8px', borderRadius: 10 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#047857' }}>{branch.classesCount}</div>
                  <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>شعبة صفية</span>
                </div>
              </div>

              {/* Financial Collection Progress Bar */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, fontWeight: 700 }}>
                  <span style={{ color: '#475569' }}>نسبة التحصيل المالي للفرع</span>
                  <span style={{ color: '#059669', fontWeight: 900 }}>{branch.collectionRate || 0}%</span>
                </div>
                <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, branch.collectionRate || 0)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #10b981, #059669)',
                    borderRadius: 4
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  <span>المحصل: {(branch.totalCollected || 0).toLocaleString()} ₪</span>
                  <span>المتوقع: {(branch.totalExpected || 0).toLocaleString()} ₪</span>
                </div>
              </div>
            </div>

            {/* Branch Card Action Buttons */}
            <div style={{
              display: 'flex',
              gap: 8,
              borderTop: '1px solid #f1f5f9',
              paddingTop: 14,
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => handleSwitchToBranchView(branch)}
                className="btn btn-primary btn-sm"
                style={{ flex: 1, minWidth: 140, fontWeight: 800, background: '#065f46' }}
                title="عرض التقرير الإداري والمالي للفرع"
              >
                📊 التقرير التنفيذي للفرع
              </button>
              <button
                onClick={() => setEditingBranch(branch)}
                className="btn btn-secondary btn-sm"
                title="تعديل معلومات الفرع"
              >
                ✏️ تعديل
              </button>
              <button
                onClick={() => handleToggleBranchActive(branch)}
                className="btn btn-sm"
                style={{
                  background: '#fff',
                  border: '1px solid #cbd5e1',
                  color: branch.active ? '#dc2626' : '#16a34a',
                  fontSize: 11,
                  fontWeight: 700
                }}
              >
                {branch.active ? '🔒 تجميد' : '🔓 تنشيط'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Open New Branch & Assign Manager */}
      <Modal
        isOpen={isAddBranchOpen}
        onClose={() => setIsAddBranchOpen(false)}
        title="تأسيس فرع مدرسي جديد وتعيين المدير المسؤول"
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddBranchOpen(false)} disabled={branchSubmitting}>
              إلغاء
            </button>
            <button className="btn btn-primary" onClick={handleCreateBranch} disabled={branchSubmitting} style={{ background: '#065f46' }}>
              {branchSubmitting ? 'جاري تأسيس الفرع...' : '🚀 تأسيس الفرع وتفعيل الحساب'}
            </button>
          </>
        }
      >
        {addBranchError && <ErrorAlert message={addBranchError} />}

        <form onSubmit={handleCreateBranch}>
          {/* Section 1: Branch Details */}
          <div style={{ fontWeight: 800, fontSize: 15, color: '#065f46', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🏫</span>
            <span>1. البيانات الأساسية للفرع الجديد</span>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">اسم الفرع <span className="req">*</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="مثال: مدرسة السلام - فرع خانيونس"
                value={newBranchData.name}
                onChange={(e) => setNewBranchData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">كود الفرع الفريد</label>
              <input
                type="text"
                className="form-input"
                placeholder="مثال: BR-KHAN-01"
                value={newBranchData.code}
                onChange={(e) => setNewBranchData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                style={{ fontFamily: 'monospace', fontWeight: 700 }}
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">المدينة / المحافظة</label>
              <select
                className="form-select"
                value={newBranchData.city}
                onChange={(e) => setNewBranchData(prev => ({ ...prev, city: e.target.value }))}
              >
                <option value="غزة">غزة</option>
                <option value="دير البلح">دير البلح</option>
                <option value="خانيونس">خانيونس</option>
                <option value="رفح">رفح</option>
                <option value="شمال غزة">شمال غزة</option>
                <option value="الوسطى">الوسطى</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">العنوان التفصيلي</label>
              <input
                type="text"
                className="form-input"
                placeholder="مثال: شارع البحر - بجوار البلدية"
                value={newBranchData.address}
                onChange={(e) => setNewBranchData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">هاتف الفرع</label>
              <input
                type="text"
                className="form-input"
                placeholder="مثال: 08-2881234"
                value={newBranchData.phone}
                onChange={(e) => setNewBranchData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          {/* Section 2: Branch Manager Credentials */}
          <div style={{
            fontWeight: 800,
            fontSize: 15,
            color: '#1e40af',
            margin: '20px 0 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span>👔</span>
            <span>2. بيانات حساب مدير الفرع المسؤول (Sub-Director)</span>
          </div>

          <div style={{
            background: '#f0fdf4',
            border: '1px dashed #86efac',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '16px'
          }}>
            <p style={{ margin: '0 0 12px', fontSize: 12.5, color: '#166534', fontWeight: 600 }}>
              سيتم إنشاء حساب مستقل للمدير برتبة مسؤول فرع، يمكنه من خلاله إدارة المعلمين وشؤون الطلاب والصفوف لهذا الفرع فقط دون رؤية باقي الفروع.
            </p>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">الاسم الكامل لمدير الفرع <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="مثال: أ. إبراهيم رضوان"
                  value={newBranchData.managerFullName}
                  onChange={(e) => setNewBranchData(prev => ({ ...prev, managerFullName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">البريد الإلكتروني لتسجيل الدخول <span className="req">*</span></label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="مثال: khan.manager@school.edu.ps"
                  value={newBranchData.managerEmail}
                  onChange={(e) => setNewBranchData(prev => ({ ...prev, managerEmail: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2" style={{ marginBottom: 0 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">كلمة المرور الأولية <span className="req">*</span></label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={newBranchData.managerPassword}
                  onChange={(e) => setNewBranchData(prev => ({ ...prev, managerPassword: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">تأكيد كلمة المرور <span className="req">*</span></label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={newBranchData.managerConfirmPassword}
                  onChange={(e) => setNewBranchData(prev => ({ ...prev, managerConfirmPassword: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Branch */}
      {editingBranch && (
        <Modal
          isOpen={Boolean(editingBranch)}
          onClose={() => setEditingBranch(null)}
          title={`تعديل بيانات: ${editingBranch.name}`}
          size="md"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setEditingBranch(null)} disabled={editSubmitting}>
                إلغاء
              </button>
              <button className="btn btn-primary" onClick={handleSaveEditBranch} disabled={editSubmitting}>
                {editSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </>
          }
        >
          {editError && <ErrorAlert message={editError} />}
          <form onSubmit={handleSaveEditBranch}>
            <div className="form-group">
              <label className="form-label">اسم الفرع</label>
              <input
                type="text"
                className="form-input"
                value={editingBranch.name}
                onChange={(e) => setEditingBranch(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">اسم مدير الفرع</label>
              <input
                type="text"
                className="form-input"
                value={editingBranch.principalName || ''}
                onChange={(e) => setEditingBranch(prev => ({ ...prev, principalName: e.target.value }))}
              />
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">المدينة</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingBranch.city || ''}
                  onChange={(e) => setEditingBranch(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">هاتف التواصل</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingBranch.phone || ''}
                  onChange={(e) => setEditingBranch(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">العنوان التفصيلي</label>
              <input
                type="text"
                className="form-input"
                value={editingBranch.address || ''}
                onChange={(e) => setEditingBranch(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Executive Branch Summary & KPIs */}
      {selectedBranchForReport && (
        <Modal
          isOpen={Boolean(selectedBranchForReport)}
          onClose={() => setSelectedBranchForReport(null)}
          title={`التقرير التنفيذي الشامل: ${selectedBranchForReport.name} (${selectedBranchForReport.code})`}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedBranchForReport(null)}
              >
                إغلاق التقرير
              </button>
            </div>
          }
        >
          <div style={{ padding: '6px 0' }}>
            {/* Branch Header Pill */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '16px 20px',
              borderRadius: 14,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 900, color: '#0f172a' }}>
                  {selectedBranchForReport.name}
                </h4>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  📍 {selectedBranchForReport.city || 'غزة'} {selectedBranchForReport.address ? `• ${selectedBranchForReport.address}` : ''} {selectedBranchForReport.phone ? `• هاتف: ${selectedBranchForReport.phone}` : ''}
                </div>
              </div>
              <span style={{
                fontSize: 12,
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: 20,
                background: selectedBranchForReport.active ? '#dcfce7' : '#fee2e2',
                color: selectedBranchForReport.active ? '#15803d' : '#b91c1c'
              }}>
                {selectedBranchForReport.active ? '🟢 الفرع نشط ومفعل' : '🔴 الفرع مجمد'}
              </span>
            </div>

            {/* Financial Overview Card */}
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
              border: '1px solid #fde68a',
              padding: '16px 20px',
              borderRadius: 14,
              marginBottom: 20
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontWeight: 800, color: '#92400e', fontSize: 14 }}>
                  💰 التحصيل المالي للأقساط في هذا الفرع
                </span>
                <span style={{ fontWeight: 900, fontSize: 18, color: '#b45309' }}>
                  {selectedBranchForReport.collectionRate || 0}%
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, fontSize: 13 }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.7)', padding: '10px 14px', borderRadius: 10 }}>
                  <span style={{ color: '#78350f', display: 'block', fontSize: 11, fontWeight: 700 }}>المحصل الفعلي</span>
                  <strong style={{ fontSize: 16, color: '#047857' }}>
                    {(selectedBranchForReport.totalCollected || 0).toLocaleString()} ₪
                  </strong>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.7)', padding: '10px 14px', borderRadius: 10 }}>
                  <span style={{ color: '#78350f', display: 'block', fontSize: 11, fontWeight: 700 }}>المطلوب الإجمالي</span>
                  <strong style={{ fontSize: 16, color: '#1e293b' }}>
                    {(selectedBranchForReport.totalExpected || 0).toLocaleString()} ₪
                  </strong>
                </div>
              </div>
            </div>

            {/* Academic & Faculty Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              marginBottom: 20,
              textAlign: 'center'
            }}>
              <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: 14, borderRadius: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#6d28d9' }}>
                  {selectedBranchForReport.teachersCount || 0}
                </div>
                <span style={{ fontSize: 12, color: '#7c3aed', fontWeight: 800 }}>مجموع المعلمين</span>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: 14, borderRadius: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#1d4ed8' }}>
                  {selectedBranchForReport.successRate || 92}%
                </div>
                <span style={{ fontSize: 12, color: '#2563eb', fontWeight: 800 }}>نسبة النجاح الأكاديمي</span>
              </div>

              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: 14, borderRadius: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#047857' }}>
                  {selectedBranchForReport.classesCount || 0}
                </div>
                <span style={{ fontSize: 12, color: '#059669', fontWeight: 800 }}>الشعب والفصول</span>
              </div>
            </div>

            {/* Branch Management & Responsibility Disclaimer */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: 12,
              padding: '14px 18px',
              fontSize: 12.5,
              color: '#334155',
              lineHeight: 1.6
            }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>👔</span>
                <span>مدير الفرع المعتمد: {selectedBranchForReport.principalName || selectedBranchForReport.manager?.fullName || 'أ. محمود حمدان'}</span>
              </div>
              <div>البريد المعتمد للدخول: <strong>{selectedBranchForReport.manager?.email || 'deir@school.local'}</strong></div>
              <div style={{ marginTop: 8, padding: '8px 12px', background: '#eff6ff', borderRadius: 8, color: '#1e40af', fontSize: 12 }}>
                ℹ️ <strong>ملاحظة تنظيمية:</strong> يتم تسجيل الكادر التعليمي، قبول وتسجيل الطلاب، وتسكين الفصول محلياً بشكل مستقل داخل هذا الفرع عبر حسابه المعتمد ومسؤولي شؤون الطلاب، وتنعكس المؤشرات تلقائياً في لوحة المدير العام.
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
