import React, { useState } from 'react';
import SchoolLogo from '../../components/common/SchoolLogo';
import { PalestineFlagIcon } from '../../components/common/Icons';
import { useSchoolConfig } from '../../context/SchoolConfigContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { compressImageFile } from '../../utils/imageCompressor';

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

  // Gallery Interactive States
  const [galleryFilter, setGalleryFilter] = useState('ALL');
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState(null);
  const [failedImages, setFailedImages] = useState({});

  // Offerings / Features Interactive States
  const [featureCategory, setFeatureCategory] = useState('ALL');
  const [selectedOfferingModal, setSelectedOfferingModal] = useState(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);

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

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await compressImageFile(file, 800, 800, 0.85);
      setFormData((prev) => ({ ...prev, [field]: dataUrl }));
      toast.success(field === 'receiptImage' ? 'تم إرفاق وتجهيز إشعار التحويل بنجاح 📎' : 'تم تحميل ومعالجة الصورة الشخصية للطالب 📸');
    } catch (err) {
      console.error('File compression error', err);
      toast.error('تعذر معالجة الصورة، يرجى اختيار ملف صورة صالح.');
    }
  };

  const handleSubmitRegistration = async (e) => {
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
      const regId = `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
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

      // 1. Post to backend server for permanent database storage & staff notification
      try {
        const res = await api.post('/students/public/register', newRegistration);
        if (res && res.registration) {
          newRegistration.registrationNumber = res.registration.registrationNumber || regId;
          newRegistration.id = res.registration.id || newRegistration.id;
        }
      } catch (apiErr) {
        console.warn('Backend API registration offline or slow, saving to local sync cache:', apiErr);
      }

      // 2. Save to localStorage cache for instant access and resilience
      const existing = JSON.parse(localStorage.getItem('alsalam_online_registrations') || localStorage.getItem('jothoor_online_registrations') || '[]');
      existing.unshift(newRegistration);
      localStorage.setItem('alsalam_online_registrations', JSON.stringify(existing));

      // 3. Trigger update event across all open windows/tabs
      window.dispatchEvent(new CustomEvent('new_student_registration', { detail: newRegistration }));

      setRegisterSuccessData(newRegistration);
      setIsRegisterModalOpen(false);
      toast.success(`تم استلام طلب حجز المقعد بنجاح! رقم الطلب: ${newRegistration.registrationNumber}`);
    } catch (err) {
      toast.error('حدث خطأ أثناء حفظ الطلب. يرجى المحاولة ثانية.');
    } finally {
      setSubmitting(false);
    }
  };

  const schoolOfferings = [
    {
      id: 'smart-classes',
      category: 'TECH',
      categoryLabel: 'تكنولوجيا التعليم',
      title: 'الصفوف النموذجية الذكية التفاعلية',
      desc: 'قاعات دراسية مكيفة ومجهزة بأحدث الشاشات التفاعلية الذكية 4K وأنظمة الصوت الرقمية لدمج الطالب بالدرس نشطاً وفاعلاً.',
      icon: '🖥️',
      color: '#2563eb',
      gradient: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
      badge: 'فصول تفاعلية 4K',
      highlights: [
        'شاشات تفاعلية ذكية متصلة بالمناهج الرقمية',
        'كثافة صفية نموذجية تضمن أقصى درجات التركيز',
        'استراتيجيات التعلم التفاعلي والتفكير الناقد'
      ],
      fullDetails: 'صُممت الفصول الدراسية في روضة ومدرسة مجموعة السلام التعليمية بأحدث المعايير الهندسية والتربوية، مع إضاءة صحية مدروسة وأجهزة عرض متطورة تمكن المعلم من تقديم دروس مشوقة تجعل استيعاب المادة العلمية سهلاً وممتعاً بعيداً عن التلقين التقليدي.'
    },
    {
      id: 'stem-labs',
      category: 'SCIENCE',
      categoryLabel: 'العلوم والابتكار',
      title: 'المختبرات العلمية والروبوتات والذكاء الاصطناعي',
      desc: 'مختبرات علوم حديثة وتجارب كيميائية وفيزيائية آمنة مع قاعات برمجة وروبوتات لاكتشاف علماء ومبتكري المستقبل.',
      icon: '🔬',
      color: '#059669',
      gradient: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
      badge: 'تجارب STEM حية',
      highlights: [
        'تطبيق عملي فوري بعد كل وحدة علمية مقررة',
        'برمجة الروبوتات والذكاء الاصطناعي للناشئين',
        'معايير سلامة وأمان مخبرية رفيعة المستوى'
      ],
      fullDetails: 'نوفر للطالب بيئة استكشافية حقيقية تتجاوز الحفظ النظري، حيث يجري الطالب التجارب بنفسه تحت إشراف نخبة من أساتذة العلوم، بالإضافة لنادي الروبوتات المدرسية المخصص لتأهيل الطلاب للمسابقات المحلية والدولية.'
    },
    {
      id: 'kindergarten',
      category: 'KG',
      categoryLabel: 'الطفولة المبكرة',
      title: 'مرحلة رياض الأطفال والتأسيس الإبداعي',
      desc: 'حاضنة تربوية دافئة للأطفال بأحدث أساليب المنتسوري، تركز على بناء الشخصية، الطلاقة اللغوية، وغرس الأخلاق والقيم.',
      icon: '🎨',
      color: '#d97706',
      gradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
      badge: 'تأسيس منتسوري',
      highlights: [
        'أركان حسية متطورة لتنمية الذكاء والإدراك',
        'برنامج مكثف للغة العربية والإنجليزية وحفظ القرآن',
        'بيئة آمنة مبهجة وألعاب تربوية هادفة'
      ],
      fullDetails: 'تعتبر مرحلة الروضة والتمهيدي في مجموعة السلام اللبنة الأساسية في رحلة الطالب، حيث نعتمد مبدأ التعلم باللعب وبناء الثقة بالنفس، مع متابعة يومية دقيقة لصحة الطفل ونموه الحركي واللغوي والاجتماعي.'
    },
    {
      id: 'sports',
      category: 'SPORTS',
      categoryLabel: 'الرياضة والأنشطة',
      title: 'الأنشطة الرياضية والكشفية وبناء الشخصية',
      desc: 'ملاعب ومساحات آمنة تعزز اللياقة البدنية وروح الفريق والمنافسة الشريفة بين الطلاب بإشراف مدربين مؤهلين.',
      icon: '⚽',
      color: '#7c3aed',
      gradient: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
      badge: 'لياقة وبطولات',
      highlights: [
        'ملاعب عشبية ومساحات رياضية آمنة ومظللة',
        'فرق كشفية ودوريات رياضية مدرسية منتظمة',
        'صقل المهارات القيادية وروح التعاون والمسؤولية'
      ],
      fullDetails: 'نؤمن أن العقل السليم في الجسم السليم، لذا تخصص المدرسة حصصاً وأنشطة رياضية متنوعة في كرة القدم، السلة، والجمباز، مع بطولات فصلية تشجع الطلاب على التفوق الرياضي كجزء من تفوقهم الدراسي.'
    },
    {
      id: 'honors',
      category: 'EXCELLENCE',
      categoryLabel: 'التفوق والتميز',
      title: 'رعاية الموهوبين واحتفالات تكريم الأوائل',
      desc: 'منظومة تحفيز متواصلة تحتفي بالمتميزين وتقدم برامج إثرائية خاصة للطلبة الموهوبين في كافة الحقول العلمية والأدبية.',
      icon: '🏆',
      color: '#db2777',
      gradient: 'linear-gradient(135deg, #be185d 0%, #ec4899 100%)',
      badge: 'لوحة الشرف الدائمة',
      highlights: [
        'خطط إثرائية للمتفوقين ومسابقات سنوية',
        'مهرجانات تكريم فصلي بحضور أولياء الأمور',
        'شهادات وجوائز تقديرية ومنح تميز دراسية'
      ],
      fullDetails: 'التفوق في مدرسة السلام ليس مجرد علامة في شهادة، بل هو ثقافة متكاملة، حيث يتم تكريم الطالب أسبوعياً وفصلياً أمام زملائه وعائلته لتشجيعه على المضي قدماً في طريق النجاح والريادة.'
    },
    {
      id: 'guidance',
      category: 'CARE',
      categoryLabel: 'الرعاية التربوية',
      title: 'الإرشاد التربوي والنفسي والمتابعة الفردية',
      desc: 'كوادر إرشادية متخصصة تهتم بالجانب النفسي وبناء الشخصية المتوازنة، مع قناة تواصل وتحديث مباشر وفوري لولي الأمر.',
      icon: '🌱',
      color: '#0891b2',
      gradient: 'linear-gradient(135deg, #0e7490 0%, #06b6d4 100%)',
      badge: 'رعاية شاملة 1:1',
      highlights: [
        'مرشد تربوي ونفسي متفرغ لكل مرحلة دراسية',
        'تقارير دورية شفافة لولي الأمر عبر المنصة',
        'تعديل سلوكي وتوجيه إيجابي يعزز الاستقرار النفسي'
      ],
      fullDetails: 'تحرص مدرسة السلام على احتضان كل طالب كحالة خاصة، وتقديم الدعم الإرشادي والنفسي لمساعدته على تخطي أي صعوبات تعليمية أو تحديات تواجهه، لبناء شخصية متزنة واثقة بنفسها وبمستقبلها.'
    }
  ];

  const filteredOfferings = featureCategory === 'ALL'
    ? schoolOfferings
    : schoolOfferings.filter(item => item.category === featureCategory);

  const schoolPhotoShowcase = [
    {
      id: 'classroom',
      title: 'الفصول الدراسية والتفاعل الصفي الذكي',
      category: 'بيئة تعليمية نموذجية',
      tag: 'ENVIRONMENT',
      image: '/gallery/smart-classroom.jpg',
      backupGradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
      icon: '🖥️',
      description: 'فصول نموذجية حديثة مجهزة بأحدث الوسائل التفاعلية لتقديم تجربة تعليمية ممتعة ومحفزة للطلاب.'
    },
    {
      id: 'science',
      title: 'مختبرات العلوم والتجارب المباشرة',
      category: 'استكشاف وابتكار علمي',
      tag: 'STEM',
      image: '/gallery/science-lab.jpg',
      backupGradient: 'linear-gradient(135deg, #065f46 0%, #059669 50%, #10b981 100%)',
      icon: '🔬',
      description: 'تطبيق عملي للمفاهيم العلمية وتجارب مخبرية ترسخ الفهم النظري وتنمي روح البحث والاستكشاف.'
    },
    {
      id: 'robotics',
      title: 'الروبوتات والذكاء الاصطناعي والبرمجة',
      category: 'تكنولوجيا المستقبل (STEM)',
      tag: 'STEM',
      image: '/gallery/robotics-stem.jpg',
      backupGradient: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #8b5cf6 100%)',
      icon: '🤖',
      description: 'تمكين أطفالنا وشبابنا من مهارات العصر وبناء نماذج روبوت ذكية تؤهلهم للمسابقات المحلية والدولية.'
    },
    {
      id: 'kindergarten',
      title: 'مرحلة رياض الأطفال والتأسيس الإبداعي',
      category: 'براعم وأطفال روضة السلام',
      tag: 'KG',
      image: '/gallery/kindergarten.jpg',
      backupGradient: 'linear-gradient(135deg, #9a3412 0%, #ea580c 50%, #f97316 100%)',
      icon: '🎨',
      description: 'أجواء مبهجة وآمنة للأطفال الصغار تركز على التعلم النشط وتنمية الخيال والمشاعر الإيجابية.'
    },
    {
      id: 'honor',
      title: 'احتفالات تكريم أوائل الطلبة والمتفوقين',
      category: 'حصاد الجد والاجتهاد',
      tag: 'HONORS',
      image: '/gallery/honor-awards.jpg',
      backupGradient: 'linear-gradient(135deg, #831843 0%, #be185d 50%, #ec4899 100%)',
      icon: '🏆',
      description: 'تقدير دائم لجهود أبنائنا وبناتنا الأوائل وتكريمهم بحضور أولياء الأمور والهيئة التدريسية والإدارية.'
    },
    {
      id: 'sports',
      title: 'الأنشطة الرياضية والكشفية وروح الفريق',
      category: 'طاقة، صحة، وانتماء',
      tag: 'SPORTS',
      image: '/gallery/sports-activity.jpg',
      backupGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #059669 100%)',
      icon: '⚽',
      description: 'مساحات لممارسة الألعاب الجماعية والمسابقات التي تصقل اللياقة البدنية وتغرس العمل الجماعي.'
    }
  ];

  const filteredShowcase = galleryFilter === 'ALL'
    ? schoolPhotoShowcase
    : schoolPhotoShowcase.filter(p => p.tag === galleryFilter);

  return (
    <div className="jothoor-public-root" dir="rtl" style={{ fontFamily: "'Cairo', 'Segoe UI', system-ui, sans-serif", background: '#f8fafc', color: '#1e293b' }}>

      {/* Dynamic Global Animations & Styling */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Tajawal:wght@400;500;700;800;900&display=swap');

        .jothoor-public-root {
          font-family: 'Cairo', 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          -webkit-font-smoothing: antialiased;
        }

        @keyframes auroraBreath {
          0%, 100% { transform: scale(1) translate(0px, 0px); opacity: 0.32; }
          50% { transform: scale(1.18) translate(-25px, 20px); opacity: 0.55; }
        }

        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.45; }
        }

        @keyframes shimmerSlide {
          0% { transform: translateX(120%); }
          100% { transform: translateX(-120%); }
        }

        @keyframes gentleGlow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.4)); }
          50% { filter: drop-shadow(0 0 16px rgba(16, 185, 129, 0.7)); }
        }

        .hero-live-badge {
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.25);
          animation: heroFloat 4.5s ease-in-out infinite;
        }

        .hero-pulse-dot {
          display: inline-block;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          animation: pulseDot 1.8s infinite ease-in-out;
        }

        .jothoor-shimmer-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .jothoor-shimmer-btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 14px 32px rgba(16, 185, 129, 0.48) !important;
        }
        .jothoor-shimmer-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: skewX(-20deg);
          animation: shimmerSlide 3.2s infinite;
        }

        .jothoor-hero-card {
          animation: heroFloat 5.5s ease-in-out infinite;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .jothoor-hero-card:hover {
          box-shadow: 0 35px 70px -15px rgba(0, 0, 0, 0.65), 0 0 0 1.5px rgba(56, 189, 248, 0.45) !important;
        }

        .jothoor-stat-item {
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .jothoor-stat-item:hover {
          transform: translateY(-4px) scale(1.02);
          background: rgba(255, 255, 255, 0.12) !important;
          border-color: rgba(56, 189, 248, 0.55) !important;
          box-shadow: 0 8px 20px rgba(0,0,0,0.25);
        }

        /* Offering Feature Card */
        .jothoor-offering-card {
          position: relative;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 22px;
          padding: 26px;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
        }
        .jothoor-offering-card:hover {
          transform: translateY(-8px);
          border-color: #10b981;
          box-shadow: 0 22px 42px -10px rgba(16, 185, 129, 0.22), 0 0 0 1.5px #10b981;
        }
        .jothoor-offering-card:hover .offering-icon-wrap {
          transform: scale(1.12) rotate(-5deg);
        }
        .jothoor-offering-card:hover .offering-arrow {
          transform: translateX(-6px);
          color: #059669;
        }

        .offering-filter-pill {
          transition: all 0.25s ease;
        }
        .offering-filter-pill:hover {
          transform: translateY(-2px);
        }

        .trust-pillar-card {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .trust-pillar-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 30px -8px rgba(0, 0, 0, 0.08);
          border-color: #059669 !important;
        }
      `}</style>

      {/* 1. National Palestinian Solidarity Header */}
      <div style={{ background: '#090d16', color: '#cbd5e1', padding: '8px 16px', fontSize: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PalestineFlagIcon size={18} />
            <span style={{ fontWeight: 700, color: '#f8fafc' }}>دولة فلسطين — وزارة التربية والتعليم العالي</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span>روضة ومدرسة مجموعة السلام التعليمية الخاصة — صرح تعليمي ريادي فلسطيني</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <a
              href="https://www.facebook.com/profile.php?id=61573927433156"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}
            >
              <span>🌐</span> صفحتنا الرسمية على فيسبوك
            </a>
            <span style={{ opacity: 0.4 }}>•</span>
            <a
              href="https://wa.me/970593124444"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#34d399', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700 }}
            >
              <span>💬</span> واتساب: +970 59 312 4444
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
                روضة ومدرسة مجموعة السلام التعليمية الخاصة
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                Al-Salam Educational Group — البيئة التعليمية النموذجية الأولى في فلسطين
              </p>
            </div>
          </div>

          {/* Quick Action Hub Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>

            {/* 1. Register & Reserve Seat */}
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '9px 18px',
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
              <span>تسجيل طالب جديد (حجز مقعد)</span>
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

      {/* 3. Hero Section (Rich Aesthetics, Aurora Glow & Slogan) */}
      <section style={{
        background: 'radial-gradient(circle at 18% 25%, rgba(16, 185, 129, 0.28) 0%, transparent 45%), radial-gradient(circle at 82% 75%, rgba(56, 189, 248, 0.24) 0%, transparent 50%), radial-gradient(circle at 50% 40%, rgba(99, 102, 241, 0.16) 0%, transparent 55%), linear-gradient(145deg, #070d18 0%, #0d192e 50%, #081e18 100%)',
        color: '#ffffff',
        padding: '70px 20px 88px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Floating Ambient Aurora Orbs */}
        <div style={{ position: 'absolute', top: -80, right: -60, width: 460, height: 460, background: 'rgba(16, 185, 129, 0.3)', borderRadius: '50%', filter: 'blur(95px)', pointerEvents: 'none', animation: 'auroraBreath 8s infinite ease-in-out' }} />
        <div style={{ position: 'absolute', bottom: -90, left: -60, width: 480, height: 480, background: 'rgba(56, 189, 248, 0.24)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', animation: 'auroraBreath 10s infinite ease-in-out reverse' }} />

        <div style={{ maxWidth: 1240, margin: '0 auto', position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, alignItems: 'center' }}>

          {/* Hero Left Content */}
          <div>
            <div className="hero-live-badge" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 9,
              background: 'rgba(16, 185, 129, 0.14)',
              border: '1px solid rgba(16, 185, 129, 0.45)',
              padding: '7px 16px',
              borderRadius: '24px',
              fontSize: '13px',
              fontWeight: 800,
              color: '#34d399',
              marginBottom: 20
            }}>
              <span className="hero-pulse-dot" />
              <span>فتح باب التسجيل وحجز المقاعد للعام الدراسي 2026/2027</span>
            </div>

            <h2 style={{ fontSize: '40px', fontWeight: 900, lineHeight: 1.25, letterSpacing: '-0.8px', margin: '0 0 16px', color: '#ffffff' }}>
              روضة ومدرسة مجموعة السلام التعليمية الخاصة
            </h2>

            <p style={{ fontSize: '21px', fontWeight: 800, color: '#38bdf8', margin: '0 0 18px', lineHeight: 1.4 }}>
              "البيئة التعليمية النموذجية الأولى في فلسطين - خبرة 25 عاماً من الإبداع والتميز"
            </p>

            <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: 1.85, margin: '0 0 28px', maxWidth: 560 }}>
              نرحب بكم في الصرح التربوي الرائد الذي يجمع بين أصالة القيم الإسلامية والوطنية، وأحدث معايير التعليم العصري التفاعلي. نوفر لأبنائنا الطلبة بيئة آمنة ملهمة تحفز الإبداع وتصقل المواهب ليكونوا قادة الغد.
            </p>

            {/* Quick Hero CTA Buttons */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="jothoor-shimmer-btn"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px 28px',
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
                <span>سجّل ابنك الآن واحجز مقعداً دراسياً</span>
              </button>

              <button
                onClick={onNavigateToInquiry}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  padding: '14px 22px',
                  borderRadius: '14px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
              >
                <span>🔍</span>
                <span>استعلام ولي الأمر عن الطالب</span>
              </button>
            </div>
          </div>

          {/* Hero Right Visual Card (Interactive Bento Panel) */}
          <div className="jothoor-hero-card" style={{
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '26px',
            padding: '28px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.55)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flexShrink: 0 }}>
                  <SchoolLogo size={62} />
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, display: 'block' }}>منظومة السلام الذكية</span>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc' }}>التعليم النموذجي الشامل</span>
                </div>
              </div>
              <span style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                padding: '4px 10px',
                borderRadius: 14,
                fontSize: 11,
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}>
                <span className="hero-pulse-dot" style={{ width: 6, height: 6 }} />
                مباشر
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              <div className="jothoor-stat-item" style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: 16, padding: '16px', border: '1px solid rgba(255, 255, 255, 0.09)' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#38bdf8' }}>100%</div>
                <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 4, fontWeight: 600 }}>نسبة النجاح والتفوق الأكاديمي</div>
              </div>
              <div className="jothoor-stat-item" style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: 16, padding: '16px', border: '1px solid rgba(255, 255, 255, 0.09)' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#34d399' }}>فصول ذكية</div>
                <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 4, fontWeight: 600 }}>بيئة نموذجية وشاشات 4K</div>
              </div>
              <div className="jothoor-stat-item" style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: 16, padding: '16px', border: '1px solid rgba(255, 255, 255, 0.09)' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#fbbf24' }}>24/7</div>
                <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 4, fontWeight: 600 }}>متابعة إلكترونية لولي الأمر</div>
              </div>
              <div className="jothoor-stat-item" style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: 16, padding: '16px', border: '1px solid rgba(255, 255, 255, 0.09)' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#a78bfa' }}>نخبة</div>
                <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 4, fontWeight: 600 }}>كادر تعليمي وتربوي معتمد</div>
              </div>
            </div>

            <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>📍 غزة - منطقة النصر - فلسطين</span>
              <a
                href="https://www.facebook.com/profile.php?id=61573927433156"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#60a5fa', fontSize: 12, fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <span>تصفح ألبومات المدرسة بالصور</span>
                <span>←</span>
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
              شكراً لثقتكم بروضة ومدرسة مجموعة السلام التعليمية الخاصة. تم تسجيل الطالب مبدئياً وحجز المقعد.
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
                  طلب تسجيل طالب جديد — حجز مقعد دراسي
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b' }}>
                  روضة ومدرسة مجموعة السلام التعليمية الخاصة — حجز المقعد الإلكتروني المعتمد
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
                  يمكنكم التحويل عبر: <strong>جوال باي / بال باي (+970 59 312 4444)</strong> أو <strong>بنك فلسطين (حساب المدرسة)</strong> ثم إدخال بيانات التحويل أدناه:
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
                      href="https://wa.me/970593124444"
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
                      <span>💬</span> واتساب: +970 59 312 4444
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

      {/* 6. What Jothoor Offers (Interactive Dynamic Educational Programs) */}
      <section style={{ maxWidth: 1240, margin: '70px auto 0', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{
            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
            color: '#3730a3',
            padding: '6px 18px',
            borderRadius: 24,
            fontSize: 12.5,
            fontWeight: 800,
            display: 'inline-block',
            boxShadow: '0 2px 10px rgba(99, 102, 241, 0.15)'
          }}>
            🌟 بيئة تربوية تفاعلية متكاملة
          </span>
          <h3 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', margin: '14px 0 8px', letterSpacing: '-0.4px' }}>
            ماذا تقدم روضة ومدرسة مجموعة السلام التعليمية الخاصة؟
          </h3>
          <p style={{ fontSize: 14.5, color: '#64748b', maxWidth: 640, margin: '0 auto', lineHeight: 1.7 }}>
            نصمم تجربة تعليمية حديثة وممتعة ترتقي بشخصية الطالب معرفياً، قيمياً، وعملياً من خلال 6 ركائز تربوية معتمدة تضمن له التفوق والريادة.
          </p>
        </div>

        {/* Interactive Offering Filter Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 32
        }}>
          {[
            { id: 'ALL', label: 'جميع البرامج (6)', icon: '🌟' },
            { id: 'TECH', label: 'الفصول الذكية', icon: '🖥️' },
            { id: 'SCIENCE', label: 'العلوم وSTEM', icon: '🔬' },
            { id: 'KG', label: 'رياض الأطفال', icon: '🎨' },
            { id: 'SPORTS', label: 'الرياضة والأنشطة', icon: '⚽' },
            { id: 'EXCELLENCE', label: 'التفوق ورعاية الموهوبين', icon: '🏆' },
            { id: 'CARE', label: 'الإرشاد والمتابعة', icon: '🌱' },
          ].map(tab => {
            const isActive = featureCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFeatureCategory(tab.id)}
                className="offering-filter-pill"
                style={{
                  background: isActive ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : '#ffffff',
                  color: isActive ? '#ffffff' : '#475569',
                  border: isActive ? '1px solid #059669' : '1px solid #cbd5e1',
                  padding: '8px 16px',
                  borderRadius: 24,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: isActive ? '0 4px 14px rgba(16, 185, 129, 0.3)' : '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Interactive Offerings Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
          {filteredOfferings.map((item) => (
            <div
              key={item.id}
              className="jothoor-offering-card"
              onClick={() => setSelectedOfferingModal(item)}
            >
              {/* Top Colored Accent Bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: item.gradient,
                borderRadius: '20px 20px 0 0'
              }} />

              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div
                  className="offering-icon-wrap"
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: `${item.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 26,
                    transition: 'all 0.35s ease',
                    boxShadow: `0 4px 12px ${item.color}20`
                  }}
                >
                  {item.icon}
                </div>
                <span style={{
                  background: `${item.color}15`,
                  color: item.color,
                  border: `1px solid ${item.color}30`,
                  padding: '4px 12px',
                  borderRadius: 14,
                  fontSize: 11.5,
                  fontWeight: 800
                }}>
                  {item.badge}
                </span>
              </div>

              {/* Card Title & Description */}
              <h4 style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', margin: '0 0 10px', lineHeight: 1.4 }}>
                {item.title}
              </h4>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, margin: '0 0 16px', flex: 1 }}>
                {item.desc}
              </p>

              {/* Concrete Feature Bullet Points */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '14px 0', borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                {item.highlights.map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#334155' }}>
                    <span style={{ color: '#10b981', fontWeight: 900, fontSize: 14 }}>✓</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              {/* Interactive Modal Action Trigger */}
              <div style={{
                marginTop: 'auto',
                paddingTop: 12,
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: item.color, fontWeight: 800, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span>اكتشف تفاصيل هذا المسار التربوي</span>
                  <span className="offering-arrow">←</span>
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>انقر للمعاينة</span>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Detail Interactive Modal */}
        {selectedOfferingModal && (
          <div
            onClick={() => setSelectedOfferingModal(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(10px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#ffffff',
                borderRadius: 24,
                maxWidth: 620,
                width: '100%',
                padding: '28px',
                boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 58,
                    height: 58,
                    borderRadius: 18,
                    background: `${selectedOfferingModal.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 30,
                    boxShadow: `0 4px 14px ${selectedOfferingModal.color}25`
                  }}>
                    {selectedOfferingModal.icon}
                  </div>
                  <div>
                    <span style={{ fontSize: 12, color: selectedOfferingModal.color, fontWeight: 800, display: 'block' }}>
                      {selectedOfferingModal.categoryLabel}
                    </span>
                    <h3 style={{ fontSize: 19, fontWeight: 900, color: '#0f172a', margin: '2px 0 0' }}>
                      {selectedOfferingModal.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOfferingModal(null)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    fontSize: 16,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b'
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 16, padding: '16px 20px', border: '1px solid #e2e8f0', marginBottom: 20 }}>
                <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.8, margin: 0 }}>
                  {selectedOfferingModal.fullDetails}
                </p>
              </div>

              <h5 style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', margin: '0 0 10px' }}>
                المميزات العملية التي يحصل عليها الطالب:
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {selectedOfferingModal.highlights.map((h, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    padding: '10px 14px',
                    borderRadius: 12,
                    fontSize: 13,
                    color: '#065f46',
                    fontWeight: 700
                  }}>
                    <span style={{ color: '#059669', fontSize: 16 }}>✓</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <a
                  href="https://wa.me/970593124444"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: '#f0fdf4',
                    color: '#16a34a',
                    border: '1px solid #bbf7d0',
                    padding: '10px 18px',
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: 13,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span>💬</span> استفسار عبر واتساب
                </a>
                <button
                  onClick={() => {
                    setSelectedOfferingModal(null);
                    setIsRegisterModalOpen(true);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  🎓 حجز مقعد وتسجيل الآن
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Why Parents Choose Jothoor (4 Trust Pillars) */}
        <div style={{
          marginTop: 56,
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #eff6ff 100%)',
          borderRadius: 24,
          padding: '36px 30px',
          border: '1.5px solid #d1fae5'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span style={{ background: '#10b981', color: '#ffffff', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
              معايير الجودة والاعتماد
            </span>
            <h4 style={{ fontSize: 24, fontWeight: 900, color: '#064e3b', margin: '10px 0 6px' }}>
              لماذا يفضل أولياء الأمور روضة ومدرسة مجموعة السلام التعليمية الخاصة؟
            </h4>
            <p style={{ fontSize: 13.5, color: '#047857', margin: 0 }}>
              نضع مصلحة الطالب ومستقبله في صميم كل قرار، مع شراكة حقيقية ومستمرة مع الأسرة.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            {[
              { icon: '👨‍🏫', title: 'كادر نخبوي معتمد', desc: 'معلمون ذوو كفاءة عالية وخبرات تربوية معتمدة يخضعون لتطوير مهني دائم.' },
              { icon: '📱', title: 'منظومة متابعة ذكية', desc: 'إشعارات فورية لولي الأمر بالحضور والغياب، الملاحظات، والنتائج عبر المنصة.' },
              { icon: '🛡️', title: 'بيئة آمنة وصحية', desc: 'غرف صفية مكيفة، ملاعب مظللة آمنة، وإشراف متواصل على مدار اليوم الدراسي.' },
              { icon: '📖', title: 'غرس الأخلاق والقيم', desc: 'توازن دقيق يجمع بين التطور التكنولوجي وبين القيم الوطنية والإسلامية وحفظ القرآن.' }
            ].map((pillar, i) => (
              <div
                key={i}
                className="trust-pillar-card"
                style={{
                  background: '#ffffff',
                  borderRadius: 18,
                  padding: 20,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>{pillar.icon}</div>
                <h5 style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>{pillar.title}</h5>
                <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6, margin: 0 }}>{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Comprehensive Visual Photo Gallery from School Life */}
      <section style={{ maxWidth: 1240, margin: '64px auto', padding: '0 20px' }}>
        <style>{`
          .jothoor-gallery-card {
            transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease, border-color 0.35s ease;
          }
          .jothoor-gallery-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 35px -8px rgba(16, 185, 129, 0.22), 0 0 0 1.5px #10b981 !important;
          }
          .jothoor-gallery-card:hover .gallery-img {
            transform: scale(1.08);
          }
          .jothoor-gallery-card:hover .hover-overlay {
            opacity: 1 !important;
          }
          .gallery-filter-pill {
            transition: all 0.25s ease;
          }
          .gallery-filter-pill:hover {
            transform: translateY(-2px);
          }
        `}</style>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            padding: '5px 18px',
            borderRadius: 20,
            fontSize: 12.5,
            fontWeight: 800,
            boxShadow: '0 2px 10px rgba(16, 185, 129, 0.28)',
            display: 'inline-block'
          }}>
            📸 معرض الصور والفعاليات المدرسية الحية
          </span>
          <h3 style={{ fontSize: 30, fontWeight: 900, color: '#0f172a', margin: '14px 0 8px', letterSpacing: '-0.4px' }}>
            جولة مصورة في أرجاء روضة ومدرسة مجموعة السلام التعليمية الخاصة
          </h3>
          <p style={{ fontSize: 14, color: '#64748b', maxWidth: 660, margin: '0 auto', lineHeight: 1.6 }}>
            نوثق بالصور والفيديو مسيرة أبنائنا وبناتنا اليومية في الغرف الصفية المتطورة، والأنشطة الإبداعية، والاحتفاء الدائم بالمتفوقين.
          </p>
        </div>

        {/* Interactive Filter Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 32
        }}>
          {[
            { id: 'ALL', label: 'جميع الفعاليات (6)', icon: '🌟' },
            { id: 'ENVIRONMENT', label: 'الفصول الذكية', icon: '🖥️' },
            { id: 'STEM', label: 'العلوم والروبوتات', icon: '🔬' },
            { id: 'KG', label: 'رياض الأطفال', icon: '🎨' },
            { id: 'HONORS', label: 'تكريم المتفوقين', icon: '🏆' },
            { id: 'SPORTS', label: 'الأنشطة والرياضة', icon: '⚽' },
          ].map(tab => {
            const isActive = galleryFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setGalleryFilter(tab.id)}
                className="gallery-filter-pill"
                style={{
                  background: isActive ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : '#ffffff',
                  color: isActive ? '#ffffff' : '#475569',
                  border: isActive ? '1px solid #059669' : '1px solid #cbd5e1',
                  padding: '8px 16px',
                  borderRadius: 24,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: isActive ? '0 4px 14px rgba(16, 185, 129, 0.3)' : '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Photographic Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
          {filteredShowcase.map((photo) => {
            const isFailed = failedImages[photo.id];
            return (
              <div
                key={photo.id}
                className="jothoor-gallery-card"
                onClick={() => setActiveLightboxPhoto(photo)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {/* Photo Image Container */}
                <div style={{ position: 'relative', width: '100%', height: 220, overflow: 'hidden', background: '#0f172a' }}>
                  {!isFailed ? (
                    <img
                      src={photo.image}
                      alt={photo.title}
                      loading="lazy"
                      className="gallery-img"
                      onError={() => setFailedImages(prev => ({ ...prev, [photo.id]: true }))}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    />
                  ) : (
                    /* High-Aesthetic Resilient Visual Fallback */
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: photo.backupGradient,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 20,
                      color: '#ffffff',
                      textAlign: 'center'
                    }}>
                      <span style={{ fontSize: 48, marginBottom: 8, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
                        {photo.icon}
                      </span>
                      <strong style={{ fontSize: 15, fontWeight: 900, textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
                        {photo.title}
                      </strong>
                      <span style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>
                        روضة ومدرسة مجموعة السلام التعليمية الخاصة
                      </span>
                    </div>
                  )}

                  {/* Category Badge */}
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
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    zIndex: 2
                  }}>
                    {photo.category}
                  </div>

                  {/* Hover Inspect Overlay */}
                  <div
                    className="hover-overlay"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(15, 23, 42, 0.45)',
                      backdropFilter: 'blur(2px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      zIndex: 3
                    }}
                  >
                    <span style={{
                      background: '#ffffff',
                      color: '#0f172a',
                      padding: '8px 16px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 900,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <span>🔍</span> انقر للمعاينة والتفاصيل
                    </span>
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
            );
          })}
        </div>

        {/* Lightbox High-Res Interactive Modal */}
        {activeLightboxPhoto && (
          <div
            onClick={() => setActiveLightboxPhoto(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(10px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              animation: 'fadeIn 0.2s ease'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#ffffff',
                borderRadius: 24,
                maxWidth: 780,
                width: '100%',
                overflow: 'hidden',
                boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {/* Image Preview Container */}
              <div style={{ position: 'relative', width: '100%', height: 380, background: '#090d16', overflow: 'hidden' }}>
                {!failedImages[activeLightboxPhoto.id] ? (
                  <img
                    src={activeLightboxPhoto.image}
                    alt={activeLightboxPhoto.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: activeLightboxPhoto.backupGradient, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <span style={{ fontSize: 64 }}>{activeLightboxPhoto.icon}</span>
                    <h3 style={{ margin: '12px 0 0', fontSize: 20, fontWeight: 900 }}>{activeLightboxPhoto.title}</h3>
                  </div>
                )}
                <button
                  onClick={() => setActiveLightboxPhoto(null)}
                  style={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    background: 'rgba(15, 23, 42, 0.75)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.3)',
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    fontSize: 16,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(6px)'
                  }}
                >
                  ✕
                </button>
                <div style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'rgba(5, 150, 105, 0.9)',
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 800,
                  padding: '5px 12px',
                  borderRadius: 14,
                  backdropFilter: 'blur(6px)'
                }}>
                  {activeLightboxPhoto.category}
                </div>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '24px 28px' }}>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 10px' }}>
                  {activeLightboxPhoto.title}
                </h3>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: '0 0 20px' }}>
                  {activeLightboxPhoto.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 16, flexWrap: 'wrap', gap: 12 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    🏫 روضة ومدرسة مجموعة السلام التعليمية الخاصة — غزة، فلسطين
                  </span>
                  <button
                    onClick={() => {
                      setActiveLightboxPhoto(null);
                      setIsRegisterModalOpen(true);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: 12,
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: 'pointer'
                    }}
                  >
                    🎓 حجز مقعد وتسجيل إلكتروني الآن
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
            href="https://www.facebook.com/profile.php?id=61573927433156"
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
              <h4 style={{ color: '#ffffff', fontSize: 16, fontWeight: 800, margin: 0 }}>روضة ومدرسة مجموعة السلام التعليمية الخاصة</h4>
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
                  • حجز مقعد وتسجيل طالب جديد
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
              <span>📍 العنوان: غزة - منطقة النصر — دولة فلسطين</span>
              <span>📞 هاتف الإدارة: +970 59 312 4444</span>
              <a
                href="https://wa.me/970593124444"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#34d399', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span>💬</span> واتساب القبول والتسجيل: +970 59 312 4444
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61573927433156"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 700, marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span>🌐</span> صفحة الفيسبوك: مجموعة السلام التعليمية الخاصة
              </a>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1240, margin: '0 auto', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', fontSize: 12 }}>
          © {new Date().getFullYear()} روضة ومدرسة مجموعة السلام التعليمية الخاصة — جميع الحقوق محفوظة | منظومة الإدارة المدرسية الموحدة
        </div>
      </footer>
    </div>
  );
}
