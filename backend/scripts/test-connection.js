require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function run() {
  try {
    const users = await prisma.user.count();
    const students = await prisma.student.count();
    const teachers = await prisma.teacher.count();
    const classes = await prisma.schoolClass.count();
    const subjects = await prisma.subject.count();
    const grades = await prisma.grade.count();
    const attendance = await prisma.attendance.count();

    console.log('--- Supabase PostgreSQL Live Database Summary ---');
    console.log(`👤 Users (Admin/Staff/Teachers): ${users}`);
    console.log(`👨‍🏫 Teachers: ${teachers}`);
    console.log(`👨‍🎓 Students: ${students}`);
    console.log(`🏫 Classes: ${classes}`);
    console.log(`📚 Subjects: ${subjects}`);
    console.log(`📊 Grades: ${grades}`);
    console.log(`📅 Attendance: ${attendance}`);
  } catch (err) {
    console.error('Count check failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
