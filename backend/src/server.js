require('dotenv').config();
const express = require('express');
const cors = require('cors');

let helmet;
try {
  helmet = require('helmet');
} catch {
  helmet = null;
}

let rateLimit;
try {
  rateLimit = require('express-rate-limit');
} catch {
  rateLimit = null;
}

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const classRoutes = require('./routes/classRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const academicYearRoutes = require('./routes/academicYearRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const developerRoutes = require('./routes/developerRoutes');
const feeRoutes = require('./routes/feeRoutes');

const errorHandler = require('./middleware/errorHandler');
const prisma = require('./utils/prisma');

const app = express();

// Security Headers
if (helmet) {
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }));
} else {
  // Native fallback security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
}

const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : true;
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiter
const loginAttempts = new Map();
const loginLimiter = rateLimit
  ? rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 50,
      message: { error: 'Too many login attempts. Please try again after 15 minutes.' }
    })
  : (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      const userAttempts = loginAttempts.get(ip) || [];
      const recent = userAttempts.filter(time => now - time < 15 * 60 * 1000);
      if (recent.length >= 50) {
        return res.status(429).json({ error: 'Too many login attempts. Please try again later.' });
      }
      recent.push(now);
      loginAttempts.set(ip, recent);
      next();
    };

// Welcome & Status Root Route
app.get('/', async (req, res) => {
  let dbStatus = 'Connected 🟢';
  let totalStudents = 0;
  let totalTeachers = 0;
  const frontendUrl = process.env.FRONTEND_URL || (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*' ? process.env.CORS_ORIGIN.split(',')[0] : 'https://school-management-mauve-phi.vercel.app');
  try {
    await prisma.$queryRaw`SELECT 1`;
    totalStudents = await prisma.student.count();
    totalTeachers = await prisma.teacher.count();
  } catch {
    dbStatus = 'Unavailable 🔴';
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${process.env.SCHOOL_NAME_AR || 'المنظومة الأكاديمية الذكية'} | Backend API</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: radial-gradient(circle at top, #1e1b4b 0%, #0f172a 60%, #020617 100%);
          color: #f8fafc;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px 20px;
        }
        .container {
          background: rgba(30, 41, 59, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          max-width: 760px;
          width: 100%;
          padding: 44px 36px;
          box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.15);
          text-align: center;
        }
        .badge-country {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(16, 185, 129, 0.12);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.35);
          padding: 6px 20px;
          border-radius: 9999px;
          font-size: 13.5px;
          font-weight: 800;
          margin-bottom: 20px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
        }
        .logo-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }
        h1 {
          font-size: 28px;
          font-weight: 900;
          color: #ffffff;
          margin-bottom: 6px;
          letter-spacing: -0.5px;
        }
        p.subtitle {
          color: #94a3b8;
          font-size: 14.5px;
          margin-bottom: 28px;
        }
        .status-card {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 18px 24px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 28px;
          text-align: center;
        }
        .status-item span {
          display: block;
          font-size: 11.5px;
          color: #64748b;
          font-weight: 700;
        }
        .status-item strong {
          display: block;
          font-size: 14.5px;
          color: #f1f5f9;
          margin-top: 5px;
        }
        .cta-box {
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(6, 182, 212, 0.15));
          border: 1px solid rgba(99, 102, 241, 0.4);
          border-radius: 18px;
          padding: 24px 20px;
          margin-bottom: 28px;
        }
        .cta-box h3 {
          font-size: 16px;
          color: #e2e8f0;
          margin-bottom: 8px;
        }
        .cta-box p {
          font-size: 13px;
          color: #94a3b8;
          margin-bottom: 16px;
        }
        .btn-frontend {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #4338ca 100%);
          color: #ffffff;
          text-decoration: none;
          padding: 15px 36px;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 800;
          box-shadow: 0 10px 25px rgba(79, 70, 229, 0.45);
          transition: all 0.25s ease;
        }
        .btn-frontend:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 32px rgba(79, 70, 229, 0.6);
        }
        .frontend-quick-links {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 10px;
          margin-top: 16px;
        }
        .quick-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          padding: 10px;
          border-radius: 10px;
          text-decoration: none;
          font-size: 12.5px;
          font-weight: 700;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .quick-btn:hover {
          background: rgba(99, 102, 241, 0.2);
          border-color: rgba(99, 102, 241, 0.5);
          color: #ffffff;
        }
        .security-notice {
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 12px;
          color: #fbbf24;
          line-height: 1.6;
          text-align: right;
          margin-bottom: 20px;
        }
        .security-notice strong {
          display: block;
          font-size: 13px;
          margin-bottom: 4px;
          color: #fde68a;
        }
        .api-endpoints-box {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 18px;
          text-align: right;
        }
        .api-endpoints-title {
          font-size: 12.5px;
          color: #64748b;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .api-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: flex-start;
        }
        .api-tag {
          font-size: 11.5px;
          padding: 5px 10px;
          border-radius: 6px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .api-tag.public {
          background: rgba(16, 185, 129, 0.12);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .api-tag.protected {
          background: rgba(100, 116, 139, 0.15);
          color: #94a3b8;
          border: 1px solid rgba(100, 116, 139, 0.25);
          cursor: help;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="badge-country">
          <span>🇵🇸</span>
          <span>دولة فلسطين / وزارة التربية والتعليم</span>
        </div>

        <div class="logo-wrap">
          <svg width="76" height="76" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1e3a8a" />
                <stop offset="50%" stop-color="#3b82f6" />
                <stop offset="100%" stop-color="#0284c7" />
              </linearGradient>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fef08a" />
                <stop offset="50%" stop-color="#eab308" />
                <stop offset="100%" stop-color="#ca8a04" />
              </linearGradient>
            </defs>
            <path d="M 50 6 C 72 6 88 12 88 28 C 88 64 50 94 50 94 C 50 94 12 64 12 28 C 12 12 28 6 50 6 Z" fill="url(#shieldGrad)" stroke="url(#goldGrad)" stroke-width="2.5" />
            <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.2" stroke-dasharray="3 2" />
            <path d="M 28 58 C 36 53 46 53 50 56 C 54 53 64 53 72 58 L 72 40 C 64 35 54 35 50 38 C 46 35 36 35 28 40 Z" fill="#ffffff" opacity="0.95" />
            <path d="M 50 38 L 50 56" stroke="#0284c7" stroke-width="1.8" />
            <polygon points="50,22 68,28 50,34 32,28" fill="url(#goldGrad)" />
            <path d="M 50 34 L 50 39" stroke="url(#goldGrad)" stroke-width="1.8" />
            <circle cx="50" cy="39" r="1.5" fill="url(#goldGrad)" />
          </svg>
        </div>

        <h1>${process.env.SCHOOL_NAME_AR || 'المنظومة الأكاديمية الذكية'}</h1>
        <p class="subtitle">محرك الخدمات البرمجية وقواعد البيانات (Backend API Services V2)</p>

        <div class="status-card">
          <div class="status-item">
            <span>حالة الخادم</span>
            <strong style="color: #34d399;">نشط ويعمل 🟢</strong>
          </div>
          <div class="status-item">
            <span>قاعدة البيانات</span>
            <strong>${dbStatus}</strong>
          </div>
          <div class="status-item">
            <span>إجمالي الطلاب</span>
            <strong>${totalStudents} طالب</strong>
          </div>
          <div class="status-item">
            <span>المعلمون</span>
            <strong>${totalTeachers} معلم</strong>
          </div>
        </div>

        <div class="cta-box">
          <h3>🖥️ واجهة المستخدم التفاعلية (Frontend Web App)</h3>
          <p>للوصول إلى النظام وتصفح السجلات والدرجات والشهادات، يرجى الدخول عبر واجهة المستخدم التفاعلية:</p>
          <a href="${frontendUrl}" class="btn-frontend" target="_blank">
            <span>🚀 فتح شاشة تسجيل الدخول والنظام</span>
            <span style="font-size: 18px;">&larr;</span>
          </a>
          <div class="frontend-quick-links">
            <a href="${frontendUrl}/students" class="quick-btn" target="_blank">👥 سجل الطلاب</a>
            <a href="${frontendUrl}/teachers" class="quick-btn" target="_blank">👨‍🏫 دليل المعلمين</a>
            <a href="${frontendUrl}/classes" class="quick-btn" target="_blank">🏫 الصفوف والشعب</a>
            <a href="${frontendUrl}/certificates" class="quick-btn" target="_blank">📜 الشهادات والإفادات</a>
          </div>
        </div>

        <div class="security-notice">
          <strong>🔒 تنبيه أمني بخصوص روابط الـ API المباشرة:</strong>
          هذا الخادم مخصص لمعالجة البيانات البرمجية الخلفية. جميع روابط البيانات (مثل الطلاب والمعلمين والصفوف) 
          <strong>محمية بنظام تشفير وتوثيق أمني (JWT Token)</strong> لضمان خصوصية بيانات المدرسة، وعند الضغط عليها مباشرة في نافذة المتصفح بدون تسجيل الدخول تظهر رسالة 
          <code>"Access denied. No token provided"</code> لحماية البيانات من الوصول غير المصرح به.
          لفتح هذه البيانات بصرياً، يتم الدخول دائماً عبر <strong>الواجهة التفاعلية</strong>.
        </div>

        <div class="api-endpoints-box">
          <div class="api-endpoints-title">📡 روابط فحص الـ API للمطورين:</div>
          <div class="api-tags">
            <a href="/api/health" class="api-tag public" target="_blank" title="نقطة فحص عامة ومفتوحة">
              🟢 /api/health (فحص جاهزية الخادم - عام)
            </a>
            <span class="api-tag protected" title="مسار محمي يتطلب Bearer Token عبر الواجهة التفاعلية">
              🔒 /api/students (محمي بـ JWT)
            </span>
            <span class="api-tag protected" title="مسار محمي يتطلب Bearer Token عبر الواجهة التفاعلية">
              🔒 /api/teachers (محمي بـ JWT)
            </span>
            <span class="api-tag protected" title="مسار محمي يتطلب Bearer Token عبر الواجهة التفاعلية">
              🔒 /api/classes (محمي بـ JWT)
            </span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Health check
app.get('/api/health', async (_, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, status: 'healthy', school: process.env.SCHOOL_NAME_AR || 'المنظومة الأكاديمية الذكية', country: 'دولة فلسطين / وزارة التربية والتعليم', timestamp: new Date().toISOString() });
  } catch (e) {
    res.status(503).json({ ok: false, status: 'database_unavailable', error: e.message });
  }
});

// API Routes
app.use('/api/auth', (req, res, next) => {
  if (req.path === '/login' && req.method === 'POST') {
    return loginLimiter(req, res, next);
  }
  next();
}, authRoutes);

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/academic-years', academicYearRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/developer', developerRoutes);
app.use('/api/fees', feeRoutes);

// Centralized error handler
app.use(errorHandler);

const port = parseInt(process.env.PORT, 10) || 4000;
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(port, () => {
    console.log(`[School Management V2] Backend running on http://localhost:${port}`);
  });

  process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  });
}

module.exports = app;
