const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const { staffOrAdmin } = require('../middleware/rbacMiddleware');

router.use(authMiddleware);

router.get('/students', reportController.getStudentReport);
router.get('/students/export', reportController.exportStudentReport);
router.get('/demographics', reportController.getDemographics);
router.get('/teachers', reportController.getTeacherWorkload);
router.get('/teachers/export', reportController.exportTeacherWorkload);
router.get('/bulk-certificates', staffOrAdmin, reportController.getBulkCertificates);

module.exports = router;

