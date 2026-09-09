# School Management System – V2

An enterprise-grade, full-stack Academic School Management & Student Information System built with **React**, **Node.js/Express**, **Prisma ORM**, and **PostgreSQL 16**.

Designed to scale effortlessly from 200 to 5,000+ students with server-side pagination, indexes, transactional data safety, role-based access control (RBAC), and Excel import/export.

---

## 🌟 Key Features

1. **Dashboard & KPIs**: Real-time presence tracking, demographic breakdowns (by class, by gender), attendance trends, and recent audit activity stream.
2. **Student Management**: Full CRUD with server-side search, multi-criteria filtering, student profile views, attendance history, grade breakdown averages, and soft deactivation.
3. **Faculty & Teachers**: Teacher profiles, specialties, assigned classes and curriculum subjects matrix.
4. **Classes & Sections**: Class directory, grade levels, student rosters, and faculty assignments.
5. **Curriculum Subjects**: Code identifiers, curriculum management, and teacher associations.
6. **Academic Years**: Multi-year support preserving historical records across transitions, with one-click active year switching.
7. **Enrollment Management**: Single and bulk student enrollment into class sections with duplicate prevention.
8. **Interactive Daily Attendance**: Daily attendance roll call sheet with quick "Mark All Present", status toggles (Present, Absent, Late, Excused), notes, and date-range reporting.
9. **Curriculum Grades**: Multi-subject assessment grading sheet, automatic percentage calculation, class grade matrix, and averages.
10. **Excel Import & Export**:
    - **Import**: Multi-row parser with data preview, field validation, duplicate detection, and batch insertion.
    - **Export**: Instant Excel generation for Students, Teachers, Attendance reports, and Grade matrices.
11. **User Management & Security**: Admin-controlled RBAC (`ADMIN`, `STAFF`, `TEACHER`), bcrypt hashing, JWT authentication, and rate limiting.
12. **Security Audit Log**: Centralized tracking of administrative mutations and authentication events.

---

## 🚀 Quick Start Guide

### 1. Start PostgreSQL Database
```bash
docker compose up -d
```
*Or ensure a PostgreSQL 16 server is running at `localhost:5432` with database `school_mvp`.*

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```
Backend API will be live at `http://localhost:4000/api`.

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@school.local` | `ChangeMe123!` | Full system access, user management, audit logs |
| **STAFF** | `staff@school.local` | `ChangeMe123!` | Students, teachers, enrollment, attendance, grades, reports |
| **TEACHER** | `teacher@school.local` | `ChangeMe123!` | Assigned classes, students, attendance, grade entry |

---

## 📁 Project Architecture

```
school-management-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database models, relations & indexes
│   │   ├── migrations/            # SQL migration history
│   │   └── seed.js                # Rich seed dataset (45 students, 10 teachers)
│   ├── src/
│   │   ├── controllers/           # Modular HTTP controllers
│   │   ├── routes/                # Modular Express routes
│   │   ├── middleware/            # Auth, RBAC, Zod validation, Error handling
│   │   ├── services/              # Business logic & query aggregations
│   │   ├── utils/                 # Prisma client, validators, audit logger
│   │   └── server.js              # Server entry point with Helmet & CORS
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/            # Modals, Datatables, Badges, Charts, Icons
│   │   ├── pages/                 # Full pages (Dashboard, Students, Grades...)
│   │   ├── context/               # AuthContext, ToastContext
│   │   ├── services/              # Centralized API client & file downloader
│   │   ├── styles/                # Ultra-premium responsive design system
│   │   ├── App.jsx                # Main page router
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── database/
│   └── student_import_template.xlsx
├── docs/
│   ├── database-design.md
│   ├── api.md
│   ├── deployment.md
│   └── production-checklist.md
├── docker-compose.yml
└── README.md
```

---

## 📖 Detailed Documentation
- [Database Design & ERD](file:///c:/Users/Magnus/Desktop/school-management-mvp/docs/database-design.md)
- [REST API Specification](file:///c:/Users/Magnus/Desktop/school-management-mvp/docs/api.md)
- [Deployment & Backup Guide](file:///c:/Users/Magnus/Desktop/school-management-mvp/docs/deployment.md)
- [Production Checklist](file:///c:/Users/Magnus/Desktop/school-management-mvp/docs/production-checklist.md)
