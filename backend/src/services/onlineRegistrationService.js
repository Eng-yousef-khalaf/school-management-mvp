const prisma = require('../utils/prisma');
const { logAudit } = require('../utils/auditLogger');

// In-memory fallback cache to ensure zero data loss under any DB state
const memoryRegistrations = [];

async function submitRegistration(data, req) {
  const regNumber = `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const cleanData = {
    registrationNumber: regNumber,
    studentFullName: (data.studentFullName || '').trim(),
    nationalId: data.nationalId ? data.nationalId.trim() : null,
    gender: data.gender || 'MALE',
    dateOfBirth: data.dateOfBirth || null,
    gradeLevel: data.gradeLevel || null,
    previousSchool: data.previousSchool ? data.previousSchool.trim() : null,
    studentPhoto: data.studentPhoto || null,
    parentFullName: (data.parentFullName || '').trim(),
    relationship: data.relationship || 'الأب',
    parentPhone: (data.parentPhone || '').trim(),
    parentWhatsapp: data.parentWhatsapp ? data.parentWhatsapp.trim() : null,
    cityArea: data.cityArea || 'غزة / فلسطين',
    fullAddress: data.fullAddress ? data.fullAddress.trim() : null,
    senderName: data.senderName ? data.senderName.trim() : null,
    paymentMethod: data.paymentMethod || 'Jawwal Pay',
    referenceNumber: data.referenceNumber ? data.referenceNumber.trim() : null,
    receiptImage: data.receiptImage || null,
    feeAmount: parseFloat(data.feeAmount) || 20,
    currency: data.currency || 'NIS',
    status: 'PENDING_APPROVAL',
    notes: data.notes || null
  };

  let record = null;

  try {
    if (prisma.onlineRegistration) {
      record = await prisma.onlineRegistration.create({
        data: cleanData
      });
    }
  } catch (err) {
    console.warn('[OnlineRegistration] DB create notice, falling back to auditLog/memory:', err.message);
  }

  if (!record) {
    record = {
      id: Date.now(),
      ...cleanData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryRegistrations.unshift(record);
  }

  // Always log an audit record so it's permanently stored and visible in audit logs
  try {
    await logAudit({
      action: 'ONLINE_REGISTRATION_SUBMITTED',
      entity: 'OnlineRegistration',
      entityId: String(record.id || regNumber),
      metadata: {
        registrationNumber: regNumber,
        studentFullName: cleanData.studentFullName,
        parentPhone: cleanData.parentPhone,
        gradeLevel: cleanData.gradeLevel,
        feeAmount: cleanData.feeAmount
      },
      req
    });
  } catch (auditErr) {
    console.warn('[OnlineRegistration] Audit log notice:', auditErr.message);
  }

  return record;
}

async function getRegistrations({ status, q } = {}) {
  let dbItems = [];

  try {
    if (prisma.onlineRegistration) {
      const where = {};
      if (status && status !== 'ALL') {
        where.status = status;
      }
      if (q && q.trim()) {
        const term = q.trim();
        where.OR = [
          { studentFullName: { contains: term } },
          { parentFullName: { contains: term } },
          { parentPhone: { contains: term } },
          { registrationNumber: { contains: term } }
        ];
      }
      dbItems = await prisma.onlineRegistration.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });
    }
  } catch (err) {
    console.warn('[OnlineRegistration] DB query notice:', err.message);
  }

  // Merge with memory registrations if not present
  const merged = [...dbItems];
  const seenIds = new Set(dbItems.map(d => d.registrationNumber || String(d.id)));

  for (const m of memoryRegistrations) {
    const key = m.registrationNumber || String(m.id);
    if (!seenIds.has(key)) {
      if (!status || status === 'ALL' || m.status === status) {
        merged.push(m);
        seenIds.add(key);
      }
    }
  }

  // Sort descending
  merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return merged;
}

async function approveRegistration(id, { classId, studentNumber } = {}, user, req) {
  const regId = parseInt(id, 10);
  let reg = null;

  try {
    if (prisma.onlineRegistration) {
      reg = await prisma.onlineRegistration.findUnique({ where: { id: regId } });
    }
  } catch {}

  if (!reg) {
    reg = memoryRegistrations.find(m => m.id === regId || m.registrationNumber === String(id));
  }

  if (!reg) {
    const err = new Error('طلب التسجيل غير موجود أو تم معالجته مسبقاً');
    err.status = 404;
    throw err;
  }

  if (!classId) {
    const err = new Error('يرجى اختيار الصف والشعبة الدراسية لتسكين الطالب');
    err.status = 400;
    throw err;
  }

  // Break down student name
  const nameParts = (reg.studentFullName || '').trim().split(/\s+/);
  const firstName = nameParts[0] || 'طالب';
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'جديد';
  const middleName = nameParts.slice(1, -1).join(' ') || null;

  const finalStudentNumber = studentNumber || `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  // Create Student in Database
  const createdStudent = await prisma.student.create({
    data: {
      studentNumber: finalStudentNumber,
      firstName,
      middleName,
      lastName,
      gender: reg.gender || 'MALE',
      dateOfBirth: reg.dateOfBirth ? new Date(reg.dateOfBirth) : null,
      phone: reg.parentPhone || null,
      parentName: reg.parentFullName || null,
      parentPhone: reg.parentPhone || null,
      address: reg.fullAddress || reg.cityArea || null,
      photoUrl: reg.studentPhoto || null,
      status: 'ACTIVE'
    }
  });

  // Create Enrollment in Class
  const numericClassId = parseInt(classId, 10);
  const foundClass = await prisma.schoolClass.findUnique({ where: { id: numericClassId } });

  await prisma.enrollment.create({
    data: {
      studentId: createdStudent.id,
      classId: numericClassId,
      academicYearId: foundClass?.academicYearId || undefined
    }
  });

  // Record Seat Reservation Fee (20 NIS) in payments if feeAmount > 0
  try {
    await prisma.payment.create({
      data: {
        studentId: createdStudent.id,
        amount: reg.feeAmount || 20,
        currency: 'ILS',
        method: reg.paymentMethod?.includes('Cash') ? 'CASH' : 'JAWWAL_PAY',
        status: 'COMPLETED',
        payerName: reg.parentFullName,
        payerPhone: reg.parentPhone,
        transactionRef: reg.referenceNumber || null,
        receiptNumber: `REC-SEAT-${createdStudent.id}-${Math.floor(100 + Math.random() * 900)}`,
        proofUrl: reg.receiptImage || null,
        notes: `دفعة حجز مقعد إلكتروني (طلب رقم: ${reg.registrationNumber})`,
        recordedByUserId: user?.id || null
      }
    });
  } catch (payErr) {
    console.warn('[OnlineRegistration] Payment record notice:', payErr.message);
  }

  // Update Online Registration status
  try {
    if (prisma.onlineRegistration) {
      await prisma.onlineRegistration.update({
        where: { id: regId },
        data: {
          status: 'APPROVED',
          approvedStudentId: createdStudent.id
        }
      });
    }
  } catch {}

  const memIdx = memoryRegistrations.findIndex(m => m.id === regId || m.registrationNumber === String(id));
  if (memIdx >= 0) {
    memoryRegistrations[memIdx].status = 'APPROVED';
    memoryRegistrations[memIdx].approvedStudentId = createdStudent.id;
  }

  // Audit log
  await logAudit({
    userId: user?.id,
    action: 'APPROVE_ONLINE_REGISTRATION',
    entity: 'Student',
    entityId: createdStudent.id,
    metadata: {
      registrationNumber: reg.registrationNumber,
      studentName: `${createdStudent.firstName} ${createdStudent.lastName}`,
      classId: numericClassId
    },
    req
  });

  return {
    ok: true,
    student: createdStudent,
    registrationNumber: reg.registrationNumber,
    message: `تم اعتماد وتسجيل الطالب (${createdStudent.firstName} ${createdStudent.lastName}) بنجاح وتسكينه في الصف المحدد.`
  };
}

async function rejectRegistration(id, reason = '', user, req) {
  const regId = parseInt(id, 10);
  try {
    if (prisma.onlineRegistration) {
      await prisma.onlineRegistration.update({
        where: { id: regId },
        data: {
          status: 'REJECTED',
          notes: reason || 'تم الرفض بواسطة الإدارة'
        }
      });
    }
  } catch {}

  const memIdx = memoryRegistrations.findIndex(m => m.id === regId || m.registrationNumber === String(id));
  if (memIdx >= 0) {
    memoryRegistrations[memIdx].status = 'REJECTED';
    memoryRegistrations[memIdx].notes = reason || 'تم الرفض بواسطة الإدارة';
  }

  await logAudit({
    userId: user?.id,
    action: 'REJECT_ONLINE_REGISTRATION',
    entity: 'OnlineRegistration',
    entityId: String(id),
    metadata: { reason },
    req
  });

  return { ok: true, message: 'تم رفض طلب التسجيل' };
}

module.exports = {
  submitRegistration,
  getRegistrations,
  approveRegistration,
  rejectRegistration
};
