/**
 * Standalone Offline / Demo Mock Engine for Smart School Management System
 * Provides rich, realistic data and interactive state when backend is offline or on demo hosts.
 */

// Dynamic in-memory stores for interactive offline testing
// Dynamic persistent stores for interactive multi-tab offline and demo testing
const initialPayments = [
  {
    id: 1,
    studentId: 1,
    amount: 1500,
    currency: 'ILS',
    method: 'CASH',
    status: 'COMPLETED',
    payerName: 'ياسر الأحمد (ولي الأمر)',
    payerRelationship: 'FATHER',
    payerPhone: '0599123456',
    transactionRef: 'CSH-001',
    receiptNumber: 'GZ-REC-2026-10492',
    notes: 'تسديد القسط السنوي كاملاً في الصندوق',
    recordedBy: 'محمد (موظف Staff)',
    date: '2026-09-05',
    createdAt: '2026-09-05T09:30:00Z'
  },
  {
    id: 2,
    studentId: 2,
    amount: 800,
    currency: 'ILS',
    method: 'BANK_OF_PALESTINE',
    status: 'COMPLETED',
    payerName: 'سامي النجار',
    payerRelationship: 'FATHER',
    payerPhone: '0599654321',
    transactionRef: 'BOP-TRX-883921',
    receiptNumber: 'GZ-REC-2026-10493',
    notes: 'تحويل عبر تطبيق بنكي - الدفعة الأولى',
    recordedBy: 'محمد (موظف Staff)',
    date: '2026-09-08',
    createdAt: '2026-09-08T11:15:00Z'
  },
  {
    id: 3,
    studentId: 3,
    amount: 600,
    currency: 'ILS',
    method: 'JAWWAL_PAY',
    status: 'COMPLETED',
    payerName: 'أم كمال العشي',
    payerRelationship: 'MOTHER',
    payerPhone: '0598112233',
    transactionRef: 'JP-90234812',
    receiptNumber: 'GZ-REC-2026-10494',
    notes: 'محفظة جوال باي',
    recordedBy: 'محمد (موظف Staff)',
    date: '2026-09-10',
    createdAt: '2026-09-10T14:20:00Z'
  },
  {
    id: 4,
    studentId: 4,
    studentName: 'مريم يوسف النجار',
    studentNumber: 'STU-2026-004',
    className: 'الصف السابع أ',
    amount: 300,
    currency: 'ILS',
    method: 'BANK_OF_PALESTINE',
    status: 'PENDING',
    payerName: 'يوسف النجار',
    payerRelationship: 'FATHER',
    payerPhone: '0599887766',
    transactionRef: '497590',
    receiptNumber: null,
    notes: 'تحويل بنك فلسطين - قيد مراجعة واعتماد شؤون الطلاب',
    date: '2026-09-16',
    createdAt: '2026-09-16T11:45:00Z'
  },
  {
    id: 5,
    studentId: 6,
    studentName: 'خالد مصطفى العشي',
    studentNumber: 'STU-2026-006',
    className: 'الصف الثامن ب',
    amount: 250,
    currency: 'ILS',
    method: 'JAWWAL_PAY',
    status: 'PENDING',
    payerName: 'مصطفى العشي',
    payerRelationship: 'FATHER',
    payerPhone: '0599112233',
    transactionRef: 'JP-8891024',
    receiptNumber: null,
    notes: 'تحويل محفظة جوال باي - دفعة قسط',
    date: '2026-09-16',
    createdAt: '2026-09-16T12:10:00Z'
  }
];

export function getMockPayments() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('school_mock_payments_store') : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return initialPayments;
}

export function saveMockPayments(store) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('school_mock_payments_store', JSON.stringify(store));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('payment_notice_updated', { detail: store }));
    }
  } catch {}
}

const mockPaymentsStore = getMockPayments();
const mockStudentFeesStore = {};

// Initial mock state
const initialData = {
  academicYears: [
    {
      id: 1,
      name: '2026/2027',
      startDate: '2026-09-01',
      endDate: '2027-06-30',
      active: true,
      isCurrent: true,
      _count: { classes: 4, enrollments: 10 }
    },
    {
      id: 2,
      name: '2025/2026',
      startDate: '2025-09-01',
      endDate: '2026-06-30',
      active: false,
      isCurrent: false,
      _count: { classes: 4, enrollments: 10 }
    },
  ],
  subjects: [
    { id: 1, code: 'MATH', name: 'Mathematics', teacherCount: 2, teachers: ['أحمد خليل'], active: true },
    { id: 2, code: 'ENG', name: 'English Language', teacherCount: 2, teachers: ['سارة منصور'], active: true },
    { id: 3, code: 'AR', name: 'Arabic Language', teacherCount: 2, teachers: ['عمر فاروق'], active: true },
    { id: 4, code: 'SCI', name: 'General Science', teacherCount: 2, teachers: ['ليلى حسن'], active: true },
    { id: 5, code: 'ICT', name: 'Computer Science', teacherCount: 1, teachers: ['طارق عزيز'], active: true },
  ],
  classes: [
    {
      id: 1,
      name: 'Grade 7 A',
      grade: '7',
      gradeLevel: 'Grade 7',
      section: 'A',
      capacity: 30,
      studentCount: 25,
      estimatedAverage: 88,
      attendanceRate: 96,
      academicYearId: 1,
      academicYear: { id: 1, name: '2026/2027' },
      teachers: [
        { teacherName: 'أحمد خليل', employeeNo: 'TCH-001', subjectName: 'Mathematics', subjectCode: 'MATH' },
        { teacherName: 'سارة منصور', employeeNo: 'TCH-002', subjectName: 'English Language', subjectCode: 'ENG' }
      ],
      _count: { enrollments: 25 }
    },
    {
      id: 2,
      name: 'Grade 7 B',
      grade: '7',
      gradeLevel: 'Grade 7',
      section: 'B',
      capacity: 30,
      studentCount: 24,
      estimatedAverage: 85,
      attendanceRate: 94,
      academicYearId: 1,
      academicYear: { id: 1, name: '2026/2027' },
      teachers: [
        { teacherName: 'سارة منصور', employeeNo: 'TCH-002', subjectName: 'English Language', subjectCode: 'ENG' },
        { teacherName: 'ليلى حسن', employeeNo: 'TCH-004', subjectName: 'General Science', subjectCode: 'SCI' }
      ],
      _count: { enrollments: 24 }
    },
    {
      id: 3,
      name: 'Grade 8 A',
      grade: '8',
      gradeLevel: 'Grade 8',
      section: 'A',
      capacity: 30,
      studentCount: 26,
      estimatedAverage: 89,
      attendanceRate: 97,
      academicYearId: 1,
      academicYear: { id: 1, name: '2026/2027' },
      teachers: [
        { teacherName: 'أحمد خليل', employeeNo: 'TCH-001', subjectName: 'Mathematics', subjectCode: 'MATH' },
        { teacherName: 'عمر فاروق', employeeNo: 'TCH-003', subjectName: 'Arabic Language', subjectCode: 'AR' }
      ],
      _count: { enrollments: 26 }
    },
    {
      id: 4,
      name: 'Grade 8 B',
      grade: '8',
      gradeLevel: 'Grade 8',
      section: 'B',
      capacity: 30,
      studentCount: 25,
      estimatedAverage: 86,
      attendanceRate: 95,
      academicYearId: 1,
      academicYear: { id: 1, name: '2026/2027' },
      teachers: [
        { teacherName: 'طارق عزيز', employeeNo: 'TCH-005', subjectName: 'Computer Science', subjectCode: 'ICT' },
        { teacherName: 'ليلى حسن', employeeNo: 'TCH-004', subjectName: 'General Science', subjectCode: 'SCI' }
      ],
      _count: { enrollments: 25 }
    },
  ],
  teachers: [
    {
      id: 1,
      employeeNo: 'TCH-001',
      code: 'TCH-001',
      firstName: 'أحمد',
      lastName: 'خليل',
      fullName: 'أحمد خليل',
      specialty: 'Mathematics',
      specialization: 'Mathematics',
      phone: '+970 59 111 2222',
      email: 'ahmed.khalil@school.local',
      status: 'ACTIVE',
      active: true,
      user: { email: 'ahmed.khalil@school.local', role: 'TEACHER' },
      classes: ['Grade 7 A', 'Grade 8 A'],
      subjects: ['Mathematics'],
      classesCount: 2,
      subjectsCount: 1,
      attendanceStatus: 'PRESENT',
      checkIn: '07:35 AM',
      isPending: false,
      assignments: [
        { id: 1, className: 'Grade 7 A', grade: 'Grade 7', academicYear: '2026/2027', subjectName: 'Mathematics', subjectCode: 'MATH' },
        { id: 2, className: 'Grade 8 A', grade: 'Grade 8', academicYear: '2026/2027', subjectName: 'Mathematics', subjectCode: 'MATH' }
      ]
    },
    {
      id: 2,
      employeeNo: 'TCH-002',
      code: 'TCH-002',
      firstName: 'سارة',
      lastName: 'منصور',
      fullName: 'سارة منصور',
      specialty: 'English Language',
      specialization: 'English Language',
      phone: '+970 59 222 3333',
      email: 'sara.mansour@school.local',
      status: 'ACTIVE',
      active: true,
      user: { email: 'sara.mansour@school.local', role: 'TEACHER' },
      classes: ['Grade 7 A', 'Grade 7 B'],
      subjects: ['English Language'],
      classesCount: 2,
      subjectsCount: 1,
      attendanceStatus: 'PRESENT',
      checkIn: '07:40 AM',
      isPending: false,
      assignments: [
        { id: 3, className: 'Grade 7 A', grade: 'Grade 7', academicYear: '2026/2027', subjectName: 'English Language', subjectCode: 'ENG' },
        { id: 4, className: 'Grade 7 B', grade: 'Grade 7', academicYear: '2026/2027', subjectName: 'English Language', subjectCode: 'ENG' }
      ]
    },
    {
      id: 3,
      employeeNo: 'TCH-003',
      code: 'TCH-003',
      firstName: 'عمر',
      lastName: 'فاروق',
      fullName: 'عمر فاروق',
      specialty: 'Arabic Language',
      specialization: 'Arabic Language',
      phone: '+970 59 333 4444',
      email: 'omar.farooq@school.local',
      status: 'ACTIVE',
      active: true,
      user: { email: 'omar.farooq@school.local', role: 'TEACHER' },
      classes: ['Grade 7 A', 'Grade 8 A'],
      subjects: ['Arabic Language'],
      classesCount: 2,
      subjectsCount: 1,
      attendanceStatus: 'PRESENT',
      checkIn: '07:38 AM',
      isPending: false,
      assignments: [
        { id: 5, className: 'Grade 7 A', grade: 'Grade 7', academicYear: '2026/2027', subjectName: 'Arabic Language', subjectCode: 'AR' },
        { id: 6, className: 'Grade 8 A', grade: 'Grade 8', academicYear: '2026/2027', subjectName: 'Arabic Language', subjectCode: 'AR' }
      ]
    },
    {
      id: 4,
      employeeNo: 'TCH-004',
      code: 'TCH-004',
      firstName: 'ليلى',
      lastName: 'حسن',
      fullName: 'ليلى حسن',
      specialty: 'General Science',
      specialization: 'General Science',
      phone: '+970 59 444 5555',
      email: 'layla.hassan@school.local',
      status: 'ACTIVE',
      active: true,
      user: { email: 'layla.hassan@school.local', role: 'TEACHER' },
      classes: ['Grade 7 B', 'Grade 8 B'],
      subjects: ['General Science'],
      classesCount: 2,
      subjectsCount: 1,
      attendanceStatus: 'LATE',
      checkIn: '08:05 AM',
      note: 'ازدحام مروري',
      isPending: false,
      assignments: [
        { id: 7, className: 'Grade 7 B', grade: 'Grade 7', academicYear: '2026/2027', subjectName: 'General Science', subjectCode: 'SCI' },
        { id: 8, className: 'Grade 8 B', grade: 'Grade 8', academicYear: '2026/2027', subjectName: 'General Science', subjectCode: 'SCI' }
      ]
    },
    {
      id: 5,
      employeeNo: 'TCH-005',
      code: 'TCH-005',
      firstName: 'طارق',
      lastName: 'عزيز',
      fullName: 'طارق عزيز',
      specialty: 'Computer Science',
      specialization: 'Computer Science',
      phone: '+970 59 555 6666',
      email: 'tareq.aziz@school.local',
      status: 'ACTIVE',
      active: true,
      user: { email: 'tareq.aziz@school.local', role: 'TEACHER' },
      classes: ['Grade 8 A', 'Grade 8 B'],
      subjects: ['Computer Science'],
      classesCount: 2,
      subjectsCount: 1,
      attendanceStatus: 'PRESENT',
      checkIn: '07:42 AM',
      isPending: false,
      assignments: [
        { id: 9, className: 'Grade 8 A', grade: 'Grade 8', academicYear: '2026/2027', subjectName: 'Computer Science', subjectCode: 'ICT' },
        { id: 10, className: 'Grade 8 B', grade: 'Grade 8', academicYear: '2026/2027', subjectName: 'Computer Science', subjectCode: 'ICT' }
      ]
    },
  ],
  students: [
    {
      id: 1,
      studentNumber: 'STD-1001',
      code: 'STD-1001',
      firstName: 'أنس',
      middleName: 'محمود',
      lastName: 'الزهار',
      fullName: 'أنس محمود الزهار',
      gender: 'MALE',
      dateOfBirth: '2012-05-14',
      status: 'ACTIVE',
      currentClass: 'Grade 7 A',
      className: 'Grade 7 A',
      academicYear: '2026/2027',
      parentName: 'محمود الزهار',
      parentPhone: '+970 59 900 1101',
      contactPhone: '+970 59 900 1101',
      address: 'غزة - شارع النصر',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 2,
      studentNumber: 'STD-1002',
      code: 'STD-1002',
      firstName: 'مريم',
      middleName: 'يوسف',
      lastName: 'النجار',
      fullName: 'مريم يوسف النجار',
      gender: 'FEMALE',
      dateOfBirth: '2012-08-22',
      status: 'ACTIVE',
      currentClass: 'Grade 7 A',
      className: 'Grade 7 A',
      academicYear: '2026/2027',
      parentName: 'يوسف النجار',
      parentPhone: '+970 59 900 1102',
      contactPhone: '+970 59 900 1102',
      address: 'غزة - الرمال الشمالي',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 3,
      studentNumber: 'STD-1003',
      code: 'STD-1003',
      firstName: 'حمزة',
      middleName: 'خالد',
      lastName: 'التميمي',
      fullName: 'حمزة خالد التميمي',
      gender: 'MALE',
      dateOfBirth: '2012-03-10',
      status: 'ACTIVE',
      currentClass: 'Grade 7 A',
      className: 'Grade 7 A',
      academicYear: '2026/2027',
      parentName: 'خالد التميمي',
      parentPhone: '+970 59 900 1103',
      contactPhone: '+970 59 900 1103',
      address: 'غزة - شارع عمر المختار',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 4,
      studentNumber: 'STD-1004',
      code: 'STD-1004',
      firstName: 'نور الدين',
      middleName: 'سامي',
      lastName: 'عودة',
      fullName: 'نور الدين سامي عودة',
      gender: 'MALE',
      dateOfBirth: '2012-11-05',
      status: 'ACTIVE',
      currentClass: 'Grade 7 B',
      className: 'Grade 7 B',
      academicYear: '2026/2027',
      parentName: 'سامي عودة',
      parentPhone: '+970 59 900 1104',
      contactPhone: '+970 59 900 1104',
      address: 'غزة - تل الهوا',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 5,
      studentNumber: 'STD-1005',
      code: 'STD-1005',
      firstName: 'فاطمة',
      middleName: 'إبراهيم',
      lastName: 'رضوان',
      fullName: 'فاطمة إبراهيم رضوان',
      gender: 'FEMALE',
      dateOfBirth: '2012-07-19',
      status: 'ACTIVE',
      currentClass: 'Grade 7 B',
      className: 'Grade 7 B',
      academicYear: '2026/2027',
      parentName: 'إبراهيم رضوان',
      parentPhone: '+970 59 900 1105',
      contactPhone: '+970 59 900 1105',
      address: 'غزة - شارع الوحدة',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 6,
      studentNumber: 'STD-1006',
      code: 'STD-1006',
      firstName: 'كريم',
      middleName: 'عبد الله',
      lastName: 'شاهين',
      fullName: 'كريم عبد الله شاهين',
      gender: 'MALE',
      dateOfBirth: '2011-04-12',
      status: 'ACTIVE',
      currentClass: 'Grade 8 A',
      className: 'Grade 8 A',
      academicYear: '2026/2027',
      parentName: 'عبد الله شاهين',
      parentPhone: '+970 59 900 1106',
      contactPhone: '+970 59 900 1106',
      address: 'غزة - الشيخ عجلين',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 7,
      studentNumber: 'STD-1007',
      code: 'STD-1007',
      firstName: 'سارة',
      middleName: 'طارق',
      lastName: 'المصري',
      fullName: 'سارة طارق المصري',
      gender: 'FEMALE',
      dateOfBirth: '2011-09-30',
      status: 'ACTIVE',
      currentClass: 'Grade 8 A',
      className: 'Grade 8 A',
      academicYear: '2026/2027',
      parentName: 'طارق المصري',
      parentPhone: '+970 59 900 1107',
      contactPhone: '+970 59 900 1107',
      address: 'غزة - شارع الثلاثيني',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 8,
      studentNumber: 'STD-1008',
      code: 'STD-1008',
      firstName: 'بلال',
      middleName: 'حسن',
      lastName: 'القدوة',
      fullName: 'بلال حسن القدوة',
      gender: 'MALE',
      dateOfBirth: '2011-01-15',
      status: 'ACTIVE',
      currentClass: 'Grade 8 B',
      className: 'Grade 8 B',
      academicYear: '2026/2027',
      parentName: 'حسن القدوة',
      parentPhone: '+970 59 900 1108',
      contactPhone: '+970 59 900 1108',
      address: 'غزة - حي اليرموك',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 9,
      studentNumber: 'STD-1009',
      code: 'STD-1009',
      firstName: 'رنا',
      middleName: 'ماجد',
      lastName: 'أبو ستة',
      fullName: 'رنا ماجد أبو ستة',
      gender: 'FEMALE',
      dateOfBirth: '2011-12-08',
      status: 'ACTIVE',
      currentClass: 'Grade 8 B',
      className: 'Grade 8 B',
      academicYear: '2026/2027',
      parentName: 'ماجد أبو ستة',
      parentPhone: '+970 59 900 1109',
      contactPhone: '+970 59 900 1109',
      address: 'غزة - الصبرة',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 10,
      studentNumber: 'STD-1010',
      code: 'STD-1010',
      firstName: 'يحيى',
      middleName: 'مروان',
      lastName: 'حامد',
      fullName: 'يحيى مروان حامد',
      gender: 'MALE',
      dateOfBirth: '2012-06-25',
      status: 'ACTIVE',
      currentClass: 'Grade 7 A',
      className: 'Grade 7 A',
      academicYear: '2026/2027',
      parentName: 'مروان حامد',
      parentPhone: '+970 59 900 1110',
      contactPhone: '+970 59 900 1110',
      address: 'غزة - الشجاعية',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
  ],
  users: [
    { id: 1, email: 'admin@school.local', fullName: 'يوسف (المدير العام)', role: 'ADMIN', active: true, createdAt: '2026-09-01T08:00:00.000Z' },
    { id: 2, email: 'staff@school.local', fullName: 'محمد (شؤون الطلاب)', role: 'STAFF', active: true, createdAt: '2026-09-01T08:00:00.000Z' },
    { id: 3, email: 'khalid.staff@school.local', fullName: 'خالد السعيد', role: 'STAFF', active: true, createdAt: '2026-09-01T08:00:00.000Z' },
    { id: 4, email: 'ahmed.khalil@school.local', fullName: 'أحمد خليل', role: 'TEACHER', active: true, createdAt: '2026-09-01T08:00:00.000Z', teacher: { firstName: 'أحمد', lastName: 'خليل', employeeNo: 'TCH-001' } },
    { id: 5, email: 'sara.mansour@school.local', fullName: 'سارة منصور', role: 'TEACHER', active: true, createdAt: '2026-09-01T08:00:00.000Z', teacher: { firstName: 'سارة', lastName: 'منصور', employeeNo: 'TCH-002' } },
  ],
  auditLogs: [
    { id: 1, action: 'LOGIN_SUCCESS', entity: 'User', entityId: '1', details: 'تسجيل دخول المدير العام بنجاح', timestamp: new Date().toISOString(), createdAt: new Date().toISOString(), role: 'ADMIN', user: { fullName: 'يوسف (المدير العام)', role: 'ADMIN' }, ipAddress: '127.0.0.1', metadata: 'Auth Token Issued' },
    { id: 2, action: 'GRADE_SUBMIT', entity: 'Grade', entityId: '7', details: 'رصد درجات اختبار الرياضيات الفصلي للشعبة 7 A', timestamp: new Date(Date.now() - 3600000).toISOString(), createdAt: new Date(Date.now() - 3600000).toISOString(), role: 'TEACHER', user: { fullName: 'أحمد خليل', role: 'TEACHER' }, ipAddress: '127.0.0.1', metadata: 'Class Grade 7 A - Math Midterm' },
    { id: 3, action: 'ATTENDANCE_RECORD', entity: 'Attendance', entityId: '25', details: 'تسجيل دفتر الحضور والغياب اليومي للصف الثامن', timestamp: new Date(Date.now() - 7200000).toISOString(), createdAt: new Date(Date.now() - 7200000).toISOString(), role: 'STAFF', user: { fullName: 'محمد (شؤون الطلاب)', role: 'STAFF' }, ipAddress: '127.0.0.1', metadata: 'Daily Attendance Grade 8 A' },
    { id: 4, action: 'STUDENT_ENROLL', entity: 'Enrollment', entityId: '1', details: 'قبول وتسكين طالب جديد: أنس محمود الزهار', timestamp: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString(), role: 'STAFF', user: { fullName: 'محمد (شؤون الطلاب)', role: 'STAFF' }, ipAddress: '127.0.0.1', metadata: 'Enrolled to Grade 7 A' },
  ],
};

export function handleMockRequest(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const [cleanPath, queryString] = path.split('?');
  const searchParams = new URLSearchParams(queryString || '');

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
      fullName = email.includes('khalid') ? 'خالد السعيد (شؤون الطلاب)' : 'محمد (شؤون الطلاب)';
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
      active: true,
    };
    return {
      ok: true,
      token: 'demo-developer-token',
      user: devUser,
    };
  }

  // 4. Academic Years (Both Active and Array endpoints)
  if (cleanPath === '/academic-years/active') {
    return initialData.academicYears[0];
  }
  if (cleanPath === '/academic-years') {
    return initialData.academicYears;
  }
  if (cleanPath.includes('/set-active')) {
    return { ok: true, message: 'Academic year activated' };
  }

  // 5. Dashboards
  if (cleanPath === '/dashboard') {
    return {
      overview: {
        totalStudents: 200,
        activeStudents: 200,
        totalTeachers: 15,
        totalClasses: 8,
        totalSubjects: 5,
        totalStaff: 2,
        activeAcademicYear: '2026/2027',
        todayAttendanceRate: 94.5,
        todayAttendance: { total: 200, present: 189, absent: 8, late: 3, excused: 0, rate: 94.5 },
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
        teacherAttendanceTrend: [
          { date: '2026-09-08', present: 15, rate: 100 },
          { date: '2026-09-09', present: 14, rate: 93.3 },
          { date: '2026-09-10', present: 15, rate: 100 },
          { date: '2026-09-11', present: 15, rate: 100 },
          { date: '2026-09-12', present: 14, rate: 93.3 },
        ],
        gradeDistribution: [
          { grade: 'ممتاز (A)', count: 68 },
          { grade: 'جيد جداً (B)', count: 74 },
          { grade: 'جيد (C)', count: 42 },
          { grade: 'مقبول (D)', count: 12 },
          { grade: 'يحتاج تحسين (F)', count: 4 },
        ],
        studentsByClass: [
          { className: 'Grade 7 A', count: 25 },
          { className: 'Grade 7 B', count: 24 },
          { className: 'Grade 8 A', count: 26 },
          { className: 'Grade 8 B', count: 25 },
        ],
        studentsByGender: [
          { gender: 'ذكور (Male)', count: 105 },
          { gender: 'إناث (Female)', count: 95 },
        ]
      },
      recentActivities: initialData.auditLogs,
      teacherPerformanceList: initialData.teachers,
      pendingTeachersList: [],
    };
  }

  // 6. Classes (Returns Array for list and object for details)
  if (cleanPath === '/classes') {
    return initialData.classes;
  }
  if (cleanPath.startsWith('/classes/')) {
    const id = parseInt(cleanPath.split('/')[2], 10) || 1;
    const cls = initialData.classes.find((c) => c.id === id) || initialData.classes[0];
    return {
      ...cls,
      students: initialData.students.slice(0, 5),
    };
  }

  // 7. Subjects (Returns Array)
  if (cleanPath === '/subjects') {
    return initialData.subjects;
  }

  // 8. Teachers
  if (cleanPath === '/teachers/attendance/today') {
    return {
      summary: { total: 5, present: 4, late: 1, absent: 0, excused: 0 },
      items: initialData.teachers.map((t) => ({
        teacherId: t.id,
        employeeNo: t.employeeNo,
        fullName: t.fullName,
        specialty: t.specialty,
        classes: t.classes,
        subjects: t.subjects,
        status: t.attendanceStatus || 'PRESENT',
        checkIn: t.checkIn || '07:35 AM',
        note: t.note || 'حضور في الموعد',
      })),
    };
  }
  if (cleanPath === '/teachers/attendance' && method === 'POST') {
    return { ok: true, message: 'Attendance recorded successfully' };
  }
  if (cleanPath === '/teachers/assign' && method === 'POST') {
    return { ok: true, message: 'Class assigned successfully' };
  }
  if (cleanPath.startsWith('/teachers/assign/')) {
    return { ok: true, message: 'Assignment removed' };
  }
  if (cleanPath === '/teachers') {
    const q = searchParams.get('q') || '';
    let filtered = initialData.teachers;
    if (q) {
      filtered = filtered.filter(t => t.fullName.includes(q) || t.employeeNo.includes(q));
    }
    return {
      items: filtered,
      teachers: filtered,
      pagination: { total: filtered.length, page: 1, limit: 20, totalPages: 1 },
      total: filtered.length,
    };
  }
  if (cleanPath.startsWith('/teachers/')) {
    const id = parseInt(cleanPath.split('/')[2], 10) || 1;
    return initialData.teachers.find((t) => t.id === id) || initialData.teachers[0];
  }

  // 9. Students
  if (cleanPath === '/students') {
    const q = searchParams.get('q') || '';
    let filtered = initialData.students;
    if (q) {
      filtered = filtered.filter(s =>
        s.fullName.includes(q) ||
        s.studentNumber.includes(q) ||
        (s.parentName && s.parentName.includes(q)) ||
        (s.parentPhone && s.parentPhone.includes(q))
      );
    }
    return {
      items: filtered,
      students: filtered,
      pagination: { total: filtered.length, page: 1, limit: 20, totalPages: 1 },
      total: filtered.length,
    };
  }
  if (cleanPath.startsWith('/students/')) {
    const id = parseInt(cleanPath.split('/')[2], 10) || 1;
    const student = initialData.students.find((s) => s.id === id) || initialData.students[0];
    return {
      ...student,
      overallAverage: 91,
      attendanceSummary: { percentage: 96, present: 24, absent: 1, late: 1, excused: 0, totalDays: 26 },
      subjectSummary: [
        { 
          subjectCode: 'MATH', 
          subjectName: 'الرياضيات العامة (Mathematics)', 
          activityScore: 19, 
          midtermScore: 28, 
          finalScore: 45, 
          averagePercentage: 92, 
          scores: [
            { examName: 'الأنشطة والمهام', score: 19, maxScore: 20, percentage: 95 },
            { examName: 'الاختبار النصفي', score: 28, maxScore: 30, percentage: 93.3 },
            { examName: 'الاختبار النهائي', score: 45, maxScore: 50, percentage: 90 }
          ] 
        },
        { 
          subjectCode: 'ENG', 
          subjectName: 'اللغة الإنجليزية (English Language)', 
          activityScore: 17, 
          midtermScore: 27, 
          finalScore: 44, 
          averagePercentage: 88, 
          scores: [
            { examName: 'الأنشطة والمهام', score: 17, maxScore: 20, percentage: 85 },
            { examName: 'الاختبار النصفي', score: 27, maxScore: 30, percentage: 90 },
            { examName: 'الاختبار النهائي', score: 44, maxScore: 50, percentage: 88 }
          ] 
        },
        { 
          subjectCode: 'AR', 
          subjectName: 'اللغة العربية والتربية الإسلامية (Arabic)', 
          activityScore: 20, 
          midtermScore: 29, 
          finalScore: 46, 
          averagePercentage: 95, 
          scores: [
            { examName: 'الأنشطة والمهام', score: 20, maxScore: 20, percentage: 100 },
            { examName: 'الاختبار النصفي', score: 29, maxScore: 30, percentage: 96.6 },
            { examName: 'الاختبار النهائي', score: 46, maxScore: 50, percentage: 92 }
          ] 
        },
        { 
          subjectCode: 'SCI', 
          subjectName: 'العلوم العامة والتكنولوجيا (Science)', 
          activityScore: 18, 
          midtermScore: 27, 
          finalScore: 45, 
          averagePercentage: 90, 
          scores: [
            { examName: 'الأنشطة والمهام', score: 18, maxScore: 20, percentage: 90 },
            { examName: 'الاختبار النصفي', score: 27, maxScore: 30, percentage: 90 },
            { examName: 'الاختبار النهائي', score: 45, maxScore: 50, percentage: 90 }
          ] 
        },
      ],
      attendance: [
        { date: '2026-09-12', status: 'PRESENT' },
        { date: '2026-09-11', status: 'PRESENT' },
        { date: '2026-09-10', status: 'LATE', note: 'تأخر 10 دقائق' },
        { date: '2026-09-09', status: 'PRESENT' },
      ],
    };
  }

  // 10. Attendance Sheet & Bulk
  if (cleanPath === '/attendance/sheet') {
    const classId = searchParams.get('classId') || String(initialData.classes[0]?.id || 1);
    const date = searchParams.get('date') || '';
    const key = `${classId}_${date}`;
    const savedForDate = mockAttendanceStore[key] || null;

    const targetClass = initialData.classes.find(c => String(c.id) === String(classId)) || initialData.classes[0];
    const enrolledStudents = initialData.students.filter(s => !s.classId || String(s.classId) === String(classId) || s.className === targetClass?.name);
    const studentsToUse = enrolledStudents.length > 0 ? enrolledStudents : initialData.students;

    return {
      class: targetClass,
      date,
      sheet: studentsToUse.map((s) => {
        const saved = savedForDate ? savedForDate[s.id] : null;
        return {
          studentId: s.id,
          studentNumber: s.studentNumber,
          fullName: s.fullName,
          status: saved ? saved.status : null, // Clean/null on new days!
          note: saved ? (saved.note || '') : '',
        };
      }),
    };
  }
  if (cleanPath === '/attendance/bulk' && method === 'POST') {
    let body = {};
    try { body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {}; } catch {}
    const { classId, date, records } = body;
    const key = `${classId || '1'}_${date || ''}`;
    if (!mockAttendanceStore[key]) mockAttendanceStore[key] = {};
    if (Array.isArray(records)) {
      records.forEach(r => {
        mockAttendanceStore[key][r.studentId] = { status: r.status, note: r.note };
      });
    }
    return { ok: true, message: 'Bulk attendance recorded' };
  }
  if (cleanPath.includes('/attendance')) {
    return {
      summary: { totalDays: 26, present: 24, late: 1, absent: 1, excused: 0, rate: 94.5 },
      records: initialData.students.map((s, idx) => ({
        id: idx + 1,
        studentId: s.id,
        student: s,
        status: idx === 2 ? 'LATE' : idx === 3 ? 'ABSENT' : 'PRESENT',
        date: '2026-09-12',
      })),
    };
  }

  // 11. Grades Sheet & Bulk
  if (cleanPath === '/grades/sheet') {
    return {
      sheet: initialData.students.map((s, idx) => ({
        studentId: s.id,
        studentNumber: s.studentNumber,
        fullName: s.fullName,
        score: 85 + (idx % 14),
        percentage: 85 + (idx % 14),
      })),
    };
  }
  if (cleanPath === '/grades/bulk' && method === 'POST') {
    return { ok: true, message: 'Grades saved' };
  }
  if (cleanPath === '/grades/report') {
    const classId = searchParams.get('classId');
    let students = initialData.students;
    if (classId) {
      students = students.filter(s => s.classId == classId || s.className == classId || (classId == 1 && s.className?.includes('7 A')) || (classId == 2 && s.className?.includes('7 B')));
      if (students.length === 0) students = initialData.students.slice(0, 3);
    }
    const subjects = [
      { id: 1, name: 'الرياضيات (Mathematics)', code: 'MATH' },
      { id: 2, name: 'اللغة الإنجليزية (English)', code: 'ENG' },
      { id: 3, name: 'اللغة العربية (Arabic)', code: 'AR' },
      { id: 4, name: 'العلوم العامة (Science)', code: 'SCI' },
      { id: 5, name: 'التكنولوجيا والحاسوب (ICT)', code: 'ICT' },
    ];
    return {
      subjects,
      report: students.map((s, idx) => ({
        studentId: s.id,
        studentNumber: s.studentNumber,
        studentName: s.fullName,
        className: s.className || 'Grade 7 A',
        subjectGrades: {
          MATH: { score: 92 - (idx * 2), maxScore: 100, percentage: 92 - (idx * 2) },
          ENG: { score: 88 + (idx % 4), maxScore: 100, percentage: 88 + (idx % 4) },
          AR: { score: 95 - (idx % 3), maxScore: 100, percentage: 95 - (idx % 3) },
          SCI: { score: 90 + (idx % 5), maxScore: 100, percentage: 90 + (idx % 5) },
          ICT: { score: 94 - (idx % 2), maxScore: 100, percentage: 94 - (idx % 2) },
        },
        average: 91 + (idx % 5),
      })),
    };
  }
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

  // 12. Enrollments
  if (cleanPath === '/enrollments') {
    return {
      items: initialData.students.map((s, idx) => ({
        id: idx + 1,
        student: s,
        class: initialData.classes[idx % initialData.classes.length],
        enrolledAt: '2026-09-01T08:00:00.000Z',
      })),
      pagination: { total: initialData.students.length, page: 1, limit: 25, totalPages: 1 },
    };
  }
  if (cleanPath === '/enrollments/bulk' && method === 'POST') {
    return { ok: true, enrolledCount: 5, skippedCount: 0 };
  }

  // 13. Users
  if (cleanPath === '/users') {
    return {
      items: initialData.users,
      pagination: { total: initialData.users.length, page: 1, limit: 20, totalPages: 1 },
    };
  }
  if (cleanPath.includes('/reset-password') && method === 'POST') {
    return { ok: true, message: 'Password reset' };
  }

  // 14. Audit Logs
  if (cleanPath === '/audit-logs') {
    return {
      items: initialData.auditLogs,
      pagination: { total: initialData.auditLogs.length, page: 1, limit: 30, totalPages: 1 },
    };
  }

  // 15. Reports Hub & Institutional Analytics
  if (cleanPath === '/reports/demographics') {
    return {
      totalStudents: 200,
      activeStudents: 200,
      maleStudents: 105,
      femaleStudents: 95,
      classesBreakdown: initialData.classes,
    };
  }
  if (cleanPath === '/reports/teachers') {
    return initialData.teachers.map((t) => ({
      employeeNo: t.employeeNo,
      fullName: t.fullName,
      specialty: t.specialty,
      totalAssignments: t.classesCount * 2,
      classes: t.classes.join(', '),
      subjects: t.subjects.join(', '),
      active: 'Active',
    }));
  }
  if (cleanPath === '/reports/bulk-certificates') {
    const classId = searchParams.get('classId');
    let students = initialData.students;
    if (classId) {
      students = students.filter(s => s.classId == classId || s.className == classId || (classId == 1 && s.className?.includes('7 A')) || (classId == 2 && s.className?.includes('7 B')));
      if (students.length === 0) students = initialData.students;
    }
    return students.map((s, idx) => ({
      id: s.id,
      studentNumber: s.studentNumber,
      firstName: s.firstName,
      middleName: s.middleName || '',
      lastName: s.lastName,
      fullName: s.fullName,
      gender: s.gender || 'MALE',
      dateOfBirth: s.dateOfBirth || '2012-05-14',
      status: s.status || 'ACTIVE',
      className: s.className || s.currentClass || 'Grade 7 A',
      academicYear: s.academicYear || '2026/2027',
      parentName: s.parentName || 'ولي الأمر',
      parentPhone: s.parentPhone || '+970 59 900 1101',
      address: s.address || 'غزة - دولة فلسطين',
      overallAverage: 91 + (idx % 6),
      attendanceSummary: {
        percentage: 95 + (idx % 4),
        present: 24,
        absent: 1,
        late: 1,
        excused: 0,
        totalDays: 26,
      },
      subjectSummary: [
        {
          subjectCode: 'MATH',
          subjectName: 'الرياضيات العامة (Mathematics)',
          activityScore: 19,
          midtermScore: 28,
          finalScore: 45,
          averagePercentage: 92,
          scores: [
            { examName: 'الأنشطة والمهام', score: 19, maxScore: 20, percentage: 95 },
            { examName: 'الاختبار النصفي', score: 28, maxScore: 30, percentage: 93.3 },
            { examName: 'الاختبار النهائي', score: 45, maxScore: 50, percentage: 90 },
          ],
        },
        {
          subjectCode: 'ENG',
          subjectName: 'اللغة الإنجليزية (English Language)',
          activityScore: 18,
          midtermScore: 27,
          finalScore: 44,
          averagePercentage: 89,
          scores: [
            { examName: 'الأنشطة والمهام', score: 18, maxScore: 20, percentage: 90 },
            { examName: 'الاختبار النصفي', score: 27, maxScore: 30, percentage: 90 },
            { examName: 'الاختبار النهائي', score: 44, maxScore: 50, percentage: 88 },
          ],
        },
        {
          subjectCode: 'AR',
          subjectName: 'اللغة العربية والتربية الإسلامية (Arabic)',
          activityScore: 20,
          midtermScore: 29,
          finalScore: 46,
          averagePercentage: 95,
          scores: [
            { examName: 'الأنشطة والمهام', score: 20, maxScore: 20, percentage: 100 },
            { examName: 'الاختبار النصفي', score: 29, maxScore: 30, percentage: 96.6 },
            { examName: 'الاختبار النهائي', score: 46, maxScore: 50, percentage: 92 },
          ],
        },
        {
          subjectCode: 'SCI',
          subjectName: 'العلوم العامة والتكنولوجيا (Science)',
          activityScore: 18,
          midtermScore: 27,
          finalScore: 45,
          averagePercentage: 90,
          scores: [
            { examName: 'الأنشطة والمهام', score: 18, maxScore: 20, percentage: 90 },
            { examName: 'الاختبار النصفي', score: 27, maxScore: 30, percentage: 90 },
            { examName: 'الاختبار النهائي', score: 45, maxScore: 50, percentage: 90 },
          ],
        },
        {
          subjectCode: 'ICT',
          subjectName: 'الحاسوب وتكنولوجيا المعلومات (ICT)',
          activityScore: 19,
          midtermScore: 28,
          finalScore: 47,
          averagePercentage: 94,
          scores: [
            { examName: 'الأنشطة والمهام', score: 19, maxScore: 20, percentage: 95 },
            { examName: 'الاختبار النصفي', score: 28, maxScore: 30, percentage: 93.3 },
            { examName: 'الاختبار النهائي', score: 47, maxScore: 50, percentage: 94 },
          ],
        },
      ],
    }));
  }
  if (cleanPath === '/reports/executive-analytical') {
    return {
      academicYear: '2026/2027',
      kpis: {
        totalStudents: 200,
        maleStudents: 105,
        femaleStudents: 95,
        totalTeachers: 15,
        activeTeachers: 15,
        totalClasses: 8,
        studentTeacherRatio: '13.3',
        overallPassRate: 98.5,
        avgSchoolGpa: 87.2,
        avgAttendanceRate: 95.8,
        avgAssignmentsPerTeacher: '4.0',
        curriculumCoveragePct: 100,
        teacherPunctualityPct: 96.5,
      },
      performanceBrackets: {
        excellent: { count: 70, pct: 35 },
        veryGood: { count: 80, pct: 40 },
        good: { count: 35, pct: 17.5 },
        average: { count: 12, pct: 6 },
        needSupport: { count: 3, pct: 1.5 },
      },
      subjectAnalytics: [
        { name: 'Mathematics', code: 'MATH', totalGradesRecorded: 200, averageScore: 88, passRate: 98 },
        { name: 'English Language', code: 'ENG', totalGradesRecorded: 200, averageScore: 86, passRate: 97 },
        { name: 'Arabic Language', code: 'AR', totalGradesRecorded: 200, averageScore: 92, passRate: 99 },
        { name: 'General Science', code: 'SCI', totalGradesRecorded: 200, averageScore: 89, passRate: 98 },
        { name: 'Computer Science', code: 'ICT', totalGradesRecorded: 200, averageScore: 94, passRate: 100 },
      ],
      teacherRosterSimple: initialData.teachers,
      classAnalytics: initialData.classes.map((c) => ({
        name: c.name,
        studentCount: c.studentCount,
        attendanceRate: c.attendanceRate,
        averageGpa: c.estimatedAverage,
        passRate: 98,
      })),
      executiveSummary: {
        recommendations: [
          'تعزيز برامج الإسناد والتقوية للطلبة ذوي التحصيل المتوسط لمواصلة رفع نسبة التفوق العام.',
          'دعم تجهيز وتطوير مختبرات الحاسوب والعلوم بالشراكة مع منظمة اليونيسيف لدعم التحول الرقمي.',
          'الاستمرار في تفعيل التوثيق الإلكتروني للغياب والتأخير لتحقيق نسبة التزام صفي تتجاوز 98%.'
        ]
      }
    };
  }

  // 16. Developer Diagnostics
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

  // 17. Fees & Tuition Management (Gaza & Palestine Mock Handlers)
  if (cleanPath === '/fees/summary') {
    let totalExpected = 0;
    let totalCollected = 0;
    let countPaid = 0;
    let countPartial = 0;
    let countUnpaid = 0;
    let countOverdue = 0;

    const methodBreakdown = {
      CASH: 0,
      BANK_OF_PALESTINE: 0,
      JAWWAL_PAY: 0,
      PALPAY: 0,
      SPONSOR_GRANT: 0
    };

    const currentPayments = getMockPayments();

    currentPayments.forEach(p => {
      if (p.status === 'COMPLETED') {
        totalCollected += p.amount;
        if (methodBreakdown[p.method] !== undefined) {
          methodBreakdown[p.method] += p.amount;
        }
      }
    });

    initialData.students.forEach((s, idx) => {
      const defaultTuition = 1500;
      const discount = idx % 5 === 0 ? 300 : idx % 7 === 0 ? 500 : 0;
      const netTotal = defaultTuition - discount;
      totalExpected += netTotal;

      const studentPaid = currentPayments.filter(p => p.studentId === s.id && p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0);
      if (studentPaid >= netTotal && netTotal > 0) countPaid++;
      else if (idx % 4 === 0 && studentPaid === 0) countOverdue++;
      else if (studentPaid > 0) countPartial++;
      else countUnpaid++;
    });

    const totalOutstanding = Math.max(0, totalExpected - totalCollected);
    const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

    return {
      totalExpected,
      totalDiscount: 12000,
      totalCollected,
      totalOutstanding,
      collectionRate,
      studentCounts: {
        total: initialData.students.length,
        paid: countPaid,
        partial: countPartial,
        unpaid: countUnpaid,
        overdue: countOverdue
      },
      methodBreakdown
    };
  }

  if (cleanPath === '/fees/alerts') {
    const alerts = [];
    const currentPayments = getMockPayments();
    initialData.students.forEach((s, idx) => {
      const defaultTuition = 1500;
      const discount = idx % 5 === 0 ? 300 : 0;
      const studentPaid = currentPayments.filter(p => p.studentId === s.id && p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0);
      const balance = Math.max(0, defaultTuition - discount - studentPaid);

      if (balance > 0) {
        alerts.push({
          studentId: s.id,
          studentNumber: s.studentNumber,
          studentName: s.fullName,
          className: s.className || 'الصف السابع أ',
          parentName: s.parentName || 'ولي الأمر',
          parentPhone: s.parentPhone || '0599112233',
          balanceDue: balance,
          paidAmount: studentPaid,
          totalAmount: defaultTuition,
          isOverdue: idx % 3 === 0,
          dueDate: '2026-09-20'
        });
      }
    });

    return {
      count: alerts.length,
      overdueCount: alerts.filter(a => a.isOverdue).length,
      alerts: alerts.slice(0, 20)
    };
  }

  if (cleanPath.startsWith('/fees/student/')) {
    const sId = parseInt(cleanPath.split('/fees/student/')[1], 10) || 1;
    const student = initialData.students.find(s => s.id === sId) || initialData.students[0];
    const currentPayments = getMockPayments();
    const payments = currentPayments.filter(p => p.studentId === student.id);
    const paidAmount = payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0);
    const totalAmount = 1500;
    const discountAmount = student.id % 5 === 0 ? 300 : 0;
    const balanceDue = Math.max(0, totalAmount - discountAmount - paidAmount);

    return {
      student: {
        id: student.id,
        studentNumber: student.studentNumber,
        fullName: student.fullName,
        className: student.className || 'الصف السابع أ',
        parentName: student.parentName,
        parentPhone: student.parentPhone
      },
      fee: {
        id: student.id,
        totalAmount,
        discountAmount,
        paidAmount,
        balanceDue,
        currency: 'ILS',
        status: balanceDue === 0 ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'UNPAID',
        dueDate: '2026-09-30',
        notes: ''
      },
      payments
    };
  }

  if (cleanPath === '/fees/pending-notices') {
    const currentPayments = getMockPayments();
    const pending = currentPayments.filter(p => p.status === 'PENDING').map(p => {
      const student = initialData.students.find(s => s.id === p.studentId) || {};
      return {
        ...p,
        studentName: p.studentName || student.fullName || 'طالب المدرسة',
        studentNumber: p.studentNumber || student.studentNumber || 'STU-000',
        className: p.className || student.className || 'الصف السابع أ'
      };
    });
    return pending;
  }

  if (cleanPath.startsWith('/fees/payments/') && cleanPath.endsWith('/approve') && method === 'POST') {
    const parts = cleanPath.split('/');
    const pId = parseInt(parts[3], 10);
    const currentPayments = getMockPayments();
    const payment = currentPayments.find(p => p.id === pId);
    if (payment) {
      payment.status = 'COMPLETED';
      payment.receiptNumber = `GZ-REC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      payment.recordedBy = 'محمد (موظف Staff)';
      payment.approvedAt = new Date().toISOString();
      saveMockPayments(currentPayments);
      return {
        ok: true,
        payment,
        receiptNumber: payment.receiptNumber,
        message: 'Payment approved and official receipt issued successfully'
      };
    }
    return { ok: false, message: 'Payment not found' };
  }

  if (cleanPath.startsWith('/fees/payments/') && cleanPath.endsWith('/reject') && method === 'POST') {
    const parts = cleanPath.split('/');
    const pId = parseInt(parts[3], 10);
    let body = {};
    try { body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {}; } catch {}
    const currentPayments = getMockPayments();
    const payment = currentPayments.find(p => p.id === pId);
    if (payment) {
      payment.status = 'REJECTED';
      payment.notes = `${payment.notes ? payment.notes + ' | ' : ''}تم الرفض من شؤون الطلاب: ${body.reason || 'بيانات الحوالة غير متطابقة'}`;
      saveMockPayments(currentPayments);
      return { ok: true, payment };
    }
    return { ok: false, message: 'Payment not found' };
  }

  if ((cleanPath === '/fees/parent-notice' || cleanPath === '/fees/payments') && method === 'POST') {
    let body = {};
    try { body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {}; } catch {}
    const sId = parseInt(body.studentId, 10) || 1;
    const numAmount = parseFloat(body.amount) || 0;
    const isPending = body.status === 'PENDING' || cleanPath === '/fees/parent-notice';
    const student = initialData.students.find(s => s.id === sId || s.studentNumber === body.studentNumber);
    const receiptNumber = isPending ? null : `GZ-REC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const currentPayments = getMockPayments();

    const newPayment = {
      id: currentPayments.length + 1,
      studentId: student?.id || sId,
      studentName: body.studentName || student?.fullName || 'طالب المدرسة',
      studentNumber: body.studentNumber || student?.studentNumber || 'STU-2026-001',
      className: student?.className || 'الصف السابع أ',
      amount: numAmount,
      currency: body.currency || 'ILS',
      method: body.method || 'CASH',
      status: isPending ? 'PENDING' : (body.status || 'COMPLETED'),
      payerName: body.payerName || 'ولي الأمر',
      payerRelationship: body.payerRelationship || 'FATHER',
      payerPhone: body.payerPhone || '',
      transactionRef: body.transactionRef || `TRX-${Date.now().toString().slice(-6)}`,
      receiptNumber,
      notes: body.notes || (isPending ? 'إشعار تحويل إلكتروني قيد مراجعة واعتماد شؤون الطلاب' : ''),
      recordedBy: isPending ? null : 'محمد (موظف Staff)',
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString()
    };

    currentPayments.unshift(newPayment);
    saveMockPayments(currentPayments);

    return {
      ok: true,
      payment: newPayment,
      receiptNumber
    };
  }

  if (cleanPath === '/fees') {
    const classId = searchParams.get('classId');
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase() || '';

    let students = initialData.students;
    if (classId && classId !== 'ALL') {
      students = students.filter(s => s.classId == classId || s.className?.includes(classId));
    }
    if (search) {
      students = students.filter(s => s.fullName?.toLowerCase().includes(search) || s.studentNumber?.toLowerCase().includes(search));
    }

    const currentPayments = getMockPayments();
    const items = students.map((st, idx) => {
      const defaultTuition = 1500;
      const discount = idx % 5 === 0 ? 300 : idx % 7 === 0 ? 500 : 0;
      const studentPayments = currentPayments.filter(p => p.studentId === st.id && p.status === 'COMPLETED');
      const paid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
      const netTotal = Math.max(0, defaultTuition - discount);
      const balance = Math.max(0, netTotal - paid);

      let calcStatus = 'UNPAID';
      if (paid >= netTotal && netTotal > 0) calcStatus = 'PAID';
      else if (idx % 4 === 0 && paid === 0) calcStatus = 'OVERDUE';
      else if (paid > 0) calcStatus = 'PARTIAL';

      return {
        studentId: st.id,
        studentNumber: st.studentNumber,
        fullName: st.fullName,
        className: st.className || 'الصف السابع أ',
        classId: st.classId || 1,
        parentName: st.parentName || 'غير مسجل',
        parentPhone: st.parentPhone || '0599123456',
        totalAmount: defaultTuition,
        discountAmount: discount,
        paidAmount: paid,
        balanceDue: balance,
        currency: 'ILS',
        status: calcStatus,
        dueDate: '2026-09-30',
        recentPaymentsCount: studentPayments.length,
        lastPaymentDate: studentPayments[0]?.date || null
      };
    });

    const filteredItems = status && status !== 'ALL'
      ? items.filter(it => it.status === status)
      : items;

    return {
      items: filteredItems,
      summary: {
        totalExpected: items.reduce((sum, i) => sum + (i.totalAmount - i.discountAmount), 0),
        totalCollected: items.reduce((sum, i) => sum + i.paidAmount, 0),
        totalOutstanding: items.reduce((sum, i) => sum + i.balanceDue, 0),
        collectionRate: Math.round((items.reduce((sum, i) => sum + i.paidAmount, 0) / Math.max(1, items.reduce((sum, i) => sum + (i.totalAmount - i.discountAmount), 0))) * 100),
        methodBreakdown: {
          CASH: currentPayments.filter(p => p.status === 'COMPLETED' && p.method === 'CASH').reduce((s, p) => s + p.amount, 0),
          BANK_OF_PALESTINE: currentPayments.filter(p => p.status === 'COMPLETED' && p.method === 'BANK_OF_PALESTINE').reduce((s, p) => s + p.amount, 0),
          JAWWAL_PAY: currentPayments.filter(p => p.status === 'COMPLETED' && p.method === 'JAWWAL_PAY').reduce((s, p) => s + p.amount, 0),
          PALPAY: currentPayments.filter(p => p.status === 'COMPLETED' && p.method === 'PALPAY').reduce((s, p) => s + p.amount, 0)
        },
        studentCounts: {
          total: items.length,
          paid: items.filter(i => i.status === 'PAID').length,
          partial: items.filter(i => i.status === 'PARTIAL').length,
          unpaid: items.filter(i => i.status === 'UNPAID').length,
          overdue: items.filter(i => i.status === 'OVERDUE').length
        }
      },
      pagination: {
        total: filteredItems.length,
        page: 1,
        limit: 50,
        totalPages: 1
      }
    };
  }

  // Fallback for any other route
  return { ok: true, message: 'Success (Demo Mode)' };
}
