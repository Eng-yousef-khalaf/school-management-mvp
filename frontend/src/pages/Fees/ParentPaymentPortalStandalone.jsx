import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { PalestineFlagIcon } from '../../components/common/Icons';
import SchoolLogo from '../../components/common/SchoolLogo';

export default function ParentPaymentPortalStandalone({ onExitToSchool }) {
  const { isRtl } = useLanguage();
  const toast = useToast();

  // Search & Student Lookup State
  const [searchQuery, setSearchQuery] = useState('');
  const [foundStudent, setFoundStudent] = useState(null);
  const [studentFee, setStudentFee] = useState(null);
  const [searching, setSearching] = useState(false);

  // Form State
  const [studentNumber, setStudentNumber] = useState('');
  const [studentName, setStudentName] = useState('');
  const [payerName, setPayerName] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [payerRelationship, setPayerRelationship] = useState('FATHER');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('BANK_OF_PALESTINE');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState(null);

  // QR Modal preview state
  const [activeQrModal, setActiveQrModal] = useState(null); // 'BOP' | 'JAWWAL' | 'PALPAY' | null

  // Copy helper
  const [copiedKey, setCopiedKey] = useState('');
  const handleCopy = (text, key) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(isRtl ? 'تم نسخ الرقم بنجاح! 📋' : 'Copied to clipboard!');
      setTimeout(() => setCopiedKey(''), 2500);
    } catch {
      toast.info(text);
    }
  };

  // Student Search (Public friendly)
  const handleSearchStudent = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setFoundStudent(null);
    setStudentFee(null);
    try {
      // 1. Try public lookup first
      let items = [];
      try {
        const publicRes = await api.get(`/fees/public/lookup?q=${encodeURIComponent(searchQuery.trim())}`);
        items = publicRes?.items || [];
      } catch {}

      // 2. If no items from public, fallback to general students endpoint
      if (items.length === 0) {
        try {
          const res = await api.get(`/students?q=${encodeURIComponent(searchQuery.trim())}&limit=5`);
          items = res?.items || [];
        } catch {}
      }

      if (items.length > 0) {
        const student = items[0];
        setFoundStudent(student);
        setStudentNumber(student.studentNumber);
        setStudentName(student.fullName || `${student.firstName} ${student.lastName}`);
        setPayerName(student.parentName || '');
        setPayerPhone(student.parentPhone || '');

        try {
          const feeRes = await api.get(`/fees/student/${student.id}`);
          setStudentFee(feeRes);
          if (feeRes.remainingBalance > 0) {
            setAmount(String(feeRes.remainingBalance));
          }
        } catch (e) {
          console.warn('Fee fetch error:', e);
        }
      } else {
        toast.warning(isRtl ? 'لم يتم العثور على طالب بهذا الاسم أو رقم القيد' : 'No student found');
      }
    } catch (err) {
      toast.error(err.message || 'Error looking up student');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!studentNumber || !payerName || !amount || !transactionRef) {
      toast.warning(isRtl ? 'يرجى تعبئة كافة الحقول المطلوبة ورقم العملية' : 'Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        studentId: foundStudent?.id || 1,
        studentNumber,
        studentName: studentName || (foundStudent ? `${foundStudent.firstName} ${foundStudent.lastName}` : ''),
        amount: parseFloat(amount),
        currency: 'ILS',
        method,
        payerName,
        payerRelationship,
        payerPhone,
        transactionRef,
        notes: `إشعار تحويل إلكتروني من ولي الأمر عبر بوابة السداد: ${notes || 'تم التحويل بنجاح'}`,
        status: 'PENDING'
      };

      const result = await api.post('/fees/parent-notice', payload);
      
      const receiptData = {
        ...result,
        studentNumber,
        studentName: studentName || (foundStudent ? `${foundStudent.firstName} ${foundStudent.lastName}` : 'طالب المدرسة'),
        amount,
        method,
        payerName,
        payerPhone,
        transactionRef,
        status: 'PENDING',
        date: new Date().toISOString()
      };

      setSubmittedReceipt(receiptData);

      // Save to localStorage for instant cross-tab sync with Staff dashboard
      try {
        const raw = localStorage.getItem('school_mock_payments_store');
        let currentList = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(currentList)) currentList = [];
        const exists = currentList.some(p => p.transactionRef === transactionRef);
        if (!exists) {
          currentList.unshift({
            id: currentList.length + 10,
            studentId: foundStudent?.id || 1,
            studentName: receiptData.studentName,
            studentNumber: receiptData.studentNumber,
            className: foundStudent?.currentClass || foundStudent?.className || 'الصف السابع أ',
            amount: parseFloat(amount),
            currency: 'ILS',
            method,
            status: 'PENDING',
            payerName,
            payerRelationship,
            payerPhone,
            transactionRef,
            receiptNumber: null,
            notes: payload.notes,
            date: new Date().toISOString().slice(0, 10),
            createdAt: new Date().toISOString()
          });
          localStorage.setItem('school_mock_payments_store', JSON.stringify(currentList));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('payment_notice_updated', { detail: currentList }));
        }
      } catch (err) {
        console.warn('Storage sync warn:', err);
      }

      toast.success(isRtl ? 'تم إرسال إشعار الدفعة بنجاح! هو الآن قيد مراجعة واعتماد شؤون الطلاب (Staff) ⏳' : 'Payment notice sent for staff review!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit payment notice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadNoticeImage = () => {
    if (!submittedReceipt) return;

    try {
      const canvas = document.createElement('canvas');
      const width = 800;
      const height = 980;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, '#090d16');
      bgGradient.addColorStop(0.5, '#0f172a');
      bgGradient.addColorStop(1, '#090d16');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Outer Border
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.strokeRect(18, 18, width - 36, height - 36);

      // Inner Header Box
      const headerGrad = ctx.createLinearGradient(36, 36, width - 72, 180);
      headerGrad.addColorStop(0, '#0369a1');
      headerGrad.addColorStop(1, '#1e40af');
      ctx.fillStyle = headerGrad;
      if (ctx.roundRect) {
        ctx.roundRect(36, 36, width - 72, 160, 16);
        ctx.fill();
      } else {
        ctx.fillRect(36, 36, width - 72, 160);
      }

      // School Title
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('مدرسة جذور النموذجية الخاصة - قطاع غزة', width / 2, 85);

      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#bae6fd';
      ctx.fillText('إشعار تحويل وسداد قسط مدرسي إلكتروني', width / 2, 120);

      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#fde047';
      ctx.fillText('⏳ الحالة: قيد مراجعة واعتماد شؤون الطلاب (Staff)', width / 2, 155);

      // Main Details Container
      ctx.fillStyle = '#091624';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      if (ctx.roundRect) {
        ctx.roundRect(36, 220, width - 72, 540, 16);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(36, 220, width - 72, 540);
        ctx.strokeRect(36, 220, width - 72, 540);
      }

      // Details Rows
      const startY = 275;
      const lineGap = 68;

      const drawRow = (label, value, y, valColor = '#ffffff', isBold = false) => {
        ctx.textAlign = 'right';
        ctx.font = 'bold 17px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(label, width - 65, y);

        ctx.textAlign = 'left';
        ctx.font = `${isBold ? 'bold ' : ''}19px sans-serif`;
        ctx.fillStyle = valColor;
        ctx.fillText(value, 65, y);

        // Separator
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(55, y + 22);
        ctx.lineTo(width - 55, y + 22);
        ctx.stroke();
      };

      drawRow('اسم الطالب المستفيد:', `${submittedReceipt.studentName} (${submittedReceipt.studentNumber})`, startY, '#38bdf8', true);
      drawRow('المبلغ المحول:', `${submittedReceipt.amount} شيكل (₪)`, startY + lineGap, '#34d399', true);
      drawRow('وسيلة / قناة التحويل:', getMethodTitle(submittedReceipt.method), startY + lineGap * 2, '#ffffff');
      drawRow('اسم الشخص الدافع:', submittedReceipt.payerName || 'ولي الأمر', startY + lineGap * 3, '#ffffff');
      drawRow('رقم الإشعار / العملية (Ref):', submittedReceipt.transactionRef || '—', startY + lineGap * 4, '#fbbf24', true);
      drawRow('تاريخ ووقت الإرسال:', new Date(submittedReceipt.date || Date.now()).toLocaleString('ar-EG'), startY + lineGap * 5, '#cbd5e1');
      drawRow('هاتف المتابعة / واتساب:', submittedReceipt.payerPhone || '0594787703', startY + lineGap * 6, '#ffffff');

      // Footer notice
      ctx.textAlign = 'center';
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('هذه الوثيقة صادرة إلكترونياً وتعتبر إشعار إيداع مؤقت بانتظار إصدار سند القبض المالي الرسمي.', width / 2, 800);

      ctx.font = 'bold 13.5px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('قسم شؤون الطلاب والتسجيل - مدرسة جذور النموذجية الخاصة | هاتف: 0594787703', width / 2, 830);

      // Verified stamp box
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      if (ctx.roundRect) {
        ctx.roundRect(width / 2 - 170, 870, 340, 52, 10);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(width / 2 - 170, 870, 340, 52);
        ctx.strokeRect(width / 2 - 170, 870, 340, 52);
      }

      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#10b981';
      ctx.fillText('✓ تم توثيق الإشعار بنجاح في المنظومة', width / 2, 903);

      // Trigger download
      const link = document.createElement('a');
      link.download = `AlNoor-Payment-Notice-${submittedReceipt.transactionRef || Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success(isRtl ? 'تم تنزيل وحفظ بطاقة الإشعار بنجاح! 📥' : 'Payment notice card downloaded!');
    } catch (err) {
      console.error('Download error:', err);
      toast.error(isRtl ? 'حدث خطأ أثناء تنزيل الصورة' : 'Failed to download card');
    }
  };

  const handlePrintNotice = () => {
    window.print();
  };

  const getMethodTitle = (m) => {
    switch (m) {
      case 'BANK_OF_PALESTINE': return isRtl ? 'بنك فلسطين (Bank of Palestine / Banki)' : 'Bank of Palestine';
      case 'JAWWAL_PAY': return isRtl ? 'محفظة جوال باي (Jawwal Pay)' : 'Jawwal Pay';
      case 'PALPAY': return isRtl ? 'محفظة بال باي (PalPay)' : 'PalPay';
      default: return m;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #090d16 0%, #0f172a 50%, #090d16 100%)',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      direction: isRtl ? 'rtl' : 'ltr',
      padding: '16px 12px 60px',
      boxSizing: 'border-box'
    }}>
      <style>{`
        .portal-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .portal-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        @media (max-width: 860px) {
          .portal-grid-3 {
            grid-template-columns: 1fr;
            gap: 14px;
          }
        }
        @media (max-width: 640px) {
          .portal-form-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .portal-form-full {
            grid-column: span 1 !important;
          }
          .portal-header-title {
            font-size: 20px !important;
          }
          .portal-card-padding {
            padding: 16px !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* Top Navbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          padding: '12px 18px',
          background: 'rgba(30, 41, 59, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SchoolLogo size={36} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#ffffff' }}>
                {isRtl ? 'مدرسة جذور النموذجية الخاصة - قطاع غزة' : 'Judhoor Model Private School - Gaza'}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <PalestineFlagIcon width={16} height={11} />
                <span>{isRtl ? 'بوابة أولياء الأمور لتسديد الأقساط والرسوم' : 'Parent Tuition & Payment Portal'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {onExitToSchool && (
              <button
                type="button"
                onClick={onExitToSchool}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>👔</span>
                <span>{isRtl ? 'دخول الكادر الإداري' : 'Staff Login'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #0369a1 0%, #1e40af 100%)',
          borderRadius: '20px',
          padding: '24px 20px',
          boxShadow: '0 15px 30px -10px rgba(3, 105, 161, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: 12,
            fontWeight: 800,
            marginBottom: 10
          }}>
            <span>🇵🇸</span>
            <span>{isRtl ? 'حسابات ومحافظ الأستاذ يوسف عبداللطيف خلف المعتمدة' : 'Official Accounts of Yousef A. Khalaf'}</span>
          </div>
          <h1 className="portal-header-title" style={{ fontSize: 24, fontWeight: 900, margin: '0 0 6px 0', color: '#ffffff' }}>
            {isRtl ? 'تسديد الأقساط المدرسية وإرسال الإشعار المالي' : 'School Fee Payment & Notice Portal'}
          </h1>
          <p style={{ margin: 0, fontSize: 13.5, opacity: 0.95, maxWidth: '640px', lineHeight: 1.5 }}>
            {isRtl
              ? 'يمكنكم الاستعلام المباشر عن المبلغ المتبقي على الطالب، والتحويل عبر بنك فلسطين، جوال باي، أو بال باي، ثم تأكيد رقم العملية لتوثيق السند فوراً.'
              : 'Direct tuition lookup and instant payment confirmation for Al-Noor School.'}
          </p>
        </div>

        {/* Step 1: Official Payment Accounts Cards */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>💳</span>
              <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#ffffff' }}>
                {isRtl ? '1. الحسابات والمحافظ الرسمية المعتمدة للتحويل:' : '1. Official Payment Accounts for Transfer:'}
              </h2>
            </div>
            <span style={{ fontSize: 11, color: '#38bdf8', fontWeight: 700 }}>
              {isRtl ? 'اضغط لنسخ الرقم أو مسح الرمز' : 'Click to copy or view QR'}
            </span>
          </div>

          <div className="portal-grid-3">
            
            {/* Account 1: Bank of Palestine */}
            <div style={{
              background: 'linear-gradient(180deg, #0c4a6e 0%, #082f49 100%)',
              border: '1.5px solid #0284c7',
              borderRadius: '16px',
              padding: '18px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 14
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 22 }}>🏦</span>
                    <span style={{ fontWeight: 900, fontSize: 15, color: '#38bdf8' }}>
                      {isRtl ? 'بنك فلسطين' : 'Bank of Palestine'}
                    </span>
                  </div>
                  <span style={{ background: '#0369a1', color: '#e0f2fe', fontSize: 10.5, fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>
                    Banki تطبيق بنكي
                  </span>
                </div>

                <div style={{ fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 6, color: '#e0f2fe' }}>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: 11, display: 'block' }}>{isRtl ? 'اسم المستفيد:' : 'Beneficiary:'}</span>
                    <strong style={{ fontSize: 14, color: '#ffffff' }}>يوسف عبداللطيف خلف</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: 11, display: 'block' }}>{isRtl ? 'رقم الجوال / الحساب للتحويل:' : 'Mobile / Account Number:'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <code style={{ background: '#031c2d', color: '#38bdf8', padding: '4px 10px', borderRadius: 6, fontSize: 15, fontWeight: 900, letterSpacing: 1 }}>
                        0594787703
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy('0594787703', 'bop')}
                        style={{
                          background: copiedKey === 'bop' ? '#10b981' : '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        {copiedKey === 'bop' ? (isRtl ? '✓ تم النسخ' : 'Copied') : (isRtl ? '📋 نسخ' : 'Copy')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(56, 189, 248, 0.2)', paddingTop: 10 }}>
                <span style={{ fontSize: 11, color: '#bae6fd' }}>
                  {isRtl ? 'تحويل فوري من تطبيق بنكي' : 'Instant Banki transfer'}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveQrModal('BOP')}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    color: '#38bdf8',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  📱 رمز QR
                </button>
              </div>
            </div>

            {/* Account 2: Jawwal Pay */}
            <div style={{
              background: 'linear-gradient(180deg, #431407 0%, #270d05 100%)',
              border: '1.5px solid #ea580c',
              borderRadius: '16px',
              padding: '18px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 14
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 22 }}>📱</span>
                    <span style={{ fontWeight: 900, fontSize: 15, color: '#fb923c' }}>
                      {isRtl ? 'جوال باي (Jawwal Pay)' : 'Jawwal Pay'}
                    </span>
                  </div>
                  <span style={{ background: '#9a3412', color: '#ffedd5', fontSize: 10.5, fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>
                    محفظة إلكترونية
                  </span>
                </div>

                <div style={{ fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 6, color: '#ffedd5' }}>
                  <div>
                    <span style={{ color: '#fdba74', fontSize: 11, display: 'block' }}>{isRtl ? 'اسم صاحب المحفظة:' : 'Owner:'}</span>
                    <strong style={{ fontSize: 14, color: '#ffffff' }}>يوسف عبداللطيف خلف</strong>
                  </div>
                  <div>
                    <span style={{ color: '#fdba74', fontSize: 11, display: 'block' }}>{isRtl ? 'رقم محفظة التحويل:' : 'Jawwal Pay Phone:'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <code style={{ background: '#1c0803', color: '#fb923c', padding: '4px 10px', borderRadius: 6, fontSize: 15, fontWeight: 900, letterSpacing: 1 }}>
                        0594787703
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy('0594787703', 'jp')}
                        style={{
                          background: copiedKey === 'jp' ? '#10b981' : '#ea580c',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        {copiedKey === 'jp' ? (isRtl ? '✓ تم النسخ' : 'Copied') : (isRtl ? '📋 نسخ' : 'Copy')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(251, 146, 60, 0.2)', paddingTop: 10 }}>
                <span style={{ fontSize: 11, color: '#fed7aa' }}>
                  {isRtl ? 'تحويل فوري بدون عمولة' : '0-fee instant wallet'}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveQrModal('JAWWAL')}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(251, 146, 60, 0.4)',
                    color: '#fb923c',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  📱 رمز QR
                </button>
              </div>
            </div>

            {/* Account 3: PalPay */}
            <div style={{
              background: 'linear-gradient(180deg, #2e1065 0%, #190637 100%)',
              border: '1.5px solid #9333ea',
              borderRadius: '16px',
              padding: '18px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 14
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 22 }}>💳</span>
                    <span style={{ fontWeight: 900, fontSize: 15, color: '#c084fc' }}>
                      {isRtl ? 'بال باي (PalPay)' : 'PalPay Wallet'}
                    </span>
                  </div>
                  <span style={{ background: '#581c87', color: '#f3e8ff', fontSize: 10.5, fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>
                    نقاط ومحفظة
                  </span>
                </div>

                <div style={{ fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 6, color: '#f3e8ff' }}>
                  <div>
                    <span style={{ color: '#d8b4fe', fontSize: 11, display: 'block' }}>{isRtl ? 'اسم صاحب الحساب:' : 'Owner:'}</span>
                    <strong style={{ fontSize: 14, color: '#ffffff' }}>يوسف عبداللطيف خلف</strong>
                  </div>
                  <div>
                    <span style={{ color: '#d8b4fe', fontSize: 11, display: 'block' }}>{isRtl ? 'رقم المحفظة / الفاتورة:' : 'Account ID:'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <code style={{ background: '#130424', color: '#c084fc', padding: '4px 10px', borderRadius: 6, fontSize: 15, fontWeight: 900, letterSpacing: 1 }}>
                        0567036492
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy('0567036492', 'palpay')}
                        style={{
                          background: copiedKey === 'palpay' ? '#10b981' : '#9333ea',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        {copiedKey === 'palpay' ? (isRtl ? '✓ تم النسخ' : 'Copied') : (isRtl ? '📋 نسخ' : 'Copy')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(192, 132, 252, 0.2)', paddingTop: 10 }}>
                <span style={{ fontSize: 11, color: '#e9d5ff' }}>
                  {isRtl ? 'متاح بكافة نقاط ومحفظة بال باي' : 'Available across PalPay agents'}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveQrModal('PALPAY')}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(192, 132, 252, 0.4)',
                    color: '#c084fc',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  📱 رمز QR
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Step 2: Student Lookup & Fee Verification */}
        <div style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '18px',
          padding: '20px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>🔍</span>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: '#ffffff' }}>
              {isRtl ? '2. استعلام مباشر عن رصيد الطالب والمبلغ المستحق:' : '2. Student Balance & Tuition Dues:'}
            </h3>
          </div>

          <form onSubmit={handleSearchStudent} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder={isRtl ? 'ابحث باسم الطالب أو رقم القيد (مثال: محمد أو STU-2026-001)...' : 'Search student by name or ID...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                minWidth: '220px',
                background: '#0f172a',
                border: '1px solid #475569',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#ffffff',
                fontSize: 13.5,
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={searching}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 18px',
                fontWeight: 800,
                fontSize: 13.5,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {searching ? (isRtl ? 'جاري البحث...' : 'Searching...') : (isRtl ? 'استعلام 🔍' : 'Check')}
            </button>
          </form>

          {/* Student details display card */}
          {foundStudent && (
            <div style={{
              marginTop: 16,
              background: '#0f172a',
              border: '1.5px solid #0284c7',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 14
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 900, fontSize: 15, color: '#ffffff' }}>
                    {foundStudent.firstName} {foundStudent.lastName}
                  </span>
                  <span style={{ background: '#0284c7', color: '#ffffff', fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                    {foundStudent.currentClass || 'الصف السابع'}
                  </span>
                  <code style={{ color: '#94a3b8', fontSize: 12 }}>
                    ({foundStudent.studentNumber})
                  </code>
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  {isRtl ? 'ولي الأمر:' : 'Guardian:'} {foundStudent.parentName || '—'} {foundStudent.parentPhone ? `(${foundStudent.parentPhone})` : ''}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center', background: '#1e293b', padding: '6px 12px', borderRadius: 8, border: '1px solid #334155' }}>
                  <span style={{ fontSize: 10, color: '#94a3b8', display: 'block' }}>{isRtl ? 'المقرر' : 'Fee'}</span>
                  <strong style={{ fontSize: 13, color: '#ffffff' }}>₪{studentFee?.totalAmount || 850}</strong>
                </div>
                <div style={{ textAlign: 'center', background: '#1e293b', padding: '6px 12px', borderRadius: 8, border: '1px solid #334155' }}>
                  <span style={{ fontSize: 10, color: '#34d399', display: 'block' }}>{isRtl ? 'المدفوع' : 'Paid'}</span>
                  <strong style={{ fontSize: 13, color: '#34d399' }}>₪{studentFee?.paidAmount || 0}</strong>
                </div>
                <div style={{ textAlign: 'center', background: '#450a0a', padding: '6px 14px', borderRadius: 8, border: '1px solid #dc2626' }}>
                  <span style={{ fontSize: 10, color: '#f87171', display: 'block' }}>{isRtl ? 'المتبقي' : 'Due'}</span>
                  <strong style={{ fontSize: 15, color: '#f87171', fontWeight: 900 }}>₪{studentFee?.remainingBalance !== undefined ? studentFee.remainingBalance : 850}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Payment Notice Form */}
        <div style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '18px',
          padding: '20px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>📝</span>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: '#ffffff' }}>
              {isRtl ? '3. تأكيد وإرسال إشعار التحويل المالي للمدرسة:' : '3. Submit Transfer Details & Payment Notice:'}
            </h3>
          </div>
          <p style={{ fontSize: 12.5, color: '#94a3b8', margin: '0 0 16px 0' }}>
            {isRtl
              ? 'بعد إتمام الحوالة عبر التطبيق، يرجى تزويدنا برقم العملية/الإشعار ليتم تقييد السند الإلكتروني بحساب الطالب فوراً.'
              : 'Enter transfer reference to generate and document your digital proof receipt.'}
          </p>

          {submittedReceipt ? (
            <div style={{
              background: 'linear-gradient(135deg, #0f2c42 0%, #064e3b 100%)',
              border: '2px solid #38bdf8',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              color: '#f0fdf4',
              boxShadow: '0 12px 30px rgba(0,0,0,0.3)'
            }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>⏳</div>
              <h3 style={{ fontSize: 19, fontWeight: 900, margin: '0 0 6px 0', color: '#ffffff' }}>
                {isRtl ? 'تم إرسال إشعار التحويل بنجاح!' : 'Payment Notice Submitted Successfully!'}
              </h3>
              <p style={{ margin: '0 0 16px 0', fontSize: 13.5, color: '#bae6fd', maxWidth: '560px', marginInline: 'auto' }}>
                {isRtl
                  ? `تم استلام بيانات الحوالة الخاصة بالطالب (${submittedReceipt.studentName}) بمبلغ ₪${submittedReceipt.amount}. الإشعار الآن قيد المراجعة والمطابقة من موظف شؤون الطلاب (Staff) لاعتماد السند رسمياً.`
                  : `Payment notice received for ${submittedReceipt.studentName}. Staff is reviewing your transfer for final receipt issuance.`}
              </p>

              {/* Digital Proof Voucher */}
              <div style={{
                background: '#091624',
                border: '1.5px dashed #38bdf8',
                borderRadius: '12px',
                padding: '16px 20px',
                margin: '0 auto 18px auto',
                maxWidth: '460px',
                fontSize: 13,
                textAlign: isRtl ? 'right' : 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: 6 }}>
                  <span style={{ color: '#94a3b8' }}>{isRtl ? 'حالة الطلب:' : 'Notice Status:'}</span>
                  <span style={{ background: '#0284c7', color: '#ffffff', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800 }}>
                    {isRtl ? '⏳ قيد المراجعة والاعتماد من الـ Staff' : '⏳ Pending Staff Approval'}
                  </span>
                </div>
                <div><strong>{isRtl ? 'اسم الطالب:' : 'Student:'}</strong> <span style={{ color: '#ffffff', fontWeight: 800 }}>{submittedReceipt.studentName}</span> <code style={{ color: '#94a3b8', fontSize: 11 }}>({submittedReceipt.studentNumber})</code></div>
                <div><strong>{isRtl ? 'المبلغ المحول:' : 'Amount:'}</strong> <span style={{ color: '#34d399', fontWeight: 900, fontSize: 16 }}>₪{submittedReceipt.amount}</span></div>
                <div><strong>{isRtl ? 'وسيلة التحويل:' : 'Method:'}</strong> {getMethodTitle(submittedReceipt.method)}</div>
                <div><strong>{isRtl ? 'اسم المسدد:' : 'Payer:'}</strong> {submittedReceipt.payerName}</div>
                <div><strong>{isRtl ? 'رقم الإشعار / العملية:' : 'Reference:'}</strong> <code style={{ color: '#38bdf8', fontWeight: 900, fontSize: 14 }}>{submittedReceipt.transactionRef}</code></div>
                <div><strong>{isRtl ? 'تاريخ وساعة الإرسال:' : 'Submitted At:'}</strong> <span style={{ color: '#cbd5e1' }}>{new Date().toLocaleString()}</span></div>
              </div>

              {/* Action Buttons: Download Card, Print, WhatsApp & New Notice */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 6 }}>
                <button
                  type="button"
                  onClick={handleDownloadNoticeImage}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
                  }}
                  title={isRtl ? 'تحميل صورة بطاقة الإشعار للاحتفاظ بها أو إرسالها' : 'Download Notice Image'}
                >
                  <span>📥</span> {isRtl ? 'تنزيل وحفظ بطاقة الإشعار' : 'Download Notice Card'}
                </button>

                <a
                  href={`https://wa.me/970594787703?text=${encodeURIComponent(`السلام عليكم، قمت بإرسال إشعار تحويل قسط مدرسي للطالب: ${submittedReceipt.studentName} (رقم القيد: ${submittedReceipt.studentNumber})، بمبلغ: ${submittedReceipt.amount} شيكل، عبر ${getMethodTitle(submittedReceipt.method)}، برقم العملية: ${submittedReceipt.transactionRef}. يرجى التكرم بالمطابقة والاعتماد.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#25D366',
                    color: '#ffffff',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: 13,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
                  }}
                >
                  <span>💬</span> {isRtl ? 'مشاركة عبر واتساب' : 'WhatsApp'}
                </a>

                <button
                  type="button"
                  onClick={handlePrintNotice}
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span>🖨️</span> {isRtl ? 'طباعة' : 'Print'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSubmittedReceipt(null);
                    setTransactionRef('');
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: '#cbd5e1',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  {isRtl ? 'تسجيل إشعار دفعة أخرى' : 'Submit Another'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitProof} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="portal-form-grid">
                
                {/* Student Number */}
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#cbd5e1', marginBottom: 4 }}>
                    {isRtl ? 'رقم قيد الطالب *' : 'Student Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="STU-2026-001"
                    value={studentNumber}
                    onChange={(e) => setStudentNumber(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#0f172a',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Student Name */}
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#cbd5e1', marginBottom: 4 }}>
                    {isRtl ? 'اسم الطالب رباعي *' : 'Student Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isRtl ? 'اسم الطالب' : 'Student full name'}
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#0f172a',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Payer Name */}
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#cbd5e1', marginBottom: 4 }}>
                    {isRtl ? 'اسم ولي الأمر / المحول *' : 'Payer Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isRtl ? 'اسم المحول' : 'Sender full name'}
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#0f172a',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Payer Phone */}
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#cbd5e1', marginBottom: 4 }}>
                    {isRtl ? 'رقم هاتف ولي الأمر للتأكيد *' : 'Phone Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="059xxxxxxx"
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#0f172a',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Amount with Quick Selection Pills */}
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#cbd5e1', marginBottom: 4 }}>
                    {isRtl ? 'المبلغ المحول (₪ شيكل) *' : 'Amount (ILS) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="250"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#0f172a',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: 13.5,
                      fontWeight: 800,
                      boxSizing: 'border-box'
                    }}
                  />
                  {/* Preset Pills */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                    {['100', '200', '300', '500'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAmount(p)}
                        style={{
                          background: amount === p ? '#0284c7' : '#334155',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 4,
                          padding: '2px 8px',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        ₪{p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Method */}
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#cbd5e1', marginBottom: 4 }}>
                    {isRtl ? 'قناة التحويل المستخدمة *' : 'Payment Channel *'}
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#0f172a',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="BANK_OF_PALESTINE">{isRtl ? '🏦 بنك فلسطين (0594787703)' : 'Bank of Palestine (0594787703)'}</option>
                    <option value="JAWWAL_PAY">{isRtl ? '📱 جوال باي Jawwal Pay (0594787703)' : 'Jawwal Pay (0594787703)'}</option>
                    <option value="PALPAY">{isRtl ? '💳 بال باي PalPay (0567036492)' : 'PalPay (0567036492)'}</option>
                  </select>
                </div>

                {/* Transaction Ref */}
                <div className="portal-form-full" style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#38bdf8', marginBottom: 4 }}>
                    {isRtl ? 'رقم الحوالة / العملية / المرجع في الإشعار *' : 'Transfer Ref / Transaction ID *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isRtl ? 'مثال: TXN-9847291 أو رقم الحوالة في رسالة الـ SMS / التطبيق' : 'e.g. TXN-9847291'}
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#082f49',
                      border: '1px solid #0284c7',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#38bdf8',
                      fontSize: 13.5,
                      fontWeight: 800,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    maxWidth: '320px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 20px',
                    fontSize: 14.5,
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  {submitting ? (isRtl ? 'جاري الإرسال والتوثيق...' : 'Submitting...') : (isRtl ? 'تأكيد وإرسال إشعار الدفعة للمدرسة 📤' : 'Submit Payment Notice')}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <div style={{ textAlign: 'center', fontSize: 11.5, color: '#64748b', marginTop: 6 }}>
          {isRtl
            ? 'نظام إدارة وتحصيل الرسوم المدرسية الإلكتروني - مدرسة جذور النموذجية الخاصة - قطاع غزة 🇵🇸'
            : 'Judhoor Model Private School Management & Fee Collection - Gaza 🇵🇸'}
        </div>

      </div>

      {/* QR Code Modal */}
      {activeQrModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16
          }}
          onClick={() => setActiveQrModal(null)}
        >
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '18px',
              padding: '24px',
              maxWidth: '340px',
              width: '100%',
              textAlign: 'center',
              color: '#ffffff'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px 0' }}>
              {activeQrModal === 'BOP' ? '🏦 بنك فلسطين' : activeQrModal === 'JAWWAL' ? '📱 جوال باي' : '💳 بال باي'}
            </h3>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 16px 0' }}>
              {isRtl ? 'امسح الرمز أو انسخ الرقم للتحويل السريع' : 'Scan QR or copy number'}
            </p>

            {/* Visual Clean QR Canvas Placeholder */}
            <div style={{
              background: '#ffffff',
              padding: '16px',
              borderRadius: '12px',
              display: 'inline-block',
              marginBottom: 16
            }}>
              <svg width="160" height="160" viewBox="0 0 100 100" fill="#0f172a">
                <rect x="5" y="5" width="25" height="25" fill="#0f172a" />
                <rect x="10" y="10" width="15" height="15" fill="#ffffff" />
                <rect x="13" y="13" width="9" height="9" fill="#0f172a" />
                <rect x="70" y="5" width="25" height="25" fill="#0f172a" />
                <rect x="75" y="10" width="15" height="15" fill="#ffffff" />
                <rect x="78" y="13" width="9" height="9" fill="#0f172a" />
                <rect x="5" y="70" width="25" height="25" fill="#0f172a" />
                <rect x="10" y="75" width="15" height="15" fill="#ffffff" />
                <rect x="13" y="78" width="9" height="9" fill="#0f172a" />
                <rect x="35" y="10" width="10" height="10" />
                <rect x="50" y="15" width="15" height="10" />
                <rect x="35" y="35" width="30" height="30" />
                <rect x="42" y="42" width="16" height="16" fill="#ffffff" />
                <rect x="75" y="40" width="15" height="15" />
                <rect x="40" y="75" width="20" height="20" />
                <rect x="70" y="70" width="20" height="20" />
              </svg>
            </div>

            <div style={{ background: '#0f172a', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 800 }}>
              <div style={{ color: '#94a3b8', fontSize: 11 }}>{isRtl ? 'المستفيد: يوسف عبداللطيف خلف' : 'Beneficiary: Yousef A. Khalaf'}</div>
              <code style={{ color: '#38bdf8', fontSize: 16 }}>
                {activeQrModal === 'PALPAY' ? '0567036492' : '0594787703'}
              </code>
            </div>

            <div style={{ marginTop: 16 }}>
              <button
                type="button"
                onClick={() => setActiveQrModal(null)}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                {isRtl ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
