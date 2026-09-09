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

async function createAcademicYear(data, user, req) {
  // If set to active, deactivate others
  if (data.active) {
    await prisma.academicYear.updateMany({
      data: { active: false }
    });
  }

  const year = await prisma.academicYear.create({
    data: {
      name: data.name.trim(),
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      active: Boolean(data.active)
    }
  });

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

  if (data.active) {
    await prisma.academicYear.updateMany({
      where: { id: { not: yearId } },
      data: { active: false }
    });
  }

  const formatted = {};
  if (data.name !== undefined) formatted.name = data.name.trim();
  if (data.startDate !== undefined) formatted.startDate = new Date(data.startDate);
  if (data.endDate !== undefined) formatted.endDate = new Date(data.endDate);
  if (data.active !== undefined) formatted.active = Boolean(data.active);

  const updated = await prisma.academicYear.update({
    where: { id: yearId },
    data: formatted
  });

  await logAudit({
    userId: user?.id,
    action: 'UPDATE_ACADEMIC_YEAR',
    entity: 'AcademicYear',
    entityId: updated.id,
    metadata: { changed: Object.keys(formatted) },
    req
  });

  return updated;
}

async function setActiveAcademicYear(id, user, req) {
  const yearId = parseInt(id, 10);

  // Deactivate all
  await prisma.academicYear.updateMany({
    data: { active: false }
  });

  // Activate chosen
  const activeYear = await prisma.academicYear.update({
    where: { id: yearId },
    data: { active: true }
  });

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

module.exports = {
  getAcademicYears,
  getActiveAcademicYear,
  createAcademicYear,
  updateAcademicYear,
  setActiveAcademicYear
};
