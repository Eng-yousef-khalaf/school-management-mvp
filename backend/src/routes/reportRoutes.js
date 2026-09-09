const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/students', reportController.getStudentReport);
router.get('/students/export', reportController.exportStudentReport);
router.get('/demographics', reportController.getDemographics);
router.get('/teachers', reportController.getTeacherWorkload);
router.get('/teachers/export', reportController.exportTeacherWorkload);

module.exports = router;
