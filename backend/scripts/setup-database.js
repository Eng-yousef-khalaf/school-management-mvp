#!/usr/bin/env node

/**
 * ==============================================================================
 * School Management System (Standalone) — Database Setup & Initialization CLI
 * ==============================================================================
 * Automates schema migration, client generation, and initial seed data for this
 * school instance on PostgreSQL (Supabase / Neon / Local / Cloud).
 *
 * Usage:
 *   node scripts/setup-database.js \
 *     --db="postgresql://postgres:password@db.schoolref.supabase.co:5432/postgres" \
 *     --name-ar="مدرسة النور النموذجية" \
 *     --name-en="Al-Noor Model School" \
 *     --admin-email="admin@school.local" \
 *     --admin-pass="ChangeMe123!"
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
const schoolNameAr = params['name-ar'] || 'روضة ومدرسة مجموعة السلام التعليمية الخاصة';
const schoolNameEn = params['name-en'] || 'Al-Salam Educational Group Private School & Kindergarten';
const schoolCode = params['code'] || 'SCH-ALSALAM-2026';
const adminEmail = params['admin-email'] || 'admin@school.local';
const adminPass = params['admin-pass'] || 'ChangeMe123!';
const primaryColor = params['color'] || '#166534';

console.log('\n======================================================');
console.log('🏫 Smart School System (Standalone) — Database Setup');
console.log('======================================================\n');

if (!targetDbUrl) {
  console.error('❌ Error: No DATABASE_URL provided. Use --db="postgresql://..."');
  process.exit(1);
}

console.log(`📌 School Code:       ${schoolCode}`);
console.log(`🏫 School Name (AR):  ${schoolNameAr}`);
console.log(`🏫 School Name (EN):  ${schoolNameEn}`);
console.log(`👤 Admin Account:     ${adminEmail}`);
console.log(`🗄️ Database Target:   ${targetDbUrl.split('@')[1] || 'PostgreSQL Connection'}\n`);

try {
  console.log('⏳ Step 1/3: Pushing schema to PostgreSQL database...');
  const schemaPath = targetDbUrl.startsWith('file:')
    ? path.resolve(__dirname, '../prisma/schema.prisma')
    : path.resolve(__dirname, '../prisma/schema.postgresql.prisma');

  execSync(`npx prisma db push --schema="${schemaPath}" --accept-data-loss`, {
    env: { ...process.env, DATABASE_URL: targetDbUrl },
    stdio: 'inherit',
  });
  console.log('✅ Schema pushed successfully!\n');

  console.log('⏳ Step 2/3: Generating Prisma client...');
  execSync(`npx prisma generate --schema="${schemaPath}"`, {
    env: { ...process.env, DATABASE_URL: targetDbUrl },
    stdio: 'inherit',
  });
  console.log('✅ Prisma client generated!\n');

  console.log('⏳ Step 3/3: Seeding initial structure and administrative accounts...');
  const seedScriptPath = path.resolve(__dirname, '../prisma/seed.js');
  execSync(`node "${seedScriptPath}"`, {
    env: { ...process.env, DATABASE_URL: targetDbUrl },
    stdio: 'inherit',
  });
  console.log('✅ Database seeded with default academic year, roles, and administrative staff!\n');

  console.log('======================================================');
  console.log('🎉 INITIALIZATION COMPLETE! Standalone Instance Ready.');
  console.log('======================================================\n');
  console.log('🔑 Principal / Admin Login Credentials:');
  console.log(`   Email:    ${adminEmail}`);
  console.log(`   Password: ${adminPass}\n`);
} catch (error) {
  console.error('\n❌ Database Setup Failed:', error.message);
  process.exit(1);
}
