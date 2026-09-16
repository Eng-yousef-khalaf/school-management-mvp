import React, { useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { PalestineFlagIcon } from '../../components/common/Icons';

export default function ParentPaymentPortalModal({ isOpen, onClose, student }) {
  const toast = useToast();
  const { isRtl } = useLanguage();

  const [studentNumber, setStudentNumber] = useState(student?.studentNumber || '');
  const [payerName, setPayerName] = useState(student?.parentName || '');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('BANK_OF_PALESTINE');
  const [transactionRef, setTransactionRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!studentNumber || !amount || !transactionRef) {
      toast.warning(isRtl ? 'يرجى تعبئة رقم القيد، المبلغ، ورقم العملية' : 'Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // In a live system, this sends proof to backend for staff verification
      await api.post('/fees/payments', {
        studentId: student?.studentId || student?.id || 1,
        amount: parseFloat(amount),
        currency: 'ILS',
        method,
        payerName,
        payerRelationship: 'FATHER',
        transactionRef,
        notes: `إشعار تحويل مرسل عن بُعد من ولي الأمر (${payerName})`,
        status: 'COMPLETED'
      });

      setSubmittedSuccess(true);
      toast.success(isRtl ? 'تم إرسال إشعار الدفعة إلى شؤون الطلاب (Staff) بنجاح! 🎉' : 'Payment notice sent successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit payment proof');
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          direction: isRtl ? 'rtl' : 'ltr',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #1e40af 100%)',
          color: '#ffffff',
          padding: '22px 26px',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
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
            <span style={{ fontSize: 24 }}>📱</span>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
              {isRtl ? 'بوابة التحويل والسداد الإلكتروني' : 'Online Payment Hub (Gaza)'}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, opacity: 0.9 }}>
            <PalestineFlagIcon width={18} height={12} />
            <span>{isRtl ? 'بيانات حسابات ومحافظ المدرسة المعتمدة في قطاع غزة' : 'Official school payment accounts & wallets'}</span>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Official Payment Channels Cards */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
              {isRtl ? '1. اختر قناة التحويل المناسبة لك:' : '1. Official School Payment Channels:'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              
              {/* Bank of Palestine Card */}
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '12px',
                padding: '14px 16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#0369a1', marginBottom: 8 }}>
                  <span>🏦</span>
                  <span>{isRtl ? 'بنك فلسطين (Bank of Palestine)' : 'Bank of Palestine'}</span>
                </div>
                <div style={{ fontSize: 12, color: '#334155', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div><strong>{isRtl ? 'اسم المستفيد:' : 'Beneficiary:'}</strong> يوسف عبداللطيف خلف</div>
                  <div><strong>{isRtl ? 'رقم الجوال / الحساب:' : 'Acc / Phone:'}</strong> <code style={{ background: '#e0f2fe', padding: '2px 8px', borderRadius: 4, fontWeight: 800, color: '#0369a1', fontSize: 13 }}>0594787703</code></div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{isRtl ? 'تحويل فوري متاح عبر تطبيق بنكي (Banki)' : 'Available on Banki App'}</div>
                </div>
              </div>

              {/* Jawwal Pay Card */}
              <div style={{
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: '12px',
                padding: '14px 16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#c2410c', marginBottom: 8 }}>
                  <span>📱</span>
                  <span>{isRtl ? 'محفظة جوال باي (Jawwal Pay)' : 'Jawwal Pay Wallet'}</span>
                </div>
                <div style={{ fontSize: 12, color: '#334155', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div><strong>{isRtl ? 'اسم صاحب المحفظة:' : 'Owner:'}</strong> يوسف عبداللطيف خلف</div>
                  <div><strong>{isRtl ? 'رقم محفظة التحويل:' : 'Wallet Phone:'}</strong> <code style={{ background: '#ffedd5', padding: '2px 8px', borderRadius: 4, fontWeight: 800, color: '#c2410c', fontSize: 13 }}>0594787703</code></div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{isRtl ? 'تحويل فوري بدون عمولة عبر تطبيق جوال باي' : 'Instant 0-fee transfer'}</div>
                </div>
              </div>

              {/* PalPay Card */}
              <div style={{
                background: '#f5f3ff',
                border: '1px solid #ddd6fe',
                borderRadius: '12px',
                padding: '14px 16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#6d28d9', marginBottom: 8 }}>
                  <span>💳</span>
                  <span>{isRtl ? 'محفظة بال باي (PalPay)' : 'PalPay Wallet'}</span>
                </div>
                <div style={{ fontSize: 12, color: '#334155', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div><strong>{isRtl ? 'اسم صاحب الحساب:' : 'Owner:'}</strong> يوسف عبداللطيف خلف</div>
                  <div><strong>{isRtl ? 'رقم المحفظة / الفاتورة:' : 'Account Phone:'}</strong> <code style={{ background: '#ede9fe', padding: '2px 8px', borderRadius: 4, fontWeight: 800, color: '#6d28d9', fontSize: 13 }}>0567036492</code></div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{isRtl ? 'متاح عبر تطبيق بال باي وكافة نقاط البيع' : 'Available across PalPay agents'}</div>
                </div>
              </div>

            </div>
          </div>

          {/* Submit Proof Section */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '18px 20px'
          }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
              {isRtl ? '2. بعد إتمام التحويل، أدخل رقم الإشعار لتأكيد الدفعة فوراً:' : '2. Enter Transfer Ref to Confirm Payment:'}
            </div>
            <p style={{ margin: '0 0 14px', fontSize: 12, color: '#64748b' }}>
              {isRtl ? 'سيصل إشعار فوري لمكتب شؤون الطلاب (Staff) لمطابقة الحوالة واعتماد سند القبض بحساب الطالب' : 'Staff will match and confirm your receipt automatically'}
            </p>

            {submittedSuccess ? (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#166534',
                padding: '16px',
                borderRadius: '10px',
                textAlign: 'center',
                fontWeight: 700
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
                <div>{isRtl ? 'تم استلام بيانات الإشعار بنجاح! تم تقييد المبلغ وإشعار موظف شؤون الطلاب (Staff).' : 'Notice received successfully!'}</div>
              </div>
            ) : (
              <form onSubmit={handleSubmitProof} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>
                      {isRtl ? 'رقم قيد الطالب' : 'Student ID'} *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="STU-2026-..."
                      value={studentNumber}
                      onChange={(e) => setStudentNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>
                      {isRtl ? 'اسم ولي الأمر / المحول' : 'Sender Full Name'} *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={isRtl ? 'الاسم كما يظهر بالحوالة' : 'Name as on slip'}
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>
                      {isRtl ? 'المبلغ المحول (شيكل ₪)' : 'Amount (ILS)'} *
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      placeholder="500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>
                      {isRtl ? 'قناة التحويل المستخدمة' : 'Method Used'}
                    </label>
                    <select
                      className="form-select"
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                    >
                      <option value="BANK_OF_PALESTINE">{isRtl ? 'بنك فلسطين (Banki)' : 'Bank of Palestine'}</option>
                      <option value="JAWWAL_PAY">{isRtl ? 'جوال باي (Jawwal Pay)' : 'Jawwal Pay'}</option>
                      <option value="PALPAY">{isRtl ? 'بال باي (PalPay)' : 'PalPay'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>
                    {isRtl ? 'رقم الإشعار / العملية (Transaction ID / Ref #)' : 'Transaction ID'} *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={isRtl ? 'الرقم المرجعي المطبوع في إشعار البنك أو جوال باي' : 'e.g. 98472918'}
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ fontWeight: 800, marginTop: 6, padding: '10px' }}
                >
                  {submitting ? (isRtl ? 'جاري الإرسال...' : 'Sending...') : (
                    <>
                      <span>📨</span>
                      <span>{isRtl ? 'إرسال إشعار الدفعة لشؤون الطلاب (Staff) للمطابقة' : 'Send Payment Notice to Staff'}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
