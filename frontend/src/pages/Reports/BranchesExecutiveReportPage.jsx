import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSchoolConfig } from '../../context/SchoolConfigContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import SchoolLogo from '../../components/common/SchoolLogo';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';

export default function BranchesExecutiveReportPage({ onNavigate }) {
  const { t, isRtl } = useLanguage();
  const { config } = useSchoolConfig();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState('interactive'); // 'interactive' | 'print-preview'

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/reports/branches-general');
      setData(res);
    } catch (err) {
      console.error('Failed to load branches executive report:', err);
      setError(err.message || (isRtl ? 'فشل في تحميل التقرير التحليلي التنفيذي للفروع' : 'Failed to load executive branches report'));
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      toast.info(isRtl ? 'جاري تجهيز وتنزيل ملف التقرير العام للفروع...' : 'Preparing branches report Excel export...');
      const dateStr = new Date().toISOString().slice(0, 10);
      await api.download('/reports/branches-general/export', `Consolidated_Branches_Executive_Report_${dateStr}.xlsx`);
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

  if (loading && !data) {
    return <PageLoader text={isRtl ? 'جاري تجميع وإعداد التقرير التحليلي التنفيذي للفروع...' : 'Compiling consolidated executive report...'} />;
  }

  if (error && !data) {
    return (
      <div style={{ maxWidth: 1000, margin: '30px auto' }}>
        <ErrorAlert message={error} onRetry={loadReport} />
      </div>
    );
  }

  const isSingle = data?.isSingleBranch;
  const analysis = data?.executiveAnalysis;
  const totals = data?.grandTotals;

  return (
    <div className="branches-executive-page" style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 60 }}>
      {/* Non-Printable Header & Controls Navigation Bar */}
      <div className="no-print" style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 24,
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <button
              onClick={() => onNavigate && onNavigate('dashboard')}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 800, padding: '4px 10px', fontSize: 12 }}
            >
              {isRtl ? '← العودة للرئيسية' : '← Back'}
            </button>
            <span style={{
              background: isSingle ? '#eff6ff' : '#ecfdf5',
              color: isSingle ? '#1e40af' : '#047857',
              border: isSingle ? '1px solid #bfdbfe' : '1px solid #a7f3d0',
              padding: '3px 10px',
              borderRadius: 20,
              fontSize: 11.5,
              fontWeight: 800
            }}>
              {isSingle ? '🏫 الفرع المعتمد الوحيد' : `🏢 شبكة الفروع الموحدة (${totals?.totalBranches} فروع)`}
            </span>
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '4px 0 2px' }}>
            {data?.reportTitle}
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
            {data?.scopeDescription} • {isRtl ? 'تاريخ التحديث:' : 'Updated:'} {new Date(data?.generatedAt).toLocaleDateString('ar-EG', { dateStyle: 'full' })}
          </p>
        </div>

        {/* View Mode Switcher & Export Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Mode Switcher Buttons */}
          <div style={{
            background: '#f1f5f9',
            padding: 3,
            borderRadius: 10,
            display: 'inline-flex',
            border: '1px solid #e2e8f0'
          }}>
            <button
              onClick={() => setViewMode('interactive')}
              style={{
                background: viewMode === 'interactive' ? '#ffffff' : 'transparent',
                color: viewMode === 'interactive' ? '#0f172a' : '#64748b',
                fontWeight: viewMode === 'interactive' ? 800 : 600,
                border: 'none',
                padding: '7px 14px',
                borderRadius: 8,
                fontSize: 12.5,
                cursor: 'pointer',
                boxShadow: viewMode === 'interactive' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              📊 {isRtl ? 'العرض التحليلي المتكامل' : 'Interactive Analytics'}
            </button>
            <button
              onClick={() => setViewMode('print-preview')}
              style={{
                background: viewMode === 'print-preview' ? '#ffffff' : 'transparent',
                color: viewMode === 'print-preview' ? '#0f172a' : '#64748b',
                fontWeight: viewMode === 'print-preview' ? 800 : 600,
                border: 'none',
                padding: '7px 14px',
                borderRadius: 8,
                fontSize: 12.5,
                cursor: 'pointer',
                boxShadow: viewMode === 'print-preview' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              📄 {isRtl ? 'معاينة الطباعة الرسمية (A4)' : 'A4 Print Preview'}
            </button>
          </div>

          {/* Action Buttons */}
          <button
            onClick={loadReport}
            className="btn btn-secondary"
            style={{ fontWeight: 800, padding: '8px 14px', fontSize: 13 }}
            title={isRtl ? 'تحديث البيانات الفورية' : 'Refresh Telemetry'}
          >
            🔄 {isRtl ? 'تحديث' : 'Refresh'}
          </button>

          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="btn"
            style={{
              background: '#10b981',
              color: '#ffffff',
              fontWeight: 800,
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              fontSize: 13,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>📥</span>
            <span>{isExporting ? (isRtl ? 'جاري التصدير...' : 'Exporting...') : (isRtl ? 'تصدير إكسيل (Excel)' : 'Excel Export')}</span>
          </button>

          <button
            onClick={handlePrint}
            className="btn btn-primary"
            style={{
              background: '#065f46',
              borderColor: '#065f46',
              fontWeight: 900,
              padding: '8px 18px',
              borderRadius: 8,
              fontSize: 13,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>🖨️</span>
            <span>{isRtl ? 'طباعة التقرير (Print / PDF)' : 'Print / Save PDF'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: INTERACTIVE ANALYTICS VIEW (Screen Dashboard)         */}
      {/* ============================================================== */}
      {viewMode === 'interactive' && (
        <div className="interactive-view no-print">
          {/* Top Executive KPIs Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 14,
            marginBottom: 24
          }}>
            {/* Branches Card */}
            <div className="panel" style={{ padding: '18px 20px', borderTop: '4px solid #10b981' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                {isSingle ? (isRtl ? 'حالة الفرع المعتمد' : 'Authorized Branch') : (isRtl ? 'إجمالي الفروع المعتمدة' : 'Campuses Roster')}
              </span>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#065f46', marginTop: 4 }}>
                {totals?.totalBranches} {isRtl ? (isSingle ? 'فرع رئيسي' : 'فروع') : 'Campuses'}
              </div>
              <div style={{ fontSize: 11.5, color: '#059669', fontWeight: 700, marginTop: 6 }}>
                🟢 {totals?.activeBranches} {isRtl ? 'نشطة وتعمل بكامل طاقتها' : 'Fully Active'}
              </div>
            </div>

            {/* Students Enrolled */}
            <div className="panel" style={{ padding: '18px 20px', borderTop: '4px solid #3b82f6' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                {isRtl ? 'إجمالي الطلاب (عبر الفروع)' : 'Total Student Body'}
              </span>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#1e40af', marginTop: 4 }}>
                {totals?.grandTotalStudents} {isRtl ? 'طالب/ـة' : 'Students'}
              </div>
              <div style={{ fontSize: 11.5, color: '#2563eb', fontWeight: 700, marginTop: 6 }}>
                👥 {isRtl ? 'مسجلين في المنظومة الموحدة' : 'Enrolled Across Network'}
              </div>
            </div>

            {/* Pass Rate KPI */}
            <div className="panel" style={{ padding: '18px 20px', borderTop: '4px solid #059669', background: '#f0fdf4' }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#065f46' }}>
                {isRtl ? 'نسبة النجاح العامة (KPI)' : 'Overall Pass Rate KPI'}
              </span>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#065f46', marginTop: 2 }}>
                {totals?.grandOverallPassRate}%
              </div>
              <div style={{ fontSize: 11.5, color: '#047857', fontWeight: 700, marginTop: 4 }}>
                ✅ {totals?.grandPassedCount} {isRtl ? 'طالب حققوا معيار النجاح' : 'Passed Students'}
              </div>
            </div>

            {/* Fail Rate KPI */}
            <div className="panel" style={{ padding: '18px 20px', borderTop: '4px solid #d97706', background: '#fffbeb' }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#92400e' }}>
                {isRtl ? 'نسبة الرسوب والتعثر (KPI)' : 'Overall Fail Rate KPI'}
              </span>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#b45309', marginTop: 2 }}>
                {totals?.grandOverallFailRate}%
              </div>
              <div style={{ fontSize: 11.5, color: '#b45309', fontWeight: 700, marginTop: 4 }}>
                ⚠️ {totals?.grandFailedCount} {isRtl ? 'يحتاجون خطة دعم وإسناد' : 'Under Follow-up'}
              </div>
            </div>

            {/* Faculty Teachers */}
            <div className="panel" style={{ padding: '18px 20px', borderTop: '4px solid #8b5cf6' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                {isRtl ? 'كادر الهيئة التدريسية' : 'Faculty Allocation'}
              </span>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#6d28d9', marginTop: 4 }}>
                {totals?.grandTotalTeachers} {isRtl ? 'معلم/ـة' : 'Teachers'}
              </div>
              <div style={{ fontSize: 11.5, color: '#7c3aed', fontWeight: 700, marginTop: 6 }}>
                📚 {totals?.grandTotalClasses} {isRtl ? 'فصلاً وشعبة دراسية' : 'Class Sections'}
              </div>
            </div>

            {/* Tuition Collection */}
            <div className="panel" style={{ padding: '18px 20px', borderTop: '4px solid #f59e0b' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                {isRtl ? 'نسبة التحصيل المالي' : 'Tuition Collection'}
              </span>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#b45309', marginTop: 4 }}>
                {totals?.grandOverallCollectionRate}%
              </div>
              <div style={{ fontSize: 11.5, color: '#d97706', fontWeight: 700, marginTop: 6 }}>
                💰 {(totals?.grandTotalCollected || 0).toLocaleString()} ₪ {isRtl ? 'محصل فعلي' : 'Collected'}
              </div>
            </div>
          </div>

          {/* Privacy & Governance Standard Callout */}
          <div style={{
            background: '#f8fafc',
            border: '1.5px solid #cbd5e1',
            borderRadius: 14,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}>
            <span style={{ fontSize: 28 }}>🔒</span>
            <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
              <strong style={{ color: '#0369a1' }}>
                {isRtl ? 'حوكمة خصوصية سجلات الطلاب (Student Data Privacy Protocol):' : 'Student Privacy & Governance Framework:'}
              </strong>{' '}
              {isRtl
                ? 'تطبيقاً لأعلى معايير الحوكمة المؤسسية المعتمدة، تقتصر شاشات الإدارة العامة على مؤشرات الأداء الاستراتيجي (KPIs) لنسبتي النجاح والرسوب، ومعدل الحضور والانضباط الصفي لكل فرع. ولا يتم إدراج أسماء الطلاب أو سجلاتهم الشخصية، حيث تختص إدارات الفروع وشؤون الطلاب المحلية بمتابعة البيانات الفردية وسجلات التسكين.'
                : 'Central administration exclusively accesses macro Key Performance Indicators (KPIs) regarding Pass Rates, Fail Rates, and Attendance per campus. Individual student identities and localized files remain strictly maintained within each local branch.'}
            </div>
          </div>

          {/* In-Depth Executive Analytical Commentary */}
          {analysis && (
            <div className="panel" style={{ padding: '24px', marginBottom: 28, borderRight: isRtl ? '4px solid #065f46' : '1px solid #e2e8f0', borderLeft: !isRtl ? '4px solid #065f46' : '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 22 }}>📋</span>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: '#0f172a' }}>
                  {analysis.statusTitle}
                </h3>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '14px 18px',
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 700,
                color: '#065f46',
                marginBottom: 16,
                lineHeight: 1.6
              }}>
                🌟 {analysis.overallAssessment}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 18 }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: 13.5, color: '#1e40af', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>📈</span>
                    <span>{isRtl ? 'التحليل الأكاديمي لمؤشرات الطلاب (KPI)' : 'Academic Telemetry Analysis'}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5, color: '#475569', lineHeight: 1.6 }}>
                    {analysis.studentPerformanceSummary}
                  </p>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: 13.5, color: '#7c3aed', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>👨‍🏫</span>
                    <span>{isRtl ? 'تحليل الكفاءة التشغيلية والأنصبة' : 'Faculty & Class Operations'}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5, color: '#475569', lineHeight: 1.6 }}>
                    {analysis.operationalSummary}
                  </p>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: 13.5, color: '#b45309', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>💰</span>
                    <span>{isRtl ? 'تحليل التحصيل المالي والاستدامة' : 'Financial Sustainability'}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5, color: '#475569', lineHeight: 1.6 }}>
                    {analysis.financialSummary}
                  </p>
                </div>
              </div>

              {/* Strategic Directives */}
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ fontWeight: 900, fontSize: 13.5, color: '#92400e', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🎯</span>
                  <span>{isRtl ? 'التوجيهات والقرارات الاستراتيجية للمدير العام:' : 'Executive Strategic Directives:'}</span>
                </div>
                <ul style={{ margin: 0, paddingInlineStart: 20, fontSize: 12.5, color: '#78350f', lineHeight: 1.7 }}>
                  {analysis.strategicDirectives?.map((dir, i) => (
                    <li key={i}>{dir}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Section: Branch-by-Branch Detailed Performance Cards */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: 17, fontWeight: 900, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🏢</span>
                <span>
                  {isSingle
                    ? (isRtl ? 'المؤشرات التفصيلية للفرع المعتمد' : 'Authorized Branch Telemetry')
                    : (isRtl ? `المؤشرات التفصيلية لكل فرع (${data.branches.length} فروع)` : `Branch-by-Branch Analytics (${data.branches.length} Campuses)`)}
                </span>
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {data.branches.map((b) => {
                const passPct = b.studentKpis.passRate;
                const failPct = b.studentKpis.failRate;

                return (
                  <div
                    key={b.id}
                    className="panel"
                    style={{
                      padding: '22px 24px',
                      borderRadius: 14,
                      boxShadow: '0 4px 18px rgba(0,0,0,0.03)'
                    }}
                  >
                    {/* Branch Top Details */}
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
                          <span style={{ fontSize: 20 }}>🏫</span>
                          <h4 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0f172a' }}>
                            {b.name}
                          </h4>
                          <span style={{
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            fontSize: 11,
                            background: '#ede9fe',
                            color: '#5b21b6',
                            padding: '2px 8px',
                            borderRadius: 6
                          }}>
                            {b.code}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          📍 {b.city} {b.address ? `• ${b.address}` : ''} {b.phone ? `• هاتف: ${b.phone}` : ''}
                        </div>
                        <div style={{ fontSize: 12.5, color: '#334155', marginTop: 4 }}>
                          👔 {isRtl ? 'مدير الفرع المسؤول:' : 'Principal in Charge:'} <strong>{b.principalName}</strong>
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
                          fontSize: 12,
                          fontWeight: 800,
                          padding: '4px 12px',
                          borderRadius: 20,
                          background: b.active ? '#dcfce7' : '#fee2e2',
                          color: b.active ? '#15803d' : '#b91c1c'
                        }}>
                          {b.active ? (isRtl ? '🟢 الفرع نشط ومفعل' : 'Active') : (isRtl ? '🔴 مجمد' : 'Inactive')}
                        </span>
                        <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>
                          {isRtl ? 'المستوى المؤسسي:' : 'Status:'} <strong>{b.studentKpis.performanceLevel}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Dual Box: Student KPIs vs Operational Telemetry */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                      gap: 16
                    }}>
                      {/* Box 1: Student KPIs (Pass Rate & Fail Rate Focus) */}
                      <div style={{
                        background: '#f8fafc',
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
                          <span style={{ fontSize: 13.5, fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>🎓</span>
                            <span>{isRtl ? 'مؤشرات أداء الطلاب كـ KPI' : 'Student Performance KPIs'}</span>
                          </span>
                          <span style={{ fontSize: 11.5, fontWeight: 800, background: '#e2e8f0', color: '#334155', padding: '2px 8px', borderRadius: 10 }}>
                            {b.studentKpis.totalStudents} {isRtl ? 'طالب/ـة' : 'Students'}
                          </span>
                        </div>

                        {/* Dual Cards for Pass Rate & Fail Rate */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: 10,
                          marginBottom: 12
                        }}>
                          <div style={{
                            background: '#ecfdf5',
                            border: '1.5px solid #86efac',
                            padding: '12px 14px',
                            borderRadius: 10,
                            textAlign: 'center'
                          }}>
                            <span style={{ fontSize: 11.5, fontWeight: 800, color: '#047857', display: 'block' }}>
                              {isRtl ? 'نسبة النجاح للطلاب' : 'Pass Rate KPI'}
                            </span>
                            <div style={{ fontSize: 26, fontWeight: 900, color: '#065f46', margin: '2px 0' }}>
                              {passPct}%
                            </div>
                            <span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>
                              {b.studentKpis.passedCount} {isRtl ? 'طالب ناجح' : 'Passed'}
                            </span>
                          </div>

                          <div style={{
                            background: '#fffbeb',
                            border: '1.5px solid #fde68a',
                            padding: '12px 14px',
                            borderRadius: 10,
                            textAlign: 'center'
                          }}>
                            <span style={{ fontSize: 11.5, fontWeight: 800, color: '#92400e', display: 'block' }}>
                              {isRtl ? 'نسبة الرسوب للطلاب' : 'Fail Rate KPI'}
                            </span>
                            <div style={{ fontSize: 26, fontWeight: 900, color: '#b45309', margin: '2px 0' }}>
                              {failPct}%
                            </div>
                            <span style={{ fontSize: 11, color: '#b45309', fontWeight: 700 }}>
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
                              style={{ width: `${passPct}%`, background: '#10b981', height: '100%' }}
                              title={`نسبة النجاح: ${passPct}%`}
                            />
                            <div
                              style={{ width: `${failPct}%`, background: '#f59e0b', height: '100%' }}
                              title={`نسبة الرسوب: ${failPct}%`}
                            />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginTop: 4 }}>
                            <span>🟢 {isRtl ? 'ناجح' : 'Passed'}: {passPct}%</span>
                            <span>🟠 {isRtl ? 'راسب / متعثر' : 'Failed'}: {failPct}%</span>
                          </div>
                        </div>

                        {/* Secondary Indicators */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          background: '#ffffff',
                          padding: '8px 12px',
                          borderRadius: 8,
                          fontSize: 12,
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

                      {/* Box 2: Faculty & Tuition Details */}
                      <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 12,
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <span style={{ fontSize: 13.5, fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                            <span>👨‍🏫</span>
                            <span>{isRtl ? 'الهيئة التعليمية والصفوف' : 'Faculty & Classrooms'}</span>
                          </span>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
                            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, textAlign: 'center' }}>
                              <div style={{ fontSize: 20, fontWeight: 900, color: '#6d28d9' }}>
                                {b.teachersCount}
                              </div>
                              <span style={{ fontSize: 11, color: '#64748b' }}>
                                {isRtl ? 'مجموع المعلمين' : 'Teachers Count'}
                              </span>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, textAlign: 'center' }}>
                              <div style={{ fontSize: 20, fontWeight: 900, color: '#047857' }}>
                                {b.classesCount}
                              </div>
                              <span style={{ fontSize: 11, color: '#64748b' }}>
                                {isRtl ? 'الشعب الصفية' : 'Class Sections'}
                              </span>
                            </div>
                          </div>
                        </div>

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

          {/* Section: Comparative Matrix Table */}
          <div className="panel" style={{ padding: '22px', marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, margin: '0 0 12px', color: '#0f172a' }}>
              📊 {isRtl ? 'جدول المقارنة المعيارية والتقييم المؤسسي' : 'Institutional Benchmarking Matrix'}
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '12px 14px' }}>#</th>
                    <th style={{ padding: '12px 14px' }}>{isRtl ? 'اسم الفرع' : 'Branch Name'}</th>
                    <th style={{ padding: '12px 14px' }}>{isRtl ? 'المدينة' : 'City'}</th>
                    <th style={{ padding: '12px 14px' }}>{isRtl ? 'المدير المسؤول' : 'Principal'}</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>{isRtl ? 'الطلاب (KPI)' : 'Students'}</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', color: '#047857' }}>{isRtl ? 'نسبة النجاح %' : 'Pass Rate'}</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', color: '#b45309' }}>{isRtl ? 'نسبة الرسوب %' : 'Fail Rate'}</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>{isRtl ? 'الحضور %' : 'Att %'}</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>{isRtl ? 'المعلمين' : 'Teachers'}</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>{isRtl ? 'الشعب' : 'Classes'}</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>{isRtl ? 'التحصيل %' : 'Collect %'}</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>{isRtl ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.branches.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 800 }}>{b.index}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0f172a' }}>{b.name}</td>
                      <td style={{ padding: '12px 14px', color: '#64748b' }}>{b.city}</td>
                      <td style={{ padding: '12px 14px' }}>{b.principalName}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800 }}>{b.studentKpis.totalStudents}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 900, color: '#065f46', background: '#f0fdf4' }}>
                        {b.studentKpis.passRate}%
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 900, color: '#b45309', background: '#fffbeb' }}>
                        {b.studentKpis.failRate}%
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>{b.studentKpis.avgAttendanceRate}%</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>{b.teachersCount}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>{b.classesCount}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800 }}>{b.financials.collectionRate}%</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
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
                  {/* Grand Totals Footer */}
                  <tr style={{ background: '#f1f5f9', fontWeight: 900, borderTop: '2px solid #cbd5e1' }}>
                    <td colSpan={4} style={{ padding: '12px 14px', color: '#0f172a' }}>
                      {isRtl ? 'الإجمالي الموحد الشامل:' : 'Grand Consolidated Totals:'}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: '#1e40af' }}>
                      {totals?.grandTotalStudents}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: '#065f46', background: '#dcfce7' }}>
                      {totals?.grandOverallPassRate}%
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: '#b45309', background: '#fef3c7' }}>
                      {totals?.grandOverallFailRate}%
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {totals?.grandOverallAttendanceRate}%
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {totals?.grandTotalTeachers}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {totals?.grandTotalClasses}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: '#b45309' }}>
                      {totals?.grandOverallCollectionRate}%
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2 & PRINTABLE DOSSIER (A4 Print Preview & Official Sheet) */}
      {/* ============================================================== */}
      {viewMode === 'print-preview' && (
        <div className="no-print" style={{
          background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
          padding: '14px 20px',
          borderRadius: 12,
          marginBottom: 20,
          border: '1.5px solid #cbd5e1',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>📄</span>
            <div>
              <strong style={{ fontSize: 13.5, color: '#0f172a', display: 'block' }}>
                {isRtl ? 'معاينة طبق الأصل لمقاس ورق A4 الرأسي القياسي (210mm × 297mm)' : 'True-to-Scale A4 Portrait Document Preview (210mm × 297mm)'}
              </strong>
              <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                {isRtl ? '✅ الهوامش والحدود والجداول منضبطة 100% داخل حدود الصفحة دون أي قص أو تمدد عرضي' : '✅ Strictly bound within printable margins, no overflow or clipping'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => setViewMode('interactive')}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 800, padding: '7px 14px', fontSize: 12.5 }}
            >
              📊 {isRtl ? 'العرض التحليلي المتكامل' : 'Interactive Analytics'}
            </button>
            <button
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
              style={{
                background: '#065f46',
                borderColor: '#065f46',
                fontWeight: 900,
                padding: '7px 16px',
                fontSize: 12.5,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>🖨️</span>
              <span>{isRtl ? 'طباعة الوثيقة الرسمية فوراً' : 'Print Document Now'}</span>
            </button>
          </div>
        </div>
      )}

      <div
        id="printable-executive-dossier"
        className={viewMode === 'interactive' ? 'print-only' : 'a4-sheet-container'}
        style={{
          width: '100%',
          maxWidth: '210mm',
          margin: '0 auto',
          background: '#ffffff',
          color: '#0f172a',
          boxSizing: 'border-box',
          padding: '12mm 14mm',
          boxShadow: viewMode === 'print-preview' ? '0 10px 35px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)' : 'none',
          borderRadius: viewMode === 'print-preview' ? 4 : 0,
          border: viewMode === 'print-preview' ? '1px solid #cbd5e1' : 'none'
        }}
      >
        {/* Document Header */}
        <div style={{
          borderBottom: '2.5px solid #0f172a',
          paddingBottom: 14,
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <SchoolLogo height={65} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#475569', letterSpacing: 0.5 }}>
                {isRtl ? 'دولة فلسطين • وزارة التربية والتعليم العالي' : 'STATE OF PALESTINE • MINISTRY OF EDUCATION'}
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 900, margin: '2px 0', color: '#0f172a' }}>
                {config?.schoolNameAr || 'مدرسة وروضة السلام الحديثة'}
              </h2>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#065f46' }}>
                {data?.reportTitle}
              </div>
            </div>
          </div>

          <div style={{ textAlign: isRtl ? 'left' : 'right', fontSize: 11, color: '#334155' }}>
            <div style={{
              display: 'inline-block',
              border: '1px solid #0f172a',
              padding: '2px 8px',
              borderRadius: 4,
              fontWeight: 800,
              fontSize: 10.5,
              marginBottom: 4
            }}>
              {isRtl ? 'وثيقة إدارية معتمدة' : 'OFFICIAL DOSSIER'}
            </div>
            <div>{isRtl ? 'كود الوثيقة:' : 'Document No:'} <strong>REP-EXEC-2026-BR</strong></div>
            <div>{isRtl ? 'العام الدراسي:' : 'Academic Year:'} <strong>{data?.academicYear}</strong></div>
            <div>{isRtl ? 'تاريخ التحرير:' : 'Date:'} {new Date(data?.generatedAt).toLocaleDateString('ar-EG')}</div>
          </div>
        </div>

        {/* Executive Summary Statement Box */}
        <div style={{
          border: '1px solid #cbd5e1',
          background: '#f8fafc',
          padding: '12px 16px',
          borderRadius: 6,
          marginBottom: 16,
          fontSize: 12,
          lineHeight: 1.6
        }}>
          <div style={{ fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>
            📌 {isRtl ? 'بيان الحوكمة والتحليل التنفيذي العام:' : 'Executive Summary & Governance Protocol:'}
          </div>
          <div style={{ color: '#334155' }}>
            {analysis?.overallAssessment} {data?.privacyGovernanceNote}
          </div>
        </div>

        {/* KPIs Grid Box on Print Document */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          border: '1px solid #0f172a',
          borderRadius: 6,
          overflow: 'hidden',
          marginBottom: 16,
          textAlign: 'center'
        }}>
          <div style={{ borderInlineEnd: '1px solid #0f172a', padding: '8px 4px', background: '#f8fafc' }}>
            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>{isRtl ? 'الفروع المشمولة' : 'Branches'}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>{totals?.totalBranches}</div>
          </div>

          <div style={{ borderInlineEnd: '1px solid #0f172a', padding: '8px 4px', background: '#f8fafc' }}>
            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>{isRtl ? 'إجمالي الطلاب' : 'Students'}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1e40af' }}>{totals?.grandTotalStudents}</div>
          </div>

          <div style={{ borderInlineEnd: '1px solid #0f172a', padding: '8px 4px', background: '#ecfdf5' }}>
            <div style={{ fontSize: 10, color: '#047857', fontWeight: 800 }}>{isRtl ? 'نسبة النجاح (KPI)' : 'Pass Rate'}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#065f46' }}>{totals?.grandOverallPassRate}%</div>
          </div>

          <div style={{ borderInlineEnd: '1px solid #0f172a', padding: '8px 4px', background: '#fffbeb' }}>
            <div style={{ fontSize: 10, color: '#92400e', fontWeight: 800 }}>{isRtl ? 'نسبة الرسوب (KPI)' : 'Fail Rate'}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#b45309' }}>{totals?.grandOverallFailRate}%</div>
          </div>

          <div style={{ borderInlineEnd: '1px solid #0f172a', padding: '8px 4px', background: '#f8fafc' }}>
            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>{isRtl ? 'كادر المعلمين' : 'Teachers'}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#6d28d9' }}>{totals?.grandTotalTeachers}</div>
          </div>

          <div style={{ padding: '8px 4px', background: '#f8fafc' }}>
            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>{isRtl ? 'التحصيل المالي' : 'Tuition'}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#b45309' }}>{totals?.grandOverallCollectionRate}%</div>
          </div>
        </div>

        {/* Official Benchmarking Table (Formatted strictly to stay within A4 margins) */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>
            {isRtl ? 'كشف المؤشرات التفصيلي المعتمد لكافة الفروع:' : 'Certified Campuses Performance Roster:'}
          </div>

          <table style={{
            width: '100%',
            tableLayout: 'fixed',
            borderCollapse: 'collapse',
            fontSize: 10.5,
            border: '1.5px solid #0f172a'
          }}>
            <thead>
              <tr style={{ background: '#e2e8f0', borderBottom: '1.5px solid #0f172a' }}>
                <th style={{ width: '5%', padding: '6px 4px', textAlign: 'center' }}>#</th>
                <th style={{ width: '25%', padding: '6px 6px', textAlign: isRtl ? 'right' : 'left' }}>{isRtl ? 'اسم الفرع والكود' : 'Branch & Code'}</th>
                <th style={{ width: '18%', padding: '6px 6px', textAlign: isRtl ? 'right' : 'left' }}>{isRtl ? 'المدير المسؤول' : 'Principal'}</th>
                <th style={{ width: '10%', padding: '6px 4px', textAlign: 'center' }}>{isRtl ? 'الطلاب' : 'Students'}</th>
                <th style={{ width: '11%', padding: '6px 4px', textAlign: 'center' }}>{isRtl ? 'النجاح %' : 'Pass %'}</th>
                <th style={{ width: '11%', padding: '6px 4px', textAlign: 'center' }}>{isRtl ? 'الرسوب %' : 'Fail %'}</th>
                <th style={{ width: '10%', padding: '6px 4px', textAlign: 'center' }}>{isRtl ? 'المعلمين' : 'Staff'}</th>
                <th style={{ width: '10%', padding: '6px 4px', textAlign: 'center' }}>{isRtl ? 'التحصيل' : 'Coll %'}</th>
              </tr>
            </thead>
            <tbody>
              {data?.branches.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 800 }}>{b.index}</td>
                  <td style={{ padding: '6px 6px', fontWeight: 800 }}>
                    {b.name} <span style={{ fontSize: 9.5, color: '#64748b' }}>({b.code})</span>
                  </td>
                  <td style={{ padding: '6px 6px' }}>{b.principalName}</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 800 }}>{b.studentKpis.totalStudents}</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 900, color: '#047857' }}>
                    {b.studentKpis.passRate}%
                  </td>
                  <td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 900, color: '#b45309' }}>
                    {b.studentKpis.failRate}%
                  </td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>{b.teachersCount}</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 800 }}>{b.financials.collectionRate}%</td>
                </tr>
              ))}
              {/* Grand Total Row */}
              <tr style={{ background: '#f1f5f9', fontWeight: 900, borderTop: '1.5px solid #0f172a' }}>
                <td colSpan={3} style={{ padding: '6px 8px' }}>
                  {isRtl ? 'الإجمالي الموحد العام للمؤسسة:' : 'Consolidated Grand Totals:'}
                </td>
                <td style={{ padding: '6px 4px', textAlign: 'center' }}>{totals?.grandTotalStudents}</td>
                <td style={{ padding: '6px 4px', textAlign: 'center', color: '#047857' }}>{totals?.grandOverallPassRate}%</td>
                <td style={{ padding: '6px 4px', textAlign: 'center', color: '#b45309' }}>{totals?.grandOverallFailRate}%</td>
                <td style={{ padding: '6px 4px', textAlign: 'center' }}>{totals?.grandTotalTeachers}</td>
                <td style={{ padding: '6px 4px', textAlign: 'center' }}>{totals?.grandOverallCollectionRate}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Strategic Directives on Print Document */}
        {analysis?.strategicDirectives && (
          <div style={{
            border: '1px solid #cbd5e1',
            padding: '10px 14px',
            borderRadius: 6,
            marginBottom: 20,
            fontSize: 11,
            lineHeight: 1.6
          }}>
            <strong style={{ display: 'block', color: '#0f172a', marginBottom: 4 }}>
              📌 {isRtl ? 'التوصيات والقرارات الإدارية المعتمدة:' : 'Official Strategic Directives:'}
            </strong>
            <ul style={{ margin: 0, paddingInlineStart: 18, color: '#334155' }}>
              {analysis.strategicDirectives.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Official Endorsement & Stamp Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          paddingTop: 14,
          borderTop: '1.5px solid #0f172a',
          fontSize: 11
        }}>
          <div>
            <div style={{ color: '#64748b' }}>{isRtl ? 'الجهة المصدرة للتقرير:' : 'Issuing Authority:'}</div>
            <strong style={{ fontSize: 12, color: '#0f172a' }}>
              {isRtl ? 'مكتب المدير العام - إدارة الحوكمة والمتابعة المركزية' : 'Office of General Director - Central Administration'}
            </strong>
            <div style={{ fontSize: 9.5, color: '#64748b', marginTop: 2 }}>
              {isRtl ? 'وثيقة رسمية صادرة آلياً ومصدقة من قاعدة البيانات' : 'Electronically authenticated official document'}
            </div>
          </div>

          <div style={{ textAlign: 'center', minWidth: 160 }}>
            <div style={{ color: '#64748b', marginBottom: 30 }}>
              {isRtl ? 'اعتماد وخاتم المدير العام' : 'General Director Endorsement'}
            </div>
            <div style={{ borderTop: '1px dotted #0f172a', paddingTop: 4, fontWeight: 900 }}>
              {data?.generatedBy || 'المدير العام'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
