const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const { staffOrAdmin, adminOnly } = require('../middleware/rbacMiddleware');

router.use(authMiddleware);

router.get('/students', reportController.getStudentReport);
router.get('/students/export', reportController.exportStudentReport);
router.get('/demographics', reportController.getDemographics);
router.get('/teachers', reportController.getTeacherWorkload);
router.get('/teachers/export', reportController.exportTeacherWorkload);
router.get('/bulk-certificates', staffOrAdmin, reportController.getBulkCertificates);

// 1-Click Ministry of Education & UNICEF Endpoints (Principal / Admin Only)
router.get('/unified-export', adminOnly, reportController.exportUnifiedMinistryReport);
router.get('/executive-analytical', adminOnly, reportController.getExecutiveAnalyticalReport);

// Consolidated Multi-Branch General Report (Super Admin / General Director)
router.get('/branches-general', adminOnly, reportController.getBranchesGeneralReport);
router.get('/branches-general/export', adminOnly, reportController.exportBranchesGeneralReport);

module.exports = router;

