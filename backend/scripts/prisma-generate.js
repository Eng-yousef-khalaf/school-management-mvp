const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

const schemaPath = isPostgres
  ? path.resolve(__dirname, '../prisma/schema.postgresql.prisma')
  : path.resolve(__dirname, '../prisma/schema.prisma');

console.log(`[Prisma Generate] Target DB type: ${isPostgres ? 'PostgreSQL (Cloud/Supabase)' : 'SQLite (Local)'}`);
console.log(`[Prisma Generate] Using schema: ${schemaPath}`);

try {
  if (isPostgres && dbUrl) {
    try {
      console.log('[Prisma DB Push] Ensuring PostgreSQL database schema is synchronized...');
      execSync(`npx prisma db push --schema="${schemaPath}" --accept-data-loss`, {
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '..'),
        env: process.env
      });
      console.log('✓ PostgreSQL schema synchronized successfully.');
    } catch (pushErr) {
      console.warn('⚠️ [Prisma DB Push] Schema push notice:', pushErr.message);
    }
  }

  execSync(`npx prisma generate --schema="${schemaPath}"`, {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
    env: process.env
  });
  console.log('✓ Prisma Client generated successfully.');
} catch (error) {
  console.error('❌ Prisma Client generation failed:', error.message);
  process.exit(1);
}
