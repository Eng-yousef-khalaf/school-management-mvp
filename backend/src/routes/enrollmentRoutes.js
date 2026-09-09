const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const authMiddleware = require('../middleware/authMiddleware');
const { staffOrAdmin } = require('../middleware/rbacMiddleware');
const validate = require('../middleware/validateMiddleware');
const { enrollmentSchema } = require('../utils/validators');

router.use(authMiddleware);

router.get('/', enrollmentController.getEnrollments);
router.post('/', staffOrAdmin, validate(enrollmentSchema), enrollmentController.enrollStudent);
router.post('/bulk', staffOrAdmin, enrollmentController.bulkEnroll);
router.delete('/:id', staffOrAdmin, enrollmentController.unenrollStudent);

module.exports = router;
