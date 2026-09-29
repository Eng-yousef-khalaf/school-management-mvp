import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';

export default function IncomingTransferPopup({ currentPage, onNavigate }) {
  const { activePopupNotice, dismissPopup, unreadCount, isStaffOnly, isStaffOrAdmin } = useNotifications();
  const { isRtl } = useLanguage();

  const canSeeNotices = isStaffOrAdmin !== undefined ? isStaffOrAdmin : isStaffOnly;
  if (!activePopupNotice || !canSeeNotices) return null;

  const notice = activePopupNotice;
  const isRegistration = notice.noticeType === 'REGISTRATION';

  const isBankOfPalestine = notice.method === 'BANK_OF_PALESTINE';
  const isJawwal = notice.method === 'JAWWAL_PAY';
  const methodLabel = isBankOfPalestine ? 'بنك فلسطين' : isJawwal ? 'جوال باي' : notice.method === 'PALPAY' ? 'بال باي' : (notice.method || 'بوابة التسجيل');

  const handleActionClick = () => {
    dismissPopup(notice.id);
    if (onNavigate) {
      if (isRegistration) {
        onNavigate('enrollment');
      } else {
        onNavigate('fees');
      }
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
        maxWidth: '440px',
        width: 'calc(100vw - 48px)',
        background: isRegistration
          ? 'linear-gradient(135deg, #131d36 0%, #0f2744 100%)'
          : 'linear-gradient(135deg, #091a2b 0%, #062438 100%)',
        border: isRegistration ? '2px solid #60a5fa' : '2px solid #38bdf8',
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
              background: isRegistration ? '#2563eb' : '#0284c7',
              color: '#ffffff',
              width: 34,
              height: 34,
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 17,
              boxShadow: isRegistration ? '0 0 12px #60a5fa' : '0 0 12px #38bdf8'
            }}
          >
            {isRegistration ? '🎓' : '🔔'}
          </span>
          <div>
            <h4 style={{ margin: 0, fontSize: 14.5, fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{isRegistration ? (isRtl ? 'طلب تسجيل طالب جديد وارد الآن!' : 'New Student Registration Received!') : (isRtl ? 'إشعار تحويل مالي جديد وارد!' : 'New Payment Notice Received!')}</span>
              {unreadCount > 1 && (
                <span style={{ background: '#ea580c', fontSize: 11, padding: '1px 6px', borderRadius: 10 }}>
                  +{unreadCount - 1}
                </span>
              )}
            </h4>
            <span style={{ fontSize: 11.5, color: isRegistration ? '#93c5fd' : '#7dd3fc' }}>
              {isRegistration
                ? (isRtl ? 'تم تقديم طلب تسجيل من البوابة الإلكترونية بانتظار الاعتماد وتوزيع الصف' : 'Submitted online for enrollment approval')
                : (isRtl ? 'تم إرسال إشعار سداد من ولي الأمر بانتظار الاعتماد' : 'Submitted by parent for staff approval')}
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
            <span style={{ color: '#94a3b8', fontSize: 11, display: 'block' }}>{isRtl ? 'اسم الطالب:' : 'Student:'}</span>
            <strong style={{ fontSize: 14, color: '#ffffff' }}>{notice.studentName}</strong>{' '}
            {notice.nationalId && <code style={{ fontSize: 11, color: '#38bdf8' }}>({notice.nationalId})</code>}
            {notice.studentNumber && <code style={{ fontSize: 11, color: '#38bdf8' }}>({notice.studentNumber})</code>}
          </div>
          <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
            <span style={{ color: '#94a3b8', fontSize: 11, display: 'block' }}>{isRegistration ? (isRtl ? 'رسوم حجز المقعد:' : 'Deposit:') : (isRtl ? 'المبلغ:' : 'Amount:')}</span>
            <span style={{ fontSize: 17, fontWeight: 900, color: '#34d399' }}>{notice.amount || notice.registrationFee || 20} ₪</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 6, marginTop: 2 }}>
          <span style={{ color: '#cbd5e1' }}>
            <strong>{isRegistration ? (isRtl ? 'المرحلة:' : 'Grade:') : (isRtl ? 'القناة:' : 'Channel:')}</strong>{' '}
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{isRegistration ? (notice.gradeLevel || 'غير محدد') : methodLabel}</span>
          </span>
          <span style={{ color: '#cbd5e1' }}>
            <strong>{isRegistration ? (isRtl ? 'هاتف ولي الأمر:' : 'Phone:') : (isRtl ? 'رقم العملية:' : 'Ref:')}</strong>{' '}
            <code style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '1px 5px', borderRadius: 4, fontWeight: 800 }}>
              {isRegistration ? (notice.parentPhone || 'غير متوفر') : notice.transactionRef}
            </code>
          </span>
        </div>

        {notice.payerName && !isRegistration && (
          <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
            {isRtl ? 'المرسل:' : 'Payer:'} <span style={{ color: '#ffffff' }}>{notice.payerName}</span> {notice.payerPhone ? `(${notice.payerPhone})` : ''}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleActionClick}
          style={{
            flex: 1,
            background: isRegistration
              ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
            boxShadow: isRegistration ? '0 4px 14px rgba(37, 99, 235, 0.4)' : '0 4px 14px rgba(16, 185, 129, 0.4)'
          }}
        >
          <span>{isRegistration ? '📋' : '👁️'}</span>
          <span>{isRegistration ? (isRtl ? 'معاينة واعتماد طلب التسجيل الآن' : 'Review & Approve Registration') : (isRtl ? 'الانتقال للاعتماد والمطابقة الآن' : 'Review & 1-Click Approve')}</span>
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
