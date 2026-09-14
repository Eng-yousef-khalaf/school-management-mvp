# 🏫 Smart School Management System (Standalone Enterprise Edition)

<div align="center">

![License](https://img.shields.io/badge/License-Commercial%20Enterprise-blue.svg?style=for-the-badge)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js_20+-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js_5-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-316192?style=for-the-badge&logo=postgresql&logoColor=white)

**An Enterprise-Grade, Full-Stack Academic Management & Student Information System (SIS) designed as an isolated, standalone turnkey software solution with Bilingual UI (Arabic RTL & English LTR), Role-Based Access Control, Attendance Tracking, Grades Matrix, Excel Data Pipeline, and Developer Diagnostics Hub.**

</div>

---

## 🌟 Key Features

### 🏛️ 1. Standalone & Turnkey Software Architecture
- **Dedicated School Deployment**: Built to be sold and deployed directly as a standalone solution with 100% isolated database and custom branding.
- **Developer Diagnostics Hub**: Real-time server telemetry, latency metrics, table-by-table storage breakdown, and JSON backup export tools.
- **Handover Delivery Slip Generator**: One-click generation of principal credentials and platform handover cards.

### 📅 2. Multi-Academic Year & Rollover System
- **Year-by-Year Archiving**: Keeps historical academic records (grades, enrollments, attendance) immutable across previous years.
- **Active Year Switcher**: Instant global year context switching across all dashboard cards, reports, and class rosters.
- **Automated Teacher Rollover**: One-click rollover utility to carry forward teacher assignments to newly activated academic years.

### 👥 3. Student & Faculty Directory
- **Server-Side Pagination & Filtering**: Handles 5,000+ records smoothly with multi-criteria search (name, code, class, gender, status).
- **Student Dossiers**: Comprehensive 360° profile with attendance records, grade book breakdown, enrolled classes, and parent emergency contacts.
- **Teacher Workload Matrix**: Faculty specialization, assigned subjects, classes taught, and workload analytics.

### 📊 4. Interactive Daily Roll-Call & Grade Matrix
- **Daily Attendance Sheet**: Rapid roll call with **"Mark All Present"** button, status toggling (*Present, Absent, Late, Excused*), and teacher notes.
- **Curriculum Assessment Grades**: Multi-subject assessment grading sheet, automatic percentage/GPA calculation, and class-wide grade averages.

### 📥 5. Smart Excel Import / Export Data Pipeline
- **Bulk Excel Import**: Built-in parser with spreadsheet validation, duplicate ID detection, preview dialog, and transactional batch inserts.
- **Instant Excel Export**: Export filtered Student rosters, Faculty directories, Attendance logs, and Grade sheets into formatted `.xlsx` files.

### 🔐 6. Multi-Role RBAC & Audit Trail
- **Granular Permissions**:
  - `ADMIN`: Full access (User management, Academic Year rollover, System configurations, Security audit log).
  - `STAFF`: Administrative operations (Students, Teachers, Classes, Attendance, Reports, Excel utilities).
  - `TEACHER`: Restricted scope (Assigned classes, students, roll-call entry, and grade assessment).
  - `DEVELOPER`: Emergency master override for maintenance and platform diagnostics.
- **Security Audit Logger**: Centralized recording of administrative actions and authentication events.

### 🌐 7. Ultra-Premium Responsive Bilingual UI
- **Arabic (RTL) & English (LTR)** dynamic language switcher with persistent user preference.
- Modern design system, interactive charts, toast notifications, responsive drawer sidebar, and data tables.

---

## 🏗️ Tech Stack & Architecture

```
school-management-mvp/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (PostgreSQL / SQLite)
│   │   ├── migrations/            # SQL migration version history
│   │   ├── seed.js                # Seed dataset with realistic demo data
│   │   └── reset_clean_slate.js   # 100% clean slate database reset utility
│   ├── scripts/
│   │   └── setup-database.js      # 1-click database setup and seeding CLI
│   ├── src/
│   │   ├── controllers/           # HTTP Request handlers
│   │   ├── routes/                # Modular REST API endpoints & developer hub
│   │   ├── middleware/            # JWT Auth, RBAC, Zod validation, Error handlers
│   │   ├── services/              # Business logic & database transactions
│   │   ├── utils/                 # Prisma singleton, validators, audit logger
│   │   └── server.js              # Express app with Helmet, CORS & Rate Limiting
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI components (Datatables, Modals, Badges, Charts)
│   │   ├── context/               # AuthContext, LanguageContext, AcademicYearContext, SchoolConfigContext
│   │   ├── pages/                 # Full responsive views (Dashboard, Students, Teachers, Developer Hub...)
│   │   ├── services/              # Centralized Axios/Fetch API client & file downloader
│   │   ├── styles/                # CSS design system tokens, themes & animations
│   │   ├── App.jsx                # Client router with protected route guards
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
├── docs/                          # Comprehensive technical documentation, guides & ERD
└── docker-compose.yml             # Local PostgreSQL 16 container
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 16 (or built-in SQLite for local testing)

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env

# Generate Prisma Client & Run Migrations
npx prisma generate
npx prisma migrate dev --name init

# Seed Database with Demo Accounts & Records
npm run seed

# Start Backend Server (Running on http://localhost:4000/api)
npm run dev
```

### 2. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env

# Start Frontend Dev Server (Running on http://localhost:5173)
npm run dev
```

---

## 🔑 Default Portal Accounts

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **👔 Admin (Executive)** | `admin@school.local` | `ChangeMe123!` | System Settings, Users, Rollovers, Security Logs |
| **📋 Staff (Student Affairs)** | `staff@school.local` | `ChangeMe123!` | Admissions, Classes, Attendance, Reports, Excel Import |
| **👨‍🏫 Teacher (Mathematics)** | `ahmed.khalil@school.local` | `ChangeMe123!` | Grade 7 A & 8 A Roster, Roll-Call, Grade Matrix |
| **⚡ Lead Developer** | `YOUSEF_MASTER_2026` | *(Master Key)* | System Engineering & Diagnostics Hub |

---

## 📖 Documentation
- [دليل النشر والبيع والتشغيل للنسخة المستقلة](docs/STANDALONE_DEPLOYMENT_AND_SALE_GUIDE_AR.md)
- [دليل المستخدم الشامل باللغة العربية](docs/USER_GUIDE_AR.md)
- [المواصفات الفنية المعتمدة للمشروع](docs/PROJECT_SPECIFICATION_AR.md)
- [Database Schema & ERD](docs/database-design.md)
- [REST API Specification](docs/api.md)
