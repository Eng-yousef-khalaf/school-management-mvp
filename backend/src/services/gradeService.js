const prisma = require('../utils/prisma');
const { logAudit } = require('../utils/auditLogger');

async function getClassGradeSheet({ classId, subjectId, examName }) {
  const cId = parseInt(classId, 10);
  const sId = parseInt(subjectId, 10);

  const [classData, subjectData] = await Promise.all([
    prisma.schoolClass.findUnique({
      where: { id: cId },
      include: {
        academicYear: true,
        enrollments: {
          include: { student: true },
          orderBy: { student: { lastName: 'asc' } }
        }
      }
    }),
    prisma.subject.findUnique({
      where: { id: sId }
    })
  ]);

  if (!classData) throw new Error('Class not found');
  if (!subjectData) throw new Error('Subject not found');

  const studentIds = classData.enrollments.map(e => e.studentId);
  const existingGrades = await prisma.grade.findMany({
    where: {
      studentId: { in: studentIds },
      subjectId: sId,
      examName: examName.trim()
    }
  });

  const gradeMap = new Map();
  existingGrades.forEach(g => {
    gradeMap.set(g.studentId, g);
  });

  const sheet = classData.enrollments.map(e => {
    const record = gradeMap.get(e.studentId);
    return {
      studentId: e.student.id,
      studentNumber: e.student.studentNumber,
      fullName: `${e.student.firstName} ${e.student.middleName ? e.student.middleName + ' ' : ''}${e.student.lastName}`,
      score: record ? record.score : null,
      maxScore: record ? record.maxScore : 100,
      percentage: record ? Math.round((record.score / record.maxScore) * 100) : null,
      gradeId: record ? record.id : null
    };
  });

  return {
    class: classData,
    subject: subjectData,
    examName,
    sheet
  };
}

async function saveBulkGrades({ classId, subjectId, examName, maxScore = 100, date, grades }, user, req) {
  const cId = classId ? parseInt(classId, 10) : null;
  const sId = parseInt(subjectId, 10);
  const exam = examName.trim();
  const max = Number(maxScore) || 100;
  const gradeDate = date ? new Date(date) : new Date();

  const results = [];

  for (const item of grades) {
    if (item.score === null || item.score === undefined || item.score === '') continue;

    const studentId = parseInt(item.studentId, 10);
    const scoreVal = Number(item.score);

    // Find existing grade for this student, subject, exam
    const existing = await prisma.grade.findFirst({
      where: {
        studentId,
        subjectId: sId,
        examName: exam
      }
    });

    let record;
    if (existing) {
      record = await prisma.grade.update({
        where: { id: existing.id },
        data: {
          score: scoreVal,
          maxScore: max,
          date: gradeDate,
          classId: cId
        }
      });
    } else {
      record = await prisma.grade.create({
        data: {
          studentId,
          subjectId: sId,
          classId: cId,
          examName: exam,
          score: scoreVal,
          maxScore: max,
          date: gradeDate
        }
      });
    }
    results.push(record);
  }

  await logAudit({
    userId: user?.id,
    action: 'ENTER_GRADES',
    entity: 'Grade',
    entityId: sId,
    metadata: { classId: cId, subjectId: sId, examName: exam, count: results.length },
    req
  });

  return results;
}

async function getGradeReport({ classId, academicYearId, examName }) {
  const where = {};
  if (classId) where.classId = parseInt(classId, 10);
  if (academicYearId) {
    where.class = { academicYearId: parseInt(academicYearId, 10) };
  }

  const enrollments = await prisma.enrollment.findMany({
    where,
    include: {
      student: {
        include: {
          grades: {
            where: examName ? { examName: examName.trim() } : undefined,
            include: { subject: true }
          }
        }
      },
      class: {
        include: { academicYear: true }
      }
    },
    orderBy: [
      { class: { name: 'asc' } },
      { student: { lastName: 'asc' } }
    ]
  });

  const subjects = await prisma.subject.findMany({
    where: { active: true },
    orderBy: { name: 'asc' }
  });

  const report = enrollments.map(e => {
    const s = e.student;
    const gradesBySubject = {};
    let totalScore = 0;
    let totalMax = 0;

    s.grades.forEach(g => {
      gradesBySubject[g.subject.code] = {
        score: g.score,
        maxScore: g.maxScore,
        percentage: Math.round((g.score / g.maxScore) * 100)
      };
      totalScore += g.score;
      totalMax += g.maxScore;
    });

    const average = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : null;

    return {
      studentId: s.id,
      studentNumber: s.studentNumber,
      studentName: `${s.firstName} ${s.lastName}`,
      className: e.class.name,
      academicYear: e.class.academicYear?.name,
      subjectGrades: gradesBySubject,
      average
    };
  });

  return {
    subjects,
    report
  };
}

module.exports = {
  getClassGradeSheet,
  saveBulkGrades,
  getGradeReport
};
