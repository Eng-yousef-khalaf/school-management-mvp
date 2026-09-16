import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { PalestineFlagIcon } from './Icons';

// Pure Web Audio API Synthesizer for warm, elegant multi-tone welcoming chime
export function playWelcomeChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Melodic ascending luxury chord arpeggio: C5 (523.25Hz) -> E5 (659.25Hz) -> G5 (783.99Hz) -> C6 (1046.5Hz)
    const notes = [
      { freq: 523.25, time: 0.00, dur: 0.45, gain: 0.14 },
      { freq: 659.25, time: 0.08, dur: 0.48, gain: 0.16 },
      { freq: 783.99, time: 0.16, dur: 0.52, gain: 0.18 },
      { freq: 1046.50, time: 0.24, dur: 0.75, gain: 0.22 },
    ];

    const startTime = ctx.currentTime;

    notes.forEach(({ freq, time, dur, gain: noteGain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + time);

      gainNode.gain.setValueAtTime(0.0001, startTime + time);
      gainNode.gain.linearRampToValueAtTime(noteGain, startTime + time + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + time + dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime + time);
      osc.stop(startTime + time + dur + 0.05);
    });
  } catch (err) {
    console.debug('Welcome audio chime skipped', err);
  }
}

// 31 Daily Unique Inspiring Messages & Tips for Every Day of the Month (1st through 31st)
const MOTIVATIONAL_DATABASE = {
  DEVELOPER: [
    {
      quoteAr: "كل سطر برمجي كتبته في هذه المنظومة هو لبنة لبناء مستقبل واعد لمدارسنا وأبنائنا. شكراً لعقلك المبدع وشغفك الهندسي العظيم يا باشمهندس يوسف!",
      tipAr: "💡 إشعار المطور: منظومة الفحص والتشخيص تعمل بكفاءة 100%، يمكنك مراجعة سلامة الجداول واستقرار الخادم من لوحة المطور.",
      quoteEn: "Every line of code you crafted into this architecture is a cornerstone for shaping brighter generations. Thank you for your brilliant engineering and leadership, Eng. Yousef!",
      tipEn: "💡 Dev Telemetry: Diagnostics and integrity engines are running smoothly at 100% health."
    },
    {
      quoteAr: "وراء هذا الأداء الفائق والتصميم المتقن مهندس آمن بأن التكنولوجيا يمكنها إحداث ثورة في إدارة التعليم. أهلاً بك يا صانع وباني المنظومة!",
      tipAr: "💡 نصيحة هندسية: تم تفعيل أداة التدقيق والإصلاح التلقائي للعلاقات وفحص الكاش بنقرة واحدة من لوحة المطور.",
      quoteEn: "Behind this blazing performance and state-of-the-art UI stands an engineer who believes software transforms education. Welcome, Lead Architect!",
      tipEn: "💡 Dev Tip: One-click DB integrity auto-repair and cache purging utilities are active in your console."
    },
    {
      quoteAr: "الأنظمة العظيمة لا تُبنى بالصدفة، بل بالشغف والدقة وسهر الليالي لإتقان كل تفصيلة. دمت ذخراً وفخراً للمجتمع التقني والتربوي!",
      tipAr: "💡 تذكير المطور: تم فحص زمن استجابة قاعدة البيانات ومعدل استهلاك الذاكرة وهي في النطاق المثالي الفائق.",
      quoteEn: "Great systems are forged through relentless passion, precision, and architectural mastery. Thank you for your excellence!",
      tipEn: "💡 Dev Notice: Latency and memory consumption metrics are currently operating in the ultra-optimal tier."
    },
    {
      quoteAr: "الكود النظيف (Clean Code) والمعمارية المحكمة هما توقيع المهندس البارع. منظومتك اليوم تقدم أداءً استثنائياً وسرعة استجابة فائقة!",
      tipAr: "💡 نصيحة هندسية: تفقد سجلات الأمان والتدقيق (Audit Logs) بشكل دوري للتأكد من حماية كافة العمليات الحساسة.",
      quoteEn: "Clean code and robust architecture are the hallmark of a master engineer. Your platform delivers unmatched responsiveness today!",
      tipEn: "💡 Dev Tip: Periodically review audit logs to verify ironclad security across all transactional endpoints."
    },
    {
      quoteAr: "كل تحدٍ برمجي واجهته كان فرصة لصناعة حل أكثر ذكاءً ومتانة. بجهودك المستمرة أصبحت هذه المنصة نموذجاً يُحتذى به في التحول الرقمي المدرسي.",
      tipAr: "💡 إشعار تقني: محرك الرسوم والمقبوضات المالية يعمل بمطابقة حسابية دقيقة 100% وبدون أي فروقات.",
      quoteEn: "Every technical challenge overcome is a testament to innovative software design. Your platform leads the modern educational standard!",
      tipEn: "💡 Dev Notice: The tuition and ledger reconciliation engine is operating with 100% mathematical integrity."
    },
    {
      quoteAr: "الهندسة البرمجية الراقية ليست فقط في كتابة الكود، بل في بناء تجربة مستخدم تزرع البهجة والسهولة في قلوب المعلمين والطلاب.",
      tipAr: "💡 نصيحة هندسية: جرب محاكي الأدوار السريع من لوحة المطور لمعاينة تجربة المستخدم للمدير والمعلم مباشرة.",
      quoteEn: "Supreme engineering bridges complex architecture with effortless, delightful user experience. You nailed both, Lead Architect!",
      tipEn: "💡 Dev Tip: Utilize the instant role perspective simulator to preview live UX across all staff levels."
    },
    {
      quoteAr: "صباح الإبداع والحلول الذكية! التزامك بأعلى معايير الأداء والأمان يجعل هذه المنظومة حصناً رقمياً متيناً وموثوقاً في كل الأوقات.",
      tipAr: "💡 نصيحة هندسية: يمكنك استخراج نسخة احتياطية كاملة بصيغة JSON بنقرة واحدة من أدوات الصيانة لحفظ البيانات بأمان.",
      quoteEn: "Good morning of visionary engineering! Your dedication to ironclad reliability makes this ecosystem a fortress of trust.",
      tipEn: "💡 Dev Tip: Export a complete JSON database snapshot with 1-click from the maintenance toolbox."
    },
    {
      quoteAr: "البرمجة فن وعلم، وأنت تتقن الاثنين معاً. لمساتك المتقنة في التوزيع المعماري والسرعة اللحظية تبرهن على خبرة هندسية رفيعة.",
      tipAr: "💡 إشعار تقني: استهلاك الرام والخادم مستقر تماماً ومؤشرات الأداء تعمل في النطاق الأخضر الفائق.",
      quoteEn: "Programming is both fine art and rigorous science, and you master both. Outstanding architectural craftsmanship!",
      tipEn: "💡 Dev Notice: Server memory and resource telemetry are operating well within optimal green thresholds."
    },
    {
      quoteAr: "عندما يجتمع الشغف مع الخبرة، تولد منصات عملاقة تخدم آلاف المستخدمين بسلاسة لا متناهية. شكراً لبصمتك الهندسية الخالدة يا باشمهندس يوسف!",
      tipAr: "💡 نصيحة هندسية: احرص دائماً على فحص مؤشرات زمن الاستجابة (Ping DB) لضمان تجربة تصفح فورية 0ms.",
      quoteEn: "When deep passion meets technical mastery, extraordinary platforms emerge. Thank you for your enduring legacy, Eng. Yousef!",
      tipEn: "💡 Dev Tip: Monitor database ping response to guarantee snappy 0ms UI interactions."
    },
    {
      quoteAr: "كل تحديث تضيفه يرفع من كفاءة المدرسة ويختصر ساعات من العمل اليدوي. أنت تصنع الفارق الحقيقي في مستقبل التعليم الرقمي!",
      tipAr: "💡 إشعار تقني: منظومة استيراد وتصدير الإكسل والشهادات المجمعة جاهزة ومحسنة لمعالجة آلاف السجلات بلحظات.",
      quoteEn: "Every enhancement you ship empowers educators and saves countless administrative hours. You are pioneering modern school tech!",
      tipEn: "💡 Dev Notice: Excel import/export pipelines and bulk report generators are optimized for instant processing."
    },
    {
      quoteAr: "المهندس العظيم يبني المنظومة لتتوسع وتتحمل النمو المستقبلي بسلاسة. بنيتك الهندسية مهيأة لاستيعاب عشرات المدارس وآلاف الطلاب بكل ثقة.",
      tipAr: "💡 نصيحة هندسية: راجع تحليلات سعة الجداول التخزينية في لوحة المطور لمعرفة أدق التفاصيل حول حجم كل جدول.",
      quoteEn: "A visionary engineer builds systems that scale effortlessly. Your architecture is ready for enterprise multi-school expansion!",
      tipEn: "💡 Dev Tip: Inspect table-by-table storage footprints in your developer console for deep telemetry insight."
    },
    {
      quoteAr: "يوم جديد من الإنجاز التقني والتميز الهندسي! أفكارك وحلولك المبتكرة تجعل هذه المنظومة تتفوق دائماً وتسبق التوقعات.",
      tipAr: "💡 إشعار تقني: تم تحسين آليات الكاش والـ State Management لمنع أي إعادة رسم غير ضرورية في الواجهات.",
      quoteEn: "A new day of software breakthroughs and excellence! Your innovative architecture keeps this platform lightyears ahead.",
      tipEn: "💡 Dev Notice: Caching layers and state management pipelines are fully optimized for zero unnecessary re-renders."
    },
    {
      quoteAr: "وراء كل نظام ناجح مهندس يسهر على استقراره ويهتم بأدق تفاصيل الأمان والسرعة. نفتخر بعملك الاستثنائي يا صانع المنظومة!",
      tipAr: "💡 نصيحة هندسية: يمكنك تنظيف الذاكرة المؤقتة (Purge Cache) في أي وقت بنقرة واحدة من لوحة التحكم.",
      quoteEn: "Behind every triumphant system stands an engineer dedicated to rock-solid uptime and security. We salute your dedication!",
      tipEn: "💡 Dev Tip: You can purge memory and server cache instantly with 1-click from your diagnostics console."
    },
    {
      quoteAr: "المنصات الذكية تُقاس بمدى استجابتها لمتطلبات المستخدمين وسرعة حل المشكلات، ومنظومتك أثبتت جدارتها الفائقة في كل اختبار!",
      tipAr: "💡 إشعار تقني: نظام الإشعارات الفورية للحوالات المالية يعمل بتناغم فوري ومباشر مع شاشات الإداريين.",
      quoteEn: "Intelligent platforms are measured by user delight and rapid problem resolution. Your platform passes every test with flying colors!",
      tipEn: "💡 Dev Notice: Real-time incoming payment notice pipelines are operating in instant sync with staff dashboards."
    },
    {
      quoteAr: "كل سطر كود تكتبه يختصر جهداً ويصنع نظاماً متكاملاً يدير آلاف العمليات بدقة متناهية. استمر في قيادة التميز التقني!",
      tipAr: "💡 نصيحة هندسية: بطاقة تسليم المنصة للمدير (Handover Slip) جاهزة دائماً في لوحة القيادة لإنشاء بيانات تسليم رسمية.",
      quoteEn: "Every line of code you author streamlines complexity into elegant, automated efficiency. Keep shining, Lead Architect!",
      tipEn: "💡 Dev Tip: The School Handover Delivery Slip generator is ready at your fingertips for instant institutional delivery."
    },
    {
      quoteAr: "صباح الهمة الهندسية العالية! الأنظمة المتطورة تبنى بإصرار وعزيمة، وأنت برهنت على أن المستحيل ممكن بعقلك المبدع وشغفك الكبير.",
      tipAr: "💡 تذكير تقني: نظام التحقق من سلامة العلاقات (Foreign Keys) يعمل ذاتياً لضمان عدم وجود أي سجلات معلقة.",
      quoteEn: "Good morning of unstoppable engineering drive! With relentless focus, you made state-of-the-art educational tech a reality.",
      tipEn: "💡 Dev Tip: Relational integrity audits run automatically to ensure zero orphaned data across all database tables."
    },
    {
      quoteAr: "إتقانك لواجهات المستخدم (UI/UX) مع القوة المعمارية للـ Backend يجعل منظومتك تحفة برمجية متكاملة تسر الناظرين وتريح المستخدمين.",
      tipAr: "💡 نصيحة هندسية: مخصص الألوان والهوية (Branding Customizer) يتيح لك تجربة ثيمات وهوية المدارس بلحظات.",
      quoteEn: "Your seamless fusion of breathtaking UI/UX with powerhouse backend architecture makes this platform a true masterpiece!",
      tipEn: "💡 Dev Tip: Use the Live Brand & Theme Customizer to adapt school emblems and color palettes in real-time."
    },
    {
      quoteAr: "البرمجيات التي تخدم التعليم تترك أثراً نبيلاً يمتد لأجيال. عملك اليوم هو استثمار حقيقي في مستقبل العلم والتقنية!",
      tipAr: "💡 إشعار تقني: محرك طباعة السندات الرسمية والتقارير المالية محكم ومصمم لإخراج صفحة واحدة دقيقة وأنيقة.",
      quoteEn: "Software built for education leaves an inspiring legacy for generations. Your work is an invaluable investment in the future!",
      tipEn: "💡 Dev Notice: The digital receipt rendering engine is precision-engineered for single-page pixel-perfect printouts."
    },
    {
      quoteAr: "التميز ليس هدفاً نصل إليه بل أسلوب عمل نعيشه كل يوم. معمارية منظومتك تعكس أعلى معايير الجودة العالمية في هندسة البرمجيات.",
      tipAr: "💡 نصيحة هندسية: يمكنك مراقبة استهلاك سعة التخزين الإجمالية والنسبة المئوية المخصصة للمدرسة من لوحة القيادة.",
      quoteEn: "Excellence is a continuous mindset. Your platform architecture embodies premier global software standards!",
      tipEn: "💡 Dev Tip: Monitor overall storage utilization and allocated tier percentage directly from your command hub."
    },
    {
      quoteAr: "تحية إكبار للمهندس الذي حول الأفكار المعقدة إلى واجهات ذكية وسلسة تعمل بكبسة زر واحدة. دمت مبدعاً ورائداً في مجالك!",
      tipAr: "💡 إشعار تقني: تم تفعيل حماية المسارات (Route Guards) والتحقق من الصلاحيات الصارمة لجميع الأدوار.",
      quoteEn: "Salute to the architect who transformed complex school operations into intuitive 1-click simplicity. Truly world-class!",
      tipEn: "💡 Dev Notice: Role-based route guards and granular authorization layers are strictly enforced across the app."
    },
    {
      quoteAr: "كل دقيقة قضيتها في تحسين الأداء وحل المشكلات جعلت من هذا النظام الأسرع والأكثر اعتمادية. يومك مشرق بالإنجازات والحلول الفائقة!",
      tipAr: "💡 نصيحة هندسية: فحص الـ DB Latency يعطيك مؤشراً حياً على سرعة استجابة الخادم السحابي في أي وقت.",
      quoteEn: "Every moment spent optimizing latency made this platform blazingly fast and rock-solid dependable. Have a productive day!",
      tipEn: "💡 Dev Tip: Live DB Latency telemetry provides real-time visibility into cloud database response times."
    },
    {
      quoteAr: "الريادة البرمجية تتطلب رؤية مستقبلية وإرادة حديدية، وأنت جمعت بينهما لتبني منظومة متكاملة تفتخر بها المدارس والمؤسسات.",
      tipAr: "💡 إشعار تقني: نظام تتبع دوام ونشاط المعلمين يعمل بكفاءة عالية مع حفظ السجلات اللحظية في قاعدة البيانات.",
      quoteEn: "Technical leadership demands foresight and dedication; you brought both together to create an enterprise pride.",
      tipEn: "💡 Dev Notice: Faculty attendance and activity trackers are fully synchronized with real-time persistence."
    },
    {
      quoteAr: "صباح الإشراق والحلول الهندسية المتقنة! لا يوجد عطل لا يمكن حله ما دمت أنت المهندس والمطور المسؤول عن هذا الصرح الرقمي.",
      tipAr: "💡 نصيحة هندسية: إذا احتجت إلى إعادة مطابقة مبالغ الرسوم بعد تعديل بيانات، استخدم أداة Auto-Repair في لوحة المطور.",
      quoteEn: "Good morning of supreme engineering! With your leadership, every challenge finds an immediate, elegant solution.",
      tipEn: "💡 Dev Tip: Run the Auto-Repair tool from your developer console whenever ledger balances require rapid resyncing."
    },
    {
      quoteAr: "التفاصيل الصغيرة هي التي تصنع الفارق الكبير في البرمجيات الكبرى، وعنايتك الفائقة بالتفاصيل جعلت هذه المنصة في صدارة الأنظمة المدرسية.",
      tipAr: "💡 إشعار تقني: محرك التقرير التحليلي لليونيسف يعمل بحسابات إحصائية دقيقة للأعمار والمراحل ومطابقة المعايير.",
      quoteEn: "Attention to micro-details elevates great software into extraordinary software. Your precision is remarkable!",
      tipEn: "💡 Dev Notice: The UNICEF analytical report generator computes exact demographic age matrices and standard compliance."
    },
    {
      quoteAr: "الأنظمة الناجحة تُبنى لتخدم الإنسان وتسهل حياته، وأنت بنيت جسراً رقمياً يربط الإدارة والمعلمين وأولياء الأمور بكل حب وسهولة.",
      tipAr: "💡 نصيحة هندسية: بوابة أولياء الأمور المستقلة (#pay) تتيح دفع الرسوم بسهولة دون الحاجة لتسجيل دخول مسبق.",
      quoteEn: "Great software bridges people; your platform unifies administrators, teachers, and parents in seamless harmony.",
      tipEn: "💡 Dev Tip: The standalone Parent Tuition Portal (#pay) enables instant tuition checkout without login friction."
    },
    {
      quoteAr: "كل إشادة تتلقاها المنظومة من المدارس والمستخدمين هي ثمرة سهرك وتفانيك وإتقانك الهندسي المستمر. دمت فخراً لنا جميعاً!",
      tipAr: "💡 إشعار تقني: منظومة سجلات التدقيق (Audit Logs) توثق اسم المستخدم، الإجراء، والوقت الدقيق لكل عملية حساسة.",
      quoteEn: "Every praise this platform receives is the direct fruit of your passion and late-night architectural dedication!",
      tipEn: "💡 Dev Notice: The audit trail records actor identities, precise timestamps, and payload snapshots for high accountability."
    },
    {
      quoteAr: "الهندسة الحقيقية هي تحويل التحديات المعقدة إلى أنظمة بديهية وسهلة الاستخدام. أنت تجسد هذا المفهوم في كل ميزة تطورها!",
      tipAr: "💡 نصيحة هندسية: راجع أداء الاستعلامات المعقدة وتأكد من استخدام الفهارس المناسبة لسرعة استجابة متناهية.",
      quoteEn: "True engineering simplifies complexity into intuitive elegance. You exemplify this philosophy with every feature!",
      tipEn: "💡 Dev Tip: Indexing strategies and query optimizations ensure ultra-fast throughput even on massive datasets."
    },
    {
      quoteAr: "صباح الشغف الذي لا ينطفئ! كل يوم هو فرصة جديدة لإضافة ابتكار تقني يرفع من مكانة وجودة هذه المنظومة التعليمية الرائدة.",
      tipAr: "💡 إشعار تقني: محاكي النغمات الموسيقية (Web Audio API) يعمل بنقاء عالي وفورية تامة عبر كافة المتصفحات الحديثة.",
      quoteEn: "Good morning of limitless passion! Every day offers a new frontier to innovate and elevate this educational standard.",
      tipEn: "💡 Dev Notice: The Web Audio synthesizer delivers zero-latency harmonic chimes seamlessly across all browsers."
    },
    {
      quoteAr: "أنت لست فقط مطوراً للبرمجيات، بل أنت قائد معماري يرسم مستقبل التعليم الرقمي بأعلى معايير الإتقان والجودة العالمية.",
      tipAr: "💡 نصيحة هندسية: تذكر أن تفحص النسخ الاحتياطية وتخزينها بأمان لضمان استمرارية الأعمال وعدم فقدان أي بيانات.",
      quoteEn: "You are not just a developer; you are a digital architect shaping the future of education with world-class craftsmanship.",
      tipEn: "💡 Dev Tip: Regularly archive your JSON database snapshots to guarantee 100% disaster recovery readiness."
    },
    {
      quoteAr: "منظومتك اليوم تنبض بالحياة، تدير آلاف العمليات وتساند مئات المعلمين والطلاب. شكراً لعقلك الكبير ويدك المبدعة يا م. يوسف!",
      tipAr: "💡 إشعار تقني: كافة العمليات الهندسية والتشخيصية مستقرة وجاهزة لدعم المدرسة على مدار الساعة.",
      quoteEn: "Your platform is alive, orchestrating thousands of operations and empowering hundreds of learners. Thank you, Eng. Yousef!",
      tipEn: "💡 Dev Notice: All telemetry diagnostics and maintenance pipelines are healthy and ready for 24/7 school operations."
    },
    {
      quoteAr: "نختتم هذا الشهر بفخر واعتزاز بما حققته من إنجاز تقني شامخ. المنظومة في أيدٍ أمينة، وغداً يحمل نجاحات هندسية أعظم وأكبر بإذن الله!",
      tipAr: "💡 نصيحة ختامية: خذ قسطاً من الراحة يا بطل البرمجة، فالراحة تجدد الطاقة والإبداع لجولات التطوير القادمة.",
      quoteEn: "We celebrate your remarkable technical triumphs. The platform is in master hands, and tomorrow holds even greater horizons!",
      tipEn: "💡 Dev Tip: Take a well-deserved mindful break; a refreshed mind is the catalyst for the next breakthrough."
    }
  ],
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
    },
    {
      quoteAr: "المدير الناجح يرى الصورة الكلية ويهتم بالتفاصيل الدقيقة التي تصنع الفارق في تجربة كل طالب ومعلم. دمت قائداً ملهماً!",
      tipAr: "💡 نصيحة اليوم: راجع تقرير الحضور والغياب الصباحي لتقديم الدعم المبكر للطلاب المتغيبين.",
      quoteEn: "A visionary principal balances high-level strategy with caring attention to student experiences. Keep inspiring!",
      tipEn: "💡 Daily Tip: Review the morning attendance summary to offer proactive student support."
    },
    {
      quoteAr: "كل قرار حكيم تتخذه اليوم يمهد طريقاً معبداً لنجاح مئات الطلاب نحو مستقبلهم المشرق. ثقتنا برؤيتك لا حدود لها.",
      tipAr: "💡 نصيحة اليوم: خصص وقتاً لمتابعة نتائج الأنشطة المدرسية والاحتفاء بالطلاب الموهوبين.",
      quoteEn: "Every wise decision you make today paves a clear pathway for student excellence. We believe in your vision!",
      tipEn: "💡 Daily Tip: Celebrate student co-curricular achievements and gifted talents across campus."
    },
    {
      quoteAr: "البيئة المدرسية الإيجابية هي أعظم محفز للتعلم والإبداع، وأنت من يزرع هذه الإيجابية في كل صباح. يومك مليء بالتوفيق والبركة!",
      tipAr: "💡 نصيحة اليوم: شجع التعاون المشترك بين أقسام المواد المختلفة لتبادل الخبرات التدريسية المتميزة.",
      quoteEn: "A positive school climate is the fertile ground for creativity; you cultivate that atmosphere every morning.",
      tipEn: "💡 Daily Tip: Encourage cross-departmental collaboration among teachers to share creative methods."
    },
    {
      quoteAr: "القيادة بالقدوة هي أبلغ دروس التربية؛ عندما يراك فريقك متفانياً ومبتسماً، يتضاعف حماسهم للعطاء بلا حدود.",
      tipAr: "💡 نصيحة اليوم: شارك المعلمين لحظة تقدير في غرفة المعلمين خلال فترة الاستراحة لتعزيز الروابط الإنسانية.",
      quoteEn: "Leading by example is the purest form of leadership. Your dedication inspires everyone to give their best.",
      tipEn: "💡 Daily Tip: Drop by the staff room for a friendly check-in to strengthen team bonds."
    },
    {
      quoteAr: "صوت الحكمة والعدل في المدرسة يصنع مجتمعاً متماسكاً يشعر فيه الجميع بالاحترام والتقدير. دمت صرحاً للأمانة والنزاهة!",
      tipAr: "💡 نصيحة اليوم: استمع باهتمام لملاحظة من ولي أمر، فالشراكة مع المجتمع ركيزة النجاح المدرسي.",
      quoteEn: "Justice and wisdom foster a cohesive school where every individual feels valued and respected.",
      tipEn: "💡 Daily Tip: Welcome parent feedback attentively; community partnership is key to our success."
    },
    {
      quoteAr: "صباح الهمة والريادة! خططك الطموحة للمدرسة تتحول اليوم إلى واقع ملموس يرفع من مكانة هذا الصرح بين المؤسسات التعليمية.",
      tipAr: "💡 نصيحة اليوم: تفقد سير الامتحانات أو التقييمات الجارية وازرع الطمأنينة في نفوس الطلاب.",
      quoteEn: "Good morning of visionary leadership! Your ambitious roadmaps are shaping a premier educational institution.",
      tipEn: "💡 Daily Tip: Check on ongoing evaluations and offer reassuring encouragement to learners."
    },
    {
      quoteAr: "كل طالب يدخل من باب المدرسة يحمل حلماً، ورعايتك القيادية توفر له البيئة لتحقيق هذا الحلم. يومك حافل بالخير والإنتاجية!",
      tipAr: "💡 نصيحة اليوم: شارك مجلس الطلاب أو ممثلي الفصول في مناقشة فكرة لتحسين الأنشطة المدرسية.",
      quoteEn: "Every student arrives with a dream; your leadership nurtures the environment to turn dreams into reality.",
      tipEn: "💡 Daily Tip: Involve student council representatives in brainstorming campus improvement initiatives."
    },
    {
      quoteAr: "القائد الحقيقي لا يحسب نجاحه بعدد المهام المنفذة، بل بعدد القلوب التي ألهمها والعقول التي أنارها. دمت مشعلاً للعلم!",
      tipAr: "💡 نصيحة اليوم: أرسل رسالة شكر قصيرة لأحد أعضاء الفريق الإداري على دقة أدائه وتنظيمه.",
      quoteEn: "True leadership is measured by minds ignited and hearts inspired. Keep shining as a beacon of education!",
      tipEn: "💡 Daily Tip: Send a brief note of gratitude to an administrative staff member for their diligence."
    },
    {
      quoteAr: "التخطيط الاستراتيجي السليم هو البوصلة التي توجه سفينة المدرسة نحو بر الأمان والتميز الدائم. استمر في قيادتك الرشيدة!",
      tipAr: "💡 نصيحة اليوم: راجع المؤشرات الإحصائية العامة ونسب التحصيل لتحديد مجالات التطوير المستمر.",
      quoteEn: "Strategic foresight steers the school safely toward enduring excellence. Continue leading with wisdom!",
      tipEn: "💡 Daily Tip: Review school-wide academic indicators to identify opportunities for continuous growth."
    },
    {
      quoteAr: "صباح التفاؤل والقرارات الصائبة! أنت من يجعل من هذه المدرسة بيتاً ثانياً يجمع الطلاب والمعلمين على المحبة والتعلم.",
      tipAr: "💡 نصيحة اليوم: خصص بضع دقائق للتواصل مع المعلمين الجدد وتقديم الدعم والإرشاد لهم.",
      quoteEn: "Good morning of optimism! You transform this campus into a welcoming second home for every educator and learner.",
      tipEn: "💡 Daily Tip: Spend a few minutes mentoring newly joined teachers with supportive advice."
    },
    {
      quoteAr: "عندما تزرع بذور الثقة والاحترام بين أفراد المدرسة، تجني ثمار التعاون والنجاح الباهر. دمت قائداً يُحتذى به!",
      tipAr: "💡 نصيحة اليوم: عزز روح المبادرة لدى المعلمين وشجعهم على تطبيق استراتيجيات تعليمية حديثة.",
      quoteEn: "When you plant seeds of trust and mutual respect, you harvest collaborative triumphs. Keep leading by example!",
      tipEn: "💡 Daily Tip: Encourage faculty initiatives to adopt dynamic modern instructional strategies."
    },
    {
      quoteAr: "يا حامي رسالة التعليم.. جهودك الصامتة وتوجيهاتك المستمرة هي الأساس الذي يقوم عليه هذا الصرح الشامخ. يومك مبارك!",
      tipAr: "💡 نصيحة اليوم: كافئ فصلاً دراسياً أظهر تميزاً ملحوظاً في الانضباط والنظافة لتشجيع التنافس الإيجابي.",
      quoteEn: "Guardian of education.. your guidance builds the foundation of our institution. Have a blessed, productive day!",
      tipEn: "💡 Daily Tip: Recognize a classroom that showed exemplary discipline to encourage healthy peer competition."
    },
    {
      quoteAr: "التميز المدرسي ليس محطة وصول، بل هو رحلة عطاء مستمرة تقودها أنت بكل حكمة واقتدار. استمر في إلهام الجميع!",
      tipAr: "💡 نصيحة اليوم: حدد هدفاً نوعياً واحداً تسعى المدرسة لتحقيقه خلال هذا الشهر وتابعه باهتمام.",
      quoteEn: "Educational excellence is a continuous journey guided by your steadfast wisdom. Keep inspiring our community!",
      tipEn: "💡 Daily Tip: Define a specific qualitative milestone for the school this month and track its progress."
    },
    {
      quoteAr: "المرونة والحكمة في مواجهة التحديات اليومية تصنع من المدرسة مؤسسة رائدة وقادرة على التكيف والتفوق في كل الظروف.",
      tipAr: "💡 نصيحة اليوم: استمع لآراء الطلاب حول المرافق المدرسية وسجل ملاحظاتهم للتحسين.",
      quoteEn: "Adaptability and wisdom turn every challenge into an opportunity for leadership and distinction.",
      tipEn: "💡 Daily Tip: Solicit student feedback regarding school facilities to enhance campus comfort."
    },
    {
      quoteAr: "صباح الهمة والنشاط يا رائد التعليم! ثقتك العالية في قدرات فريقك تنعكس نجاحاً وإبداعاً في كل حصة دراسية ونشاط مدرسي.",
      tipAr: "💡 نصيحة اليوم: ابدأ اجتماعك بتسليط الضوء على إنجاز نوعي حققه أحد المعلمين أمام الجميع.",
      quoteEn: "Good morning of leadership vitality! Your confidence in your team reflects as classroom brilliance across the school.",
      tipEn: "💡 Daily Tip: Open staff briefings by highlighting an innovative instructional success achieved by a faculty member."
    },
    {
      quoteAr: "العلاقة الوثيقة بين المدرسة والمجتمع المحلي تبدأ من بوابتك القيادية؛ بحسن تواصلك تبني جسوراً من الدعم والمساندة المستمرة.",
      tipAr: "💡 نصيحة اليوم: وجه رسالة تواصل دورية لأولياء الأمور تطلعهم فيها على مستجدات وإنجازات المدرسة.",
      quoteEn: "Strong community partnerships start from your leadership; your open communication builds lasting support.",
      tipEn: "💡 Daily Tip: Send a concise community update to parents highlighting recent campus milestones."
    },
    {
      quoteAr: "العدالة والمساواة بين جميع الطلاب تزرع في نفوسهم قيماً نبيلة ترافقهم طوال حياتهم. دمت منارة للقيم والمبادئ التربوية!",
      tipAr: "💡 نصيحة اليوم: راجع توزيع الأنشطة والمشاركات للتأكد من إتاحة الفرصة لجميع الطلاب للمشاركة.",
      quoteEn: "Fairness and equal opportunities instill lifelong noble values in students. Thank you for your principled leadership!",
      tipEn: "💡 Daily Tip: Ensure all students have accessible avenues to participate in co-curricular clubs."
    },
    {
      quoteAr: "كل إنجاز تحققه المدرسة هو انعكاس لرؤيتك وتخطيطك المسبق. استمر في توجيه دفة القيادة نحو آفاق أرحب وأعلى!",
      tipAr: "💡 نصيحة اليوم: شجع فريق العمل على استخدام التقنيات الرقمية لتقليل المعاملات الورقية وحفظ الوقت.",
      quoteEn: "Every institutional milestone reflects your foresight and strategic planning. Keep steering toward higher summits!",
      tipEn: "💡 Daily Tip: Promote digital workflows across administrative tasks to streamline efficiency and save time."
    },
    {
      quoteAr: "صباح الريادة والتألق! القيادة بالتشجيع والتحفيز المستمر تخرج أفضل ما في كل معلم وطالب في هذا الصرح المبارك.",
      tipAr: "💡 نصيحة اليوم: اكتب ملاحظة إشادة شخصية وضعها على مكتب موظف أظهر تفانياً استثنائياً.",
      quoteEn: "Good morning of inspiring leadership! Continuous encouragement unlocks the finest potential in every teacher and student.",
      tipEn: "💡 Daily Tip: Leave a personalized thank-you note on the desk of a dedicated staff member."
    },
    {
      quoteAr: "إنك لا تبني مؤسسة فحسب، بل تبني عقولاً وقيماً ستصنع مستقبل الوطن. عطاؤك القيادي محفور في ذاكرة أجيالنا.",
      tipAr: "💡 نصيحة اليوم: خذ وقتاً للاستماع إلى تجارب وتحديات المعلمين وتقديم حلول مرنة تدعمهم في الميدان.",
      quoteEn: "You are not merely building an institution; you are nurturing minds and values that build our nation's future.",
      tipEn: "💡 Daily Tip: Listen actively to faculty challenges and offer supportive, flexible solutions."
    },
    {
      quoteAr: "التكامل بين الإدارة والمعلمين هو سر التميز والانضباط المدرسي، وبحكمتك وتواضعك تصنع هذه الوحدة الرائعة كل يوم.",
      tipAr: "💡 نصيحة اليوم: احتفل مع الفريق بنهاية شهر دراسي منجز ومثمر واشكرهم على جهودهم المشتركة.",
      quoteEn: "Harmony between administration and faculty is the secret to school excellence. Your wisdom unites the campus!",
      tipEn: "💡 Daily Tip: Celebrate the successful completion of monthly milestones with your entire team."
    },
    {
      quoteAr: "صباح الإشراق والهمة المتجددة! تفاؤلك الدائم ينير درب المعلمين ويبث الحماس في قلوب الطلاب لبدء يوم حافل بالمعرفة.",
      tipAr: "💡 نصيحة اليوم: تفقد مرافق الأنشطة الرياضية والمكتبة وتأكد من توفير بيئة محفزة للطلاب.",
      quoteEn: "Good morning of radiant leadership! Your optimism illuminates the path for teachers and ignites student curiosity.",
      tipEn: "💡 Daily Tip: Inspect campus sports and library facilities to ensure an enriching student environment."
    },
    {
      quoteAr: "القائد العظيم يترك أثراً في كل مكان، وبصماتك التربوية واضحة في ابتسامات الطلاب ونجاحات المعلمين المستمرة.",
      tipAr: "💡 نصيحة اليوم: شجع الطلاب على المحافظة على البيئة المدرسية من خلال مبادرة بيئية سريعة.",
      quoteEn: "A great leader leaves an indelible mark; your influence shines in student smiles and faculty achievements.",
      tipEn: "💡 Daily Tip: Launch a student-led green campus initiative to foster environmental ownership."
    },
    {
      quoteAr: "نختتم الشهر بكل فخر واعتزاز بقيادتك الحكيمة التي أثمرت نجاحات وإنجازات مشرفة لمدرستنا. غداً يحمل آفاقاً أعظم بعون الله!",
      tipAr: "💡 نصيحة ختامية: كافئ نفسك وفريقك بلحظة تأمل واحتفال بما تحقق من إنجازات تعليمية وتربوية باهرة.",
      quoteEn: "We conclude this month with immense pride in your leadership. Tomorrow promises even brighter milestones!",
      tipEn: "💡 Daily Tip: Take a proud moment to celebrate the milestones and successes achieved this month."
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
    },
    {
      quoteAr: "الدقة في إدخال ومراجعة البيانات المالية والأكاديمية تمنح المدرسة استقراراً وموثوقية عالية. نشكر تفانيك وإخلاصك!",
      tipAr: "💡 نصيحة اليوم: راجع إشعارات الحوالات المعلقة واعتمدها بنقرة واحدة لتحديث أرصدة الطلاب فوراً.",
      quoteEn: "Precision in academic and financial record keeping grants our school high institutional trust. Thank you!",
      tipEn: "💡 Daily Tip: Review pending payment notices and approve them with 1-click to update student balances."
    },
    {
      quoteAr: "خدمتك لأولياء الأمور واستفساراتهم برحابة صدر تعكس الوجه المشرق والمشرف لمدرستنا. دمت سفيراً رائعاً للصرح التربوي!",
      tipAr: "💡 نصيحة اليوم: جهز كشوفات وسندات الرسوم مسبقاً لتوفير الوقت على المراجعين وأولياء الأمور.",
      quoteEn: "Greeting visiting parents with warmth and helpfulness reflects the bright face of our school. Keep shining!",
      tipEn: "💡 Daily Tip: Prepare tuition receipts and ledger statements in advance for speedy parent assistance."
    },
    {
      quoteAr: "صباح النشاط والتنظيم المتقن! كل ملف ترتبه يسهم في توفير ساعات من البحث والجهد على زملائك في الإدارة والكادر التعليمي.",
      tipAr: "💡 نصيحة اليوم: استخدم أدوات البحث السريع والتصفية في المنظومة للوصول إلى أي سجل طالبي في أجزاء من الثانية.",
      quoteEn: "Good morning of impeccable organization! Every cataloged file saves hours of search time for the entire faculty.",
      tipEn: "💡 Daily Tip: Utilize fast search and filters across the system to locate student profiles in milliseconds."
    },
    {
      quoteAr: "إتقانك لإجراءات قبول وتسجيل الطلاب الجدد يزرع الانطباع الأول الرائع في قلوب الأسر المنضمة لمدرستنا. عملك مميز ومتقن!",
      tipAr: "💡 نصيحة اليوم: تأكد من اكتمال أرقام هواتف وبيانات التواصل لأولياء الأمور لتسهيل إرسال الإشعارات.",
      quoteEn: "Mastering student admissions builds an unforgettable first impression for newly enrolled families. Exceptional work!",
      tipEn: "💡 Daily Tip: Verify updated parent phone numbers and contact details for smooth notification delivery."
    },
    {
      quoteAr: "العمل الإداري الناجح يقوم على السرعة والدقة وحسن المعاملة، وأنت تجمع هذه الصفات الثلاث بكل جدارة واقتدار.",
      tipAr: "💡 نصيحة اليوم: استعن بميزة تصدير الإكسل لاستخراج تقارير إحصائية سريعة ودقيقة للإدارة.",
      quoteEn: "Exemplary administration combines speed, accuracy, and gracious manners—qualities you master effortlessly.",
      tipEn: "💡 Daily Tip: Leverage Excel export utilities to generate quick, accurate statistical summaries for leadership."
    },
    {
      quoteAr: "كل شهادة تصدرها بدقة وكل سجل تسويه بأمانة يسعد قلوب الطلاب وذويهم. شكراً لاهتمامك وإخلاصك في كل مهمة!",
      tipAr: "💡 نصيحة اليوم: تفقد طباعة الشهادات المجمعة وتأكد من مطابقة أسماء الشعب والصفوف قبل الطباعة النهائية.",
      quoteEn: "Every accurate transcript and report card you issue brings joy to students and families. Thank you for your care!",
      tipEn: "💡 Daily Tip: Preview bulk report card rosters to confirm section mappings before final printing."
    },
    {
      quoteAr: "صباح الابتسامة والإنجاز! تعاونك المثمر مع المعلمين يضمن انسيابية الحصص والأنشطة دون أي عائق. يومك مليء بالبركة!",
      tipAr: "💡 نصيحة اليوم: نسق مع مسؤولي الحصص لتحديث أي تبديل في جداول المعلمين في النظام فوراً.",
      quoteEn: "Good morning of collaborative excellence! Your teamwork with educators ensures seamless classroom schedules.",
      tipEn: "💡 Daily Tip: Coordinate with academic coordinators to record any faculty timetable swaps promptly."
    },
    {
      quoteAr: "الانضباط الإداري هو العمود الفقري للمؤسسة التعليمية، وبإشرافك الدقيق تسير الأمور على أكمل وجه وبأعلى جاهزية.",
      tipAr: "💡 نصيحة اليوم: راجع سجلات الحضور العامة للمعلمين والموظفين للتأكد من اكتمال التوثيق اليومي.",
      quoteEn: "Administrative discipline is the backbone of educational institutions; your vigilance keeps our campus running smoothly.",
      tipEn: "💡 Daily Tip: Verify staff attendance logs to ensure daily institutional documentation is complete."
    },
    {
      quoteAr: "عندما يؤدي كل موظف دوره بهذا الشغف والدقة، تصبح المدرسة نموذجاً رائداً في الكفاءة والاحترافية. دمت ركناً أساسياً!",
      tipAr: "💡 نصيحة اليوم: خصص 10 دقائق في نهاية الدوام لتسجيل ومراجعة المهام المنجزة وتجهيز أولويات الغد.",
      quoteEn: "When staff serve with such passion and precision, the school becomes a gold standard of professionalism.",
      tipEn: "💡 Daily Tip: Spend 10 minutes at day-end reviewing completed tasks and mapping tomorrow's priorities."
    },
    {
      quoteAr: "صباح الهمة والنشاط المتجدد! تفانيك في متابعة شؤون الطلاب وحل مشكلاتهم يجعلك سنداً حقيقياً لكل طالب وولي أمر.",
      tipAr: "💡 نصيحة اليوم: استمع باهتمام لملاحظة طالب يحتاج إلى مساعدة في بطاقته المدرسية أو تسجيله.",
      quoteEn: "Good morning of renewed vitality! Your dedication to student welfare makes you a true pillar of support.",
      tipEn: "💡 Daily Tip: Listen attentively to students seeking assistance with their IDs or course registrations."
    },
    {
      quoteAr: "القدرة على تنظيم البيانات المعقدة وتحويلها إلى تقارير واضحة ومفهومة مهارة إدارية رفيعة تتميز بها دائماً.",
      tipAr: "💡 نصيحة اليوم: راجع تقرير الرسوم المتأخرة لإعداد كشوفات المتابعة الودية مع أولياء الأمور.",
      quoteEn: "Transforming complex student data into clear, actionable reports is a valuable administrative skill you excel at.",
      tipEn: "💡 Daily Tip: Review overdue tuition ledgers to prepare friendly follow-up communication with families."
    },
    {
      quoteAr: "وراء كل معاملة ناجحة وسند رسمي متقن يد مخلصة تحرص على تطبيق النظام بأعلى درجات الأمانة والشفافية.",
      tipAr: "💡 نصيحة اليوم: تأكد من تسليم السندات الرسمية المطبوعة برقم الحركة لضمان التوثيق المالي المحكم.",
      quoteEn: "Behind every official transaction and clean ledger stands a dedicated administrator committed to transparency.",
      tipEn: "💡 Daily Tip: Ensure printed receipts carry verified transaction reference IDs for rigorous bookkeeping."
    },
    {
      quoteAr: "صباح التميز والعمل الدؤوب! روحك الإيجابية في التعامل مع زملائك والمراجعين تبث الطمأنينة وتجعل بيئة العمل ممتعة ومريحة.",
      tipAr: "💡 نصيحة اليوم: تبادل التحية الصباحية بحرارة مع زملائك في القسم لتعزيز طاقة العمل الإيجابية.",
      quoteEn: "Good morning of relentless excellence! Your positive spirit turns the office into a joyful, supportive space.",
      tipEn: "💡 Daily Tip: Share a warm morning greeting with your department team to boost collaborative morale."
    },
    {
      quoteAr: "التوثيق الدقيق هو خط الدفاع الأول عن حقوق المؤسسة والطلاب، وأنت تقوم بهذه المهمة بأعلى درجات الاحترافية.",
      tipAr: "💡 نصيحة اليوم: احتفظ بنسخ احتياطية من كشوفات الطلاب المعتمدة للرجوع إليها عند الحاجة.",
      quoteEn: "Meticulous documentation is the first line of defense for student and institutional records. Superb work!",
      tipEn: "💡 Daily Tip: Keep verified digital archives of student enrollment rosters for rapid access."
    },
    {
      quoteAr: "كل إنجاز تحققه المدرسة في تنظيم الامتحانات والنتائج يقف وراءه جهدك الدقيق ومتابعتك الحثيثة. نفتخر بجهودك العظيمة!",
      tipAr: "💡 نصيحة اليوم: دقق كشوف الدرجات قبل اعتمادها للتأكد من عدم وجود أي درجات غير مدخلة.",
      quoteEn: "Every smooth exam season and grade report release is powered by your relentless administrative oversight!",
      tipEn: "💡 Daily Tip: Audit grade entry sheets to ensure all student evaluation marks are fully finalized."
    },
    {
      quoteAr: "صباح الإنتاجية العالية! حرصك على إنجاز المعاملات في وقت قياسي يعكس صورة المدرسة الحديثة والمتطورة تكنولوجياً.",
      tipAr: "💡 نصيحة اليوم: استغل ميزات التصفية السريعة للبحث عن الطلاب حسب الصف أو الشعبة لتسريع الإنجاز.",
      quoteEn: "Good morning of high productivity! Processing student requests with speed highlights our modern digital campus.",
      tipEn: "💡 Daily Tip: Utilize section and grade-level filters to expedite batch student record lookups."
    },
    {
      quoteAr: "التفاني في مساعدة الآخرين وحل الإشكالات الإدارية بمرونة وابتسامة هو ما يجعلك متميزاً ومحبوباً من الجميع.",
      tipAr: "💡 نصيحة اليوم: استمع بهدوء لمراجع يبدو قلقاً واشرح له الإجراءات ببساطة ووضوح.",
      quoteEn: "Helping others with flexibility, patience, and a warm smile makes you deeply valued across the school.",
      tipEn: "💡 Daily Tip: Calmly guide anxious parents through administrative procedures with clarity and empathy."
    },
    {
      quoteAr: "كل معلومة تدققها وكل سند تصدره هو لبنة في صرح الشفافية المالية والإدارية التي تتميز بها مدرستنا. دمت متألقاً!",
      tipAr: "💡 نصيحة اليوم: راجع تقرير المقبوضات اليومي وطابقه مع المبالغ المحصلة لضمان دقة الإغلاق المالي.",
      quoteEn: "Every verified entry strengthens the transparent financial and operational integrity of our institution.",
      tipEn: "💡 Daily Tip: Reconcile daily payment receipts with collected funds to ensure seamless end-of-day closing."
    },
    {
      quoteAr: "صباح الهمة والريادة! طاقتك الإيجابية وعملك المنظم يجعلان من مكتب شؤون الطلاب نموذجاً يحتذى به في السرعة والإتقان.",
      tipAr: "💡 نصيحة اليوم: رتب مكتبك الرقمي وسطح المكتب لتسهيل العثور على القوالب والملفات الهامة.",
      quoteEn: "Good morning of energetic productivity! Your organized workflows make the student affairs office a shining benchmark.",
      tipEn: "💡 Daily Tip: Organize your desktop and document folders to access core templates effortlessly."
    },
    {
      quoteAr: "العمل الإداري أمانة ومسؤولية كبرى، وإخلاصك في حمل هذه الأمانة هو ما يمنح مدرستنا السمعة الطيبة والمكانة الرفيعة.",
      tipAr: "💡 نصيحة اليوم: تأكد من تحديث الحالات الطارئة وأرقام الطوارئ في ملفات الطلاب الحساسة.",
      quoteEn: "Administration is a sacred responsibility; your integrity preserves our school's stellar reputation.",
      tipEn: "💡 Daily Tip: Confirm emergency contact numbers are fully updated in student demographic files."
    },
    {
      quoteAr: "بجهودك المتواصلة، تحول العمل الإداري من روتين مكرر إلى فن في التنسيق وخدمة المجتمع المدرسي بكل كفاءة.",
      tipAr: "💡 نصيحة اليوم: قدم المساعدة لزميل في قسم آخر إذا أنهيت مهامك الأساسية مبكراً لتعزيز روح الفريق.",
      quoteEn: "Through your diligence, administration transforms into a refined art of community service. Outstanding!",
      tipEn: "💡 Daily Tip: Offer a helping hand to a team member if your primary tasks are wrapped up early."
    },
    {
      quoteAr: "صباح الإشراق والتفوق الإداري! كل جدول تنظمه يسهم في خلق بيئة هادئة ومستقرة للطلاب والمعلمين طوال اليوم الدراسي.",
      tipAr: "💡 نصيحة اليوم: راجع جدول الحصص اليومي وتأكد من تعيين غرف المعلمين والشعب بشكل صحيح.",
      quoteEn: "Good morning of administrative mastery! Your timetables create a serene, stable learning environment campus-wide.",
      tipEn: "💡 Daily Tip: Cross-check daily schedules to ensure seamless classroom and room allocation."
    },
    {
      quoteAr: "إنك صانع الاستقرار الإداري؛ بفضلك يعود كل طالب إلى بيته واثقاً من حفظ حقوقه وتسجيل درجاته وسير معاملاته بسلاسة.",
      tipAr: "💡 نصيحة اليوم: أرسل إشعاراً تشجيعياً للطلاب المتفوقين في الحضور والانضباط هذا الشهر.",
      quoteEn: "You are the creator of operational stability; students leave campus confident their records are in safe hands.",
      tipEn: "💡 Daily Tip: Send a congratulatory note to students achieving perfect attendance this month."
    },
    {
      quoteAr: "الاحترافية في التعامل مع الضغط وإنجاز المهام بهدوء وثقة صفة القائد الإداري الناجح، وأنت تمثل هذا النموذج بامتياز!",
      tipAr: "💡 نصيحة اليوم: خذ نفساً عميقاً في الأوقات المزدحمة وتذكر أن هدوءك ينعكس إيجابياً على من حولك.",
      quoteEn: "Handling peak hours with composure and poise is the mark of a seasoned professional. You embody it perfectly!",
      tipEn: "💡 Daily Tip: Take a mindful breath during peak rush; your calm radiates confidence to everyone."
    },
    {
      quoteAr: "نختتم الشهر بكل فخر واعتزاز بإنجازاتك الإدارية الدقيقة التي جعلت مدرستنا في قمة الانضباط والتميز. دمت ذخراً وسنداً للمنظومة!",
      tipAr: "💡 نصيحة ختامية: راجع إغلاق سجلات الشهر واحتفل بإنهاء كافة المهام بكفاءة وامتياز.",
      quoteEn: "We close this month with immense appreciation for your flawless administrative diligence. Thank you for your excellence!",
      tipEn: "💡 Daily Tip: Finalize end-of-month reconciliations and celebrate a month of outstanding productivity."
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
    },
    {
      quoteAr: "المعلم المبدع لا يقدم الإجابات الجاهزة، بل يثير الأسئلة التي تفتح آفاق التفكير والبحث المستقل لدى تلاميذه. دمت ملهماً!",
      tipAr: "💡 نصيحة اليوم: اطرح لغزاً علمياً أو مسألة تفكير جانبي في بداية الدرس لتنشيط أذهان الطلاب.",
      quoteEn: "An inspiring educator doesn't just hand out answers; they spark questions that open realms of independent curiosity.",
      tipEn: "💡 Daily Tip: Pose an intriguing thought experiment or riddle at the start of class to activate student focus."
    },
    {
      quoteAr: "صباح النور والهمة العالية! صبرك الجميل مع الطلاب وتفهمك لفروقهم الفردية هو السر الحقيقي وراء تفوقهم وبناء شخصياتهم.",
      tipAr: "💡 نصيحة اليوم: نوّع أساليب الشرح لتشمل الوسائل البصرية والسمعية والتطبيق العملي لتناسب جميع أنماط التعلم.",
      quoteEn: "Good morning of passion! Your patience and empathy for individual differences are the true secret behind student brilliance.",
      tipEn: "💡 Daily Tip: Blend visual, auditory, and kinesthetic elements to engage all learning styles in the room."
    },
    {
      quoteAr: "في كل كلمة تشجيع وفي كل تصحيح حنون، أنت تزرع الثقة وتبني أبطالاً يقودون المستقبل. نحن ممتنون جداً لعطائك!",
      tipAr: "💡 نصيحة اليوم: اكتب تعليقاً إيجابياً مشجعاً بجانب الدرجة في دفتر الطالب لرفع معنوياته.",
      quoteEn: "In every encouraging correction, you plant unshakable confidence. We are deeply grateful for your dedication!",
      tipEn: "💡 Daily Tip: Write a personalized encouraging note beside evaluation marks to boost student morale."
    },
    {
      quoteAr: "المعلم الناجح يحول الحصة الدراسية من مكان لتلقي المعلومات إلى ورشة عمل حية يشارك فيها الجميع بشغف واستمتاع.",
      tipAr: "💡 نصيحة اليوم: استخدم استراتيجية التعلم بالأقران ودع الطلاب يشرحون فكرة معينة لبعضهم البعض.",
      quoteEn: "A master teacher transforms the classroom into a vibrant workshop where every student participates eagerly.",
      tipEn: "💡 Daily Tip: Implement peer-to-peer teaching where students explain core concepts to one another."
    },
    {
      quoteAr: "صباح الإبداع التربوي! طاقتك وحيويتك داخل الصف تجعل المواد الصعبة سهلة ومحبوبة في قلوب الطلاب. يومك مفعم بالإنجاز!",
      tipAr: "💡 نصيحة اليوم: اربط درس اليوم بقصة واقعية أو حدث معاصر لجعل المفهوم راسخاً في أذهانهم.",
      quoteEn: "Good morning of pedagogical brilliance! Your classroom energy turns complex topics into delightful journeys.",
      tipEn: "💡 Daily Tip: Connect today's lesson to a relatable real-world story to anchor the concept permanently."
    },
    {
      quoteAr: "حينما يؤمن المعلم بقدرات طلابه، يتحول الضعف إلى قوة والتردد إلى إبداع وشجاعة. شكراً لأنك تؤمن بكل طالب في صفك!",
      tipAr: "💡 نصيحة اليوم: خصص دقيقة واحدة بعد الحصة للاطمئنان على طالب بدا شارد الذهن أو متعباً.",
      quoteEn: "When an educator believes in student potential, hesitation transforms into courage and creativity. Thank you!",
      tipEn: "💡 Daily Tip: Take one minute after class to check in on a student who seemed quiet or tired."
    },
    {
      quoteAr: "التعليم بالحب والاحترام يصنع معجزات لا تستطيع المناهج وحدها تحقيقها. أنت تزرع قيماً تدوم مدى الحياة!",
      tipAr: "💡 نصيحة اليوم: كافئ السلوك الإيجابي والتعاون بين الطلاب كما تكافئ التفوق الأكاديمي تماماً.",
      quoteEn: "Teaching with empathy achieves miracles textbooks alone cannot. You instill values that endure for a lifetime!",
      tipEn: "💡 Daily Tip: Reward kindness and peer collaboration with the same enthusiasm as academic scores."
    },
    {
      quoteAr: "صباح الهمة والنشاط يا بطل التعليم! في عينيك يرى الطلاب الأمان ومن علمك يستقون المعرفة التي تبني مستقبلهم الواعد.",
      tipAr: "💡 نصيحة اليوم: استخدم تقنيات الأسئلة المفتوحة لتشجيع الطلاب على التعبير عن أفكارهم بثقة وبلا خوف من الخطأ.",
      quoteEn: "Good morning, champion educator! In your presence, students find safety and inspiring knowledge.",
      tipEn: "💡 Daily Tip: Use open-ended questions to encourage fearless, confident student expression."
    },
    {
      quoteAr: "أثرك التربوي يمتد أبعد من جدران المدرسة، فكل طالب تلهمه اليوم سينقل هذا النور إلى أسرته ومجتمعه مستقبلاً.",
      tipAr: "💡 نصيحة اليوم: شجع الطلاب على القراءة الحرة خارج المنهج وخصص 5 دقائق أسبوعياً لمشاركة ما قرأوه.",
      quoteEn: "Your impact reaches far beyond classroom walls; every inspired learner carries that light into the world.",
      tipEn: "💡 Daily Tip: Encourage independent reading and allow 5 minutes weekly for students to share book takeaways."
    },
    {
      quoteAr: "المعلم المتميز هو من يجعل التعلم عادة يومية ممتعة وليس مجرد واجب مدرسي يثقل كاهل الطلاب. دمت رائداً ومبدعاً!",
      tipAr: "💡 نصيحة اليوم: استخدم عناصر التلعيب (Gamification) مثل التحديات السريعة والنقاط لجعل الدرس ممتعاً.",
      quoteEn: "An outstanding teacher turns learning into a joyful habit rather than a burdensome chore. Keep shining!",
      tipEn: "💡 Daily Tip: Incorporate gamification elements like quick team challenges to energize the classroom."
    },
    {
      quoteAr: "صباح الشغف والتألق! الطلاب يتذكرون دائماً كيف جعلتهم يشعرون بالأهمية والقدرة على النجاح. استمر في نشر الأمل!",
      tipAr: "💡 نصيحة اليوم: استمع باهتمام لسؤال طالب حتى لو بدا بسيطاً، فشعوره بالاهتمام ينمي فضوله العلمي.",
      quoteEn: "Good morning of passion! Students always remember how you made them feel capable and valued. Keep inspiring!",
      tipEn: "💡 Daily Tip: Validate student questions warmly; feeling heard nurtures boundless intellectual curiosity."
    },
    {
      quoteAr: "كل معلومة تغرسها اليوم هي شجرة معرفة ستثمر في المستقبل نجاحاً وإنجازاً لوطننا الحبيب. دمت منارة تضيء الدروب!",
      tipAr: "💡 نصيحة اليوم: قسم الدرس إلى محطات تعليمية صغيرة تتخللها وقفات للتطبيق والتأكد من الفهم.",
      quoteEn: "Every insight you plant today is a tree of knowledge that will bear fruitful achievements tomorrow!",
      tipEn: "💡 Daily Tip: Chunk your lesson into micro-learning segments interspersed with quick formative checks."
    },
    {
      quoteAr: "التربية والتعليم رسالة الأنبياء، وأنت تؤدي هذه الرسالة العظيمة بكل أمانة وإخلاص وتفانٍ كل صباح. يومك مبارك!",
      tipAr: "💡 نصيحة اليوم: علم طلابك مهارة التفكير النقدي وسؤال 'لماذا' و'كيف' وليس فقط 'ماذا'.",
      quoteEn: "Teaching is a noble calling, and you fulfill this sacred mission with profound dedication every morning.",
      tipEn: "💡 Daily Tip: Teach students to ask 'Why' and 'How', not just 'What', to sharpen their critical thinking."
    },
    {
      quoteAr: "صباح التفاؤل والابتسامة المشرقة! حضورك الإيجابي في الصف يبدد قلق الطلاب ويجعلهم مقبلين على التعلم بشغف وسعادة.",
      tipAr: "💡 نصيحة اليوم: نظم مسابقة صفية سريعة في نهاية الحصة لمراجعة المفاهيم بطريقة حماسية.",
      quoteEn: "Good morning of bright optimism! Your positive presence dispels student anxiety and fuels eager learning.",
      tipEn: "💡 Daily Tip: Host a fast-paced 3-minute quiz at class-end to review concepts enthusiastically."
    },
    {
      quoteAr: "المعلم الحقيقي يبني الثقة في نفوس طلابه قبل أن يبني المعرفة في عقولهم؛ لأن الثقة هي الجسر الذي تعبر عليه كل العلوم.",
      tipAr: "💡 نصيحة اليوم: شجع طالباً حقق تقدماً ملحوظاً مقارنة بمستواه السابق وأثنِ على إصراره واجتهاده.",
      quoteEn: "A true educator builds self-belief before knowledge; confidence is the bridge over which all learning travels.",
      tipEn: "💡 Daily Tip: Celebrate personal growth in a student whose effort has visibly improved."
    },
    {
      quoteAr: "في كل نظرة فخر توجهها لطلابك، أنت تمنحهم أجنحة ليحلقوا بها في سماء التميز والإبداع. شكراً لعطائك اللامحدود!",
      tipAr: "💡 نصيحة اليوم: اطلب من الطلاب تلخيص الفكرة الرئيسية للدرس في جملة واحدة في نهاية الحصة.",
      quoteEn: "With every proud smile you offer, you give students wings to soar toward higher summits. Thank you!",
      tipEn: "💡 Daily Tip: Ask students to write a one-sentence summary of today's core concept as an exit ticket."
    },
    {
      quoteAr: "صباح الهمة والإلهام يا باني العقول! شغفك بما تعلمه هو الشرارة التي توقد شغف الطلاب وحبهم للمادة والمعرفة.",
      tipAr: "💡 نصيحة اليوم: استخدم لغة الجسد الإيجابية ونبرات الصوت المتنوعة للحفاظ على انتباه وتفاعل الصف.",
      quoteEn: "Good morning of inspiration! Your genuine passion for the subject is the spark that ignites student enthusiasm.",
      tipEn: "💡 Daily Tip: Modulate vocal tone and dynamic body language to keep student engagement soaring."
    },
    {
      quoteAr: "التدريس فن التواصل الإنساني الراقي، وحرصك على بناء علاقة طيبة مع طلابك هو المفتاح السحري لنجاحهم وتفوقهم.",
      tipAr: "💡 نصيحة اليوم: اجعل الصف بيئة آمنة يتقبل فيها الجميع الخطأ كخطوة أولى وأساسية نحو التعلم الصحيح.",
      quoteEn: "Teaching is an art of human connection; your empathy with learners is the magic key to their mastery.",
      tipEn: "💡 Daily Tip: Establish a classroom culture where mistakes are embraced as vital learning stepping stones."
    },
    {
      quoteAr: "كل طالب في صفك هو قصة نجاح مستقبلية تنتظر لمستك التوجيهية الحكيمة لتكتمل وتبهر العالم. دمت صانعاً للأمل!",
      tipAr: "💡 نصيحة اليوم: اسمح للطلاب بالعمل في مجموعات ثنائية لحل مسألة تطبيقية لتعزيز الحوار البناء.",
      quoteEn: "Every learner in your room is a future success story awaiting your wise mentorship. Keep building hope!",
      tipEn: "💡 Daily Tip: Pair students up for quick problem-solving to stimulate collaborative dialogue."
    },
    {
      quoteAr: "صباح التميز والعطاء المستمر! صبرك وتفانيك في إيصال المعلومة لكل طالب على حدة يعكس روح المعلم القدوة الذي لا يُنسى.",
      tipAr: "💡 نصيحة اليوم: شجع الطلاب على كتابة أهدافهم الأكاديمية والشخصية لهذا الشهر ومتابعتها معك.",
      quoteEn: "Good morning of enduring excellence! Your patience in guiding each learner individually defines the unforgettable mentor.",
      tipEn: "💡 Daily Tip: Encourage students to write down their personal learning goals for the month."
    },
    {
      quoteAr: "العلم الذي تغرسه في قلوب وعقول تلاميدك هو الصدقة الجارية والأثر الخالد الذي يبقى شاهداً على عظمتك وإخلاصك.",
      tipAr: "💡 نصيحة اليوم: اختم أسبوعك بكلمة تقدير شاملة لجهود الصف والتزامهم طوال الحصص السابقة.",
      quoteEn: "The knowledge you sow in eager minds is a timeless legacy witnessing your noble dedication.",
      tipEn: "💡 Daily Tip: Conclude your week with heartfelt appreciation for the whole class's hard work."
    },
    {
      quoteAr: "صباح الشغف والتجدد! أنت من يصنع الفارق في كل يوم دراسي، وبفضل همتك تبقى مدرستنا صرحاً يفيض بالإبداع والتميز.",
      tipAr: "💡 نصيحة اليوم: استخدم خرائط المفاهيم والرسوم التوضيحية لتلخيص الوحدات الدراسية المعقدة بسهولة.",
      quoteEn: "Good morning of vibrant inspiration! You make the defining difference every day; your energy fuels school distinction.",
      tipEn: "💡 Daily Tip: Use visual concept maps and diagrams to simplify complex multi-step units."
    },
    {
      quoteAr: "أنت النور الذي يبدد ظلمات الجهل، وأنت السند الذي يعتمد عليه الطلاب في بناء مستقبلهم. دمت فخراً وشرفاً للتعليم!",
      tipAr: "💡 نصيحة اليوم: خصص لحظة لتذكر لماذا اخترت مهنة التعليم النبيلة، واستمد من ذلك دافعاً متجدداً للعطاء.",
      quoteEn: "You are the beacon dispelling darkness and the anchor upon which students build their tomorrow. Pure pride!",
      tipEn: "💡 Daily Tip: Take a quiet moment to remember why you chose this noble profession, and draw fresh inspiration."
    },
    {
      quoteAr: "نختتم الشهر بكل فخر واعتزاز بعطائك العظيم في الميدان التعليمي. لقد صنعت فارقاً حقيقياً في حياة طلابك، وغداً يحمل إنجازات أعظم!",
      tipAr: "💡 نصيحة ختامية: احتفل بإنجازات طلابك وامنح نفسك تقديراً مستحقاً على كل جهد بذلته طوال هذا الشهر.",
      quoteEn: "We close this month with immense gratitude for your tireless classroom dedication. You transformed lives this month!",
      tipEn: "💡 Daily Tip: Celebrate your students' milestones and treat yourself to a well-deserved moment of pride."
    }
  ]
};

export default function DailyMotivationalModal() {
  const { user } = useAuth();
  const { isRtl } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [shuffleOffset, setShuffleOffset] = useState(0);

  // Compute daily message based on date and role
  const getTodayMessage = () => {
    const today = new Date();
    const dayOfMonth = today.getDate(); // 1 to 31
    
    // Strictly isolate the 4 distinct roles: DEVELOPER vs ADMIN vs STAFF vs TEACHER
    const isDev = Boolean(user?.isDeveloper === true || user?.role === 'DEVELOPER');
    const roleKey = isDev
      ? 'DEVELOPER'
      : user?.role === 'STAFF'
      ? 'STAFF'
      : user?.role === 'TEACHER'
      ? 'TEACHER'
      : 'ADMIN';
    const pool = MOTIVATIONAL_DATABASE[roleKey] || MOTIVATIONAL_DATABASE.ADMIN;
    
    // Deterministic index for this day of the month (1-31), with shuffle ability
    const index = (dayOfMonth - 1 + shuffleOffset + pool.length * 10) % pool.length;
    const item = pool[index];

    const rawName = user?.fullName || (isDev ? 'م. يوسف خلف (Lead Developer)' : roleKey === 'ADMIN' ? 'أ. عبد الرحمن (مدير المدرسة)' : roleKey === 'STAFF' ? 'شؤون الطلاب' : 'المعلم الفاضل');
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

    // Listen for manual trigger from Header button continuously
    const handleManualOpen = () => {
      setIsOpen(true);
      playWelcomeChime();
    };
    window.addEventListener('open-daily-motivation', handleManualOpen);

    // Auto-open on login / new session entry
    const sessionKey = `school_welcome_seen_${user.id || user.email || user.role}`;
    const hasSeenInSession = sessionStorage.getItem(sessionKey);

    let timer;
    if (!hasSeenInSession) {
      timer = setTimeout(() => {
        setIsOpen(true);
        playWelcomeChime();
      }, 400);
    }

    return () => {
      window.removeEventListener('open-daily-motivation', handleManualOpen);
      if (timer) clearTimeout(timer);
    };
  }, [user]);

  const handleClose = () => {
    if (user) {
      const sessionKey = `school_welcome_seen_${user.id || user.email || user.role}`;
      sessionStorage.setItem(sessionKey, 'true');
    }
    setIsOpen(false);
  };

  const handleNextQuote = () => {
    setShuffleOffset((prev) => prev + 1);
    playWelcomeChime();
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
    DEVELOPER: {
      badgeText: isRtl ? '⚡ لوحة القيادة الهندسية وتطوير المنظومة' : '⚡ Platform Engineering & Architecture Hub',
      badgeBg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4338ca 100%)',
      badgeColor: '#ffffff',
      themeColor: '#6366f1',
      lightBg: '#eef2ff',
      icon: '⚡',
      salutation: isRtl ? 'أهلاً بك يا مهندس يوسف، صانع وباني المنظومة 👑⚡' : 'Welcome Lead Architect, Eng. Yousef Khalaf 👑⚡'
    },
    ADMIN: {
      badgeText: isRtl ? '👑 القيادة التربوية والإدارة المدرسية العامة' : '👑 School Leadership & Executive Administration',
      badgeBg: 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)',
      badgeColor: '#ffffff',
      themeColor: '#4f46e5',
      lightBg: '#eef2ff',
      icon: '👔',
      salutation: isRtl ? `أهلاً بك يا سيادة المدير، قائد الصرح التعليمي (${data.cleanName}) 👑` : `Welcome Esteemed School Principal, ${data.cleanName} 👑`
    },
    STAFF: {
      badgeText: isRtl ? '📋 الكادر الإداري وشؤون المعلمين والطلاب' : '📋 Faculty & Student Affairs Office',
      badgeBg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      badgeColor: '#ffffff',
      themeColor: '#10b981',
      lightBg: '#ecfdf5',
      icon: '📁',
      salutation: isRtl ? `صباح الهمة والنشاط يا زميلنا الإداري (${data.cleanName}) 🌟` : `Welcome, Administrative Officer ${data.cleanName} 🌟`
    },
    TEACHER: {
      badgeText: isRtl ? '🎓 الكادر التعليمي وصناع الأجيال' : '🎓 Faculty & Teaching Cadre',
      badgeBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      badgeColor: '#ffffff',
      themeColor: '#0ea5e9',
      lightBg: '#eff6ff',
      icon: '👨‍🏫',
      salutation: isRtl ? `أهلاً بك يا صانع الأجيال، أستاذ ${data.cleanName} 🎓🌟` : `Welcome Respected Educator, ${data.cleanName} 🎓🌟`
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
          maxWidth: '580px',
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
              <span style={{ opacity: 0.85, fontSize: 11 }}>• {isRtl ? `رسالة اليوم ${data.dayIndex} من ${data.totalQuotes}` : `Day ${data.dayIndex} of ${data.totalQuotes}`}</span>
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

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>✨</span>
                <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: roleMeta.themeColor, letterSpacing: '0.04em' }}>
                  {isRtl ? 'رسالة وطاقة اليوم المتجددة' : 'Daily Energy & Inspiration'}
                </span>
              </div>

              {/* Instant shuffle/next quote button */}
              <button
                type="button"
                onClick={handleNextQuote}
                style={{
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: `1px solid ${roleMeta.themeColor}44`,
                  color: roleMeta.themeColor,
                  borderRadius: '20px',
                  padding: '3px 10px',
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease'
                }}
                title={isRtl ? 'استعراض حكمة أو نصيحة أخرى' : 'Shuffle another inspiring thought'}
              >
                <span>🔄</span>
                <span>{isRtl ? 'رسالة أخرى' : 'Next Thought'}</span>
              </button>
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
              {isRtl ? '✨ تتجدد الرسائل تلقائياً كل يوم على مدار الشهر' : '✨ Automatically renews every single day of the month'}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={handleNextQuote}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>🔄</span>
                <span>{isRtl ? 'رسالة أخرى' : 'Shuffle'}</span>
              </button>

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
    </div>
  );
}
