import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSchoolConfig } from '../../context/SchoolConfigContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import SchoolLogo from '../../components/common/SchoolLogo';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';

export default function BranchesGeneralReportModal({ isOpen, onClose }) {
  const { t, isRtl } = useLanguage();
  const { config } = useSchoolConfig();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadReport();
    }
  }, [isOpen]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/reports/branches-general');
      setData(res);
    } catch (err) {
      console.error('Failed to load branches general report:', err);
      setError(err.message || (isRtl ? 'فشل في تحميل التقرير العام للفروع' : 'Failed to load branches report'));
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      toast.info(isRtl ? 'جاري تجهيز وتنزيل ملف التقرير العام للفروع...' : 'Preparing branches report Excel export...');
      const dateStr = new Date().toISOString().slice(0, 10);
      await api.download('/reports/branches-general/export', `Consolidated_Branches_General_Report_${dateStr}.xlsx`);
      toast.success(isRtl ? 'تم تنزيل ملف التقرير العام بنجاح!' : 'Report downloaded successfully!');
    } catch (err) {
      toast.error(err.message || (isRtl ? 'فشل في تصدير ملف الإكسيل' : 'Failed to export Excel'));
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRtl ? 'التقرير العام الموحد للفروع ومؤشرات الأداء (KPI)' : 'Consolidated Multi-Branch General KPI Report'}
      size="xl"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            🔒 {isRtl ? 'تقرير تنفيذي معتمد للإدارة العامة • خصوصية الطلاب محفوظة كـ KPI' : 'Executive report • Student privacy preserved as KPIs'}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              {isRtl ? 'إغلاق' : 'Close'}
            </button>
            <button
              type="button"
              className="btn"
              onClick={handleExportExcel}
              disabled={isExporting || loading}
              style={{
                background: '#10b981',
                color: '#fff',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>📥</span>
              <span>{isExporting ? (isRtl ? 'جاري التصدير...' : 'Exporting...') : (isRtl ? 'تصدير إكسيل (Excel)' : 'Export Excel')}</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePrint}
              disabled={loading}
              style={{
                background: '#065f46',
                borderColor: '#065f46',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>🖨️</span>
              <span>{isRtl ? 'طباعة التقرير (Print / PDF)' : 'Print Report (PDF)'}</span>
            </button>
          </div>
        </div>
      }
    >
      <div id="printable-branches-general-report" style={{ padding: '4px 0', minHeight: 400 }}>
        {loading && <PageLoader text={isRtl ? 'جاري تجميع المؤشرات العامة لكافة الفروع...' : 'Compiling consolidated branch telemetry...'} />}

        {error && <ErrorAlert message={error} onRetry={loadReport} />}

        {!loading && !error && data && (
          <div>
            {/* Header: School Branding & Official Endorsement */}
            <div style={{
              borderBottom: '2px solid #e2e8f0',
              paddingBottom: 18,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <SchoolLogo height={65} />
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 4px', color: '#0f172a' }}>
                    {config?.schoolNameAr || 'مدرسة السلام الحديثة'}
                  </h2>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#065f46' }}>
                    {data.reportTitle}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    {data.scopeDescription}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                <span style={{
                  display: 'inline-block',
                  background: data.isSingleBranch ? '#eff6ff' : '#ecfdf5',
                  color: data.isSingleBranch ? '#1e40af' : '#047857',
                  border: data.isSingleBranch ? '1px solid #bfdbfe' : '1px solid #a7f3d0',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 800,
                  marginBottom: 6
                }}>
                  {data.isSingleBranch ? '🏫 تقرير الفرع المعتمد' : `🏢 تقرير موحد مجمع (${data.grandTotals.totalBranches} فروع)`}
                </span>
                <div style={{ fontSize: 11.5, color: '#64748b' }}>
                  {isRtl ? 'العام الدراسي:' : 'Academic Year:'} <strong>{data.academicYear}</strong>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  {isRtl ? 'تاريخ الاستخراج:' : 'Generated:'} {new Date(data.generatedAt).toLocaleDateString('ar-EG', { dateStyle: 'full' })}
                </div>
              </div>
            </div>

            {/* Privacy & Governance Notice Banner */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRight: isRtl ? '4px solid #0284c7' : '1px solid #cbd5e1',
              borderLeft: !isRtl ? '4px solid #0284c7' : '1px solid #cbd5e1',
              padding: '12px 16px',
              borderRadius: 10,
              marginBottom: 22,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <span style={{ fontSize: 24 }}>🔒</span>
              <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.5 }}>
                <strong style={{ color: '#0369a1' }}>
                  {isRtl ? 'معايير حوكمة خصوصية بيانات الطلاب:' : 'Student Privacy & Governance Standards:'}
                </strong>{' '}
                {isRtl
                  ? 'يقتصر تقرير الإدارة العامة على مؤشرات الأداء الرئيسية (KPIs: نسبة النجاح، نسبة الرسوب، ومعدل الحضور والانتظام) لكل فرع؛ ضماناً للحوكمة المؤسسية مع بقاء السجلات الفردية والبيانات الشخصية للطلاب محفوظة ومُدارة محلياً لدى كل فرع على حدة.'
                  : 'Executive reporting strictly restricts student metrics to high-level KPIs (Pass Rate %, Fail Rate %, and Attendance %) per branch, safeguarding student privacy while providing complete multi-branch institutional oversight.'}
              </div>
            </div>

            {/* Grand Executive KPIs Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
              marginBottom: 24
            }}>
              {/* Grand Total Branches */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px 16px', borderRadius: 12, textAlign: 'center' }}>
                <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 700, display: 'block' }}>
                  {isRtl ? 'الفروع المشمولة' : 'Branches Count'}
                </span>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                  {data.grandTotals.totalBranches}
                </div>
                <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>
                  🟢 {data.grandTotals.activeBranches} {isRtl ? 'نشطة' : 'Active'}
                </span>
              </div>

              {/* Grand Total Students */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '14px 16px', borderRadius: 12, textAlign: 'center' }}>
                <span style={{ fontSize: 11.5, color: '#1d4ed8', fontWeight: 700, display: 'block' }}>
                  {isRtl ? 'إجمالي الطلاب (عبر الفروع)' : 'Total Students'}
                </span>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#1e40af', margin: '4px 0' }}>
                  {data.grandTotals.grandTotalStudents}
                </div>
                <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 700 }}>
                  {isRtl ? 'موزعين حسب الفروع' : 'Enrolled Across Campuses'}
                </span>
              </div>

              {/* Grand Overall Pass Rate KPI */}
              <div style={{ background: '#ecfdf5', border: '1.5px solid #10b981', padding: '14px 16px', borderRadius: 12, textAlign: 'center' }}>
                <span style={{ fontSize: 11.5, color: '#047857', fontWeight: 800, display: 'block' }}>
                  {isRtl ? 'نسبة النجاح العامة (KPI)' : 'Overall Pass Rate KPI'}
                </span>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#065f46', margin: '4px 0' }}>
                  {data.grandTotals.grandOverallPassRate}%
                </div>
                <span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>
                  ✅ {data.grandTotals.grandPassedCount} {isRtl ? 'طالب ناجح' : 'Passed'}
                </span>
              </div>

              {/* Grand Overall Fail Rate KPI */}
              <div style={{ background: '#fffbeb', border: '1.5px solid #f59e0b', padding: '14px 16px', borderRadius: 12, textAlign: 'center' }}>
                <span style={{ fontSize: 11.5, color: '#b45309', fontWeight: 800, display: 'block' }}>
                  {isRtl ? 'نسبة الرسوب العامة (KPI)' : 'Overall Fail Rate KPI'}
                </span>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#d97706', margin: '4px 0' }}>
                  {data.grandTotals.grandOverallFailRate}%
                </div>
                <span style={{ fontSize: 11, color: '#b45309', fontWeight: 700 }}>
                  ⚠️ {data.grandTotals.grandFailedCount} {isRtl ? 'يحتاج متابعة' : 'Support Needed'}
                </span>
              </div>

              {/* Grand Total Teachers */}
              <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '14px 16px', borderRadius: 12, textAlign: 'center' }}>
                <span style={{ fontSize: 11.5, color: '#6d28d9', fontWeight: 700, display: 'block' }}>
                  {isRtl ? 'كادر المعلمين الموحد' : 'Total Faculty'}
                </span>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#5b21b6', margin: '4px 0' }}>
                  {data.grandTotals.grandTotalTeachers}
                </div>
                <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700 }}>
                  👨‍🏫 {data.grandTotals.grandTotalClasses} {isRtl ? 'شعبة دراسية' : 'Classes'}
                </span>
              </div>

              {/* Grand Financial Collection */}
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: '14px 16px', borderRadius: 12, textAlign: 'center' }}>
                <span style={{ fontSize: 11.5, color: '#92400e', fontWeight: 700, display: 'block' }}>
                  {isRtl ? 'التحصيل المالي العام' : 'Overall Fees Collection'}
                </span>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#b45309', margin: '4px 0' }}>
                  {data.grandTotals.grandOverallCollectionRate}%
                </div>
                <span style={{ fontSize: 11, color: '#78350f', fontWeight: 700 }}>
                  💰 {(data.grandTotals.grandTotalCollected).toLocaleString()} ₪
                </span>
              </div>
            </div>

            {/* Section: Branch-by-Branch Detailed Performance Cards */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🏢</span>
                  <span>
                    {data.isSingleBranch
                      ? (isRtl ? 'بيانات وإحصائيات الفرع ومؤشرات الطلاب (KPI)' : 'Branch Statistics & Student KPIs')
                      : (isRtl ? `مؤشرات الأداء التفصيلية لكل فرع (${data.branches.length} فروع)` : `Branch-by-Branch Detailed KPIs (${data.branches.length} Branches)`)}
                  </span>
                </h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  {isRtl ? 'مرتبة حسب الفروع المعتمدة' : 'Official Campuses Roster'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {data.branches.map((b) => {
                  const passPct = b.studentKpis.passRate;
                  const failPct = b.studentKpis.failRate;

                  return (
                    <div
                      key={b.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 14,
                        padding: '20px 22px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
                      }}
                    >
                      {/* Branch Top Line */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: 12,
                        borderBottom: '1px solid #f1f5f9',
                        paddingBottom: 14,
                        marginBottom: 16
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 18 }}>🏫</span>
                            <h4 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: '#0f172a' }}>
                              {b.name}
                            </h4>
                            <span style={{
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              fontSize: 11,
                              background: '#f1f5f9',
                              color: '#475569',
                              padding: '2px 8px',
                              borderRadius: 6
                            }}>
                              {b.code}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            📍 {b.city} {b.address ? `• ${b.address}` : ''} {b.phone ? `• هاتف: ${b.phone}` : ''}
                          </div>
                          <div style={{ fontSize: 12, color: '#334155', marginTop: 4 }}>
                            👔 {isRtl ? 'مدير الفرع المسؤول:' : 'Principal:'} <strong>{b.principalName}</strong>
                            {b.managerEmail && b.managerEmail !== '—' && (
                              <span style={{ color: '#4f46e5', marginInlineStart: 8, fontSize: 11 }}>
                                ({b.managerEmail})
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                          <span style={{
                            display: 'inline-block',
                            fontSize: 11.5,
                            fontWeight: 800,
                            padding: '4px 12px',
                            borderRadius: 20,
                            background: b.active ? '#dcfce7' : '#fee2e2',
                            color: b.active ? '#15803d' : '#b91c1c'
                          }}>
                            {b.active ? (isRtl ? '🟢 الفرع نشط' : 'Active') : (isRtl ? '🔴 الفرع مجمد' : 'Inactive')}
                          </span>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                            {isRtl ? 'المستوى المؤسسي:' : 'Status:'} <strong>{b.studentKpis.performanceLevel}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Main Grid: Student KPIs vs Operational & Financial Metrics */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: 16
                      }}>
                        {/* Box 1: Student KPIs (Pass Rate & Fail Rate Focus) */}
                        <div style={{
                          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: 12,
                          padding: '16px'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 12
                          }}>
                            <span style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>🎓</span>
                              <span>{isRtl ? 'مؤشرات أداء الطلاب كـ KPI' : 'Student Performance KPIs'}</span>
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 800, background: '#e2e8f0', color: '#334155', padding: '2px 8px', borderRadius: 10 }}>
                              {b.studentKpis.totalStudents} {isRtl ? 'طالب/ـة' : 'Students'}
                            </span>
                          </div>

                          {/* Pass Rate & Fail Rate Dual Gauges */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 10,
                            marginBottom: 12
                          }}>
                            {/* Pass Rate Card */}
                            <div style={{
                              background: '#ecfdf5',
                              border: '1.5px solid #86efac',
                              padding: '10px 12px',
                              borderRadius: 10,
                              textAlign: 'center'
                            }}>
                              <span style={{ fontSize: 11, fontWeight: 800, color: '#047857', display: 'block' }}>
                                {isRtl ? 'نسبة النجاح' : 'Pass Rate'}
                              </span>
                              <div style={{ fontSize: 24, fontWeight: 900, color: '#065f46', margin: '2px 0' }}>
                                {passPct}%
                              </div>
                              <span style={{ fontSize: 10.5, color: '#059669', fontWeight: 700 }}>
                                {b.studentKpis.passedCount} {isRtl ? 'طالب ناجح' : 'Passed'}
                              </span>
                            </div>

                            {/* Fail Rate Card */}
                            <div style={{
                              background: '#fffbeb',
                              border: '1.5px solid #fde68a',
                              padding: '10px 12px',
                              borderRadius: 10,
                              textAlign: 'center'
                            }}>
                              <span style={{ fontSize: 11, fontWeight: 800, color: '#92400e', display: 'block' }}>
                                {isRtl ? 'نسبة الرسوب' : 'Fail Rate'}
                              </span>
                              <div style={{ fontSize: 24, fontWeight: 900, color: '#b45309', margin: '2px 0' }}>
                                {failPct}%
                              </div>
                              <span style={{ fontSize: 10.5, color: '#b45309', fontWeight: 700 }}>
                                {b.studentKpis.failedCount} {isRtl ? 'يحتاج متابعة' : 'Support Needed'}
                              </span>
                            </div>
                          </div>

                          {/* Visual Ratio Bar */}
                          <div style={{ marginBottom: 10 }}>
                            <div style={{
                              width: '100%',
                              height: 10,
                              background: '#fed7aa',
                              borderRadius: 6,
                              overflow: 'hidden',
                              display: 'flex'
                            }}>
                              <div
                                style={{
                                  width: `${passPct}%`,
                                  background: '#10b981',
                                  height: '100%'
                                }}
                                title={`نسبة النجاح: ${passPct}%`}
                              />
                              <div
                                style={{
                                  width: `${failPct}%`,
                                  background: '#f59e0b',
                                  height: '100%'
                                }}
                                title={`نسبة الرسوب: ${failPct}%`}
                              />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#64748b', marginTop: 4 }}>
                              <span>🟢 {isRtl ? 'ناجح' : 'Passed'}: {passPct}%</span>
                              <span>🟠 {isRtl ? 'راسب / متعثر' : 'Failed'}: {failPct}%</span>
                            </div>
                          </div>

                          {/* Secondary Student Metrics */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            background: '#ffffff',
                            padding: '8px 12px',
                            borderRadius: 8,
                            fontSize: 11.5,
                            color: '#475569'
                          }}>
                            <div>
                              {isRtl ? 'معدل الحضور:' : 'Attendance:'}{' '}
                              <strong style={{ color: '#0f172a' }}>{b.studentKpis.avgAttendanceRate}%</strong>
                            </div>
                            <div>
                              {isRtl ? 'المعدل العام (GPA):' : 'Avg GPA:'}{' '}
                              <strong style={{ color: '#0f172a' }}>{b.studentKpis.avgGpa}%</strong>
                            </div>
                          </div>
                        </div>

                        {/* Box 2: Staff & Financial Operations in Branch */}
                        <div style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: 12,
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}>
                          {/* Staff Details */}
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                              <span>👨‍🏫</span>
                              <span>{isRtl ? 'الهيئة التعليمية والصفوف' : 'Faculty & Classrooms'}</span>
                            </span>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
                              <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 8, textAlign: 'center' }}>
                                <div style={{ fontSize: 18, fontWeight: 900, color: '#6d28d9' }}>
                                  {b.teachersCount}
                                </div>
                                <span style={{ fontSize: 11, color: '#64748b' }}>
                                  {isRtl ? 'مجموع المعلمين' : 'Teachers Count'}
                                </span>
                              </div>
                              <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 8, textAlign: 'center' }}>
                                <div style={{ fontSize: 18, fontWeight: 900, color: '#047857' }}>
                                  {b.classesCount}
                                </div>
                                <span style={{ fontSize: 11, color: '#64748b' }}>
                                  {isRtl ? 'الشعب الصفية' : 'Class Sections'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Financial Details */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, fontWeight: 700 }}>
                              <span style={{ color: '#475569' }}>
                                💰 {isRtl ? 'نسبة التحصيل المالي' : 'Fees Collection Rate'}
                              </span>
                              <span style={{ color: '#059669', fontWeight: 900 }}>
                                {b.financials.collectionRate}%
                              </span>
                            </div>
                            <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                              <div style={{
                                width: `${Math.min(100, b.financials.collectionRate)}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #10b981, #059669)',
                                borderRadius: 4
                              }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginTop: 4 }}>
                              <span>{isRtl ? 'المحصل:' : 'Collected:'} {b.financials.totalCollected.toLocaleString()} ₪</span>
                              <span>{isRtl ? 'المتوقع:' : 'Expected:'} {b.financials.totalExpected.toLocaleString()} ₪</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section: Consolidated Branches KPI Comparison Table */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 900, margin: '0 0 10px', color: '#1e293b' }}>
                📊 {isRtl ? 'جدول المقارنة الإحصائي الموحد لكافة الفروع' : 'Comparative Statistical Summary Table'}
              </h3>

              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left', fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '10px 12px' }}>#</th>
                      <th style={{ padding: '10px 12px' }}>{isRtl ? 'اسم الفرع' : 'Branch Name'}</th>
                      <th style={{ padding: '10px 12px' }}>{isRtl ? 'المدينة' : 'City'}</th>
                      <th style={{ padding: '10px 12px' }}>{isRtl ? 'المدير المسؤول' : 'Principal'}</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>{isRtl ? 'الطلاب (KPI)' : 'Students'}</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', color: '#047857' }}>{isRtl ? 'نسبة النجاح %' : 'Pass Rate'}</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', color: '#b45309' }}>{isRtl ? 'نسبة الرسوب %' : 'Fail Rate'}</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>{isRtl ? 'الحضور %' : 'Att %'}</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>{isRtl ? 'المعلمين' : 'Teachers'}</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>{isRtl ? 'الشعب' : 'Classes'}</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>{isRtl ? 'التحصيل %' : 'Collect %'}</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>{isRtl ? 'الحالة' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.branches.map((b, idx) => (
                      <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fcfcfd' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 800 }}>{b.index}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>{b.name}</td>
                        <td style={{ padding: '10px 12px', color: '#64748b' }}>{b.city}</td>
                        <td style={{ padding: '10px 12px' }}>{b.principalName}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800 }}>{b.studentKpis.totalStudents}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 900, color: '#065f46', background: '#f0fdf4' }}>
                          {b.studentKpis.passRate}%
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 900, color: '#b45309', background: '#fffbeb' }}>
                          {b.studentKpis.failRate}%
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>{b.studentKpis.avgAttendanceRate}%</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>{b.teachersCount}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>{b.classesCount}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800 }}>{b.financials.collectionRate}%</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 12,
                            background: b.active ? '#dcfce7' : '#fee2e2',
                            color: b.active ? '#15803d' : '#b91c1c'
                          }}>
                            {b.active ? (isRtl ? 'نشط' : 'Active') : (isRtl ? 'مجمد' : 'Inactive')}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {/* Grand Totals Footer Row */}
                    <tr style={{ background: '#f1f5f9', fontWeight: 900, borderTop: '2px solid #cbd5e1' }}>
                      <td colSpan={4} style={{ padding: '12px', color: '#0f172a' }}>
                        {isRtl ? 'الإجمالي الموحد لكافة الفروع:' : 'Consolidated Total Across All Branches:'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#1e40af' }}>
                        {data.grandTotals.grandTotalStudents}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#065f46', background: '#dcfce7' }}>
                        {data.grandTotals.grandOverallPassRate}%
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#b45309', background: '#fef3c7' }}>
                        {data.grandTotals.grandOverallFailRate}%
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {data.grandTotals.grandOverallAttendanceRate}%
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {data.grandTotals.grandTotalTeachers}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {data.grandTotals.grandTotalClasses}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#b45309' }}>
                        {data.grandTotals.grandOverallCollectionRate}%
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Official Certification & Signature Box (for Print/PDF) */}
            <div style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: '2px dashed #cbd5e1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: 20
            }}>
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {isRtl ? 'جهة إصدار التقرير:' : 'Issuing Authority:'}
                </div>
                <strong style={{ fontSize: 14, color: '#0f172a' }}>
                  {isRtl ? 'مكتب المدير العام - إدارة الفروع والحوكمة المركزية' : 'Office of General Director - Central Campuses Administration'}
                </strong>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                  {isRtl ? 'تم إصدار هذا الكشف آلياً ومطابقته مع سجلات النظام الموحد' : 'Generated & authenticated from unified central database'}
                </div>
              </div>

              <div style={{ textAlign: 'center', minWidth: 200 }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 25 }}>
                  {isRtl ? 'ختم واعتماد المدير العام' : 'General Director Endorsement'}
                </div>
                <div style={{
                  borderTop: '1px solid #94a3b8',
                  paddingTop: 6,
                  fontSize: 13,
                  fontWeight: 900,
                  color: '#065f46'
                }}>
                  {data.generatedBy}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
