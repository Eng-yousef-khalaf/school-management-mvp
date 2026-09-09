const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/sheet', attendanceController.getSheet);
router.post('/bulk', attendanceController.saveBulk);
router.post('/mark-all-present', attendanceController.markAllPresent);
router.get('/report', attendanceController.getReport);
router.get('/export', attendanceController.exportAttendance);

module.exports = router;
