# Deployment Guide & PostgreSQL Operations

## 1. Local Development Deployment

### Prerequisites
- Node.js (v18+ or v20+)
- PostgreSQL 16 (Native, Docker, or Cloud Managed)

### Quick Start
```bash
# 1. Start PostgreSQL with Docker
docker compose up -d

# 2. Setup and Start Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev

# 3. Start Frontend
cd ../frontend
npm install
npm run dev
```

The system will be accessible at:
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:4000/api`

---

## 2. PostgreSQL Backup & Restore Strategy

### Database Backup (pg_dump)
To perform a complete backup of the `school_mvp` database:
```bash
# Backup to custom archive format
pg_dump -h localhost -p 5432 -U postgres -F c -b -v -f "school_mvp_backup_$(date +%Y%m%d_%H%M%S).dump" school_mvp

# Or plain SQL format
pg_dump -h localhost -p 5432 -U postgres school_mvp > school_mvp_backup.sql
```

### Database Restore (pg_restore)
```bash
# Restore archive format
pg_restore -h localhost -p 5432 -U postgres -d school_mvp -v "school_mvp_backup.dump"

# Restore plain SQL
psql -h localhost -p 5432 -U postgres -d school_mvp < school_mvp_backup.sql
```

---

## 3. Production Cloud Deployment

### A. Database (Managed PostgreSQL)
Deploy PostgreSQL 16 on any managed provider:
- **Supabase / Neon / AWS RDS / GCP Cloud SQL / Railway**
- Copy the connection string to `DATABASE_URL`.

### B. Backend Deployment (Render, Railway, VPS, Docker)
- Set Environment Variables:
  - `DATABASE_URL`: Production PostgreSQL URL
  - `JWT_SECRET`: Minimum 32-character random key
  - `PORT`: `4000` (or cloud default)
  - `CORS_ORIGIN`: `https://your-frontend-domain.com`
  - `NODE_ENV`: `production`
- Build / Start commands:
  ```bash
  npx prisma generate && npx prisma migrate deploy && npm start
  ```

### C. Frontend Deployment (Static & Cloud Web Hosting)
- Set Environment Variable:
  - `VITE_API_URL`: `https://your-backend-api.com/api`
- Build command: `npm run build`
- Output directory: `dist`
