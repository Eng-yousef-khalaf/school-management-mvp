# 🏫 Smart School OS — Enterprise Academic Management & SIS Platform
### منظومة الإدارة المدرسية الذكية المتكاملة (النسخة المؤسسية المستقلة)

<div align="center">

![Project Status](https://img.shields.io/badge/Status-Completed%20%26%20Production%20Delivered-2ea44f?style=for-the-badge&logo=checkmarx&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js_20+-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js_5-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Bilingual](https://img.shields.io/badge/Bilingual-Arabic%20RTL%20%7C%20English%20LTR-00b4d8?style=for-the-badge)
![License](https://img.shields.io/badge/License-Commercial%20Enterprise-blue.svg?style=for-the-badge)

<p align="center">
  <strong>An Enterprise-Grade, Full-Stack Academic Management & Student Information System (SIS)</strong><br>
  <em>Engineered as an isolated, standalone turnkey software solution with Bilingual UI (Arabic RTL & English LTR), Role-Based Access Control, Attendance Matrix, Grade Books, Report Card Generator, Excel Data Pipelines, and Developer Diagnostics Hub.</em>
</p>

</div>

---

> [!IMPORTANT]
> ### 🚀 Project Status: COMPLETED & DELIVERED TO PRODUCTION
> **الحالة: منجز بالكامل ومسلّم للعمليات التشغيلية الفعلية**
> - The system has successfully completed full-cycle engineering, end-to-end QA validation, and production handover.
> - Handed over and operationally verified for academic institutions (including official handover slips and administrative credentials).
> - Production-ready, turnkey deployment with 100% data ownership and isolated multi-tenant capability.

---

## 📌 Executive Overview | نظرة عامة

**Smart School OS** is a modern, standalone Student Information System (SIS) and Institutional Management Platform tailored for schools and educational centers. Unlike rigid SaaS solutions that force recurring lock-ins, this system provides schools with **100% data sovereignty**, custom institutional branding, local high-speed performance, and offline-resilient operational workflows.

### 🎯 Key Engineering Goals Achieved:
- **Zero-Friction Adoption:** Built-in Excel import engine allowing 5,000+ student and teacher records to be ingested within seconds.
- **Academic Lifecycle Automation:** From student admissions and class enrollments to daily roll-calls, exam grading, GPA computation, and official PDF certificate printing.
- **Institutional Multi-Year Archiving:** Preserves historical records immutably while providing single-click context switching across academic years.
- **Bilingual Core:** Native right-to-left (Arabic RTL) and left-to-right (English LTR) user experience across all portals.

---

## 🌟 Core System Modules | الوحدات والأنظمة الفرعية

### 🏛️ 1. Standalone Turnkey Deployment & School Onboarding
- **Isolated Deployment:** Completely autonomous database and runtime per institution, ensuring total student data privacy.
- **Handover Delivery Slip Generator (`بطاقة تسليم المنظومة`):** One-click utility that generates branded administrator onboarding cards with credentials and server access protocols.
- **Custom Branding & Localization:** Institution name, school logo, academic calendar, and grading scales configured dynamically via GUI.

### 👥 2. 360° Student Information System (SIS) & Faculty Directory
- **Comprehensive Student Dossiers:** Complete profiles with personal bio, guardian emergency contacts, enrolled classes, historical grades, and real-time attendance logs.
- **Teacher Workload & Allocation:** Faculty specialization profiles, subject assignments, allocated classes, and timetable insights.
- **Server-Side Search & Pagination:** High-performance indexing designed to query and filter through thousands of student records seamlessly.

### 📅 3. Multi-Academic Year Management & Automated Rollover
- **Year-by-Year Historical Immutability:** Previous academic years, attendance archives, and final report cards remain locked and tamper-proof.
- **Global Context Switcher:** Administrators and staff can jump between historical and active academic years instantly.
- **One-Click Rollover Engine:** Automatically carry forward faculty assignments and eligible student cohorts into newly activated terms.

### 📊 4. Interactive Attendance Matrix & Roll-Call Tracking
- **High-Speed Roll-Call Sheet:** Optimized for teachers with a **"Mark All Present"** button, instant toggling (*Present, Absent, Late, Excused*), and per-student behavioral observations.
- **Attendance Analytics:** Automated calculation of attendance percentages, absence thresholds, and warning flags for at-risk students.

### 📈 5. Curriculum Assessment, GPA Engine & Report Cards
- **Multi-Subject Gradebook:** Tabular assessment entry with automated weighted averages, percentage conversions, and class-level statistics.
- **Automated Report Card Generation:** Integrated Puppeteer and template engine for generating standardized student evaluation certificates (`شهادة طالب`) ready for printing and export.
- **UNICEF & Ministry Aligned Formats:** Formatted reports adhering to regional educational standards and documentation requirements.

### 📥 6. Bi-Directional Excel Data Pipelines
- **Bulk Excel Ingestion:** Smart parser validating headers, rejecting duplicate student/national IDs, displaying an interactive preview dialog, and executing transactional batch commits.
- **Instant Structured Exports:** Export real-time student directories, faculty rosters, attendance sheets, and grade records into clean, formatted `.xlsx` workbooks.

### 🔐 7. Role-Based Access Control (RBAC) & Audit Trails
- **Four Dedicated Access Tiers:**
  - `ADMIN`: Institutional executive (Configurations, user management, academic rollover, security logs).
  - `STAFF`: Student affairs & administration (Admissions, class assignments, attendance, reports, Excel utilities).
  - `TEACHER`: Faculty portal (Assigned classrooms, student rosters, roll-call entry, grade evaluations).
  - `DEVELOPER`: Master diagnostic override for maintenance and database telemetry.
- **Centralized Security Audit Trail:** Real-time logging of authentication events, grade modifications, and administrative changes.

### 🛠️ 8. Developer Diagnostics Hub & Server Telemetry
- **Database Telemetry:** Real-time PostgreSQL/Prisma query latency monitoring and table-by-table row and byte counts.
- **Backup & Migration Tools:** One-click JSON database snapshot export and clean-slate reset scripts.

---

## 🏗️ Technical Architecture & Stack

```
school-management-mvp/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (PostgreSQL & SQLite dual support)
│   │   ├── migrations/            # SQL migration history
│   │   ├── seed.js                # Realistic demo dataset generator
│   │   └── reset_clean_slate.js   # Zero-residue clean slate reset script
│   ├── src/
│   │   ├── controllers/           # REST endpoint handlers
│   │   ├── routes/                # Modular API route definitions
│   │   ├── middleware/            # JWT authentication, RBAC, Zod validation, error traps
│   │   ├── services/              # Core business transactions, Excel parser & PDF engine
│   │   ├── utils/                 # Prisma client singleton, audit logger & security helpers
│   │   └── server.js              # Express server with Helmet, CORS & Rate Limiting
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI primitives (Data tables, Modals, Badges, Charts)
│   │   ├── context/               # Auth, Language, AcademicYear, and SchoolConfig contexts
│   │   ├── pages/                 # Full responsive views (Dashboard, Students, Grades, Attendance...)
│   │   ├── services/              # Centralized Axios API client & download helpers
│   │   ├── styles/                # Responsive CSS variables, typography, and dark/light themes
│   │   ├── App.jsx                # Client router with protected route guards
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
├── docs/                          # Comprehensive user guides, sales manual & ERD diagrams
├── docker-compose.yml             # Local PostgreSQL 16 container definition
├── render.yaml                    # Automated cloud deployment configuration
├── vercel.json                    # Frontend deployment settings
└── Smart_School_OS_Pitch.pdf      # Executive presentation and pitch deck
```

### ⚙️ Technologies Overview

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + Vite 7 | Ultra-fast HMR, component architecture, zero bloat |
| **Styling & Theme** | Modern CSS3 + CSS Custom Properties | Native RTL/LTR support, fluid typography, dark/light modes |
| **Backend Runtime** | Node.js 20+ & Express.js 5 | Asynchronous RESTful API, Helmet protection, Rate limiting |
| **ORM & Data Layer** | Prisma ORM 6 | Type-safe queries, migration lifecycle, connection pooling |
| **Database** | PostgreSQL 16 (or SQLite) | Relational integrity, ACID compliance, indexed foreign keys |
| **Document Generation** | Puppeteer Core + XLSX | Headless PDF report card generation & bulk Excel processing |
| **Authentication** | JWT + bcrypt | Stateless secure sessions, hashed credentials, role guards |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [PostgreSQL](https://www.postgresql.org/) v16 (or use the built-in SQLite configuration for rapid evaluation)
- [Git](https://git-scm.com/)

---

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Generate Prisma Client & Run Migrations
npx prisma generate
npx prisma migrate dev --name init

# Seed Database with realistic demo data
npm run seed

# Start the Backend Server (Runs on http://localhost:4000/api)
npm run dev
```

---

### 2. Frontend Setup

```bash
# In a new terminal, navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Configure frontend environment variables
cp .env.example .env

# Start the Frontend Development Server (Runs on http://localhost:5173)
npm run dev
```

---

### 3. Running with Docker Compose (Optional)

To spin up a local PostgreSQL 16 instance effortlessly:
```bash
docker-compose up -d
```

---

## 🔑 Default Demonstration Accounts

The database seed provides pre-configured test profiles across all access roles:

| Role | Email | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **👔 Admin (Executive)** | `admin@school.local` | `ChangeMe123!` | System Settings, User Management, Academic Rollovers, Audit Logs |
| **📋 Staff (Student Affairs)** | `staff@school.local` | `ChangeMe123!` | Admissions, Student & Teacher Directory, Class Rosters, Excel Tools |
| **👨‍🏫 Teacher (Faculty)** | `ahmed.khalil@school.local` | `ChangeMe123!` | Assigned Classrooms, Roll-Call Attendance, Curriculum Grading |
| **⚡ Lead Developer** | `YOUSEF_MASTER_2026` | *(Master Key)* | System Engineering, Telemetry & Developer Diagnostics Hub |

---

## 📚 Technical Documentation & Resources

Comprehensive Arabic and English documentation guides are available in the repository:

- 📄 **[دليل النشر والبيع والتشغيل للنسخة المستقلة](docs/STANDALONE_DEPLOYMENT_AND_SALE_GUIDE_AR.md)** — الدليل التشغيلي والتجاري لتركيب وتهيئة النظام.
- 📘 **[دليل المستخدم الشامل باللغة العربية](docs/USER_GUIDE_AR.md)** — شرح مفصل لكل شاشات ووظائف النظام للكوادر المدرسية.
- 📐 **[المواصفات الفنية المعتمدة للمشروع](docs/PROJECT_SPECIFICATION_AR.md)** — المرجع الهندسي والمعماري للمنظومة.
- 🗄️ **[Database Schema & ERD](docs/database-design.md)** — المخطط العلائقي لقاعدة البيانات وجداولها.
- 🔌 **[REST API Specification](docs/api.md)** — توثيق جميع نقاط الاتصال البرمجية (API Endpoints).
- 📊 **[Smart School OS Pitch Deck (PDF)](Smart_School_OS_Pitch.pdf)** — العرض التقديمي الشامل ومزايا النظام.
- 🏛️ **[العرض التقديمي التفاعلي](presentation.html)** — صفحة عرض تفاعلية مميزة للنظام.

---

## 👨‍💻 Author & Engineering Credits

Developed and Engineered by:

**Yousef Khalaf**  
*Software Engineer · Data & MEAL Specialist · Protection, AAP & CFM*  
*Co-Founder & CTO at PIDEA Academy*

- 🌐 **Portfolio:** [yousef-khalaf-portfolio](https://github.com/Eng-yousef-khalaf/portfolio)
- 💼 **LinkedIn:** [linkedin.com/in/yousef-khalaf-b1441326b](https://www.linkedin.com/in/yousef-khalaf-b1441326b/)
- 🐙 **GitHub:** [@Eng-yousef-khalaf](https://github.com/Eng-yousef-khalaf)
- 📧 **Email:** [yousef2001kh44@gmail.com](mailto:yousef2001kh44@gmail.com)

---

<p align="center">
  <sub>© 2026 Yousef Khalaf · Smart School Management System. Commercial Enterprise Edition. All rights reserved.</sub>
</p>
