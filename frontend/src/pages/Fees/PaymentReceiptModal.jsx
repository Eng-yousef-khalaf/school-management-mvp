import React from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useSchoolConfig } from '../../context/SchoolConfigContext';
import { PalestineFlagIcon } from '../../components/common/Icons';

export default function PaymentReceiptModal({ isOpen, onClose, payment, student }) {
  const { isRtl } = useLanguage();
  const { config } = useSchoolConfig();

  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const getMethodBadge = (method) => {
    switch (method) {
      case 'CASH':
        return { label: isRtl ? '💵 نقدي (صندوق شؤون الطلاب)' : '💵 Cash', color: '#16a34a', bg: '#f0fdf4' };
      case 'BANK_OF_PALESTINE':
        return { label: isRtl ? '🏦 بنك فلسطين (Banki)' : '🏦 Bank of Palestine', color: '#0284c7', bg: '#f0f9ff' };
      case 'JAWWAL_PAY':
        return { label: isRtl ? '📱 جوال باي (Jawwal Pay)' : '📱 Jawwal Pay', color: '#ea580c', bg: '#fff7ed' };
      case 'PALPAY':
        return { label: isRtl ? '💳 بال باي (PalPay)' : '💳 PalPay', color: '#7c3aed', bg: '#f5f3ff' };
      case 'SPONSOR_GRANT':
        return { label: isRtl ? '🤝 كفالة / منحة خيرية' : '🤝 Charity Grant', color: '#059669', bg: '#ecfdf5' };
      default:
        return { label: method || 'نقدي', color: '#475569', bg: '#f1f5f9' };
    }
  };

  const methodInfo = getMethodBadge(payment.method);
  const paymentDate = payment.date || (payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('ar-EG') : new Date().toLocaleDateString('ar-EG'));

  return createPortal(
    <div
      className="receipt-modal-backdrop"
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
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @media print {
          /* 1. Completely hide the root application container during receipt printing */
          body > #root,
          #root,
          .app-container,
          .topbar,
          .sidebar,
          .content-body,
          .main-wrapper,
          .page-container,
          .toast-container,
          .no-print,
          .receipt-modal-actions,
          .watermark-bg,
          button,
          nav,
          header,
          footer {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            max-height: 0 !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* 2. Lock page to pristine single-page white background */
          html, body {
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* 3. Render portal backdrop directly into the print flow */
          .receipt-modal-backdrop {
            position: static !important;
            display: block !important;
            visibility: visible !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            inset: auto !important;
          }

          .receipt-modal-card {
            position: static !important;
            display: block !important;
            visibility: visible !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }

          /* 4. Single-page bounded receipt container */
          #printable-receipt {
            visibility: visible !important;
            display: block !important;
            position: relative !important;
            width: 100% !important;
            max-width: 185mm !important;
            margin: 0 auto !important;
            padding: 6mm 8mm !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #0f172a !important;
            border: 2px solid #0f172a !important;
            border-radius: 6px !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            break-inside: avoid-page !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-before: avoid !important;
            break-before: avoid !important;
            overflow: hidden !important;
          }

          #printable-receipt * {
            visibility: visible !important;
          }

          /* 5. Force A4 Portrait with compact margins for exact 1-page fit */
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
          }
        }
      `}</style>

      <div
        className="receipt-modal-card"
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          direction: isRtl ? 'rtl' : 'ltr',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Modal Action Top Bar */}
        <div className="receipt-modal-actions no-print" style={{
          padding: '14px 20px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>🧾</span>
            <span style={{ fontWeight: 800, fontSize: 14, color: '#1e293b' }}>
              {isRtl ? 'معاينة سند القبض المالي الرسمي (صفحة واحدة جاهزة للطباعة)' : 'Official Tuition Receipt Preview'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 700, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span>🖨️</span>
              <span>{isRtl ? 'طباعة السند الرسمي' : 'Print Receipt'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 700 }}
            >
              ✕ {isRtl ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>

        {/* The Printable Official Receipt Container */}
        <div
          id="printable-receipt"
          style={{
            padding: '20px 24px',
            background: '#ffffff',
            position: 'relative',
            boxSizing: 'border-box'
          }}
        >
          {/* Watermark Logo in background */}
          <div className="watermark-bg" style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '110px',
            opacity: 0.03,
            fontWeight: 900,
            userSelect: 'none',
            pointerEvents: 'none'
          }}>
            PAID
          </div>

          {/* Official Header */}
          <div style={{
            borderBottom: '2px solid #0f172a',
            paddingBottom: '12px',
            marginBottom: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <PalestineFlagIcon width={20} height={12} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                  {isRtl ? 'دولة فلسطين - قطاع غزة' : 'State of Palestine - Gaza'}
                </span>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: '2px 0' }}>
                {config.schoolNameAr || 'مدرسة جذور النموذجية الخاصة'}
              </h2>
              <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>
                {isRtl ? 'قسم شؤون الطلاب والتسجيل والمقبوضات (Staff)' : 'Student Affairs & Registration Department'}
              </div>
            </div>

            <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
              <div style={{
                background: '#0f172a',
                color: '#ffffff',
                padding: '3px 10px',
                borderRadius: 5,
                fontSize: 11.5,
                fontWeight: 800,
                display: 'inline-block',
                marginBottom: 4
              }}>
                {isRtl ? 'سند قبض مالي' : 'OFFICIAL RECEIPT'}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                {payment.receiptNumber || 'GZ-REC-2026-0000'}
              </div>
              <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 1 }}>
                {isRtl ? `التاريخ: ${paymentDate}` : `Date: ${paymentDate}`}
              </div>
            </div>
          </div>

          {/* Student & Payer Info Grid */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '14px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 10,
            fontSize: 12.5
          }}>
            <div>
              <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 600 }}>{isRtl ? 'اسم الطالب الرباعي' : 'Student Name'}:</div>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 14, marginTop: 1 }}>
                {student?.fullName || payment.studentName || '—'}
              </div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 600 }}>{isRtl ? 'رقم القيد / الشعبة' : 'Student ID / Class'}:</div>
              <div style={{ fontWeight: 700, color: '#334155', marginTop: 1 }}>
                <span style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 800 }}>
                  {student?.studentNumber || payment.studentNumber || '—'}
                </span>
                {' • '}
                <span>{student?.className || payment.className || 'الصف السابع'}</span>
              </div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 600 }}>{isRtl ? 'اسم الدافع وصفته' : 'Payer Name & Relation'}:</div>
              <div style={{ fontWeight: 700, color: '#0f172a', marginTop: 1 }}>
                {payment.payerName || student?.parentName || 'ولي الأمر'}
                {payment.payerRelationship ? ` (${payment.payerRelationship === 'FATHER' ? 'الأب' : payment.payerRelationship === 'MOTHER' ? 'الأم' : payment.payerRelationship === 'SPONSOR' ? 'كفيل' : payment.payerRelationship})` : ''}
              </div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 600 }}>{isRtl ? 'طريقة وقناة الدفع' : 'Payment Method'}:</div>
              <div style={{ marginTop: 1 }}>
                <span style={{
                  padding: '1px 7px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  background: methodInfo.bg,
                  color: methodInfo.color
                }}>
                  {methodInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Amount Paid Highlight Box */}
          <div style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: '#ffffff',
            borderRadius: '10px',
            padding: '14px 20px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10
          }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.9, fontWeight: 600 }}>
                {isRtl ? 'المبلغ المستلم والمقيد بالحساب' : 'Total Amount Received'}:
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 1 }}>
                {payment.amount?.toLocaleString()} <span style={{ fontSize: 16 }}>{isRtl ? 'شيكل ₪' : 'ILS'}</span>
              </div>
            </div>

            {payment.transactionRef && (
              <div style={{ textAlign: isRtl ? 'left' : 'right', background: 'rgba(255,255,255,0.15)', padding: '5px 12px', borderRadius: 6 }}>
                <div style={{ fontSize: 10.5, opacity: 0.85 }}>{isRtl ? 'رقم الإشعار / العملية' : 'Reference / Trans ID'}:</div>
                <div style={{ fontWeight: 800, fontSize: 12, fontFamily: 'monospace' }}>{payment.transactionRef}</div>
              </div>
            )}
          </div>

          {/* Notes / Remarks */}
          {payment.notes && (
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 6,
              padding: '8px 12px',
              fontSize: 11.5,
              color: '#92400e',
              marginBottom: 14
            }}>
              <strong>{isRtl ? 'ملاحظات:' : 'Notes:'}</strong> {payment.notes}
            </div>
          )}

          {/* Signatures & Official Stamp Footer */}
          <div style={{
            marginTop: 20,
            paddingTop: 14,
            borderTop: '1px dashed #cbd5e1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600 }}>{isRtl ? 'المستلم / موظف شؤون الطلاب (Staff)' : 'Received By (Staff)'}:</div>
              <div style={{ fontWeight: 800, fontSize: 12, marginTop: 2, color: '#0f172a' }}>
                {payment.receivedByName || payment.recordedBy || (isRtl ? 'موظف شؤون الطلاب (Staff)' : 'Staff Member')}
              </div>
              <div style={{ fontSize: 9.5, color: '#94a3b8', marginTop: 1 }}>
                {isRtl ? 'تم التدقيق والتوثيق آلياً' : 'System Verified'}
              </div>
            </div>

            {/* Official Circular Stamp Box */}
            <div style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              border: '2px dashed #059669',
              color: '#059669',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: 3,
              fontSize: 8.5,
              fontWeight: 800,
              transform: 'rotate(-6deg)',
              opacity: 0.9
            }}>
              <span>★ مدرسة جذور ★</span>
              <span style={{ fontSize: 11, fontWeight: 900, margin: '1px 0' }}>مـعـتـمـد</span>
              <span style={{ fontSize: 7.5 }}>PAID & VERIFIED</span>
            </div>

            <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
              <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600 }}>{isRtl ? 'توقيع ولي الأمر / الدافع' : 'Payer Signature'}:</div>
              <div style={{ width: 120, height: 22, borderBottom: '1px solid #94a3b8', marginTop: 4 }} />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
