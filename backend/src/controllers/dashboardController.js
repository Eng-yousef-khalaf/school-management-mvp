const dashboardService = require('../services/dashboardService');

async function getDashboard(req, res, next) {
  try {
    const stats = await dashboardService.getDashboardStats(req.query, req.user);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard
};
