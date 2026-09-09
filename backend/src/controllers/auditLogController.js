const auditService = require('../services/auditService');

async function getAuditLogs(req, res, next) {
  try {
    const result = await auditService.getAuditLogs(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAuditLogs
};
