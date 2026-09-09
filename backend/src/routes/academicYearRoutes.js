const express = require('express');
const router = express.Router();
const academicYearController = require('../controllers/academicYearController');
const authMiddleware = require('../middleware/authMiddleware');
const { staffOrAdmin } = require('../middleware/rbacMiddleware');
const validate = require('../middleware/validateMiddleware');
const { academicYearSchema } = require('../utils/validators');

router.use(authMiddleware);

router.get('/', academicYearController.getAcademicYears);
router.get('/active', academicYearController.getActiveYear);
router.post('/', staffOrAdmin, validate(academicYearSchema), academicYearController.createAcademicYear);
router.put('/:id', staffOrAdmin, academicYearController.updateAcademicYear);
router.post('/:id/set-active', staffOrAdmin, academicYearController.setActiveYear);

module.exports = router;
