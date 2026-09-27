import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import SchoolLogo from '../../components/common/SchoolLogo';
import { PalestineFlagIcon, SearchIcon, DownloadIcon } from '../../components/common/Icons';

export default function ParentInquiryPortal({ onExitToSchool, onNavigateToFees }) {
  const { isRtl } = useLanguage();
  const toast = useToast();

  const [studentIdentifier, setStudentIdentifier] = useState('');
  const [searching, setSearching] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'grades' | 'attendance'

  // Pre-fill from query parameter if provided (e.g. ?id=STD-1001)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('studentId') || params.get('id') || params.get('std');
    if (idFromUrl) {
      setStudentIdentifier(idFromUrl);
      executeSearch(idFromUrl);
    }
  }, []);

  const executeSearch = async (queryId) => {
    const cleanId = (queryId || studentIdentifier).trim();
    if (!cleanId) {
      setSearchError(isRtl ? 'يرجى إدخال المعرف الشخصي للطالب للبحث.' : 'Please enter student ID.');
      return;
    }

    setSearching(true);
    setSearchError('');
    setStudentData(null);

    try {
      const res = await api.get(`/students/public/inquiry?identifier=${encodeURIComponent(cleanId)}`);
      if (res && res.id) {
        setStudentData(res);
        toast.success(isRtl ? `تم استرجاع بيانات الطالب: ${res.fullName}` : `Student record found: ${res.fullName}`);
      } else {
        setSearchError(isRtl ? 'لم يتم العثور على طالب مطابق لهذا المعرف. يرجى التأكد من الرقم والمحاولة مرة أخرى.' : 'No student found with this identifier.');
      }
    } catch (err) {
      const msg = err.message || (isRtl ? 'لم يتم العثور على سجل مطابق للمعرف المدخل.' : 'No matching record found.');
      setSearchError(msg);
      toast.error(msg);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    executeSearch();
  };

  const handlePrintStatement = () => {
    window.print();
  };

  const getRatingBadge = (percentage) => {
    if (percentage === null || percentage === undefined) {
      return { text: isRtl ? 'قيد التقييم' : 'Pending', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' };
    }
    if (percentage >= 90) return { text: isRtl ? 'ممتاز' : 'Excellent', color: '#059669', bg: 'rgba(16, 185, 129, 0.12)' };
    if (percentage >= 80) return { text: isRtl ? 'جيد جداً' : 'Very Good', color: '#0284c7', bg: 'rgba(14, 165, 233, 0.12)' };
    if (percentage >= 65) return { text: isRtl ? 'جيد' : 'Good', color: '#d97706', bg: 'rgba(245, 158, 11, 0.12)' };
    if (percentage >= 50) return { text: isRtl ? 'مقبول' : 'Pass', color: '#ea580c', bg: 'rgba(234, 88, 12, 0.12)' };
    return { text: isRtl ? 'بحاجة لمعالجة' : 'Needs Support', color: '#dc2626', bg: 'rgba(239, 68, 68, 0.12)' };
  };

  return (
    <div className="parent-inquiry-root" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Dynamic Inline CSS for Portal Aesthetics */}
      <style>{`
        .parent-inquiry-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #090d16 0%, #0f172a 45%, #131d38 100%);
          color: #f1f5f9;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          position: relative;
          overflow-x: hidden;
          padding-bottom: 60px;
        }

        .portal-ambient-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
        }
        .glow-1 {
          width: 500px;
          height: 500px;
          background: rgba(79, 70, 229, 0.18);
          top: -100px;
          right: -100px;
        }
        .glow-2 {
          width: 450px;
          height: 450px;
          background: rgba(14, 165, 233, 0.15);
          top: 30%;
          left: -150px;
        }
        .glow-3 {
          width: 600px;
          height: 600px;
          background: rgba(16, 185, 129, 0.12);
          bottom: -150px;
          right: 20%;
        }

        .portal-nav-bar {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 32px;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .portal-container {
          position: relative;
          z-index: 10;
          max-width: 980px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .wavy-hero-section {
          text-align: center;
          margin-bottom: 36px;
        }

        .hero-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 6px 16px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 700;
          color: #38bdf8;
          margin-bottom: 18px;
          backdrop-filter: blur(8px);
        }

        .hero-title {
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 900;
          letter-spacing: -0.5px;
          line-height: 1.25;
          margin-bottom: 14px;
          background: linear-gradient(135deg, #ffffff 30%, #cbd5e1 70%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: clamp(14px, 2vw, 16.5px);
          color: #94a3b8;
          max-width: 620px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .search-glass-card {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.12);
          margin-bottom: 32px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .search-input-wrap {
          display: flex;
          gap: 12px;
          align-items: center;
          background: rgba(15, 23, 42, 0.85);
          border: 2px solid rgba(99, 102, 241, 0.35);
          border-radius: 16px;
          padding: 8px 14px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .search-input-wrap:focus-within {
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.25);
        }

        .search-input-field {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          padding: 8px 6px;
        }
        .search-input-field::placeholder {
          color: #64748b;
          font-weight: 500;
        }

        .search-submit-btn {
          background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          padding: 12px 24px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .search-submit-btn:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
        .search-submit-btn:active {
          transform: translateY(0);
        }

        .security-badge-note {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: #94a3b8;
          margin-top: 14px;
          padding: 8px 12px;
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .student-result-card {
          background: rgba(30, 41, 59, 0.75);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.35s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .student-header-gradient {
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.25) 0%, rgba(14, 165, 233, 0.2) 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 28px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }

        .student-avatar {
          width: 74px;
          height: 74px;
          border-radius: 22px;
          background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 900;
          color: #ffffff;
          box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .kpi-metric-box {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 14px 20px;
          text-align: center;
          min-width: 140px;
        }

        .tab-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 700;
          padding: 12px 20px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .tab-btn.active {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .data-table th {
          background: rgba(15, 23, 42, 0.5);
          color: #94a3b8;
          font-weight: 700;
          padding: 14px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          text-align: right;
        }
        .data-table td {
          padding: 14px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: #e2e8f0;
        }

        .new-student-banner {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(14, 165, 233, 0.12) 100%);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 18px;
          padding: 24px;
          text-align: center;
          margin: 16px 0;
        }

        @media print {
          .no-print { display: none !important; }
          .parent-inquiry-root { background: #fff !important; color: #000 !important; padding: 0 !important; }
          .student-result-card { box-shadow: none !important; border: 1px solid #ccc !important; }
          .data-table td, .data-table th { color: #000 !important; border-bottom: 1px solid #ddd !important; }
          .student-header-gradient { background: #f8fafc !important; border-bottom: 2px solid #000 !important; }
          .hero-title, .hero-subtitle { color: #000 !important; }
        }
      `}</style>

      {/* Decorative Atmospheric Glows */}
      <div className="portal-ambient-glow glow-1 no-print" />
      <div className="portal-ambient-glow glow-2 no-print" />
      <div className="portal-ambient-glow glow-3 no-print" />

      {/* Top Header Navigation */}
      <header className="portal-nav-bar no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <SchoolLogo height={44} />
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
              {isRtl ? 'بوابة أولياء الأمور الذكية' : 'Smart Parent Portal'}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
              <PalestineFlagIcon style={{ width: 14, height: 10 }} />
              <span>{isRtl ? 'وزارة التربية والتعليم — دولة فلسطين' : 'Ministry of Education — State of Palestine'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {onNavigateToFees && (
            <button
              onClick={onNavigateToFees}
              className="btn btn-secondary btn-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '8px 14px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '12.5px',
                cursor: 'pointer'
              }}
            >
              💳 {isRtl ? 'بوابة سداد الأقساط' : 'Tuition Portal'}
            </button>
          )}

          <button
            onClick={onExitToSchool}
            className="btn btn-primary btn-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '8px 14px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '12.5px',
              cursor: 'pointer'
            }}
          >
            {isRtl ? '← دخول الكادر التعليمي' : '← Staff Login'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="portal-container">
        {/* Wavy Hero Title */}
        <section className="wavy-hero-section no-print">
          <div className="hero-badge-pill">
            <span>✨</span>
            <span>{isRtl ? 'استعلام مباشر ومحمي لولي الأمر' : 'Direct & Protected Parent Inquiry'}</span>
          </div>
          <h1 className="hero-title">
            {isRtl ? 'استعلام ومتابعة السجل الأكاديمي للطالب' : 'Track Your Child Academic Progress'}
          </h1>
          <p className="hero-subtitle">
            {isRtl
              ? 'متابعة شاملة وفورية لعلامات المواد، كشف الدرجات، سجل الحضور والغياب، وحالة القيد الأكاديمي الرسمية.'
              : 'Real-time inspection of subjects grades, cumulative performance, attendance log, and official enrollment standing.'}
          </p>
        </section>

        {/* Search Card - Single Identifier */}
        <div className="search-glass-card no-print">
          <form onSubmit={handleSearchSubmit}>
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '14.5px', fontWeight: 700, color: '#f8fafc' }}>
                🔍 {isRtl ? 'أدخل المعرف الشخصي للطالب (رقم القيد أو الهوية):' : 'Enter Student Personal Identifier:'}
              </label>
              <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600 }}>
                {isRtl ? 'وسيلة بحث آمنة وموحدة' : 'Single Secure Key'}
              </span>
            </div>

            <div className="search-input-wrap">
              <span style={{ color: '#6366f1', fontSize: 18 }}>#</span>
              <input
                type="text"
                className="search-input-field"
                placeholder={isRtl ? 'مثال: STD-1001 أو رقم هوية الطالب...' : 'e.g. STD-1001 or National ID...'}
                value={studentIdentifier}
                onChange={(e) => setStudentIdentifier(e.target.value)}
                autoFocus
              />
              <button type="submit" className="search-submit-btn" disabled={searching}>
                {searching ? (
                  <span>⏳ {isRtl ? 'جاري الاستعلام...' : 'Searching...'}</span>
                ) : (
                  <>
                    <SearchIcon style={{ width: 16, height: 16 }} />
                    <span>{isRtl ? 'استعلام الآن' : 'Inquire Now'}</span>
                  </>
                )}
              </button>
            </div>

            <div className="security-badge-note">
              <span>🔒</span>
              <span>
                {isRtl
                  ? 'لحماية خصوصية وسرية بيانات أبنائنا الطلبة، الاستعلام متاح حصرياً عبر المعرف الشخصي الدقيق للطالب، ولا يُسمح بالبحث بالاسم تجنباً لكشف البيانات لغير المعنيين.'
                  : 'To safeguard student confidentiality, inquiries are strictly restricted to the unique personal identifier. General name lookup is disabled.'}
              </span>
            </div>

            {searchError && (
              <div style={{
                marginTop: 14,
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                color: '#f87171',
                fontSize: '13.5px',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span>⚠️</span>
                <span>{searchError}</span>
              </div>
            )}
          </form>
        </div>

        {/* Student Result Card */}
        {studentData && (
          <div className="student-result-card">
            {/* Header info bar */}
            <div className="student-header-gradient">
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <div className="student-avatar">
                  {studentData.firstName?.charAt(0) || '🎓'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                      {studentData.fullName}
                    </h2>
                    <span style={{
                      background: studentData.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                      color: studentData.status === 'ACTIVE' ? '#34d399' : '#818cf8',
                      border: `1px solid ${studentData.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 800
                    }}>
                      {studentData.status === 'ACTIVE'
                        ? (isRtl ? 'طالب نشط / منتظم' : 'Active Enrolled')
                        : (isRtl ? 'خريج متميز' : 'Graduated')}
                    </span>
                  </div>

                  <div style={{ fontSize: '13.5px', color: '#94a3b8', marginTop: 6, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span>🆔 {isRtl ? 'المعرف:' : 'ID:'} <strong style={{ color: '#e2e8f0' }}>{studentData.studentNumber}</strong></span>
                    <span>🏫 {isRtl ? 'الصف الحالي:' : 'Class:'} <strong style={{ color: '#e2e8f0' }}>{studentData.currentClass || (isRtl ? 'قيد التوزيع' : 'Unassigned')}</strong></span>
                    <span>📅 {isRtl ? 'العام الدراسي:' : 'Academic Year:'} <strong style={{ color: '#e2e8f0' }}>{studentData.academicYear || '2026/2027'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="no-print" style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handlePrintStatement}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <DownloadIcon style={{ width: 15, height: 15 }} />
                  <span>{isRtl ? 'طباعة شهادة / إفادة' : 'Print Statement'}</span>
                </button>
              </div>
            </div>

            {/* Quick KPI Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
              padding: '24px 32px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(15, 23, 42, 0.3)'
            }}>
              {/* GPA Box */}
              <div className="kpi-metric-box">
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', display: 'block' }}>
                  {isRtl ? 'المعدل العام التراكمي' : 'CUMULATIVE GPA'}
                </span>
                <div style={{ fontSize: '26px', fontWeight: 900, color: studentData.overallAverage !== null ? '#38bdf8' : '#818cf8', marginTop: 4 }}>
                  {studentData.overallAverage !== null ? `${studentData.overallAverage}%` : (isRtl ? 'قيد الرصد' : 'Pending')}
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: getRatingBadge(studentData.overallAverage).color
                }}>
                  {studentData.overallAverage !== null
                    ? getRatingBadge(studentData.overallAverage).text
                    : (isRtl ? 'طالب جديد - لا توجد اختبارات' : 'New Student - No Exams')}
                </span>
              </div>

              {/* Attendance Box */}
              <div className="kpi-metric-box">
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', display: 'block' }}>
                  {isRtl ? 'نسبة الدوام والحضور' : 'ATTENDANCE RATE'}
                </span>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#34d399', marginTop: 4 }}>
                  {studentData.attendanceSummary?.percentage !== null && studentData.attendanceSummary?.percentage !== undefined
                    ? `${studentData.attendanceSummary.percentage}%`
                    : (isRtl ? 'سجل جديد' : 'New')}
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                  {studentData.attendanceSummary?.totalDays > 0
                    ? `${studentData.attendanceSummary.present} ${isRtl ? 'من' : 'of'} ${studentData.attendanceSummary.totalDays} ${isRtl ? 'يوم' : 'days'}`
                    : (isRtl ? 'لا توجد غيابات مسجلة' : 'No absences recorded')}
                </span>
              </div>

              {/* Status Box */}
              <div className="kpi-metric-box">
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', display: 'block' }}>
                  {isRtl ? 'الموقف الأكاديمي' : 'ACADEMIC STANDING'}
                </span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', marginTop: 8 }}>
                  {studentData.isNewStudent ? (isRtl ? 'طالب مستجد' : 'Newly Enrolled') : (isRtl ? 'منتظم ومسجل' : 'Good Standing')}
                </div>
                <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>
                  {isRtl ? 'معتمد رسمياً' : 'Official Registry'}
                </span>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="no-print" style={{
              display: 'flex',
              gap: 8,
              padding: '16px 32px 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <button
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                📊 {isRtl ? 'كشف المواد والدرجات' : 'Subjects & Grades'}
              </button>
              <button
                className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
                onClick={() => setActiveTab('attendance')}
              >
                📅 {isRtl ? 'سجل المواظبة والدوام' : 'Attendance Log'}
              </button>
            </div>

            {/* Tab Contents */}
            <div style={{ padding: '24px 32px' }}>
              {activeTab === 'overview' && (
                <div>
                  {studentData.isNewStudent || !studentData.subjectSummary || studentData.subjectSummary.length === 0 ? (
                    <div className="new-student-banner">
                      <div style={{ fontSize: 32, marginBottom: 8 }}>✨</div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
                        {isRtl ? 'طالب جديد — السجل الأكاديمي قيد الرصد والإعداد' : 'Newly Enrolled Student — Academic Record Pending'}
                      </h3>
                      <p style={{ fontSize: '13.5px', color: '#94a3b8', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
                        {isRtl
                          ? 'تم قيد الطالب بنجاح في العام الدراسي الحالي. لم يتم عقد ورصد امتحانات أو تقييمات فصلية رسمية بعد. ستظهر النتائج والدرجات هنا تلقائياً فور اعتمادها من الهيئة التدريسية.'
                          : 'The student is actively registered. Formal assessment grades have not been posted yet and will appear automatically once teachers enter the scores.'}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', marginBottom: 14 }}>
                        {isRtl ? 'كشف درجات المواد الأكاديمية:' : 'Subject Evaluations:'}
                      </h4>
                      <div style={{ overflowX: 'auto', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>{isRtl ? 'المادة الدراسية' : 'Subject'}</th>
                              <th>{isRtl ? 'رمز المادة' : 'Code'}</th>
                              <th>{isRtl ? 'نسبة التحصيل' : 'Percentage'}</th>
                              <th>{isRtl ? 'التقدير الأكاديمي' : 'Rating'}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentData.subjectSummary.map((sub, idx) => {
                              const badge = getRatingBadge(sub.averagePercentage);
                              return (
                                <tr key={idx}>
                                  <td>
                                    <strong>{sub.subjectName}</strong>
                                  </td>
                                  <td><code>{sub.subjectCode || 'GEN'}</code></td>
                                  <td>
                                    <strong style={{ color: badge.color, fontSize: '15px' }}>
                                      {sub.averagePercentage}%
                                    </strong>
                                  </td>
                                  <td>
                                    <span style={{
                                      background: badge.bg,
                                      color: badge.color,
                                      padding: '4px 10px',
                                      borderRadius: '6px',
                                      fontWeight: 800,
                                      fontSize: '12px'
                                    }}>
                                      {badge.text}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'attendance' && (
                <div>
                  {studentData.attendanceSummary?.totalDays === 0 ? (
                    <div className="new-student-banner" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🌿</div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#34d399', marginBottom: 8 }}>
                        {isRtl ? 'سجل دوام جديد — دوام منتظم بالكامل' : 'Clean Attendance Record'}
                      </h3>
                      <p style={{ fontSize: '13.5px', color: '#94a3b8', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
                        {isRtl
                          ? 'لا توجد أي حالات غياب أو تأخير مسجلة لهذا الطالب حتى الآن. دوام الطالب سليم ومنتظم.'
                          : 'No absence or tardiness records have been registered for this student. Perfect standing.'}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: 14, borderRadius: 12, textAlign: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399' }}>{isRtl ? 'أيام الحضور' : 'Present'}</span>
                          <div style={{ fontSize: 24, fontWeight: 900, color: '#34d399', marginTop: 4 }}>{studentData.attendanceSummary?.present || 0}</div>
                        </div>
                        <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: 14, borderRadius: 12, textAlign: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#f87171' }}>{isRtl ? 'أيام الغياب' : 'Absent'}</span>
                          <div style={{ fontSize: 24, fontWeight: 900, color: '#f87171', marginTop: 4 }}>{studentData.attendanceSummary?.absent || 0}</div>
                        </div>
                        <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: 14, borderRadius: 12, textAlign: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24' }}>{isRtl ? 'مرات التأخر' : 'Late'}</span>
                          <div style={{ fontSize: 24, fontWeight: 900, color: '#fbbf24', marginTop: 4 }}>{studentData.attendanceSummary?.late || 0}</div>
                        </div>
                        <div style={{ background: 'rgba(14, 165, 233, 0.12)', border: '1px solid rgba(14, 165, 233, 0.25)', padding: 14, borderRadius: 12, textAlign: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8' }}>{isRtl ? 'غياب بعذر' : 'Excused'}</span>
                          <div style={{ fontSize: 24, fontWeight: 900, color: '#38bdf8', marginTop: 4 }}>{studentData.attendanceSummary?.excused || 0}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Official School Statement Footer for Printing */}
            <div style={{
              padding: '24px 32px',
              background: 'rgba(15, 23, 42, 0.5)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#94a3b8'
            }}>
              <div>
                <span>🏫 {isRtl ? 'هذه الوثيقة مستخرجة رسمياً من المنظومة الأكاديمية الموحدة للمدرسة.' : 'Official automated student standing transcript.'}</span>
              </div>
              <div>
                <span>📅 {new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
