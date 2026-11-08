const teacherService = require('../services/teacherService');
const excelService = require('../services/excelService');

async function getTeachers(req, res, next) {
  try {
    const result = await teacherService.getTeachers(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getTeacherById(req, res, next) {
  try {
    const teacher = await teacherService.getTeacherById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (err) {
    next(err);
  }
}

async function createTeacher(req, res, next) {
  try {
    const teacher = await teacherService.createTeacher(req.body, req.user, req);
    res.status(201).json(teacher);
  } catch (err) {
    next(err);
  }
}

async function updateTeacher(req, res, next) {
  try {
    const teacher = await teacherService.updateTeacher(req.params.id, req.body, req.user, req);
    res.json(teacher);
  } catch (err) {
    next(err);
  }
}

async function deactivateTeacher(req, res, next) {
  try {
    const teacher = await teacherService.deactivateTeacher(req.params.id, req.user, req);
    res.json(teacher);
  } catch (err) {
    next(err);
  }
}

async function assignClassSubject(req, res, next) {
  try {
    const { teacherId, classId, subjectId } = req.body;
    const link = await teacherService.assignClassSubject(teacherId, classId, subjectId, req.user, req);
    res.status(201).json(link);
  } catch (err) {
    next(err);
  }
}

async function removeClassSubject(req, res, next) {
  try {
    const result = await teacherService.removeClassSubject(req.params.linkId, req.user, req);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function exportTeachers(req, res, next) {
  try {
    const result = await teacherService.getTeachers({
      ...req.query,
      page: 1,
      limit: 10000
    });

    const exportData = result.items.map(t => ({
      'Employee Number': t.employeeNo,
      'First Name': t.firstName,
      'Last Name': t.lastName,
      'Specialty': t.specialty || '',
      'Phone': t.phone || '',
      'Email': t.email || '',
      'Active': t.active ? 'Active' : 'Inactive',
      'Assigned Classes': t.classes.join(', '),
      'Assigned Subjects': t.subjects.join(', ')
    }));

    const buffer = excelService.generateExcelBuffer(exportData, 'Teachers');
    res.setHeader('Content-Disposition', 'attachment; filename=teachers.xlsx');
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').send(buffer);
  } catch (err) {
    next(err);
  }
}

async function getTeacherAttendanceToday(req, res, next) {
  try {
    const result = await teacherService.getTeacherAttendanceToday(req.query.date);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function saveTeacherAttendance(req, res, next) {
  try {
    const result = await teacherService.saveTeacherAttendance(req.body, req.user, req);
    res.json({ success: true, record: result });
  } catch (err) {
    next(err);
  }
}

async function getTeacherActivity(req, res, next) {
  try {
    const result = await teacherService.getTeacherActivitySummary();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deactivateTeacher,
  assignClassSubject,
  removeClassSubject,
  exportTeachers,
  getTeacherAttendanceToday,
  saveTeacherAttendance,
  getTeacherActivity
};
