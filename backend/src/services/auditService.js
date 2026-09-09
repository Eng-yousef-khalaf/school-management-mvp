const prisma = require('../utils/prisma');

async function getAuditLogs({ page = 1, limit = 50, action, entity, userId } = {}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * take;

  const where = {};
  if (action && action !== 'ALL') where.action = action;
  if (entity && entity !== 'ALL') where.entity = entity;
  if (userId) where.userId = parseInt(userId, 10);

  const [total, items] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      skip,
      take,
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, role: true }
        }
      }
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

module.exports = {
  getAuditLogs
};
