const studentService = require('../services/studentService');
const excelService = require('../services/excelService');

async function getStudents(req, res, next) {
  try {
    const result = await studentService.getStudents(req.query, req.user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getStudentById(req, res, next) {
  try {
    const student = await studentService.getStudentById(req.params.id, req.user);
    if (!student) {
      return res.status(404).json({ error: 'Student not found or access denied' });
    }
    res.json(student);
  } catch (err) {
    next(err);
  }
}

async function createStudent(req, res, next) {
  try {
    const student = await studentService.createStudent(req.body, req.user, req);
    res.status(201).json(student);
  } catch (err) {
    next(err);
  }
}

async function updateStudent(req, res, next) {
  try {
    const student = await studentService.updateStudent(req.params.id, req.body, req.user, req);
    res.json(student);
  } catch (err) {
    next(err);
  }
}

async function deactivateStudent(req, res, next) {
  try {
    const student = await studentService.deactivateStudent(req.params.id, req.user, req);
    res.json(student);
  } catch (err) {
    next(err);
  }
}

async function previewImport(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Excel or CSV file is required' });
    }

    const rawRows = excelService.parseStudentFile(req.file.buffer);
    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ error: 'The uploaded file is empty' });
    }

    const validationResult = await excelService.validateStudentRows(rawRows);
    res.json(validationResult);
  } catch (err) {
    next(err);
  }
}

async function executeImport(req, res, next) {
  try {
    const { validRows } = req.body;
    if (!validRows || !Array.isArray(validRows) || validRows.length === 0) {
      return res.status(400).json({ error: 'No valid rows provided for import' });
    }

    const result = await excelService.importValidatedStudents(validRows, req.user, req);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function exportStudents(req, res, next) {
  try {
    // Get all students matching filters without pagination limit
    const result = await studentService.getStudents({
      ...req.query,
      page: 1,
      limit: 10000
    }, req.user);

    const exportData = result.items.map(s => ({
      'Student Number': s.studentNumber,
      'First Name': s.firstName,
      'Middle Name': s.middleName || '',
      'Last Name': s.lastName,
      'Gender': s.gender || '',
      'Date of Birth': s.dateOfBirth ? s.dateOfBirth.toISOString().slice(0, 10) : '',
      'Phone': s.phone || '',
      'Parent Name': s.parentName || '',
      'Parent Phone': s.parentPhone || '',
      'Address': s.address || '',
      'Status': s.status,
      'Class': s.currentClass || 'Not Enrolled',
      'Academic Year': s.academicYear || ''
    }));

    const buffer = excelService.generateExcelBuffer(exportData, 'Students');
    res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').send(buffer);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deactivateStudent,
  previewImport,
  executeImport,
  exportStudents
};
