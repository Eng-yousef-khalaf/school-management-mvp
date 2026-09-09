const prisma = require('../utils/prisma');

async function getDashboardStats() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [
    totalStudents,
    activeStudents,
    totalTeachers,
    totalClasses,
    totalSubjects,
    todayAttendanceRecords,
    genderGroup,
    classesWithCount,
    recentAuditLogs
  ] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { status: 'ACTIVE' } }),
    prisma.teacher.count({ where: { active: true } }),
    prisma.schoolClass.count(),
    prisma.subject.count({ where: { active: true } }),
    prisma.attendance.findMany({
      where: { date: today },
      select: { status: true }
    }),
    prisma.student.groupBy({
      by: ['gender'],
      _count: { id: true },
      where: { status: 'ACTIVE' }
    }),
    prisma.schoolClass.findMany({
      include: {
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: { fullName: true, role: true }
        }
      }
    })
  ]);

  // Today Attendance
  const todayTotal = todayAttendanceRecords.length;
  const presentToday = todayAttendanceRecords.filter(r => r.status === 'PRESENT').length;
  const absentToday = todayAttendanceRecords.filter(r => r.status === 'ABSENT').length;
  const lateToday = todayAttendanceRecords.filter(r => r.status === 'LATE').length;
  const excusedToday = todayAttendanceRecords.filter(r => r.status === 'EXCUSED').length;
  const attendanceRate = todayTotal > 0 ? Math.round(((presentToday + lateToday) / todayTotal) * 100) : 0;

  // 7-day Attendance Trend
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);

  const trendRecords = await prisma.attendance.findMany({
    where: {
      date: { gte: sevenDaysAgo }
    },
    select: { date: true, status: true }
  });

  const trendMap = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    trendMap[key] = { date: key, present: 0, absent: 0, late: 0, excused: 0 };
  }

  trendRecords.forEach(r => {
    const key = r.date.toISOString().slice(0, 10);
    if (trendMap[key]) {
      if (r.status === 'PRESENT') trendMap[key].present++;
      else if (r.status === 'ABSENT') trendMap[key].absent++;
      else if (r.status === 'LATE') trendMap[key].late++;
      else if (r.status === 'EXCUSED') trendMap[key].excused++;
    }
  });

  const attendanceOverview = Object.values(trendMap);

  // Students by Class
  const studentsByClass = classesWithCount.map(c => ({
    className: c.name,
    count: c._count.enrollments
  }));

  // Students by Gender
  const studentsByGender = genderGroup.map(g => ({
    gender: g.gender || 'UNSPECIFIED',
    count: g._count.id
  }));

  return {
    overview: {
      totalStudents,
      activeStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      todayAttendance: {
        total: todayTotal,
        present: presentToday,
        absent: absentToday,
        late: lateToday,
        excused: excusedToday,
        rate: attendanceRate
      }
    },
    charts: {
      studentsByClass,
      attendanceOverview,
      studentsByGender
    },
    recentActivities: recentAuditLogs.map(log => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      user: log.user ? log.user.fullName : 'System',
      role: log.user ? log.user.role : 'SYSTEM',
      timestamp: log.timestamp
    }))
  };
}

module.exports = {
  getDashboardStats
};
