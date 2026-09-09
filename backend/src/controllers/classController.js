const classService = require('../services/classService');

async function getClasses(req, res, next) {
  try {
    const classes = await classService.getClasses(req.query);
    res.json(classes);
  } catch (err) {
    next(err);
  }
}

async function getClassById(req, res, next) {
  try {
    const schoolClass = await classService.getClassById(req.params.id);
    if (!schoolClass) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json(schoolClass);
  } catch (err) {
    next(err);
  }
}

async function createClass(req, res, next) {
  try {
    const schoolClass = await classService.createClass(req.body, req.user, req);
    res.status(201).json(schoolClass);
  } catch (err) {
    next(err);
  }
}

async function updateClass(req, res, next) {
  try {
    const schoolClass = await classService.updateClass(req.params.id, req.body, req.user, req);
    res.json(schoolClass);
  } catch (err) {
    next(err);
  }
}

async function deleteClass(req, res, next) {
  try {
    const result = await classService.deleteClass(req.params.id, req.user, req);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass
};
