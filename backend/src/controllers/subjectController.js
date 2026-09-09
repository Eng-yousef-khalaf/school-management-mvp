const subjectService = require('../services/subjectService');

async function getSubjects(req, res, next) {
  try {
    const subjects = await subjectService.getSubjects();
    res.json(subjects);
  } catch (err) {
    next(err);
  }
}

async function getSubjectById(req, res, next) {
  try {
    const subject = await subjectService.getSubjectById(req.params.id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json(subject);
  } catch (err) {
    next(err);
  }
}

async function createSubject(req, res, next) {
  try {
    const subject = await subjectService.createSubject(req.body, req.user, req);
    res.status(201).json(subject);
  } catch (err) {
    next(err);
  }
}

async function updateSubject(req, res, next) {
  try {
    const subject = await subjectService.updateSubject(req.params.id, req.body, req.user, req);
    res.json(subject);
  } catch (err) {
    next(err);
  }
}

async function deactivateSubject(req, res, next) {
  try {
    const subject = await subjectService.deactivateSubject(req.params.id, req.user, req);
    res.json(subject);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deactivateSubject
};
