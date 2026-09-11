const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetCleanSlate() {
  console.log('--- Starting 100% Clean Slate Reset ---');

  // 1. Clear all child & transaction tables first
  console.log('Clearing grades...');
  await prisma.grade.deleteMany({});

  console.log('Clearing attendance...');
  await prisma.attendance.deleteMany({});

  console.log('Clearing teacher attendance...');
  await prisma.teacherAttendance.deleteMany({});

  console.log('Clearing enrollments...');
  await prisma.enrollment.deleteMany({});

  console.log('Clearing teacher class/subject links...');
  await prisma.teacherClassSubject.deleteMany({});

  console.log('Clearing classes...');
  await prisma.schoolClass.deleteMany({});

  console.log('Clearing subjects...');
  await prisma.subject.deleteMany({});

  console.log('Clearing students...');
  await prisma.student.deleteMany({});

  console.log('Clearing users...');
  await prisma.user.deleteMany({});

  console.log('Clearing teachers...');
  await prisma.teacher.deleteMany({});

  console.log('Clearing audit logs...');
  await prisma.auditLog.deleteMany({});

  console.log('Clearing academic years...');
  await prisma.academicYear.deleteMany({});

  // 2. Create the Single Admin Account
  const adminPassword = 'Admin123!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@school.local',
      passwordHash,
      fullName: 'مدير المدرسة',
      role: 'ADMIN',
      active: true
    }
  });
  console.log('Created single Admin user:', admin.email, 'Role:', admin.role);

  // 3. Create the starting Academic Year 2026/2027
  const year2026 = await prisma.academicYear.create({
    data: {
      name: '2026/2027',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2027-06-30'),
      active: true
    }
  });
  console.log('Created active Academic Year:', year2026.name, 'Active:', year2026.active);

  console.log('\n--- 100% Clean Slate Reset Completed Successfully! ---');
  console.log('Admin Email: admin@school.local');
  console.log('Admin Password:', adminPassword);
  console.log('Active Academic Year: 2026/2027');
  console.log('Total Classes: 0');
  console.log('Total Students: 0');
  console.log('Total Teachers: 0');
  console.log('Total Staff: 0');
  console.log('Total Subjects: 0');
}

resetCleanSlate()
  .catch((e) => {
    console.error('Reset error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
