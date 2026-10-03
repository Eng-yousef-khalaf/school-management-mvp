const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const { logAudit } = require('../utils/auditLogger');

async function getTeachers({
  page = 1,
  limit = 20,
  q = '',
  active,
  specialty,
  sortBy = 'lastName',
  sortOrder = 'asc',
  academicYearId
} = {}, user = null) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * take;

  const where = {};

  if (q && q.trim()) {
    const searchTerm = q.trim();
    where.OR = [
      { employeeNo: { contains: searchTerm } },
      { firstName: { contains: searchTerm } },
      { lastName: { contains: searchTerm } },
      { email: { contains: searchTerm } },
      { specialty: { contains: searchTerm } }
    ];
  }

  if (active !== undefined && active !== 'ALL' && active !== '') {
    where.active = active === 'true' || active === true;
  }

  if (specialty && specialty !== 'ALL') {
    where.specialty = { contains: specialty, mode: 'insensitive' };
  }

  // Branch isolation
  if (user?.role !== 'SUPER_ADMIN' && user?.branchId) {
    where.branchId = user.branchId;
  }

  const orderBy = [];
  if (sortBy === 'employeeNo') {
    orderBy.push({ employeeNo: sortOrder });
  } else if (sortBy === 'firstName') {
    orderBy.push({ firstName: sortOrder });
  } else {
    orderBy.push({ lastName: sortOrder });
  }

  const activeYear = await prisma.academicYear.findFirst({
    where: { active: true }
  });

  let activeYearFilter = activeYear ? { class: { academicYearId: activeYear.id } } : {};
  if (user?.role === 'ADMIN' && academicYearId && academicYearId !== 'ACTIVE') {
    if (academicYearId !== 'ALL') {
      activeYearFilter = { class: { academicYearId: parseInt(academicYearId, 10) } };
    } else {
      activeYearFilter = {};
    }
  }

  const [total, teachers] = await Promise.all([
    prisma.teacher.count({ where }),
    prisma.teacher.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        user: {
          select: { id: true, email: true, role: true, active: true }
        },
        teacherLinks: {
          where: activeYearFilter,
          include: {
            class: true,
            subject: true
          }
        }
      }
    })
  ]);

  const items = teachers.map(t => ({
    ...t,
    classes: [...new Set(t.teacherLinks.map(l => l.class.name))],
    subjects: [...new Set(t.teacherLinks.map(l => l.subject.name))],
    assignmentsCount: t.teacherLinks.length,
    pendingSetup: t.teacherLinks.length === 0
  }));

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

async function getTeacherById(id) {
  const teacherId = parseInt(id, 10);
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    include: {
      user: {
        select: { id: true, email: true, role: true, active: true }
      },
      teacherLinks: {
        include: {
          class: {
            include: {
              academicYear: true
            }
          },
          subject: true
        }
      }
    }
  });

  if (!teacher) return null;

  // Group classes and subjects
  const assignedClasses = [];
  const assignedSubjects = [];
  const assignments = [];

  teacher.teacherLinks.forEach(link => {
    assignments.push({
      id: link.id,
      classId: link.classId,
      className: link.class.name,
      grade: link.class.grade,
      academicYear: link.class.academicYear?.name,
      subjectId: link.subjectId,
      subjectName: link.subject.name,
      subjectCode: link.subject.code
    });

    if (!assignedClasses.some(c => c.id === link.class.id)) {
      assignedClasses.push(link.class);
    }
    if (!assignedSubjects.some(s => s.id === link.subject.id)) {
      assignedSubjects.push(link.subject);
    }
  });

  return {
    ...teacher,
    assignedClasses,
    assignedSubjects,
    assignments
  };
}

async function createTeacher(data, user, req) {
  let branchId = null;
  if (data.branchId) {
    branchId = parseInt(data.branchId, 10);
  } else if (user?.branchId) {
    branchId = user.branchId;
  } else {
    const firstBranch = await prisma.branch.findFirst({ orderBy: { id: 'asc' } });
    branchId = firstBranch ? firstBranch.id : null;
  }

  const formatted = {
    employeeNo: data.employeeNo.trim(),
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    phone: data.phone ? data.phone.trim() : null,
    email: data.email ? data.email.trim().toLowerCase() : null,
    specialty: data.specialty ? data.specialty.trim() : null,
    photoUrl: data.photoUrl ? data.photoUrl.trim() : (data.avatar || null),
    active: data.active !== undefined ? Boolean(data.active) : true,
    branchId: branchId
  };

  const teacher = await prisma.teacher.create({
    data: formatted
  });

  // Process teaching assignments if provided
  if (data.assignments && Array.isArray(data.assignments) && data.assignments.length > 0) {
    for (const item of data.assignments) {
      if (item.classId && item.subjectId) {
        await prisma.teacherClassSubject.upsert({
          where: {
            teacherId_classId_subjectId: {
              teacherId: teacher.id,
              classId: parseInt(item.classId, 10),
              subjectId: parseInt(item.subjectId, 10)
            }
          },
          update: {},
          create: {
            teacherId: teacher.id,
            classId: parseInt(item.classId, 10),
            subjectId: parseInt(item.subjectId, 10)
          }
        });
      }
    }
  }

  // Create User Account if requested
  if (data.createUserAccount && data.email) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email.trim().toLowerCase() } });
    if (!existingUser) {
      const password = data.userPassword || 'ChangeMe123!';
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      await prisma.user.create({
        data: {
          email: data.email.trim().toLowerCase(),
          passwordHash,
          fullName: `${teacher.firstName} ${teacher.lastName}`,
          role: 'TEACHER',
          photoUrl: teacher.photoUrl,
          active: true,
          teacherId: teacher.id
        }
      });
    }
  }

  await logAudit({
    userId: user?.id,
    action: 'CREATE_TEACHER',
    entity: 'Teacher',
    entityId: teacher.id,
    metadata: { 
      employeeNo: teacher.employeeNo, 
      fullName: `${teacher.firstName} ${teacher.lastName}`,
      assignedCount: data.assignments ? data.assignments.length : 0
    },
    req
  });

  return getTeacherById(teacher.id);
}

async function updateTeacher(id, data, user, req) {
  const teacherId = parseInt(id, 10);
  const formatted = {};

  if (data.employeeNo !== undefined) formatted.employeeNo = data.employeeNo.trim();
  if (data.firstName !== undefined) formatted.firstName = data.firstName.trim();
  if (data.lastName !== undefined) formatted.lastName = data.lastName.trim();
  if (data.phone !== undefined) formatted.phone = data.phone ? data.phone.trim() : null;
  if (data.email !== undefined) formatted.email = data.email ? data.email.trim().toLowerCase() : null;
  if (data.specialty !== undefined) formatted.specialty = data.specialty ? data.specialty.trim() : null;
  if (data.photoUrl !== undefined) {
    formatted.photoUrl = data.photoUrl ? data.photoUrl.trim() : null;
    try {
      await prisma.user.updateMany({
        where: {
          OR: [
            { teacherId },
            ...(formatted.email ? [{ email: formatted.email }] : [])
          ]
        },
        data: { photoUrl: formatted.photoUrl }
      });
    } catch (e) {
      console.warn('Could not sync teacher photo to user record:', e.message);
    }
  }
  if (data.active !== undefined) {
    formatted.active = Boolean(data.active);
    // Also sync the linked User account active state
    await prisma.user.updateMany({
      where: { teacherId },
      data: { active: Boolean(data.active) }
    });
  }

  const updated = await prisma.teacher.update({
    where: { id: teacherId },
    data: formatted
  });

  // Sync teaching assignments if provided
  if (data.assignments !== undefined && Array.isArray(data.assignments)) {
    // Clear old assignments and insert new list
    await prisma.teacherClassSubject.deleteMany({
      where: { teacherId }
    });

    for (const item of data.assignments) {
      if (item.classId && item.subjectId) {
        await prisma.teacherClassSubject.upsert({
          where: {
            teacherId_classId_subjectId: {
              teacherId,
              classId: parseInt(item.classId, 10),
              subjectId: parseInt(item.subjectId, 10)
            }
          },
          update: {},
          create: {
            teacherId,
            classId: parseInt(item.classId, 10),
            subjectId: parseInt(item.subjectId, 10)
          }
        });
      }
    }
  }

  // If user wants to create an account for an existing teacher if not linked
  if (data.createUserAccount && (data.email || updated.email)) {
    const emailToUse = (data.email || updated.email).trim().toLowerCase();
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailToUse },
          { teacherId: updated.id }
        ]
      }
    });
    if (!existingUser) {
      const password = data.userPassword || 'ChangeMe123!';
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      await prisma.user.create({
        data: {
          email: emailToUse,
          passwordHash,
          fullName: `${updated.firstName} ${updated.lastName}`,
          role: 'TEACHER',
          active: true,
          teacherId: updated.id
        }
      });
    } else {
      // If user exists, activate them
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { active: true }
      });
    }
  }

  await logAudit({
    userId: user?.id,
    action: 'UPDATE_TEACHER',
    entity: 'Teacher',
    entityId: updated.id,
    metadata: { changed: Object.keys(formatted), hasAssignmentsUpdate: data.assignments !== undefined },
    req
  });

  return getTeacherById(teacherId);
}

async function deactivateTeacher(id, user, req) {
  const teacherId = parseInt(id, 10);
  const updated = await prisma.teacher.update({
    where: { id: teacherId },
    data: { active: false }
  });

  // Also deactivate linked user
  await prisma.user.updateMany({
    where: { teacherId },
    data: { active: false }
  });

  await logAudit({
    userId: user?.id,
    action: 'DEACTIVATE_TEACHER',
    entity: 'Teacher',
    entityId: updated.id,
    metadata: { active: false },
    req
  });

  return updated;
}

async function assignClassSubject(teacherId, classId, subjectId, user, req) {
  const link = await prisma.teacherClassSubject.upsert({
    where: {
      teacherId_classId_subjectId: {
        teacherId: parseInt(teacherId, 10),
        classId: parseInt(classId, 10),
        subjectId: parseInt(subjectId, 10)
      }
    },
    update: {},
    create: {
      teacherId: parseInt(teacherId, 10),
      classId: parseInt(classId, 10),
      subjectId: parseInt(subjectId, 10)
    }
  });

  await logAudit({
    userId: user?.id,
    action: 'ASSIGN_TEACHER_CLASS_SUBJECT',
    entity: 'TeacherClassSubject',
    entityId: link.id,
    metadata: { teacherId, classId, subjectId },
    req
  });

  return link;
}

async function removeClassSubject(linkId, user, req) {
  const link = await prisma.teacherClassSubject.delete({
    where: { id: parseInt(linkId, 10) }
  });

  await logAudit({
    userId: user?.id,
    action: 'REMOVE_TEACHER_CLASS_SUBJECT',
    entity: 'TeacherClassSubject',
    entityId: link.id,
    metadata: { teacherId: link.teacherId, classId: link.classId, subjectId: link.subjectId },
    req
  });

  return link;
}

async function getTeacherAttendanceToday(targetDate) {
  const d = targetDate ? new Date(targetDate) : new Date();
  d.setUTCHours(0, 0, 0, 0);

  const [teachers, attendanceRecords] = await Promise.all([
    prisma.teacher.findMany({
      where: { active: true },
      include: {
        teacherLinks: {
          include: {
            class: true,
            subject: true
          }
        }
      },
      orderBy: { lastName: 'asc' }
    }).catch(() => []),
    prisma.teacherAttendance
      ? prisma.teacherAttendance.findMany({
          where: { date: d }
        }).catch(() => [])
      : Promise.resolve([])
  ]);

  const attMap = new Map();
  attendanceRecords.forEach(r => attMap.set(r.teacherId, r));

  const items = teachers.map(t => {
    const record = attMap.get(t.id);
    return {
      teacherId: t.id,
      employeeNo: t.employeeNo,
      fullName: `${t.firstName} ${t.lastName}`,
      specialty: t.specialty,
      email: t.email,
      phone: t.phone,
      classes: [...new Set(t.teacherLinks.map(l => l.class.name))],
      subjects: [...new Set(t.teacherLinks.map(l => l.subject.name))],
      attendanceId: record ? record.id : null,
      status: record ? record.status : 'NOT_MARKED',
      checkIn: record ? record.checkIn : null,
      note: record ? record.note : null
    };
  });

  const summary = {
    total: teachers.length,
    present: items.filter(i => i.status === 'PRESENT').length,
    late: items.filter(i => i.status === 'LATE').length,
    absent: items.filter(i => i.status === 'ABSENT').length,
    excused: items.filter(i => i.status === 'EXCUSED').length,
    notMarked: items.filter(i => i.status === 'NOT_MARKED').length
  };

  return {
    date: d.toISOString().slice(0, 10),
    summary,
    items
  };
}

async function saveTeacherAttendance({ teacherId, date, status, checkIn, note }, user, req) {
  let teacher = null;
  const numId = parseInt(teacherId, 10);
  if (!isNaN(numId)) {
    teacher = await prisma.teacher.findUnique({ where: { id: numId } });
  }
  if (!teacher && teacherId) {
    teacher = await prisma.teacher.findFirst({
      where: {
        OR: [
          { employeeNo: String(teacherId) },
          { email: String(teacherId) }
        ]
      }
    });
  }
  if (!teacher) {
    teacher = await prisma.teacher.findFirst({ where: { active: true } });
  }
  if (!teacher) {
    throw new Error('Teacher record not found in system.');
  }

  const tId = teacher.id;
  const d = date ? new Date(date) : new Date();
  d.setUTCHours(0, 0, 0, 0);

  const record = await prisma.teacherAttendance.upsert({
    where: {
      teacherId_date: {
        teacherId: tId,
        date: d
      }
    },
    update: {
      status: status || 'PRESENT',
      checkIn: checkIn || null,
      note: note || null
    },
    create: {
      teacherId: tId,
      date: d,
      status: status || 'PRESENT',
      checkIn: checkIn || null,
      note: note || null
    }
  });

  await logAudit({
    userId: user?.id,
    action: 'RECORD_TEACHER_ATTENDANCE',
    entity: 'TeacherAttendance',
    entityId: record.id,
    metadata: { teacherId: tId, status: record.status, checkIn: record.checkIn },
    req
  });

  return record;
}

async function getTeacherActivitySummary() {
  const teachers = await prisma.teacher.findMany({
    where: { active: true },
    include: {
      teacherLinks: {
        include: {
          class: true,
          subject: true
        }
      }
    }
  });

  const recentGrades = await prisma.grade.findMany({
    take: 15,
    orderBy: { updatedAt: 'desc' },
    include: {
      subject: true,
      class: true,
      student: true
    }
  });

  return {
    totalActiveTeachers: teachers.length,
    recentGrades: recentGrades.map(g => ({
      id: g.id,
      studentName: `${g.student.firstName} ${g.student.lastName}`,
      className: g.class?.name || 'Class',
      subjectName: g.subject.name,
      examName: g.examName,
      score: `${g.score}/${g.maxScore}`,
      date: g.updatedAt
    }))
  };
}

module.exports = {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deactivateTeacher,
  assignClassSubject,
  removeClassSubject,
  getTeacherAttendanceToday,
  saveTeacherAttendance,
  getTeacherActivitySummary
};
