const prisma = require('./prisma');

async function logAudit({ userId, action, entity, entityId, metadata, req }) {
  try {
    let ipAddress = null;
    if (req && req.headers) {
      ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;
    }
    const metaString = typeof metadata === 'object' ? JSON.stringify(metadata) : metadata;
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action: action || 'UNKNOWN',
        entity: entity || 'SYSTEM',
        entityId: entityId ? String(entityId) : null,
        metadata: metaString || null,
        ipAddress: ipAddress ? String(ipAddress) : null
      }
    });
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
}

module.exports = { logAudit };
