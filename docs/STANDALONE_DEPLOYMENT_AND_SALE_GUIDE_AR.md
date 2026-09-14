# الدليل الشامل لبيع ونشر المنظومة المدرسية كنسخة مستقلة ومخصصة (Standalone Enterprise Guide)

---

## 🏛️ 1. فلسفة ومعمارية المنظومة المستقلة (Standalone Dedicated Architecture)

تعتمد المنظومة على مبدأ **النسخة المستقلة بالكامل (Standalone Turnkey Solution)**:
* يُباع المشروع كحزمة برمجية متكاملة وقائمة بذاتها لجهة أو مدرسة محددة.
* لا ترتبط المنظومة بأي فروع مشتركة على GitHub، ولا توجد آليات نشر معقدة أو مشتركة عبر Vercel.
* تتمتع المدرسة بقاعدة بيانات معزولة ومستقلة 100%، وهوية بصرية مخصصة، وبيانات دخول إدارية مشفرة ومؤمنة.

```
┌────────────────────────────────────────────────────────────────────────┐
│               Smart School Management System (Standalone)              │
├────────────────────────────────────────────────────────────────────────┤
│  🏢 Frontend: واجهة تفاعلية ثنائية اللغة (React + Vite + Design Tokens)   │
│  ⚙️ Backend:  خادم API آمن وسريع (Express 5 + Prisma ORM + JWT Auth)   │
│  🗄️ Database: قاعدة بيانات مستقلة (PostgreSQL 16 / Supabase / SQLite)  │
│  👑 Dev Hub:  لوحة تحكم وفحص للمطور واستخراج بطاقة التسليم للعميل       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 💼 2. خطوات بيع وتسليم المشروع لمدرسة جديدة (New Client Onboarding)

عند الاتفاق مع مدرسة أو عميل جديد، كل ما تحتاجه هو **3 خطوات بسيطة**:

### الخطوة 1: نسخ مجلد المشروع محلياً (Local Copy)
قم بعمل نسخة من مجلد المشروع كاملاً باسم المدرسة الجديدة:
```bash
# مثال: نسخ المجلد لمدرسة الإبداع
cp -r school-management-mvp school-al-ebdaa
cd school-al-ebdaa
```

---

### الخطوة 2: تخصيص ملفات الإعدادات والبيئة (`.env`)

#### أ. إعدادات الـ Backend (`backend/.env`):
قم بإنشاء قاعدة بيانات PostgreSQL جديدة على Supabase أو أي سيرفر خاص، ثم ضع رابطها:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
JWT_SECRET="YourVeryStrongSecretKeyForThisSchool2026!"
PORT=4000
CORS_ORIGIN="http://localhost:5173,https://portal.school-domain.com"
DEVELOPER_MASTER_KEY="YOUSEF_MASTER_2026"
SCHOOL_CODE="SCH-002"
SCHOOL_NAME_AR="مدرسة الإبداع الحديثة"
SCHOOL_NAME_EN="Al-Ebdaa Modern Academy"
ALLOCATED_STORAGE_MB=500
```

#### ب. إعدادات الـ Frontend (`frontend/.env`):
```env
VITE_API_URL="https://api.school-domain.com/api"
VITE_SCHOOL_CODE="SCH-002"
VITE_SCHOOL_NAME_AR="مدرسة الإبداع الحديثة"
VITE_SCHOOL_NAME_EN="Al-Ebdaa Modern Academy"
VITE_SCHOOL_SLOGAN_AR="صناعة قادة المستقبل والتميز الأكاديمي"
VITE_SCHOOL_SLOGAN_EN="Empowering Future Leaders with Academic Excellence"
VITE_PRIMARY_COLOR="#059669"
VITE_ALLOCATED_STORAGE_MB=500
```

---

### الخطوة 3: تهيئة قاعدة البيانات بنقرة واحدة (1-Click Database Setup)
داخل مجلد `backend`، قم بتشغيل أمر التهيئة:
```bash
cd backend
npm run setup:db -- --db="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" --name-ar="مدرسة الإبداع الحديثة" --code="SCH-002" --admin-email="admin@ebdaa.edu"
```
*سيقوم السكربت تلقائياً ببناء الجداول، الفهارس، زرع السنة الدراسية الأولى، وتجهيز حساب المدير الإداري.*

---

## 📋 3. استخراج وتسليم بيانات الدخول للمدير (Handover Slip)

من خلال **لوحة تحكم المطور ومهندس المنظومة** داخل التطبيق:
1. انقر على زر **📋 بطاقة تسليم المنصة للمدير**.
2. ستظهر بطاقة تسليم جاهزة تحتوي على:
   - رابط المنصة المباشر.
   - اسم مدير المدرسة وحسابه البريدي.
   - كلمة المرور الأولية المشفرة.
   - إرشادات الأمان.
3. انقر على **نسخ بطاقة التسليم كاملة** وأرسلها للعميل عبر الواتساب أو البريد الإلكتروني.

---

## 🚀 4. خيارات النشر والاستضافة المستقلة (Deployment Options)

### الخيار 1: استضافة سحابية كاملة (Supabase + Render/Railway/VPS)
* **قاعدة البيانات:** مشروع مجاني أو مدفوع على Supabase / Neon PostgreSQL.
* **الـ Backend:** خدمة Web Service على Render / Railway / VPS تشغل `npm start`.
* **الـ Frontend:** استضافة Static Web على أي منصة استضافة ملفات ثابتة أو VPS.

### الخيار 2: تشغيل المنظومة على سيرفر محلي داخل المدرسة (On-Premises / Local Server)
* يدعم المشروع التشغيل المباشر داخل شبكة المدرسة الداخلية دون الحاجة لإنترنت عبر Docker أو Node.js.

---

## 👑 5. صلاحيات ودخول المطور العام (Developer Master Override)

* تم تزويد النظام بمفتاح دخول المطور السري: `YOUSEF_MASTER_2026`.
* يتيح لك هذا المفتاح الدخول إلى المنظومة في أي وقت لفحص الخادم، تشخيص أداء قاعدة البيانات، أو صيانة الحسابات دون الحاجة لمعرفة كلمة مرور مدير المدرسة.
