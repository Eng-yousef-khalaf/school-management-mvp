const prisma = require('../utils/prisma');
const { logAudit } = require('../utils/auditLogger');

async function getAcademicYears() {
  return prisma.academicYear.findMany({
    include: {
      _count: {
        select: {
          classes: true,
          enrollments: true
        }
      }
    },
    orderBy: { startDate: 'desc' }
  });
}

async function getActiveAcademicYear() {
  return prisma.academicYear.findFirst({
    where: { active: true },
    include: {
      classes: true
    }
  });
}

/**
 * Handle new academic year activation:
 * 1. Deactivates other academic years.
 * 2. Archives/preserves previous data intact.
 * 3. Deactivates all non-admin users (Staff, Teachers) so the new year starts fresh under Director control.
 * 4. Deactivates all teacher profiles pending Admin rollover reactivation.
 */
async function handleYearActivation(activeYearId, activeYearName, user, req) {
  // Deactivate all other years
  await prisma.academicYear.updateMany({
    where: { id: { not: activeYearId } },
    data: { active: false }
  });

  // Deactivate non-admin user accounts, but NEVER deactivate any ADMIN users or the currently operating user
  const currentUserId = user?.id;
  const deactivatedUsers = await prisma.user.updateMany({
    where: {
      role: { not: 'ADMIN' },
      ...(currentUserId ? { id: { not: currentUserId } } : {})
    },
    data: { active: false }
  });

  // Deactivate all teacher records
  const deactivatedTeachers = await prisma.teacher.updateMany({
    data: { active: false }
  });

  await logAudit({
    userId: user?.id,
    action: 'TRANSITION_ACADEMIC_YEAR',
    entity: 'AcademicYear',
    entityId: activeYearId,
    metadata: {
      activeYearName,
      deactivatedUsersCount: deactivatedUsers.count,
      deactivatedTeachersCount: deactivatedTeachers.count
    },
    req
  });
}

async function createAcademicYear(data, user, req) {
  const isSettingActive = Boolean(data.active);

  const year = await prisma.academicYear.create({
    data: {
      name: data.name.trim(),
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      active: isSettingActive
    }
  });

  if (isSettingActive) {
    await handleYearActivation(year.id, year.name, user, req);
  }

  await logAudit({
    userId: user?.id,
    action: 'CREATE_ACADEMIC_YEAR',
    entity: 'AcademicYear',
    entityId: year.id,
    metadata: { name: year.name, active: year.active },
    req
  });

  return year;
}

async function updateAcademicYear(id, data, user, req) {
  const yearId = parseInt(id, 10);
  const isSettingActive = data.active === true || data.active === 'true';

  const formatted = {};
  if (data.name !== undefined) formatted.name = data.name.trim();
  if (data.startDate !== undefined) formatted.startDate = new Date(data.startDate);
  if (data.endDate !== undefined) formatted.endDate = new Date(data.endDate);
  if (data.active !== undefined) formatted.active = Boolean(data.active);

  const updated = await prisma.academicYear.update({
    where: { id: yearId },
    data: formatted
  });

  if (isSettingActive) {
    await handleYearActivation(updated.id, updated.name, user, req);
  }

  await logAudit({
    userId: user?.id,
    action: 'UPDATE_ACADEMIC_YEAR',
    entity: 'AcademicYear',
    entityId: updated.id,
    metadata: { changed: Object.keys(formatted), active: updated.active },
    req
  });

  return updated;
}

async function setActiveAcademicYear(id, user, req) {
  const yearId = parseInt(id, 10);

  // Activate chosen
  const activeYear = await prisma.academicYear.update({
    where: { id: yearId },
    data: { active: true }
  });

  // Handle transition & user/teacher reset
  await handleYearActivation(activeYear.id, activeYear.name, user, req);

  await logAudit({
    userId: user?.id,
    action: 'SET_ACTIVE_ACADEMIC_YEAR',
    entity: 'AcademicYear',
    entityId: activeYear.id,
    metadata: { name: activeYear.name },
    req
  });

  return activeYear;
}

/**
 * Get pool of all previous teachers & staff members for Admin to review and select for reactivation
 */
async function getPreviousTeachersPool() {
  const [teachers, staffMembers, activeYear] = await Promise.all([
    prisma.teacher.findMany({
      orderBy: { lastName: 'asc' },
      include: {
        user: {
          select: { id: true, email: true, role: true, active: true }
        },
        _count: {
          select: { teacherLinks: true }
        }
      }
    }),
    prisma.user.findMany({
      where: { role: 'STAFF' },
      select: { id: true, email: true, fullName: true, role: true, active: true },
      orderBy: { fullName: 'asc' }
    }),
    prisma.academicYear.findFirst({
      where: { active: true }
    })
  ]);

  return {
    activeYear,
    teachers: teachers.map(t => ({
      id: t.id,
      employeeNo: t.employeeNo,
      fullName: `${t.firstName} ${t.lastName}`,
      firstName: t.firstName,
      lastName: t.lastName,
      specialty: t.specialty || 'General',
      email: t.email,
      phone: t.phone,
      active: t.active,
      userActive: t.user ? t.user.active : false,
      hasAccount: Boolean(t.user),
      pastAssignmentsCount: t._count.teacherLinks
    })),
    staffMembers
  };
}

/**
 * Admin batch reactivates selected teachers and staff members for the new academic year
 */
async function rolloverReactivate({ teacherIds = [], staffUserIds = [] }, user, req) {
  const tIds = teacherIds.map(id => parseInt(id, 10)).filter(Boolean);
  const sIds = staffUserIds.map(id => parseInt(id, 10)).filter(Boolean);

  let reactivatedTeachersCount = 0;
  let reactivatedStaffCount = 0;

  if (tIds.length > 0) {
    // 1. Activate teachers
    const resTeachers = await prisma.teacher.updateMany({
      where: { id: { in: tIds } },
      data: { active: true }
    });
    reactivatedTeachersCount = resTeachers.count;

    // 2. Activate their user accounts
    await prisma.user.updateMany({
      where: { teacherId: { in: tIds } },
      data: { active: true }
    });
  }

  if (sIds.length > 0) {
    // 3. Activate selected staff accounts
    const resStaff = await prisma.user.updateMany({
      where: { id: { in: sIds } },
      data: { active: true }
    });
    reactivatedStaffCount = resStaff.count;
  }

  await logAudit({
    userId: user?.id,
    action: 'ROLLOVER_REACTIVATE_TEACHERS',
    entity: 'AcademicYear',
    metadata: {
      reactivatedTeachersCount,
      reactivatedStaffCount,
      teacherIds: tIds,
      staffUserIds: sIds
    },
    req
  });

  return {
    success: true,
    message: `Reactivated ${reactivatedTeachersCount} teachers and ${reactivatedStaffCount} staff members for the new academic year`,
    reactivatedTeachersCount,
    reactivatedStaffCount
  };
}

module.exports = {
  getAcademicYears,
  getActiveAcademicYear,
  createAcademicYear,
  updateAcademicYear,
  setActiveAcademicYear,
  getPreviousTeachersPool,
  rolloverReactivate
};

