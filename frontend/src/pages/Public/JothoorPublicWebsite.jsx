import React, { useState } from 'react';
import SchoolLogo from '../../components/common/SchoolLogo';
import { PalestineFlagIcon } from '../../components/common/Icons';
import { useSchoolConfig } from '../../context/SchoolConfigContext';
import { useToast } from '../../context/ToastContext';

export default function JothoorPublicWebsite({
  onNavigateToLogin,
  onNavigateToInquiry,
  onNavigateToFees
}) {
  const { config } = useSchoolConfig();
  const toast = useToast();

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerSuccessData, setRegisterSuccessData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State for new student registration (20 NIS Seat Reservation)
  const [formData, setFormData] = useState({
    studentFullName: '',
    nationalId: '',
    dateOfBirth: '',
    gender: 'MALE',
    gradeLevel: 'Grade 1 (الصف الأول الأساسي)',
    previousSchool: '',
    studentPhoto: '',
    parentFullName: '',
    relationship: 'الأب',
    parentPhone: '',
    parentWhatsapp: '',
    cityArea: 'غزة / فلسطين',
    fullAddress: '',
    // 20 NIS Payment Verification
    senderName: '',
    paymentMethod: 'Jawwal Pay (جوال باي)',
    referenceNumber: '',
    receiptImage: '',
    notes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.warning('حجم الملف كبير جداً. يرجى اختيار صورة أقل من 5 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFormData((prev) => ({ ...prev, [field]: uploadEvent.target.result }));
      toast.success(field === 'receiptImage' ? 'تم إرفاق إشعار التحويل بنجاح 📎' : 'تم تحميل الصورة الشخصية للطالب');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitRegistration = (e) => {
    e.preventDefault();

    if (!formData.studentFullName.trim()) {
      toast.error('يرجى إدخال اسم الطالب الرباعي');
      return;
    }
    if (!formData.parentPhone.trim()) {
      toast.error('يرجى إدخال رقم هاتف ولي الأمر للتواصل');
      return;
    }
    if (!formData.senderName.trim() || !formData.referenceNumber.trim()) {
      toast.error('يرجى استكمال بيانات التحويل المالي (20 شيكل): اسم المحوّل والرقم المرجعي');
      return;
    }

    setSubmitting(true);

    try {
      const regId = `JOTHOOR-REG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const submissionDate = new Date().toISOString();

      const newRegistration = {
        id: Date.now(),
        registrationNumber: regId,
        submissionDate,
        status: 'PENDING_APPROVAL', // PENDING_APPROVAL -> APPROVED & ENROLLED
        feeAmount: 20,
        currency: 'NIS',
        ...formData
      };

      // Save to localStorage so admin/staff can immediately inspect and approve
      const existing = JSON.parse(localStorage.getItem('jothoor_online_registrations') || '[]');
      existing.unshift(newRegistration);
      localStorage.setItem('jothoor_online_registrations', JSON.stringify(existing));

      // Trigger update event across tabs/windows
      window.dispatchEvent(new CustomEvent('new_student_registration', { detail: newRegistration }));

      setRegisterSuccessData(newRegistration);
      setIsRegisterModalOpen(false);
      toast.success(`تم استلام طلب حجز المقعد بنجاح! رقم الطلب: ${regId}`);
    } catch (err) {
      toast.error('حدث خطأ أثناء حفظ الطلب. يرجى المحاولة ثانية.');
    } finally {
      setSubmitting(false);
    }
  };

  const schoolGalleryImages = [
    {
      title: 'الصفوف النموذجية الذكية',
      desc: 'قاعات دراسية مجهزة بشاشات تفاعلية ووسائل تعليمية متطورة لتنمية مهارات التفكير.',
      icon: '🖥️',
      color: '#3b82f6',
      badge: 'فصول ذكية'
    },
    {
      title: 'المختبرات العلمية والتكنولوجية',
      desc: 'مختبرات علوم وحاسوب متقدمة وروبوتات لاكتشاف المواهب العلمية وتطبيق التجارب عملياً.',
      icon: '🔬',
      color: '#10b981',
      badge: 'تجارب وروبوتات'
    },
    {
      title: 'مرحلة رياض الأطفال والتأسيس',
      desc: 'بيئة مرحة ومحفزة للأطفال بأحدث أساليب المنتسوري والتعلم باللعب وغرس الأخلاق.',
      icon: '🎨',
      color: '#f59e0b',
      badge: 'تأسيس نموذجي'
    },
    {
      title: 'الأنشطة الرياضية والكشفية',
      desc: 'ملاعب ومساحات آمنة تعزز اللياقة البدنية وروح الفريق والمنافسة الشريفة بين الطلاب.',
      icon: '⚽',
      color: '#8b5cf6',
      badge: 'لياقة وأنشطة'
    },
    {
      title: 'مهرجانات تكريم أوائل الطلبة',
      desc: 'احتفاء دائم بالمتفوقين ورعاية الموهوبين بشهادات وجوائز تقديرية رفيعة المستوى.',
      icon: '🏆',
      color: '#ec4899',
      badge: 'تفوق واعتزاز'
    },
    {
      title: 'الإرشاد التربوي والمتابعة الفردية',
      desc: 'كوادر إرشادية متخصصة تهتم بالجانب النفسي وبناء الشخصية القيادية المتوازنة.',
      icon: '🌱',
      color: '#06b6d4',
      badge: 'رعاية شاملة'
    }
  ];

  const schoolPhotoShowcase = [
    {
      title: 'الفصول الدراسية والتفاعل الصفي الذكي',
      category: 'بيئة تعليمية نموذجية',
      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
      description: 'فصول نموذجية حديثة مجهزة بأحدث الوسائل التفاعلية لتقديم تجربة تعليمية ممتعة ومحفزة للطلاب.'
    },
    {
      title: 'مختبرات العلوم والتجارب المباشرة',
      category: 'استكشاف وابتكار علمي',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
      description: 'تطبيق عملي للمفاهيم العلمية وتجارب مخبرية ترسخ الفهم النظري وتنمي روح البحث والاستكشاف.'
    },
    {
      title: 'الروبوتات والذكاء الاصطناعي والبرمجة',
      category: 'تكنولوجيا المستقبل (STEM)',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
      description: 'تمكين أطفالنا وشبابنا من مهارات العصر وبناء نماذج روبوت ذكية تؤهلهم للمسابقات المحلية والدولية.'
    },
    {
      title: 'مرحلة رياض الأطفال والتأسيس الإبداعي',
      category: 'براعم جذور الغالية',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
      description: 'أجواء مبهجة وآمنة للأطفال الصغار تركز على التعلم النشط وتنمية الخيال والمشاعر الإيجابية.'
    },
    {
      title: 'احتفالات تكريم أوائل الطلبة والمتفوقين',
      category: 'حصاد الجد والاجتهاد',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
      description: 'تقدير دائم لجهود أبنائنا وبناتنا الأوائل وتكريمهم بحضور أولياء الأمور والهيئة التدريسية والإدارية.'
    },
    {
      title: 'الأنشطة الرياضية والكشفية وروح الفريق',
      category: 'طاقة، صحة، وانتماء',
      image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
      description: 'مساحات لممارسة الألعاب الجماعية والمسابقات التي تصقل اللياقة البدنية وتغرس العمل الجماعي.'
    }
  ];

  return (
    <div className="jothoor-public-root" dir="rtl" style={{ fontFamily: "'Cairo', 'Segoe UI', system-ui, sans-serif", background: '#f8fafc', color: '#1e293b' }}>
      
      {/* 1. National Palestinian Solidarity Header */}
      <div style={{ background: '#090d16', color: '#cbd5e1', padding: '8px 16px', fontSize: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PalestineFlagIcon size={18} />
            <span style={{ fontWeight: 700, color: '#f8fafc' }}>دولة فلسطين — وزارة التربية والتعليم العالي</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span>مدرسة وجذور النموذجية الخاصة — صرح تعليمي ريادي فلسطيني</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <a
              href="https://www.facebook.com/jothoorschoolps"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}
            >
              <span>🌐</span> صفحتنا الرسمية على فيسبوك
            </a>
            <span style={{ opacity: 0.4 }}>•</span>
            <a
              href="https://wa.me/970567088815"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#34d399', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700 }}
            >
              <span>💬</span> واتساب: +970 567 088 815
            </a>
          </div>
        </div>
      </div>

      {/* 2. Top Interactive Action Hub (Header Navigation) */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1.5px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 4px 20px -2px rgba(0,0,0,0.06)'
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          
          {/* Brand Logo & Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SchoolLogo size={52} />
            </div>
            <div>
              <h1 style={{ fontSize: '19px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
                مدرسة جذور النموذجية الخاصة
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                Jothoor Model Private School — جذورٌ أصيلة.. تعليمٌ نموذجي
              </p>
            </div>
          </div>

          {/* Quick Action Hub Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            
            {/* 1. Register & Reserve Seat (20 NIS) */}
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '9px 16px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>🎓</span>
              <span>تسجيل طالب جديد (حجز مقعد 20ش)</span>
              <span style={{ background: 'rgba(255,255,255,0.25)', padding: '2px 6px', borderRadius: 8, fontSize: '11px' }}>20 ₪</span>
            </button>

            {/* 2. Pay Tuition Fees */}
            <button
              onClick={onNavigateToFees}
              style={{
                background: '#f8fafc',
                color: '#0284c7',
                border: '1.5px solid #bae6fd',
                padding: '9px 14px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>💳</span>
              <span>تسديد الرسوم والأقساط</span>
            </button>

            {/* 3. Parent Student Inquiry */}
            <button
              onClick={onNavigateToInquiry}
              style={{
                background: '#f8fafc',
                color: '#6366f1',
                border: '1.5px solid #c7d2fe',
                padding: '9px 14px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>🔍</span>
              <span>استعلام ولي الأمر</span>
            </button>

            {/* 4. Staff / Teacher System Login */}
            <button
              onClick={onNavigateToLogin}
              style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: '#ffffff',
                border: '1px solid #334155',
                padding: '9px 16px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
              }}
            >
              <span>🔐</span>
              <span>دخول الكادر والإدارة</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Hero Section (Rich Aesthetics & Slogan) */}
      <section style={{
        background: 'linear-gradient(135deg, #090e1a 0%, #0f172a 50%, #1e1b4b 100%)',
        color: '#ffffff',
        padding: '64px 20px 80px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Ambient Glows */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 450, height: 450, background: 'rgba(79, 70, 229, 0.25)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 450, height: 450, background: 'rgba(14, 165, 233, 0.2)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1240, margin: '0 auto', position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, alignItems: 'center' }}>
          
          {/* Hero Left Content */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#a5b4fc',
              marginBottom: 18
            }}>
              <span>🌟</span>
              <span>فتح باب التسجيل وحجز المقاعد للعام الدراسي 2026/2027</span>
            </div>

            <h2 style={{ fontSize: '38px', fontWeight: 900, lineHeight: 1.25, letterSpacing: '-0.8px', margin: '0 0 16px', color: '#ffffff' }}>
              مدرسة جذور النموذجية الخاصة
            </h2>

            <p style={{ fontSize: '20px', fontWeight: 700, color: '#38bdf8', margin: '0 0 18px', lineHeight: 1.4 }}>
              "جذورٌ أصيلة.. تعليمٌ نموذجي.. وجيلٌ يبني المستقبل"
            </p>

            <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: 1.8, margin: '0 0 28px', maxWidth: 560 }}>
              نرحب بكم في الصرح التربوي الرائد الذي يجمع بين أصالة القيم الإسلامية والوطنية، وأحدث معايير التعليم العصري التفاعلي. نوفر لأبنائنا الطلبة بيئة آمنة ملهمة تحفز الإبداع وتصقل المواهب ليكونوا قادة الغد.
            </p>

            {/* Quick Hero CTA Buttons */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px 26px',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
                }}
              >
                <span>📝</span>
                <span>سجّل ابنك الآن واحجز مقعداً (20 شيكل)</span>
              </button>

              <button
                onClick={onNavigateToInquiry}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  padding: '14px 22px',
                  borderRadius: '14px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <span>🔍</span>
                <span>استعلام ولي الأمر عن الطالب</span>
              </button>
            </div>
          </div>

          {/* Hero Right Visual Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '24px',
            padding: '28px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SchoolLogo size={68} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, display: 'block' }}>منظومة جذور الذكية</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc' }}>التعليم النموذجي الشامل</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: 14, padding: 14, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#38bdf8' }}>100%</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>نسبة النجاح والتفوق الأكاديمي</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: 14, padding: 14, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#34d399' }}>20 ₪</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>رسوم رمزية لحجز المقعد المبدئي</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: 14, padding: 14, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#fbbf24' }}>24/7</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>متابعة إلكترونية فورية لولي الأمر</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: 14, padding: 14, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#a78bfa' }}>نخبة</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>كادر تعليمي وتربوي معتمد</div>
              </div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>📍 غزة - فلسطين</span>
              <a
                href="https://www.facebook.com/jothoorschoolps/photos"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#60a5fa', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
              >
                تصفح ألبومات المدرسة بالصور ←
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Registration Confirmation Success Modal (If submitted) */}
      {registerSuccessData && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: 520,
            width: '100%',
            padding: '30px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
            textAlign: 'center',
            border: '2px solid #10b981'
          }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ecfdf5', color: '#059669', fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              ✓
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
              تم استلام طلب التسجيل وحجز المقعد بنجاح!
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>
              شكراً لثقتكم بمدرسة جذور النموذجية الخاصة. تم تسجيل الطالب مبدئياً وحجز المقعد.
            </p>

            <div style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: 14, padding: 16, marginBottom: 20, textAlign: 'start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#64748b', fontSize: 12 }}>رقم الطلب المرجعي:</span>
                <strong style={{ color: '#4f46e5', fontSize: 13, direction: 'ltr' }}>{registerSuccessData.registrationNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#64748b', fontSize: 12 }}>اسم الطالب:</span>
                <strong style={{ color: '#0f172a', fontSize: 13 }}>{registerSuccessData.studentFullName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#64748b', fontSize: 12 }}>الصف المطلوب:</span>
                <strong style={{ color: '#0f172a', fontSize: 13 }}>{registerSuccessData.gradeLevel}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#64748b', fontSize: 12 }}>رسوم حجز المقعد:</span>
                <strong style={{ color: '#059669', fontSize: 13 }}>20 شيكل (مدفوعة ومرفقة بالإشعار)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: 12 }}>المحوّل والرقم المرجعي:</span>
                <strong style={{ color: '#0f172a', fontSize: 12 }}>{registerSuccessData.senderName} ({registerSuccessData.referenceNumber})</strong>
              </div>
            </div>

            <div style={{ background: '#eff6ff', borderRadius: 10, padding: 12, color: '#1e40af', fontSize: 12, lineHeight: 1.6, marginBottom: 20 }}>
              📢 <strong>الخطوة القادمة:</strong> سيقوم قسم شؤون الطلاب بتدقيق إشعار التحويل والتواصل معكم هاتفياً أو عبر الواتساب لتأكيد تثبيت القيد وتسكين الطالب في الشعبة الدراسية.
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => window.print()}
                style={{ flex: 1, padding: '10px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                🖨️ طباعة إشعار الحجز
              </button>
              <button
                onClick={() => setRegisterSuccessData(null)}
                style={{ flex: 1, padding: '10px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
              >
                تم، إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Online Registration & 20 NIS Seat Reservation Modal */}
      {isRegisterModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          overflowY: 'auto'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: 720,
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  طلب تسجيل طالب جديد وحجز مقعد (20 شيكل)
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b' }}>
                  مدرسة جذور النموذجية الخاصة — حجز المقعد الإلكتروني المعتمد
                </p>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', width: 34, height: 34, borderRadius: '50%', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {/* Condition Notice */}
            <div style={{
              background: '#ecfdf5',
              border: '1.5px solid #a7f3d0',
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <span style={{ fontSize: 26 }}>💡</span>
              <div style={{ fontSize: 12.5, color: '#065f46', lineHeight: 1.6 }}>
                <strong>شرط حجز المقعد الإلكتروني (20 شيكل):</strong> نظراً لمحدودية المقاعد في الشعب النموذجية، يُشترط تسديد رسم حجز رمزي بقيمة <strong>(20 شيكل)</strong> لتدقيق الملف، وتُخصم هذه الرسوم لاحقاً من القسط المدرسي عند التثبيت والتسكين في الشعبة.
              </div>
            </div>

            <form onSubmit={handleSubmitRegistration}>
              
              {/* Section A: Student Personal Details */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#334155', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>👤</span> بيانات الطالب الأساسية
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      الاسم الرباعي للطالب *
                    </label>
                    <input
                      type="text"
                      name="studentFullName"
                      value={formData.studentFullName}
                      onChange={handleInputChange}
                      placeholder="مثال: أحمد محمد علي رضوان"
                      required
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      رقم الهوية أو شهادة الميلاد *
                    </label>
                    <input
                      type="text"
                      name="nationalId"
                      value={formData.nationalId}
                      onChange={handleInputChange}
                      placeholder="9 أرقام"
                      required
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      تاريخ الميلاد *
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      الجنس *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                    >
                      <option value="MALE">ذكر (بنين)</option>
                      <option value="FEMALE">أنثى (بنات)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      الصف المراد التسجيل به *
                    </label>
                    <select
                      name="gradeLevel"
                      value={formData.gradeLevel}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, fontWeight: 700 }}
                    >
                      <option value="KG1 (بستان / تمهيدي أول)">KG1 (بستان / تمهيدي أول)</option>
                      <option value="KG2 (تمهيدي ثاني)">KG2 (تمهيدي ثاني)</option>
                      <option value="Grade 1 (الصف الأول الأساسي)">Grade 1 (الصف الأول الأساسي)</option>
                      <option value="Grade 2 (الصف الثاني الأساسي)">Grade 2 (الصف الثاني الأساسي)</option>
                      <option value="Grade 3 (الصف الثالث الأساسي)">Grade 3 (الصف الثالث الأساسي)</option>
                      <option value="Grade 4 (الصف الرابع الأساسي)">Grade 4 (الصف الرابع الأساسي)</option>
                      <option value="Grade 5 (الصف الخامس الأساسي)">Grade 5 (الصف الخامس الأساسي)</option>
                      <option value="Grade 6 (الصف السادس الأساسي)">Grade 6 (الصف السادس الأساسي)</option>
                      <option value="Grade 7 (الصف السابع)">Grade 7 (الصف السابع)</option>
                      <option value="Grade 8 (الصف الثامن)">Grade 8 (الصف الثامن)</option>
                      <option value="Grade 9 (الصف التاسع)">Grade 9 (الصف التاسع)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      صورة الطالب الشخصية (اختياري)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'studentPhoto')}
                      style={{ fontSize: 12, width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Section B: Guardian Contact Details */}
              <div style={{ marginBottom: 20, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#334155', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>👨‍👧</span> بيانات ولي الأمر ومكان السكن
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      اسم ولي الأمر الرباعي *
                    </label>
                    <input
                      type="text"
                      name="parentFullName"
                      value={formData.parentFullName}
                      onChange={handleInputChange}
                      placeholder="اسم ولي الأمر"
                      required
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      صلة القرابة
                    </label>
                    <select
                      name="relationship"
                      value={formData.relationship}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                    >
                      <option value="الأب">الأب</option>
                      <option value="الأم">الأم</option>
                      <option value="الوصي / المعيل">الوصي / المعيل</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      رقم الجوال الأساسي *
                    </label>
                    <input
                      type="tel"
                      name="parentPhone"
                      value={formData.parentPhone}
                      onChange={handleInputChange}
                      placeholder="059xxxxxxx"
                      required
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      رقم الواتساب للتواصل وتأكيد المقعد *
                    </label>
                    <input
                      type="tel"
                      name="parentWhatsapp"
                      value={formData.parentWhatsapp}
                      onChange={handleInputChange}
                      placeholder="059xxxxxxx"
                      required
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      العنوان التفصيلي ومكان السكن
                    </label>
                    <input
                      type="text"
                      name="fullAddress"
                      value={formData.fullAddress}
                      onChange={handleInputChange}
                      placeholder="المدينة، الحي، أقرب معلم"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                  </div>
                </div>
              </div>

              {/* Section C: 20 NIS Payment Verification */}
              <div style={{ marginBottom: 24, paddingTop: 14, borderTop: '1.5px solid #cbd5e1', background: '#f8fafc', padding: 16, borderRadius: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 900, color: '#047857', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>💳</span> تسديد وتوثيق رسم حجز المقعد (20 شيكل)
                  </h4>
                  <span style={{ background: '#dcfce7', color: '#15803d', fontWeight: 800, padding: '3px 10px', borderRadius: 12, fontSize: 12 }}>
                    20 NIS فقط
                  </span>
                </div>

                <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, marginBottom: 12 }}>
                  يمكنكم التحويل عبر: <strong>جوال باي / بال باي (+970 567 088 815)</strong> أو <strong>بنك فلسطين (حساب المدرسة)</strong> ثم إدخال بيانات التحويل أدناه:
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      اسم الشخص الذي حوّل المبلغ *
                    </label>
                    <input
                      type="text"
                      name="senderName"
                      value={formData.senderName}
                      onChange={handleInputChange}
                      placeholder="اسم صاحب الحساب أو المحفظة"
                      required
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      وسيلة التحويل المستخدمة *
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, fontWeight: 700 }}
                    >
                      <option value="Jawwal Pay (جوال باي)">Jawwal Pay (جوال باي)</option>
                      <option value="PalPay (بال باي)">PalPay (بال باي)</option>
                      <option value="Bank of Palestine / Reflect (بنك فلسطين)">Bank of Palestine / Reflect (بنك فلسطين)</option>
                      <option value="نقداً في مقر المدرسة (Cash)">نقداً في مقر المدرسة (Cash)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      الرقم المرجعي للإشعار / Transaction ID *
                    </label>
                    <input
                      type="text"
                      name="referenceNumber"
                      value={formData.referenceNumber}
                      onChange={handleInputChange}
                      placeholder="رقم مرجع الحوالة"
                      required
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, direction: 'ltr', textAlign: 'right' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      رفع صورة إشعار التحويل (لقطة شاشة أو إيصال)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'receiptImage')}
                      style={{ width: '100%', fontSize: 12 }}
                    />
                    {formData.receiptImage && (
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src={formData.receiptImage}
                          alt="Receipt Preview"
                          style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #10b981' }}
                        />
                        <span style={{ fontSize: 12, color: '#059669', fontWeight: 700 }}>✓ تم تحميل الإشعار بنجاح</span>
                      </div>
                    )}
                  </div>

                  <div style={{ gridColumn: '1 / -1', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>
                      💡 للمساعدة في التحويل أو تأكيد الحوالة، تواصلوا مباشرة مع القبول والتسجيل:
                    </div>
                    <a
                      href="https://wa.me/970567088815"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: '#22c55e',
                        color: '#ffffff',
                        padding: '6px 14px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 800,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <span>💬</span> واتساب: +970 567 088 815
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  {submitting ? 'جاري إرسال الطلب...' : 'إرسال طلب التسجيل وحجز المقعد (20 ش) ←'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. What Jothoor Offers (الميزات والمناهج والأنشطة) */}
      <section style={{ maxWidth: 1240, margin: '60px auto 0', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
            بيئة تربوية تفاعلية متكاملة
          </span>
          <h3 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '12px 0 6px' }}>
            ماذا تقدم مدرسة جذور النموذجية الخاصة؟
          </h3>
          <p style={{ fontSize: 14, color: '#64748b', maxWidth: 600, margin: '0 auto' }}>
            نصمم تجربة تعليمية نموذجية ترتقي بشخصية الطالب معرفياً، قيمياً، وعملياً من خلال برامج نوعية معتمدة.
          </p>
        </div>

        {/* Features Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {schoolGalleryImages.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 32 }}>{item.icon}</span>
                <span style={{ background: `${item.color}15`, color: item.color, padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 800 }}>
                  {item.badge}
                </span>
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {item.title}
              </h4>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Comprehensive Visual Photo Gallery from School Life */}
      <section style={{ maxWidth: 1240, margin: '64px auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            padding: '4px 16px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 800,
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
          }}>
            📸 معرض الصور والفعاليات المدرسية
          </span>
          <h3 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '14px 0 8px' }}>
            جولة مصورة في أرجاء مدرسة جذور النموذجية الخاصة
          </h3>
          <p style={{ fontSize: 14, color: '#64748b', maxWidth: 650, margin: '0 auto', lineHeight: 1.6 }}>
            نوثق بالصور والفيديو مسيرة أبنائنا وبناتنا اليومية في الغرف الصفية المتطورة، والأنشطة الإبداعية، والاحتفاء الدائم بالمتفوقين.
          </p>
        </div>

        {/* Photographic Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
          {schoolPhotoShowcase.map((photo, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
            >
              {/* Photo Image Container */}
              <div style={{ position: 'relative', width: '100%', height: 210, overflow: 'hidden', background: '#0f172a' }}>
                <img
                  src={photo.image}
                  alt={photo.title}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.5s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                />
                <div style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: 12,
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  {photo.category}
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h4 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
                  {photo.title}
                </h4>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0, flex: 1 }}>
                  {photo.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Facebook Link & Visual Invitation Banner */}
        <div style={{
          marginTop: 36,
          background: 'linear-gradient(135deg, #1877f2 0%, #0d5fc2 100%)',
          color: '#ffffff',
          borderRadius: '24px',
          padding: '32px 36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 22,
          boxShadow: '0 16px 36px rgba(24, 119, 242, 0.28)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, maxWidth: 680 }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              flexShrink: 0,
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)'
            }}>
              📘
            </div>
            <div>
              <h4 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 900, color: '#ffffff' }}>
                هل تود مشاهدة المزيد من صور وفيديوهات فعاليات المدرسة؟
              </h4>
              <p style={{ margin: 0, fontSize: 14, color: '#e0f2fe', lineHeight: 1.6 }}>
                نوثق يومياً كافة ألبومات التخرج، الرحلات، البطولات الرياضية، ولقطات من داخل الغرف الصفية عبر صفحتنا الرسمية على فيسبوك.
              </p>
            </div>
          </div>

          <a
            href="https://www.facebook.com/jothoorschoolps"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#ffffff',
              color: '#1877f2',
              padding: '14px 28px',
              borderRadius: '14px',
              fontWeight: 900,
              fontSize: 15,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s ease'
            }}
          >
            <span>🌐</span> تصفح صفحتنا الرسمية على فيسبوك ←
          </a>
        </div>
      </section>

      {/* 8. Comprehensive Footer */}
      <footer style={{ background: '#090d16', color: '#94a3b8', padding: '48px 20px 24px', borderTop: '1px solid #1e293b' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32, marginBottom: 36 }}>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SchoolLogo size={46} />
              </div>
              <h4 style={{ color: '#ffffff', fontSize: 16, fontWeight: 800, margin: 0 }}>مدرسة جذور النموذجية الخاصة</h4>
            </div>
            <p style={{ fontSize: 12.5, lineHeight: 1.7, color: '#64748b' }}>
              مؤسسة تعليمية تربوية فلسطينية رائدة ترعى أجيال الغد وتغرس حب المعرفة والتفوق بأحدث المعايير التربوية والذكية.
            </p>
          </div>

          <div>
            <h5 style={{ color: '#ffffff', fontSize: 14, fontWeight: 800, marginBottom: 12 }}>الروابط والخدمات المباشرة</h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>
                <button onClick={() => setIsRegisterModalOpen(true)} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: 0, fontWeight: 700 }}>
                  • حجز مقعد وتسجيل طالب جديد (20ش)
                </button>
              </li>
              <li>
                <button onClick={onNavigateToFees} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>
                  • بوابة تسديد الرسوم والأقساط المدرسية
                </button>
              </li>
              <li>
                <button onClick={onNavigateToInquiry} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>
                  • استعلام ولي الأمر عن نتائج الطالب
                </button>
              </li>
              <li>
                <button onClick={onNavigateToLogin} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: 0, fontWeight: 700 }}>
                  • تسجيل الدخول لمنظومة الكادر والإدارة
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 style={{ color: '#ffffff', fontSize: 14, fontWeight: 800, marginBottom: 12 }}>بيانات التواصل والاعتماد</h5>
            <div style={{ fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 8, color: '#94a3b8' }}>
              <span>📍 العنوان: غزة — دولة فلسطين</span>
              <span>📞 هاتف الإدارة: +970 567 088 815</span>
              <a
                href="https://wa.me/970567088815"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#34d399', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span>💬</span> واتساب القبول والتسجيل: +970 567 088 815
              </a>
              <a
                href="https://www.facebook.com/jothoorschoolps"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 700, marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span>🌐</span> صفحة الفيسبوك: facebook.com/jothoorschoolps
              </a>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1240, margin: '0 auto', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', fontSize: 12 }}>
          © {new Date().getFullYear()} مدرسة جذور النموذجية الخاصة — جميع الحقوق محفوظة | منظومة الإدارة المدرسية الموحدة
        </div>
      </footer>
    </div>
  );
}
