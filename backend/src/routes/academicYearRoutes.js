const express = require('express');
const router = express.Router();
const academicYearController = require('../controllers/academicYearController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminOnly, staffOrAdmin } = require('../middleware/rbacMiddleware');
const validate = require('../middleware/validateMiddleware');
const { academicYearSchema } = require('../utils/validators');

router.use(authMiddleware);

router.get('/', academicYearController.getAcademicYears);
router.get('/active', academicYearController.getActiveYear);
router.get('/teachers-pool', adminOnly, academicYearController.getTeachersPool);
router.post('/rollover-reactivate', adminOnly, academicYearController.rolloverReactivate);
router.post('/', adminOnly, validate(academicYearSchema), academicYearController.createAcademicYear);
router.put('/:id', adminOnly, academicYearController.updateAcademicYear);
router.post('/:id/set-active', adminOnly, academicYearController.setActiveYear);

module.exports = router;
