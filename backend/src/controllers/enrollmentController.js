const enrollmentService = require('../services/enrollmentService');

async function getEnrollments(req, res, next) {
  try {
    const result = await enrollmentService.getEnrollments(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function enrollStudent(req, res, next) {
  try {
    const enrollment = await enrollmentService.enrollStudent(req.body, req.user, req);
    res.status(201).json(enrollment);
  } catch (err) {
    next(err);
  }
}

async function bulkEnroll(req, res, next) {
  try {
    const { studentIds, classId, academicYearId } = req.body;
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: 'No students selected for enrollment' });
    }
    const result = await enrollmentService.bulkEnroll({ studentIds, classId, academicYearId }, req.user, req);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function unenrollStudent(req, res, next) {
  try {
    const result = await enrollmentService.unenrollStudent(req.params.id, req.user, req);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getEnrollments,
  enrollStudent,
  bulkEnroll,
  unenrollStudent
};
