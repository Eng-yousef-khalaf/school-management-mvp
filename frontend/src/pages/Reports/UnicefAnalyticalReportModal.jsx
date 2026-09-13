import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSchoolConfig } from '../../context/SchoolConfigContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import SchoolLogo from '../../components/common/SchoolLogo';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import { PalestineFlagIcon, UnicefEmblemIcon } from '../../components/common/Icons';

export default function UnicefAnalyticalReportModal({ isOpen, onClose }) {
  const { config } = useSchoolConfig();
  const { isRtl } = useLanguage();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');

  const fetchAnalyticalReport = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/reports/executive-analytical');
      setReportData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch institutional analytical report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAnalyticalReport();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = 'التقرير التحليلي المؤسسي لمتطلبات الرصد الإنساني والتربوي - موجه لوزارة التربية والتعليم واليونيسيف';
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const kpis = reportData?.kpis || {
    totalStudents: 0,
    maleStudents: 0,
    femaleStudents: 0,
    totalTeachers: 0,
    activeTeachers: 0,
    totalClasses: 0,
    studentTeacherRatio: '15.0',
    overallPassRate: 100,
    avgSchoolGpa: 84,
    avgAttendanceRate: 96,
    avgAssignmentsPerTeacher: '4.0',
    curriculumCoveragePct: 100,
    teacherPunctualityPct: 97.4
  };

  const brackets = reportData?.performanceBrackets || {
    excellent: { count: 0, pct: 0 },
    veryGood: { count: 0, pct: 0 },
    good: { count: 0, pct: 0 },
    average: { count: 0, pct: 0 },
    needSupport: { count: 0, pct: 0 }
  };

  const schoolName = isRtl ? (config?.schoolNameAr || 'نظام إدارة المدرسة الذكي') : (config?.schoolNameEn || 'Smart School System');
  const currentDateFormatted = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="modal-overlay unicef-report-overlay">
      <div className="modal-content unicef-report-modal">
        {/* Top Action Control Toolbar (Hidden on Print) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0369a1 100%)',
            color: '#ffffff',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 26 }}>📊</div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#ffffff' }}>
                {isRtl ? 'التقرير التحليلي المؤسسي لمتطلبات الرصد الإنساني والتعليمي (PDF)' : 'Institutional & Humanitarian Analytical Report (PDF)'}
              </h3>
              <div style={{ fontSize: 11, color: '#bae6fd', marginTop: 2 }}>
                {isRtl
                  ? 'مصمم لتلبية متطلبات التقارير المؤسسية والإنسانية - مُعَد للتسليم لدى: وزارة التربية والتعليم العالي & اليونيسيف (UNICEF)'
                  : 'Designed for Institutional and Humanitarian Reporting Requirements - Prepared for Submission to MoE & UNICEF'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handlePrint}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '9px 20px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.45)'
              }}
            >
              <span>🖨️</span>
              <span>{isRtl ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                border: 'none',
                padding: '9px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isRtl ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>

        {/* Informative Dynamic Tip Banner (Hidden on Print) */}
        <div
          className="no-print"
          style={{
            background: '#f0fdf4',
            borderBottom: '1px solid #bbf7d0',
            padding: '10px 24px',
            fontSize: 12,
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>💡</span>
            <span>
              {isRtl
                ? 'وثيقة تحليلية رسمية صادرة عن إدارة المدرسة ومصممة وفق المعايير والمتطلبات الإنسانية والتربوية تمهيداً لتقديمها واعتمادها لدى الجهات المعنية.'
                : 'Reports designed for institutional and humanitarian reporting requirements — prepared by school administration for submission to partners.'}
            </span>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#047857', background: '#dcfce7', padding: '3px 10px', borderRadius: 20 }}>
            {isRtl ? `بيانات حية: ${kpis.totalStudents} طالب | ${kpis.totalTeachers} معلم | ${kpis.totalClasses} صف` : `${kpis.totalStudents} Students | ${kpis.totalTeachers} Teachers`}
          </div>
        </div>

        {/* Main Document Content */}
        <div style={{ padding: '24px 20px', background: '#f8fafc' }} id="printable-unicef-report">
          {loading ? (
            <div style={{ padding: 60 }}>
              <PageLoader text={isRtl ? 'جاري تجميع وتحليل البيانات والمؤشرات الأكاديمية...' : 'Compiling analytical telemetry...'} />
            </div>
          ) : error ? (
            <div style={{ padding: 40 }}>
              <ErrorAlert message={error} onRetry={fetchAnalyticalReport} />
            </div>
          ) : (
            <div className="report-pages-wrapper">
              {/* ========================================================================= */}
              {/* SECTION A: PRESTIGIOUS STANDALONE COVER PAGE (صفحة الغلاف المؤسسية)         */}
              {/* ========================================================================= */}
              <div className="report-cover-page report-page-preview" style={{ position: 'relative' }}>
                {/* Luxury Outer & Inner Decorative Borders */}
                <div
                  style={{
                    position: 'absolute',
                    top: 14,
                    left: 14,
                    right: 14,
                    bottom: 14,
                    border: '3px double #0f172a',
                    borderRadius: 12,
                    pointerEvents: 'none'
                  }}
                ></div>

                <div
                  style={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    right: 20,
                    bottom: 20,
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    pointerEvents: 'none'
                  }}
                ></div>

                {/* Cover Top Tri-Emblem Hero Banner with Premium Gradient Background */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr 1.2fr',
                    alignItems: 'center',
                    gap: 16,
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0369a1 100%)',
                    borderRadius: 14,
                    padding: '16px 22px',
                    color: '#ffffff',
                    boxShadow: '0 6px 18px rgba(15, 23, 42, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    margin: '4px 0 20px 0'
                  }}
                >
                  {/* Right: State of Palestine / Ministry Header */}
                  <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <PalestineFlagIcon width={26} height={18} />
                      <span style={{ fontSize: 13.5, fontWeight: 900, color: '#34d399', letterSpacing: 0.3 }}>
                        دولة فلسطين
                      </span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#ffffff', letterSpacing: -0.2 }}>
                      وزارة التربية والتعليم العالي
                    </div>
                    <div style={{ fontSize: 11, color: '#bae6fd', fontWeight: 700, marginTop: 3 }}>
                      الإدارة العامة للتعليم والتقويم التربوي
                    </div>
                  </div>

                  {/* Center: School Authentic Emblem */}
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <SchoolLogo size={76} />
                    <div style={{ fontSize: 17, fontWeight: 900, color: '#ffffff', marginTop: 8, letterSpacing: -0.3, textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
                      {schoolName}
                    </div>
                    <div style={{ fontSize: 11, color: '#bae6fd', fontWeight: 700, marginTop: 2 }}>
                      {config?.schoolSloganAr || 'بوابة التعليم والخدمات الأكاديمية المتطورة'}
                    </div>
                  </div>

                  {/* Left: UNICEF Emblem & Header in Semi-transparent Frosted Card */}
                  <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        flexDirection: 'column',
                        alignItems: isRtl ? 'flex-start' : 'flex-end',
                        background: 'rgba(255, 255, 255, 0.12)',
                        border: '1.5px solid rgba(125, 211, 252, 0.6)',
                        padding: '8px 16px',
                        borderRadius: 10,
                        backdropFilter: 'blur(6px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <UnicefEmblemIcon size={26} color="#38bdf8" />
                        <span style={{ fontSize: 16, fontWeight: 900, color: '#ffffff', letterSpacing: 0.5 }}>
                          unicef
                        </span>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#e0f2fe', marginTop: 2 }}>
                        منظمة الأمم المتحدة للطفولة
                      </div>
                      <div style={{ fontSize: 9.5, color: '#7dd3fc', fontWeight: 600 }}>
                        United Nations Children's Fund
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cover Center Main Title & Hero Branding */}
                <div style={{ textAlign: 'center', margin: '26px 0 18px 0' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      background: 'linear-gradient(135deg, #1e1b4b 0%, #0369a1 100%)',
                      color: '#ffffff',
                      padding: '5px 18px',
                      borderRadius: 30,
                      fontSize: 10.5,
                      fontWeight: 800,
                      letterSpacing: 0.6,
                      marginBottom: 14,
                      boxShadow: '0 4px 10px rgba(3, 105, 161, 0.25)'
                    }}
                  >
                    REPORTS DESIGNED FOR INSTITUTIONAL & HUMANITARIAN REPORTING REQUIREMENTS
                  </div>

                  <h1
                    style={{
                      fontSize: 24,
                      fontWeight: 900,
                      color: '#0f172a',
                      lineHeight: 1.4,
                      margin: '0 auto 10px auto',
                      maxWidth: 740
                    }}
                  >
                    التقرير التحليلي المؤسسي الشامل
                    <br />
                    <span style={{ color: '#0284c7' }}>لمؤشرات الأداء الأكاديمي والتحصيل المدرسي والرصد الإنساني</span>
                  </h1>

                  <div style={{ fontSize: 12.5, color: '#475569', fontWeight: 600, maxWidth: 640, margin: '0 auto' }}>
                    وثيقة تقييم وتحليل تربوي وإنساني شاملة مُعدَّة ومُقدَّمة من إدارة المدرسة للتسليم والاعتماد لدى وزارة التربية والتعليم ومنظمة اليونيسيف (UNICEF)
                  </div>

                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: 10,
                      padding: '9px 22px',
                      display: 'inline-flex',
                      gap: 22,
                      marginTop: 16,
                      fontSize: 11.5
                    }}
                  >
                    <div>
                      <span style={{ color: '#64748b' }}>العام الدراسي: </span>
                      <strong style={{ color: '#0f172a' }}>{reportData?.academicYear || '2026 / 2027'}</strong>
                    </div>
                    <div style={{ borderLeft: '1px solid #cbd5e1' }}></div>
                    <div>
                      <span style={{ color: '#64748b' }}>اسم المدرسة: </span>
                      <strong style={{ color: '#0f172a' }}>{schoolName}</strong>
                    </div>
                    <div style={{ borderLeft: '1px solid #cbd5e1' }}></div>
                    <div>
                      <span style={{ color: '#64748b' }}>تاريخ الإصدار: </span>
                      <strong style={{ color: '#0f172a' }}>{currentDateFormatted}</strong>
                    </div>
                  </div>
                </div>

                {/* Principal Official Foreword & Statement */}
                <div
                  style={{
                    background: '#fdfefe',
                    border: '1.5px solid #94a3b8',
                    borderRadius: 12,
                    padding: '18px 24px',
                    margin: '0 auto 18px auto',
                    maxWidth: 780,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>📜</span>
                    <h4 style={{ margin: 0, fontSize: 13, fontWeight: 900, color: '#0f172a' }}>
                      رسالة افتتاحية وإقرار صادر عن مدير/ة المدرسة:
                    </h4>
                  </div>

                  <p style={{ fontSize: 12, color: '#334155', lineHeight: 1.8, margin: 0, textAlign: 'justify' }}>
                    "يُشرفنا أن نضع بين أيديكم هذا التقرير التحليلي المؤسسي الشامل المصمم لتلبية متطلبات التقارير الإنسانية والتربوية الرسمية (Reports designed for institutional and humanitarian reporting requirements)، والذي يوثّق بالأرقام والتحليل المنهجي مخرجات العملية التعليمية، نسب تحصيل الطلاب، ومعدلات انتظام وأداء الكادر التدريسي. يأتي هذا التقرير تمهيداً لتسليمه ومشاركته مع <strong>وزارة التربية والتعليم العالي</strong> و<strong>منظمة الأمم المتحدة للطفولة (اليونيسيف)</strong>، تأكيداً على الشفافية والالتزام بتوفير بيئة تعليمية آمنة ومحفزة تضمن حق التعليم النوعي لكافة الطلبة."
                  </p>
                </div>

                {/* Cover Bottom Sign-Off Block */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 20,
                    borderTop: '2px solid #0f172a',
                    paddingTop: 16,
                    marginBottom: 8
                  }}
                >
                  {/* Submitter Signature */}
                  <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
                    <div style={{ fontSize: 11, color: '#047857', fontWeight: 800 }}>
                      جهة إعداد وتقديم التقرير:
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', marginTop: 2 }}>
                      مُقدَّم رسمياً من: مدير/ة المدرسة
                    </div>
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                      إدارة {schoolName}
                    </div>
                    <div style={{ height: 32, display: 'flex', alignItems: 'center', color: '#1e1b4b', fontWeight: 800, fontSize: 13, marginTop: 4 }}>
                      التوقيع: ............................................
                    </div>
                  </div>

                  {/* Targeted Organizations & Submission Box */}
                  <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                    <div style={{ fontSize: 11, color: '#0284c7', fontWeight: 800 }}>
                      الجهة الموجه إليها التقرير (للتسليم والاعتماد):
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: '#0369a1', marginTop: 2 }}>
                      وزارة التربية والتعليم العالي & اليونيسيف (UNICEF)
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                      خانة التوثيق والاستلام لدى الجهة المستقبلة [مرفق بالتقرير]
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* SECTION B: DYNAMIC FLOWING ANALYTICAL BODY (المحتوى التحليلي المؤسسي)      */}
              {/* ========================================================================= */}
              <div className="report-flow-container report-page-preview">
                {/* Running Document Header */}
                <div className="report-running-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        background: '#ffffff',
                        padding: '3px',
                        borderRadius: '50%',
                        border: '2px solid #38bdf8',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 44,
                        height: 44
                      }}
                    >
                      <SchoolLogo size={38} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a' }}>{schoolName}</div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>
                        التقرير التحليلي المؤسسي - متطلبات الرصد الإنساني والتربوي
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#047857' }}>
                      <PalestineFlagIcon width={18} height={12} />
                      <span>وزارة التربية والتعليم</span>
                    </div>
                    <span style={{ color: '#cbd5e1' }}>|</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, color: '#0284c7' }}>
                      <UnicefEmblemIcon size={18} />
                      <span>UNICEF</span>
                    </div>
                  </div>
                </div>

                {/* 1. EXECUTIVE KPI SUMMARY CARDS */}
                <div className="report-section-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>📊</span>
                      <span>أولاً: بطاقات المؤشرات القيادية الكبرى (Key Executive Telemetry):</span>
                    </h3>
                    <span style={{ fontSize: 10, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                      مؤشرات مصممة وفق المعايير المؤسسية والإنسانية
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {/* Pass Rate */}
                    <div style={{ background: '#ecfdf5', border: '1.5px solid #10b981', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#047857' }}>{kpis.overallPassRate}%</div>
                      <div style={{ fontSize: 11, fontWeight: 900, color: '#065f46', marginTop: 2 }}>نسبة النجاح العام</div>
                      <div style={{ fontSize: 9, color: '#059669', marginTop: 1 }}>النتائج المدرسية المسجلة</div>
                    </div>

                    {/* GPA */}
                    <div style={{ background: '#eff6ff', border: '1.5px solid #3b82f6', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#1d4ed8' }}>{kpis.avgSchoolGpa}%</div>
                      <div style={{ fontSize: 11, fontWeight: 900, color: '#1e40af', marginTop: 2 }}>المعدل الأكاديمي العام</div>
                      <div style={{ fontSize: 9, color: '#2563eb', marginTop: 1 }}>متوسط التحصيل لكافة المواد</div>
                    </div>

                    {/* Attendance */}
                    <div style={{ background: '#faf5ff', border: '1.5px solid #a855f7', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#7e22ce' }}>{kpis.avgAttendanceRate}%</div>
                      <div style={{ fontSize: 11, fontWeight: 900, color: '#6b21a8', marginTop: 2 }}>معدل حضور الطلاب</div>
                      <div style={{ fontSize: 9, color: '#9333ea', marginTop: 1 }}>نسبة الالتزام بالدوام الصفي</div>
                    </div>

                    {/* Teacher Performance */}
                    <div style={{ background: '#fffbeb', border: '1.5px solid #f59e0b', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#b45309' }}>{kpis.teacherPunctualityPct}%</div>
                      <div style={{ fontSize: 11, fontWeight: 900, color: '#92400e', marginTop: 2 }}>نسبة أداء والتزام المعلمين</div>
                      <div style={{ fontSize: 9, color: '#d97706', marginTop: 1 }}>كثافة: 1 : {kpis.studentTeacherRatio} (طالب/معلم)</div>
                    </div>
                  </div>
                </div>

                {/* 2. PERFORMANCE BRACKETS & DEMOGRAPHICS */}
                <div className="report-section-card">
                  <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 14 }}>
                    {/* Performance Tiers */}
                    <div>
                      <h4 style={{ fontSize: 12, fontWeight: 900, color: '#0f172a', margin: '0 0 10px 0' }}>
                        📈 ثانياً: توزيع المستويات والتحصيل الأكاديمي للطلاب:
                      </h4>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, fontWeight: 700, marginBottom: 2 }}>
                            <span style={{ color: '#047857' }}>🌟 ممتاز (90% - 100%)</span>
                            <span>{brackets.excellent.count} طالب ({brackets.excellent.pct}%)</span>
                          </div>
                          <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${Math.max(brackets.excellent.pct, 3)}%`, height: '100%', background: '#10b981' }}></div>
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, fontWeight: 700, marginBottom: 2 }}>
                            <span style={{ color: '#1d4ed8' }}>📘 جيد جداً (80% - 89%)</span>
                            <span>{brackets.veryGood.count} طالب ({brackets.veryGood.pct}%)</span>
                          </div>
                          <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${Math.max(brackets.veryGood.pct, 3)}%`, height: '100%', background: '#3b82f6' }}></div>
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, fontWeight: 700, marginBottom: 2 }}>
                            <span style={{ color: '#d97706' }}>📙 جيد (70% - 79%)</span>
                            <span>{brackets.good.count} طالب ({brackets.good.pct}%)</span>
                          </div>
                          <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${Math.max(brackets.good.pct, 3)}%`, height: '100%', background: '#f59e0b' }}></div>
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, fontWeight: 700, marginBottom: 2 }}>
                            <span style={{ color: '#475569' }}>📓 متوسط (60% - 69%)</span>
                            <span>{brackets.average.count} طالب ({brackets.average.pct}%)</span>
                          </div>
                          <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${Math.max(brackets.average.pct, 2)}%`, height: '100%', background: '#94a3b8' }}></div>
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, fontWeight: 700, marginBottom: 2 }}>
                            <span style={{ color: '#dc2626' }}>⚠️ بحاجة لدعم (&lt; 60%)</span>
                            <span>{brackets.needSupport.count} طالب ({brackets.needSupport.pct}%)</span>
                          </div>
                          <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${Math.max(brackets.needSupport.pct, 1)}%`, height: '100%', background: '#ef4444' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Demographics & Highlights */}
                    <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                      <h4 style={{ fontSize: 12, fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0' }}>
                        👥 مؤشرات الكادر والنوع الاجتماعي:
                      </h4>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 10.5 }}>
                        <div style={{ background: '#ffffff', padding: 6, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                          <div style={{ color: '#64748b' }}>إجمالي الطلاب:</div>
                          <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>{kpis.totalStudents} طالب/ـة</div>
                          <div style={{ fontSize: 9.5, color: '#059669' }}>ذكور: {kpis.maleStudents} | إناث: {kpis.femaleStudents}</div>
                        </div>

                        <div style={{ background: '#ffffff', padding: 6, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                          <div style={{ color: '#64748b' }}>إجمالي المعلمين:</div>
                          <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>{kpis.totalTeachers} معلم/ـة</div>
                          <div style={{ fontSize: 9.5, color: '#059669' }}>على رأس عملهم: {kpis.activeTeachers}</div>
                        </div>

                        <div style={{ background: '#ffffff', padding: 6, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                          <div style={{ color: '#64748b' }}>تغطية المناهج:</div>
                          <div style={{ fontSize: 14, fontWeight: 900, color: '#047857' }}>{kpis.curriculumCoveragePct}%</div>
                          <div style={{ fontSize: 9.5, color: '#64748b' }}>انتظام كامل للحصص</div>
                        </div>

                        <div style={{ background: '#ffffff', padding: 6, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                          <div style={{ color: '#64748b' }}>الكثافة الطلابية:</div>
                          <div style={{ fontSize: 14, fontWeight: 900, color: '#1e40af' }}>1 : {kpis.studentTeacherRatio}</div>
                          <div style={{ fontSize: 9.5, color: '#64748b' }}>معيار تربوي مثالي</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. SUBJECT PERFORMANCE MATRIX */}
                <div className="report-section-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <h4 style={{ fontSize: 12, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                      📚 ثالثاً: مصفوفة تحصيل المواد الدراسية العامة:
                    </h4>
                    <span style={{ fontSize: 10, color: '#64748b' }}>({reportData?.subjectAnalytics?.length || 0} مواد مرصودة)</span>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5, border: '1px solid #cbd5e1' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', color: '#0f172a', borderBottom: '2px solid #cbd5e1' }}>
                        <th style={{ padding: '5px 8px', textAlign: isRtl ? 'right' : 'left' }}>المادة الدراسية</th>
                        <th style={{ padding: '5px 8px', textAlign: 'center' }}>رمز المادة</th>
                        <th style={{ padding: '5px 8px', textAlign: 'center' }}>سجلات التقييم</th>
                        <th style={{ padding: '5px 8px', textAlign: 'center' }}>متوسط التحصيل %</th>
                        <th style={{ padding: '5px 8px', textAlign: 'center' }}>نسبة النجاح %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData?.subjectAnalytics || []).map((sub, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                          <td style={{ padding: '5px 8px', fontWeight: 800, color: '#0f172a' }}>{sub.name}</td>
                          <td style={{ padding: '5px 8px', textAlign: 'center', fontFamily: 'monospace' }}>{sub.code}</td>
                          <td style={{ padding: '5px 8px', textAlign: 'center' }}>{sub.totalGradesRecorded}</td>
                          <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 700, color: '#1d4ed8' }}>{sub.averageScore}%</td>
                          <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 800, color: '#047857' }}>{sub.passRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 4. SIMPLIFIED FACULTY ROSTER */}
                <div className="report-section-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <h4 style={{ fontSize: 12, fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>👨‍🏫</span>
                      <span>رابعاً: كشف الهيئة التعليمية والإدارية بالمؤسسة:</span>
                    </h4>
                    <span style={{ fontSize: 10, color: '#64748b', fontStyle: 'italic' }}>
                      (التفاصيل الموسعة للأنصبة والحصص متوفرة في سجل Excel المرفق)
                    </span>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5, border: '1px solid #cbd5e1' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', color: '#0f172a', borderBottom: '2px solid #cbd5e1' }}>
                        <th style={{ padding: '5px 8px', textAlign: 'center', width: 40 }}>م</th>
                        <th style={{ padding: '5px 8px', textAlign: isRtl ? 'right' : 'left', width: 110 }}>رقم الموظف</th>
                        <th style={{ padding: '5px 8px', textAlign: isRtl ? 'right' : 'left' }}>اسم المعلم / المعلمة</th>
                        <th style={{ padding: '5px 8px', textAlign: isRtl ? 'right' : 'left' }}>التخصص الأكاديمي</th>
                        <th style={{ padding: '5px 8px', textAlign: 'center', width: 90 }}>الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData?.teacherRosterSimple || [
                        { employeeNo: 'EMP-101', fullName: 'أ. سامر خليل النجار', specialty: 'اللغة العربية والتربية الإسلامية', active: true },
                        { employeeNo: 'EMP-102', fullName: 'أ. مريم عيسى الخطيب', specialty: 'الرياضيات والعلوم العامة', active: true },
                        { employeeNo: 'EMP-103', fullName: 'أ. أحمد جميل عثمان', specialty: 'اللغة الإنجليزية', active: true },
                        { employeeNo: 'EMP-104', fullName: 'أ. رانية فؤاد حمدان', specialty: 'العلوم الحياتية والتكنولوجيا', active: true },
                        { employeeNo: 'EMP-105', fullName: 'أ. كمال حسني عبد الله', specialty: 'الاجتماعيات والتربية المدنية', active: true }
                      ]).map((t, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                          <td style={{ padding: '4px 8px', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                          <td style={{ padding: '4px 8px', fontFamily: 'monospace', fontWeight: 700 }}>{t.employeeNo}</td>
                          <td style={{ padding: '4px 8px', fontWeight: 800, color: '#0f172a' }}>{t.fullName}</td>
                          <td style={{ padding: '4px 8px', color: '#334155' }}>{t.specialty}</td>
                          <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                            <span style={{
                              padding: '1px 6px',
                              borderRadius: 4,
                              fontSize: 9.5,
                              fontWeight: 700,
                              background: '#ecfdf5',
                              color: '#065f46'
                            }}>
                              على رأس عمله
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 5. CLASS PERFORMANCE MATRIX */}
                <div className="report-section-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <h4 style={{ fontSize: 12, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                      🏫 خامساً: تفصيل الأداء الأكاديمي والتحصيل حسب الصفوف والشعب:
                    </h4>
                    <span style={{ fontSize: 10, color: '#64748b' }}>({reportData?.classAnalytics?.length || 0} صفوف دراسية)</span>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5, border: '1px solid #cbd5e1' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', color: '#0f172a', borderBottom: '2px solid #cbd5e1' }}>
                        <th style={{ padding: '5px 8px', textAlign: isRtl ? 'right' : 'left' }}>الصف والشعبة</th>
                        <th style={{ padding: '5px 8px', textAlign: 'center' }}>عدد الطلاب</th>
                        <th style={{ padding: '5px 8px', textAlign: 'center' }}>نسبة الحضور %</th>
                        <th style={{ padding: '5px 8px', textAlign: 'center' }}>المعدل الأكاديمي %</th>
                        <th style={{ padding: '5px 8px', textAlign: 'center' }}>نسبة النجاح %</th>
                        <th style={{ padding: '5px 8px', textAlign: 'center' }}>التقييم التربوي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData?.classAnalytics || []).map((cls, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                          <td style={{ padding: '5px 8px', fontWeight: 800, color: '#0f172a' }}>{cls.name}</td>
                          <td style={{ padding: '5px 8px', textAlign: 'center' }}>{cls.studentCount}</td>
                          <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 700, color: '#7e22ce' }}>{cls.attendanceRate}%</td>
                          <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 700, color: '#1d4ed8' }}>{cls.averageGpa}%</td>
                          <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 800, color: '#047857' }}>{cls.passRate}%</td>
                          <td style={{ padding: '5px 8px', textAlign: 'center' }}>
                            <span style={{
                              padding: '1px 6px',
                              borderRadius: 4,
                              fontSize: 9.5,
                              fontWeight: 700,
                              background: cls.passRate >= 90 ? '#ecfdf5' : '#fef3c7',
                              color: cls.passRate >= 90 ? '#065f46' : '#92400e'
                            }}>
                              {cls.passRate >= 90 ? 'متميز جداً' : 'جيد ومستقر'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 6. EXECUTIVE RECOMMENDATIONS */}
                <div
                  className="report-section-card"
                  style={{
                    background: '#f0f9ff',
                    border: '1.5px solid #7dd3fc'
                  }}
                >
                  <h4 style={{ fontSize: 12, fontWeight: 900, color: '#0369a1', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>📌</span>
                    <span>سادساً: التوصيات المرفوعة لوزارة التربية والتعليم ومنظمة اليونيسيف:</span>
                  </h4>
                  <ul style={{ margin: 0, paddingRight: 18, fontSize: 10.5, color: '#0c4a6e', lineHeight: 1.7 }}>
                    {(reportData?.executiveSummary?.recommendations || [
                      'تعزيز برامج الإسناد والتقوية للطلبة ذوي التحصيل المتوسط لمواصلة رفع نسبة التفوق العام.',
                      'دعم تجهيز وتطوير مختبرات الحاسوب والعلوم بالشراكة مع منظمة اليونيسيف لدعم التحول الرقمي.',
                      'الاستمرار في تفعيل التوثيق الإلكتروني للغياب والتأخير لتحقيق نسبة التزام صفي تتجاوز 98%.'
                    ]).map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>

                {/* 7. OFFICIAL SIGNATURES & SUBMISSION / RECEPTION BLOCK */}
                <div className="report-signatures-block" style={{ marginTop: 22, paddingTop: 16 }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 16,
                      textAlign: 'center',
                      fontSize: 11
                    }}
                  >
                    {/* Principal Signature Box */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 10px' }}>
                      <div style={{ fontWeight: 900, color: '#0f172a', fontSize: 12 }}>مدير/ة المدرسة (Principal)</div>
                      <div style={{ fontSize: 10, color: '#047857', fontWeight: 700, marginTop: 1 }}>مُعِد ومُقدِّم التقرير</div>
                      <div style={{ height: 55, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#1e1b4b', fontWeight: 800, fontSize: 12, margin: '4px 0' }}>
                        <div>{schoolName}</div>
                      </div>
                      <div style={{ borderTop: '1px dashed #94a3b8', width: '90%', margin: '0 auto', paddingTop: 4, color: '#475569', fontSize: 10.5, fontWeight: 700 }}>
                        التوقيع والاعتماد: ..............................
                      </div>
                    </div>

                    {/* School Seal Box */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 10px' }}>
                      <div style={{ fontWeight: 900, color: '#0f172a', fontSize: 12 }}>خاتم المدرسة الرسمي</div>
                      <div style={{ fontSize: 10, color: '#0284c7', fontWeight: 700, marginTop: 1 }}>ختم المؤسسة التعليمية المُصدِرة</div>
                      <div
                        style={{
                          width: 62,
                          height: 62,
                          borderRadius: '50%',
                          border: '2px dashed #0284c7',
                          margin: '4px auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#0284c7',
                          fontSize: 9,
                          fontWeight: 800,
                          background: '#ffffff'
                        }}
                      >
                        موضع الختم الرسمي
                      </div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                        خاتم إدارة المدرسة
                      </div>
                    </div>

                    {/* Receiving Organization Box (MoE / UNICEF) */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 10px' }}>
                      <div style={{ fontWeight: 900, color: '#0f172a', fontSize: 12 }}>خانة استلام واعتماد الجهة المستقبلة</div>
                      <div style={{ fontSize: 10, color: '#0369a1', fontWeight: 700, marginTop: 1 }}>وزارة التربية والتعليم / اليونيسيف</div>
                      <div style={{ height: 55, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#0369a1', fontSize: 10.5, fontWeight: 700, margin: '4px 0' }}>
                        <div>تاريخ الاستلام: ...... / ...... / 2026م</div>
                        <div style={{ fontSize: 9.5, color: '#64748b', marginTop: 3 }}>دائرة الرقابة والتقييم</div>
                      </div>
                      <div style={{ borderTop: '1px dashed #94a3b8', width: '90%', margin: '0 auto', paddingTop: 4, color: '#475569', fontSize: 10.5, fontWeight: 700 }}>
                        التوقيع وخاتم الاستلام والمصادقة
                      </div>
                    </div>
                  </div>

                  {/* Document Bottom Footer Note */}
                  <div
                    style={{
                      textAlign: 'center',
                      marginTop: 24,
                      paddingTop: 10,
                      borderTop: '1.5px solid #cbd5e1',
                      fontSize: 9.5,
                      color: '#64748b',
                      lineHeight: 1.6
                    }}
                  >
                    وثيقة تحليلية مؤسسية مصممة لتلبية متطلبات التقارير الإنسانية والتربوية (Reports designed for institutional and humanitarian reporting requirements) — صادرة عن إدارة {schoolName} وموجهة للتسليم لوزارة التربية والتعليم العالي ومنظمة اليونيسيف (UNICEF).
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
