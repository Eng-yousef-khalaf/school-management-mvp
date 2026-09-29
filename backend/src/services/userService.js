const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { logAudit } = require('../utils/auditLogger');

async function getUsers({ page = 1, limit = 20, q = '', role, active } = {}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * take;

  const where = {};
  if (q && q.trim()) {
    const term = q.trim();
    where.OR = [
      { email: { contains: term } },
      { fullName: { contains: term } }
    ];
  }

  if (role && role !== 'ALL') {
    where.role = role;
  }

  if (active !== undefined && active !== 'ALL' && active !== '') {
    where.active = active === 'true' || active === true;
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        photoUrl: true,
        active: true,
        teacherId: true,
        teacher: {
          select: { employeeNo: true, firstName: true, lastName: true, photoUrl: true }
        },
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return {
    items: users,
    pagination: {
      total,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take) || 1
    }
  };
}

async function getUserById(id) {
  const userId = parseInt(id, 10);
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      photoUrl: true,
      active: true,
      teacherId: true,
      teacher: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

async function createUser(data, adminUser, req) {
  const email = data.email.trim().toLowerCase();
  
  const existing = await prisma.user.findUnique({
    where: { email }
  });
  if (existing) {
    const err = new Error(`البريد الإلكتروني (${email}) مسجل مسبقاً في النظام لمستخدم آخر. يرجى اختيار بريد مختلف.`);
    err.status = 409;
    throw err;
  }

  const password = data.password && data.password.trim() ? data.password.trim() : 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      fullName: data.fullName.trim(),
      passwordHash,
      role: data.role || 'STAFF',
      photoUrl: data.photoUrl ? data.photoUrl.trim() : null,
      active: data.active !== undefined ? Boolean(data.active) : true,
      teacherId: data.teacherId ? parseInt(data.teacherId, 10) : null
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      photoUrl: true,
      active: true,
      teacherId: true,
      createdAt: true
    }
  });

  await logAudit({
    userId: adminUser?.id,
    action: 'CREATE_USER',
    entity: 'User',
    entityId: user.id,
    metadata: { email: user.email, role: user.role },
    req
  });

  return user;
}

async function updateUser(id, data, adminUser, req) {
  const userId = parseInt(id, 10);
  const formatted = {};

  if (data.email !== undefined) formatted.email = data.email.trim().toLowerCase();
  if (data.fullName !== undefined) formatted.fullName = data.fullName.trim();
  if (data.role !== undefined) formatted.role = data.role;
  if (data.photoUrl !== undefined) formatted.photoUrl = data.photoUrl ? data.photoUrl.trim() : null;
  if (data.active !== undefined) formatted.active = Boolean(data.active);
  if (data.teacherId !== undefined) formatted.teacherId = data.teacherId ? parseInt(data.teacherId, 10) : null;

  if (data.password && data.password.length >= 6) {
    formatted.passwordHash = await bcrypt.hash(data.password, 12);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: formatted,
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      photoUrl: true,
      active: true,
      teacherId: true,
      updatedAt: true
    }
  });

  if (data.photoUrl !== undefined && updated.teacherId) {
    try {
      await prisma.teacher.update({
        where: { id: updated.teacherId },
        data: { photoUrl: formatted.photoUrl }
      });
    } catch (e) {
      console.warn('Could not sync photo to teacher record:', e.message);
    }
  }

  await logAudit({
    userId: adminUser?.id,
    action: 'UPDATE_USER',
    entity: 'User',
    entityId: updated.id,
    metadata: { changed: Object.keys(formatted) },
    req
  });

  return updated;
}

async function resetPassword(id, newPassword, adminUser, req) {
  const userId = parseInt(id, 10);
  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash }
  });

  await logAudit({
    userId: adminUser?.id,
    action: 'RESET_PASSWORD',
    entity: 'User',
    entityId: userId,
    metadata: { resetBy: adminUser?.email },
    req
  });

  return { success: true, message: 'Password reset successfully' };
}

async function deactivateUser(id, adminUser, req) {
  const userId = parseInt(id, 10);
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { active: false },
    select: { id: true, email: true, active: true }
  });

  await logAudit({
    userId: adminUser?.id,
    action: 'DEACTIVATE_USER',
    entity: 'User',
    entityId: updated.id,
    metadata: { active: false },
    req
  });

  return updated;
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  resetPassword,
  deactivateUser
};
