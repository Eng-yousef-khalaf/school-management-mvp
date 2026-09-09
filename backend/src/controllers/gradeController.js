const gradeService = require('../services/gradeService');
const excelService = require('../services/excelService');

async function getSheet(req, res, next) {
  try {
    const { classId, subjectId, examName } = req.query;
    if (!classId || !subjectId || !examName) {
      return res.status(400).json({ error: 'Class ID, Subject ID, and Exam Name are required' });
    }
    const result = await gradeService.getClassGradeSheet({ classId, subjectId, examName });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function saveBulk(req, res, next) {
  try {
    const { classId, subjectId, examName, maxScore, date, grades } = req.body;
    if (!subjectId || !examName || !grades || !Array.isArray(grades)) {
      return res.status(400).json({ error: 'Invalid grades payload' });
    }
    const result = await gradeService.saveBulkGrades({
      classId,
      subjectId,
      examName,
      maxScore,
      date,
      grades
    }, req.user, req);
    res.json({ success: true, savedCount: result.length, records: result });
  } catch (err) {
    next(err);
  }
}

async function getReport(req, res, next) {
  try {
    const result = await gradeService.getGradeReport(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function exportGrades(req, res, next) {
  try {
    const { subjects, report } = await gradeService.getGradeReport(req.query);

    const exportData = report.map(r => {
      const row = {
        'Student Number': r.studentNumber,
        'Student Name': r.studentName,
        'Class': r.className,
        'Academic Year': r.academicYear || ''
      };

      subjects.forEach(sub => {
        const subData = r.subjectGrades[sub.code];
        row[sub.name] = subData ? `${subData.score}/${subData.maxScore} (${subData.percentage}%)` : '—';
      });

      row['Overall Average'] = r.average !== null ? `${r.average}%` : '—';
      return row;
    });

    const buffer = excelService.generateExcelBuffer(exportData, 'Grade_Report');
    res.setHeader('Content-Disposition', 'attachment; filename=grades_report.xlsx');
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').send(buffer);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSheet,
  saveBulk,
  getReport,
  exportGrades
};
