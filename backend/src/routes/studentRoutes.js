const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const { staffOrAdmin } = require('../middleware/rbacMiddleware');
const validate = require('../middleware/validateMiddleware');
const { studentSchema } = require('../utils/validators');

router.use(authMiddleware);

router.get('/', studentController.getStudents);
router.get('/export', studentController.exportStudents);
router.get('/:id', studentController.getStudentById);

router.post('/', staffOrAdmin, validate(studentSchema), studentController.createStudent);
router.put('/:id', staffOrAdmin, studentController.updateStudent);
router.delete('/:id', staffOrAdmin, studentController.deactivateStudent);

router.post('/import/preview', staffOrAdmin, upload.single('file'), studentController.previewImport);
router.post('/import/execute', staffOrAdmin, studentController.executeImport);

module.exports = router;
