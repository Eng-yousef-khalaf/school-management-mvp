const prisma = require('../utils/prisma');
const { logAudit } = require('../utils/auditLogger');

async function getAcademicYears() {
  return prisma.academicYear.findMany({
    include: {
      _count: {
        select: {
          classes: true,
          enrollments: true
        }
      }
    },
    orderBy: { startDate: 'desc' }
  });
}

async function getActiveAcademicYear() {
  return prisma.academicYear.findFirst({
    where: { active: true },
    include: {
      classes: true
    }
  });
}

/**
 * Handle new academic year activation:
 * 1. Deactivates other academic years.
 * 2. Archives/preserves previous data intact.
 * 3. Deactivates all non-admin users (Staff, Teachers) so the new year starts fresh under Director control.
 * 4. Deactivates all teacher profiles pending Admin rollover reactivation.
 */
async function handleYearActivation(activeYearId, activeYearName, user, req) {
  // Deactivate all other years
  await prisma.academicYear.updateMany({
    where: { id: { not: activeYearId } },
    data: { active: false }
  });

  // Deactivate non-admin user accounts, but NEVER deactivate any ADMIN users or the currently operating user
  const currentUserId = user?.id;
  const deactivatedUsers = await prisma.user.updateMany({
    where: {
      role: { not: 'ADMIN' },
      ...(currentUserId ? { id: { not: currentUserId } } : {})
    },
    data: { active: false }
  });

  // Deactivate all teacher records
  const deactivatedTeachers = await prisma.teacher.updateMany({
    data: { active: false }
  });

  await logAudit({
    userId: user?.id,
    action: 'TRANSITION_ACADEMIC_YEAR',
    entity: 'AcademicYear',
    entityId: activeYearId,
    metadata: {
      activeYearName,
      deactivatedUsersCount: deactivatedUsers.count,
      deactivatedTeachersCount: deactivatedTeachers.count
    },
    req
  });
}

async function createAcademicYear(data, user, req) {
  const isSettingActive = Boolean(data.active);

  const year = await prisma.academicYear.create({
    data: {
      name: data.name.trim(),
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      active: isSettingActive
    }
  });

  if (isSettingActive) {
    await handleYearActivation(year.id, year.name, user, req);
  }

  await logAudit({
    userId: user?.id,
    action: 'CREATE_ACADEMIC_YEAR',
    entity: 'AcademicYear',
    entityId: year.id,
    metadata: { name: year.name, active: year.active },
    req
  });

  return year;
}

async function updateAcademicYear(id, data, user, req) {
  const yearId = parseInt(id, 10);
  const isSettingActive = data.active === true || data.active === 'true';

  const formatted = {};
  if (data.name !== undefined) formatted.name = data.name.trim();
  if (data.startDate !== undefined) formatted.startDate = new Date(data.startDate);
  if (data.endDate !== undefined) formatted.endDate = new Date(data.endDate);
  if (data.active !== undefined) formatted.active = Boolean(data.active);

  const updated = await prisma.academicYear.update({
    where: { id: yearId },
    data: formatted
  });

  if (isSettingActive) {
    await handleYearActivation(updated.id, updated.name, user, req);
  }

  await logAudit({
    userId: user?.id,
    action: 'UPDATE_ACADEMIC_YEAR',
    entity: 'AcademicYear',
    entityId: updated.id,
    metadata: { changed: Object.keys(formatted), active: updated.active },
    req
  });

  return updated;
}

async function setActiveAcademicYear(id, user, req) {
  const yearId = parseInt(id, 10);

  // Activate chosen
  const activeYear = await prisma.academicYear.update({
    where: { id: yearId },
    data: { active: true }
  });

  // Handle transition & user/teacher reset
  await handleYearActivation(activeYear.id, activeYear.name, user, req);

  await logAudit({
    userId: user?.id,
    action: 'SET_ACTIVE_ACADEMIC_YEAR',
    entity: 'AcademicYear',
    entityId: activeYear.id,
    metadata: { name: activeYear.name },
    req
  });

  return activeYear;
}

/**
 * Get pool of all previous teachers & staff members for Admin to review and select for reactivation
 */
async function getPreviousTeachersPool() {
  const [teachers, staffMembers, activeYear] = await Promise.all([
    prisma.teacher.findMany({
      orderBy: { lastName: 'asc' },
      include: {
        user: {
          select: { id: true, email: true, role: true, active: true }
        },
        _count: {
          select: { teacherLinks: true }
        }
      }
    }),
    prisma.user.findMany({
      where: { role: 'STAFF' },
      select: { id: true, email: true, fullName: true, role: true, active: true },
      orderBy: { fullName: 'asc' }
    }),
    prisma.academicYear.findFirst({
      where: { active: true }
    })
  ]);

  return {
    activeYear,
    teachers: teachers.map(t => ({
      id: t.id,
      employeeNo: t.employeeNo,
      fullName: `${t.firstName} ${t.lastName}`,
      firstName: t.firstName,
      lastName: t.lastName,
      specialty: t.specialty || 'General',
      email: t.email,
      phone: t.phone,
      active: t.active,
      userActive: t.user ? t.user.active : false,
      hasAccount: Boolean(t.user),
      pastAssignmentsCount: t._count.teacherLinks
    })),
    staffMembers
  };
}

/**
 * Admin batch reactivates selected teachers and staff members for the new academic year
 */
async function rolloverReactivate({ teacherIds = [], staffUserIds = [] }, user, req) {
  const tIds = teacherIds.map(id => parseInt(id, 10)).filter(Boolean);
  const sIds = staffUserIds.map(id => parseInt(id, 10)).filter(Boolean);

  let reactivatedTeachersCount = 0;
  let reactivatedStaffCount = 0;

  if (tIds.length > 0) {
    // 1. Activate teachers
    const resTeachers = await prisma.teacher.updateMany({
      where: { id: { in: tIds } },
      data: { active: true }
    });
    reactivatedTeachersCount = resTeachers.count;

    // 2. Activate their user accounts
    await prisma.user.updateMany({
      where: { teacherId: { in: tIds } },
      data: { active: true }
    });
  }

  if (sIds.length > 0) {
    // 3. Activate selected staff accounts
    const resStaff = await prisma.user.updateMany({
      where: { id: { in: sIds } },
      data: { active: true }
    });
    reactivatedStaffCount = resStaff.count;
  }

  await logAudit({
    userId: user?.id,
    action: 'ROLLOVER_REACTIVATE_TEACHERS',
    entity: 'AcademicYear',
    metadata: {
      reactivatedTeachersCount,
      reactivatedStaffCount,
      teacherIds: tIds,
      staffUserIds: sIds
    },
    req
  });

  return {
    success: true,
    message: `Reactivated ${reactivatedTeachersCount} teachers and ${reactivatedStaffCount} staff members for the new academic year`,
    reactivatedTeachersCount,
    reactivatedStaffCount
  };
}

function parseGradeNumber(gradeStr) {
  if (!gradeStr) return null;
  const s = gradeStr.toString().trim();
  const match = s.match(/\d+/);
  if (match) return parseInt(match[0], 10);

  const arMap = {
    'أول': 1, 'الاول': 1, 'الأول': 1,
    'ثاني': 2, 'الثاني': 2,
    'ثالث': 3, 'الثالث': 3,
    'رابع': 4, 'الرابع': 4,
    'خامس': 5, 'الخامس': 5,
    'سادس': 6, 'السادس': 6,
    'سابع': 7, 'السابع': 7,
    'ثامن': 8, 'الثامن': 8,
    'تاسع': 9, 'التاسع': 9,
    'عاشر': 10, 'العاشر': 10,
    'حادي عشر': 11, 'الحادي عشر': 11,
    'ثاني عشر': 12, 'الثاني عشر': 12, 'توجيهي': 12, 'التوجيهي': 12
  };
  for (const [k, v] of Object.entries(arMap)) {
    if (s.includes(k)) return v;
  }
  return null;
}

function resolveNextGrade(gradeStr) {
  const num = parseGradeNumber(gradeStr);
  const arabicNames = [
    '', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس',
    'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر (توجيهي)'
  ];

  if (num !== null) {
    if (num >= 12) {
      return { isGraduating: true, nextGrade: 'خريج', nextGradeNameAr: 'خريجون' };
    }
    const nextNum = num + 1;
    return {
      isGraduating: false,
      nextGrade: `${nextNum}`,
      nextGradeNameAr: `الصف ${arabicNames[nextNum] || nextNum} (قيد التوزيع)`
    };
  }
  return { isGraduating: false, nextGrade: gradeStr, nextGradeNameAr: `${gradeStr} (قيد التوزيع)` };
}

async function getPromotionPreview({ sourceYearId, targetYearId }) {
  const sourceYear = sourceYearId
    ? await prisma.academicYear.findUnique({ where: { id: parseInt(sourceYearId, 10) } })
    : await prisma.academicYear.findFirst({ where: { active: true } });

  if (!sourceYear) {
    throw new Error('لم يتم العثور على العام الدراسي الحالي المطلوب ترفيع طلابه');
  }

  let targetYear = null;
  if (targetYearId) {
    targetYear = await prisma.academicYear.findUnique({ where: { id: parseInt(targetYearId, 10) } });
  } else {
    targetYear = await prisma.academicYear.findFirst({
      where: {
        id: { not: sourceYear.id },
        startDate: { gte: sourceYear.startDate }
      },
      orderBy: { startDate: 'asc' }
    });
  }

  const enrollments = await prisma.enrollment.findMany({
    where: {
      class: { academicYearId: sourceYear.id },
      student: { status: 'ACTIVE' }
    },
    include: {
      student: true,
      class: true
    }
  });

  const previewGroups = {};
  let totalPromotable = 0;
  let totalGraduating = 0;

  enrollments.forEach(en => {
    const currentGrade = en.class.grade || 'غير محدد';
    const resolution = resolveNextGrade(currentGrade);

    const groupKey = currentGrade;
    if (!previewGroups[groupKey]) {
      previewGroups[groupKey] = {
        currentGrade,
        currentClassName: en.class.name,
        isGraduating: resolution.isGraduating,
        targetGrade: resolution.nextGrade,
        targetGradeNameAr: resolution.nextGradeNameAr,
        studentCount: 0,
        sampleStudents: []
      };
    }

    previewGroups[groupKey].studentCount += 1;
    if (previewGroups[groupKey].sampleStudents.length < 5) {
      previewGroups[groupKey].sampleStudents.push({
        id: en.student.id,
        name: `${en.student.firstName} ${en.student.lastName}`,
        number: en.student.studentNumber
      });
    }

    if (resolution.isGraduating) {
      totalGraduating += 1;
    } else {
      totalPromotable += 1;
    }
  });

  return {
    sourceYear: { id: sourceYear.id, name: sourceYear.name },
    targetYear: targetYear ? { id: targetYear.id, name: targetYear.name } : null,
    totalStudents: enrollments.length,
    totalPromotable,
    totalGraduating,
    groups: Object.values(previewGroups)
  };
}

async function promoteStudentsYearEnd({ sourceYearId, targetYearId, targetYearName }, user, req) {
  const sourceYear = sourceYearId
    ? await prisma.academicYear.findUnique({ where: { id: parseInt(sourceYearId, 10) } })
    : await prisma.academicYear.findFirst({ where: { active: true } });

  if (!sourceYear) {
    throw new Error('العام الدراسي الحالي غير متوفر للترفيع');
  }

  let targetYear = null;
  if (targetYearId) {
    targetYear = await prisma.academicYear.findUnique({ where: { id: parseInt(targetYearId, 10) } });
  } else if (targetYearName && targetYearName.trim()) {
    targetYear = await prisma.academicYear.findFirst({
      where: { name: targetYearName.trim() }
    });
    if (!targetYear) {
      const nextStart = new Date(sourceYear.endDate);
      nextStart.setDate(nextStart.getDate() + 60);
      const nextEnd = new Date(nextStart);
      nextEnd.setFullYear(nextEnd.getFullYear() + 1);
      targetYear = await prisma.academicYear.create({
        data: {
          name: targetYearName.trim(),
          startDate: nextStart,
          endDate: nextEnd,
          active: false
        }
      });
    }
  }

  if (!targetYear) {
    throw new Error('يرجى تحديد أو إنشاء العام الدراسي الجديد المطلوب ترفيع الطلاب إليه');
  }

  const enrollments = await prisma.enrollment.findMany({
    where: {
      class: { academicYearId: sourceYear.id },
      student: { status: 'ACTIVE' }
    },
    include: {
      student: true,
      class: true
    }
  });

  let promotedCount = 0;
  let graduatedCount = 0;
  const gradeClassesCache = {};

  for (const en of enrollments) {
    const student = en.student;
    const currentGrade = en.class.grade || '7';
    const resolution = resolveNextGrade(currentGrade);

    if (resolution.isGraduating) {
      await prisma.student.update({
        where: { id: student.id },
        data: { status: 'GRADUATED' }
      });
      graduatedCount += 1;
    } else {
      const nextGrade = resolution.nextGrade;
      const targetClassName = resolution.nextGradeNameAr;

      if (!gradeClassesCache[nextGrade]) {
        let cohortClass = await prisma.schoolClass.findFirst({
          where: {
            academicYearId: targetYear.id,
            grade: nextGrade,
            section: null
          }
        });

        if (!cohortClass) {
          cohortClass = await prisma.schoolClass.create({
            data: {
              name: targetClassName,
              grade: nextGrade,
              section: null,
              academicYearId: targetYear.id
            }
          });
        }
        gradeClassesCache[nextGrade] = cohortClass;
      }

      const assignedClass = gradeClassesCache[nextGrade];

      const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
          studentId: student.id,
          academicYearId: targetYear.id
        }
      });

      if (!existingEnrollment) {
        await prisma.enrollment.create({
          data: {
            studentId: student.id,
            classId: assignedClass.id,
            academicYearId: targetYear.id
          }
        });
      }
      promotedCount += 1;
    }
  }

  await logAudit({
    userId: user?.id,
    action: 'PROMOTE_STUDENTS_YEAR_END',
    entity: 'AcademicYear',
    entityId: targetYear.id,
    metadata: {
      sourceYearName: sourceYear.name,
      targetYearName: targetYear.name,
      totalProcessed: enrollments.length,
      promotedCount,
      graduatedCount
    },
    req
  });

  return {
    success: true,
    message: `تم الترفيع بنجاح: تم ترفيع ${promotedCount} طالباً للصفوف التالية بدون شعب مسبقة، وتخريج ${graduatedCount} طالباً.`,
    promotedCount,
    graduatedCount,
    totalProcessed: enrollments.length,
    sourceYearName: sourceYear.name,
    targetYearName: targetYear.name
  };
}

module.exports = {
  getAcademicYears,
  getActiveAcademicYear,
  createAcademicYear,
  updateAcademicYear,
  setActiveAcademicYear,
  getPreviousTeachersPool,
  rolloverReactivate,
  getPromotionPreview,
  promoteStudentsYearEnd
};

