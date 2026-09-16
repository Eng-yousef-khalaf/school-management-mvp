import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';

export default function IncomingTransferPopup({ currentPage, onNavigate }) {
  const { activePopupNotice, dismissPopup, unreadCount, isStaffOnly } = useNotifications();
  const { isRtl } = useLanguage();

  if (!activePopupNotice || !isStaffOnly) return null;

  const notice = activePopupNotice;
  const isBankOfPalestine = notice.method === 'BANK_OF_PALESTINE';
  const isJawwal = notice.method === 'JAWWAL_PAY';
  const methodLabel = isBankOfPalestine ? 'بنك فلسطين' : isJawwal ? 'جوال باي' : notice.method === 'PALPAY' ? 'بال باي' : notice.method;

  const handleGoToFees = () => {
    dismissPopup(notice.id);
    if (onNavigate) {
      onNavigate('fees');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: isRtl ? '24px' : 'auto',
        right: isRtl ? 'auto' : '24px',
        zIndex: 9999,
        maxWidth: '430px',
        width: 'calc(100vw - 48px)',
        background: 'linear-gradient(135deg, #091a2b 0%, #062438 100%)',
        border: '2px solid #38bdf8',
        borderRadius: '16px',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 25px rgba(56, 189, 248, 0.35)',
        color: '#ffffff',
        padding: '18px 20px',
        animation: 'slideInPopup 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(10px)',
        direction: isRtl ? 'rtl' : 'ltr'
      }}
    >
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              background: '#0284c7',
              color: '#ffffff',
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              boxShadow: '0 0 12px #38bdf8'
            }}
          >
            🔔
          </span>
          <div>
            <h4 style={{ margin: 0, fontSize: 14.5, fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{isRtl ? 'إشعار تحويل مالي جديد وارد!' : 'New Payment Notice Received!'}</span>
              {unreadCount > 1 && (
                <span style={{ background: '#ea580c', fontSize: 11, padding: '1px 6px', borderRadius: 10 }}>
                  +{unreadCount - 1}
                </span>
              )}
            </h4>
            <span style={{ fontSize: 11.5, color: '#7dd3fc' }}>
              {isRtl ? 'تم إرسال إشعار سداد من ولي الأمر بانتظار الاعتماد' : 'Submitted by parent for staff approval'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => dismissPopup(notice.id)}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: 16,
            borderRadius: '50%',
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          title={isRtl ? 'إغلاق الإشعار' : 'Close notification'}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Main Details Card */}
      <div
        style={{
          background: 'rgba(3, 14, 26, 0.75)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '10px',
          padding: '12px 14px',
          marginBottom: 14,
          fontSize: 13,
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#94a3b8', fontSize: 11, display: 'block' }}>{isRtl ? 'اسم الطالب المستفيد:' : 'Student:'}</span>
            <strong style={{ fontSize: 14, color: '#ffffff' }}>{notice.studentName}</strong>{' '}
            <code style={{ fontSize: 11, color: '#38bdf8' }}>({notice.studentNumber})</code>
          </div>
          <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
            <span style={{ color: '#94a3b8', fontSize: 11, display: 'block' }}>{isRtl ? 'المبلغ:' : 'Amount:'}</span>
            <span style={{ fontSize: 17, fontWeight: 900, color: '#34d399' }}>{notice.amount} ₪</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 6, marginTop: 2 }}>
          <span style={{ color: '#cbd5e1' }}>
            <strong>{isRtl ? 'القناة:' : 'Channel:'}</strong>{' '}
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{methodLabel}</span>
          </span>
          <span style={{ color: '#cbd5e1' }}>
            <strong>{isRtl ? 'رقم العملية:' : 'Ref:'}</strong>{' '}
            <code style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '1px 5px', borderRadius: 4, fontWeight: 800 }}>
              {notice.transactionRef}
            </code>
          </span>
        </div>

        {notice.payerName && (
          <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
            {isRtl ? 'المرسل:' : 'Payer:'} <span style={{ color: '#ffffff' }}>{notice.payerName}</span> {notice.payerPhone ? `(${notice.payerPhone})` : ''}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleGoToFees}
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '9px 14px',
            fontWeight: 800,
            fontSize: 13,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
          }}
        >
          <span>👁️</span>
          <span>{isRtl ? 'الانتقال للاعتماد والمطابقة الآن' : 'Review & 1-Click Approve'}</span>
        </button>

        <button
          type="button"
          onClick={() => dismissPopup(notice.id)}
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            color: '#cbd5e1',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '9px 12px',
            fontWeight: 600,
            fontSize: 12,
            cursor: 'pointer'
          }}
        >
          {isRtl ? 'إخفاء' : 'Dismiss'}
        </button>
      </div>
    </div>
  );
}
