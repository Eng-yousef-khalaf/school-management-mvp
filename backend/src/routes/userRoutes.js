const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/rbacMiddleware');
const validate = require('../middleware/validateMiddleware');
const { userSchema } = require('../utils/validators');

router.use(authMiddleware);
router.use(adminOnly);

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', validate(userSchema), userController.createUser);
router.put('/:id', userController.updateUser);
router.post('/:id/reset-password', userController.resetPassword);
router.delete('/:id', adminOnly, userController.deactivateUser);

module.exports = router;
