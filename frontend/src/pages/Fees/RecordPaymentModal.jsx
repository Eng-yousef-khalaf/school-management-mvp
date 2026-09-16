import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

export default function RecordPaymentModal({ isOpen, onClose, initialStudent, onPaymentRecorded }) {
  const toast = useToast();
  const { t, isRtl } = useLanguage();

  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudent?.studentId || initialStudent?.id || '');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('ILS');
  const [method, setMethod] = useState('CASH');
  const [payerName, setPayerName] = useState(initialStudent?.parentName || '');
  const [payerRelationship, setPayerRelationship] = useState('FATHER');
  const [payerPhone, setPayerPhone] = useState(initialStudent?.parentPhone || '');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadStudentsList() {
      try {
        setLoadingStudents(true);
        const res = await api.get('/students?limit=200');
        const list = Array.isArray(res) ? res : (res?.items || []);
        setStudents(list);
      } catch (err) {
        console.error('Failed to load students for payment modal:', err);
      } finally {
        setLoadingStudents(false);
      }
    }
    if (isOpen) {
      loadStudentsList();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialStudent) {
      setSelectedStudentId(initialStudent.studentId || initialStudent.id || '');
      setPayerName(initialStudent.parentName || '');
      setPayerPhone(initialStudent.parentPhone || '');
      if (initialStudent.balanceDue) {
        setAmount(String(initialStudent.balanceDue));
      }
    }
  }, [initialStudent]);

  const selectedStudentObj = students.find(s => s.id === parseInt(selectedStudentId, 10)) || initialStudent;

  const handleStudentSelect = (sId) => {
    setSelectedStudentId(sId);
    const found = students.find(s => s.id === parseInt(sId, 10));
    if (found) {
      setPayerName(found.parentName || '');
      setPayerPhone(found.parentPhone || '');
    }
  };

  const handleQuickAmount = (val) => {
    setAmount(String(val));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!selectedStudentId) {
      toast.warning(isRtl ? 'يرجى اختيار الطالب' : 'Please select a student');
      return;
    }
    if (!numAmount || numAmount <= 0) {
      toast.warning(isRtl ? 'يرجى إدخال مبلغ دفع صالح' : 'Please enter a valid payment amount');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        studentId: parseInt(selectedStudentId, 10),
        amount: numAmount,
        currency,
        method,
        payerName: payerName || (selectedStudentObj?.parentName || 'ولي الأمر'),
        payerRelationship,
        payerPhone,
        transactionRef,
        notes
      };

      const res = await api.post('/fees/payments', payload);
      toast.success(isRtl ? 'تم تسجيل الدفعة وإصدار سند القبض بنجاح! 🎉' : 'Payment recorded successfully!');

      if (onPaymentRecorded) {
        onPaymentRecorded(res.payment || res, selectedStudentObj);
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const paymentMethods = [
    { key: 'CASH', label: isRtl ? '💵 نقدي (صندوق المدرسة)' : '💵 Cash at School', bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
    { key: 'BANK_OF_PALESTINE', label: isRtl ? '🏦 بنك فلسطين (Banki / تحويل)' : '🏦 Bank of Palestine', bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
    { key: 'JAWWAL_PAY', label: isRtl ? '📱 جوال باي (Jawwal Pay)' : '📱 Jawwal Pay', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
    { key: 'PALPAY', label: isRtl ? '💳 بال باي (PalPay)' : '💳 PalPay Wallet', bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
    { key: 'SPONSOR_GRANT', label: isRtl ? '🤝 كفالة طالب / منحة خيرية' : '🤝 Sponsor / Grant', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
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
          maxWidth: '580px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          direction: isRtl ? 'rtl' : 'ltr',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          color: '#ffffff',
          padding: '20px 24px',
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
            <span style={{ fontSize: 24 }}>💰</span>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
              {isRtl ? 'تسجيل دفعة وقبض رسوم دراسية' : 'Record Student Tuition Payment'}
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>
            {isRtl ? 'إدخال دفعة مالية جديدة وإصدار سند قبض فوري معتمد' : 'Enter payment details and issue official receipt'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Student Selector */}
          <div>
            <label className="form-label" style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block' }}>
              👤 {isRtl ? 'اختر الطالب' : 'Select Student'} <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              className="form-select"
              value={selectedStudentId}
              onChange={(e) => handleStudentSelect(e.target.value)}
              required
              style={{ fontWeight: 600 }}
            >
              <option value="">{isRtl ? '-- ابحث أو اختر الطالب من القائمة --' : '-- Choose a student --'}</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.studentNumber} - {s.firstName} {s.lastName} ({s.className || 'الصف السابع'})
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Currency */}
          <div>
            <label className="form-label" style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block' }}>
              💵 {isRtl ? 'مبلغ الدفعة' : 'Payment Amount'} <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="number"
                step="0.01"
                min="1"
                className="form-input"
                placeholder={isRtl ? 'أدخل المبلغ المسدد (مثال: 500)' : 'Amount (e.g. 500)'}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                style={{ fontSize: 16, fontWeight: 800, flex: 1 }}
              />
              <select
                className="form-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{ width: 120, fontWeight: 700 }}
              >
                <option value="ILS">{isRtl ? 'شيكل ₪' : 'ILS (₪)'}</option>
                <option value="USD">{isRtl ? 'دولار $' : 'USD ($)'}</option>
                <option value="JOD">{isRtl ? 'دينار JD' : 'JOD'}</option>
              </select>
            </div>

            {/* Quick Amount Preset Chips */}
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: '#64748b', alignSelf: 'center', marginLeft: 4 }}>
                {isRtl ? 'مبالغ سريعة:' : 'Presets:'}
              </span>
              {[200, 300, 500, 750, 1000, 1500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleQuickAmount(preset)}
                  style={{
                    background: amount === String(preset) ? 'var(--primary)' : '#f1f5f9',
                    color: amount === String(preset) ? '#ffffff' : '#334155',
                    border: '1px solid #e2e8f0',
                    borderRadius: 6,
                    padding: '3px 10px',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {preset} ₪
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selector (Gaza tailored) */}
          <div>
            <label className="form-label" style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block' }}>
              💳 {isRtl ? 'طريقة وقناة الدفع' : 'Payment Method'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
              {paymentMethods.map((m) => {
                const isSelected = method === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMethod(m.key)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 10,
                      background: isSelected ? m.bg : '#f8fafc',
                      color: isSelected ? m.color : '#64748b',
                      border: isSelected ? `2px solid ${m.color}` : '1px solid #e2e8f0',
                      fontSize: 12,
                      fontWeight: isSelected ? 800 : 600,
                      cursor: 'pointer',
                      textAlign: isRtl ? 'right' : 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payer Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label" style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block' }}>
                {isRtl ? 'اسم الشخص الدافع' : 'Payer Name'}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={isRtl ? 'مثال: أبو محمد العشي' : 'Payer full name'}
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block' }}>
                {isRtl ? 'صفة الدافع' : 'Relationship'}
              </label>
              <select
                className="form-select"
                value={payerRelationship}
                onChange={(e) => setPayerRelationship(e.target.value)}
              >
                <option value="FATHER">{isRtl ? 'الأب (ولي الأمر)' : 'Father (Guardian)'}</option>
                <option value="MOTHER">{isRtl ? 'الأم' : 'Mother'}</option>
                <option value="GUARDIAN">{isRtl ? 'الوكيل / الوصي' : 'Legal Guardian'}</option>
                <option value="RELATIVE">{isRtl ? 'قريب (أخ / عم / خال)' : 'Relative'}</option>
                <option value="SPONSOR">{isRtl ? 'كافل خير / جمعية ومؤسسة' : 'Sponsor / Charity'}</option>
                <option value="SELF">{isRtl ? 'الطالب نفسه' : 'Student Self'}</option>
              </select>
            </div>
          </div>

          {/* Reference Number & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label" style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block' }}>
                {isRtl ? 'رقم هاتف الدافع' : 'Payer Phone'}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="0599xxxxxx"
                value={payerPhone}
                onChange={(e) => setPayerPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block' }}>
                {isRtl ? 'رقم الإشعار / الحوالة' : 'Transaction Ref #'}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={isRtl ? 'رقم عملية بنكي أو جوال باي' : 'Ref / Trans ID'}
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="form-label" style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block' }}>
              {isRtl ? 'ملاحظات وتفاصيل إضافية' : 'Notes / Remarks'}
            </label>
            <input
              type="text"
              className="form-input"
              placeholder={isRtl ? 'مثال: القسط الأول للسنة الدراسية 2026/2027' : 'Optional remarks...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10, paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={saving}
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ fontWeight: 800, padding: '10px 24px', background: '#059669', borderColor: '#059669' }}
            >
              {saving ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (
                <>
                  <span>✓</span>
                  <span>{isRtl ? 'تسجيل الدفعة وإصدار الوصل' : 'Record & Issue Receipt'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
