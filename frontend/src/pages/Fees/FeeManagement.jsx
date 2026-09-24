import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import StatCard from '../../components/common/StatCard';
import RecordPaymentModal from './RecordPaymentModal';
import PaymentReceiptModal from './PaymentReceiptModal';
import ParentPaymentPortalModal from './ParentPaymentPortalModal';
import { PalestineFlagIcon } from '../../components/common/Icons';

export default function FeeManagement() {
  const { isAdmin, isStaff } = useAuth();
  const { t, isRtl } = useLanguage();
  const toast = useToast();

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const [data, setData] = useState({ items: [], summary: null, pagination: null });
  const [alertsData, setAlertsData] = useState({ count: 0, overdueCount: 0, alerts: [] });
  const [pendingNotices, setPendingNotices] = useState([]);
  const [selectedNoticeForReview, setSelectedNoticeForReview] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isParentPortalOpen, setIsParentPortalOpen] = useState(false);
  const [activeStudentForPayment, setActiveStudentForPayment] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [activeStudentForReceipt, setActiveStudentForReceipt] = useState(null);

  const loadClasses = async () => {
    try {
      const cls = await api.get('/classes');
      const list = Array.isArray(cls) ? cls : (cls?.items || []);
      setClasses(list);
    } catch {}
  };

  const loadFeesData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError('');
      const params = new URLSearchParams({
        page: String(page),
        limit: '25'
      });
      if (selectedClassId && selectedClassId !== 'ALL') params.set('classId', selectedClassId);
      if (selectedStatus && selectedStatus !== 'ALL') params.set('status', selectedStatus);
      if (searchTerm) params.set('search', searchTerm);

      const [feesRes, alertsRes, pendingRes] = await Promise.all([
        api.get(`/fees?${params.toString()}`),
        api.get('/fees/alerts').catch(() => ({ count: 0, overdueCount: 0, alerts: [] })),
        api.get('/fees/pending-notices').catch(() => [])
      ]);

      setData(feesRes);
      setAlertsData(alertsRes);
      setPendingNotices(Array.isArray(pendingRes) ? pendingRes : (pendingRes?.items || []));
    } catch (err) {
      if (!silent) setError(err.message || 'Failed to load fee records');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, selectedClassId, selectedStatus, searchTerm]);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    loadFeesData();
  }, [loadFeesData]);

  // Real-time synchronization across tabs and windows
  useEffect(() => {
    const handleSync = () => {
      loadFeesData(true);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadFeesData(true);
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('payment_notice_updated', handleSync);
    document.addEventListener('visibilitychange', handleSync);

    // Auto-poll every 4 seconds for fresh notices
    const intervalId = setInterval(() => {
      loadFeesData(true);
    }, 4000);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('payment_notice_updated', handleSync);
      document.removeEventListener('visibilitychange', handleSync);
      clearInterval(intervalId);
    };
  }, [loadFeesData]);

  const handleOpenRecordPayment = (student = null) => {
    setActiveStudentForPayment(student);
    setIsRecordModalOpen(true);
  };

  const handlePaymentRecorded = (payment, student) => {
    loadFeesData();
    // Open receipt modal immediately
    setActiveReceipt(payment);
    setActiveStudentForReceipt(student);
  };

  const handleOpenStudentReceipts = async (student) => {
    try {
      const res = await api.get(`/fees/student/${student.studentId || student.id}`);
      const latestPayment = res.payments?.[0];
      if (latestPayment) {
        setActiveReceipt(latestPayment);
        setActiveStudentForReceipt(student);
      } else {
        // If no payment yet, open record payment modal
        handleOpenRecordPayment(student);
      }
    } catch (err) {
      handleOpenRecordPayment(student);
    }
  };

  const handleApproveNotice = async (notice) => {
    setApprovingId(notice.id);
    try {
      const res = await api.post(`/fees/payments/${notice.id}/approve`);
      toast.success(isRtl ? `تم اعتماد دفعة الطالب (${notice.studentName}) وإصدار سند قبض رقم ${res.receiptNumber || res.payment?.receiptNumber} بنجاح! 🎉` : 'Payment approved successfully!');
      
      // Refresh fees data
      loadFeesData();
      if (selectedNoticeForReview?.id === notice.id) {
        setSelectedNoticeForReview(null);
      }

      // Directly open receipt modal so staff can print or confirm
      setActiveReceipt(res.payment || { ...notice, status: 'COMPLETED', receiptNumber: res.receiptNumber });
      setActiveStudentForReceipt({
        studentId: notice.studentId,
        studentNumber: notice.studentNumber,
        fullName: notice.studentName,
        className: notice.className,
        parentName: notice.payerName,
        parentPhone: notice.payerPhone
      });
    } catch (err) {
      toast.error(err.message || 'Failed to approve payment notice');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectNotice = async (notice) => {
    const reason = window.prompt(isRtl ? 'يرجى كتابة سبب عدم مطابقة أو رفض الحوالة:' : 'Enter rejection reason:', isRtl ? 'المبلغ أو رقم الحوالة غير متطابق مع الحساب البنكي' : 'Reference mismatch');
    if (reason === null) return; // User cancelled

    setRejectingId(notice.id);
    try {
      await api.post(`/fees/payments/${notice.id}/reject`, { reason });
      toast.info(isRtl ? 'تم رفض إشعار التحويل وتحديث الحالة.' : 'Payment notice rejected');
      loadFeesData();
      if (selectedNoticeForReview?.id === notice.id) {
        setSelectedNoticeForReview(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reject payment notice');
    } finally {
      setRejectingId(null);
    }
  };

  const { items = [], summary } = data;

  const getStatusBadge = (status, balanceDue) => {
    switch (status) {
      case 'PAID':
        return {
          label: isRtl ? '🟢 مسدد بالكامل' : '🟢 Fully Paid',
          bg: '#f0fdf4',
          color: '#166534',
          border: '1px solid #bbf7d0'
        };
      case 'PARTIAL':
        return {
          label: isRtl ? '🟡 مسدد جزئياً' : '🟡 Partial',
          bg: '#fffbeb',
          color: '#b45309',
          border: '1px solid #fde68a'
        };
      case 'OVERDUE':
        return {
          label: isRtl ? '⏰ متأخر عن السداد' : '⏰ Overdue',
          bg: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #fecaca'
        };
      case 'UNPAID':
      default:
        return {
          label: isRtl ? '🔴 غير مسدد' : '🔴 Unpaid',
          bg: '#f8fafc',
          color: '#64748b',
          border: '1px solid #cbd5e1'
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      
      {/* Top Header Banner */}
      <div style={{
        background: isAdmin
          ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
          : 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
        color: '#ffffff',
        padding: '24px 28px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
            <PalestineFlagIcon width={18} height={12} />
            <span>
              {isAdmin
                ? (isRtl ? '👔 وضع الإشراف والرقابة المالية للمدير العام' : '👔 Executive Financial Supervision Mode')
                : (isRtl ? '💼 قسم شؤون الطلاب والتسجيل (الـ Staff: تسجيل المقبوضات والتحصيل)' : '💼 Staff Operations & Cashier Mode')}
            </span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>
            {isAdmin
              ? (isRtl ? 'لوحة الإشراف والرقابة المالية العامة' : 'Executive Financial Oversight & Audit')
              : (isRtl ? 'الرسوم والأقساط وتسجيل المقبوضات' : 'Student Tuition & Cashier Ledger')}
          </h2>
          <p style={{ margin: '6px 0 0', opacity: 0.88, fontSize: 14 }}>
            {isAdmin
              ? (isRtl ? 'نظرة عامة وشاملة على الإيرادات المقررة، نسب التحصيل، تدقيق السندات، وأرصدة الخزينة وحسابات غزة المعتمدة' : 'Supervisory overview of expected revenue, collection rate, audit trail, and school accounts')
              : (isRtl ? 'تسجيل الأقساط والدفعات النقدية والبنكية، متابعة تنبيهات التأخير، وإرسال تذكيرات واتساب' : 'Daily cashier operations, digital receipts, WhatsApp payment reminders, and installment follow-ups')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsParentPortalOpen(true)}
            className="btn"
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)',
              fontWeight: 700,
              padding: '9px 16px'
            }}
          >
            <span>📱</span> {t('parentPaymentPortalBtn')}
          </button>

          {isAdmin ? (
            <button
              type="button"
              onClick={() => api.download('/fees', 'financial-report.csv')}
              className="btn"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.35)',
                fontWeight: 700,
                padding: '9px 16px'
              }}
            >
              <span>📊</span> {isRtl ? 'تصدير التقرير المالي' : 'Export Financial Report'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenRecordPayment(null)}
              className="btn"
              style={{
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                padding: '9px 20px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
              }}
            >
              <span>💰</span> {t('recordPaymentBtn')}
            </button>
          )}
        </div>
      </div>

      {/* Incoming Online Transfer Notices */}
      {pendingNotices.length > 0 && (
        <div style={{
          background: isAdmin ? 'linear-gradient(135deg, #1e1b4b 0%, #2e1065 100%)' : 'linear-gradient(135deg, #082f49 0%, #0c4a6e 100%)',
          border: isAdmin ? '2px solid #818cf8' : '2px solid #38bdf8',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          color: '#ffffff',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: isAdmin ? '#4f46e5' : '#0284c7', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                📬
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span>{isAdmin ? (isRtl ? 'متابعة رقابية: إشعارات التحويل الإلكتروني الواردة' : 'Executive Oversight: Incoming Parent Transfers') : (isRtl ? 'إشعارات وطلبات التحويل الإلكتروني الواردة من أولياء الأمور' : 'Incoming Parent Payment Notices')}</span>
                  <span style={{
                    background: '#ea580c',
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 14,
                    boxShadow: '0 2px 8px rgba(234, 88, 12, 0.4)'
                  }}>
                    {pendingNotices.length} {isRtl ? 'قيد المتابعة' : 'Pending'}
                  </span>
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: isAdmin ? '#c7d2fe' : '#bae6fd' }}>
                  {isAdmin
                    ? (isRtl ? 'متابعة وإشراف عام على الحوالات المرسلة من أولياء الأمور بانتظار مطابقتها واعتمادها من قبل موظف شؤون الطلاب (Staff).' : 'Supervisory log of pending transfer proofs submitted by parents awaiting Staff verification.')
                    : (isRtl ? 'راجع بيانات الحوالة أدناه، ثم انقر على "اعتماد بنقرة واحدة" لتقييد المبلغ في كشف حساب الطالب وتوثيق السند المالي فوراً.' : 'Match transfer ref with bank statement, then click 1-Click Approve to credit student ledger.')}
                </p>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  loadFeesData(false);
                  toast.success(isRtl ? 'تم تحديث الإشعارات الواردة فورياً 🔄' : 'Notices refreshed!');
                }}
                className="btn btn-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  fontWeight: 700,
                  fontSize: 12.5,
                  padding: '7px 14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  borderRadius: 8
                }}
              >
                <span>🔄</span>
                <span>{isRtl ? 'تحديث الإشعارات' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Pending Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
            {pendingNotices.map((notice) => (
              <div
                key={notice.id}
                style={{
                  background: isAdmin ? '#0f0e26' : '#041d30',
                  border: isAdmin ? '1.5px solid #4338ca' : '1.5px solid #0284c7',
                  borderRadius: '14px',
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12,
                  boxShadow: '0 6px 16px rgba(0,0,0,0.3)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 16, color: '#ffffff' }}>
                        {notice.studentName}
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                        <span style={{ color: '#38bdf8', fontWeight: 800 }}>{notice.studentNumber}</span>
                        {' • '}
                        <span>{notice.className}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#34d399' }}>
                        {notice.amount} ₪
                      </div>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: notice.method === 'BANK_OF_PALESTINE' ? '#0369a1' : notice.method === 'JAWWAL_PAY' ? '#c2410c' : '#6d28d9',
                        color: '#ffffff',
                        display: 'inline-block',
                        marginTop: 2
                      }}>
                        {notice.method === 'BANK_OF_PALESTINE' ? 'بنك فلسطين' : notice.method === 'JAWWAL_PAY' ? 'جوال باي' : notice.method === 'PALPAY' ? 'بال باي' : notice.method}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    background: '#040d1a',
                    border: '1px solid #1e293b',
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontSize: 12.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 5,
                    color: '#e0f2fe'
                  }}>
                    <div><strong>{isRtl ? 'المرسل / الدافع:' : 'Payer:'}</strong> {notice.payerName} {notice.payerPhone ? `(${notice.payerPhone})` : ''}</div>
                    <div><strong>{isRtl ? 'رقم الإشعار / العملية:' : 'Ref #:'}</strong> <code style={{ color: '#38bdf8', fontWeight: 900, fontSize: 13.5, background: 'rgba(56,189,248,0.15)', padding: '2px 6px', borderRadius: 4 }}>{notice.transactionRef}</code></div>
                    {notice.notes && <div><strong>{isRtl ? 'ملاحظات ولي الأمر:' : 'Notes:'}</strong> <span style={{ color: '#bae6fd' }}>{notice.notes}</span></div>}
                    <div style={{ fontSize: 11, color: '#7dd3fc', marginTop: 2 }}>🕒 {new Date(notice.createdAt || notice.date).toLocaleString('ar-EG')}</div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: 12, alignItems: 'center' }}>
                  {isAdmin ? (
                    <>
                      <span style={{ fontSize: 11.5, color: '#a5b4fc', fontWeight: 700, flex: 1 }}>
                        ⏳ {isRtl ? 'قيد إجراء موظف شؤون الطلاب (Staff)' : 'Under Staff Review'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedNoticeForReview(notice)}
                        className="btn btn-sm"
                        style={{
                          background: 'rgba(255,255,255,0.15)',
                          color: '#ffffff',
                          border: '1px solid rgba(255,255,255,0.3)',
                          fontWeight: 700,
                          fontSize: 12,
                          padding: '6px 14px'
                        }}
                      >
                        👁️ {isRtl ? 'معاينة وتدقيق الحوالة' : 'Audit Notice'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedNoticeForReview(notice)}
                        className="btn btn-sm"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          color: '#ffffff',
                          border: '1px solid rgba(255,255,255,0.25)',
                          fontWeight: 700,
                          fontSize: 12,
                          padding: '6px 12px',
                          flex: '1 1 auto'
                        }}
                      >
                        👁️ {isRtl ? 'معاينة التفاصيل' : 'Review'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApproveNotice(notice)}
                        disabled={approvingId === notice.id}
                        className="btn btn-sm"
                        style={{
                          background: '#10b981',
                          color: '#ffffff',
                          border: 'none',
                          fontWeight: 900,
                          fontSize: 12.5,
                          padding: '7px 16px',
                          flex: '2 1 auto',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                        }}
                      >
                        {approvingId === notice.id ? (isRtl ? 'جاري الاعتماد...' : 'Approving...') : (isRtl ? '✅ اعتماد بنقرة واحدة' : '✅ 1-Click Approve')}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRejectNotice(notice)}
                        disabled={rejectingId === notice.id}
                        className="btn btn-sm"
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          fontWeight: 700,
                          fontSize: 11.5,
                          padding: '6px 10px'
                        }}
                        title={isRtl ? 'رفض لعدم مطابقة الحوالة' : 'Reject Notice'}
                      >
                        ✕ {isRtl ? 'رفض' : 'Reject'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial Overview StatCards (Admin & Staff View) */}
      <div className="grid-cards-4">
        <StatCard
          title={t('totalFeesExpected')}
          value={`${(summary?.totalExpected || 0).toLocaleString()} ₪`}
          subtext={isRtl ? 'المطلوب بعد احتساب الخصومات' : 'Net expected tuition'}
          icon={<span style={{ fontSize: 24 }}>💼</span>}
          color="primary"
        />
        <StatCard
          title={t('totalFeesCollected')}
          value={`${(summary?.totalCollected || 0).toLocaleString()} ₪`}
          subtext={isRtl ? 'المبالغ المقبوضة فعلياً' : 'Total collected funds'}
          icon={<span style={{ fontSize: 24 }}>✅</span>}
          color="success"
        />
        <StatCard
          title={t('totalFeesOutstanding')}
          value={`${(summary?.totalOutstanding || 0).toLocaleString()} ₪`}
          subtext={isRtl ? 'الديون المتبقية تحت التحصيل' : 'Pending student debt'}
          icon={<span style={{ fontSize: 24 }}>⏳</span>}
          color="danger"
        />
        <StatCard
          title={t('collectionRateTitle')}
          value={`${summary?.collectionRate || 0}%`}
          subtext={isRtl ? `${summary?.studentCounts?.paid || 0} طالب مسدد بالكامل` : 'Collection progress'}
          icon={<span style={{ fontSize: 24 }}>📈</span>}
          color="warning"
        />
      </div>

      {/* Payment Channel Breakdown Bar */}
      {summary?.methodBreakdown && (
        <div className="panel" style={{ padding: '16px 22px' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
            {isRtl ? '📊 توزيع المقبوضات حسب قنوات الدفع في غزة:' : '📊 Collections by Payment Channel:'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div style={{ background: '#f0fdf4', padding: '10px 14px', borderRadius: 8, border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 11, color: '#166534', fontWeight: 700 }}>💵 نقدي (صندوق المدرسة)</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#14532d', marginTop: 2 }}>
                {(summary.methodBreakdown.CASH || 0).toLocaleString()} ₪
              </div>
            </div>

            <div style={{ background: '#f0f9ff', padding: '10px 14px', borderRadius: 8, border: '1px solid #bae6fd' }}>
              <div style={{ fontSize: 11, color: '#0369a1', fontWeight: 700 }}>🏦 بنك فلسطين (Banki)</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0c4a6e', marginTop: 2 }}>
                {(summary.methodBreakdown.BANK_OF_PALESTINE || 0).toLocaleString()} ₪
              </div>
            </div>

            <div style={{ background: '#fff7ed', padding: '10px 14px', borderRadius: 8, border: '1px solid #fed7aa' }}>
              <div style={{ fontSize: 11, color: '#c2410c', fontWeight: 700 }}>📱 جوال باي (Jawwal Pay)</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#7c2d12', marginTop: 2 }}>
                {(summary.methodBreakdown.JAWWAL_PAY || 0).toLocaleString()} ₪
              </div>
            </div>

            <div style={{ background: '#f5f3ff', padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd6fe' }}>
              <div style={{ fontSize: 11, color: '#6d28d9', fontWeight: 700 }}>💳 بال باي (PalPay)</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#4c1d95', marginTop: 2 }}>
                {(summary.methodBreakdown.PALPAY || 0).toLocaleString()} ₪
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Executive Class-by-Class Financial Overview (Admin Supervision View) */}
      {isAdmin && classes.length > 0 && (
        <div className="panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🏫</span>
                <span>{isRtl ? 'الرقابة المالية ونسب التحصيل حسب الصفوف والشعب الدراسية' : 'Class-by-Class Financial & Collection Oversight'}</span>
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                {isRtl
                  ? 'مؤشرات الإيراد المطلوب، المبالغ المحصلة، ونسب إنجاز السداد الإجمالية لكل شعبة في المدرسة'
                  : 'Breakdown of expected tuition, collected amounts, and collection progress per class section'}
              </p>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
              {classes.length} {isRtl ? 'شعب دراسية مسجلة' : 'Registered Classes'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {classes.map((cls) => {
              const studentsInClass = items.filter((it) => it.classId === cls.id || it.className === cls.name);
              const classExpected = studentsInClass.reduce((sum, s) => sum + (Number(s.totalAmount || 0) - Number(s.discountAmount || 0)), 0);
              const classCollected = studentsInClass.reduce((sum, s) => sum + Number(s.paidAmount || 0), 0);
              const classDue = studentsInClass.reduce((sum, s) => sum + Number(s.balanceDue || 0), 0);
              const classRate = classExpected > 0 ? Math.round((classCollected / classExpected) * 100) : (studentsInClass.length > 0 ? 100 : 0);
              const overdueCount = studentsInClass.filter(s => s.status === 'OVERDUE').length;
              const isSelected = selectedClassId === String(cls.id);

              return (
                <div
                  key={cls.id}
                  onClick={() => setSelectedClassId(isSelected ? 'ALL' : String(cls.id))}
                  style={{
                    background: isSelected ? 'rgba(79, 70, 229, 0.05)' : '#f8fafc',
                    border: isSelected ? '2px solid #6366f1' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 14px rgba(99, 102, 241, 0.15)' : 'none'
                  }}
                  title={isRtl ? 'انقر لفلترة جدول الطلاب لهذا الصف' : 'Click to filter ledger by this class'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <strong style={{ fontSize: 14, color: '#0f172a' }}>{cls.name}</strong>
                      <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                        👥 {studentsInClass.length} {isRtl ? 'طالب مقيد' : 'Students'}
                        {overdueCount > 0 && (
                          <span style={{ color: '#ef4444', fontWeight: 700, marginInlineStart: 6 }}>
                            ({overdueCount} {isRtl ? 'متأخر' : 'overdue'})
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                      <span style={{
                        fontSize: 13,
                        fontWeight: 900,
                        color: classRate >= 80 ? '#16a34a' : classRate >= 50 ? '#d97706' : '#dc2626',
                        background: classRate >= 80 ? '#f0fdf4' : classRate >= 50 ? '#fffbeb' : '#fef2f2',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: `1px solid ${classRate >= 80 ? '#bbf7d0' : classRate >= 50 ? '#fde68a' : '#fecaca'}`
                      }}>
                        {classRate}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
                    <div style={{
                      width: `${Math.min(100, classRate)}%`,
                      height: '100%',
                      background: classRate >= 80 ? '#10b981' : classRate >= 50 ? '#f59e0b' : '#ef4444',
                      borderRadius: 3,
                      transition: 'width 0.4s ease'
                    }} />
                  </div>

                  {/* Financial Mini Stats */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: 10.5 }}>{isRtl ? 'المقرر' : 'Expected'}</span>
                      <strong style={{ color: '#334155' }}>{classExpected.toLocaleString()} ₪</strong>
                    </div>
                    <div>
                      <span style={{ color: '#16a34a', display: 'block', fontSize: 10.5 }}>{isRtl ? 'المحصل' : 'Collected'}</span>
                      <strong style={{ color: '#16a34a' }}>{classCollected.toLocaleString()} ₪</strong>
                    </div>
                    <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                      <span style={{ color: '#dc2626', display: 'block', fontSize: 10.5 }}>{isRtl ? 'المتبقي' : 'Due'}</span>
                      <strong style={{ color: classDue > 0 ? '#dc2626' : '#16a34a' }}>{classDue.toLocaleString()} ₪</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Installment Alerts Box (Admin Oversight vs Staff Active Reminders) */}
      {alertsData.count > 0 && (
        <div style={{
          background: isAdmin ? '#f8fafc' : '#fffbeb',
          border: isAdmin ? '1px solid #cbd5e1' : '1px solid #fde68a',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 22px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{isAdmin ? '📊' : '🔔'}</span>
              <span style={{ fontWeight: 800, fontSize: 15, color: isAdmin ? '#1e293b' : '#92400e' }}>
                {isAdmin
                  ? (isRtl ? 'ملخص تنبيهات الأقساط المستحقة والمتأخرة' : 'Executive Overview of Pending & Overdue Installments')
                  : `${t('installmentAlertsTitle')} (${alertsData.count} ${isRtl ? 'طالب مستحق' : 'Students'})`}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                ({alertsData.count} {isRtl ? 'طالب مستحق' : 'students'})
              </span>
            </div>
            {alertsData.overdueCount > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 800 }}>
                {alertsData.overdueCount} {isRtl ? 'أقساط متأخرة' : 'Overdue'}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {alertsData.alerts.slice(0, 6).map((alt) => (
              <div
                key={alt.studentId}
                style={{
                  background: '#ffffff',
                  border: alt.isOverdue ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '10px 14px',
                  minWidth: 230,
                  fontSize: 12,
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 13 }}>{alt.studentName}</div>
                <div style={{ color: '#64748b', fontSize: 11 }}>{alt.className} • {alt.studentNumber}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontWeight: 700 }}>
                  <span style={{ color: '#dc2626' }}>{isRtl ? 'المتبقي:' : 'Due:'} {alt.balanceDue} ₪</span>
                </div>
                
                {/* Actions */}
                {isStaff ? (
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleOpenRecordPayment(alt)}
                      className="btn btn-sm"
                      style={{ background: '#10b981', color: '#fff', padding: '3px 8px', fontSize: 11, fontWeight: 700, flex: 1 }}
                    >
                      💰 {isRtl ? 'تسديد' : 'Pay'}
                    </button>

                    {alt.parentPhone && (
                      <a
                        href={`https://wa.me/970${alt.parentPhone.replace(/^0/, '')}?text=${encodeURIComponent(`السلام عليكم ورحمة الله، ولي أمر الطالب ${alt.studentName}، نود تذكيركم بموعد القسط المدرسي المستحق بقيمة ${alt.balanceDue} شيكل. شكراً لتعاونكم - إدارة مدرسة جذور النموذجية الخاصة.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm"
                        style={{ background: '#25D366', color: '#fff', padding: '3px 8px', fontSize: 11, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <span>💬</span> {isRtl ? 'واتساب' : 'WhatsApp'}
                      </a>
                    )}
                  </div>
                ) : (
                  <div style={{ marginTop: 6, fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                    ⏳ {isRtl ? 'متابعة شؤون الطلاب (Staff)' : 'Under Staff Follow-up'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: 1, width: '100%' }}>
            {/* Search Input */}
            <input
              type="text"
              className="form-input"
              placeholder={isRtl ? 'ابحث باسم الطالب، رقم القيد، أو هاتف ولي الأمر...' : 'Search student, ID, or phone...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ minWidth: 200, flex: 1 }}
            />

            {/* Class Filter */}
            <select
              className="form-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              style={{ minWidth: 150, flex: '0 1 auto' }}
            >
              <option value="ALL">{isRtl ? 'جميع الصفوف والشعب' : 'All Classes'}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ minWidth: 140, flex: '0 1 auto' }}
            >
              <option value="ALL">{t('feeStatusAll')}</option>
              <option value="PAID">{t('feeStatusPaid')}</option>
              <option value="PARTIAL">{t('feeStatusPartial')}</option>
              <option value="UNPAID">{t('feeStatusUnpaid')}</option>
              <option value="OVERDUE">{t('feeStatusOverdue')}</option>
            </select>
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
            {isRtl ? `عرض ${items.length} طالب` : `Showing ${items.length} students`}
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={loadFeesData} />}

      {/* Student Fees Ledger Table */}
      <div className="panel" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          {loading ? (
            <PageLoader text={isRtl ? 'جاري تحميل سجلات الرسوم والمقبوضات...' : 'Loading fee records...'} />
          ) : items.length === 0 ? (
            <EmptyState
              title={isRtl ? 'لا توجد سجلات رسوم مطابقة للبحث' : 'No fee records found'}
              description={isRtl ? 'جرب تغيير خيارات الفلترة أو البحث عن طالب آخر.' : 'Try adjusting your search criteria.'}
            />
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: 130 }}>{t('studentIdHeader')}</th>
                  <th>{t('studentNameHeader')}</th>
                  <th>{isRtl ? 'الصف / الشعبة' : 'Class'}</th>
                  <th style={{ textAlign: 'center' }}>{t('tuitionFeeRequired')}</th>
                  <th style={{ textAlign: 'center' }}>{t('discountAmountLabel')}</th>
                  <th style={{ textAlign: 'center' }}>{t('paidAmountLabel')}</th>
                  <th style={{ textAlign: 'center' }}>{t('balanceDueLabel')}</th>
                  <th style={{ textAlign: 'center', width: 140 }}>{isRtl ? 'حالة السداد' : 'Status'}</th>
                  <th style={{ textAlign: 'center', width: 180 }}>{isRtl ? 'إجراءات ومقبوضات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => {
                  const badge = getStatusBadge(row.status, row.balanceDue);

                  return (
                    <tr key={row.studentId}>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          background: '#f1f5f9',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#475569',
                          fontFamily: 'monospace'
                        }}>
                          {row.studentNumber}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: 14 }}>
                          {row.fullName}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {row.parentName} {row.parentPhone ? `(${row.parentPhone})` : ''}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#334155' }}>
                          {row.className}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>
                        {row.totalAmount?.toLocaleString()} ₪
                      </td>
                      <td style={{ textAlign: 'center', color: row.discountAmount > 0 ? '#16a34a' : 'var(--text-muted)', fontWeight: 700 }}>
                        {row.discountAmount > 0 ? `-${row.discountAmount} ₪` : '—'}
                      </td>
                      <td style={{ textAlign: 'center', color: '#16a34a', fontWeight: 800 }}>
                        {row.paidAmount > 0 ? `${row.paidAmount?.toLocaleString()} ₪` : '0 ₪'}
                      </td>
                      <td style={{ textAlign: 'center', color: row.balanceDue > 0 ? '#dc2626' : '#16a34a', fontWeight: 900 }}>
                        {row.balanceDue > 0 ? `${row.balanceDue?.toLocaleString()} ₪` : '0 ₪'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 800,
                          background: badge.bg,
                          color: badge.color,
                          border: badge.border
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                          {isStaff ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenRecordPayment(row)}
                                className="btn btn-sm"
                                style={{
                                  background: row.balanceDue > 0 ? '#10b981' : '#f1f5f9',
                                  color: row.balanceDue > 0 ? '#ffffff' : '#64748b',
                                  border: row.balanceDue > 0 ? 'none' : '1px solid #cbd5e1',
                                  fontWeight: 700,
                                  padding: '4px 10px',
                                  fontSize: 11
                                }}
                                title={isRtl ? 'تسجيل وقبض دفعة جديدة' : 'Record Payment'}
                              >
                                {row.balanceDue > 0 ? (isRtl ? '💰 قبض' : 'Pay') : (isRtl ? '✓ مدفوع' : 'Paid')}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenStudentReceipts(row)}
                                className="btn btn-secondary btn-sm"
                                style={{
                                  fontWeight: 700,
                                  padding: '4px 8px',
                                  fontSize: 11
                                }}
                                title={isRtl ? 'عرض وطباعة سندات القبض' : 'View Receipts'}
                              >
                                📄 {isRtl ? 'سند' : 'Receipt'}
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenStudentReceipts(row)}
                              className="btn btn-secondary btn-sm"
                              style={{
                                background: '#f8fafc',
                                borderColor: 'var(--primary)',
                                color: 'var(--primary)',
                                fontWeight: 700,
                                padding: '5px 12px',
                                fontSize: 11.5,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                              title={isRtl ? 'تدقيق السجلات والذمة المالية وسندات الطالب' : 'Audit Student Receipts & Balance'}
                            >
                              📄 {isRtl ? 'تدقيق السندات والذمة' : 'Audit Receipts'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <RecordPaymentModal
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          initialStudent={activeStudentForPayment}
          onPaymentRecorded={handlePaymentRecorded}
        />
      )}

      {/* Payment Receipt Modal */}
      {activeReceipt && (
        <PaymentReceiptModal
          isOpen={Boolean(activeReceipt)}
          onClose={() => setActiveReceipt(null)}
          payment={activeReceipt}
          student={activeStudentForReceipt}
        />
      )}

      {/* Parent Online Portal Hub Modal */}
      {isParentPortalOpen && (
        <ParentPaymentPortalModal
          isOpen={isParentPortalOpen}
          onClose={() => setIsParentPortalOpen(false)}
          student={activeStudentForPayment}
        />
      )}

      {/* Notice Details Review Modal for Staff & Admin Audit */}
      {selectedNoticeForReview && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedNoticeForReview(null);
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
              direction: isRtl ? 'rtl' : 'ltr',
              animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Header */}
            <div style={{
              background: isAdmin
                ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
                : 'linear-gradient(135deg, #0369a1 0%, #0f172a 100%)',
              color: '#ffffff',
              padding: '20px 24px',
              position: 'relative'
            }}>
              <button
                onClick={() => setSelectedNoticeForReview(null)}
                type="button"
                style={{
                  position: 'absolute',
                  top: 18,
                  left: isRtl ? 18 : 'auto',
                  right: isRtl ? 'auto' : 18,
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 800
                }}
              >
                ✕
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 24 }}>{isAdmin ? '🛡️' : '📬'}</span>
                <h3 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>
                  {isAdmin
                    ? (isRtl ? 'تدقيق ومعاينة إشعار التحويل البنكي' : 'Audit Bank Transfer Notice')
                    : (isRtl ? 'تفاصيل إشعار التحويل البنكي للمطابقة' : 'Review Bank Transfer Notice')}
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: 12.5, opacity: 0.9 }}>
                {isAdmin
                  ? (isRtl ? 'وضع الرقابة والإشراف العام للمدير العام' : 'Executive supervision and verification mode')
                  : (isRtl ? 'مطابقة بيانات الحوالة واعتماد سند القبض بحساب الطالب' : 'Verify reference and approve receipt')}
              </p>
            </div>

            {/* Body */}
            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              {/* Supervisory Mode Notice for Admin */}
              {isAdmin && (
                <div style={{
                  background: '#eef2ff',
                  border: '1px solid #c7d2fe',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 12.5,
                  color: '#3730a3',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span style={{ fontSize: 16 }}>ℹ️</span>
                  <span>{isRtl ? 'نظرة عامة للمدير: عمليات المطابقة البنكية والاعتماد والتقييد المحاسبي من اختصاص موظف شؤون الطلاب (Staff).' : 'Supervisory view: Bank reconciliation and ledger approval are handled by Student Affairs Staff.'}</span>
                </div>
              )}

              {/* Student Header Card */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10
              }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{isRtl ? 'اسم الطالب المستفيد' : 'Student Name'}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', marginTop: 2 }}>
                    {selectedNoticeForReview.studentName}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{selectedNoticeForReview.studentNumber}</span>
                    {' • '}
                    <span>{selectedNoticeForReview.className}</span>
                  </div>
                </div>

                <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{isRtl ? 'المبلغ المحول' : 'Amount'}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#059669', marginTop: 2 }}>
                    {selectedNoticeForReview.amount} ₪
                  </div>
                </div>
              </div>

              {/* Transfer Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>{isRtl ? 'قناة / وسيلة التحويل:' : 'Method:'}</span>
                  <strong style={{ color: '#0f172a', marginTop: 3, display: 'block' }}>
                    {selectedNoticeForReview.method === 'BANK_OF_PALESTINE' ? '🏦 بنك فلسطين (Banki)' : selectedNoticeForReview.method === 'JAWWAL_PAY' ? '📱 جوال باي (Jawwal Pay)' : selectedNoticeForReview.method === 'PALPAY' ? '💳 بال باي (PalPay)' : selectedNoticeForReview.method}
                  </strong>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>{isRtl ? 'رقم الإشعار / العملية (Ref):' : 'Transaction Ref:'}</span>
                  <code style={{ color: '#0284c7', fontWeight: 900, fontSize: 14, marginTop: 3, display: 'block' }}>
                    {selectedNoticeForReview.transactionRef}
                  </code>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>{isRtl ? 'اسم الدافع / المحول:' : 'Sender Name:'}</span>
                  <strong style={{ color: '#0f172a', marginTop: 3, display: 'block' }}>
                    {selectedNoticeForReview.payerName}
                  </strong>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>{isRtl ? 'تاريخ ووقت الإشعار:' : 'Timestamp:'}</span>
                  <span style={{ color: '#334155', fontSize: 12, marginTop: 3, display: 'block' }}>
                    {new Date(selectedNoticeForReview.createdAt || selectedNoticeForReview.date).toLocaleString('ar-EG')}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedNoticeForReview.notes && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#92400e' }}>
                  <strong>{isRtl ? 'ملاحظات مرسلة من ولي الأمر:' : 'Notes:'}</strong> {selectedNoticeForReview.notes}
                </div>
              )}

              {/* Direct WhatsApp Action for Parent Contact */}
              {selectedNoticeForReview.payerPhone && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#166534' }}>
                    <span>📱 <strong>هاتف ولي الأمر:</strong> {selectedNoticeForReview.payerPhone}</span>
                  </div>
                  {isStaff ? (
                    <a
                      href={`https://wa.me/970${selectedNoticeForReview.payerPhone.replace(/^0/, '')}?text=${encodeURIComponent(`السلام عليكم، تم استلام إشعار تحويل قسط الطالب ${selectedNoticeForReview.studentName} بمبلغ ${selectedNoticeForReview.amount} شيكل. شكراً لكم - شؤون الطلاب.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm"
                      style={{ background: '#25D366', color: '#ffffff', fontWeight: 700, fontSize: 11.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <span>💬</span> {isRtl ? 'تواصل واتساب' : 'WhatsApp'}
                    </a>
                  ) : (
                    <span style={{ fontSize: 11.5, color: '#166534', fontWeight: 600 }}>
                      📞 {selectedNoticeForReview.payerPhone}
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10, paddingTop: 14, borderTop: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() => setSelectedNoticeForReview(null)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '8px 24px', fontWeight: 700 }}
                  >
                    {isRtl ? '✕ إغلاق المعاينة' : 'Close Audit'}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedNoticeForReview(null)}
                      className="btn btn-secondary btn-sm"
                    >
                      {isRtl ? 'إغلاق' : 'Close'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRejectNotice(selectedNoticeForReview)}
                      disabled={rejectingId === selectedNoticeForReview.id}
                      className="btn btn-danger btn-sm"
                      style={{ fontWeight: 700 }}
                    >
                      ✕ {isRtl ? 'رفض الإشعار' : 'Reject'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApproveNotice(selectedNoticeForReview)}
                      disabled={approvingId === selectedNoticeForReview.id}
                      className="btn btn-primary btn-sm"
                      style={{ fontWeight: 900, background: '#059669', borderColor: '#059669', padding: '8px 20px' }}
                    >
                      {approvingId === selectedNoticeForReview.id ? (isRtl ? 'جاري الاعتماد...' : 'Approving...') : (isRtl ? '✅ اعتماد وتوثيق السند فوراً' : '✅ Approve & Issue Receipt')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
