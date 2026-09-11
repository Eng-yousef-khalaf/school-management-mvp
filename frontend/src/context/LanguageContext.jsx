import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  ar: {
    // General / Common
    appTitle: 'مدرسة يوسف للتربية والتعليم',
    appSubtitle: 'نظام الإدارة الأكاديمية والتربوية الشامل V2',
    loading: 'جاري التحميل...',
    saving: 'جاري الحفظ...',
    savedSuccessfully: 'تم الحفظ بنجاح',
    deletedSuccessfully: 'تم الحذف بنجاح',
    confirmDelete: 'هل أنت متأكد من الحذف؟',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    delete: 'حذف',
    view: 'عرض',
    actions: 'الإجراءات',
    status: 'الحالة',
    active: 'نشط',
    inactive: 'غير نشط',
    all: 'الكل',
    search: 'بحث...',
    filter: 'تصفية',
    exportExcel: 'تصدير Excel',
    importExcel: 'استيراد من Excel',
    downloadTemplate: 'تحميل القالب النموذجي',
    back: 'رجوع',
    close: 'إغلاق',
    refresh: 'تحديث',
    requiredField: 'حقل إلزامي',
    noDataFound: 'لا توجد بيانات مسجلة حالياً',
    total: 'الإجمالي',
    date: 'التاريخ',
    notes: 'ملاحظات',
    details: 'التفاصيل',
    language: 'اللغة',
    arabic: 'العربية',
    english: 'English',
    switchLanguage: 'تغيير اللغة',
    
    // Roles
    roleAdmin: 'يوسف (المدير العام)',
    roleStaff: 'شؤون المعلمين والطلاب',
    roleTeacher: 'المعلم (Teacher)',
    role: 'الدور',
    
    // Login Screen
    loginTitle: 'مدرسة يوسف للتربية والتعليم',
    loginSubtitle: 'بوابة الإدارة المدرسية والخدمات الأكاديمية الذكية',
    emailLabel: 'البريد الإلكتروني',
    passwordLabel: 'كلمة المرور',
    signInBtn: 'تسجيل الدخول',
    signingIn: 'جاري التحقق والدخول...',
    demoAccountsTitle: 'روابط وحسابات الدخول السريع (Demo Portals)',
    adminPortal: 'بوابة المدير (يوسف)',
    staffPortal: 'شؤون المعلمين والطلاب',
    teacherPortal: 'بوابة المعلم',
    instantAccess: 'دخول فوري بنقرة واحدة',
    loginFailed: 'فشل تسجيل الدخول. يرجى التأكد من صحة البيانات.',
    welcomeBack: 'مرحباً بك مجدداً',

    // Navigation Menu
    navMain: 'القائمة الرئيسية',
    dashboard: 'لوحة التحكم',
    students: 'إدارة الطلاب',
    teachers: 'المعلمون والهيئة التدريسية',
    classes: 'الصفوف والشعب',
    subjects: 'المواد والمناهج',
    academicYears: 'السنوات الدراسية',
    enrollment: 'تسجيل وتوزيع الطلاب',
    attendance: 'دفتر الحضور اليومي',
    attendanceReports: 'تقارير الحضور والغياب',
    grades: 'رصد درجات الامتحانات',
    gradeReports: 'كشوف الدرجات والمعدلات',
    reports: 'مركز التقارير الشاملة',
    users: 'إدارة المستخدمين',
    auditLogs: 'سجل الرقابة والتدقيق',
    settings: 'الإعدادات والأمان',
    logout: 'تسجيل الخروج',

    // Header & Topbar
    activeYear: 'السنة النشطة',
    notifications: 'الإشعارات',
    quickSwitchRole: 'تبديل الدور السريع',

    // Dashboard
    dashboardTitle: 'نظرة عامة على العمليات المدرسية',
    dashboardSubtitle: 'إحصائيات الطلاب، نسب الحضور اليومي، وتوزيع الشعب الأكاديمية',
    totalStudents: 'إجمالي الطلاب',
    activeStudents: 'الطلاب النشطون',
    totalFaculty: 'المعلمون والهيئة التدريسية',
    totalClassesCount: 'الصفوف والشعب',
    totalSubjectsCount: 'المواد الدراسية',
    todayAttendanceRate: 'نسبة حضور اليوم',
    studentsByClassTitle: 'توزيع الطلاب على الصفوف',
    attendanceTodayTitle: 'مؤشر حضور اليوم',
    studentsByGenderTitle: 'توزيع الطلاب حسب الجنس',
    recentActivitiesTitle: 'أحدث حركات ونشاطات النظام',
    studentsCount: 'عدد الطلاب',

    // Students Module
    studentsTitle: 'سجل الطلاب الأكاديمي',
    studentsSubtitle: 'البحث، الفلترة، استيراد وتصدير بيانات الطلاب والتسجيل',
    addStudent: 'إضافة طالب جديد',
    editStudent: 'تعديل بيانات الطالب',
    studentProfile: 'الملف الأكاديمي للطالب',
    studentNumber: 'الرقم الأكاديمي',
    fullName: 'الاسم الكامل',
    firstName: 'الاسم الأول',
    middleName: 'اسم الأب',
    lastName: 'اسم العائلة',
    gender: 'الجنس',
    male: 'ذكر',
    female: 'أنثى',
    other: 'آخر',
    dob: 'تاريخ الميلاد',
    phone: 'رقم الهاتف',
    parentName: 'اسم ولي الأمر',
    parentPhone: 'هاتف ولي الأمر',
    address: 'العنوان',
    studentStatus: 'الحالة الأكاديمية',
    statusActive: 'منتظم (نشط)',
    statusInactive: 'غير نشط',
    statusGraduated: 'متخرج',
    statusWithdrawn: 'منسحب',
    enrollmentHistory: 'السجل الدراسي للشعب',
    attendanceSummary: 'ملخص الحضور',
    gradesSummary: 'كشف الدرجات الأكاديمية',
    noEnrollmentFound: 'الطالب غير مسجل في أي صف حالياً',

    // Teachers Module
    teachersTitle: 'الهيئة التعليمية والمعلمون',
    teachersSubtitle: 'إدارة بيانات المعلمين، التخصصات، وإسناد الصفوف والمواد',
    addTeacher: 'إضافة معلم جديد',
    editTeacher: 'تعديل بيانات المعلم',
    teacherProfile: 'الملف التعريفي للمعلم',
    employeeNo: 'الرقم الوظيفي',
    specialty: 'التخصص الأكاديمي',
    assignedClasses: 'الصفوف والمواد المسندة',
    assignNewSubject: 'إسناد مادة وصف جديد',

    // Classes & Sections
    classesTitle: 'الصفوف والشعب الدراسية',
    classesSubtitle: 'توزيع الفصول الدراسية، السعات الاستيعابية، والسنوات الأكاديمية',
    addClass: 'إضافة صف جديد',
    editClass: 'تعديل بيانات الصف',
    className: 'اسم الصف والشعبة',
    gradeLevel: 'المستوى الدراسي',
    section: 'الشعبة',
    capacity: 'السعة القصوى',
    enrolledCount: 'الطلاب المسجلون',

    // Subjects
    subjectsTitle: 'المواد والمناهج الدراسية',
    subjectsSubtitle: 'الخطة التعليمية والمقررات وأكواد المواد',
    addSubject: 'إضافة مادة جديدة',
    editSubject: 'تعديل مادة',
    subjectCode: 'رمز المادة',
    subjectName: 'اسم المادة',

    // Academic Years
    academicYearsTitle: 'السنوات الأكاديمية',
    academicYearsSubtitle: 'إدارة التقويم الدراسي وتعيين السنة النشطة',
    addAcademicYear: 'إضافة سنة دراسية',
    yearName: 'اسم السنة (مثل 2026/2027)',
    startDate: 'تاريخ البداية',
    endDate: 'تاريخ النهاية',
    setActiveYear: 'تعيين كسنة نشطة',
    activeYearBadge: 'السنة النشطة حالياً',

    // Enrollments
    enrollmentTitle: 'تسجيل وتوزيع الطلاب',
    enrollmentSubtitle: 'تسكين الطلاب في الصفوف والشعب للسنة الدراسية الحالية',
    selectClassToEnroll: 'اختر الصف لتسجيل الطلاب',
    availableStudents: 'الطلاب المتاحون للتسجيل',
    enrolledStudents: 'الطلاب المسجلون في الصف',
    enrollStudentBtn: 'تسجيل في الصف ←',
    unenrollStudentBtn: '← إلغاء التسجيل',

    // Attendance
    attendanceTitle: 'دفتر الحضور والغياب اليومي',
    attendanceSubtitle: 'تسجيل ومتابعة حضور الطلاب في الفصول بالوقت الفعلي',
    selectClass: 'اختر الصف الدراسي',
    selectDate: 'تاريخ اليوم',
    markAllPresent: 'تحديد الكل حاضر',
    present: 'حاضر',
    absent: 'غائب',
    late: 'متأخر',
    excused: 'غياب بعذر',
    attendanceNotePlaceholder: 'ملاحظة (سبب التأخير، عذر طبي...)',
    saveAttendance: 'حفظ دفتر الحضور',

    // Grades
    gradesTitle: 'رصد درجات الامتحانات والتقييمات',
    gradesSubtitle: 'إدخال درجات الطلاب وحساب المعدلات والنسب المئوية آلياً',
    selectSubject: 'اختر المادة',
    examName: 'نوع التقييم / الامتحان',
    midtermExam: 'اختبار نصف الفصل (Midterm)',
    finalExam: 'الاختبار النهائي (Final)',
    quiz: 'اختبار قصير (Quiz)',
    homework: 'الواجبات والمشاركات',
    maxScore: 'الدرجة العظمى',
    score: 'الدرجة المستحقة',
    percentage: 'النسبة المئوية',
    evaluation: 'التقدير',
    saveGrades: 'حفظ الدرجات',

    // Reports Hub
    reportsTitle: 'مركز التقارير المدرسية الشاملة',
    reportsSubtitle: 'استخراج وتصدير كشوف الدرجات، سجلات الحضور، وقوائم الشعب بصيغة Excel',
    gradesMatrixReport: 'كشف درجات المواد والمعدلات',
    attendanceReport: 'تقرير نسب الحضور والغياب',
    classEnrollmentReport: 'قوائم الطلاب والشعب المسجلة',
    generateReport: 'إنشاء التقرير',

    // User Management
    usersTitle: 'إدارة حسابات المستخدمين',
    usersSubtitle: 'إدارة بيانات الدخول، الصلاحيات، وتعيين الأدوار',
    addUser: 'إنشاء حساب جديد',
    editUser: 'تعديل الحساب',
    resetPassword: 'إعادة ضبط كلمة المرور',
    userStatus: 'حالة الحساب',
    userRole: 'الدور والصلاحية',

    // Audit Logs
    auditLogsTitle: 'سجل الرقابة والتدقيق الأمني',
    auditLogsSubtitle: 'توثيق الحركات الإدارية والأمنية وتتبع التغييرات',
    auditAction: 'نوع العملية',
    auditEntity: 'الكيان المتأثر',
    auditUser: 'المستخدم المسؤول',
    auditTime: 'الوقت والتاريخ',
    auditIp: 'عنوان IP',

    // Settings
    settingsTitle: 'إعدادات الحساب والأمان',
    settingsSubtitle: 'تحديث كلمة المرور، مراجعة الصلاحيات، ومعلومات النظام',
    currentPassword: 'كلمة المرور الحالية',
    newPassword: 'كلمة المرور الجديدة',
    confirmPassword: 'تأكيد كلمة المرور الجديدة',
    updatePasswordBtn: 'تحديث كلمة المرور',
    systemInfo: 'معلومات النظام والبيئة'
  },

  en: {
    // General / Common
    appTitle: 'Youssef Educational School',
    appSubtitle: 'Enterprise Academic & Operations Platform V2',
    loading: 'Loading...',
    saving: 'Saving...',
    savedSuccessfully: 'Saved successfully',
    deletedSuccessfully: 'Deleted successfully',
    confirmDelete: 'Are you sure you want to delete?',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    actions: 'Actions',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    all: 'All',
    search: 'Search...',
    filter: 'Filter',
    exportExcel: 'Export Excel',
    importExcel: 'Import from Excel',
    downloadTemplate: 'Download Sample Template',
    back: 'Back',
    close: 'Close',
    refresh: 'Refresh',
    requiredField: 'Required field',
    noDataFound: 'No records found',
    total: 'Total',
    date: 'Date',
    notes: 'Notes',
    details: 'Details',
    language: 'Language',
    arabic: 'العربية',
    english: 'English',
    switchLanguage: 'Switch Language',

    // Roles
    roleAdmin: 'Youssef (General Director)',
    roleStaff: 'Faculty & Student Affairs',
    roleTeacher: 'Faculty Teacher (Teacher)',
    role: 'Role',

    // Login Screen
    loginTitle: 'Youssef Educational School',
    loginSubtitle: 'Sign in to access school management & student services',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    signInBtn: 'Sign In',
    signingIn: 'Authenticating...',
    demoAccountsTitle: 'Quick Role Portals (Demo Access)',
    adminPortal: 'Director Portal (Youssef)',
    staffPortal: 'Faculty & Student Affairs',
    teacherPortal: 'Teacher Portal',
    instantAccess: 'One-Click Instant Access',
    loginFailed: 'Login failed. Please verify your credentials.',
    welcomeBack: 'Welcome back',

    // Navigation Menu
    navMain: 'Main Navigation',
    dashboard: 'Dashboard',
    students: 'Students Management',
    teachers: 'Teachers & Faculty',
    classes: 'Classes & Sections',
    subjects: 'Curriculum Subjects',
    academicYears: 'Academic Years',
    enrollment: 'Student Enrollment',
    attendance: 'Daily Attendance',
    attendanceReports: 'Attendance Reports',
    grades: 'Grades Entry',
    gradeReports: 'Grade Reports',
    reports: 'Reports Hub',
    users: 'User Management',
    auditLogs: 'Audit Logs',
    settings: 'Settings & Security',
    logout: 'Sign Out',

    // Header & Topbar
    activeYear: 'Active Year',
    notifications: 'Notifications',
    quickSwitchRole: 'Switch Role',

    // Dashboard
    dashboardTitle: 'Executive Overview',
    dashboardSubtitle: 'Academic operations, presence analytics, and active directory metrics',
    totalStudents: 'Total Students',
    activeStudents: 'Active Students',
    totalFaculty: 'Faculty & Teachers',
    totalClassesCount: 'Class Sections',
    totalSubjectsCount: 'Curriculum Courses',
    todayAttendanceRate: 'Today Attendance Rate',
    studentsByClassTitle: 'Students by Class Section',
    attendanceTodayTitle: 'Today Presence Metric',
    studentsByGenderTitle: 'Students by Gender',
    recentActivitiesTitle: 'Recent System Activities',
    studentsCount: 'Students Count',

    // Students Module
    studentsTitle: 'Students Directory',
    studentsSubtitle: 'Search, manage, enroll, and import student directory',
    addStudent: 'Add New Student',
    editStudent: 'Edit Student Details',
    studentProfile: 'Student Comprehensive Record',
    studentNumber: 'Student Number',
    fullName: 'Full Name',
    firstName: 'First Name',
    middleName: 'Middle Name',
    lastName: 'Last Name',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    dob: 'Date of Birth',
    phone: 'Phone Number',
    parentName: 'Guardian Name',
    parentPhone: 'Guardian Phone',
    address: 'Address',
    studentStatus: 'Academic Status',
    statusActive: 'Active',
    statusInactive: 'Inactive',
    statusGraduated: 'Graduated',
    statusWithdrawn: 'Withdrawn',
    enrollmentHistory: 'Enrollment Calendar',
    attendanceSummary: 'Attendance Summary',
    gradesSummary: 'Academic Grades Transcript',
    noEnrollmentFound: 'Student is not currently enrolled in any class',

    // Teachers Module
    teachersTitle: 'Faculty & Teachers',
    teachersSubtitle: 'Instructors directory, specialties, and teaching assignments',
    addTeacher: 'Add New Faculty Member',
    editTeacher: 'Edit Teacher Record',
    teacherProfile: 'Faculty Member Profile',
    employeeNo: 'Employee Number',
    specialty: 'Academic Specialty',
    assignedClasses: 'Teaching Assignments',
    assignNewSubject: 'Assign New Subject & Class',

    // Classes & Sections
    classesTitle: 'Class Sections',
    classesSubtitle: 'Academic classes, grade levels, and enrollment rosters',
    addClass: 'Add New Class',
    editClass: 'Edit Class Section',
    className: 'Class & Section Name',
    gradeLevel: 'Grade Level',
    section: 'Section',
    capacity: 'Max Capacity',
    enrolledCount: 'Enrolled Students',

    // Subjects
    subjectsTitle: 'Curriculum Subjects',
    subjectsSubtitle: 'Academic course catalog and subject codes',
    addSubject: 'Add New Subject',
    editSubject: 'Edit Subject',
    subjectCode: 'Course Code',
    subjectName: 'Course Name',

    // Academic Years
    academicYearsTitle: 'Academic Years',
    academicYearsSubtitle: 'Calendar terms, date boundaries, and active school session',
    addAcademicYear: 'Add Academic Year',
    yearName: 'Session Name (e.g. 2026/2027)',
    startDate: 'Start Date',
    endDate: 'End Date',
    setActiveYear: 'Set as Active Year',
    activeYearBadge: 'Current Active Term',

    // Enrollments
    enrollmentTitle: 'Student Enrollment',
    enrollmentSubtitle: 'Class section placement and academic year assignment',
    selectClassToEnroll: 'Select Class for Enrollment',
    availableStudents: 'Available Unassigned Students',
    enrolledStudents: 'Enrolled Students in Section',
    enrollStudentBtn: 'Enroll in Class →',
    unenrollStudentBtn: '← Remove Enrollment',

    // Attendance
    attendanceTitle: 'Daily Attendance Sheet',
    attendanceSubtitle: 'Mark and save student attendance records in real-time',
    selectClass: 'Select Class Section',
    selectDate: 'Attendance Date',
    markAllPresent: 'Mark All Present',
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    excused: 'Excused',
    attendanceNotePlaceholder: 'Note (Reason for absence, medical excuse...)',
    saveAttendance: 'Save Attendance Sheet',

    // Grades
    gradesTitle: 'Curriculum Grades Entry',
    gradesSubtitle: 'Record assessment scores and exam evaluations',
    selectSubject: 'Select Subject',
    examName: 'Assessment Type',
    midtermExam: 'Midterm Examination',
    finalExam: 'Final Examination',
    quiz: 'Quiz Evaluation',
    homework: 'Homework / Assignment',
    maxScore: 'Maximum Score',
    score: 'Obtained Score',
    percentage: 'Percentage',
    evaluation: 'Evaluation',
    saveGrades: 'Save Grades',

    // Reports Hub
    reportsTitle: 'System Reports & Export Hub',
    reportsSubtitle: 'Generate institutional reports, analytics, and Excel sheets',
    gradesMatrixReport: 'Grades Performance Matrix',
    attendanceReport: 'Attendance Rates & Absences',
    classEnrollmentReport: 'Class Section Rosters',
    generateReport: 'Generate Report',

    // User Management
    usersTitle: 'User & Access Management',
    usersSubtitle: 'Configure user accounts, roles (Admin/Staff/Teacher), and permissions',
    addUser: 'Create New User Account',
    editUser: 'Edit User Account',
    resetPassword: 'Reset Password',
    userStatus: 'Account Status',
    userRole: 'Role & Permissions',

    // Audit Logs
    auditLogsTitle: 'Security Audit Log',
    auditLogsSubtitle: 'Chronological tracking of critical administrative activities',
    auditAction: 'Action Type',
    auditEntity: 'Target Entity',
    auditUser: 'Executing User',
    auditTime: 'Timestamp',
    auditIp: 'IP Address',

    // Settings
    settingsTitle: 'Profile & System Settings',
    settingsSubtitle: 'Account security, password changes, and system architecture',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    updatePasswordBtn: 'Update Password',
    systemInfo: 'System Information & Stack'
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('sms_language') || 'ar'; // Default Arabic as requested
  });

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('sms_language', language);
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', direction);
    if (direction === 'rtl') {
      document.body.classList.add('rtl-mode');
    } else {
      document.body.classList.remove('rtl-mode');
    }
  }, [language, direction]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key, fallback = '') => {
    const dict = translations[language] || translations.ar;
    if (dict && dict[key] !== undefined) {
      return dict[key];
    }
    const enDict = translations.en;
    if (enDict && enDict[key] !== undefined) {
      return enDict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        isRtl: direction === 'rtl',
        setLanguage,
        toggleLanguage,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
