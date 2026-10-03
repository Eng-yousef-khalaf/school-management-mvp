const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, '..', '..', 'prisma', 'developer_settings.json');

const DEFAULT_SETTINGS = {
  branding: {
    schoolNameAr: 'روضة ومدرسة مجموعة السلام التعليمية الخاصة',
    schoolNameEn: 'Al-Salam Educational Group Private School & Kindergarten',
    schoolSloganAr: 'البيئة التعليمية النموذجية الأولى في فلسطين - خبرة 25 عاماً من الإبداع والتميز',
    schoolSloganEn: "Palestine's Premier Model Educational Environment - 25 Years of Excellence",
    schoolCode: 'SCH-ALSALAM-2026',
    logoUrl: '/school-logo.png',
    primaryColor: '#166534',
    primaryHover: '#14532d',
    primaryLight: '#dcfce7',
    primaryDark: '#052e16',
    accentColor: '#f59e0b',
    allocatedStorageMb: 500,
    supportEmail: 'info@alsalam-school.edu.ps',
    supportPhone: '+970 59 312 4444'
  },
  statsHistory: [
    {
      id: 'initial-demo-snapshot',
      timestamp: '2026-10-01T12:00:00.000Z',
      label: 'النسخة التجريبية الأولية قبل الإفراغ والتسليم',
      studentsCount: 120,
      teachersCount: 14,
      classesCount: 8,
      attendanceCount: 450,
      gradesCount: 320,
      feesCount: 120,
      paymentsCount: 85,
      auditLogsCount: 230,
      storageUsedMb: 1.45,
      note: 'بيانات المحاكاة والتدريب التجريبية السابقة قبل التسليم الرسمي للمدير العام'
    }
  ],
  handover: {
    isHandedOver: false,
    handoverDate: null,
    principalName: 'أ. عبد الرحمن خليل (المدير العام)',
    principalEmail: 'admin@school.local',
    principalPhone: '+970 59 312 4444'
  }
};

function readSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Error reading developer_settings.json:', err.message);
  }
  return { ...DEFAULT_SETTINGS };
}

function writeSettings(newSettings) {
  try {
    const current = readSettings();
    const merged = { ...current, ...newSettings };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2), 'utf8');
    return merged;
  } catch (err) {
    console.error('Error writing developer_settings.json:', err.message);
    return null;
  }
}

function saveStatsSnapshot(snapshot) {
  const current = readSettings();
  const history = current.statsHistory || [];
  const entry = {
    id: `snapshot-${Date.now()}`,
    timestamp: new Date().toISOString(),
    label: snapshot.label || 'لقطة إحصائية محفوظة',
    studentsCount: snapshot.studentsCount || 0,
    teachersCount: snapshot.teachersCount || 0,
    classesCount: snapshot.classesCount || 0,
    attendanceCount: snapshot.attendanceCount || 0,
    gradesCount: snapshot.gradesCount || 0,
    feesCount: snapshot.feesCount || 0,
    paymentsCount: snapshot.paymentsCount || 0,
    auditLogsCount: snapshot.auditLogsCount || 0,
    storageUsedMb: snapshot.storageUsedMb || 0,
    note: snapshot.note || ''
  };
  history.unshift(entry);
  if (history.length > 20) history.pop();
  writeSettings({ statsHistory: history });
  return entry;
}

module.exports = {
  readSettings,
  writeSettings,
  saveStatsSnapshot
};
