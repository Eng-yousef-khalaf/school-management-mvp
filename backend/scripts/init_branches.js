const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Initializing Branches & Linking Existing Records ---');
  
  // 1. Ensure Main Branch exists
  let mainBranch = await prisma.branch.findFirst({
    where: { code: 'BR-GAZA-01' }
  });

  if (!mainBranch) {
    mainBranch = await prisma.branch.create({
      data: {
        name: 'فرع غزة الرئيسي (النصر)',
        code: 'BR-GAZA-01',
        city: 'غزة',
        address: 'شارع النصر - بجوار مجمع المدارس',
        phone: '+970 8 288 1234',
        principalName: 'أ. عبد الرحمن خليل (المدير العام)',
        active: true
      }
    });
    console.log('Created Main Branch:', mainBranch.name);
  } else {
    console.log('Found existing Main Branch:', mainBranch.name);
  }

  // Also create a second branch for demonstration (e.g. فرع دير البلح) if only 1 branch exists
  const totalBranches = await prisma.branch.count();
  if (totalBranches === 1) {
    const deirBranch = await prisma.branch.create({
      data: {
        name: 'فرع دير البلح النموذجي',
        code: 'BR-DEIR-01',
        city: 'دير البلح',
        address: 'دير البلح - شارع النخيل الرئيسي',
        phone: '+970 8 255 5678',
        principalName: 'أ. محمود حمدان (مدير فرع دير البلح)',
        active: true
      }
    });
    console.log('Created Demo Branch:', deirBranch.name);
  }

  // 2. Link existing Students without branch to mainBranch
  const updatedStudents = await prisma.student.updateMany({
    where: { branchId: null },
    data: { branchId: mainBranch.id }
  });
  console.log(`Linked ${updatedStudents.count} existing students to Main Branch.`);

  // 3. Link existing Teachers without branch to mainBranch
  const updatedTeachers = await prisma.teacher.updateMany({
    where: { branchId: null },
    data: { branchId: mainBranch.id }
  });
  console.log(`Linked ${updatedTeachers.count} existing teachers to Main Branch.`);

  // 4. Link existing Classes without branch to mainBranch
  const updatedClasses = await prisma.schoolClass.updateMany({
    where: { branchId: null },
    data: { branchId: mainBranch.id }
  });
  console.log(`Linked ${updatedClasses.count} existing classes to Main Branch.`);

  // 5. Update existing students to have realistic Palestinian 9-digit national IDs if empty
  const studentsWithoutNationalId = await prisma.student.findMany({
    where: { nationalId: null }
  });

  console.log(`Assigning 9-digit national IDs to ${studentsWithoutNationalId.length} students...`);
  let baseId = 405120001;
  for (const s of studentsWithoutNationalId) {
    let assigned = false;
    while (!assigned) {
      const candidateId = String(baseId);
      const exists = await prisma.student.findUnique({ where: { nationalId: candidateId } });
      if (!exists) {
        await prisma.student.update({
          where: { id: s.id },
          data: { nationalId: candidateId }
        });
        assigned = true;
      }
      baseId++;
    }
  }

  // 6. Ensure General Director user has role SUPER_ADMIN and branchId null (can access all)
  const generalDirector = await prisma.user.findFirst({
    where: { email: 'admin@school.local' }
  });
  if (generalDirector) {
    await prisma.user.update({
      where: { id: generalDirector.id },
      data: { role: 'SUPER_ADMIN', branchId: null }
    });
    console.log('Updated admin@school.com to SUPER_ADMIN (General Director)');
  }

  console.log('--- Initialization Finished Successfully ---');
}

main()
  .catch(e => {
    console.error('Error during branch init:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
