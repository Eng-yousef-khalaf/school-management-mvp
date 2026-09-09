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

// Health check
app.get('/api/health', async (_, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, status: 'healthy', timestamp: new Date().toISOString() });
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
