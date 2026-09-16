const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const authMiddleware = require('../middleware/authMiddleware');
const { staffOrAdmin } = require('../middleware/rbacMiddleware');

// Public endpoints for parents (no login required)
router.get('/public/lookup', feeController.lookupStudentPublic);
router.post('/parent-notice', feeController.submitParentNotice);

// Protected Staff & Admin endpoints
router.use(authMiddleware);
router.use(staffOrAdmin);

router.get('/', feeController.getAllFees);
router.get('/summary', feeController.getSummary);
router.get('/alerts', feeController.getAlerts);
router.get('/pending-notices', feeController.getPendingNotices);
router.get('/student/:studentId', feeController.getStudentFee);
router.post('/payments', feeController.recordPayment);
router.post('/payments/:id/approve', feeController.approvePayment);
router.post('/payments/:id/reject', feeController.rejectPayment);

module.exports = router;
