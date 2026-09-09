# Production Readiness Checklist (School Management System V2)

Before going live in a real school environment, verify the following checklist items:

## 1. Security & Credentials
- [ ] Change the default administrative password (`admin@school.local` / `ChangeMe123!`).
- [ ] Generate a cryptographically secure `JWT_SECRET` (at least 64 random alphanumeric characters).
- [ ] Ensure `.env` is NOT committed to version control.
- [ ] Verify CORS origins are restricted to the production frontend domain.
- [ ] Verify Helmet security headers and login rate limiting are enabled.

## 2. Database & Scaling
- [ ] Run `npx prisma migrate deploy` on the production PostgreSQL database.
- [ ] Verify all database indexes are active (`Student.studentNumber`, `Teacher.employeeNo`, compound name indexes).
- [ ] Configure automated daily backups using `pg_dump` or managed cloud snapshots.
- [ ] Test database connection pooling if scaling beyond 5,000 concurrent students.

## 3. Academic Operations
- [ ] Configure the active Academic Year (e.g. `2026/2027`).
- [ ] Set up curriculum subjects and grade levels.
- [ ] Bulk import student records using the Excel template.
- [ ] Test daily attendance sheet roll calls and grade entries.
- [ ] Test Excel export downloads for student directories and grade reports.
