const feeService = require('../services/feeService');

async function getAllFees(req, res, next) {
  try {
    const data = await feeService.getAllStudentFees(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getStudentFee(req, res, next) {
  try {
    const data = await feeService.getStudentFeeDetails(req.params.studentId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function recordPayment(req, res, next) {
  try {
    const result = await feeService.recordPayment(req.body, req.user, req);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function getSummary(req, res, next) {
  try {
    const summary = await feeService.getFinancialSummary(req.query.academicYearId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
}

async function getAlerts(req, res, next) {
  try {
    const alerts = await feeService.getFeeAlerts();
    res.json(alerts);
  } catch (err) {
    next(err);
  }
}

async function getPendingNotices(req, res, next) {
  try {
    const data = await feeService.getPendingNotices();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function approvePayment(req, res, next) {
  try {
    const result = await feeService.approvePayment(req.params.id, req.user, req);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function rejectPayment(req, res, next) {
  try {
    const result = await feeService.rejectPayment(req.params.id, req.body, req.user, req);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function submitParentNotice(req, res, next) {
  try {
    const result = await feeService.submitParentNotice(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function lookupStudentPublic(req, res, next) {
  try {
    const result = await feeService.lookupStudentPublic(req.query.q);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllFees,
  getStudentFee,
  recordPayment,
  getSummary,
  getAlerts,
  getPendingNotices,
  approvePayment,
  rejectPayment,
  submitParentNotice,
  lookupStudentPublic
};
