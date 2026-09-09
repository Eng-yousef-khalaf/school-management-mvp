const attendanceService = require('../services/attendanceService');
const excelService = require('../services/excelService');

async function getSheet(req, res, next) {
  try {
    const { classId, date } = req.query;
    if (!classId || !date) {
      return res.status(400).json({ error: 'Class ID and Date are required' });
    }
    const result = await attendanceService.getClassAttendanceSheet({ classId, date });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function saveBulk(req, res, next) {
  try {
    const { classId, date, records } = req.body;
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Invalid attendance records array' });
    }
    const result = await attendanceService.saveBulkAttendance({ classId, date, records }, req.user, req);
    res.json({ success: true, savedCount: result.length, records: result });
  } catch (err) {
    next(err);
  }
}

async function markAllPresent(req, res, next) {
  try {
    const { classId, date } = req.body;
    if (!classId || !date) {
      return res.status(400).json({ error: 'Class ID and Date are required' });
    }
    const result = await attendanceService.markAllPresent({ classId, date }, req.user, req);
    res.json({ success: true, count: result.length });
  } catch (err) {
    next(err);
  }
}

async function getReport(req, res, next) {
  try {
    const result = await attendanceService.getAttendanceReport(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function exportAttendance(req, res, next) {
  try {
    const result = await attendanceService.getAttendanceReport({
      ...req.query,
      page: 1,
      limit: 10000
    });

    const exportData = result.items.map(r => ({
      'Date': r.date,
      'Student Number': r.studentNumber,
      'Student Name': r.studentName,
      'Class': r.className,
      'Status': r.status,
      'Note': r.note || ''
    }));

    const buffer = excelService.generateExcelBuffer(exportData, 'Attendance');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.xlsx');
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').send(buffer);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSheet,
  saveBulk,
  markAllPresent,
  getReport,
  exportAttendance
};
