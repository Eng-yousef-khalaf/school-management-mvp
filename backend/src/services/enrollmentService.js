const prisma = require('../utils/prisma');
const { logAudit } = require('../utils/auditLogger');

async function getEnrollments({
  academicYearId,
  classId,
  studentId,
  page = 1,
  limit = 50
} = {}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * take;

  const where = {};
  if (academicYearId) {
    where.class = { academicYearId: parseInt(academicYearId, 10) };
  }
  if (classId) {
    where.classId = parseInt(classId, 10);
  }
  if (studentId) {
    where.studentId = parseInt(studentId, 10);
  }

  const [total, items] = await Promise.all([
    prisma.enrollment.count({ where }),
    prisma.enrollment.findMany({
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
      orderBy: { enrolledAt: 'desc' }
    })
  ]);

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

async function enrollStudent({ studentId, classId, academicYearId }, user, req) {
  const sId = parseInt(studentId, 10);
  const cId = parseInt(classId, 10);

  // Check if class exists
  const targetClass = await prisma.schoolClass.findUnique({
    where: { id: cId },
    include: { academicYear: true }
  });

  if (!targetClass) {
    throw new Error('Class not found');
  }

  const yearId = academicYearId ? parseInt(academicYearId, 10) : targetClass.academicYearId;

  // Check if already enrolled in this class
  const existing = await prisma.enrollment.findUnique({
    where: {
      studentId_classId: {
        studentId: sId,
        classId: cId
      }
    }
  });

  if (existing) {
    throw new Error('Student is already enrolled in this class');
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: sId,
      classId: cId,
      academicYearId: yearId
    },
    include: {
      student: true,
      class: {
        include: { academicYear: true }
      }
    }
  });

  await logAudit({
    userId: user?.id,
    action: 'ENROLL_STUDENT',
    entity: 'Enrollment',
    entityId: enrollment.id,
    metadata: {
      studentId: sId,
      classId: cId,
      className: targetClass.name,
      academicYear: targetClass.academicYear?.name
    },
    req
  });

  return enrollment;
}

async function bulkEnroll({ studentIds, classId, academicYearId }, user, req) {
  const cId = parseInt(classId, 10);
  const targetClass = await prisma.schoolClass.findUnique({
    where: { id: cId },
    include: { academicYear: true }
  });

  if (!targetClass) {
    throw new Error('Target class not found');
  }

  const yearId = academicYearId ? parseInt(academicYearId, 10) : targetClass.academicYearId;

  let enrolledCount = 0;
  let skippedCount = 0;

  for (const sId of studentIds) {
    try {
      await prisma.enrollment.create({
        data: {
          studentId: parseInt(sId, 10),
          classId: cId,
          academicYearId: yearId
        }
      });
      enrolledCount++;
    } catch {
      skippedCount++;
    }
  }

  await logAudit({
    userId: user?.id,
    action: 'BULK_ENROLL_STUDENTS',
    entity: 'Enrollment',
    entityId: cId,
    metadata: { classId: cId, enrolledCount, skippedCount },
    req
  });

  return { enrolledCount, skippedCount, total: studentIds.length };
}

async function unenrollStudent(id, user, req) {
  const enrollmentId = parseInt(id, 10);
  const deleted = await prisma.enrollment.delete({
    where: { id: enrollmentId },
    include: { student: true, class: true }
  });

  await logAudit({
    userId: user?.id,
    action: 'UNENROLL_STUDENT',
    entity: 'Enrollment',
    entityId: deleted.id,
    metadata: { studentId: deleted.studentId, classId: deleted.classId },
    req
  });

  return deleted;
}

module.exports = {
  getEnrollments,
  enrollStudent,
  bulkEnroll,
  unenrollStudent
};
