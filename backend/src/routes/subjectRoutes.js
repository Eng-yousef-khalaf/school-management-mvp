const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const authMiddleware = require('../middleware/authMiddleware');
const { staffOrAdmin } = require('../middleware/rbacMiddleware');
const validate = require('../middleware/validateMiddleware');
const { subjectSchema } = require('../utils/validators');

router.use(authMiddleware);

router.get('/', subjectController.getSubjects);
router.get('/:id', subjectController.getSubjectById);
router.post('/', staffOrAdmin, validate(subjectSchema), subjectController.createSubject);
router.put('/:id', staffOrAdmin, subjectController.updateSubject);
router.delete('/:id', staffOrAdmin, subjectController.deactivateSubject);

module.exports = router;
