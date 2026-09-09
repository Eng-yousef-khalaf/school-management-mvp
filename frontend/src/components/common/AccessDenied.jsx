import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function AccessDenied({ onBack, requiredRole = 'ADMIN' }) {
  const { t, isRtl } = useLanguage();

  return (
    <div style={{
      maxWidth: '600px',
      margin: '60px auto',
      background: 'var(--bg-card)',
      padding: '40px 30px',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-md)',
      textAlign: 'center',
      border: '1px solid var(--border-color)'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'var(--danger-light)',
        color: 'var(--danger)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        margin: '0 auto 20px'
      }}>
        🛡️
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
        {isRtl ? 'منطقة محظورة - غير مصرح بالوصول' : 'Access Restricted - Permission Denied'}
      </h2>

      <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: 24 }}>
        {isRtl
          ? `عذراً، هذه الصفحة والعمليات الموجودة بداخلها تتطلب صلاحية (${requiredRole}) ولا يمكن عرضها لحسابك الحالي.`
          : `Sorry, this section requires (${requiredRole}) privileges and is not accessible by your current role.`}
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <button
          onClick={onBack}
          className="btn btn-primary"
          style={{ padding: '10px 24px' }}
        >
          {isRtl ? '← العودة إلى لوحة التحكم الخاصة بك' : '← Return to Your Dashboard'}
        </button>
      </div>
    </div>
  );
}
