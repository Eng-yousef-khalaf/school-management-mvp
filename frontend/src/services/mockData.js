/**
 * Standalone Offline / Demo Mock Engine for Smart School Management System
 * Provides rich, realistic data and interactive state when backend is offline or on demo hosts.
 */

// Initial mock state
const initialData = {
  academicYears: [
    { id: 1, name: '2026/2027', startDate: '2026-09-01', endDate: '2027-06-30', active: true, isCurrent: true },
    { id: 2, name: '2025/2026', startDate: '2025-09-01', endDate: '2026-06-30', active: false, isCurrent: false },
  ],
  subjects: [
    { id: 1, code: 'MATH', name: 'Mathematics', active: true },
    { id: 2, code: 'ENG', name: 'English Language', active: true },
    { id: 3, code: 'AR', name: 'Arabic Language', active: true },
    { id: 4, code: 'SCI', name: 'General Science', active: true },
    { id: 5, code: 'ICT', name: 'Computer Science', active: true },
  ],
  classes: [
    { id: 1, name: 'Grade 7 A', gradeLevel: 'Grade 7', section: 'A', capacity: 30, academicYearId: 1, _count: { enrollments: 25 } },
    { id: 2, name: 'Grade 7 B', gradeLevel: 'Grade 7', section: 'B', capacity: 30, academicYearId: 1, _count: { enrollments: 24 } },
    { id: 3, name: 'Grade 8 A', gradeLevel: 'Grade 8', section: 'A', capacity: 30, academicYearId: 1, _count: { enrollments: 26 } },
    { id: 4, name: 'Grade 8 B', gradeLevel: 'Grade 8', section: 'B', capacity: 30, academicYearId: 1, _count: { enrollments: 25 } },
  ],
  teachers: [
    {
      id: 1,
      code: 'TCH-001',
      fullName: 'أحمد خليل',
      specialization: 'Mathematics',
      phone: '+970 59 111 2222',
      status: 'ACTIVE',
      user: { email: 'ahmed.khalil@school.local' },
      classes: ['Grade 7 A', 'Grade 8 A'],
      subjects: ['Mathematics'],
    },
    {
      id: 2,
      code: 'TCH-002',
      fullName: 'سارة منصور',
      specialization: 'English Language',
      phone: '+970 59 222 3333',
      status: 'ACTIVE',
      user: { email: 'sara.mansour@school.local' },
      classes: ['Grade 7 A', 'Grade 7 B'],
      subjects: ['English Language'],
    },
    {
      id: 3,
      code: 'TCH-003',
      fullName: 'عمر فاروق',
      specialization: 'Arabic Language',
      phone: '+970 59 333 4444',
      status: 'ACTIVE',
      user: { email: 'omar.farooq@school.local' },
      classes: ['Grade 7 A', 'Grade 8 A'],
      subjects: ['Arabic Language'],
    },
    {
      id: 4,
      code: 'TCH-004',
      fullName: 'ليلى حسن',
      specialization: 'General Science',
      phone: '+970 59 444 5555',
      status: 'ACTIVE',
      user: { email: 'layla.hassan@school.local' },
      classes: ['Grade 7 B', 'Grade 8 B'],
      subjects: ['General Science'],
    },
    {
      id: 5,
      code: 'TCH-005',
      fullName: 'طارق عزيز',
      specialization: 'Computer Science',
      phone: '+970 59 555 6666',
      status: 'ACTIVE',
      user: { email: 'tareq.aziz@school.local' },
      classes: ['Grade 8 A', 'Grade 8 B'],
      subjects: ['Computer Science'],
    },
  ],
  students: [
    { id: 1, code: 'STD-1001', fullName: 'أنس محمود الزهار', gender: 'MALE', dateOfBirth: '2012-05-14', status: 'ACTIVE', className: 'Grade 7 A', contactPhone: '+970 59 900 1101', parentName: 'محمود الزهار' },
    { id: 2, code: 'STD-1002', fullName: 'مريم يوسف النجار', gender: 'FEMALE', dateOfBirth: '2012-08-22', status: 'ACTIVE', className: 'Grade 7 A', contactPhone: '+970 59 900 1102', parentName: 'يوسف النجار' },
    { id: 3, code: 'STD-1003', fullName: 'حمزة خالد التميمي', gender: 'MALE', dateOfBirth: '2012-03-10', status: 'ACTIVE', className: 'Grade 7 A', contactPhone: '+970 59 900 1103', parentName: 'خالد التميمي' },
    { id: 4, code: 'STD-1004', fullName: 'نور الدين سامي عودة', gender: 'MALE', dateOfBirth: '2012-11-05', status: 'ACTIVE', className: 'Grade 7 B', contactPhone: '+970 59 900 1104', parentName: 'سامي عودة' },
    { id: 5, code: 'STD-1005', fullName: 'فاطمة إبراهيم رضوان', gender: 'FEMALE', dateOfBirth: '2012-07-19', status: 'ACTIVE', className: 'Grade 7 B', contactPhone: '+970 59 900 1105', parentName: 'إبراهيم رضوان' },
    { id: 6, code: 'STD-1006', fullName: 'كريم عبد الله شاهين', gender: 'MALE', dateOfBirth: '2011-04-12', status: 'ACTIVE', className: 'Grade 8 A', contactPhone: '+970 59 900 1106', parentName: 'عبد الله شاهين' },
    { id: 7, code: 'STD-1007', fullName: 'سارة طارق المصري', gender: 'FEMALE', dateOfBirth: '2011-09-30', status: 'ACTIVE', className: 'Grade 8 A', contactPhone: '+970 59 900 1107', parentName: 'طارق المصري' },
    { id: 8, code: 'STD-1008', fullName: 'بلال حسن القدوة', gender: 'MALE', dateOfBirth: '2011-01-15', status: 'ACTIVE', className: 'Grade 8 B', contactPhone: '+970 59 900 1108', parentName: 'حسن القدوة' },
    { id: 9, code: 'STD-1009', fullName: 'رنا ماجد أبو ستة', gender: 'FEMALE', dateOfBirth: '2011-12-08', status: 'ACTIVE', className: 'Grade 8 B', contactPhone: '+970 59 900 1109', parentName: 'ماجد أبو ستة' },
    { id: 10, code: 'STD-1010', fullName: 'يحيى مروان حامد', gender: 'MALE', dateOfBirth: '2012-06-25', status: 'ACTIVE', className: 'Grade 7 A', contactPhone: '+970 59 900 1110', parentName: 'مروان حامد' },
  ],
  users: [
    { id: 1, email: 'admin@school.local', fullName: 'يوسف (المدير العام)', role: 'ADMIN', active: true },
    { id: 2, email: 'staff@school.local', fullName: 'محمد (شؤون الطلاب)', role: 'STAFF', active: true },
    { id: 3, email: 'khalid.staff@school.local', fullName: 'خالد السعيد', role: 'STAFF', active: true },
    { id: 4, email: 'ahmed.khalil@school.local', fullName: 'أحمد خليل', role: 'TEACHER', active: true },
    { id: 5, email: 'sara.mansour@school.local', fullName: 'سارة منصور', role: 'TEACHER', active: true },
  ],
  auditLogs: [
    { id: 1, action: 'LOGIN_SUCCESS', entity: 'User', details: 'تسجيل دخول المدير العام بنجاح', createdAt: new Date().toISOString(), user: { fullName: 'يوسف', role: 'ADMIN' } },
    { id: 2, action: 'GRADE_SUBMIT', entity: 'Grade', details: 'رصد درجات اختبار الرياضيات الفصلي للشعبة 7 A', createdAt: new Date(Date.now() - 3600000).toISOString(), user: { fullName: 'أحمد خليل', role: 'TEACHER' } },
    { id: 3, action: 'ATTENDANCE_RECORD', entity: 'Attendance', details: 'تسجيل دفتر الحضور والغياب اليومي للصف الثامن', createdAt: new Date(Date.now() - 7200000).toISOString(), user: { fullName: 'محمد', role: 'STAFF' } },
    { id: 4, action: 'STUDENT_ENROLL', entity: 'Enrollment', details: 'قبول وتسكين طالب جديد: أنس محمود الزهار', createdAt: new Date(Date.now() - 86400000).toISOString(), user: { fullName: 'محمد', role: 'STAFF' } },
  ],
};

export function handleMockRequest(path, options = {}) {
  const method = options.method || 'GET';
  const cleanPath = path.split('?')[0];

  // 1. Auth: Login
  if (cleanPath === '/auth/login' && method === 'POST') {
    let body = {};
    try { body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {}; } catch {}
    const email = body.email || 'admin@school.local';

    let userRole = 'ADMIN';
    let fullName = 'يوسف (المدير العام)';
    let teacherId = null;

    if (email.includes('staff')) {
      userRole = 'STAFF';
      fullName = email.includes('khalid') ? 'خالد السعيد' : 'محمد (شؤون الطلاب)';
    } else if (email.includes('khalil')) {
      userRole = 'TEACHER';
      fullName = 'أحمد خليل (معلم الرياضيات)';
      teacherId = 1;
    } else if (email.includes('mansour')) {
      userRole = 'TEACHER';
      fullName = 'سارة منصور (معلمة الإنجليزية)';
      teacherId = 2;
    } else if (email.includes('farooq')) {
      userRole = 'TEACHER';
      fullName = 'عمر فاروق (معلم العربية)';
      teacherId = 3;
    } else if (email.includes('hassan')) {
      userRole = 'TEACHER';
      fullName = 'ليلى حسن (معلمة العلوم)';
      teacherId = 4;
    } else if (email.includes('aziz')) {
      userRole = 'TEACHER';
      fullName = 'طارق عزيز (معلم الحاسوب)';
      teacherId = 5;
    }

    const mockUser = {
      id: 1,
      email,
      fullName,
      role: userRole,
      teacherId,
      active: true,
    };

    return {
      token: 'demo-jwt-token-sample-for-preview-mode',
      user: mockUser,
    };
  }

  // 2. Auth: Profile
  if (cleanPath === '/auth/profile') {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : initialData.users[0];
  }

  // 3. Developer Master Auth
  if (cleanPath === '/developer/master-auth' && method === 'POST') {
    const devUser = {
      id: 9999,
      email: 'yousef@platform.dev',
      fullName: 'Yousef Khalaf (Lead Developer & Platform Owner)',
      role: 'ADMIN',
      isDeveloper: true,
      teacherId: null,
    };
    return {
      ok: true,
      token: 'demo-developer-token',
      user: devUser,
    };
  }

  // 4. Dashboards
  if (cleanPath === '/dashboard') {
    return {
      overview: {
        totalStudents: 200,
        totalTeachers: 15,
        totalClasses: 8,
        activeAcademicYear: '2026/2027',
        todayAttendanceRate: 94.5,
        todayStudentAttendance: { total: 200, present: 189, absent: 8, late: 3, excused: 0, rate: 94.5 },
        todayTeacherAttendance: { total: 15, present: 14, absent: 1, late: 0, excused: 0, rate: 93.3 },
        facultyMetrics: {
          totalTeachers: 15,
          assignedTeachersCount: 15,
          pendingTeachersCount: 0,
          classesCovered: 8,
          totalClasses: 8,
          classCoverageRate: 100,
        },
      },
      charts: {
        attendanceTrend: [
          { date: '2026-09-08', rate: 92 },
          { date: '2026-09-09', rate: 95 },
          { date: '2026-09-10', rate: 93 },
          { date: '2026-09-11', rate: 96 },
          { date: '2026-09-12', rate: 94.5 },
        ],
        gradeDistribution: [
          { grade: 'ممتاز (A)', count: 68 },
          { grade: 'جيد جداً (B)', count: 74 },
          { grade: 'جيد (C)', count: 42 },
          { grade: 'مقبول (D)', count: 12 },
          { grade: 'يحتاج تحسين (F)', count: 4 },
        ],
      },
      recentActivities: initialData.auditLogs,
      teacherPerformanceList: initialData.teachers,
      pendingTeachersList: [],
    };
  }

  // 5. Students
  if (cleanPath === '/students') {
    return {
      students: initialData.students,
      total: initialData.students.length,
      page: 1,
      totalPages: 1,
    };
  }
  if (cleanPath.startsWith('/students/')) {
    const id = parseInt(cleanPath.split('/')[2], 10) || 1;
    const student = initialData.students.find((s) => s.id === id) || initialData.students[0];
    return {
      ...student,
      attendance: [
        { date: '2026-09-12', status: 'PRESENT' },
        { date: '2026-09-11', status: 'PRESENT' },
        { date: '2026-09-10', status: 'LATE' },
        { date: '2026-09-09', status: 'PRESENT' },
      ],
      grades: [
        { subject: { name: 'Mathematics' }, examScore: 92, maxScore: 100, letterGrade: 'A' },
        { subject: { name: 'English' }, examScore: 88, maxScore: 100, letterGrade: 'B+' },
        { subject: { name: 'Arabic' }, examScore: 95, maxScore: 100, letterGrade: 'A+' },
        { subject: { name: 'Science' }, examScore: 90, maxScore: 100, letterGrade: 'A' },
      ],
    };
  }

  // 6. Teachers
  if (cleanPath === '/teachers') {
    return {
      teachers: initialData.teachers,
      total: initialData.teachers.length,
    };
  }
  if (cleanPath.startsWith('/teachers/')) {
    const id = parseInt(cleanPath.split('/')[2], 10) || 1;
    return initialData.teachers.find((t) => t.id === id) || initialData.teachers[0];
  }

  // 7. Classes
  if (cleanPath === '/classes') {
    return { classes: initialData.classes, total: initialData.classes.length };
  }
  if (cleanPath.startsWith('/classes/')) {
    const id = parseInt(cleanPath.split('/')[2], 10) || 1;
    return initialData.classes.find((c) => c.id === id) || initialData.classes[0];
  }

  // 8. Subjects & Academic Years
  if (cleanPath === '/subjects') {
    return { subjects: initialData.subjects };
  }
  if (cleanPath === '/academic-years') {
    return { academicYears: initialData.academicYears };
  }

  // 9. Attendance
  if (cleanPath.includes('/attendance')) {
    return {
      records: initialData.students.map((s, idx) => ({
        id: idx + 1,
        studentId: s.id,
        student: s,
        status: idx === 2 ? 'LATE' : idx === 3 ? 'ABSENT' : 'PRESENT',
        date: '2026-09-12',
      })),
    };
  }

  // 10. Grades
  if (cleanPath.includes('/grades')) {
    return {
      grades: initialData.students.map((s, idx) => ({
        id: idx + 1,
        studentId: s.id,
        student: s,
        firstExam: 18 + (idx % 3),
        secondExam: 17 + (idx % 4),
        finalExam: 45 + (idx % 6),
        totalScore: 80 + (idx % 19),
      })),
    };
  }

  // 11. Reports Hub
  if (cleanPath.includes('/reports')) {
    return {
      summary: { totalStudents: 200, passRate: 98, topGradeAverage: 96.4, attendanceAverage: 94.5 },
      topStudents: initialData.students.slice(0, 5),
    };
  }

  // 12. Users & Audit Logs
  if (cleanPath === '/users') {
    return { users: initialData.users };
  }
  if (cleanPath === '/audit-logs') {
    return { logs: initialData.auditLogs, total: initialData.auditLogs.length };
  }

  // 13. Developer Hub Stats
  if (cleanPath === '/developer/system-stats' || cleanPath === '/developer/fleet-stats') {
    return {
      ok: true,
      currentSchool: {
        code: 'SCH-001',
        nameAr: 'مدرسة النور النموذجية',
        nameEn: 'Al-Noor Model School',
        databaseType: 'PostgreSQL (Dedicated Database)',
        studentsCount: 200,
        teachersCount: 15,
        classesCount: 8,
        totalRecords: 1420,
        storageUsedMb: 1.25,
        storageLimitMb: 500,
        storagePercent: 0.25,
        latencyMs: 12,
      },
      stats: {
        totalStudents: 200,
        totalTeachers: 15,
        totalClasses: 8,
        totalRecords: 1420,
        totalStorageUsedMb: 1.25,
        totalStorageLimitMb: 500,
        fleetStoragePercent: 0.25,
        latencyMs: 12,
        healthStatus: 'ALL_SYSTEMS_OPERATIONAL',
        serverUptimeSec: 3600,
        nodeVersion: 'v20.x',
      },
    };
  }

  if (cleanPath === '/developer/storage-analysis') {
    return {
      ok: true,
      totalEstMb: 1.25,
      allocatedTierMb: 500,
      percentUsed: 0.25,
      tableBreakdown: [
        { table: 'Attendance', rows: 840, estBytes: 840 * 256, category: 'Academic Transactions' },
        { table: 'Grade', rows: 320, estBytes: 320 * 256, category: 'Academic Transactions' },
        { table: 'AuditLog', rows: 150, estBytes: 150 * 512, category: 'Security & Logs' },
        { table: 'Student', rows: 200, estBytes: 200 * 1024, category: 'Core Entity' },
        { table: 'Enrollment', rows: 200, estBytes: 200 * 256, category: 'Core Entity' },
        { table: 'Teacher', rows: 15, estBytes: 15 * 512, category: 'Core Entity' },
        { table: 'User', rows: 18, estBytes: 18 * 512, category: 'Auth & Access' },
        { table: 'SchoolClass', rows: 8, estBytes: 8 * 256, category: 'Structure' },
        { table: 'Subject', rows: 12, estBytes: 12 * 256, category: 'Structure' },
        { table: 'AcademicYear', rows: 3, estBytes: 3 * 256, category: 'Structure' },
      ],
    };
  }

  if (cleanPath === '/developer/ping-db') {
    return {
      ok: true,
      status: 'HEALTHY',
      latencyMs: 12,
      timestamp: new Date().toISOString(),
      message: 'Demo mode responsive',
    };
  }

  if (cleanPath === '/developer/clear-cache') {
    return { ok: true, message: 'Cache cleared' };
  }

  if (cleanPath === '/developer/export-backup') {
    return {
      ok: true,
      backup: {
        schoolCode: 'SCH-001',
        schoolNameAr: 'مدرسة النور النموذجية',
        exportedAt: new Date().toISOString(),
        students: initialData.students,
        teachers: initialData.teachers,
      },
    };
  }

  // Default fallback for any other route
  return { ok: true, message: 'Success (Demo Mode)' };
}
