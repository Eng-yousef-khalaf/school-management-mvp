const prisma = require('../utils/prisma');
const { logAudit } = require('../utils/auditLogger');

async function getSubjects() {
  const subjects = await prisma.subject.findMany({
    include: {
      _count: {
        select: {
          teacherLinks: true,
          grades: true
        }
      },
      teacherLinks: {
        include: {
          teacher: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  return subjects.map(s => {
    const uniqueTeachers = [...new Set(s.teacherLinks.map(tl => `${tl.teacher.firstName} ${tl.teacher.lastName}`))];
    return {
      ...s,
      teacherCount: uniqueTeachers.length,
      teachers: uniqueTeachers
    };
  });
}

async function getSubjectById(id) {
  const subjectId = parseInt(id, 10);
  return prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      teacherLinks: {
        include: {
          teacher: true,
          class: true
        }
      }
    }
  });
}

async function createSubject(data, user, req) {
  const subject = await prisma.subject.create({
    data: {
      code: data.code.trim().toUpperCase(),
      name: data.name.trim(),
      active: data.active !== undefined ? Boolean(data.active) : true
    }
  });

  await logAudit({
    userId: user?.id,
    action: 'CREATE_SUBJECT',
    entity: 'Subject',
    entityId: subject.id,
    metadata: { code: subject.code, name: subject.name },
    req
  });

  return subject;
}

async function updateSubject(id, data, user, req) {
  const subjectId = parseInt(id, 10);
  const formatted = {};
  if (data.code !== undefined) formatted.code = data.code.trim().toUpperCase();
  if (data.name !== undefined) formatted.name = data.name.trim();
  if (data.active !== undefined) formatted.active = Boolean(data.active);

  const updated = await prisma.subject.update({
    where: { id: subjectId },
    data: formatted
  });

  await logAudit({
    userId: user?.id,
    action: 'UPDATE_SUBJECT',
    entity: 'Subject',
    entityId: updated.id,
    metadata: { changed: Object.keys(formatted) },
    req
  });

  return updated;
}

async function deactivateSubject(id, user, req) {
  const subjectId = parseInt(id, 10);
  const updated = await prisma.subject.update({
    where: { id: subjectId },
    data: { active: false }
  });

  await logAudit({
    userId: user?.id,
    action: 'DEACTIVATE_SUBJECT',
    entity: 'Subject',
    entityId: updated.id,
    metadata: { active: false },
    req
  });

  return updated;
}

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deactivateSubject
};
