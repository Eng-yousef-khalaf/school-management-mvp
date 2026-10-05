const http = require('http');

const PORT = 4000;
let serverInstance = null;
let app = null;

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: PORT,
      ...options
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch {
          json = body;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);

    if (data) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      req.setHeader('Content-Type', 'application/json');
      req.setHeader('Content-Length', Buffer.byteLength(payload));
      req.write(payload);
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('🛡️  STARTING COMPREHENSIVE QA & SECURITY TEST SUITE (V2)');
  console.log('================================================================\n');

  process.env.NODE_ENV = 'test';
  process.env.PORT = '4000';
  app = require('../src/server');

  serverInstance = app.listen(PORT);
  await new Promise(r => setTimeout(r, 800));

  let passed = 0;
  let failed = 0;

  function assert(testName, condition, details = '') {
    if (condition) {
      console.log('  ✅ [PASS] ' + testName);
      passed++;
    } else {
      console.error('  ❌ [FAIL] ' + testName + ' - ' + details);
      failed++;
    }
  }

  try {
    console.log('--- CATEGORY 1: HEALTH & PUBLIC ACCESSIBILITY ---');
    const healthRes = await request({ method: 'GET', path: '/api/health' });
    assert('Server Health Check returns 200 & healthy', healthRes.status === 200 && healthRes.body?.ok === true, 'Status: ' + healthRes.status);

    const brandingRes = await request({ method: 'GET', path: '/api/developer/branding' });
    assert('Branding endpoint accessible publicly', brandingRes.status === 200 && brandingRes.body?.ok === true, 'Status: ' + brandingRes.status);

    console.log('\n--- CATEGORY 2: AUTHENTICATION & CRYPTOGRAPHIC VALIDATION ---');
    const invalidLogin = await request({ method: 'POST', path: '/api/auth/login' }, { email: 'admin@school.local', password: 'wrong-password-999' });
    assert('Rejects invalid credentials with 401', invalidLogin.status === 401, 'Status: ' + invalidLogin.status);

    const validLogin = await request({ method: 'POST', path: '/api/auth/login' }, { email: 'developer@school.local', password: 'Developer2026!' });
    const devToken = validLogin.body?.token;
    assert('Developer authentication succeeds with valid signed JWT', validLogin.status === 200 && Boolean(devToken), 'Status: ' + validLogin.status);

    const forgedTokenRes = await request({
      method: 'GET',
      path: '/api/students',
      headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IkFETUlOIn0.tampered_signature' }
    });
    assert('Cryptographic signature verification rejects tampered JWT with 401', forgedTokenRes.status === 401, 'Status: ' + forgedTokenRes.status);

    const noTokenRes = await request({ method: 'GET', path: '/api/students' });
    assert('Protected endpoint rejects missing token with 401', noTokenRes.status === 401, 'Status: ' + noTokenRes.status);

    console.log('\n--- CATEGORY 3: CRITICAL EXPLOIT & DESTRUCTIVE OPERATION GUARDS ---');
    const cleanSlateUnauth = await request({ method: 'POST', path: '/api/developer/clean-slate' }, { wipe: true });
    assert('CRITICAL: /api/developer/clean-slate rejects unauthenticated requests with 403', cleanSlateUnauth.status === 403, 'Status: ' + cleanSlateUnauth.status);

    const backupUnauth = await request({ method: 'GET', path: '/api/developer/export-backup' });
    assert('CRITICAL: /api/developer/export-backup rejects unauthenticated requests with 403', backupUnauth.status === 403, 'Status: ' + backupUnauth.status);

    const clearCacheUnauth = await request({ method: 'POST', path: '/api/developer/clear-cache' });
    assert('POST /api/developer/clear-cache rejects unauthenticated requests with 403', clearCacheUnauth.status === 403, 'Status: ' + clearCacheUnauth.status);

    const cleanSlateMasterKey = await request({
      method: 'GET',
      path: '/api/developer/system-stats',
      headers: { 'x-developer-key': 'YOUSEF_MASTER_2026' }
    });
    assert('Authorized Developer Master Key accesses system-stats successfully', cleanSlateMasterKey.status === 200 && cleanSlateMasterKey.body?.ok === true, 'Status: ' + cleanSlateMasterKey.status);

    const pingDbAlias = await request({
      method: 'GET',
      path: '/api/developer/ping',
      headers: { 'x-developer-key': 'YOUSEF_MASTER_2026' }
    });
    assert('Developer ping alias (/api/developer/ping) responds with 200', pingDbAlias.status === 200 && pingDbAlias.body?.ok === true, 'Status: ' + pingDbAlias.status);

    console.log('\n--- CATEGORY 4: ROLE-BASED ACCESS CONTROL (RBAC) ---');
    const teacherToken = 'auth-token-teacher';
    const teacherUsersAccess = await request({
      method: 'GET',
      path: '/api/users',
      headers: { Authorization: 'Bearer ' + teacherToken }
    });
    assert('Teacher token CANNOT access User Management (/api/users) -> 403 Forbidden', teacherUsersAccess.status === 403, 'Status: ' + teacherUsersAccess.status);

    const teacherBranchStats = await request({
      method: 'GET',
      path: '/api/branches/stats',
      headers: { Authorization: 'Bearer ' + teacherToken }
    });
    assert('Teacher token CANNOT access Branch Statistics -> 403 Forbidden', teacherBranchStats.status === 403, 'Status: ' + teacherBranchStats.status);

    const teacherCleanSlate = await request({
      method: 'POST',
      path: '/api/developer/clean-slate',
      headers: { Authorization: 'Bearer ' + teacherToken }
    });
    assert('Teacher token CANNOT trigger clean-slate -> 403 Forbidden', teacherCleanSlate.status === 403, 'Status: ' + teacherCleanSlate.status);

    console.log('\n--- CATEGORY 5: BUG REGRESSION & FUNCTIONAL STABILITY ---');
    const studentQuery = await request({
      method: 'GET',
      path: `/api/students?page=1&limit=5&search=${encodeURIComponent('احمد')}&branchId=1`,
      headers: { Authorization: 'Bearer ' + devToken }
    });
    assert('Students query with branchId and search handles safely without crash', studentQuery.status === 200 && Array.isArray(studentQuery.body?.items), 'Status: ' + studentQuery.status);

    const dashboardQuery = await request({
      method: 'GET',
      path: '/api/dashboard',
      headers: { Authorization: 'Bearer ' + devToken }
    });
    assert('Dashboard stats query loads successfully', dashboardQuery.status === 200 && Boolean(dashboardQuery.body?.overview), 'Status: ' + dashboardQuery.status);

    const invalidStudent = await request({
      method: 'POST',
      path: '/api/students',
      headers: { Authorization: 'Bearer ' + devToken }
    }, { studentNumber: '' });
    assert('Schema validation returns 400 Bad Request with field errors for empty studentNumber', invalidStudent.status === 400, 'Status: ' + invalidStudent.status);

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    if (serverInstance) {
      serverInstance.close();
    }
    console.log('\n================================================================');
    console.log('🏁 TEST RESULTS: ' + passed + ' PASSED, ' + failed + ' FAILED');
    console.log('================================================================');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTestSuite();