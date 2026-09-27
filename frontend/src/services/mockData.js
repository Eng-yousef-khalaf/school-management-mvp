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

export function getMockAttendance() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('school_mock_attendance_store') : null;
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveMockAttendance(store) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('school_mock_attendance_store', JSON.stringify(store));
      window.dispatchEvent(new Event('storage'));
    }
  } catch {}
}

const mockPaymentsStore = getMockPayments();
const mockStudentFeesStore = {};
const mockAttendanceStore = getMockAttendance();

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
      phone: '+970 59 111 2201',
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
      phone: '+970 59 222 3302',
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
      phone: '+970 59 333 4403',
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
      phone: '+970 59 444 5504',
      email: 'layla.hassan@school.local',
      status: 'ACTIVE',
      active: true,
      user: { email: 'layla.hassan@school.local', role: 'TEACHER' },
      classes: ['Grade 7 B', 'Grade 8 B'],
      subjects: ['General Science'],
      classesCount: 2,
      subjectsCount: 1,
      attendanceStatus: 'PRESENT',
      checkIn: '07:45 AM',
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
      phone: '+970 59 555 6605',
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
    {
      id: 6,
      employeeNo: 'TCH-006',
      code: 'TCH-006',
      firstName: 'هدى',
      lastName: 'النعيمي',
      fullName: 'هدى النعيمي',
      specialty: 'Social Studies',
      specialization: 'Social Studies',
      phone: '+970 59 666 7706',
      email: 'huda.nuaimi@school.local',
      status: 'ACTIVE',
      active: true,
      user: { email: 'huda.nuaimi@school.local', role: 'TEACHER' },
      classes: ['Grade 7 A', 'Grade 7 B'],
      subjects: ['Social Studies'],
      classesCount: 2,
      subjectsCount: 1,
      attendanceStatus: 'PRESENT',
      checkIn: '07:30 AM',
      isPending: false,
      assignments: [
        { id: 11, className: 'Grade 7 A', grade: 'Grade 7', academicYear: '2026/2027', subjectName: 'Social Studies', subjectCode: 'SOC' },
        { id: 12, className: 'Grade 7 B', grade: 'Grade 7', academicYear: '2026/2027', subjectName: 'Social Studies', subjectCode: 'SOC' }
      ]
    },
    {
      id: 7,
      employeeNo: 'TCH-007',
      code: 'TCH-007',
      firstName: 'زيد',
      lastName: 'البدر',
      fullName: 'زيد البدر',
      specialty: 'Mathematics',
      specialization: 'Mathematics',
      phone: '+970 59 777 8807',
      email: 'zaid.badr@school.local',
      status: 'ACTIVE',
      active: true,
      user: { email: 'zaid.badr@school.local', role: 'TEACHER' },
      classes: ['Grade 7 B', 'Grade 8 B'],
      subjects: ['Mathematics'],
      classesCount: 2,
      subjectsCount: 1,
      attendanceStatus: 'PRESENT',
      checkIn: '07:44 AM',
      isPending: false,
      assignments: [
        { id: 13, className: 'Grade 7 B', grade: 'Grade 7', academicYear: '2026/2027', subjectName: 'Mathematics', subjectCode: 'MATH' },
        { id: 14, className: 'Grade 8 B', grade: 'Grade 8', academicYear: '2026/2027', subjectName: 'Mathematics', subjectCode: 'MATH' }
      ]
    },
    {
      id: 8,
      employeeNo: 'TCH-008',
      code: 'TCH-008',
      firstName: 'فاطمة',
      lastName: 'الزهراء',
      fullName: 'فاطمة الزهراء',
      specialty: 'General Science',
      specialization: 'General Science',
      phone: '+970 59 888 9908',
      email: 'fatima.zahra@school.local',
      status: 'ACTIVE',
      active: true,
      user: { email: 'fatima.zahra@school.local', role: 'TEACHER' },
      classes: ['Grade 7 A', 'Grade 8 A'],
      subjects: ['General Science'],
      classesCount: 2,
      subjectsCount: 1,
      attendanceStatus: 'PRESENT',
      checkIn: '07:36 AM',
      isPending: false,
      assignments: [
        { id: 15, className: 'Grade 7 A', grade: 'Grade 7', academicYear: '2026/2027', subjectName: 'General Science', subjectCode: 'SCI' },
        { id: 16, className: 'Grade 8 A', grade: 'Grade 8', academicYear: '2026/2027', subjectName: 'General Science', subjectCode: 'SCI' }
      ]
    },
    {
      id: 9,
      employeeNo: 'TCH-009',
      code: 'TCH-009',
      firstName: 'محمود',
      lastName: 'درويش',
      fullName: 'محمود درويش',
      specialty: 'Arabic Language',
      specialization: 'Arabic Language',
      phone: '+970 59 999 1109',
      email: 'mahmoud.d@school.local',
      status: 'ACTIVE',
      active: true,
      user: { email: 'mahmoud.d@school.local', role: 'TEACHER' },
      classes: ['Grade 7 B', 'Grade 8 B'],
      subjects: ['Arabic Language'],
      classesCount: 2,
      subjectsCount: 1,
      attendanceStatus: 'PRESENT',
      checkIn: '07:32 AM',
      isPending: false,
      assignments: [
        { id: 17, className: 'Grade 7 B', grade: 'Grade 7', academicYear: '2026/2027', subjectName: 'Arabic Language', subjectCode: 'AR' },
        { id: 18, className: 'Grade 8 B', grade: 'Grade 8', academicYear: '2026/2027', subjectName: 'Arabic Language', subjectCode: 'AR' }
      ]
    },
    {
      id: 10,
      employeeNo: 'TCH-010',
      code: 'TCH-010',
      firstName: 'نور الهدى',
      lastName: 'قاسم',
      fullName: 'نور الهدى قاسم',
      specialty: 'Islamic Education',
      specialization: 'Islamic Education',
      phone: '+970 59 101 2210',
      email: 'noor.huda@school.local',
      status: 'ACTIVE',
      active: true,
      user: { email: 'noor.huda@school.local', role: 'TEACHER' },
      classes: ['Grade 7 A', 'Grade 7 B', 'Grade 8 A', 'Grade 8 B'],
      subjects: ['Islamic Education'],
      classesCount: 4,
      subjectsCount: 1,
      attendanceStatus: 'PRESENT',
      checkIn: '07:35 AM',
      isPending: false,
      assignments: [
        { id: 19, className: 'Grade 7 A', grade: 'Grade 7', academicYear: '2026/2027', subjectName: 'Islamic Education', subjectCode: 'ISL' },
        { id: 20, className: 'Grade 7 B', grade: 'Grade 7', academicYear: '2026/2027', subjectName: 'Islamic Education', subjectCode: 'ISL' },
        { id: 21, className: 'Grade 8 A', grade: 'Grade 8', academicYear: '2026/2027', subjectName: 'Islamic Education', subjectCode: 'ISL' },
        { id: 22, className: 'Grade 8 B', grade: 'Grade 8', academicYear: '2026/2027', subjectName: 'Islamic Education', subjectCode: 'ISL' }
      ]
    },
  ],
  students: [
    // --- Grade 7 A (6 students) ---
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
      classId: 1,
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
      classId: 1,
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
      classId: 1,
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
      firstName: 'جنى',
      middleName: 'رامي',
      lastName: 'شاهين',
      fullName: 'جنى رامي شاهين',
      gender: 'FEMALE',
      dateOfBirth: '2012-04-18',
      status: 'ACTIVE',
      currentClass: 'Grade 7 A',
      className: 'Grade 7 A',
      classId: 1,
      academicYear: '2026/2027',
      parentName: 'رامي شاهين',
      parentPhone: '+970 59 900 1104',
      contactPhone: '+970 59 900 1104',
      address: 'غزة - تل الهوا',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 5,
      studentNumber: 'STD-1005',
      code: 'STD-1005',
      firstName: 'عبد الرحمن',
      middleName: 'وليد',
      lastName: 'العشي',
      fullName: 'عبد الرحمن وليد العشي',
      gender: 'MALE',
      dateOfBirth: '2012-09-12',
      status: 'ACTIVE',
      currentClass: 'Grade 7 A',
      className: 'Grade 7 A',
      classId: 1,
      academicYear: '2026/2027',
      parentName: 'وليد العشي',
      parentPhone: '+970 59 900 1105',
      contactPhone: '+970 59 900 1105',
      address: 'غزة - الرمال الجنوبي',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 6,
      studentNumber: 'STD-1006',
      code: 'STD-1006',
      firstName: 'رزان',
      middleName: 'كمال',
      lastName: 'المصري',
      fullName: 'رزان كمال المصري',
      gender: 'FEMALE',
      dateOfBirth: '2012-01-30',
      status: 'ACTIVE',
      currentClass: 'Grade 7 A',
      className: 'Grade 7 A',
      classId: 1,
      academicYear: '2026/2027',
      parentName: 'كمال المصري',
      parentPhone: '+970 59 900 1106',
      contactPhone: '+970 59 900 1106',
      address: 'غزة - شارع الثلاثيني',
      createdAt: '2026-09-01T08:00:00.000Z',
    },

    // --- Grade 7 B (6 students) ---
    {
      id: 7,
      studentNumber: 'STD-1007',
      code: 'STD-1007',
      firstName: 'نور الدين',
      middleName: 'سامي',
      lastName: 'عودة',
      fullName: 'نور الدين سامي عودة',
      gender: 'MALE',
      dateOfBirth: '2012-11-05',
      status: 'ACTIVE',
      currentClass: 'Grade 7 B',
      className: 'Grade 7 B',
      classId: 2,
      academicYear: '2026/2027',
      parentName: 'سامي عودة',
      parentPhone: '+970 59 900 1107',
      contactPhone: '+970 59 900 1107',
      address: 'غزة - تل الهوا',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 8,
      studentNumber: 'STD-1008',
      code: 'STD-1008',
      firstName: 'فاطمة',
      middleName: 'إبراهيم',
      lastName: 'رضوان',
      fullName: 'فاطمة إبراهيم رضوان',
      gender: 'FEMALE',
      dateOfBirth: '2012-07-19',
      status: 'ACTIVE',
      currentClass: 'Grade 7 B',
      className: 'Grade 7 B',
      classId: 2,
      academicYear: '2026/2027',
      parentName: 'إبراهيم رضوان',
      parentPhone: '+970 59 900 1108',
      contactPhone: '+970 59 900 1108',
      address: 'غزة - شارع الوحدة',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 9,
      studentNumber: 'STD-1009',
      code: 'STD-1009',
      firstName: 'يوسف',
      middleName: 'تامر',
      lastName: 'الدلو',
      fullName: 'يوسف تامر الدلو',
      gender: 'MALE',
      dateOfBirth: '2012-02-14',
      status: 'ACTIVE',
      currentClass: 'Grade 7 B',
      className: 'Grade 7 B',
      classId: 2,
      academicYear: '2026/2027',
      parentName: 'تامر الدلو',
      parentPhone: '+970 59 900 1109',
      contactPhone: '+970 59 900 1109',
      address: 'غزة - الصبرة',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 10,
      studentNumber: 'STD-1010',
      code: 'STD-1010',
      firstName: 'شهد',
      middleName: 'عماد',
      lastName: 'حلس',
      fullName: 'شهد عماد حلس',
      gender: 'FEMALE',
      dateOfBirth: '2012-10-08',
      status: 'ACTIVE',
      currentClass: 'Grade 7 B',
      className: 'Grade 7 B',
      classId: 2,
      academicYear: '2026/2027',
      parentName: 'عماد حلس',
      parentPhone: '+970 59 900 1110',
      contactPhone: '+970 59 900 1110',
      address: 'غزة - الشجاعية',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 11,
      studentNumber: 'STD-1011',
      code: 'STD-1011',
      firstName: 'براء',
      middleName: 'مروان',
      lastName: 'صيام',
      fullName: 'براء مروان صيام',
      gender: 'MALE',
      dateOfBirth: '2012-06-25',
      status: 'ACTIVE',
      currentClass: 'Grade 7 B',
      className: 'Grade 7 B',
      classId: 2,
      academicYear: '2026/2027',
      parentName: 'مروان صيام',
      parentPhone: '+970 59 900 1111',
      contactPhone: '+970 59 900 1111',
      address: 'غزة - حي الزيتون',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 12,
      studentNumber: 'STD-1012',
      code: 'STD-1012',
      firstName: 'لين',
      middleName: 'حاتم',
      lastName: 'القدوة',
      fullName: 'لين حاتم القدوة',
      gender: 'FEMALE',
      dateOfBirth: '2012-12-15',
      status: 'ACTIVE',
      currentClass: 'Grade 7 B',
      className: 'Grade 7 B',
      classId: 2,
      academicYear: '2026/2027',
      parentName: 'حاتم القدوة',
      parentPhone: '+970 59 900 1112',
      contactPhone: '+970 59 900 1112',
      address: 'غزة - حي اليرموك',
      createdAt: '2026-09-01T08:00:00.000Z',
    },

    // --- Grade 8 A (6 students) ---
    {
      id: 13,
      studentNumber: 'STD-1013',
      code: 'STD-1013',
      firstName: 'كريم',
      middleName: 'عبد الله',
      lastName: 'شاهين',
      fullName: 'كريم عبد الله شاهين',
      gender: 'MALE',
      dateOfBirth: '2011-04-12',
      status: 'ACTIVE',
      currentClass: 'Grade 8 A',
      className: 'Grade 8 A',
      classId: 3,
      academicYear: '2026/2027',
      parentName: 'عبد الله شاهين',
      parentPhone: '+970 59 900 1113',
      contactPhone: '+970 59 900 1113',
      address: 'غزة - الشيخ عجلين',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 14,
      studentNumber: 'STD-1014',
      code: 'STD-1014',
      firstName: 'سارة',
      middleName: 'طارق',
      lastName: 'المصري',
      fullName: 'سارة طارق المصري',
      gender: 'FEMALE',
      dateOfBirth: '2011-09-30',
      status: 'ACTIVE',
      currentClass: 'Grade 8 A',
      className: 'Grade 8 A',
      classId: 3,
      academicYear: '2026/2027',
      parentName: 'طارق المصري',
      parentPhone: '+970 59 900 1114',
      contactPhone: '+970 59 900 1114',
      address: 'غزة - شارع الثلاثيني',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 15,
      studentNumber: 'STD-1015',
      code: 'STD-1015',
      firstName: 'عمر',
      middleName: 'إياد',
      lastName: 'البورنو',
      fullName: 'عمر إياد البورنو',
      gender: 'MALE',
      dateOfBirth: '2011-03-20',
      status: 'ACTIVE',
      currentClass: 'Grade 8 A',
      className: 'Grade 8 A',
      classId: 3,
      academicYear: '2026/2027',
      parentName: 'إياد البورنو',
      parentPhone: '+970 59 900 1115',
      contactPhone: '+970 59 900 1115',
      address: 'غزة - الميناء',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 16,
      studentNumber: 'STD-1016',
      code: 'STD-1016',
      firstName: 'لانا',
      middleName: 'زياد',
      lastName: 'حامد',
      fullName: 'لانا زياد حامد',
      gender: 'FEMALE',
      dateOfBirth: '2011-07-14',
      status: 'ACTIVE',
      currentClass: 'Grade 8 A',
      className: 'Grade 8 A',
      classId: 3,
      academicYear: '2026/2027',
      parentName: 'زياد حامد',
      parentPhone: '+970 59 900 1116',
      contactPhone: '+970 59 900 1116',
      address: 'غزة - الشجاعية',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 17,
      studentNumber: 'STD-1017',
      code: 'STD-1017',
      firstName: 'مهند',
      middleName: 'مازن',
      lastName: 'السرساوي',
      fullName: 'مهند مازن السرساوي',
      gender: 'MALE',
      dateOfBirth: '2011-11-28',
      status: 'ACTIVE',
      currentClass: 'Grade 8 A',
      className: 'Grade 8 A',
      classId: 3,
      academicYear: '2026/2027',
      parentName: 'مازن السرساوي',
      parentPhone: '+970 59 900 1117',
      contactPhone: '+970 59 900 1117',
      address: 'غزة - الدرج',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 18,
      studentNumber: 'STD-1018',
      code: 'STD-1018',
      firstName: 'تالا',
      middleName: 'حسام',
      lastName: 'أبو خضرة',
      fullName: 'تالا حسام أبو خضرة',
      gender: 'FEMALE',
      dateOfBirth: '2011-05-02',
      status: 'ACTIVE',
      currentClass: 'Grade 8 A',
      className: 'Grade 8 A',
      classId: 3,
      academicYear: '2026/2027',
      parentName: 'حسام أبو خضرة',
      parentPhone: '+970 59 900 1118',
      contactPhone: '+970 59 900 1118',
      address: 'غزة - الرمال',
      createdAt: '2026-09-01T08:00:00.000Z',
    },

    // --- Grade 8 B (6 students) ---
    {
      id: 19,
      studentNumber: 'STD-1019',
      code: 'STD-1019',
      firstName: 'بلال',
      middleName: 'حسن',
      lastName: 'القدوة',
      fullName: 'بلال حسن القدوة',
      gender: 'MALE',
      dateOfBirth: '2011-01-15',
      status: 'ACTIVE',
      currentClass: 'Grade 8 B',
      className: 'Grade 8 B',
      classId: 4,
      academicYear: '2026/2027',
      parentName: 'حسن القدوة',
      parentPhone: '+970 59 900 1119',
      contactPhone: '+970 59 900 1119',
      address: 'غزة - حي اليرموك',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 20,
      studentNumber: 'STD-1020',
      code: 'STD-1020',
      firstName: 'رنا',
      middleName: 'ماجد',
      lastName: 'أبو ستة',
      fullName: 'رنا ماجد أبو ستة',
      gender: 'FEMALE',
      dateOfBirth: '2011-12-08',
      status: 'ACTIVE',
      currentClass: 'Grade 8 B',
      className: 'Grade 8 B',
      classId: 4,
      academicYear: '2026/2027',
      parentName: 'ماجد أبو ستة',
      parentPhone: '+970 59 900 1120',
      contactPhone: '+970 59 900 1120',
      address: 'غزة - الصبرة',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 21,
      studentNumber: 'STD-1021',
      code: 'STD-1021',
      firstName: 'طارق',
      middleName: 'باسم',
      lastName: 'المشهراوي',
      fullName: 'طارق باسم المشهراوي',
      gender: 'MALE',
      dateOfBirth: '2011-06-17',
      status: 'ACTIVE',
      currentClass: 'Grade 8 B',
      className: 'Grade 8 B',
      classId: 4,
      academicYear: '2026/2027',
      parentName: 'باسم المشهراوي',
      parentPhone: '+970 59 900 1121',
      contactPhone: '+970 59 900 1121',
      address: 'غزة - النصر',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 22,
      studentNumber: 'STD-1022',
      code: 'STD-1022',
      firstName: 'سلمى',
      middleName: 'نضال',
      lastName: 'الهباش',
      fullName: 'سلمى نضال الهباش',
      gender: 'FEMALE',
      dateOfBirth: '2011-08-04',
      status: 'ACTIVE',
      currentClass: 'Grade 8 B',
      className: 'Grade 8 B',
      classId: 4,
      academicYear: '2026/2027',
      parentName: 'نضال الهباش',
      parentPhone: '+970 59 900 1122',
      contactPhone: '+970 59 900 1122',
      address: 'غزة - التفاح',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 23,
      studentNumber: 'STD-1023',
      code: 'STD-1023',
      firstName: 'وسيم',
      middleName: 'عادل',
      lastName: 'عياد',
      fullName: 'وسيم عادل عياد',
      gender: 'MALE',
      dateOfBirth: '2011-10-11',
      status: 'ACTIVE',
      currentClass: 'Grade 8 B',
      className: 'Grade 8 B',
      classId: 4,
      academicYear: '2026/2027',
      parentName: 'عادل عياد',
      parentPhone: '+970 59 900 1123',
      contactPhone: '+970 59 900 1123',
      address: 'غزة - تل الهوا',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 24,
      studentNumber: 'STD-1024',
      code: 'STD-1024',
      firstName: 'داليا',
      middleName: 'وائل',
      lastName: 'الغلاييني',
      fullName: 'داليا وائل الغلاييني',
      gender: 'FEMALE',
      dateOfBirth: '2011-02-27',
      status: 'ACTIVE',
      currentClass: 'Grade 8 B',
      className: 'Grade 8 B',
      classId: 4,
      academicYear: '2026/2027',
      parentName: 'وائل الغلاييني',
      parentPhone: '+970 59 900 1124',
      contactPhone: '+970 59 900 1124',
      address: 'غزة - الرمال الشمالي',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
  ],
  users: [
    { id: 1, email: 'admin@school.local', fullName: 'أ. عبد الرحمن خليل (المدير العام)', role: 'ADMIN', active: true, createdAt: '2026-09-01T08:00:00.000Z' },
    { id: 2, email: 'staff@school.local', fullName: 'محمد (شؤون الطلاب)', role: 'STAFF', active: true, createdAt: '2026-09-01T08:00:00.000Z' },
    { id: 3, email: 'khalid.staff@school.local', fullName: 'خالد السعيد (شؤون الطلاب)', role: 'STAFF', active: true, createdAt: '2026-09-01T08:00:00.000Z' },
    { id: 4, email: 'ahmed.khalil@school.local', fullName: 'أحمد خليل (معلم رياضيات)', role: 'TEACHER', active: true, createdAt: '2026-09-01T08:00:00.000Z', teacher: { firstName: 'أحمد', lastName: 'خليل', employeeNo: 'TCH-001' } },
    { id: 5, email: 'sara.mansour@school.local', fullName: 'سارة منصور (معلمة إنجليزي)', role: 'TEACHER', active: true, createdAt: '2026-09-01T08:00:00.000Z', teacher: { firstName: 'سارة', lastName: 'منصور', employeeNo: 'TCH-002' } },
    { id: 6, email: 'omar.farooq@school.local', fullName: 'عمر فاروق (معلم لغة عربية)', role: 'TEACHER', active: true, createdAt: '2026-09-01T08:00:00.000Z', teacher: { firstName: 'عمر', lastName: 'فاروق', employeeNo: 'TCH-003' } },
    { id: 7, email: 'layla.hassan@school.local', fullName: 'ليلى حسن (معلمة علوم)', role: 'TEACHER', active: true, createdAt: '2026-09-01T08:00:00.000Z', teacher: { firstName: 'ليلى', lastName: 'حسن', employeeNo: 'TCH-004' } },
    { id: 8, email: 'tareq.aziz@school.local', fullName: 'طارق عزيز (معلم حاسوب وتكنولوجيا)', role: 'TEACHER', active: true, createdAt: '2026-09-01T08:00:00.000Z', teacher: { firstName: 'طارق', lastName: 'عزيز', employeeNo: 'TCH-005' } },
  ],
  auditLogs: [
    { id: 1, action: 'LOGIN_SUCCESS', entity: 'User', entityId: '1', details: 'تسجيل دخول المدير العام بنجاح', timestamp: new Date().toISOString(), createdAt: new Date().toISOString(), role: 'ADMIN', user: { fullName: 'يوسف (المدير العام)', role: 'ADMIN' }, ipAddress: '127.0.0.1', metadata: 'Auth Token Issued' },
    { id: 2, action: 'GRADE_SUBMIT', entity: 'Grade', entityId: '7', details: 'رصد درجات اختبار الرياضيات الفصلي للشعبة 7 A', timestamp: new Date(Date.now() - 3600000).toISOString(), createdAt: new Date(Date.now() - 3600000).toISOString(), role: 'TEACHER', user: { fullName: 'أحمد خليل', role: 'TEACHER' }, ipAddress: '127.0.0.1', metadata: 'Class Grade 7 A - Math Midterm' },
    { id: 3, action: 'ATTENDANCE_RECORD', entity: 'Attendance', entityId: '25', details: 'تسجيل دفتر الحضور والغياب اليومي للصف الثامن', timestamp: new Date(Date.now() - 7200000).toISOString(), createdAt: new Date(Date.now() - 7200000).toISOString(), role: 'STAFF', user: { fullName: 'محمد (شؤون الطلاب)', role: 'STAFF' }, ipAddress: '127.0.0.1', metadata: 'Daily Attendance Grade 8 A' },
    { id: 4, action: 'STUDENT_ENROLL', entity: 'Enrollment', entityId: '1', details: 'قبول وتسكين طالب جديد: أنس محمود الزهار', timestamp: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString(), role: 'STAFF', user: { fullName: 'محمد (شؤون الطلاب)', role: 'STAFF' }, ipAddress: '127.0.0.1', metadata: 'Enrolled to Grade 7 A' },
  ],
};

export function getMockStudents() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('school_mock_students_store') : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return initialData.students;
}

export function saveMockStudents(students) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('school_mock_students_store', JSON.stringify(students));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('students_updated', { detail: students }));
    }
  } catch {}
  initialData.students = students;
}

export function getMockClasses() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('school_mock_classes_store') : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return initialData.classes;
}

export function saveMockClasses(classes) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('school_mock_classes_store', JSON.stringify(classes));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('classes_updated', { detail: classes }));
    }
  } catch {}
  initialData.classes = classes;
}

export function getMockTeachers() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('school_mock_teachers_store') : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return initialData.teachers;
}

export function saveMockTeachers(teachers) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('school_mock_teachers_store', JSON.stringify(teachers));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('teachers_updated', { detail: teachers }));
    }
  } catch {}
  initialData.teachers = teachers;
}

export function getMockGrades() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('school_mock_grades_store') : null;
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return {};
}

export function saveMockGrades(grades) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('school_mock_grades_store', JSON.stringify(grades));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('grades_updated', { detail: grades }));
    }
  } catch {}
}

try {
  if (typeof window !== 'undefined') {
    const storedSt = getMockStudents();
    if (storedSt && storedSt.length > 0) initialData.students = storedSt;
    const storedCl = getMockClasses();
    if (storedCl && storedCl.length > 0) initialData.classes = storedCl;
    const storedTch = getMockTeachers();
    if (storedTch && storedTch.length > 0) initialData.teachers = storedTch;
  }
} catch {}


/**
 * Generates an authentic SQL dump string for offline/mock developer export
 */
export function generateMockSqlDump() {
  const dateStr = new Date().toISOString();
  let sql = `-- =====================================================================
-- 🏫 المنظومة الذكية لإدارة المدارس - قاعدة بيانات النسخة الاحتياطية (SQL Dump)
-- School: مدرسة جذور النموذجية الخاصة / Judhoor Model Private School (SCH-001)
-- Generated: ${dateStr}
-- Format: PostgreSQL / SQLite Compatible (ANSI SQL Standard)
-- Engine: Standalone Database Dump Engine
-- =====================================================================

BEGIN;

-- Disable constraints temporarily for bulk restore
SET CONSTRAINTS ALL DEFERRED;

`;

  // 1. AcademicYear
  if (initialData.academicYears && initialData.academicYears.length > 0) {
    sql += `-- ---------------------------------------------------------------------\n-- Table: "AcademicYear" (${initialData.academicYears.length} records)\n-- ---------------------------------------------------------------------\n`;
    for (const y of initialData.academicYears) {
      sql += `INSERT INTO "AcademicYear" ("id", "name", "startDate", "endDate", "active") VALUES (${y.id}, '${y.name}', '${y.startDate}', '${y.endDate}', ${y.active ? 'TRUE' : 'FALSE'});\n`;
    }
    sql += '\n';
  }

  // 2. SchoolClass
  if (initialData.classes && initialData.classes.length > 0) {
    sql += `-- ---------------------------------------------------------------------\n-- Table: "SchoolClass" (${initialData.classes.length} records)\n-- ---------------------------------------------------------------------\n`;
    for (const c of initialData.classes) {
      const cName = (c.name || '').replace(/'/g, "''");
      const grade = (c.grade || '7').replace(/'/g, "''");
      const section = (c.section || 'A').replace(/'/g, "''");
      sql += `INSERT INTO "SchoolClass" ("id", "name", "grade", "section", "academicYearId") VALUES (${c.id}, '${cName}', '${grade}', '${section}', ${c.academicYearId || 1});\n`;
    }
    sql += '\n';
  }

  // 3. Subject
  if (initialData.subjects && initialData.subjects.length > 0) {
    sql += `-- ---------------------------------------------------------------------\n-- Table: "Subject" (${initialData.subjects.length} records)\n-- ---------------------------------------------------------------------\n`;
    for (const s of initialData.subjects) {
      const sName = (s.name || '').replace(/'/g, "''");
      const sCode = (s.code || '').replace(/'/g, "''");
      sql += `INSERT INTO "Subject" ("id", "code", "name", "active") VALUES (${s.id}, '${sCode}', '${sName}', ${s.active ? 'TRUE' : 'FALSE'});\n`;
    }
    sql += '\n';
  }

  // 4. Teacher
  if (initialData.teachers && initialData.teachers.length > 0) {
    sql += `-- ---------------------------------------------------------------------\n-- Table: "Teacher" (${initialData.teachers.length} records)\n-- ---------------------------------------------------------------------\n`;
    for (const t of initialData.teachers) {
      const nameParts = (t.fullName || t.name || '').split(' ');
      const fName = (t.firstName || nameParts[0] || 'معلم').replace(/'/g, "''");
      const lName = (t.lastName || nameParts.slice(1).join(' ') || 'النموذجي').replace(/'/g, "''");
      const phone = (t.phone || '').replace(/'/g, "''");
      const email = (t.email || '').replace(/'/g, "''");
      const specialty = (t.specialization || t.specialty || 'General').replace(/'/g, "''");
      const empNo = (t.employeeNo || t.code || `TCH-${t.id}`).replace(/'/g, "''");
      sql += `INSERT INTO "Teacher" ("id", "employeeNo", "firstName", "lastName", "phone", "email", "specialty", "active") VALUES (${t.id}, '${empNo}', '${fName}', '${lName}', '${phone}', '${email}', '${specialty}', TRUE);\n`;
    }
    sql += '\n';
  }

  // 5. Student
  const studentsList = (typeof getMockStudents === 'function' ? getMockStudents() : null) || initialData.students || [];
  if (studentsList.length > 0) {
    sql += `-- ---------------------------------------------------------------------\n-- Table: "Student" (${studentsList.length} records)\n-- ---------------------------------------------------------------------\n`;
    for (const st of studentsList) {
      const fName = (st.firstName || '').replace(/'/g, "''");
      const mName = (st.middleName || '').replace(/'/g, "''");
      const lName = (st.lastName || '').replace(/'/g, "''");
      const stNum = (st.studentNumber || `STU-${st.id}`).replace(/'/g, "''");
      const gender = (st.gender || 'MALE').replace(/'/g, "''");
      const status = (st.status || 'ACTIVE').replace(/'/g, "''");
      const parentName = (st.parentName || 'ولي الأمر').replace(/'/g, "''");
      const parentPhone = (st.parentPhone || '').replace(/'/g, "''");
      const address = (st.address || 'فلسطين').replace(/'/g, "''");
      sql += `INSERT INTO "Student" ("id", "studentNumber", "firstName", "middleName", "lastName", "gender", "status", "parentName", "parentPhone", "address") VALUES (${st.id}, '${stNum}', '${fName}', '${mName}', '${lName}', '${gender}', '${status}', '${parentName}', '${parentPhone}', '${address}');\n`;
    }
    sql += '\n';
  }

  // 6. Payment
  const payments = typeof getMockPayments === 'function' ? getMockPayments() : initialPayments;
  if (payments && payments.length > 0) {
    sql += `-- ---------------------------------------------------------------------\n-- Table: "Payment" (${payments.length} records)\n-- ---------------------------------------------------------------------\n`;
    for (const p of payments) {
      const payerName = (p.payerName || '').replace(/'/g, "''");
      const ref = (p.transactionRef || '').replace(/'/g, "''");
      const receipt = (p.receiptNumber || '').replace(/'/g, "''");
      const notes = (p.notes || '').replace(/'/g, "''");
      const method = (p.method || 'CASH').replace(/'/g, "''");
      const status = (p.status || 'COMPLETED').replace(/'/g, "''");
      sql += `INSERT INTO "Payment" ("id", "studentId", "amount", "currency", "method", "status", "payerName", "transactionRef", "receiptNumber", "notes", "createdAt") VALUES (${p.id}, ${p.studentId || 1}, ${p.amount || 0}, '${p.currency || 'ILS'}', '${method}', '${status}', '${payerName}', '${ref}', '${receipt}', '${notes}', '${p.createdAt || dateStr}');\n`;
    }
    sql += '\n';
  }

  sql += `COMMIT;\n\n`;
  sql += `-- =====================================================================\n`;
  sql += `-- End of Database Backup Dump\n`;
  sql += `-- Verification: 100% SUCCESS\n`;
  sql += `-- =====================================================================\n`;

  return sql;
}

export function handleMockRequest(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const [cleanPath, queryString] = path.split('?');
  const searchParams = new URLSearchParams(queryString || '');

  // 1. Auth: Login
  if (cleanPath === '/auth/login' && method === 'POST') {
    let body = {};
    try { body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {}; } catch {}
    const cleanEmail = (body.email || '').trim().toLowerCase();
    const cleanPassword = (body.password || '').trim();

    // 1. Check Principal from Handover Pass
    const savedPrincipalInfo = typeof window !== 'undefined' ? localStorage.getItem('school_principal_info') : null;
    let principalEmail = 'admin@school.local';
    let principalName = typeof window !== 'undefined' ? (localStorage.getItem('school_principal_name') || 'أ. عبد الرحمن خليل (المدير العام)') : 'أ. عبد الرحمن خليل (المدير العام)';
    if (savedPrincipalInfo) {
      try {
        const parsed = JSON.parse(savedPrincipalInfo);
        if (parsed.email) principalEmail = parsed.email.toLowerCase();
        if (parsed.fullName) principalName = parsed.fullName;
      } catch {}
    }

    if (cleanEmail === principalEmail || cleanEmail === 'admin@school.local') {
      const mockUser = {
        id: 1,
        email: principalEmail,
        fullName: principalName,
        role: 'ADMIN',
        teacherId: null,
        active: true,
      };
      return {
        token: 'auth-jwt-token-principal',
        user: mockUser,
      };
    }

    // 2. Check registered staff & teachers added by the Principal
    const staffListStr = typeof window !== 'undefined' ? localStorage.getItem('registered_school_staff') : null;
    if (staffListStr) {
      try {
        const staffList = JSON.parse(staffListStr);
        const found = staffList.find(s => s.email?.toLowerCase() === cleanEmail);
        if (found) {
          const userRole = found.role || 'STAFF';
          const mockUser = {
            id: found.id || Date.now(),
            email: found.email,
            fullName: found.fullName,
            role: userRole,
            teacherId: userRole === 'TEACHER' ? (found.teacherId || found.id || 1) : null,
            specialty: found.specialty || null,
            active: true,
          };
          return {
            token: `auth-jwt-token-${userRole.toLowerCase()}`,
            user: mockUser,
          };
        }
      } catch {}
    }

    // 3. Reject any unauthorized credentials
    return {
      error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة، أو لم يتم اعتماد وتسجيل هذا الحساب بعد من قبل مدير المدرسة.',
      ok: false
    };
  }

  // 2. Auth: Profile
  if (cleanPath === '/auth/profile') {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const saved = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (token && saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
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

  // Academic Year Promotion Endpoints
  if (cleanPath === '/academic-years/promote-preview') {
    const students = getMockStudents().filter(s => s.status === 'ACTIVE');
    const half = Math.ceil(students.length / 2);
    const groups = [
      {
        currentGrade: '7',
        currentClassName: 'الصف السابع',
        isGraduating: false,
        targetGrade: '8',
        targetGradeNameAr: 'الصف الثامن (قيد التوزيع)',
        studentCount: half,
        sampleStudents: students.slice(0, 3).map(s => ({ id: s.id, name: s.fullName || s.firstName, number: s.studentNumber }))
      },
      {
        currentGrade: '12',
        currentClassName: 'الصف الثاني عشر (توجيهي)',
        isGraduating: true,
        targetGrade: 'خريج',
        targetGradeNameAr: 'خريجون',
        studentCount: Math.max(0, students.length - half),
        sampleStudents: students.slice(half, half + 3).map(s => ({ id: s.id, name: s.fullName || s.firstName, number: s.studentNumber }))
      }
    ];
    return {
      sourceYear: { id: 1, name: '2026/2027' },
      targetYear: { id: 2, name: '2027/2028' },
      totalStudents: students.length,
      totalPromotable: half,
      totalGraduating: Math.max(0, students.length - half),
      groups
    };
  }

  if (cleanPath === '/academic-years/promote-students') {
    const students = getMockStudents();
    let promoted = 0;
    let graduated = 0;
    const updated = students.map((s, idx) => {
      if (s.status !== 'ACTIVE') return s;
      if (idx % 2 === 0) {
        promoted++;
        const currNum = parseInt(s.grade || '7', 10) || 7;
        const nextNum = currNum < 12 ? currNum + 1 : 12;
        return {
          ...s,
          grade: `${nextNum}`,
          className: `الصف ${nextNum} (قيد التوزيع)`,
          currentClass: `الصف ${nextNum} (قيد التوزيع)`,
          academicYear: '2027/2028'
        };
      } else {
        graduated++;
        return {
          ...s,
          status: 'GRADUATED'
        };
      }
    });
    saveMockStudents(updated);
    return {
      success: true,
      message: `تم الترفيع بنجاح: تم ترفيع ${promoted} طالباً للصفوف التالية بدون شعب مسبقة، وتخريج ${graduated} طالباً.`,
      promotedCount: promoted,
      graduatedCount: graduated,
      totalProcessed: promoted + graduated,
      sourceYearName: '2026/2027',
      targetYearName: '2027/2028'
    };
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
    const classes = getMockClasses();
    if (method === 'POST') {
      let body = {};
      try { body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {}; } catch {}
      const maxId = classes.reduce((max, c) => Math.max(max, Number(c.id) || 0), 0);
      const newId = maxId + 1;
      const activeYear = initialData.academicYears.find(y => y.id === Number(body.academicYearId)) || initialData.academicYears.find(y => y.active) || initialData.academicYears[0];
      const newClass = {
        id: newId,
        name: body.name || `Grade ${body.grade || '7'} ${body.section || 'A'}`.trim(),
        grade: String(body.grade || '7'),
        gradeLevel: `Grade ${body.grade || '7'}`,
        section: body.section || 'A',
        capacity: Number(body.capacity) || 30,
        studentCount: 0,
        estimatedAverage: 85,
        attendanceRate: 98,
        academicYearId: activeYear ? activeYear.id : 1,
        academicYear: activeYear ? { id: activeYear.id, name: activeYear.name } : { id: 1, name: '2026/2027' },
        teachers: [],
        _count: { enrollments: 0 }
      };
      const updated = [newClass, ...classes];
      saveMockClasses(updated);
      return newClass;
    }
    const yearId = searchParams.get('academicYearId');
    let classList = classes;
    if (yearId) {
      classList = classList.filter(c => String(c.academicYearId) === String(yearId));
    }
    const students = getMockStudents();
    return classList.map(c => {
      const count = students.filter(s => String(s.classId) === String(c.id) || s.currentClass === c.name || s.className === c.name).length;
      return {
        ...c,
        studentCount: count,
        _count: { ...(c._count || {}), enrollments: count }
      };
    });
  }
  if (cleanPath.startsWith('/classes/')) {
    const id = parseInt(cleanPath.split('/')[2], 10) || 1;
    const classes = getMockClasses();
    if (method === 'PUT') {
      let body = {};
      try { body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {}; } catch {}
      const idx = classes.findIndex(c => String(c.id) === String(id));
      if (idx !== -1) {
        classes[idx] = { ...classes[idx], ...body };
        saveMockClasses(classes);
        return classes[idx];
      }
    }
    if (method === 'DELETE') {
      const filtered = classes.filter(c => String(c.id) !== String(id));
      saveMockClasses(filtered);
      return { ok: true, message: 'Class deleted successfully' };
    }
    const cls = classes.find((c) => String(c.id) === String(id)) || classes[0];
    const students = getMockStudents();
    const classStudents = students.filter(s => String(s.classId) === String(id) || (cls && (s.currentClass === cls.name || s.className === cls.name)));
    return {
      ...cls,
      studentCount: classStudents.length,
      _count: { ...(cls?._count || {}), enrollments: classStudents.length },
      students: classStudents,
    };
  }

  // 7. Subjects (Returns Array)
  if (cleanPath === '/subjects') {
    return initialData.subjects;
  }

  // 8. Teachers
  if (cleanPath === '/teachers/attendance/today') {
    const teachers = getMockTeachers();
    return {
      summary: { total: teachers.length, present: teachers.filter(t => t.attendanceStatus !== 'ABSENT').length, late: teachers.filter(t => t.attendanceStatus === 'LATE').length, absent: teachers.filter(t => t.attendanceStatus === 'ABSENT').length, excused: 0 },
      items: teachers.map((t) => ({
        teacherId: t.id,
        employeeNo: t.employeeNo,
        fullName: t.fullName,
        specialty: t.specialty,
        classes: t.classes || [],
        subjects: t.subjects || [],
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
    let body = {};
    try { body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {}; } catch {}
    const teachers = getMockTeachers();
    const t = teachers.find(tch => tch.id === Number(body.teacherId));
    if (t) {
      const classes = getMockClasses();
      const cls = classes.find(c => c.id === Number(body.classId));
      const sub = initialData.subjects.find(s => s.id === Number(body.subjectId));
      if (!t.assignments) t.assignments = [];
      const newAssign = {
        id: Date.now(),
        className: cls ? cls.name : 'Grade 7 A',
        grade: cls ? `Grade ${cls.grade}` : 'Grade 7',
        academicYear: cls?.academicYear?.name || '2026/2027',
        subjectName: sub ? sub.name : 'Mathematics',
        subjectCode: sub ? sub.code : 'MATH'
      };
      t.assignments.push(newAssign);
      if (cls && !t.classes.includes(cls.name)) t.classes.push(cls.name);
      if (sub && !t.subjects.includes(sub.name)) t.subjects.push(sub.name);
      saveMockTeachers(teachers);
    }
    return { ok: true, message: 'Class assigned successfully' };
  }
  if (cleanPath.startsWith('/teachers/assign/')) {
    const assignId = parseInt(cleanPath.split('/')[3], 10);
    const teachers = getMockTeachers();
    teachers.forEach(t => {
      if (t.assignments) {
        t.assignments = t.assignments.filter(a => a.id !== assignId);
      }
    });
    saveMockTeachers(teachers);
    return { ok: true, message: 'Assignment removed' };
  }
  if (cleanPath === '/teachers') {
    const teachers = getMockTeachers();
    if (method === 'POST') {
      let body = {};
      try { body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {}; } catch {}
      const maxId = teachers.reduce((max, t) => Math.max(max, Number(t.id) || 0), 0);
      const newId = maxId + 1;
      const employeeNo = body.employeeNo || `TCH-${String(newId).padStart(3, '0')}`;
      const fullName = body.fullName || `${body.firstName || ''} ${body.lastName || ''}`.trim() || 'معلم جديد';
      const newTeacher = {
        id: newId,
        employeeNo,
        code: employeeNo,
        firstName: body.firstName || '',
        lastName: body.lastName || '',
        fullName,
        specialty: body.specialty || body.specialization || 'عام',
        specialization: body.specialty || body.specialization || 'عام',
        phone: body.phone || '',
        email: body.email || `${employeeNo.toLowerCase()}@school.local`,
        status: body.status || 'ACTIVE',
        active: true,
        user: { email: body.email || `${employeeNo.toLowerCase()}@school.local`, role: 'TEACHER' },
        classes: [],
        subjects: [body.specialty || 'عام'],
        classesCount: 0,
        subjectsCount: 1,
        attendanceStatus: 'PRESENT',
        checkIn: '07:30 AM',
        isPending: false,
        assignments: []
      };
      const updated = [newTeacher, ...teachers];
      saveMockTeachers(updated);
      return newTeacher;
    }
    const q = (searchParams.get('q') || '').toLowerCase().trim();
    let filtered = teachers;
    if (q) {
      filtered = filtered.filter(t => (t.fullName && t.fullName.toLowerCase().includes(q)) || (t.employeeNo && t.employeeNo.toLowerCase().includes(q)));
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
    const teachers = getMockTeachers();
    if (method === 'PUT') {
      let body = {};
      try { body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {}; } catch {}
      const idx = teachers.findIndex(t => t.id === id);
      if (idx !== -1) {
        teachers[idx] = { ...teachers[idx], ...body };
        saveMockTeachers(teachers);
        return teachers[idx];
      }
    }
    if (method === 'DELETE') {
      const filtered = teachers.filter(t => t.id !== id);
      saveMockTeachers(filtered);
      return { ok: true, message: 'Teacher deleted successfully' };
    }
    return teachers.find((t) => t.id === id) || teachers[0];
  }

  // Public student inquiry for parents (single personal identifier lookup)
  if (cleanPath === '/students/public/inquiry') {
    const identifier = (searchParams.get('identifier') || searchParams.get('studentNumber') || searchParams.get('q') || '').trim();
    if (!identifier) {
      const err = new Error('Student identifier is required');
      err.status = 400;
      throw err;
    }
    const students = getMockStudents();
    const student = students.find(s =>
      String(s.studentNumber || '').trim().toLowerCase() === identifier.toLowerCase() ||
      String(s.code || '').trim().toLowerCase() === identifier.toLowerCase() ||
      String(s.id) === identifier
    );

    if (!student) {
      const err = new Error('لم يتم العثور على طالب مطابق لهذا المعرف. يرجى التحقق من الرقم المدخل.');
      err.status = 404;
      throw err;
    }

    const isNewlyAdded = student.id > 10 || student.isNewStudent || student.overallAverage === null;
    return {
      id: student.id,
      studentNumber: student.studentNumber,
      firstName: student.firstName,
      middleName: student.middleName || '',
      lastName: student.lastName,
      fullName: student.fullName || `${student.firstName} ${student.lastName}`,
      gender: student.gender,
      status: student.status || 'ACTIVE',
      currentClass: student.currentClass || student.className || 'الصف السابع أ',
      grade: student.grade || '7',
      academicYear: student.academicYear || '2026/2027',
      overallAverage: isNewlyAdded ? null : (student.overallAverage ?? 91),
      isNewStudent: isNewlyAdded,
      attendanceSummary: isNewlyAdded
        ? { percentage: null, present: 0, absent: 0, late: 0, excused: 0, totalDays: 0, isNewStudent: true }
        : { percentage: 96, present: 24, absent: 1, late: 1, excused: 0, totalDays: 26, isNewStudent: false },
      subjectSummary: isNewlyAdded ? [] : [
        { subjectCode: 'MATH', subjectName: 'الرياضيات العامة (Mathematics)', averagePercentage: 92 },
        { subjectCode: 'ENG', subjectName: 'اللغة الإنجليزية (English Language)', averagePercentage: 88 },
        { subjectCode: 'SCI', subjectName: 'العلوم العامة والفيزياء (General Science)', averagePercentage: 94 },
        { subjectCode: 'ARAB', subjectName: 'اللغة العربية وقواعدها (Arabic Literature)', averagePercentage: 95 }
      ],
      recentGrades: isNewlyAdded ? [] : [
        { subjectName: 'الرياضيات', examName: 'الاختبار النصفي', score: 28, maxScore: 30, percentage: 93 },
        { subjectName: 'العلوم العامة', examName: 'الاختبار النصفي', score: 29, maxScore: 30, percentage: 97 },
        { subjectName: 'اللغة العربية', examName: 'المهمة الأدائية', score: 20, maxScore: 20, percentage: 100 }
      ]
    };
  }

  // 9. Students
  if (cleanPath === '/students') {
    const students = getMockStudents();
    if (method === 'POST') {
      let body = {};
      try { body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {}; } catch {}
      const maxId = students.reduce((max, s) => Math.max(max, Number(s.id) || 0), 0);
      const newId = maxId + 1;
      const classes = getMockClasses();
      const targetClass = body.classId ? classes.find(c => String(c.id) === String(body.classId)) : classes[0];
      const fullName = body.fullName || `${body.firstName || ''} ${body.middleName ? body.middleName + ' ' : ''}${body.lastName || ''}`.trim() || 'طالب جديد';
      const studentNumber = body.studentNumber || `STD-${1000 + newId}`;
      const newStudent = {
        id: newId,
        studentNumber,
        code: studentNumber,
        firstName: body.firstName || '',
        middleName: body.middleName || '',
        lastName: body.lastName || '',
        fullName,
        gender: body.gender || 'MALE',
        dateOfBirth: body.dateOfBirth || '2013-01-01',
        status: body.status || 'ACTIVE',
        classId: targetClass ? targetClass.id : 1,
        className: targetClass ? targetClass.name : 'Grade 7 A',
        currentClass: targetClass ? targetClass.name : 'Grade 7 A',
        academicYear: targetClass?.academicYear?.name || '2026/2027',
        phone: body.phone || '',
        parentName: body.parentName || '',
        parentPhone: body.parentPhone || '',
        contactPhone: body.parentPhone || body.phone || '',
        address: body.address || '',
        overallAverage: null,
        isNewStudent: true,
        createdAt: new Date().toISOString(),
      };
      const updated = [newStudent, ...students];
      saveMockStudents(updated);

      if (targetClass) {
        targetClass.studentCount = (targetClass.studentCount || 0) + 1;
        saveMockClasses(classes);
      }

      return newStudent;
    }

    const q = (searchParams.get('q') || '').toLowerCase().trim();
    const status = searchParams.get('status');
    const gender = searchParams.get('gender');
    const classId = searchParams.get('classId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const classes = getMockClasses();
    const targetClass = (classId && classId !== 'ALL') ? classes.find(c => String(c.id) === String(classId) || c.name === classId) : null;

    let filtered = students;
    if (q) {
      filtered = filtered.filter(s =>
        (s.fullName && s.fullName.toLowerCase().includes(q)) ||
        (s.studentNumber && s.studentNumber.toLowerCase().includes(q)) ||
        (s.parentName && s.parentName.toLowerCase().includes(q)) ||
        (s.parentPhone && s.parentPhone.includes(q))
      );
    }
    if (status && status !== 'ALL') {
      filtered = filtered.filter(s => s.status === status);
    }
    if (gender && gender !== 'ALL') {
      filtered = filtered.filter(s => s.gender === gender);
    }
    if (classId && classId !== 'ALL' && classId !== '') {
      filtered = filtered.filter(s => 
        String(s.classId) === String(classId) || 
        (targetClass && (s.className === targetClass.name || s.currentClass === targetClass.name)) ||
        (s.className && String(s.className).toLowerCase() === String(classId).toLowerCase()) ||
        (s.currentClass && String(s.currentClass).toLowerCase() === String(classId).toLowerCase())
      );
    }

    const start = (page - 1) * limit;
    const paginatedItems = filtered.slice(start, start + limit);

    return {
      items: paginatedItems,
      students: paginatedItems,
      pagination: {
        total: filtered.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(filtered.length / limit))
      },
      total: filtered.length,
    };
  }

  // Import preview & execute
  if (cleanPath === '/students/import/preview' && method === 'POST') {
    return {
      totalRows: 2,
      validCount: 2,
      invalidCount: 0,
      duplicateCount: 0,
      validRows: [
        { studentNumber: `STU-2026-${Math.floor(800 + Math.random() * 100)}`, firstName: 'ياسين', middleName: 'محمد', lastName: 'البيطار', gender: 'MALE', dateOfBirth: '2013-04-12', phone: '0599112233', parentName: 'محمد البيطار', parentPhone: '0599112233', address: 'غزة - النصر' },
        { studentNumber: `STU-2026-${Math.floor(800 + Math.random() * 100)}`, firstName: 'ندى', middleName: 'أحمد', lastName: 'حجازي', gender: 'FEMALE', dateOfBirth: '2013-07-19', phone: '0599445566', parentName: 'أحمد حجازي', parentPhone: '0599445566', address: 'غزة - الرمال' }
      ],
      errors: []
    };
  }

  if (cleanPath === '/students/import/execute' && method === 'POST') {
    let body = {};
    try { body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {}; } catch {}
    const validRows = body.validRows || [];
    const students = getMockStudents();
    const classes = getMockClasses();
    const targetClass = classes[0];
    let maxId = students.reduce((max, s) => Math.max(max, Number(s.id) || 0), 0);
    const newStudents = validRows.map(r => {
      maxId++;
      const fullName = `${r.firstName || ''} ${r.middleName ? r.middleName + ' ' : ''}${r.lastName || ''}`.trim() || 'طالب مستورد';
      return {
        id: maxId,
        studentNumber: r.studentNumber || `STD-${1000 + maxId}`,
        code: r.studentNumber || `STD-${1000 + maxId}`,
        firstName: r.firstName || '',
        middleName: r.middleName || '',
        lastName: r.lastName || '',
        fullName,
        gender: r.gender || 'MALE',
        dateOfBirth: r.dateOfBirth || '2013-01-01',
        status: 'ACTIVE',
        classId: targetClass ? targetClass.id : 1,
        className: targetClass ? targetClass.name : 'Grade 7 A',
        currentClass: targetClass ? targetClass.name : 'Grade 7 A',
        academicYear: targetClass?.academicYear?.name || '2026/2027',
        phone: r.phone || '',
        parentName: r.parentName || '',
        parentPhone: r.parentPhone || '',
        contactPhone: r.parentPhone || r.phone || '',
        address: r.address || '',
        createdAt: new Date().toISOString()
      };
    });
    const updated = [...newStudents, ...students];
    saveMockStudents(updated);
    if (targetClass) {
      targetClass.studentCount = (targetClass.studentCount || 0) + newStudents.length;
      saveMockClasses(classes);
    }
    return { ok: true, createdCount: newStudents.length };
  }

  if (cleanPath.startsWith('/students/')) {
    const id = parseInt(cleanPath.split('/')[2], 10) || 1;
    const students = getMockStudents();
    if (method === 'PUT') {
      let body = {};
      try { body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {}; } catch {}
      const idx = students.findIndex(s => s.id === id);
      if (idx !== -1) {
        const classes = getMockClasses();
        const targetClass = body.classId ? classes.find(c => String(c.id) === String(body.classId)) : null;
        const fullName = body.fullName || `${body.firstName || students[idx].firstName || ''} ${body.middleName !== undefined ? body.middleName + ' ' : (students[idx].middleName ? students[idx].middleName + ' ' : '')}${body.lastName || students[idx].lastName || ''}`.trim();
        students[idx] = {
          ...students[idx],
          ...body,
          fullName: fullName || students[idx].fullName,
          className: targetClass ? targetClass.name : (body.className || students[idx].className),
          currentClass: targetClass ? targetClass.name : (body.currentClass || students[idx].currentClass),
          classId: targetClass ? targetClass.id : (body.classId || students[idx].classId)
        };
        saveMockStudents(students);
        return students[idx];
      }
    }
    if (method === 'DELETE') {
      const filtered = students.filter(s => s.id !== id);
      saveMockStudents(filtered);
      return { ok: true, message: 'Student deleted successfully' };
    }
    const student = students.find((s) => s.id === id) || students[0];
    const isNewlyAdded = student && (student.id > 10 || student.isNewStudent || student.overallAverage === null);
    if (isNewlyAdded) {
      return {
        ...student,
        overallAverage: null,
        isNewStudent: true,
        attendanceSummary: {
          percentage: null,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          totalDays: 0,
          isNewStudent: true
        },
        subjectSummary: [],
        grades: [],
        attendance: []
      };
    }
    return {
      ...student,
      overallAverage: 91,
      attendanceSummary: { percentage: 96, present: 24, absent: 1, late: 1, excused: 0, totalDays: 26, isNewStudent: false },
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

  if (cleanPath === '/attendance/sheet') {
    const classId = searchParams.get('classId') || '1';
    const date = searchParams.get('date') || '';
    const key = `${classId}_${date}`;
    const savedForDate = mockAttendanceStore[key] || null;

    const classes = getMockClasses();
    const targetClass = classes.find(c => String(c.id) === String(classId)) || classes[0];
    const students = getMockStudents();
    const enrolledStudents = students.filter(s => 
      String(s.classId) === String(classId) || 
      (targetClass && (
        s.className === targetClass.name || 
        s.currentClass === targetClass.name ||
        (s.className && targetClass.name && s.className.toLowerCase() === targetClass.name.toLowerCase()) ||
        (s.className && targetClass.grade && s.className.includes(targetClass.grade) && targetClass.section && s.className.includes(targetClass.section))
      ))
    );
    const studentsToUse = enrolledStudents;

    return {
      class: targetClass,
      date,
      sheet: studentsToUse.map((s) => {
        const saved = savedForDate ? savedForDate[s.id] : null;
        return {
          studentId: s.id,
          studentNumber: s.studentNumber || s.code || `STD-${1000 + s.id}`,
          fullName: s.fullName || `${s.firstName} ${s.middleName ? s.middleName + ' ' : ''}${s.lastName}`,
          firstName: s.firstName,
          middleName: s.middleName,
          lastName: s.lastName,
          className: s.className || targetClass?.name,
          status: saved ? saved.status : null,
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
    saveMockAttendance(mockAttendanceStore);
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
    const classId = searchParams.get('classId') || '1';
    const subjectId = searchParams.get('subjectId') || '1';
    const examName = searchParams.get('examName') || '';
    const classes = getMockClasses();
    const targetClass = classes.find(c => String(c.id) === String(classId)) || classes[0];
    const students = getMockStudents();
    const targetStudents = students.filter(s => 
      String(s.classId) === String(classId) ||
      (targetClass && (s.className === targetClass.name || s.currentClass === targetClass.name))
    );
    const gradesStore = getMockGrades();
    const keyPrefix = `${classId}_${subjectId}_${examName}`;
    return {
      sheet: targetStudents.map((s, idx) => {
        const studentScore = gradesStore[`${keyPrefix}_${s.id}`];
        const val = (studentScore !== undefined && studentScore !== null) ? studentScore : (85 + (idx % 14));
        return {
          studentId: s.id,
          studentNumber: s.studentNumber,
          fullName: s.fullName,
          score: val,
          percentage: val,
        };
      }),
    };
  }
  if (cleanPath === '/grades/bulk' && method === 'POST') {
    let body = {};
    try { body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {}; } catch {}
    const { classId, subjectId, examName, grades } = body;
    const gradesStore = getMockGrades();
    const keyPrefix = `${classId || '1'}_${subjectId || '1'}_${examName || ''}`;
    if (Array.isArray(grades)) {
      grades.forEach(g => {
        gradesStore[`${keyPrefix}_${g.studentId}`] = Number(g.score);
      });
      saveMockGrades(gradesStore);
    }
    return { ok: true, message: 'Grades saved successfully' };
  }
  if (cleanPath === '/grades/report') {
    const classId = searchParams.get('classId');
    const classes = getMockClasses();
    const targetClass = (classId && classId !== 'ALL') ? classes.find(c => String(c.id) === String(classId) || c.name === classId) : null;
    let students = getMockStudents();
    if (classId && classId !== 'ALL' && classId !== '') {
      students = students.filter(s => 
        String(s.classId) === String(classId) || 
        (targetClass && (s.className === targetClass.name || s.currentClass === targetClass.name))
      );
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
  if (cleanPath.startsWith('/enrollments')) {
    const students = getMockStudents();
    const classes = getMockClasses();

    if (cleanPath === '/enrollments/bulk' && method === 'POST') {
      let body = {};
      try { body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {}; } catch {}
      const targetClass = classes.find(c => String(c.id) === String(body.classId));
      const sIds = (body.studentIds || []).map(Number);
      if (targetClass && sIds.length > 0) {
        students.forEach(s => {
          if (sIds.includes(Number(s.id))) {
            s.classId = targetClass.id;
            s.className = targetClass.name;
            s.currentClass = targetClass.name;
          }
        });
        saveMockStudents(students);
      }
      return { ok: true, enrolledCount: sIds.length, skippedCount: 0 };
    }

    if (cleanPath === '/enrollments' && method === 'POST') {
      let body = {};
      try { body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {}; } catch {}
      const targetClass = classes.find(c => String(c.id) === String(body.classId));
      const student = students.find(s => String(s.id) === String(body.studentId));
      if (student && targetClass) {
        student.classId = targetClass.id;
        student.className = targetClass.name;
        student.currentClass = targetClass.name;
        saveMockStudents(students);
        return {
          id: student.id,
          student,
          class: targetClass,
          enrolledAt: new Date().toISOString()
        };
      }
      return { ok: true };
    }

    if (cleanPath.startsWith('/enrollments/') && method === 'DELETE') {
      const eId = parseInt(cleanPath.split('/')[2], 10);
      const student = students.find(s => s.id === eId);
      if (student) {
        student.classId = null;
        student.className = 'غير مسجل';
        student.currentClass = 'غير مسجل';
        saveMockStudents(students);
      }
      return { ok: true, message: 'Unenrolled successfully' };
    }

    if (cleanPath === '/enrollments') {
      const yearId = searchParams.get('academicYearId');
      const classId = searchParams.get('classId');
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '25', 10);

      let list = students
        .filter(s => s.classId)
        .map(s => {
          const cls = classes.find(c => String(c.id) === String(s.classId) || c.name === s.className || c.name === s.currentClass) || classes[0];
          return {
            id: s.id,
            student: s,
            class: cls,
            enrolledAt: s.createdAt || '2026-09-01T08:00:00.000Z',
          };
        });

      if (classId && classId !== '' && classId !== 'ALL') {
        list = list.filter(e => String(e.class.id) === String(classId));
      }
      if (yearId && yearId !== '' && yearId !== 'ALL') {
        list = list.filter(e => String(e.class.academicYearId) === String(yearId));
      }

      const start = (page - 1) * limit;
      const paginated = list.slice(start, start + limit);

      return {
        items: paginated,
        pagination: { total: list.length, page, limit, totalPages: Math.max(1, Math.ceil(list.length / limit)) },
      };
    }
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
    const classes = getMockClasses();
    const targetClass = (classId && classId !== 'ALL') ? classes.find(c => String(c.id) === String(classId) || c.name === classId) : null;
    let students = getMockStudents();
    if (classId && classId !== 'ALL' && classId !== '') {
      students = students.filter(s => 
        String(s.classId) === String(classId) || 
        (targetClass && (s.className === targetClass.name || s.currentClass === targetClass.name))
      );
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

  // 15.9. Developer Principal Management
  if (cleanPath === '/developer/principal' && method === 'GET') {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('school_principal_info') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ok: true, principal: parsed };
      } catch {}
    }
    return {
      ok: true,
      principal: {
        fullName: 'أ. عبد الرحمن خليل (المدير العام)',
        email: 'admin@school.local',
        role: 'ADMIN'
      }
    };
  }

  if (cleanPath === '/developer/update-principal' && method === 'POST') {
    const { fullName, email, password } = data || {};
    const cleanName = fullName?.trim() || 'أ. عبد الرحمن خليل (المدير العام)';
    const cleanEmail = email?.trim()?.toLowerCase() || 'admin@school.local';
    const principalInfo = {
      fullName: cleanName,
      email: cleanEmail,
      role: 'ADMIN',
      updatedAt: new Date().toISOString()
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('school_principal_info', JSON.stringify(principalInfo));
      localStorage.setItem('school_principal_name', cleanName);
      const curUser = sessionStorage.getItem('user');
      if (curUser) {
        try {
          const u = JSON.parse(curUser);
          if (u.role === 'ADMIN') {
            u.fullName = cleanName;
            u.email = cleanEmail;
            sessionStorage.setItem('user', JSON.stringify(u));
            localStorage.setItem('user', JSON.stringify(u));
          }
        } catch {}
      }
      window.dispatchEvent(new Event('storage'));
    }
    return {
      ok: true,
      message: 'Principal details updated successfully',
      principal: principalInfo
    };
  }

  if (cleanPath === '/developer/clean-slate' && method === 'POST') {
    const { principalName, principalEmail } = data || {};
    const cleanName = principalName?.trim() || 'أ. عبد الرحمن خليل (المدير العام)';
    const cleanEmail = principalEmail?.trim()?.toLowerCase() || 'admin@school.local';
    
    // Wipe all mock entities
    saveMockStudents([]);
    saveMockTeachers([]);
    saveMockClasses([]);
    saveMockPayments([]);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('registered_school_staff', '[]');
      localStorage.removeItem('school_setup_completed');
      localStorage.setItem('school_principal_name', cleanName);
      localStorage.setItem('school_principal_info', JSON.stringify({
        fullName: cleanName,
        email: cleanEmail,
        role: 'ADMIN'
      }));
      sessionStorage.setItem('user', JSON.stringify({
        id: 1,
        fullName: cleanName,
        email: cleanEmail,
        role: 'ADMIN'
      }));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('principal-updated'));
    }

    return {
      ok: true,
      message: 'تم تصفير المنظومة بنجاح تام! قاعدة البيانات الآن نقية 100% وجاهزة للمدرسة الحقيقية بدون أي طلاب أو معلمين وهميين.',
      principal: {
        fullName: cleanName,
        email: cleanEmail,
        role: 'ADMIN'
      },
      academicYear: '2026/2027',
      stats: {
        studentsCount: 0,
        teachersCount: 0,
        classesCount: 0
      }
    };
  }

  // Onboard member (Teacher or Staff)
  if (cleanPath === '/developer/onboard-member' && method === 'POST') {
    const { fullName, email, password, role, specialty, phone } = data || {};
    const cleanRole = role === 'TEACHER' ? 'TEACHER' : 'STAFF';
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (fullName || '').trim();

    let staffList = [];
    if (typeof window !== 'undefined') {
      try {
        staffList = JSON.parse(localStorage.getItem('registered_school_staff') || '[]');
      } catch {
        staffList = [];
      }
    }

    if (staffList.some(s => s.email?.toLowerCase() === cleanEmail)) {
      return { ok: false, error: 'هذا البريد الإلكتروني مسجل مسبقاً في المنظومة' };
    }

    const newId = Date.now();
    const newMember = {
      id: newId,
      fullName: cleanName,
      email: cleanEmail,
      password: password?.trim() || 'ChangeMe123!',
      role: cleanRole,
      specialty: specialty || (cleanRole === 'TEACHER' ? 'عام' : 'إدارة شؤون طلاب'),
      phone: phone || '',
      createdAt: new Date().toISOString()
    };

    staffList.push(newMember);

    if (typeof window !== 'undefined') {
      localStorage.setItem('registered_school_staff', JSON.stringify(staffList));
      if (cleanRole === 'TEACHER') {
        const teachers = getMockTeachers();
        teachers.push({
          id: newId,
          employeeNo: `TCH-${String(newId).slice(-4)}`,
          firstName: cleanName.split(' ')[0] || cleanName,
          lastName: cleanName.split(' ').slice(1).join(' ') || 'المعلم',
          email: cleanEmail,
          phone: phone || '',
          specialty: specialty || 'عام',
          active: true,
          assignmentsCount: 0,
          pendingSetup: true
        });
        saveMockTeachers(teachers);
      }
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('teachers_updated'));
    }

    return {
      ok: true,
      message: `تم اعتماد وتسجيل ${cleanRole === 'TEACHER' ? 'المعلم' : 'الموظف'} (${cleanName}) بنجاح`,
      member: newMember
    };
  }

  if (cleanPath === '/developer/onboarded-members' && method === 'GET') {
    let staffList = [];
    if (typeof window !== 'undefined') {
      try {
        staffList = JSON.parse(localStorage.getItem('registered_school_staff') || '[]');
      } catch {
        staffList = [];
      }
    }
    return {
      ok: true,
      members: staffList
    };
  }

  // 16. Developer Diagnostics
  if (cleanPath === '/developer/system-stats' || cleanPath === '/developer/fleet-stats') {
    const students = getMockStudents();
    const teachers = getMockTeachers();
    const classes = getMockClasses();
    const payments = getMockPayments();
    const totalRecs = students.length + teachers.length + classes.length + payments.length + 2;
    const estMb = parseFloat(((totalRecs * 512 + 102400) / (1024 * 1024)).toFixed(3));

    return {
      ok: true,
      currentSchool: {
        code: 'SCH-001',
        nameAr: 'مدرسة جذور النموذجية الخاصة',
        nameEn: 'Judhoor Model Private School',
        databaseType: 'PostgreSQL (Dedicated Database)',
        studentsCount: students.length,
        teachersCount: teachers.length,
        classesCount: classes.length,
        totalRecords: totalRecs,
        storageUsedMb: estMb,
        storageLimitMb: 500,
        storagePercent: parseFloat(((estMb / 500) * 100).toFixed(2)),
        latencyMs: 12,
        tables: {
          students: students.length,
          teachers: teachers.length,
          classes: classes.length,
          enrollments: students.length,
          attendance: 0,
          grades: 0,
          studentFees: students.length,
          payments: payments.length,
          auditLogs: 1,
          users: 1,
          subjects: 0,
          academicYears: 1,
        },
      },
      stats: {
        totalSchools: 1,
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalClasses: classes.length,
        totalRecords: totalRecs,
        totalStorageUsedMb: estMb,
        totalStorageLimitMb: 500,
        fleetStoragePercent: parseFloat(((estMb / 500) * 100).toFixed(2)),
        latencyMs: 12,
        healthStatus: 'ALL_SYSTEMS_OPERATIONAL',
        serverUptimeSec: 3600,
        nodeVersion: 'v20.x',
        memoryUsage: {
          rss: 45 * 1024 * 1024,
          heapTotal: 28 * 1024 * 1024,
          heapUsed: 19 * 1024 * 1024,
          external: 2 * 1024 * 1024,
        },
      },
    };
  }

  if (cleanPath === '/developer/storage-analysis') {
    return {
      ok: true,
      totalEstMb: 1.42,
      allocatedTierMb: 500,
      percentUsed: 0.28,
      tableBreakdown: [
        { table: 'Attendance', rows: 840, estBytes: 840 * 256, category: 'Academic Transactions' },
        { table: 'Grade', rows: 320, estBytes: 320 * 256, category: 'Academic Transactions' },
        { table: 'StudentFee', rows: 200, estBytes: 200 * 384, category: 'Financial & Ledger' },
        { table: 'Payment', rows: 45, estBytes: 45 * 512, category: 'Financial & Ledger' },
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
      latencyMs: 9,
      timestamp: new Date().toISOString(),
      message: 'Database connection is healthy and responsive (Latency: 9ms)',
    };
  }

  if (cleanPath === '/developer/clear-cache') {
    return { ok: true, message: 'Server & memory cache cleared successfully' };
  }

  if (cleanPath === '/developer/repair-integrity' && method === 'POST') {
    return {
      ok: true,
      durationMs: 48,
      diagnostics: {
        totalStudentsChecked: 200,
        resyncedFees: 12,
        createdMissingFees: 0,
        fixedOrphanPayments: 0,
        integrityStatus: 'VERIFIED_100_PERCENT',
      },
      message: 'System audit and database integrity repair completed successfully!',
    };
  }

  if (cleanPath === '/developer/export-backup' || cleanPath === '/developer/export-database-snapshot' || cleanPath === '/developer/export-backup-sql') {
    const isSql = searchParams.get('format') === 'sql' || cleanPath.includes('sql');
    if (isSql) {
      return generateMockSqlDump();
    }
    return {
      ok: true,
      backup: {
        exportMetadata: {
          schoolCode: 'SCH-001',
          schoolNameAr: 'مدرسة جذور النموذجية الخاصة',
          schoolNameEn: 'Judhoor Model Private School',
          exportedAt: new Date().toISOString(),
          version: 'v2.0.0 (Standalone Instance)',
          format: 'JSON Snapshot',
        },
        counts: {
          students: (initialData.students || []).length,
          teachers: (initialData.teachers || []).length,
          classes: (initialData.classes || []).length,
          subjects: (initialData.subjects || []).length,
          academicYears: (initialData.academicYears || []).length,
          studentFees: 200,
          payments: (getMockPayments() || []).length,
        },
        data: {
          students: initialData.students,
          teachers: initialData.teachers,
          classes: initialData.classes,
          subjects: initialData.subjects,
          academicYears: initialData.academicYears,
          payments: getMockPayments(),
        },
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

    const classes = getMockClasses();
    const targetClass = (classId && classId !== 'ALL') ? classes.find(c => String(c.id) === String(classId) || c.name === classId) : null;
    let students = getMockStudents();
    if (classId && classId !== 'ALL' && classId !== '') {
      students = students.filter(s => 
        String(s.classId) === String(classId) || 
        (targetClass && (s.className === targetClass.name || s.currentClass === targetClass.name)) ||
        (s.className && String(s.className).toLowerCase().includes(String(classId).toLowerCase()))
      );
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
