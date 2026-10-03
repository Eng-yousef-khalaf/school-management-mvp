const { PrismaClient } = require('@prisma/client');
const { saveStatsSnapshot, writeSettings, readSettings } = require('../src/utils/developerSettings');

const prisma = new PrismaClient();

async function completeCleanWipe() {
  console.log('--- [1/3] Archiving Pre-Wipe Historical Statistics ---');
  
  const [
    studentsCount,
    teachersCount,
    classesCount,
    branchesCount,
    usersCount,
    enrollmentsCount,
    attendanceCount,
    gradesCount,
    feesCount,
    paymentsCount,
    auditLogsCount
  ] = await Promise.all([
    prisma.student?.count().catch(() => 0),
    prisma.teacher?.count().catch(() => 0),
    prisma.schoolClass?.count().catch(() => 0),
    prisma.branch?.count().catch(() => 0),
    prisma.user?.count().catch(() => 0),
    prisma.enrollment?.count().catch(() => 0),
    prisma.attendance?.count().catch(() => 0),
    prisma.grade?.count().catch(() => 0),
    prisma.studentFee?.count().catch(() => 0),
    prisma.payment?.count().catch(() => 0),
    prisma.auditLog?.count().catch(() => 0)
  ]);

  saveStatsSnapshot({
    label: 'أرشيف ما قبل التصفير الشامل وحذف الأفرع والحسابات التجريبية',
    note: `تم أرشفة: ${studentsCount} طالب، ${teachersCount} معلم، ${classesCount} صف، ${branchesCount} فرع، ${usersCount} حساب قبل التصفير للبدء بحساب مدير عام جديد.`,
    studentsCount,
    teachersCount,
    classesCount,
    attendanceCount,
    gradesCount,
    feesCount,
    paymentsCount,
    auditLogsCount,
    storageUsedMb: Number(((studentsCount * 1024 + teachersCount * 512 + attendanceCount * 256) / (1024 * 1024)).toFixed(2))
  });

  console.log('--- [2/3] Purging All Dummy Data, Branches, and Accounts ---');

  if (prisma.payment) await prisma.payment.deleteMany({});
  if (prisma.studentFee) await prisma.studentFee.deleteMany({});
  if (prisma.grade) await prisma.grade.deleteMany({});
  if (prisma.attendance) await prisma.attendance.deleteMany({});
  if (prisma.teacherAttendance) await prisma.teacherAttendance.deleteMany({});
  if (prisma.enrollment) await prisma.enrollment.deleteMany({});
  if (prisma.teacherClassSubject) await prisma.teacherClassSubject.deleteMany({});
  if (prisma.schoolClass) await prisma.schoolClass.deleteMany({});
  if (prisma.subject) await prisma.subject.deleteMany({});
  if (prisma.student) await prisma.student.deleteMany({});
  if (prisma.onlineRegistration) await prisma.onlineRegistration.deleteMany({});
  if (prisma.auditLog) await prisma.auditLog.deleteMany({});
  
  // Wipe all users & teachers
  if (prisma.user) await prisma.user.deleteMany({});
  if (prisma.teacher) await prisma.teacher.deleteMany({});

  // Wipe all branches as requested: "وشيل الافرع"
  if (prisma.branch) await prisma.branch.deleteMany({});

  // Reset Academic Years
  if (prisma.academicYear) await prisma.academicYear.deleteMany({});

  console.log('--- [3/3] Setting Up Clean 2026/2027 Academic Year ---');
  await prisma.academicYear.create({
    data: {
      name: '2026/2027',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2027-06-30'),
      active: true
    }
  });

  // Mark handover ready for fresh creation from developer page
  writeSettings({
    handover: {
      isHandedOver: false,
      handoverDate: null,
      principalName: '',
      principalEmail: '',
      principalPhone: ''
    }
  });

  console.log('✅ تم تصفير قاعدة البيانات 100% بنجاح!');
  console.log('الحالة الآن:');
  console.log('- الحسابات: 0');
  console.log('- الفروع: 0');
  console.log('- الطلاب: 0');
  console.log('- المعلمين: 0');
  console.log('- الصفوف: 0');
  console.log('أنت الآن جاهز لفتح صفحة المطور (#developer)، وإنشاء حساب المدير العام وبدء الاختبار الميداني!');

  await prisma.$disconnect();
}

completeCleanWipe().catch(err => {
  console.error('Error during wipe:', err);
  process.exit(1);
});
