const prisma = require('../utils/prisma');
const { logAudit } = require('../utils/auditLogger');

function generateReceiptNumber() {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `GZ-REC-${year}-${randomDigits}`;
}

async function getFinancialSummary(academicYearId) {
  try {
    const where = academicYearId ? { academicYearId: parseInt(academicYearId, 10) } : {};
    
    // Fetch all active student fees
    const fees = await prisma.studentFee.findMany({
      where,
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, status: true }
        }
      }
    });

    const payments = await prisma.payment.findMany({
      where: { status: 'COMPLETED' },
      select: { amount: true, method: true, createdAt: true }
    });

    let totalExpected = 0;
    let totalDiscount = 0;
    let totalCollected = 0;
    let countPaid = 0;
    let countPartial = 0;
    let countUnpaid = 0;
    let countOverdue = 0;

    fees.forEach(f => {
      const netRequired = Math.max(0, f.totalAmount - f.discountAmount);
      totalExpected += netRequired;
      totalDiscount += f.discountAmount;
      totalCollected += f.paidAmount;

      if (f.status === 'PAID' || f.paidAmount >= netRequired) countPaid++;
      else if (f.status === 'OVERDUE') countOverdue++;
      else if (f.paidAmount > 0) countPartial++;
      else countUnpaid++;
    });

    const totalOutstanding = Math.max(0, totalExpected - totalCollected);
    const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

    // Method breakdown
    const methodBreakdown = {
      CASH: 0,
      BANK_OF_PALESTINE: 0,
      JAWWAL_PAY: 0,
      PALPAY: 0,
      SPONSOR_GRANT: 0
    };

    payments.forEach(p => {
      if (methodBreakdown[p.method] !== undefined) {
        methodBreakdown[p.method] += p.amount;
      }
    });

    return {
      totalExpected,
      totalDiscount,
      totalCollected,
      totalOutstanding,
      collectionRate,
      studentCounts: {
        total: fees.length,
        paid: countPaid,
        partial: countPartial,
        unpaid: countUnpaid,
        overdue: countOverdue
      },
      methodBreakdown
    };
  } catch (err) {
    console.error('Failed to calculate financial summary:', err.message);
    return {
      totalExpected: 0,
      totalDiscount: 0,
      totalCollected: 0,
      totalOutstanding: 0,
      collectionRate: 0,
      studentCounts: { total: 0, paid: 0, partial: 0, unpaid: 0, overdue: 0 },
      methodBreakdown: { CASH: 0, BANK_OF_PALESTINE: 0, JAWWAL_PAY: 0, PALPAY: 0, SPONSOR_GRANT: 0 }
    };
  }
}

async function getAllStudentFees({ classId, status, search, page = 1, limit = 50 } = {}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * take;

  const studentWhere = { status: 'ACTIVE' };
  
  if (search) {
    studentWhere.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { studentNumber: { contains: search, mode: 'insensitive' } },
      { parentPhone: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (classId && classId !== 'ALL') {
    studentWhere.enrollments = {
      some: { classId: parseInt(classId, 10) }
    };
  }

  const [total, students] = await Promise.all([
    prisma.student.count({ where: studentWhere }),
    prisma.student.findMany({
      where: studentWhere,
      skip,
      take,
      orderBy: { lastName: 'asc' },
      include: {
        enrollments: {
          include: { class: true }
        },
        fees: {
          include: {
            payments: {
              orderBy: { createdAt: 'desc' }
            }
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })
  ]);

  const defaultTuition = 1500; // 1500 ILS standard annual tuition

  const items = students.map(st => {
    const currentClass = st.enrollments[0]?.class || null;
    const feeRecord = st.fees[0] || null;

    const totalAmount = feeRecord?.totalAmount || defaultTuition;
    const discountAmount = feeRecord?.discountAmount || 0;
    const paidAmount = feeRecord?.paidAmount || st.payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0);
    const balanceDue = Math.max(0, totalAmount - discountAmount - paidAmount);

    let calculatedStatus = 'UNPAID';
    if (paidAmount >= (totalAmount - discountAmount) && totalAmount > 0) {
      calculatedStatus = 'PAID';
    } else if (paidAmount > 0) {
      calculatedStatus = 'PARTIAL';
    }

    if (feeRecord?.dueDate && new Date(feeRecord.dueDate) < new Date() && balanceDue > 0) {
      calculatedStatus = 'OVERDUE';
    }

    return {
      studentId: st.id,
      studentNumber: st.studentNumber,
      fullName: `${st.firstName} ${st.middleName ? st.middleName + ' ' : ''}${st.lastName}`,
      className: currentClass?.name || 'غير مسكن',
      classId: currentClass?.id || null,
      parentName: st.parentName || 'غير مسجل',
      parentPhone: st.parentPhone || '',
      feeId: feeRecord?.id || null,
      totalAmount,
      discountAmount,
      paidAmount,
      balanceDue,
      currency: feeRecord?.currency || 'ILS',
      status: feeRecord?.status || calculatedStatus,
      dueDate: feeRecord?.dueDate ? feeRecord.dueDate.toISOString().slice(0, 10) : null,
      recentPaymentsCount: st.payments.length,
      lastPaymentDate: st.payments[0]?.createdAt ? st.payments[0].createdAt.toISOString().slice(0, 10) : null
    };
  });

  // Filter by status if requested
  const filteredItems = status && status !== 'ALL'
    ? items.filter(it => it.status === status)
    : items;

  const summary = await getFinancialSummary();

  return {
    items: filteredItems,
    summary,
    pagination: {
      total,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take) || 1
    }
  };
}

async function getStudentFeeDetails(studentId) {
  const sId = parseInt(studentId, 10);
  const student = await prisma.student.findUnique({
    where: { id: sId },
    include: {
      enrollments: { include: { class: true } },
      fees: { include: { academicYear: true } },
      payments: {
        orderBy: { createdAt: 'desc' },
        include: { recordedByUser: { select: { fullName: true, role: true } } }
      }
    }
  });

  if (!student) throw new Error('Student not found');

  const feeRecord = student.fees[0] || null;
  const totalAmount = feeRecord?.totalAmount || 1500;
  const discountAmount = feeRecord?.discountAmount || 0;
  const paidAmount = student.payments.filter(p => p.status === 'COMPLETED').reduce((acc, p) => acc + p.amount, 0);
  const balanceDue = Math.max(0, totalAmount - discountAmount - paidAmount);

  return {
    student: {
      id: student.id,
      studentNumber: student.studentNumber,
      fullName: `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`,
      className: student.enrollments[0]?.class?.name || 'غير مسكن',
      parentName: student.parentName,
      parentPhone: student.parentPhone
    },
    fee: {
      id: feeRecord?.id || null,
      totalAmount,
      discountAmount,
      paidAmount,
      balanceDue,
      currency: feeRecord?.currency || 'ILS',
      status: balanceDue === 0 ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'UNPAID',
      dueDate: feeRecord?.dueDate || null,
      notes: feeRecord?.notes || ''
    },
    payments: student.payments.map(p => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      method: p.method,
      status: p.status,
      receiptNumber: p.receiptNumber,
      payerName: p.payerName,
      payerRelationship: p.payerRelationship,
      payerPhone: p.payerPhone,
      transactionRef: p.transactionRef,
      recordedBy: p.recordedByUser?.fullName || 'النظام',
      date: p.createdAt.toISOString().slice(0, 10),
      createdAt: p.createdAt,
      notes: p.notes
    }))
  };
}

async function recordPayment({
  studentId,
  amount,
  currency = 'ILS',
  method = 'CASH',
  payerName,
  payerRelationship = 'FATHER',
  payerPhone,
  transactionRef,
  notes,
  status = 'COMPLETED'
}, user, req) {
  const sId = parseInt(studentId, 10);
  const numAmount = Math.max(0, parseFloat(amount) || 0);

  if (!sId || numAmount <= 0) {
    throw new Error('Valid student and payment amount are required');
  }

  const receiptNumber = generateReceiptNumber();

  // 1. Get or create active academic year
  const activeYear = await prisma.academicYear.findFirst({ where: { active: true } });

  // 2. Upsert StudentFee
  let fee = await prisma.studentFee.findFirst({
    where: { studentId: sId, academicYearId: activeYear?.id || null }
  });

  if (!fee) {
    fee = await prisma.studentFee.create({
      data: {
        studentId: sId,
        academicYearId: activeYear?.id || null,
        totalAmount: 1500,
        discountAmount: 0,
        paidAmount: 0,
        currency,
        status: 'UNPAID'
      }
    });
  }

  // 3. Create Payment record
  const payment = await prisma.payment.create({
    data: {
      studentId: sId,
      studentFeeId: fee.id,
      amount: numAmount,
      currency,
      method,
      status,
      payerName: payerName ? String(payerName).trim() : null,
      payerRelationship,
      payerPhone: payerPhone ? String(payerPhone).trim() : null,
      transactionRef: transactionRef ? String(transactionRef).trim() : null,
      receiptNumber,
      notes: notes ? String(notes).trim() : null,
      recordedByUserId: user?.id || null
    }
  });

  // 4. Update StudentFee paidAmount and status if payment is completed
  if (status === 'COMPLETED') {
    const newPaidAmount = fee.paidAmount + numAmount;
    const netTotal = Math.max(0, fee.totalAmount - fee.discountAmount);
    let newStatus = 'PARTIAL';
    if (newPaidAmount >= netTotal) newStatus = 'PAID';
    else if (newPaidAmount === 0) newStatus = 'UNPAID';

    await prisma.studentFee.update({
      where: { id: fee.id },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus
      }
    });
  }

  // 5. Audit Log
  await logAudit({
    userId: user?.id,
    action: 'RECORD_PAYMENT',
    entity: 'Payment',
    entityId: payment.id,
    metadata: {
      studentId: sId,
      amount: numAmount,
      method,
      receiptNumber,
      payer: payerName
    },
    req
  });

  return {
    ok: true,
    payment,
    receiptNumber
  };
}

async function getFeeAlerts() {
  const students = await prisma.student.findMany({
    where: { status: 'ACTIVE' },
    include: {
      enrollments: { include: { class: true } },
      fees: true,
      payments: true
    }
  });

  const alerts = [];
  const now = new Date();

  students.forEach(st => {
    const fee = st.fees[0] || null;
    const total = fee?.totalAmount || 1500;
    const discount = fee?.discountAmount || 0;
    const paid = st.payments.filter(p => p.status === 'COMPLETED').reduce((acc, p) => acc + p.amount, 0);
    const balance = Math.max(0, total - discount - paid);

    if (balance > 0) {
      const isOverdue = fee?.dueDate && new Date(fee.dueDate) < now;
      alerts.push({
        studentId: st.id,
        studentNumber: st.studentNumber,
        studentName: `${st.firstName} ${st.lastName}`,
        className: st.enrollments[0]?.class?.name || 'غير مسكن',
        parentName: st.parentName || 'ولي الأمر',
        parentPhone: st.parentPhone || '',
        balanceDue: balance,
        paidAmount: paid,
        totalAmount: total,
        isOverdue: Boolean(isOverdue),
        dueDate: fee?.dueDate ? fee.dueDate.toISOString().slice(0, 10) : null
      });
    }
  });

  return {
    count: alerts.length,
    overdueCount: alerts.filter(a => a.isOverdue).length,
    alerts: alerts.slice(0, 30) // top 30 pending alerts
  };
}

async function submitParentNotice({
  studentId,
  studentNumber,
  amount,
  currency = 'ILS',
  method = 'BANK_OF_PALESTINE',
  payerName,
  payerRelationship = 'FATHER',
  payerPhone,
  transactionRef,
  notes
}) {
  const numAmount = Math.max(0, parseFloat(amount) || 0);
  if (numAmount <= 0) {
    throw new Error('Valid payment amount is required');
  }

  // Find student by ID or studentNumber
  let student = null;
  if (studentId) {
    student = await prisma.student.findUnique({ where: { id: parseInt(studentId, 10) } });
  }
  if (!student && studentNumber) {
    student = await prisma.student.findFirst({ where: { studentNumber: String(studentNumber).trim() } });
  }

  const sId = student?.id || 1;
  const activeYear = await prisma.academicYear.findFirst({ where: { active: true } });

  let fee = await prisma.studentFee.findFirst({
    where: { studentId: sId, academicYearId: activeYear?.id || null }
  });

  if (!fee) {
    fee = await prisma.studentFee.create({
      data: {
        studentId: sId,
        academicYearId: activeYear?.id || null,
        totalAmount: 1500,
        discountAmount: 0,
        paidAmount: 0,
        currency,
        status: 'UNPAID'
      }
    });
  }

  const payment = await prisma.payment.create({
    data: {
      studentId: sId,
      studentFeeId: fee.id,
      amount: numAmount,
      currency,
      method,
      status: 'PENDING',
      payerName: payerName ? String(payerName).trim() : 'ولي الأمر',
      payerRelationship,
      payerPhone: payerPhone ? String(payerPhone).trim() : null,
      transactionRef: transactionRef ? String(transactionRef).trim() : null,
      receiptNumber: null, // Assigned upon Staff approval
      notes: notes ? String(notes).trim() : 'إشعار تحويل إلكتروني قيد مراجعة واعتماد شؤون الطلاب (Staff)'
    }
  });

  return {
    ok: true,
    payment: {
      ...payment,
      studentName: student ? `${student.firstName} ${student.lastName}` : 'طالب المدرسة',
      studentNumber: student?.studentNumber || studentNumber
    },
    message: 'Payment notice received and is pending staff approval'
  };
}

async function getPendingNotices() {
  const pendingPayments = await prisma.payment.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    include: {
      student: {
        select: {
          id: true,
          studentNumber: true,
          firstName: true,
          lastName: true,
          parentName: true,
          parentPhone: true,
          enrollments: { include: { class: true } }
        }
      }
    }
  });

  return pendingPayments.map(p => ({
    id: p.id,
    studentId: p.studentId,
    studentNumber: p.student?.studentNumber || 'STU-000',
    studentName: p.student ? `${p.student.firstName} ${p.student.lastName}` : 'طالب غير محدد',
    className: p.student?.enrollments[0]?.class?.name || 'الصف السابع أ',
    amount: p.amount,
    currency: p.currency,
    method: p.method,
    payerName: p.payerName || p.student?.parentName || 'ولي الأمر',
    payerRelationship: p.payerRelationship || 'FATHER',
    payerPhone: p.payerPhone || p.student?.parentPhone || '',
    transactionRef: p.transactionRef,
    receiptNumber: p.receiptNumber,
    notes: p.notes,
    status: p.status,
    createdAt: p.createdAt,
    date: p.createdAt.toISOString().slice(0, 10)
  }));
}

async function approvePayment(paymentId, user, req) {
  const pId = parseInt(paymentId, 10);
  const payment = await prisma.payment.findUnique({
    where: { id: pId },
    include: { studentFee: true, student: true }
  });

  if (!payment) throw new Error('Payment notice not found');
  if (payment.status === 'COMPLETED') throw new Error('Payment already approved');

  const receiptNumber = generateReceiptNumber();

  // 1. Update Payment status to COMPLETED and assign official receiptNumber
  const updatedPayment = await prisma.payment.update({
    where: { id: pId },
    data: {
      status: 'COMPLETED',
      receiptNumber,
      recordedByUserId: user?.id || null
    }
  });

  // 2. Update StudentFee paidAmount and recalculate status
  let fee = payment.studentFee;
  if (!fee && payment.studentId) {
    const activeYear = await prisma.academicYear.findFirst({ where: { active: true } });
    fee = await prisma.studentFee.findFirst({
      where: { studentId: payment.studentId, academicYearId: activeYear?.id || null }
    });
  }

  if (fee) {
    const newPaidAmount = (fee.paidAmount || 0) + payment.amount;
    const netTotal = Math.max(0, fee.totalAmount - fee.discountAmount);
    let newStatus = 'PARTIAL';
    if (newPaidAmount >= netTotal) newStatus = 'PAID';
    else if (newPaidAmount === 0) newStatus = 'UNPAID';

    await prisma.studentFee.update({
      where: { id: fee.id },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus
      }
    });
  }

  // 3. Audit Log
  await logAudit({
    userId: user?.id,
    action: 'APPROVE_PAYMENT',
    entity: 'Payment',
    entityId: payment.id,
    metadata: {
      studentId: payment.studentId,
      amount: payment.amount,
      method: payment.method,
      receiptNumber,
      approvedBy: user?.fullName || 'موظف شؤون الطلاب (Staff)'
    },
    req
  });

  return {
    ok: true,
    payment: {
      ...updatedPayment,
      studentName: payment.student ? `${payment.student.firstName} ${payment.student.lastName}` : '',
      studentNumber: payment.student?.studentNumber || '',
      recordedBy: user?.fullName || 'محمد (موظف Staff)'
    },
    receiptNumber,
    message: 'Payment approved and official receipt issued successfully'
  };
}

async function rejectPayment(paymentId, { reason } = {}, user, req) {
  const pId = parseInt(paymentId, 10);
  const payment = await prisma.payment.findUnique({ where: { id: pId } });
  if (!payment) throw new Error('Payment notice not found');

  const updatedPayment = await prisma.payment.update({
    where: { id: pId },
    data: {
      status: 'REJECTED',
      notes: `${payment.notes ? payment.notes + ' | ' : ''}تم الرفض من شؤون الطلاب: ${reason || 'بيانات الحوالة غير متطابقة'}`
    }
  });

  await logAudit({
    userId: user?.id,
    action: 'REJECT_PAYMENT',
    entity: 'Payment',
    entityId: pId,
    metadata: { reason },
    req
  });

  return {
    ok: true,
    payment: updatedPayment,
    message: 'Payment notice rejected'
  };
}

async function lookupStudentPublic(query) {
  if (!query) return { items: [] };
  const students = await prisma.student.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { studentNumber: { contains: query, mode: 'insensitive' } }
      ]
    },
    take: 5,
    include: {
      enrollments: { include: { class: true } },
      fees: true,
      payments: { where: { status: 'COMPLETED' } }
    }
  });

  return {
    items: students.map(s => {
      const fee = s.fees[0] || null;
      const total = fee?.totalAmount || 1500;
      const discount = fee?.discountAmount || 0;
      const paid = s.payments.reduce((acc, p) => acc + p.amount, 0);
      const remaining = Math.max(0, total - discount - paid);

      return {
        id: s.id,
        studentNumber: s.studentNumber,
        fullName: `${s.firstName} ${s.lastName}`,
        firstName: s.firstName,
        lastName: s.lastName,
        currentClass: s.enrollments[0]?.class?.name || 'الصف السابع',
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        totalAmount: total,
        paidAmount: paid,
        remainingBalance: remaining
      };
    })
  };
}

module.exports = {
  getAllStudentFees,
  getStudentFeeDetails,
  recordPayment,
  getFinancialSummary,
  getFeeAlerts,
  submitParentNotice,
  getPendingNotices,
  approvePayment,
  rejectPayment,
  lookupStudentPublic
};
