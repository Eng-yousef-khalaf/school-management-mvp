import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageLoader } from '../../components/common/Loader';
import { CloseIcon, CheckIcon } from '../../components/common/Icons';

export default function StudentPromotionModal({ isOpen, onClose, onPromotedSuccess, academicYears = [] }) {
  const { isRtl } = useLanguage();
  const toast = useToast();

  const [loadingPreview, setLoadingPreview] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [targetYearName, setTargetYearName] = useState('');
  const [selectedTargetYearId, setSelectedTargetYearId] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadPreview();
    }
  }, [isOpen]);

  const loadPreview = async () => {
    try {
      setLoadingPreview(true);
      const res = await api.get('/academic-years/promote-preview');
      setPreviewData(res);

      if (res?.targetYear) {
        setSelectedTargetYearId(res.targetYear.id);
        setTargetYearName(res.targetYear.name);
      } else {
        // Suggest next academic year name
        const sourceName = res?.sourceYear?.name || '2026/2027';
        const parts = sourceName.split('/');
        if (parts.length === 2 && !isNaN(parseInt(parts[0], 10))) {
          const y1 = parseInt(parts[0], 10) + 1;
          const y2 = parseInt(parts[1], 10) + 1;
          setTargetYearName(`${y1}/${y2}`);
        } else {
          setTargetYearName('2027/2028');
        }
      }
    } catch (err) {
      toast.error(err.message || 'فشل في تحميل معاينة الترفيع الأكاديمي');
    } finally {
      setLoadingPreview(false);
    }
  };

  if (!isOpen) return null;

  const handleExecutePromotion = async () => {
    if (!window.confirm(
      isRtl
        ? 'هل أنت متأكد من ترفيع الطلاب النشطين إلى الصفوف التالية وتخريج طلاب الصف النهائي للعام الدراسي الجديد؟'
        : 'Are you sure you want to promote active students to next grades and graduate final year students?'
    )) {
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        sourceYearId: previewData?.sourceYear?.id,
        targetYearId: selectedTargetYearId ? parseInt(selectedTargetYearId, 10) : undefined,
        targetYearName: targetYearName.trim()
      };

      const result = await api.post('/academic-years/promote-students', payload);
      toast.success(result.message || (isRtl ? 'تم الترفيع الأكاديمي السنوي بنجاح!' : 'Students promoted successfully!'));
      if (onPromotedSuccess) onPromotedSuccess(result);
      onClose();
    } catch (err) {
      toast.error(err.message || 'فشل في تنفيذ الترفيع الأكاديمي');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div className="modal" style={{ maxWidth: 840, width: '92%', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Modal Header */}
        <div className="modal-header" style={{
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(14, 165, 233, 0.15) 100%)',
          borderBottom: '1px solid var(--border-color)',
          padding: '20px 24px'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🎓</span>
              <span>{isRtl ? 'الترفيع والترقية الأكاديمية السنوية للطلاب (نهاية العام)' : 'Year-End Student Academic Promotion & Graduation'}</span>
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--text-muted)' }}>
              {isRtl
                ? 'نقل الطلاب النشطين إلى المرحلة الدراسية التالية بدون شعب مسبقة، وتخريج طلاب الصف الأخير آلياً.'
                : 'Promote active students to next grade levels unassigned to sections, and graduate final year students.'}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} disabled={submitting}>
            <CloseIcon />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {loadingPreview ? (
            <div style={{ padding: '50px 0', textAlign: 'center' }}>
              <PageLoader text={isRtl ? 'جاري فحص وتجهيز بيانات ترفيع الطلاب...' : 'Preparing promotion preview...'} />
            </div>
          ) : (
            <div>
              {/* Instruction banner */}
              <div style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                marginBottom: 20,
                fontSize: '13px',
                color: '#0284c7',
                lineHeight: 1.6
              }}>
                <strong>💡 {isRtl ? 'آلية الترفيع المعتمدة في النظام:' : 'Promotion Mechanism:'}</strong>
                <ul style={{ margin: '6px 0 0', paddingRight: 20, paddingLeft: 20 }}>
                  <li>{isRtl ? 'كل طالب نشط يرتفع تلقائياً إلى الصف التالي (مثلاً: الصف السابع ⭠ الصف الثامن).' : 'Active students automatically advance to the next grade level.'}</li>
                  <li>{isRtl ? 'يتم الترفيع إلى صفوف مجمّعة بدون تقسيم شعب (الشعبة غير محددة) لتجميع الطلاب وتوزيعهم على الشعب لاحقاً من قِبل الإدارة.' : 'Promoted students are enrolled into unified grade cohorts without section division for later distribution.'}</li>
                  <li>{isRtl ? 'طلاب الصف النهائي (الثاني عشر / التوجيهي) يتحولون آلياً إلى حالة "خريج" (Graduated).' : 'Students in final grade (Grade 12) automatically graduate.'}</li>
                </ul>
              </div>

              {/* Year Target Selection */}
              <div style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                marginBottom: 20,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 16
              }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    📅 {isRtl ? 'العام الدراسي الحالي (المنتهي):' : 'Current Source Year:'}
                  </label>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {previewData?.sourceYear?.name || '2026/2027'}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    🚀 {isRtl ? 'العام الدراسي الجديد (المرفّع إليه):' : 'Target Academic Year:'}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={targetYearName}
                    onChange={(e) => setTargetYearName(e.target.value)}
                    placeholder="مثال: 2027/2028"
                    style={{ fontWeight: 800 }}
                  />
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
                <div style={{ background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.25)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--primary)' }}>{isRtl ? 'إجمالي الطلاب' : 'Total Students'}</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary)', marginTop: 4 }}>
                    {previewData?.totalStudents || 0}
                  </div>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#059669' }}>{isRtl ? 'سيتم ترفيعهم' : 'To be Promoted'}</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#059669', marginTop: 4 }}>
                    {previewData?.totalPromotable || 0}
                  </div>
                  <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{isRtl ? 'بدون شعب مسبقة' : 'Unassigned Sections'}</span>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#d97706' }}>{isRtl ? 'خريجون' : 'Graduating'}</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#d97706', marginTop: 4 }}>
                    {previewData?.totalGraduating || 0}
                  </div>
                  <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{isRtl ? 'تحول لحالة خريج' : 'Status: Graduated'}</span>
                </div>
              </div>

              {/* Grade-by-Grade Preview Table */}
              <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 10, color: 'var(--text-main)' }}>
                📋 {isRtl ? 'خطة ترفيع وتسكين الصفوف الدراسية:' : 'Grade Promotion Mapping:'}
              </h4>
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', textAlign: isRtl ? 'right' : 'left' }}>
                      <th style={{ padding: '10px 14px' }}>{isRtl ? 'الصف الحالي' : 'Current Grade'}</th>
                      <th style={{ padding: '10px 14px' }}>{isRtl ? 'المرحلة القادمة' : 'Target Next Stage'}</th>
                      <th style={{ padding: '10px 14px' }}>{isRtl ? 'نوع الإجراء' : 'Action Type'}</th>
                      <th style={{ padding: '10px 14px' }}>{isRtl ? 'عدد الطلاب' : 'Count'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData?.groups?.map((grp, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 14px' }}>
                          <strong>{grp.currentClassName || grp.currentGrade}</strong>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            color: grp.isGraduating ? '#d97706' : '#059669',
                            fontWeight: 800
                          }}>
                            {grp.targetGradeNameAr}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span className={`badge ${grp.isGraduating ? 'badge-warning' : 'badge-success'}`}>
                            {grp.isGraduating ? (isRtl ? 'تخرج رسمي 🎓' : 'Graduation') : (isRtl ? 'ترفيع للصف التالي ⬆️' : 'Promotion')}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <strong>{grp.studentCount}</strong> {isRtl ? 'طالب' : 'students'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Warning note */}
              <div style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                fontSize: '12.5px',
                color: '#dc2626'
              }}>
                ⚠️ <strong>{isRtl ? 'تنبيه أمني للإدارة:' : 'Administrative Notice:'}</strong>{' '}
                {isRtl
                  ? 'هذه العملية جماعية وتؤثر على جميع الطلاب النشطين في العام الحالي، وتُنفذ مرة واحدة عند الانتقال لنهاية العام الدراسي.'
                  : 'This batch operation updates all active students and should be executed once during end-of-year rollover.'}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            {isRtl ? 'إلغاء' : 'Cancel'}
          </button>

          <button
            className="btn btn-primary"
            onClick={handleExecutePromotion}
            disabled={submitting || loadingPreview || (previewData?.totalStudents === 0)}
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #059669 100%)',
              fontWeight: 800,
              padding: '10px 22px'
            }}
          >
            {submitting ? (
              <span>⏳ {isRtl ? 'جاري تنفيذ الترفيع...' : 'Promoting...'}</span>
            ) : (
              <span>🚀 {isRtl ? 'تأكيد واعتماد الترفيع السنوي الشامل' : 'Confirm Year-End Promotion'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
