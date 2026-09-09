const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/rbacMiddleware');

router.use(authMiddleware);
router.use(adminOnly);

router.get('/', auditLogController.getAuditLogs);

module.exports = router;
