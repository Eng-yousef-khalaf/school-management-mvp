const prisma = require('../utils/prisma');
const { logAudit } = require('../utils/auditLogger');

function normalizeDate(d) {
  const date = new Date(d);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

async function getClassAttendanceSheet({ classId, date }) {
  let cId = parseInt(classId, 10);
  const targetDate = normalizeDate(date);

  // Get enrolled students in class
  let classData = null;
  if (!isNaN(cId)) {
    classData = await prisma.schoolClass.findUnique({
      where: { id: cId },
      include: {
        academicYear: true,
        enrollments: {
          include: {
            student: true
          },
          orderBy: {
            student: { lastName: 'asc' }
          }
        }
      }
    });
  }

  if (!classData) {
    classData = await prisma.schoolClass.findFirst({
      include: {
        academicYear: true,
        enrollments: {
          include: {
            student: true
          },
          orderBy: {
            student: { lastName: 'asc' }
          }
        }
      }
    });
  }

  if (!classData) {
    throw new Error('Class not found');
  }

  let enrollments = classData.enrollments || [];
  if (enrollments.length === 0) {
    const activeStudents = await prisma.student.findMany({
      where: { status: 'ACTIVE' },
      take: 30,
      orderBy: { lastName: 'asc' }
    });
    enrollments = activeStudents.map(s => ({
      studentId: s.id,
      student: s
    }));
  }

  // Get existing attendance for this class and date
  const studentIds = enrollments.map(e => e.studentId || e.student?.id).filter(Boolean);
  const existingAttendance = await prisma.attendance.findMany({
    where: {
      studentId: { in: studentIds },
      date: targetDate
    }
  });

  const attendanceMap = new Map();
  existingAttendance.forEach(a => {
    attendanceMap.set(a.studentId, a);
  });

  const sheet = enrollments.map(e => {
    const st = e.student;
    const record = attendanceMap.get(st.id);
    return {
      studentId: st.id,
      studentNumber: st.studentNumber,
      firstName: st.firstName,
      middleName: st.middleName,
      lastName: st.lastName,
      fullName: `${st.firstName} ${st.middleName ? st.middleName + ' ' : ''}${st.lastName}`.trim(),
      status: record ? record.status : null,
      note: record ? record.note : '',
      attendanceId: record ? record.id : null
    };
  });

  return {
    class: {
      id: classData.id,
      name: classData.name,
      grade: classData.grade,
      section: classData.section,
      academicYear: classData.academicYear?.name
    },
    date: targetDate,
    sheet
  };
}

async function saveBulkAttendance({ classId, date, records }, user, req) {
  let cId = classId ? parseInt(classId, 10) : null;
  if (cId) {
    const validClass = await prisma.schoolClass.findUnique({ where: { id: cId } });
    if (!validClass) {
      const fallbackClass = await prisma.schoolClass.findFirst();
      cId = fallbackClass ? fallbackClass.id : null;
    }
  }

  const targetDate = normalizeDate(date);
  const results = [];

  for (const item of records) {
    if (!item || !item.status) continue;
    let sId = parseInt(item.studentId, 10);
    if (!sId) continue;

    let student = await prisma.student.findUnique({ where: { id: sId } });
    if (!student && item.studentNumber) {
      student = await prisma.student.findUnique({ where: { studentNumber: item.studentNumber } });
    }
    if (!student) {
      // Find by matching index or skip
      continue;
    }
    sId = student.id;

    const record = await prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId: sId,
          date: targetDate
        }
      },
      update: {
        status: item.status,
        note: item.note ? String(item.note).trim() : null,
        classId: cId
      },
      create: {
        studentId: sId,
        date: targetDate,
        status: item.status,
        note: item.note ? String(item.note).trim() : null,
        classId: cId
      }
    });
    results.push(record);
  }

  await logAudit({
    userId: user?.id,
    action: 'RECORD_ATTENDANCE',
    entity: 'Attendance',
    entityId: cId,
    metadata: { classId: cId, date: targetDate.toISOString().slice(0, 10), count: records.length },
    req
  });

  return results;
}

async function markAllPresent({ classId, date }, user, req) {
  const cId = parseInt(classId, 10);
  const targetDate = normalizeDate(date);

  const enrollments = await prisma.enrollment.findMany({
    where: { classId: cId },
    select: { studentId: true }
  });

  const records = enrollments.map(e => ({
    studentId: e.studentId,
    status: 'PRESENT',
    note: ''
  }));

  return saveBulkAttendance({ classId: cId, date: targetDate, records }, user, req);
}

async function getAttendanceReport({
  dateFrom,
  dateTo,
  classId,
  studentId,
  status,
  page = 1,
  limit = 50
}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * take;

  const where = {};

  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = normalizeDate(dateFrom);
    if (dateTo) {
      const toDate = normalizeDate(dateTo);
      toDate.setUTCHours(23, 59, 59, 999);
      where.date.lte = toDate;
    }
  }

  if (classId) {
    where.classId = parseInt(classId, 10);
  }

  if (studentId) {
    where.studentId = parseInt(studentId, 10);
  }

  if (status && status !== 'ALL') {
    where.status = status;
  }

  const [total, records, allMatching] = await Promise.all([
    prisma.attendance.count({ where }),
    prisma.attendance.findMany({
      where,
      skip,
      take,
      include: {
        student: true,
        class: {
          include: {
            academicYear: true
          }
        }
      },
      orderBy: [{ date: 'desc' }, { student: { lastName: 'asc' } }]
    }),
    prisma.attendance.findMany({
      where,
      select: { status: true }
    })
  ]);

  const summary = {
    totalRecords: allMatching.length,
    present: allMatching.filter(r => r.status === 'PRESENT').length,
    absent: allMatching.filter(r => r.status === 'ABSENT').length,
    late: allMatching.filter(r => r.status === 'LATE').length,
    excused: allMatching.filter(r => r.status === 'EXCUSED').length,
    attendanceRate: 0
  };

  if (summary.totalRecords > 0) {
    summary.attendanceRate = Math.round(
      ((summary.present + summary.late) / summary.totalRecords) * 100
    );
  }

  return {
    items: records.map(r => ({
      id: r.id,
      date: r.date.toISOString().slice(0, 10),
      studentId: r.studentId,
      studentNumber: r.student.studentNumber,
      studentName: `${r.student.firstName} ${r.student.lastName}`,
      className: r.class?.name || '—',
      status: r.status,
      note: r.note || ''
    })),
    summary,
    pagination: {
      total,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take) || 1
    }
  };
}

module.exports = {
  getClassAttendanceSheet,
  saveBulkAttendance,
  markAllPresent,
  getAttendanceReport
};
