const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminOnly, superAdminOnly, allAuthenticated } = require('../middleware/rbacMiddleware');

router.use(authMiddleware);

// Get all branches (for branch switcher / selection)
router.get('/', allAuthenticated, branchController.getBranches);

// Get aggregated statistics across all branches (General Director dashboard)
router.get('/stats', adminOnly, branchController.getBranchStats);

// Get single branch
router.get('/:id', allAuthenticated, branchController.getBranchById);

// Create branch + manager (General Director only)
router.post('/', adminOnly, branchController.createBranch);

// Update branch
router.put('/:id', adminOnly, branchController.updateBranch);

// Deactivate branch
router.delete('/:id', adminOnly, branchController.deactivateBranch);

module.exports = router;
