const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function run() {
  console.log('=== VERIFYING YOUSSEF SCHOOL V2 SYSTEM ===\n');

  // 1. Test Admin Login (يوسف)
  const adminRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@school.local', password: 'ChangeMe123!' });

  console.log(`1. Admin Login (يوسف): HTTP ${adminRes.status}`);
  console.log(`   User Name: "${adminRes.body.user?.fullName}" | Role: ${adminRes.body.user?.role}`);
  if (adminRes.body.user?.fullName !== 'يوسف' || adminRes.body.user?.role !== 'ADMIN') {
    throw new Error('Admin user verification failed');
  }

  // 2. Test Staff Login (محمد)
  const staffRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'staff@school.local', password: 'ChangeMe123!' });

  console.log(`\n2. Staff Login (محمد): HTTP ${staffRes.status}`);
  console.log(`   User Name: "${staffRes.body.user?.fullName}" | Role: ${staffRes.body.user?.role}`);
  if (staffRes.body.user?.fullName !== 'محمد' || staffRes.body.user?.role !== 'STAFF') {
    throw new Error('Staff user verification failed');
  }

  // 3. Test Individual Teacher Logins
  const teacherEmails = [
    { email: 'ahmed.khalil@school.local', expected: 'Ahmed Khalil' },
    { email: 'sara.mansour@school.local', expected: 'Sara Mansour' },
    { email: 'omar.farooq@school.local', expected: 'Omar Farooq' }
  ];

  for (const t of teacherEmails) {
    const tRes = await request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: t.email, password: 'ChangeMe123!' });

    console.log(`\n3. Teacher Login (${t.expected}): HTTP ${tRes.status}`);
    console.log(`   User Name: "${tRes.body.user?.fullName}" | Teacher ID: ${tRes.body.user?.teacherId}`);
  }

  // 4. Test Bulk Certificates Endpoint with Staff Token (Allowed)
  const staffToken = staffRes.body.token;
  const bulkResStaff = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/reports/bulk-certificates',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${staffToken}` }
  });

  console.log(`\n4. Staff accessing Bulk Certificates: HTTP ${bulkResStaff.status}`);
  console.log(`   Total Student Certificates generated: ${bulkResStaff.body.length}`);
  if (bulkResStaff.status !== 200 || !Array.isArray(bulkResStaff.body) || bulkResStaff.body.length === 0) {
    throw new Error('Bulk certificates retrieval by Staff failed');
  }
  const sample = bulkResStaff.body[0];
  console.log(`   Sample Certificate Student: ${sample.fullName} | Class: ${sample.className} | GPA: ${sample.overallAverage}% | Attendance: ${sample.attendanceSummary.percentage}%`);

  // 5. Test Bulk Certificates Endpoint with Teacher Token (Must be Denied - 403 Forbidden)
  const teacherToken = (await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'ahmed.khalil@school.local', password: 'ChangeMe123!' })).body.token;

  const bulkResTeacher = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/reports/bulk-certificates',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  });

  console.log(`\n5. Teacher attempting to access Bulk Certificates: HTTP ${bulkResTeacher.status} (Expected 403 Forbidden)`);
  if (bulkResTeacher.status !== 403) {
    throw new Error(`Teacher should be blocked with 403 from Bulk Certificates, got ${bulkResTeacher.status}`);
  }

  // 6. Test Teacher Attendance Recording (Staff Allowed, Teacher Denied)
  const teachersList = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/teachers',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${staffToken}` }
  });
  const firstTeacher = teachersList.body.items ? teachersList.body.items[0] : teachersList.body[0];

  const staffAttendance = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/teachers/attendance',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${staffToken}`, 'Content-Type': 'application/json' }
  }, {
    teacherId: firstTeacher.id,
    date: '2026-09-09',
    status: 'LATE',
    arrivalTime: '08:15',
    notes: 'تأخر 30 دقيقة عن الطابور الصباحي'
  });

  console.log(`\n6. Staff recording Teacher Attendance & Tardiness: HTTP ${staffAttendance.status}`);
  console.log(`   Recorded: ${staffAttendance.body.status} at arrival ${staffAttendance.body.arrivalTime} | Late: ${staffAttendance.body.isLate}`);

  const teacherTryAttendance = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/teachers/attendance',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${teacherToken}`, 'Content-Type': 'application/json' }
  }, {
    teacherId: firstTeacher.id,
    date: '2026-09-09',
    status: 'PRESENT'
  });

  console.log(`   Teacher trying to self-record attendance: HTTP ${teacherTryAttendance.status} (Expected 403)`);
  if (teacherTryAttendance.status !== 403) {
    throw new Error('Teacher should be denied from recording attendance');
  }

  console.log('\n✅ ALL VERIFICATIONS PASSED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
