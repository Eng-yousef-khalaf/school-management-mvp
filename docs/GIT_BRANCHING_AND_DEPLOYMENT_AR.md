# الدليل الشامل لإدارة الفروع والنشر المتعدد لأسطول المدارس (Git Branching & Multi-School Deployment Guide)

---

## 1. الهيكلية المعمارية للمنظومة (Architecture Overview)

تعتمد المنظومة على نموذج **(Master Project & Dedicated School Instances)** مع عزل كامل لقواعد البيانات وتخصيص مرن لكل مدرسة:

```
                        YOUSEF (Platform Owner & Lead Developer)
                                           │
                     ┌─────────────────────┴─────────────────────┐
                     │                                           │
              [GitHub Master]                           [DEVELOPER FLEET HUB]
               (Branch: main)                       (لوحة تحكم ومراقبة أسطول المدارس)
                     │                                           │
        ┌────────────┼────────────┐               ┌──────────────┼──────────────┐
        ↓            ↓            ↓               ↓              ↓              ↓
   [School A]   [School B]   [School C]     • إحصائيات المدارس  • نسبة التخزين %  • الدخول الشامل
 (فرع مخصص)    (فرع مخصص)    (فرع مخصص)     • إجمالي الطلاب     • فحص القواعد     • بدون كلمة سر
        │            │            │
   [Frontend A] [Frontend B] [Frontend C]
  (نطاق مخصص)  (نطاق مخصص)  (نطاق مخصص)
        │            │            │
    Supabase A   Supabase B   Supabase C
 (قاعدة معزولة) (قاعدة معزولة) (قاعدة معزولة)
```

---

## 2. إدارة الفروع في Git (Master vs School Branches)

### أ. الفرع الرئيسي (`main` / Master Core):
* **وظيفته:** يحتوي على الكود البرمجي الأساسي، كافة الميزات العامة المشتركة، المخططات (Prisma Schema)، والتحسينات الأمنية.
* **القاعدة:** أي ميزة يحتاجها جميع المدارس (مثل إضافة تقرير درجات جديد، تحسين سرعة الحضور) يتم برمجتها واختبارها على فرع `main`.

### ب. فروع المدارس المخصصة (`school/school-name`):
* **وظيفتها:** عند انضمام مدرسة جديدة أو طلب مدرسة معينة لميزة حصرية (مثل معادلة درجات خاصة بها، لوجو معين، مسار إضافي)، يتم العمل على فرعها فقط دون التأثير على المستودع الرئيسي أو بقية المدارس.

---

## 3. الأوامر البرمجية لإدارة التحديثات اليومية (Daily Git Workflows)

### 1. رفع المشروع الرئيسي للـ GitHub لأول مرة:
```bash
# داخل المجلد الرئيسي للمشروع:
git init
git add .
git commit -m "feat: Initial Master Core Release v2.0"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/school-management-mvp.git
git push -u origin main
```

---

### 2. تدشين فرع مخصص لمدرسة جديدة (مثال: مدرسة النور):
```bash
# 1. التأكد من الوقوف على آخر تحديث من الماستر
git checkout main
git pull origin main

# 2. إنشاء فرع المدرسة الجديد
git checkout -b school/al-noor

# 3. رفع الفرع للـ GitHub
git push -u origin school/al-noor
```

---

### 3. نشر ميزة عامة من الماستر لجميع المدارس (Global Feature Rollout):
عند قيامك ببرمجة ميزة عامة في `main` وتريد إرسالها لمدرسة النور:
```bash
# التبديل لفرع المدرسة وسحب تحديثات الماستر
git checkout school/al-noor
git merge main
git push origin school/al-noor

# سيتم النشر التلقائي فوراً للنسخة المحدثة عبر منصة الاستضافة المختارة!
```

---

### 4. إضافة ميزة حصرية لمدرسة واحدة فقط (School-Isolated Customization):
إذا طلبت مدرسة النور تعديلاً خاصاً بها فقط:
```bash
git checkout school/al-noor

# قم ببرمجة التعديل المخصص...
git add .
git commit -m "custom: Special grading calculation for Al-Noor"
git push origin school/al-noor

# الميزة ستعمل فقط لدى مدرسة النور ولن تؤثر على الماستر أو المدارس الأخرى!
```

---

## 4. لوحة تحكم المطور العام (Developer Fleet Dashboard)

تم تزويد النظام بـ **Developer Fleet Dashboard** داخل المنصة للتحكم الكامل:

1. **الوصول للوحة:**
   * عن طريق الشريط الجانبي (Sidebar) تحت اسم: `⚡ أسطول المدارس والمطور`.
   * أو عبر تسجيل الدخول بـ **Developer Master Key** بنقرة واحدة من صفحة تسجيل الدخول.
2. **الميزات التي توفرها لك اللوحة:**
   * **إحصائيات الأسطول:** إجمالي المدارس، إجمالي الطلاب عبر كافة المدارس، الكادر التعليمي، وحالة السيرفرات.
   * **نسبة وسعة التخزين لكل مدرسة (Storage % Gauge):**
     * مؤشر ملون يوضح استهلاك كل مدرسة من مساحتها المخصصة في Supabase (مثال: *مدرسة النور تستهلك 70% من 500MB | 350MB مستخدمة*).
     * تفصيل حجم الجداول (سجلات الحضور، الدرجات، بيانات الطلاب، سجلات التدقيق).
   * **جدول إدارة المدارس والإجراءات الفورية:**
     * 🚀 **دخول النسخة (Launch Instance):** فتح رابط المدرسة المباشر.
     * 🎨 **المعاينة الحية (Live Preview):** تطبيق ألوان وشعار المدرسة فوراً على الواجهة لاختبار شكلها.
     * ➕ **معالج تدشين مدرسة جديدة:** نموذج سريع لتجهيز بيانات المدرسة ومفاتيحها.

---

## 5. صلاحية الدخول الشامل للمطور (Universal Developer Master Access)

* يمكنك الدخول إلى **أي نسخة مدرسة** دون الحاجة لمعرفة كلمة مرور مدير المدرسة.
* **طريقة الدخول:**
  1. الدخول إلى صفحة تسجيل الدخول لأي نسخة مدرسة.
  2. النقر على زر: **👑 دخول المطور العام والمالك (Developer Master Access)** في أسفل النموذج.
  3. أو تسجيل الدخول برمز المطور الرئيسي: `YOUSEF_MASTER_2026`.
  4. سيتم منحك صلاحيات **SUPER ADMIN** كاملة لفحص وتعديل وتجربة كافة وظائف المدرسة فوراً.

---

## 6. خطوات تدشين مدرسة جديدة من الصفر في 5 دقائق (Turnkey Onboarding)

```mermaid
sequenceDiagram
    autonumber
    actor Dev as يوسف (المطور)
    participant Supabase as Supabase (قاعدة البيانات)
    participant Backend as الباك إند (سيرفر الـ API)
    participant Frontend as الفرونت إند (استضافة الواجهة)
    actor Client as مدير المدرسة الجديدة

    Dev->>Supabase: 1. إنشاء New Project ونسخ الـ Database URL
    Dev->>Supabase: 2. تشغيل: npm run setup:school -- --db="..."
    Dev->>Backend: 3. ربط خدمة الـ API بـ DATABASE_URL الجديد
    Dev->>Frontend: 4. إنشاء مشروع جديد من فرع المدرسة وضبط متغيرات الهوية
    Frontend-->>Dev: تم النشر الفوري (https://school-name.yourdomain.com)
    Dev->>Client: 5. تسليم الرابط وبيانات حساب المدير الإداري
```

### الأوامر التفصيلية:

#### الخطوة 1: تجهيز قاعدة بيانات Supabase بنقرة واحدة
```bash
cd backend
npm run setup:school -- --db="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" --name-ar="مدرسة النور النموذجية" --code="SCH-ALNOOR"
```
*سيقوم السكربت تلقائياً ببناء الجداول، الفهارس، وزرع الحساب الإداري والسنوات الدراسية.*

#### الخطوة 2: رفع الباك إند (Node.js API Server)
* أنشئ خدمة جديدة واربطها بـ `DATABASE_URL` الخاص بـ Supabase.

#### الخطوة 3: نشر الفرونت إند (Frontend Hosting)
* أنشئ مشروعاً جديداً في منصة الاستضافة واختر فرع المدرسة (`school/al-noor`).
* ضع متغيرات البيئة التالية:
  ```env
  VITE_API_URL=https://api-alnoor.yourdomain.com/api
  VITE_SCHOOL_CODE=SCH-ALNOOR
  VITE_SCHOOL_NAME_AR=مدرسة النور النموذجية
  VITE_SCHOOL_NAME_EN=Al-Noor Model School
  VITE_PRIMARY_COLOR=#4f46e5
  VITE_ALLOCATED_STORAGE_MB=500
  ```

#### الخطوة 4: تسليم المنصة للمدرسة
* **رابط المنصة:** `https://al-noor.school-portal.com` (أو ربط نطاقهم الخاص مثل `portal.alnoorschool.edu`).
* **بيانات المدير الأولية:** `admin@school.local` / `ChangeMe123!` (يُطلب منه تغييرها عند أول تسجيل دخول).
