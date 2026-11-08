const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding School Management System V2 Database ---');

  const defaultPasswordHash = await bcrypt.hash('ChangeMe123!', 12);

  // 1. Create Default Users (يوسف for Admin, محمد for Staff)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@school.local' },
    update: { passwordHash: defaultPasswordHash, fullName: 'يوسف', role: 'ADMIN', active: true },
    create: {
      email: 'admin@school.local',
      passwordHash: defaultPasswordHash,
      fullName: 'يوسف',
      role: 'ADMIN',
      active: true
    }
  });

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@school.local' },
    update: { passwordHash: defaultPasswordHash, fullName: 'محمد', role: 'STAFF', active: true },
    create: {
      email: 'staff@school.local',
      passwordHash: defaultPasswordHash,
      fullName: 'محمد',
      role: 'STAFF',
      active: true
    }
  });

  const staffUser2 = await prisma.user.upsert({
    where: { email: 'khalid.staff@school.local' },
    update: { passwordHash: defaultPasswordHash, fullName: 'خالد السعيد', role: 'STAFF', active: true },
    create: {
      email: 'khalid.staff@school.local',
      passwordHash: defaultPasswordHash,
      fullName: 'خالد السعيد',
      role: 'STAFF',
      active: true
    }
  });

  // 2. Create Academic Years
  const year2026 = await prisma.academicYear.upsert({
    where: { name: '2026/2027' },
    update: { active: true },
    create: {
      name: '2026/2027',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2027-06-30'),
      active: true
    }
  });

  const year2025 = await prisma.academicYear.upsert({
    where: { name: '2025/2026' },
    update: { active: false },
    create: {
      name: '2025/2026',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-06-30'),
      active: false
    }
  });

  // 3. Create Core Subjects
  const subjectData = [
    { code: 'MATH', name: 'Mathematics' },
    { code: 'ENG', name: 'English' },
    { code: 'AR', name: 'Arabic' },
    { code: 'SCI', name: 'Science' },
    { code: 'ICT', name: 'Computer' }
  ];

  const subjects = [];
  for (const s of subjectData) {
    const sub = await prisma.subject.upsert({
      where: { code: s.code },
      update: { name: s.name, active: true },
      create: { code: s.code, name: s.name, active: true }
    });
    subjects.push(sub);
  }

  // 4. Create Classes for 2026/2027
  const classNames = [
    { name: 'Grade 7 A', grade: '7', section: 'A' },
    { name: 'Grade 7 B', grade: '7', section: 'B' },
    { name: 'Grade 8 A', grade: '8', section: 'A' },
    { name: 'Grade 8 B', grade: '8', section: 'B' }
  ];

  const classes = [];
  for (const c of classNames) {
    const cls = await prisma.schoolClass.upsert({
      where: { name_academicYearId: { name: c.name, academicYearId: year2026.id } },
      update: { grade: c.grade, section: c.section },
      create: {
        name: c.name,
        grade: c.grade,
        section: c.section,
        academicYearId: year2026.id
      }
    });
    classes.push(cls);
  }

  // 5. Create 10 Teachers
  const teacherData = [
    { employeeNo: 'TCH-1001', firstName: 'Ahmed', lastName: 'Khalil', specialty: 'Mathematics', email: 'ahmed.khalil@school.local', phone: '+962 7 9001 1001' },
    { employeeNo: 'TCH-1002', firstName: 'Sara', lastName: 'Mansour', specialty: 'English', email: 'sara.mansour@school.local', phone: '+962 7 9001 1002' },
    { employeeNo: 'TCH-1003', firstName: 'Omar', lastName: 'Farooq', specialty: 'Arabic', email: 'omar.farooq@school.local', phone: '+962 7 9001 1003' },
    { employeeNo: 'TCH-1004', firstName: 'Layla', lastName: 'Hassan', specialty: 'Science', email: 'layla.hassan@school.local', phone: '+962 7 9001 1004' },
    { employeeNo: 'TCH-1005', firstName: 'Tareq', lastName: 'Aziz', specialty: 'Computer', email: 'tareq.aziz@school.local', phone: '+962 7 9001 1005' },
    { employeeNo: 'TCH-1006', firstName: 'Huda', lastName: 'Al-Nuaimi', specialty: 'Social Studies', email: 'huda.nuaimi@school.local', phone: '+962 7 9001 1006' },
    { employeeNo: 'TCH-1007', firstName: 'Zaid', lastName: 'Al-Badr', specialty: 'Mathematics', email: 'zaid.badr@school.local', phone: '+962 7 9001 1007' },
    { employeeNo: 'TCH-1008', firstName: 'Fatima', lastName: 'Al-Zahra', specialty: 'Science', email: 'fatima.zahra@school.local', phone: '+962 7 9001 1008' },
    { employeeNo: 'TCH-1009', firstName: 'Mahmoud', lastName: 'Darwish', specialty: 'Arabic', email: 'mahmoud.d@school.local', phone: '+962 7 9001 1009' },
    { employeeNo: 'TCH-1010', firstName: 'Noor', lastName: 'Al-Huda', specialty: 'English', email: 'noor.huda@school.local', phone: '+962 7 9001 1010' }
  ];

  const teachers = [];
  for (const t of teacherData) {
    const teacher = await prisma.teacher.upsert({
      where: { employeeNo: t.employeeNo },
      update: { firstName: t.firstName, lastName: t.lastName, specialty: t.specialty, email: t.email, phone: t.phone, active: true },
      create: { ...t, active: true }
    });
    teachers.push(teacher);
  }

  // Clean up any old duplicate generic teacher user
  await prisma.user.deleteMany({
    where: { email: 'teacher@school.local' }
  });

  // Create accounts for all individual teachers (Ahmed Khalil, Sara Mansour, Omar Farooq, etc.)
  for (let i = 0; i < teachers.length; i++) {
    const t = teachers[i];
    await prisma.user.upsert({
      where: { email: t.email },
      update: { passwordHash: defaultPasswordHash, fullName: `${t.firstName} ${t.lastName}`, role: 'TEACHER', active: true, teacherId: t.id },
      create: {
        email: t.email,
        passwordHash: defaultPasswordHash,
        fullName: `${t.firstName} ${t.lastName}`,
        role: 'TEACHER',
        active: true,
        teacherId: t.id
      }
    });
  }

  // 6. Assign Teachers to Classes and Subjects
  // Ahmed Khalil (Math) -> Grade 7 A, Grade 8 A
  // Sara Mansour (Eng) -> Grade 7 A, Grade 7 B
  // Omar Farooq (AR) -> Grade 7 A, Grade 8 A
  // Layla Hassan (SCI) -> Grade 7 A, Grade 8 A
  // Tareq Aziz (ICT) -> Grade 7 A, Grade 7 B, Grade 8 A, Grade 8 B
  const assignments = [
    { teacherId: teachers[0].id, classId: classes[0].id, subjectId: subjects[0].id }, // Math 7A
    { teacherId: teachers[0].id, classId: classes[2].id, subjectId: subjects[0].id }, // Math 8A
    { teacherId: teachers[6].id, classId: classes[1].id, subjectId: subjects[0].id }, // Math 7B
    { teacherId: teachers[6].id, classId: classes[3].id, subjectId: subjects[0].id }, // Math 8B

    { teacherId: teachers[1].id, classId: classes[0].id, subjectId: subjects[1].id }, // Eng 7A
    { teacherId: teachers[1].id, classId: classes[1].id, subjectId: subjects[1].id }, // Eng 7B
    { teacherId: teachers[9].id, classId: classes[2].id, subjectId: subjects[1].id }, // Eng 8A
    { teacherId: teachers[9].id, classId: classes[3].id, subjectId: subjects[1].id }, // Eng 8B

    { teacherId: teachers[2].id, classId: classes[0].id, subjectId: subjects[2].id }, // Ar 7A
    { teacherId: teachers[8].id, classId: classes[1].id, subjectId: subjects[2].id }, // Ar 7B

    { teacherId: teachers[3].id, classId: classes[0].id, subjectId: subjects[3].id }, // Sci 7A
    { teacherId: teachers[7].id, classId: classes[1].id, subjectId: subjects[3].id }, // Sci 7B

    { teacherId: teachers[4].id, classId: classes[0].id, subjectId: subjects[4].id }, // ICT 7A
    { teacherId: teachers[4].id, classId: classes[1].id, subjectId: subjects[4].id }, // ICT 7B
    { teacherId: teachers[4].id, classId: classes[2].id, subjectId: subjects[4].id }, // ICT 8A
    { teacherId: teachers[4].id, classId: classes[3].id, subjectId: subjects[4].id }  // ICT 8B
  ];

  for (const a of assignments) {
    await prisma.teacherClassSubject.upsert({
      where: {
        teacherId_classId_subjectId: {
          teacherId: a.teacherId,
          classId: a.classId,
          subjectId: a.subjectId
        }
      },
      update: {},
      create: a
    });
  }

  // 7. Seed 45 Realistic Students
  const firstNamesM = ['Ahmad', 'Mohammad', 'Ali', 'Yousef', 'Hamza', 'Kareem', 'Omar', 'Mustafa', 'Bilal', 'Zaid', 'Ibrahim', 'Tariq', 'Sami', 'Hassan', 'Hussein', 'Rami', 'Nader', 'Amr', 'Fadi', 'Majd', 'Khaled', 'Saad'];
  const firstNamesF = ['Sara', 'Maryam', 'Fatima', 'Noor', 'Layla', 'Salma', 'Jana', 'Zeina', 'Hana', 'Rania', 'Yara', 'Maya', 'Lina', 'Dina', 'Tala', 'Rami', 'Reem', 'Aya', 'Dana', 'Huda', 'Nour', 'Ghalia'];
  const lastNames = ['Ali', 'Khalil', 'Mansour', 'Hassan', 'Othman', 'Qasim', 'Nasser', 'Darwish', 'Najjar', 'Haddad', 'Khoury', 'Zahran', 'Saleh', 'Barakat', 'Shami', 'Masri', 'Jabari', 'Assaf', 'Badawi', 'Ghanem'];

  const studentRecords = [];
  for (let i = 1; i <= 45; i++) {
    const isMale = i % 2 === 1;
    const firstName = isMale
      ? firstNamesM[(i - 1) % firstNamesM.length]
      : firstNamesF[(i - 1) % firstNamesF.length];
    const middleName = firstNamesM[(i * 3) % firstNamesM.length];
    const lastName = lastNames[(i - 1) % lastNames.length];
    const studentNumber = `STU-2026-${String(i).padStart(3, '0')}`;
    const birthYear = i <= 25 ? 2013 : 2012; // 13 or 14 years old for Grade 7 & 8
    const birthMonth = String((i % 12) + 1).padStart(2, '0');
    const birthDay = String((i % 28) + 1).padStart(2, '0');

    studentRecords.push({
      studentNumber,
      firstName,
      middleName,
      lastName,
      gender: isMale ? 'MALE' : 'FEMALE',
      dateOfBirth: new Date(`${birthYear}-${birthMonth}-${birthDay}`),
      phone: `+962 7 9100 ${String(1000 + i)}`,
      parentName: `${middleName} ${lastName}`,
      parentPhone: `+962 7 8800 ${String(2000 + i)}`,
      address: `Amman, Street ${i % 15 + 1}, Building ${i % 30 + 1}`,
      status: i === 44 ? 'INACTIVE' : i === 45 ? 'WITHDRAWN' : 'ACTIVE'
    });
  }

  const createdStudents = [];
  for (const s of studentRecords) {
    const student = await prisma.student.upsert({
      where: { studentNumber: s.studentNumber },
      update: s,
      create: s
    });
    createdStudents.push(student);
  }

  // 8. Enroll Students into Classes
  // 1-12 -> Grade 7 A
  // 13-24 -> Grade 7 B
  // 25-36 -> Grade 8 A
  // 37-45 -> Grade 8 B
  for (let i = 0; i < createdStudents.length; i++) {
    const s = createdStudents[i];
    let classId;
    if (i < 12) classId = classes[0].id;
    else if (i < 24) classId = classes[1].id;
    else if (i < 36) classId = classes[2].id;
    else classId = classes[3].id;

    await prisma.enrollment.upsert({
      where: {
        studentId_classId: {
          studentId: s.id,
          classId: classId
        }
      },
      update: { academicYearId: year2026.id },
      create: {
        studentId: s.id,
        classId: classId,
        academicYearId: year2026.id
      }
    });
  }

  // 9. Seed Sample Attendance Records for recent days
  const sampleDates = [
    new Date('2026-09-02'),
    new Date('2026-09-03'),
    new Date('2026-09-04'),
    new Date('2026-09-07'),
    new Date('2026-09-08')
  ];

  for (const date of sampleDates) {
    date.setUTCHours(0, 0, 0, 0);
    for (let i = 0; i < 24; i++) {
      const student = createdStudents[i];
      let status = 'PRESENT';
      if ((i + date.getDate()) % 11 === 0) status = 'ABSENT';
      else if ((i + date.getDate()) % 7 === 0) status = 'LATE';
      else if ((i + date.getDate()) % 17 === 0) status = 'EXCUSED';

      await prisma.attendance.upsert({
        where: {
          studentId_date: {
            studentId: student.id,
            date
          }
        },
        update: { status },
        create: {
          studentId: student.id,
          date,
          status,
          classId: i < 12 ? classes[0].id : classes[1].id,
          note: status === 'EXCUSED' ? 'Medical leave' : null
        }
      });
    }
  }

  // 10. Seed Sample Grades for Midterm Exam & Quizzes
  const examNames = ['Midterm Exam', 'Quiz 1', 'Quiz 2'];
  for (let i = 0; i < 24; i++) {
    const student = createdStudents[i];
    for (const sub of subjects) {
      for (const examName of examNames) {
        const baseScore = 70 + ((i * 7 + sub.id * 11) % 28);
        const maxScore = examName === 'Midterm Exam' ? 100 : 20;
        const score = examName === 'Midterm Exam' ? baseScore : Math.round((baseScore / 100) * 20);

        const existing = await prisma.grade.findFirst({
          where: {
            studentId: student.id,
            subjectId: sub.id,
            examName
          }
        });

        if (!existing) {
          await prisma.grade.create({
            data: {
              studentId: student.id,
              subjectId: sub.id,
              classId: i < 12 ? classes[0].id : classes[1].id,
              examName,
              score,
              maxScore,
              date: new Date('2026-09-05')
            }
          });
        }
      }
    }
  }

  // 11. Seed Teacher Attendance for Today
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const teacherStatuses = [
    { status: 'PRESENT', checkIn: '07:45 AM', note: 'On time' },
    { status: 'PRESENT', checkIn: '07:50 AM', note: 'On time' },
    { status: 'LATE', checkIn: '08:15 AM', note: 'Traffic delay' },
    { status: 'PRESENT', checkIn: '07:40 AM', note: 'On time' },
    { status: 'PRESENT', checkIn: '07:55 AM', note: 'On time' },
    { status: 'EXCUSED', checkIn: null, note: 'Approved official training' },
    { status: 'PRESENT', checkIn: '07:35 AM', note: 'On time' },
    { status: 'PRESENT', checkIn: '07:50 AM', note: 'On time' },
    { status: 'ABSENT', checkIn: null, note: 'Sick leave notification' },
    { status: 'PRESENT', checkIn: '07:42 AM', note: 'On time' }
  ];

  for (let i = 0; i < teachers.length; i++) {
    const t = teachers[i];
    const item = teacherStatuses[i % teacherStatuses.length];
    await prisma.teacherAttendance.upsert({
      where: {
        teacherId_date: {
          teacherId: t.id,
          date: today
        }
      },
      update: {
        status: item.status,
        checkIn: item.checkIn,
        note: item.note
      },
      create: {
        teacherId: t.id,
        date: today,
        status: item.status,
        checkIn: item.checkIn,
        note: item.note
      }
    });
  }

  // 12. Initial Audit Log
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_SEED',
      entity: 'System',
      metadata: JSON.stringify({
        students: createdStudents.length,
        teachers: teachers.length,
        classes: classes.length,
        subjects: subjects.length
      })
    }
  });

  console.log('--- Seed Finished Successfully! ---');
  console.log('Default Accounts:');
  console.log('ADMIN:   admin@school.local   / ChangeMe123!');
  console.log('STAFF:   staff@school.local   / ChangeMe123!');
  console.log('TEACHER: teacher@school.local / ChangeMe123!');
}

main()
  .catch(e => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
