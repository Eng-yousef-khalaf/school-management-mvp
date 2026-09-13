#!/usr/bin/env node

/**
 * ==============================================================================
 * School Management System V2 — 1-Click School Provisioning & Setup CLI
 * ==============================================================================
 * Automates the creation, migration, and seeding of an isolated Supabase PostgreSQL
 * database for any new school instance.
 *
 * Usage:
 *   node scripts/setup-new-school.js \
 *     --db="postgresql://postgres:password@db.schoolref.supabase.co:5432/postgres" \
 *     --name-ar="مدرسة النور النموذجية" \
 *     --name-en="Al-Noor Model School" \
 *     --admin-email="admin@alnoor.edu" \
 *     --admin-pass="AlNoorAdmin2026!"
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const params = {};

args.forEach((arg) => {
  if (arg.startsWith('--')) {
    const [key, ...valParts] = arg.replace(/^--/, '').split('=');
    params[key] = valParts.join('=').replace(/^["']|["']$/g, '');
  }
});

const targetDbUrl = params['db'] || process.env.DATABASE_URL;
const schoolNameAr = params['name-ar'] || 'مدرسة جديدة';
const schoolNameEn = params['name-en'] || 'New Dedicated School';
const schoolCode = params['code'] || `SCH-${Math.floor(100 + Math.random() * 900)}`;
const adminEmail = params['admin-email'] || 'admin@school.edu';
const adminPass = params['admin-pass'] || 'SchoolAdmin2026!';
const primaryColor = params['color'] || '#4f46e5';

console.log('\n======================================================');
console.log('🚀 School Management System V2 — 1-Click Provisioning');
console.log('======================================================\n');

if (!targetDbUrl || targetDbUrl.includes('dev.db')) {
  console.error('❌ Error: Please provide a valid Supabase PostgreSQL connection string using --db="..."');
  console.log('\nExample:');
  console.log('  node scripts/setup-new-school.js --db="postgresql://postgres:pass@db.xxxx.supabase.co:5432/postgres" --name-ar="مدرسة الأمل" --code="SCH-005"\n');
  process.exit(1);
}

console.log(`📌 School Code:       ${schoolCode}`);
console.log(`🏫 School Name (AR):  ${schoolNameAr}`);
console.log(`🏫 School Name (EN):  ${schoolNameEn}`);
console.log(`👤 Admin Account:     ${adminEmail}`);
console.log(`🗄️ Database Target:   ${targetDbUrl.split('@')[1] || 'Supabase PostgreSQL'}\n`);

try {
  console.log('⏳ Step 1/3: Pushing schema to Supabase PostgreSQL...');
  const schemaPath = path.resolve(__dirname, '../prisma/schema.postgresql.prisma');

  execSync(`npx prisma db push --schema="${schemaPath}" --accept-data-loss`, {
    env: { ...process.env, DATABASE_URL: targetDbUrl },
    stdio: 'inherit',
  });
  console.log('✅ Schema pushed successfully to Supabase!\n');

  console.log('⏳ Step 2/3: Generating Prisma client...');
  execSync(`npx prisma generate --schema="${schemaPath}"`, {
    env: { ...process.env, DATABASE_URL: targetDbUrl },
    stdio: 'inherit',
  });
  console.log('✅ Prisma client generated!\n');

  console.log('⏳ Step 3/3: Seeding initial administrative account & school structure...');
  const seedScriptPath = path.resolve(__dirname, '../prisma/seed.js');
  execSync(`node "${seedScriptPath}"`, {
    env: { ...process.env, DATABASE_URL: targetDbUrl },
    stdio: 'inherit',
  });
  console.log('✅ Database seeded with default academic year & initial admin!\n');

  console.log('======================================================');
  console.log('🎉 PROVISIONING COMPLETE! Ready for Frontend Deployment:');
  console.log('======================================================\n');
  console.log('📋 Copy these Environment Variables to your Frontend Host / Config:');
  console.log('------------------------------------------------------');
  console.log(`VITE_SCHOOL_CODE="${schoolCode}"`);
  console.log(`VITE_SCHOOL_NAME_AR="${schoolNameAr}"`);
  console.log(`VITE_SCHOOL_NAME_EN="${schoolNameEn}"`);
  console.log(`VITE_PRIMARY_COLOR="${primaryColor}"`);
  console.log(`VITE_ALLOCATED_STORAGE_MB="500"`);
  console.log(`VITE_API_URL="https://api-${schoolCode.toLowerCase()}.yourdomain.com/api"`);
  console.log('------------------------------------------------------\n');
  console.log('🔑 Admin Credentials for School Principal:');
  console.log(`   Email:    ${adminEmail} (or admin@school.local)`);
  console.log(`   Password: ${adminPass} (or ChangeMe123!)\n`);
} catch (error) {
  console.error('\n❌ Provisioning Failed:', error.message);
  process.exit(1);
}
