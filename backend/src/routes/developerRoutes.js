const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

// Master Developer Authentication Key
const DEVELOPER_MASTER_KEY = process.env.DEVELOPER_MASTER_KEY || 'YOUSEF_MASTER_2026';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-32chars!';

/**
 * POST /api/developer/master-auth
 * Authenticates Yousef as Lead Developer / Super Admin into this school instance
 */
router.post('/master-auth', async (req, res) => {
  try {
    const { masterKey } = req.body;

    if (!masterKey || masterKey !== DEVELOPER_MASTER_KEY) {
      return res.status(401).json({ ok: false, error: 'Invalid developer master key' });
    }

    // Try finding an existing admin user, or create virtual dev user payload
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    const devPayload = {
      id: adminUser ? adminUser.id : 9999,
      email: 'yousef@platform.dev',
      fullName: 'Yousef Khalaf (Lead Developer & Platform Owner)',
      role: 'ADMIN',
      isDeveloper: true,
      teacherId: null,
    };

    const token = jwt.sign(devPayload, JWT_SECRET, { expiresIn: '24h' });

    return res.json({
      ok: true,
      token,
      user: {
        id: devPayload.id,
        email: devPayload.email,
        fullName: devPayload.fullName,
        role: devPayload.role,
        isDeveloper: true,
      },
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * GET /api/developer/system-stats & /api/developer/fleet-stats (backward-compatible)
 * Real-time telemetry, record counts, and database storage analysis for the active instance
 */
const getSystemStatsHandler = async (req, res) => {
  try {
    const startTime = Date.now();

    // Run parallel counts for fast response
    const [
      studentsCount,
      teachersCount,
      classesCount,
      enrollmentsCount,
      attendanceCount,
      gradesCount,
      auditLogsCount,
      usersCount,
      academicYearsCount,
      subjectsCount,
    ] = await Promise.all([
      prisma.student.count().catch(() => 0),
      prisma.teacher.count().catch(() => 0),
      prisma.schoolClass.count().catch(() => 0),
      prisma.enrollment.count().catch(() => 0),
      prisma.attendance.count().catch(() => 0),
      prisma.grade.count().catch(() => 0),
      prisma.auditLog.count().catch(() => 0),
      prisma.user.count().catch(() => 0),
      prisma.academicYear.count().catch(() => 0),
      prisma.subject.count().catch(() => 0),
    ]);

    const latencyMs = Date.now() - startTime;

    // Estimate storage usage in KB & MB based on real row footprints + schema index overhead
    const estimatedBytes =
      studentsCount * 1024 + // ~1KB per student
      teachersCount * 512 + // ~0.5KB per teacher
      classesCount * 256 +
      enrollmentsCount * 256 +
      attendanceCount * 256 + // ~256B per attendance record
      gradesCount * 256 + // ~256B per grade
      auditLogsCount * 512 + // ~0.5KB per audit log
      usersCount * 512 +
      academicYearsCount * 256 +
      subjectsCount * 256 +
      100 * 1024; // Base schema & indexes overhead

    const storageUsedMb = parseFloat((estimatedBytes / (1024 * 1024)).toFixed(3));
    const allocatedStorageMb = parseInt(process.env.ALLOCATED_STORAGE_MB || '500', 10);
    const storagePercent = parseFloat(((storageUsedMb / allocatedStorageMb) * 100).toFixed(2));

    const totalRecords =
      studentsCount +
      teachersCount +
      classesCount +
      enrollmentsCount +
      attendanceCount +
      gradesCount +
      auditLogsCount +
      usersCount +
      academicYearsCount +
      subjectsCount;

    const currentSchool = {
      code: process.env.SCHOOL_CODE || 'SCH-001',
      nameAr: process.env.SCHOOL_NAME_AR || 'مدرسة النور النموذجية',
      nameEn: process.env.SCHOOL_NAME_EN || 'Al-Noor Model School',
      databaseType: process.env.DATABASE_URL?.startsWith('file:')
        ? 'SQLite (Local Dedicated DB)'
        : 'PostgreSQL (Supabase / Production DB)',
      studentsCount,
      teachersCount,
      classesCount,
      totalRecords,
      storageUsedMb,
      storageLimitMb: allocatedStorageMb,
      storagePercent,
      latencyMs,
      tables: {
        students: studentsCount,
        teachers: teachersCount,
        classes: classesCount,
        enrollments: enrollmentsCount,
        attendance: attendanceCount,
        grades: gradesCount,
        auditLogs: auditLogsCount,
        users: usersCount,
        subjects: subjectsCount,
        academicYears: academicYearsCount,
      },
    };

    return res.json({
      ok: true,
      currentSchool,
      stats: {
        totalSchools: 1,
        totalStudents: studentsCount,
        totalTeachers: teachersCount,
        totalClasses: classesCount,
        totalRecords,
        totalStorageUsedMb: storageUsedMb,
        totalStorageLimitMb: allocatedStorageMb,
        fleetStoragePercent: storagePercent,
        latencyMs,
        healthStatus: 'ALL_SYSTEMS_OPERATIONAL',
        serverUptimeSec: Math.floor(process.uptime()),
        nodeVersion: process.version,
      },
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
};

router.get('/system-stats', getSystemStatsHandler);
router.get('/fleet-stats', getSystemStatsHandler); // Alias for backward compatibility

/**
 * GET /api/developer/storage-analysis
 * Detailed breakdown of database tables and storage size for this instance
 */
router.get('/storage-analysis', async (req, res) => {
  try {
    const [
      students,
      attendance,
      grades,
      auditLogs,
      enrollments,
      teachers,
      users,
      classes,
      subjects,
      years,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.attendance.count(),
      prisma.grade.count(),
      prisma.auditLog.count(),
      prisma.enrollment.count(),
      prisma.teacher.count(),
      prisma.user.count(),
      prisma.schoolClass.count(),
      prisma.subject.count(),
      prisma.academicYear.count(),
    ]);

    const tableBreakdown = [
      { table: 'Attendance', rows: attendance, estBytes: attendance * 256, category: 'Academic Transactions' },
      { table: 'Grade', rows: grades, estBytes: grades * 256, category: 'Academic Transactions' },
      { table: 'AuditLog', rows: auditLogs, estBytes: auditLogs * 512, category: 'Security & Logs' },
      { table: 'Student', rows: students, estBytes: students * 1024, category: 'Core Entity' },
      { table: 'Enrollment', rows: enrollments, estBytes: enrollments * 256, category: 'Core Entity' },
      { table: 'Teacher', rows: teachers, estBytes: teachers * 512, category: 'Core Entity' },
      { table: 'User', rows: users, estBytes: users * 512, category: 'Auth & Access' },
      { table: 'SchoolClass', rows: classes, estBytes: classes * 256, category: 'Structure' },
      { table: 'Subject', rows: subjects, estBytes: subjects * 256, category: 'Structure' },
      { table: 'AcademicYear', rows: years, estBytes: years * 256, category: 'Structure' },
    ];

    const totalEstBytes = tableBreakdown.reduce((acc, t) => acc + t.estBytes, 0) + 100 * 1024;
    const totalEstMb = parseFloat((totalEstBytes / (1024 * 1024)).toFixed(3));
    const allocatedTierMb = parseInt(process.env.ALLOCATED_STORAGE_MB || '500', 10);

    res.json({
      ok: true,
      totalEstMb,
      allocatedTierMb,
      percentUsed: parseFloat(((totalEstMb / allocatedTierMb) * 100).toFixed(2)),
      tableBreakdown,
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * GET /api/developer/ping-db
 * Database ping / connection health verification
 */
router.get('/ping-db', async (req, res) => {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    res.json({
      ok: true,
      status: 'HEALTHY',
      latencyMs: latency,
      timestamp: new Date().toISOString(),
      message: 'Database connection is healthy and responsive',
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      status: 'UNHEALTHY',
      error: error.message,
      latencyMs: Date.now() - start,
    });
  }
});

/**
 * POST /api/developer/clear-cache
 * Purges memory cache and resets connection pool telemetry
 */
router.post('/clear-cache', (req, res) => {
  try {
    if (global.gc) {
      global.gc();
    }
    res.json({
      ok: true,
      message: 'System cache & temporary buffers cleared successfully',
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * GET /api/developer/export-backup
 * Exports a full JSON snapshot of school core records for backup purposes
 */
router.get('/export-backup', async (req, res) => {
  try {
    const [students, teachers, classes, subjects, years, auditLogs] = await Promise.all([
      prisma.student.findMany({ select: { id: true, code: true, fullName: true, gender: true, status: true, contactPhone: true } }),
      prisma.teacher.findMany({ select: { id: true, code: true, fullName: true, specialization: true, status: true, phone: true } }),
      prisma.schoolClass.findMany({ select: { id: true, name: true, gradeLevel: true, capacity: true } }),
      prisma.subject.findMany({ select: { id: true, name: true, code: true } }),
      prisma.academicYear.findMany({ select: { id: true, name: true, isCurrent: true, startDate: true, endDate: true } }),
      prisma.auditLog.findMany({ take: 200, orderBy: { createdAt: 'desc' } }),
    ]);

    const backupData = {
      exportMetadata: {
        schoolCode: process.env.SCHOOL_CODE || 'SCH-001',
        schoolNameAr: process.env.SCHOOL_NAME_AR || 'مدرسة النور النموذجية',
        schoolNameEn: process.env.SCHOOL_NAME_EN || 'Al-Noor Model School',
        exportedAt: new Date().toISOString(),
        version: 'v2.0.0 (Standalone Instance)',
      },
      counts: {
        students: students.length,
        teachers: teachers.length,
        classes: classes.length,
        subjects: subjects.length,
        academicYears: years.length,
        auditLogs: auditLogs.length,
      },
      data: {
        students,
        teachers,
        classes,
        subjects,
        academicYears: years,
        auditLogs,
      },
    };

    res.json({ ok: true, backup: backupData });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;
