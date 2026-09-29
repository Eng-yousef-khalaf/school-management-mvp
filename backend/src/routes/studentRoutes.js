const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const { staffOrAdmin } = require('../middleware/rbacMiddleware');
const validate = require('../middleware/validateMiddleware');
const { studentSchema } = require('../utils/validators');

// Public student lookup for parents (single identifier search - strictly protected)
router.get('/public/inquiry', studentController.getPublicStudentInquiry);

// Public student online registration (no auth required)
router.post('/public/register', studentController.submitPublicRegistration);

router.use(authMiddleware);

// Staff/Admin Online Registrations Inbox & Actions
router.get('/registrations/all', staffOrAdmin, studentController.getOnlineRegistrations);
router.post('/registrations/:id/approve', staffOrAdmin, studentController.approveOnlineRegistration);
router.delete('/registrations/:id', staffOrAdmin, studentController.rejectOnlineRegistration);

router.get('/', studentController.getStudents);
router.get('/export', studentController.exportStudents);
router.get('/:id', studentController.getStudentById);

router.post('/', staffOrAdmin, validate(studentSchema), studentController.createStudent);
router.put('/:id', staffOrAdmin, studentController.updateStudent);
router.delete('/:id', staffOrAdmin, studentController.deactivateStudent);

router.post('/import/preview', staffOrAdmin, upload.single('file'), studentController.previewImport);
router.post('/import/execute', staffOrAdmin, studentController.executeImport);

module.exports = router;
