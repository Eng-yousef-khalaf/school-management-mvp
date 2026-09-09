const academicYearService = require('../services/academicYearService');

async function getAcademicYears(req, res, next) {
  try {
    const years = await academicYearService.getAcademicYears();
    res.json(years);
  } catch (err) {
    next(err);
  }
}

async function getActiveYear(req, res, next) {
  try {
    const year = await academicYearService.getActiveAcademicYear();
    res.json(year);
  } catch (err) {
    next(err);
  }
}

async function createAcademicYear(req, res, next) {
  try {
    const year = await academicYearService.createAcademicYear(req.body, req.user, req);
    res.status(201).json(year);
  } catch (err) {
    next(err);
  }
}

async function updateAcademicYear(req, res, next) {
  try {
    const year = await academicYearService.updateAcademicYear(req.params.id, req.body, req.user, req);
    res.json(year);
  } catch (err) {
    next(err);
  }
}

async function setActiveYear(req, res, next) {
  try {
    const year = await academicYearService.setActiveAcademicYear(req.params.id, req.user, req);
    res.json(year);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAcademicYears,
  getActiveYear,
  createAcademicYear,
  updateAcademicYear,
  setActiveYear
};
