const reportService = require('../services/reportService');
const excelService = require('../services/excelService');

async function getStudentReport(req, res, next) {
  try {
    const data = await reportService.getStudentListReport(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getDemographics(req, res, next) {
  try {
    const data = await reportService.getDemographicsReport();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getTeacherWorkload(req, res, next) {
  try {
    const data = await reportService.getTeacherWorkloadReport();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function exportStudentReport(req, res, next) {
  try {
    const data = await reportService.getStudentListReport(req.query);
    const exportData = data.map(s => ({
      'Student Number': s.studentNumber,
      'Full Name': s.fullName,
      'Gender': s.gender,
      'Date of Birth': s.dateOfBirth,
      'Class': s.className,
      'Academic Year': s.academicYear,
      'Status': s.status,
      'Parent Name': s.parentName,
      'Parent Phone': s.parentPhone,
      'Address': s.address
    }));

    const buffer = excelService.generateExcelBuffer(exportData, 'Student_Directory_Report');
    res.setHeader('Content-Disposition', 'attachment; filename=student_directory_report.xlsx');
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').send(buffer);
  } catch (err) {
    next(err);
  }
}

async function exportTeacherWorkload(req, res, next) {
  try {
    const data = await reportService.getTeacherWorkloadReport();
    const exportData = data.map(t => ({
      'Employee Number': t.employeeNo,
      'Teacher Name': t.fullName,
      'Specialty': t.specialty,
      'Status': t.active,
      'Total Assignments': t.totalAssignments,
      'Assigned Classes': t.classes,
      'Assigned Subjects': t.subjects,
      'Phone': t.phone,
      'Email': t.email
    }));

    const buffer = excelService.generateExcelBuffer(exportData, 'Teacher_Workload_Report');
    res.setHeader('Content-Disposition', 'attachment; filename=teacher_workload_report.xlsx');
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').send(buffer);
  } catch (err) {
    next(err);
  }
}

async function getBulkCertificates(req, res, next) {
  try {
    const data = await reportService.getBulkCertificatesReport(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStudentReport,
  getDemographics,
  getTeacherWorkload,
  getBulkCertificates,
  exportStudentReport,
  exportTeacherWorkload
};
