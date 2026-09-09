const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/sheet', gradeController.getSheet);
router.post('/bulk', gradeController.saveBulk);
router.get('/report', gradeController.getReport);
router.get('/export', gradeController.exportGrades);

module.exports = router;
