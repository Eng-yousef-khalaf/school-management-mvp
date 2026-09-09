const prisma = require('../utils/prisma');
const { logAudit } = require('../utils/auditLogger');

async function getClasses({ academicYearId, grade } = {}) {
  const where = {};
  if (academicYearId) {
    where.academicYearId = parseInt(academicYearId, 10);
  }
  if (grade) {
    where.grade = String(grade);
  }

  const classes = await prisma.schoolClass.findMany({
    where,
    include: {
      academicYear: true,
      _count: {
        select: {
          enrollments: true,
          teacherLinks: true
        }
      },
      teacherLinks: {
        include: {
          teacher: true,
          subject: true
        }
      }
    },
    orderBy: [
      { academicYear: { startDate: 'desc' } },
      { name: 'asc' }
    ]
  });

  return classes.map(c => ({
    ...c,
    studentCount: c._count.enrollments,
    teachers: c.teacherLinks.map(tl => ({
      teacherId: tl.teacher.id,
      teacherName: `${tl.teacher.firstName} ${tl.teacher.lastName}`,
      subjectName: tl.subject.name,
      subjectCode: tl.subject.code
    }))
  }));
}

async function getClassById(id) {
  const classId = parseInt(id, 10);
  const schoolClass = await prisma.schoolClass.findUnique({
    where: { id: classId },
    include: {
      academicYear: true,
      enrollments: {
        include: {
          student: true
        },
        orderBy: {
          student: {
            lastName: 'asc'
          }
        }
      },
      teacherLinks: {
        include: {
          teacher: true,
          subject: true
        }
      }
    }
  });

  if (!schoolClass) return null;

  return {
    ...schoolClass,
    students: schoolClass.enrollments.map(e => e.student),
    teachers: schoolClass.teacherLinks.map(tl => ({
      linkId: tl.id,
      teacherId: tl.teacher.id,
      teacherName: `${tl.teacher.firstName} ${tl.teacher.lastName}`,
      employeeNo: tl.teacher.employeeNo,
      subjectId: tl.subject.id,
      subjectName: tl.subject.name,
      subjectCode: tl.subject.code
    }))
  };
}

async function createClass(data, user, req) {
  const schoolClass = await prisma.schoolClass.create({
    data: {
      name: data.name.trim(),
      grade: data.grade.trim(),
      section: data.section ? data.section.trim() : null,
      academicYearId: parseInt(data.academicYearId, 10)
    },
    include: {
      academicYear: true
    }
  });

  await logAudit({
    userId: user?.id,
    action: 'CREATE_CLASS',
    entity: 'SchoolClass',
    entityId: schoolClass.id,
    metadata: { name: schoolClass.name, academicYearId: schoolClass.academicYearId },
    req
  });

  return schoolClass;
}

async function updateClass(id, data, user, req) {
  const classId = parseInt(id, 10);
  const formatted = {};
  if (data.name !== undefined) formatted.name = data.name.trim();
  if (data.grade !== undefined) formatted.grade = data.grade.trim();
  if (data.section !== undefined) formatted.section = data.section ? data.section.trim() : null;
  if (data.academicYearId !== undefined) formatted.academicYearId = parseInt(data.academicYearId, 10);

  const updated = await prisma.schoolClass.update({
    where: { id: classId },
    data: formatted,
    include: { academicYear: true }
  });

  await logAudit({
    userId: user?.id,
    action: 'UPDATE_CLASS',
    entity: 'SchoolClass',
    entityId: updated.id,
    metadata: { changed: Object.keys(formatted) },
    req
  });

  return updated;
}

async function deleteClass(id, user, req) {
  const classId = parseInt(id, 10);
  const deleted = await prisma.schoolClass.delete({
    where: { id: classId }
  });

  await logAudit({
    userId: user?.id,
    action: 'DELETE_CLASS',
    entity: 'SchoolClass',
    entityId: deleted.id,
    metadata: { name: deleted.name },
    req
  });

  return deleted;
}

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass
};
