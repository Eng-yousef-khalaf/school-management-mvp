const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const authMiddleware = require('../middleware/authMiddleware');

const { allAuthenticated } = require('../middleware/rbacMiddleware');

router.use(authMiddleware);

router.get('/sheet', gradeController.getSheet);
router.post('/bulk', allAuthenticated, gradeController.saveBulk);
router.get('/report', gradeController.getReport);
router.get('/export', gradeController.exportGrades);

module.exports = router;
