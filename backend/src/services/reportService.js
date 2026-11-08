const prisma = require('../utils/prisma');

async function getStudentListReport({ status, gender, classId, academicYearId } = {}) {
  const where = {};
  if (status && status !== 'ALL') where.status = status;
  if (gender && gender !== 'ALL') where.gender = gender;
  if (classId) where.enrollments = { some: { classId: parseInt(classId, 10) } };
  if (academicYearId) {
    where.enrollments = { some: { class: { academicYearId: parseInt(academicYearId, 10) } } };
  }

  const students = await prisma.student.findMany({
    where,
    include: {
      enrollments: {
        include: {
          class: { include: { academicYear: true } }
        },
        orderBy: { enrolledAt: 'desc' },
        take: 1
      }
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
  });

  return students.map(s => ({
    studentNumber: s.studentNumber,
    firstName: s.firstName,
    middleName: s.middleName || '',
    lastName: s.lastName,
    fullName: `${s.firstName} ${s.middleName ? s.middleName + ' ' : ''}${s.lastName}`,
    gender: s.gender || '—',
    dateOfBirth: s.dateOfBirth ? s.dateOfBirth.toISOString().slice(0, 10) : '—',
    phone: s.phone || '—',
    parentName: s.parentName || '—',
    parentPhone: s.parentPhone || '—',
    address: s.address || '—',
    status: s.status,
    className: s.enrollments[0]?.class?.name || 'Not Enrolled',
    academicYear: s.enrollments[0]?.class?.academicYear?.name || '—'
  }));
}

async function getDemographicsReport() {
  const [byGender, byStatus, byClass] = await Promise.all([
    prisma.student.groupBy({
      by: ['gender'],
      _count: { id: true }
    }),
    prisma.student.groupBy({
      by: ['status'],
      _count: { id: true }
    }),
    prisma.schoolClass.findMany({
      include: {
        academicYear: true,
        _count: { select: { enrollments: true } }
      },
      orderBy: { name: 'asc' }
    })
  ]);

  return {
    byGender: byGender.map(g => ({ label: g.gender || 'UNSPECIFIED', count: g._count.id })),
    byStatus: byStatus.map(s => ({ label: s.status, count: s._count.id })),
    byClass: byClass.map(c => ({
      className: c.name,
      academicYear: c.academicYear?.name,
      studentCount: c._count.enrollments
    }))
  };
}

async function getTeacherWorkloadReport() {
  const teachers = await prisma.teacher.findMany({
    include: {
      teacherLinks: {
        include: {
          class: true,
          subject: true
        }
      }
    },
    orderBy: { lastName: 'asc' }
  });

  return teachers.map(t => ({
    employeeNo: t.employeeNo,
    fullName: `${t.firstName} ${t.lastName}`,
    specialty: t.specialty || '—',
    phone: t.phone || '—',
    email: t.email || '—',
    active: t.active ? 'Active' : 'Inactive',
    totalAssignments: t.teacherLinks.length,
    classes: [...new Set(t.teacherLinks.map(l => l.class.name))].join(', ') || 'None',
    subjects: [...new Set(t.teacherLinks.map(l => l.subject.name))].join(', ') || 'None'
  }));
}

async function getBulkCertificatesReport({ classId, academicYearId } = {}) {
  const where = {};
  if (classId) {
    where.enrollments = { some: { classId: parseInt(classId, 10) } };
  }
  if (academicYearId) {
    where.enrollments = { some: { class: { academicYearId: parseInt(academicYearId, 10) } } };
  }

  const students = await prisma.student.findMany({
    where,
    include: {
      enrollments: {
        include: {
          class: { include: { academicYear: true } }
        },
        orderBy: { enrolledAt: 'desc' },
        take: 1
      },
      attendance: {
        select: { status: true }
      },
      grades: {
        include: { subject: true, class: true },
        orderBy: { date: 'desc' }
      }
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
  });

  return students.map(s => {
    const currentClass = s.enrollments[0]?.class?.name || 'غير مسجل';
    const academicYear = s.enrollments[0]?.class?.academicYear?.name || '2026/2027';

    // Attendance summary
    const totalDays = s.attendance.length;
    const present = s.attendance.filter(a => a.status === 'PRESENT').length;
    const absent = s.attendance.filter(a => a.status === 'ABSENT').length;
    const late = s.attendance.filter(a => a.status === 'LATE').length;
    const excused = s.attendance.filter(a => a.status === 'EXCUSED').length;
    const attendancePercentage = totalDays > 0 ? Math.round(((present + late) / totalDays) * 100) : 100;

    // Subject breakdown
    const subjectMap = {};
    let totalScore = 0;
    let totalMaxScore = 0;

    s.grades.forEach(g => {
      const subName = g.subject.name;
      if (!subjectMap[subName]) {
        subjectMap[subName] = {
          subjectName: subName,
          subjectCode: g.subject.code,
          scores: []
        };
      }
      subjectMap[subName].scores.push({
        examName: g.examName,
        score: g.score,
        maxScore: g.maxScore,
        percentage: Math.round((g.score / g.maxScore) * 100)
      });
      totalScore += g.score;
      totalMaxScore += g.maxScore;
    });

    const subjectSummary = Object.values(subjectMap).map(sub => {
      const subTotalScore = sub.scores.reduce((acc, curr) => acc + curr.score, 0);
      const subTotalMax = sub.scores.reduce((acc, curr) => acc + curr.maxScore, 0);
      const averagePercentage = subTotalMax > 0 ? Math.round((subTotalScore / subTotalMax) * 100) : 0;
      return {
        ...sub,
        totalScore: subTotalScore,
        totalMax: subTotalMax,
        averagePercentage
      };
    });

    const overallAverage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : null;

    return {
      id: s.id,
      studentNumber: s.studentNumber,
      firstName: s.firstName,
      middleName: s.middleName || '',
      lastName: s.lastName,
      fullName: `${s.firstName} ${s.middleName ? s.middleName + ' ' : ''}${s.lastName}`,
      gender: s.gender,
      parentName: s.parentName,
      parentPhone: s.parentPhone,
      address: s.address,
      dateOfBirth: s.dateOfBirth,
      status: s.status,
      className: currentClass,
      academicYear,
      attendanceSummary: {
        totalDays,
        present,
        absent,
        late,
        excused,
        percentage: attendancePercentage
      },
      subjectSummary,
      overallAverage
    };
  });
}

module.exports = {
  getStudentListReport,
  getDemographicsReport,
  getTeacherWorkloadReport,
  getBulkCertificatesReport
};
