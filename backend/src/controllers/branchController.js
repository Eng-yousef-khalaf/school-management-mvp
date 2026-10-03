const branchService = require('../services/branchService');

async function getBranches(req, res, next) {
  try {
    const branches = await branchService.getBranches(req.query);
    res.json(branches);
  } catch (err) {
    next(err);
  }
}

async function getBranchById(req, res, next) {
  try {
    const branch = await branchService.getBranchById(req.params.id);
    if (!branch) {
      return res.status(404).json({ error: 'الفرع المطلوب غير موجود' });
    }
    res.json(branch);
  } catch (err) {
    next(err);
  }
}

async function getBranchStats(req, res, next) {
  try {
    const stats = await branchService.getBranchStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

async function createBranch(req, res, next) {
  try {
    const result = await branchService.createBranch(req.body, req.user, req);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function updateBranch(req, res, next) {
  try {
    const updated = await branchService.updateBranch(req.params.id, req.body, req.user, req);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deactivateBranch(req, res, next) {
  try {
    const result = await branchService.deactivateBranch(req.params.id, req.user, req);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getBranches,
  getBranchById,
  getBranchStats,
  createBranch,
  updateBranch,
  deactivateBranch
};
