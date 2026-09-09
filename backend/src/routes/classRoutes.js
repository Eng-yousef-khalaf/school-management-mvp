const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const authMiddleware = require('../middleware/authMiddleware');
const { staffOrAdmin } = require('../middleware/rbacMiddleware');
const validate = require('../middleware/validateMiddleware');
const { classSchema } = require('../utils/validators');

router.use(authMiddleware);

router.get('/', classController.getClasses);
router.get('/:id', classController.getClassById);
router.post('/', staffOrAdmin, validate(classSchema), classController.createClass);
router.put('/:id', staffOrAdmin, classController.updateClass);
router.delete('/:id', staffOrAdmin, classController.deleteClass);

module.exports = router;
