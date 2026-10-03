const XLSX = require('xlsx');
const prisma = require('../utils/prisma');
const { logAudit } = require('../utils/auditLogger');

function parseStudentFile(fileBuffer) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return rawRows;
}

async function validateStudentRows(rawRows) {
  // Fetch existing student numbers and national IDs from database
  const existingStudents = await prisma.student.findMany({
    select: { studentNumber: true, nationalId: true }
  });
  const existingDbNumbers = new Set(existingStudents.map(s => s.studentNumber.toLowerCase()));
  const existingDbNationalIds = new Set(existingStudents.filter(s => s.nationalId).map(s => String(s.nationalId).trim()));

  const seenInFileNumbers = new Set();
  const seenInFileNationalIds = new Set();
  const validRows = [];
  const invalidRows = [];
  const duplicateRows = [];

  rawRows.forEach((row, index) => {
    const rowNum = index + 2; // header is row 1
    const errors = [];

    const studentNumber = String(row.studentNumber || '').trim();
    const nationalId = String(row.nationalId || row['رقم الهوية'] || row['الهوية'] || '').trim();
    const firstName = String(row.firstName || row['الاسم الأول'] || '').trim();
    const middleName = String(row.middleName || row['اسم الأب'] || '').trim() || null;
    const lastName = String(row.lastName || row['العائلة'] || row['اسم العائلة'] || '').trim();
    let gender = String(row.gender || row['الجنس'] || '').trim().toUpperCase() || null;
    const phone = String(row.phone || row['الهاتف'] || '').trim() || null;
    const parentName = String(row.parentName || row['ولي الأمر'] || '').trim() || null;
    const parentPhone = String(row.parentPhone || row['هاتف ولي الأمر'] || '').trim() || null;
    const address = String(row.address || row['العنوان'] || '').trim() || null;
    let dateOfBirth = null;

    if (!studentNumber) errors.push('Missing Student Number');
    if (!firstName) errors.push('Missing First Name');
    if (!lastName) errors.push('Missing Last Name');

    // Validate 9-digit Palestinian National ID
    let isDuplicate = false;
    if (nationalId) {
      if (!/^\d{9}$/.test(nationalId)) {
        errors.push(`رقم الهوية "${nationalId}" غير صحيح - يجب أن يتكون من 9 أرقام بالضبط`);
      } else if (existingDbNationalIds.has(nationalId)) {
        errors.push(`رقم الهوية (${nationalId}) مسجل مسبقاً في النظام لطالب آخر`);
        isDuplicate = true;
      } else if (seenInFileNationalIds.has(nationalId)) {
        errors.push(`رقم الهوية (${nationalId}) مكرر داخل هذا الملف`);
        isDuplicate = true;
      } else {
        seenInFileNationalIds.add(nationalId);
      }
    }

    if (gender && !['MALE', 'FEMALE', 'OTHER'].includes(gender)) {
      if (gender === 'ذكر') gender = 'MALE';
      else if (gender === 'أنثى' || gender === 'انثى') gender = 'FEMALE';
      else {
        errors.push(`Invalid Gender "${row.gender}". Expected MALE, FEMALE, or OTHER`);
        gender = null;
      }
    }

    if (row.dateOfBirth) {
      const parsedDate = new Date(row.dateOfBirth);
      if (isNaN(parsedDate.getTime())) {
        errors.push(`Invalid Date of Birth "${row.dateOfBirth}"`);
      } else {
        dateOfBirth = parsedDate;
      }
    }

    const lowerNum = studentNumber.toLowerCase();

    if (studentNumber) {
      if (existingDbNumbers.has(lowerNum)) {
        errors.push('Student number already exists in database');
        isDuplicate = true;
      } else if (seenInFileNumbers.has(lowerNum)) {
        errors.push('Duplicate student number within this file');
        isDuplicate = true;
      } else {
        seenInFileNumbers.add(lowerNum);
      }
    }

    const processedRow = {
      rowNum,
      studentNumber,
      nationalId: nationalId || null,
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().slice(0, 10) : '',
      phone,
      parentName,
      parentPhone,
      address,
      errors
    };

    if (isDuplicate) {
      duplicateRows.push(processedRow);
    } else if (errors.length > 0) {
      invalidRows.push(processedRow);
    } else {
      validRows.push(processedRow);
    }
  });

  return {
    totalRows: rawRows.length,
    validCount: validRows.length,
    invalidCount: invalidRows.length,
    duplicateCount: duplicateRows.length,
    validRows,
    invalidRows,
    duplicateRows
  };
}

async function importValidatedStudents(validRows, user, req) {
  let createdCount = 0;
  const errors = [];

  let branchId = null;
  if (user?.branchId) {
    branchId = user.branchId;
  } else {
    const defaultBranch = await prisma.branch.findFirst({ orderBy: { id: 'asc' } });
    branchId = defaultBranch ? defaultBranch.id : null;
  }

  for (const row of validRows) {
    try {
      await prisma.student.create({
        data: {
          studentNumber: row.studentNumber,
          nationalId: row.nationalId || null,
          branchId: branchId,
          firstName: row.firstName,
          middleName: row.middleName || null,
          lastName: row.lastName,
          gender: row.gender || null,
          dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : null,
          phone: row.phone || null,
          parentName: row.parentName || null,
          parentPhone: row.parentPhone || null,
          address: row.address || null,
          status: 'ACTIVE'
        }
      });
      createdCount++;
    } catch (e) {
      errors.push({ studentNumber: row.studentNumber, error: e.message });
    }
  }

  await logAudit({
    userId: user?.id,
    action: 'IMPORT_STUDENTS_EXCEL',
    entity: 'Student',
    metadata: { createdCount, failedCount: errors.length },
    req
  });

  return {
    success: true,
    createdCount,
    failedCount: errors.length,
    errors
  };
}

function generateExcelBuffer(sheetData, sheetName = 'Sheet1') {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

function generateMultiSheetExcelBuffer(sheets = []) {
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ name, data }) => {
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31)); // Excel max sheet name is 31 chars
  });
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

module.exports = {
  parseStudentFile,
  validateStudentRows,
  importValidatedStudents,
  generateExcelBuffer,
  generateMultiSheetExcelBuffer
};
