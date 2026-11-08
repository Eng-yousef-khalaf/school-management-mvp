const prisma = require('../utils/prisma');
const { logAudit } = require('../utils/auditLogger');

async function getStudents({
  page = 1,
  limit = 20,
  q = '',
  status,
  gender,
  classId,
  academicYearId,
  sortBy = 'lastName',
  sortOrder = 'asc'
}, user) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * take;

  const where = {};

  // If user is a Teacher, restrict exclusively to students in their assigned classes
  if (user?.role === 'TEACHER' && user?.teacherId) {
    const teacherLinks = await prisma.teacherClassSubject.findMany({
      where: { teacherId: user.teacherId },
      select: { classId: true }
    });
    const teacherClassIds = [...new Set(teacherLinks.map(l => l.classId))];

    if (teacherClassIds.length === 0) {
      return {
        items: [],
        pagination: { total: 0, page: 1, limit: take, totalPages: 1 }
      };
    }

    if (classId) {
      const parsedClassId = parseInt(classId, 10);
      if (!teacherClassIds.includes(parsedClassId)) {
        return {
          items: [],
          pagination: { total: 0, page: 1, limit: take, totalPages: 1 }
        };
      }
      where.enrollments = { some: { classId: parsedClassId } };
    } else {
      where.enrollments = { some: { classId: { in: teacherClassIds } } };
    }
  } else if (classId) {
    where.enrollments = {
      some: {
        classId: parseInt(classId, 10)
      }
    };
  }

  if (q && q.trim()) {
    const searchTerm = q.trim();
    where.OR = [
      { studentNumber: { contains: searchTerm } },
      { firstName: { contains: searchTerm } },
      { middleName: { contains: searchTerm } },
      { lastName: { contains: searchTerm } },
      { parentName: { contains: searchTerm } },
      { parentPhone: { contains: searchTerm } },
      { phone: { contains: searchTerm } }
    ];
  }

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (gender && gender !== 'ALL') {
    where.gender = gender;
  }

  if (academicYearId) {
    where.enrollments = {
      ...(where.enrollments || {}),
      some: {
        ...(where.enrollments?.some || {}),
        class: {
          academicYearId: parseInt(academicYearId, 10)
        }
      }
    };
  }

  const orderBy = [];
  if (sortBy === 'studentNumber') {
    orderBy.push({ studentNumber: sortOrder });
  } else if (sortBy === 'firstName') {
    orderBy.push({ firstName: sortOrder });
    orderBy.push({ lastName: sortOrder });
  } else if (sortBy === 'createdAt') {
    orderBy.push({ createdAt: sortOrder });
  } else {
    orderBy.push({ lastName: sortOrder });
    orderBy.push({ firstName: sortOrder });
  }

  const [total, students] = await Promise.all([
    prisma.student.count({ where }),
    prisma.student.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        enrollments: {
          include: {
            class: {
              include: {
                academicYear: true
              }
            }
          },
          orderBy: { enrolledAt: 'desc' },
          take: 1
        }
      }
    })
  ]);

  const items = students.map(s => {
    const currentEnrollment = s.enrollments[0] || null;
    return {
      ...s,
      currentClass: currentEnrollment?.class?.name || null,
      currentClassId: currentEnrollment?.class?.id || null,
      academicYear: currentEnrollment?.class?.academicYear?.name || null
    };
  });

  return {
    items,
    pagination: {
      total,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take) || 1
    }
  };
}

async function getStudentById(id, user) {
  const studentId = parseInt(id, 10);

  // If user is a Teacher, verify the student is in one of the teacher's classes
  if (user?.role === 'TEACHER' && user?.teacherId) {
    const teacherLinks = await prisma.teacherClassSubject.findMany({
      where: { teacherId: user.teacherId },
      select: { classId: true }
    });
    const teacherClassIds = teacherLinks.map(l => l.classId);

    const isEnrolledInTeacherClass = await prisma.enrollment.findFirst({
      where: {
        studentId,
        classId: { in: teacherClassIds }
      }
    });

    if (!isEnrolledInTeacherClass) {
      return null;
    }
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      enrollments: {
        include: {
          class: {
            include: {
              academicYear: true
            }
          }
        },
        orderBy: { enrolledAt: 'desc' }
      },
      attendance: {
        orderBy: { date: 'desc' },
        take: 30
      },
      grades: {
        include: {
          subject: true,
          class: true
        },
        orderBy: { date: 'desc' }
      }
    }
  });

  if (!student) return null;

  // Calculate Attendance Summary
  const allAttendance = await prisma.attendance.findMany({
    where: { studentId },
    select: { status: true }
  });

  const attendanceSummary = {
    totalDays: allAttendance.length,
    present: allAttendance.filter(a => a.status === 'PRESENT').length,
    absent: allAttendance.filter(a => a.status === 'ABSENT').length,
    late: allAttendance.filter(a => a.status === 'LATE').length,
    excused: allAttendance.filter(a => a.status === 'EXCUSED').length,
    percentage: 0
  };

  if (attendanceSummary.totalDays > 0) {
    attendanceSummary.percentage = Math.round(
      ((attendanceSummary.present + attendanceSummary.late) / attendanceSummary.totalDays) * 100
    );
  }

  // Calculate Grades by Subject & Overall Average
  const subjectGrades = {};
  let totalScore = 0;
  let totalMaxScore = 0;

  student.grades.forEach(g => {
    const subName = g.subject.name;
    if (!subjectGrades[subName]) {
      subjectGrades[subName] = {
        subjectCode: g.subject.code,
        subjectName: subName,
        scores: []
      };
    }
    const percent = Math.round((g.score / g.maxScore) * 100);
    subjectGrades[subName].scores.push({
      examName: g.examName,
      score: g.score,
      maxScore: g.maxScore,
      percentage: percent,
      date: g.date
    });
    totalScore += g.score;
    totalMaxScore += g.maxScore;
  });

  const subjectSummary = Object.values(subjectGrades).map(sub => {
    const subAvg = Math.round(
      sub.scores.reduce((acc, cur) => acc + cur.percentage, 0) / (sub.scores.length || 1)
    );
    return {
      ...sub,
      averagePercentage: subAvg
    };
  });

  const overallAverage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : null;

  const currentEnrollment = student.enrollments[0] || null;

  return {
    ...student,
    currentClass: currentEnrollment?.class?.name || null,
    currentClassId: currentEnrollment?.class?.id || null,
    academicYear: currentEnrollment?.class?.academicYear?.name || null,
    attendanceSummary,
    subjectSummary,
    overallAverage
  };
}

async function createStudent(data, user, req) {
  const formattedData = {
    studentNumber: data.studentNumber.trim(),
    firstName: data.firstName.trim(),
    middleName: data.middleName ? data.middleName.trim() : null,
    lastName: data.lastName.trim(),
    gender: data.gender || null,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
    phone: data.phone ? data.phone.trim() : null,
    parentName: data.parentName ? data.parentName.trim() : null,
    parentPhone: data.parentPhone ? data.parentPhone.trim() : null,
    address: data.address ? data.address.trim() : null,
    status: data.status || 'ACTIVE'
  };

  const student = await prisma.student.create({
    data: formattedData
  });

  if (data.classId) {
    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        classId: parseInt(data.classId, 10),
        academicYearId: data.academicYearId ? parseInt(data.academicYearId, 10) : undefined
      }
    });
  }

  await logAudit({
    userId: user?.id,
    action: 'CREATE_STUDENT',
    entity: 'Student',
    entityId: student.id,
    metadata: { studentNumber: student.studentNumber, fullName: `${student.firstName} ${student.lastName}` },
    req
  });

  return student;
}

async function updateStudent(id, data, user, req) {
  const studentId = parseInt(id, 10);
  const formattedData = {};

  if (data.studentNumber !== undefined) formattedData.studentNumber = data.studentNumber.trim();
  if (data.firstName !== undefined) formattedData.firstName = data.firstName.trim();
  if (data.middleName !== undefined) formattedData.middleName = data.middleName ? data.middleName.trim() : null;
  if (data.lastName !== undefined) formattedData.lastName = data.lastName.trim();
  if (data.gender !== undefined) formattedData.gender = data.gender || null;
  if (data.dateOfBirth !== undefined) formattedData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
  if (data.phone !== undefined) formattedData.phone = data.phone ? data.phone.trim() : null;
  if (data.parentName !== undefined) formattedData.parentName = data.parentName ? data.parentName.trim() : null;
  if (data.parentPhone !== undefined) formattedData.parentPhone = data.parentPhone ? data.parentPhone.trim() : null;
  if (data.address !== undefined) formattedData.address = data.address ? data.address.trim() : null;
  if (data.status !== undefined) formattedData.status = data.status;

  const updated = await prisma.student.update({
    where: { id: studentId },
    data: formattedData
  });

  await logAudit({
    userId: user?.id,
    action: 'UPDATE_STUDENT',
    entity: 'Student',
    entityId: updated.id,
    metadata: { changed: Object.keys(formattedData) },
    req
  });

  return updated;
}

async function deactivateStudent(id, user, req) {
  const studentId = parseInt(id, 10);
  const updated = await prisma.student.update({
    where: { id: studentId },
    data: { status: 'INACTIVE' }
  });

  await logAudit({
    userId: user?.id,
    action: 'DEACTIVATE_STUDENT',
    entity: 'Student',
    entityId: updated.id,
    metadata: { status: 'INACTIVE' },
    req
  });

  return updated;
}

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deactivateStudent
};
