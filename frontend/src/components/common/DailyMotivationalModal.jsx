import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { PalestineFlagIcon } from './Icons';

// Comprehensive pool of inspiring, role-tailored daily motivational wisdom
const MOTIVATIONAL_DATABASE = {
  ADMIN: [
    {
      quoteAr: "القيادة التربوية الحقيقية ليست مجرد إدارة، بل هي إلهام للقلوب وزرع للأمل في عقول أجيال الغد. بقراراتك الحكيمة ورؤيتك تصنع الفرق في كل يوم!",
      tipAr: "💡 نصيحة اليوم: وجّه كلمة تشجيع وتقدير لمعلم متميز اليوم، فالقائد العظيم يصنع قادة.",
      quoteEn: "Educational leadership is about inspiring hearts and planting hope in the minds of future generations. Your wisdom shapes tomorrow!",
      tipEn: "💡 Daily Tip: Offer a word of praise and appreciation to an outstanding educator today."
    },
    {
      quoteAr: "كل صرح تعليمي عظيم يقف خلفه قائد يرى في الصعوبات فرصاً، وفي كل طالب بذرة لقائد مستقبلي. يومك مليء بالإنجاز والريادة والبركة!",
      tipAr: "💡 نصيحة اليوم: خذ 5 دقائق لتفقد إحدى الشعب الدراسية واستمع بابتسامة إلى طموحات طلابك.",
      quoteEn: "Behind every great school stands a visionary leader who sees opportunities in challenges and a leader in every student. Have a fruitful day!",
      tipEn: "💡 Daily Tip: Take a 5-minute walk through classes to connect directly with your students."
    },
    {
      quoteAr: "الإدارة بالحب والعدالة والحكمة تصنع بيئة مدرسية تزدهر فيها المواهب وتبدع فيها العقول. أنت صمام الأمان وبوصلة هذا الصرح التعليمي.",
      tipAr: "💡 نصيحة اليوم: اجعل لقاءك الصباحي بفريق العمل مفعماً بالطاقة الإيجابية وروح التعاون.",
      quoteEn: "Leading with empathy, justice, and wisdom fosters a thriving learning community. You are the compass of this institution.",
      tipEn: "💡 Daily Tip: Infuse your morning check-ins with collaborative positive energy."
    },
    {
      quoteAr: "يا قائد المسيرة.. نجاح مدرستنا ليس صدفة، بل هو ثمرة تفانيك وتخطيطك المستمر وسهرك على رفعة التعليم. استمر في قيادة المسيرة بثقة وعزيمة!",
      tipAr: "💡 نصيحة اليوم: احتفل بإنجاز صغير حققته المدرسة هذا الأسبوع، فالإنجازات الصغيرة تصنع النجاح الباهر.",
      quoteEn: "Our school's excellence is the direct fruit of your continuous foresight and dedication. Lead with unyielding confidence!",
      tipEn: "💡 Daily Tip: Celebrate a small team win today; small victories build magnificent achievements."
    },
    {
      quoteAr: "عندما يؤمن القائد بفريقه ويوفر لهم البيئة الداعمة، تتحول كل التحديات إلى نجاحات مبهرة لا تُنسى. دمت ذخراً ومنارة للعلم!",
      tipAr: "💡 نصيحة اليوم: استمع اليوم لاقتراح إبداعي من أحد الموظفين أو المعلمين وادعمه لتحقيقه.",
      quoteEn: "When a leader believes in their team and provides a supportive atmosphere, challenges turn into unforgettable triumphs.",
      tipEn: "💡 Daily Tip: Listen warmly to a creative initiative from a staff member today."
    },
    {
      quoteAr: "القيادة الحكيمة تبني الإنسان أولاً قبل الجدران والمناهج. عطاؤك القيادي اليوم يزرع الأمل في مستقبل وطننا الحبيب.",
      tipAr: "💡 نصيحة اليوم: امنح نفسك لحظة تأمل صباحية لتحديد الأولويات الثلاث الأهم لهذا اليوم.",
      quoteEn: "Wise leadership develops people and character first. Your leadership plants hope in the heart of our community.",
      tipEn: "💡 Daily Tip: Take a quiet morning moment to define your top three priorities today."
    },
    {
      quoteAr: "بهمتك العالية وابتسامتك الواثقة، تبث الأمان والنشاط في كل ركن من أركان المدرسة. يومك مشرق بالتميز والقرارات السديدة!",
      tipAr: "💡 نصيحة اليوم: ابدأ يومك بكلمة شكر لمن يستقبلك عند مدخل المدرسة، فالامتنان يضاعف العطاء.",
      quoteEn: "With your high spirits and confident smile, you inspire security and passion across the campus. Have an outstanding day!",
      tipEn: "💡 Daily Tip: Start your day with gratitude to everyone helping keep our campus safe and welcoming."
    }
  ],
  STAFF: [
    {
      quoteAr: "أنت القلب النابض والركيزة الأساسية لهذا الصرح؛ بدقتك وتنظيمك تسير العملية التعليمية بسلاسة واطمئنان. يومك مشرق بالنشاط والإنتاجية!",
      tipAr: "💡 نصيحة اليوم: رتّب مهامك بحسب الأولوية، فكل ملف تنجزه يريح طالباً ويسعد معلماً.",
      quoteEn: "You are the vital heartbeat of our school; through your precision and organization, everything runs seamlessly. Have an energetic day!",
      tipEn: "💡 Daily Tip: Organize your tasks by priority; every completed task brings peace of mind to students and teachers."
    },
    {
      quoteAr: "العمل الإداري المتقن هو الجسر الذي يعبر عليه الطلاب والمعلمون نحو النجاح. إخلاصك في كل تفصيلة يصنع فارقاً عظيماً نلمسه كل يوم!",
      tipAr: "💡 نصيحة اليوم: استقبل أول ولي أمر أو طالب يراجعك اليوم بابتسامة تزرع الطمأنينة في قلبه.",
      quoteEn: "Flawless administration is the solid bridge over which students and educators cross toward achievement. Your dedication makes a huge difference!",
      tipEn: "💡 Daily Tip: Greet the first student or visiting parent with a reassuring, welcoming smile."
    },
    {
      quoteAr: "التفاني في شؤون الطلاب وخدمة الكادر التعليمي رسالة سامية وأمانة عظيمة، وعطاؤك المستمر هو سر التميز والانضباط في مدرستنا.",
      tipAr: "💡 نصيحة اليوم: خذ استراحة قصيرة لتجديد تركيزك وشرب فنجان قهوة منعش يعيد نشاطك.",
      quoteEn: "Serving student affairs and school operations is a noble mission. Your daily diligence is the cornerstone of our school's discipline.",
      tipEn: "💡 Daily Tip: Take a mindful short pause to refresh your mental focus with your favorite drink."
    },
    {
      quoteAr: "وراء كل مدرسة ناجحة فريق إداري منظم ومتعاون كالبنيان المرصوص. شكراً لأنك دائماً في الموعد وعلى قدر المسؤولية والتحدي!",
      tipAr: "💡 نصيحة اليوم: شارك زميلاً بكلمة طيبة على جهد مشترك أنجزتموه معاً بروح الفريق.",
      quoteEn: "Behind every triumphant school stands a dedicated administrative team working in perfect harmony. Thank you for always being dependable!",
      tipEn: "💡 Daily Tip: Share a word of appreciation with a colleague on recent collaborative achievements."
    },
    {
      quoteAr: "كل كشف تنظمه وكل بيان تدققه يسهم مباشرة في حماية حقوق الطلاب ومتابعة مسيرتهم التعليمية. عملك عظيم وأثرك لا يقدّر بثمن!",
      tipAr: "💡 نصيحة اليوم: خصص وقتاً لتنظيم وتحديث ملفاتك الرقمية لتسهيل وصول زملائك إليها بسرعة.",
      quoteEn: "Every record you organize directly safeguards student rights and advances their learning journey. Your effort is invaluable!",
      tipEn: "💡 Daily Tip: Dedicate a few minutes to organize your digital records for smooth team access."
    },
    {
      quoteAr: "صباح الهمة والإنجاز! أنت الجندي المجهول الذي يجعل العمل اليومي متعة ونجاحاً مستمراً. نتمنى لك يوماً يفيض بالراحة والتوفيق.",
      tipAr: "💡 نصيحة اليوم: احتفل بإنهاء المهام الصعبة في بداية اليوم لتنعم بيوم هادئ ومنجز.",
      quoteEn: "Good morning of high productivity! You are the silent hero making daily operations a smooth success. Wishing you a wonderful day!",
      tipEn: "💡 Daily Tip: Tackle the most demanding task early in the morning for a serene, satisfying day."
    }
  ],
  TEACHER: [
    {
      quoteAr: "أهلاً بك يا صانع الأجيال وبطل الميدان! كلمة تشجيع واحدة منك اليوم قد توقظ عبقرية كامنة وتغير مسار حياة طالب إلى الأبد. يومك مليء بالشغف والإلهام!",
      tipAr: "💡 نصيحة اليوم: امنح ثناءً لطالب كان متردداً أو خجولاً اليوم؛ فكلمتك تصنع معجزات الثقة بالنفس.",
      quoteEn: "Welcome, champion of the classroom! A single word of encouragement from you today can spark genius and change a student's life forever!",
      tipEn: "💡 Daily Tip: Praise a hesitant or quiet student today; your belief in them builds unshakable confidence."
    },
    {
      quoteAr: "التعليم ليس مجرد مهنة، بل هو رسالة نور وغرس للأمل في قلوب طلابنا. في كل حصة تشرحها، أنت تبني لبنة في مستقبل هذا الوطن الغالي!",
      tipAr: "💡 نصيحة اليوم: ابدأ حصتك اليوم بسؤال تفاعلي شيق يجذب انتباه وشغف جميع الطلاب.",
      quoteEn: "Teaching is an enlightened mission of planting hope. In every lesson you deliver, you build the foundation of our future!",
      tipEn: "💡 Daily Tip: Start your class with an intriguing curiosity question that hooks every student."
    },
    {
      quoteAr: "المعلم المخلص كالشمس التي تضيء دروب المعرفة وتزرع الدفء في قلوب تلاميذه. عقول طلابك أمانة غالية، وأنت أهل لهذه الأمانة والتميز!",
      tipAr: "💡 نصيحة اليوم: ابتسامتك في وجه طلابك عند دخول الصف هي المفتاح السحري لقلوبهم وعقولهم.",
      quoteEn: "A dedicated teacher illuminates paths of knowledge and warms the hearts of learners. Your students are in the best hands!",
      tipEn: "💡 Daily Tip: Your welcoming smile as you enter the classroom is the magic key to engaged minds."
    },
    {
      quoteAr: "صباح الشغف والإبداع يا مربي الأجيال! الطلاب ينتظرون طاقتك الإيجابية وعلمك النافع بشوق؛ اجعل من حصتك اليوم رحلة استكشاف ممتعة ومشوقة.",
      tipAr: "💡 نصيحة اليوم: استخدم نشاطاً جماعياً سريعاً لمدة 3 دقائق لتعزيز روح التعاون والتنافس الإيجابي.",
      quoteEn: "Good morning, inspiring mentor! Your students eagerly await your positive energy; make today's lesson an unforgettable journey of discovery.",
      tipEn: "💡 Daily Tip: Use a quick 3-minute collaborative activity to ignite vibrant teamwork."
    },
    {
      quoteAr: "أثر المعلم الصادق يبقى خالداً في ذاكرة الأجيال ولا يمحوه الزمان. شكراً لعطائك اللامحدود وصبرك الجميل في كل يوم دراسي!",
      tipAr: "💡 نصيحة اليوم: اختم حصتك بخلاصة ملهمة تربط الدرس النظري بقيمة حياتية جميلة.",
      quoteEn: "The enduring mark of a great teacher lasts forever in the hearts of generations. Thank you for your boundless passion and dedication!",
      tipEn: "💡 Daily Tip: Conclude your class with an inspiring real-world takeaway connecting lesson to life."
    },
    {
      quoteAr: "يا منارة العلم.. في عينيك يرى الطلاب قدوتهم، ومن نبرة صوتك يستمدون شغف المعرفة. دمتم صناعاً للمجد وفخراً لمدرستنا!",
      tipAr: "💡 نصيحة اليوم: لاحظ طالباً بذل جهداً إضافياً واشكره أمام زملائه لتعزيز الدافعية.",
      quoteEn: "Beacon of wisdom.. students see their role model in you and draw passion from your voice. Keep shining brightly!",
      tipEn: "💡 Daily Tip: Notice and celebrate extra effort in front of peers to multiply intrinsic motivation."
    },
    {
      quoteAr: "أعظم استثمار في الوجود هو الاستثمار في عقول الأطفال والشباب، وأنت رائد هذا الاستثمار كل صباح. يومك مبارك ومفعم بالطاقة الإيجابية!",
      tipAr: "💡 نصيحة اليوم: اسمح للطلاب بالتعبير عن آرائهم بحرية في مسألة تعليمية اليوم لتنمية تفكيرهم النقدي.",
      quoteEn: "The greatest investment in existence is in young minds, and you lead this noble endeavor every morning. Have an inspired day!",
      tipEn: "💡 Daily Tip: Give students room to freely express critical thoughts on today's learning topic."
    }
  ]
};

export default function DailyMotivationalModal() {
  const { user } = useAuth();
  const { isRtl } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // Compute daily message based on date and role
  const getTodayMessage = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((today - startOfYear) / (24 * 60 * 60 * 1000));
    
    const roleKey = user?.role === 'STAFF' ? 'STAFF' : user?.role === 'TEACHER' ? 'TEACHER' : 'ADMIN';
    const pool = MOTIVATIONAL_DATABASE[roleKey] || MOTIVATIONAL_DATABASE.ADMIN;
    
    // Deterministic index for this day
    const index = (dayOfYear + today.getFullYear() * 7) % pool.length;
    const item = pool[index];

    const rawName = user?.fullName || (roleKey === 'ADMIN' ? 'المدير العام' : roleKey === 'STAFF' ? 'شؤون الطلاب' : 'المعلم الفاضل');
    const cleanName = rawName.replace(/\(.*?\)/g, '').trim();

    return {
      quote: isRtl ? item.quoteAr : item.quoteEn,
      tip: isRtl ? item.tipAr : item.tipEn,
      roleKey,
      cleanName,
      dayIndex: index + 1,
      totalQuotes: pool.length
    };
  };

  useEffect(() => {
    if (!user) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const storageKey = `school_daily_motivation_${user.id || user.email}_${todayStr}`;
    const hasSeenToday = localStorage.getItem(storageKey);

    // Auto-open if not seen today
    if (!hasSeenToday) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }

    // Also listen for manual open requests
    const handleManualOpen = () => setIsOpen(true);
    window.addEventListener('open-daily-motivation', handleManualOpen);
    return () => window.removeEventListener('open-daily-motivation', handleManualOpen);
  }, [user]);

  const handleClose = () => {
    if (user) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const storageKey = `school_daily_motivation_${user.id || user.email}_${todayStr}`;
      localStorage.setItem(storageKey, 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen || !user) return null;

  const data = getTodayMessage();
  const dateFormatted = new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const roleMeta = {
    ADMIN: {
      badgeText: isRtl ? '👑 القيادة التربوية والإدارة المدرسية' : '👑 School Leadership Portal',
      badgeBg: 'linear-gradient(135deg, #4f46e5, #4338ca)',
      badgeColor: '#ffffff',
      themeColor: '#4f46e5',
      lightBg: '#eef2ff',
      icon: '👔',
      salutation: isRtl ? `أهلاً بك يا أستاذ ${data.cleanName} 🌟` : `Welcome back, Director ${data.cleanName} 🌟`
    },
    STAFF: {
      badgeText: isRtl ? '📋 الكادر الإداري وشؤون الطلاب' : '📋 Administrative & Student Affairs',
      badgeBg: 'linear-gradient(135deg, #10b981, #059669)',
      badgeColor: '#ffffff',
      themeColor: '#10b981',
      lightBg: '#ecfdf5',
      icon: '📁',
      salutation: isRtl ? `صباح الهمة والنشاط يا ${data.cleanName} 🌟` : `Welcome, esteemed ${data.cleanName} 🌟`
    },
    TEACHER: {
      badgeText: isRtl ? '🎓 صانع الأجيال والكادر التعليمي' : '🎓 Educator & Faculty Portal',
      badgeBg: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
      badgeColor: '#ffffff',
      themeColor: '#0ea5e9',
      lightBg: '#eff6ff',
      icon: '👨‍🏫',
      salutation: isRtl ? `أهلاً بك يا أستاذ ${data.cleanName} 🌟` : `Welcome, Instructor ${data.cleanName} 🌟`
    }
  }[data.roleKey] || {
    badgeText: isRtl ? 'مرحباً بك' : 'Welcome',
    badgeBg: 'var(--primary)',
    badgeColor: '#fff',
    themeColor: '#4f46e5',
    lightBg: '#f8fafc',
    icon: '✨',
    salutation: `أهلاً بك ${data.cleanName}`
  };

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
        animation: 'fadeIn 0.25s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
          overflow: 'hidden',
          position: 'relative',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          direction: isRtl ? 'rtl' : 'ltr'
        }}
      >
        {/* Top Decorative Header */}
        <div
          style={{
            background: roleMeta.badgeBg,
            padding: '24px 28px 20px',
            color: '#ffffff',
            position: 'relative'
          }}
        >
          {/* Subtle background glow effect */}
          <div style={{
            position: 'absolute',
            top: -40,
            right: isRtl ? -40 : 'auto',
            left: isRtl ? 'auto' : -40,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.15)',
            pointerEvents: 'none'
          }} />

          {/* Close button top corner */}
          <button
            onClick={handleClose}
            type="button"
            style={{
              position: 'absolute',
              top: 18,
              left: isRtl ? 18 : 'auto',
              right: isRtl ? 'auto' : 18,
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 800,
              transition: 'all 0.15s ease'
            }}
            title={isRtl ? 'إغلاق' : 'Close'}
          >
            ✕
          </button>

          {/* Date & Palestine tag */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.22)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: 12,
              fontWeight: 700
            }}>
              <span>🗓️</span>
              <span>{dateFormatted}</span>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 14, fontSize: 11, fontWeight: 700 }}>
              <PalestineFlagIcon width={18} height={12} />
              <span>{isRtl ? 'فلسطين الحبيبة' : 'Palestine'}</span>
            </div>
          </div>

          {/* Salutation Title */}
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '6px 0 4px', letterSpacing: '-0.02em' }}>
            {roleMeta.salutation}
          </h2>
          <div style={{ fontSize: 13, opacity: 0.92, fontWeight: 500 }}>
            {roleMeta.badgeText}
          </div>
        </div>

        {/* Modal Body: Daily Quote & Inspiration Card */}
        <div style={{ padding: '24px 28px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* Daily Thought Box */}
          <div
            style={{
              background: roleMeta.lightBg,
              border: `1px solid ${roleMeta.themeColor}33`,
              borderRadius: '16px',
              padding: '20px 22px',
              position: 'relative',
              boxShadow: '0 4px 15px -3px rgba(0,0,0,0.03)'
            }}
          >
            {/* Quotation Mark Watermark */}
            <div
              style={{
                position: 'absolute',
                top: 6,
                right: isRtl ? 16 : 'auto',
                left: isRtl ? 'auto' : 16,
                fontSize: 48,
                lineHeight: 1,
                color: roleMeta.themeColor,
                opacity: 0.18,
                fontFamily: 'serif',
                pointerEvents: 'none'
              }}
            >
              “
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>✨</span>
              <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: roleMeta.themeColor, letterSpacing: '0.04em' }}>
                {isRtl ? 'رسالة وطاقة اليوم المتجددة' : 'Daily Energy & Inspiration'}
              </span>
            </div>

            <p style={{
              margin: 0,
              fontSize: 15,
              lineHeight: 1.7,
              fontWeight: 600,
              color: '#1e293b'
            }}>
              {data.quote}
            </p>
          </div>

          {/* Actionable Daily Tip Box */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
              fontWeight: 600,
              color: '#334155'
            }}
          >
            <span>{data.tip}</span>
          </div>

          {/* Footer Action */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 4, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
              {isRtl ? '✨ تظهر هذه النافذة مرة واحدة يومياً لتجديد شغفك' : '✨ Displays once a day to refresh your energy'}
            </div>

            <button
              type="button"
              onClick={handleClose}
              style={{
                background: roleMeta.badgeBg,
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 24px',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: `0 8px 18px -4px ${roleMeta.themeColor}55`,
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span>{isRtl ? 'انطلق نحو يومك بشغف 🚀' : 'Start Your Day with Energy 🚀'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
