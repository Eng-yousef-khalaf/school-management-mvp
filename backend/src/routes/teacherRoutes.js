const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');
const { staffOrAdmin, adminOnly } = require('../middleware/rbacMiddleware');
const validate = require('../middleware/validateMiddleware');
const { teacherSchema } = require('../utils/validators');

router.use(authMiddleware);

router.get('/', teacherController.getTeachers);
router.get('/export', teacherController.exportTeachers);
router.get('/:id', teacherController.getTeacherById);

router.post('/', staffOrAdmin, validate(teacherSchema), teacherController.createTeacher);
router.put('/:id', staffOrAdmin, teacherController.updateTeacher);
router.delete('/:id', adminOnly, teacherController.deactivateTeacher);

router.post('/assign', staffOrAdmin, teacherController.assignClassSubject);
router.delete('/assign/:linkId', staffOrAdmin, teacherController.removeClassSubject);

module.exports = router;
