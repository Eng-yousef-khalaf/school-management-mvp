# 🏫 Smart School Management System (V2)

<div align="center">

![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js_20+-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js_5-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel Ready](https://img.shields.io/badge/Vercel-Ready-black?style=for-the-badge&logo=vercel&logoColor=white)

**An Enterprise-Grade, Full-Stack Academic Management & Student Information System (SIS) with Bilingual UI (Arabic RTL & English LTR), Role-Based Access Control, Academic Year Rollovers, Attendance Tracking, Grades Matrix, and Excel Data Pipeline.**

[Live Demo](#-deployment-guide) • [Key Features](#-key-features) • [Quick Start](#-quick-start-local) • [Vercel Deployment](#-deploying-on-vercel--production) • [API Reference](#-api-specification)

</div>

---

## 🌟 Key Features

### 📅 1. Multi-Academic Year & Rollover System
- **Year-by-Year Archiving**: Keeps historical academic records (grades, enrollments, attendance) immutable across previous years.
- **Active Year Switcher**: Instant global year context switching across all dashboard cards, reports, and class rosters.
- **Automated Teacher Rollover**: One-click rollover utility to carry forward teacher assignments to newly activated academic years.

### 👥 2. Student & Faculty Directory
- **Server-Side Pagination & Filtering**: Handles 5,000+ records smoothly with multi-criteria search (name, code, class, gender, status).
- **Student Dossiers**: Comprehensive 360° profile with attendance records, grade book breakdown, enrolled classes, and parent emergency contacts.
- **Teacher Workload Matrix**: Faculty specialization, assigned subjects, classes taught, and workload analytics.

### 📊 3. Interactive Daily Roll-Call & Grade Matrix
- **Daily Attendance Sheet**: Rapid roll call with **"Mark All Present"** button, status toggling (*Present, Absent, Late, Excused*), and teacher notes.
- **Curriculum Assessment Grades**: Multi-subject assessment grading sheet, automatic percentage/GPA calculation, and class-wide grade averages.

### 📥 4. Smart Excel Import / Export Data Pipeline
- **Bulk Excel Import**: Built-in parser with spreadsheet validation, duplicate ID detection, preview dialog, and transactional batch inserts.
- **Instant Excel Export**: Export filtered Student rosters, Faculty directories, Attendance logs, and Grade sheets into formatted `.xlsx` files.

### 🔐 5. Multi-Role RBAC & Audit Trail
- **Granular Permissions**:
  - `ADMIN`: Full access (User management, Academic Year rollover, System configurations, Security audit log).
  - `STAFF`: Administrative operations (Students, Teachers, Classes, Attendance, Reports, Excel utilities).
  - `TEACHER`: Restricted scope (Assigned classes, students, roll-call entry, and grade assessment).
- **Security Audit Logger**: Centralized recording of administrative actions and authentication events.

### 🌐 6. Ultra-Premium Responsive Bilingual UI
- **Arabic (RTL) & English (LTR)** dynamic language switcher with persistent user preference.
- Modern glassmorphism design system, interactive charts, toast notifications, responsive drawer sidebar, and data tables.

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
│   ├── src/
│   │   ├── controllers/           # HTTP Request handlers
│   │   ├── routes/                # Modular REST API endpoints
│   │   ├── middleware/            # JWT Auth, RBAC, Zod validation, Error handlers
│   │   ├── services/              # Business logic & database transactions
│   │   ├── utils/                 # Prisma singleton, validators, audit logger
│   │   └── server.js              # Express app with Helmet, CORS & Rate Limiting
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI components (Datatables, Modals, Badges, Charts)
│   │   ├── context/               # AuthContext, LanguageContext, AcademicYearContext, ToastContext
│   │   ├── pages/                 # Full responsive views (Dashboard, Students, Teachers, Grades...)
│   │   ├── services/              # Centralized Axios/Fetch API client & file downloader
│   │   ├── styles/                # CSS design system tokens, themes & animations
│   │   ├── App.jsx                # Client router with protected route guards
│   │   └── main.jsx
│   ├── vercel.json                # Vercel SPA routing rewrite rules
│   ├── vite.config.js
│   └── package.json
├── docs/                          # Comprehensive technical documentation & ERD
└── docker-compose.yml             # Local PostgreSQL 16 container
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ installed
- Git installed
- Docker (optional for PostgreSQL, or use built-in SQLite)

### 1. Clone & Setup Repository
```bash
git clone https://github.com/Eng-yousef-khalaf/school-management-system.git
cd school-management-system
```

### 2. Backend Setup
```bash
cd backend
npm install

# Setup Environment Variables
cp .env.example .env

# Generate Prisma Client & Run Migrations
npx prisma generate
npx prisma migrate dev --name init

# Seed Database with Demo Accounts & Records
npm run seed

# Start Backend Server (Running on http://localhost:4000/api)
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Setup Environment Variables
cp .env.example .env

# Start Vite Development Server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **👑 ADMIN** | `admin@school.local` | `ChangeMe123!` | Full System Control, Users, Audit Logs, Settings |
| **💼 STAFF** | `staff@school.local` | `ChangeMe123!` | Students, Teachers, Classes, Reports, Excel Hub |
| **👨‍🏫 TEACHER** | `teacher@school.local` | `ChangeMe123!` | Assigned Classes, Daily Roll-Call, Grade Entry |

---

## ☁️ Deploying on Vercel & Production

This project is built to deploy effortlessly with continuous integration: any push to your `main` branch automatically triggers live production updates.

### Step 1: Deploy Frontend on Vercel
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New Project"** and select your `school-management-system` repository.
3. Configure the Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend-api-url.com/api` (URL of your deployed backend)
5. Click **Deploy**. The `frontend/vercel.json` ensures all SPA routes reload seamlessly without 404 errors.

### Step 2: Deploy Backend & Database (Render / Railway / Supabase)
1. Deploy PostgreSQL on **Supabase** / **Neon** / **Railway** and copy the Connection String.
2. Deploy the `backend` folder on **Render.com** or **Railway.app**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `DATABASE_URL`: `postgresql://...`
     - `JWT_SECRET`: `your_super_secret_jwt_key`
     - `PORT`: `4000`
     - `CORS_ORIGIN`: `https://your-frontend-domain.vercel.app`

---

## 📡 API Specification Overview

| Method | Endpoint | Description | Protected Role |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | User authentication & JWT issuance | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | All Authenticated |
| `GET` | `/api/dashboard/stats` | KPI statistics & demographic charts | `ADMIN`, `STAFF` |
| `GET` | `/api/students` | Paginated & filtered student list | All Authenticated |
| `POST` | `/api/students` | Register a new student | `ADMIN`, `STAFF` |
| `POST` | `/api/students/import` | Excel bulk upload students | `ADMIN`, `STAFF` |
| `GET` | `/api/teachers` | Directory of faculty teachers | All Authenticated |
| `GET` | `/api/academic-years` | List all academic years | All Authenticated |
| `POST` | `/api/academic-years/:id/activate` | Activate academic year context | `ADMIN` |
| `POST` | `/api/teachers/rollover` | Rollover teacher assignments to new year | `ADMIN` |
| `GET` | `/api/attendance` | Fetch roll-call attendance sheet | All Authenticated |
| `POST` | `/api/attendance` | Save daily student attendance | All Authenticated |
| `GET` | `/api/grades` | Query class curriculum grade matrix | All Authenticated |
| `POST` | `/api/grades` | Submit student assessment scores | All Authenticated |
| `GET` | `/api/reports/export/:type` | Generate and download Excel report | `ADMIN`, `STAFF` |
| `GET` | `/api/users` | List system users | `ADMIN` |

---

## 👤 Author

**Eng. Yousef Khalaf**
- 🌐 GitHub: [@Eng-yousef-khalaf](https://github.com/Eng-yousef-khalaf)
- 💼 Specialization: **Data Science, AI & Scalable Software Engineering**

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
