# Database Architecture & Design Document (School Management System V2)

## 1. Overview
The School Management System V2 uses **PostgreSQL 16** with **Prisma ORM**. The schema is designed to scale effortlessly from 200 students to 1,000, 5,000, and 10,000+ students without requiring database redesign.

All queries use indexed columns, foreign key constraints with cascading logic, and server-side pagination.

---

## 2. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o| Teacher : "optional link"
    User ||--o{ AuditLog : "creates"
    AcademicYear ||--o{ SchoolClass : "contains"
    AcademicYear ||--o{ Enrollment : "spans"
    SchoolClass ||--o{ Enrollment : "has"
    SchoolClass ||--o{ TeacherClassSubject : "assigned"
    SchoolClass ||--o{ Attendance : "records"
    SchoolClass ||--o{ Grade : "evaluates"
    Student ||--o{ Enrollment : "registers"
    Student ||--o{ Attendance : "logs"
    Student ||--o{ Grade : "receives"
    Teacher ||--o{ TeacherClassSubject : "teaches"
    Subject ||--o{ TeacherClassSubject : "offered in"
    Subject ||--o{ Grade : "graded in"

    User {
        int id PK
        string email UK
        string passwordHash
        string fullName
        UserRole role
        boolean active
        int teacherId FK
        datetime createdAt
        datetime updatedAt
    }

    AcademicYear {
        int id PK
        string name UK
        datetime startDate
        datetime endDate
        boolean active
        datetime createdAt
        datetime updatedAt
    }

    SchoolClass {
        int id PK
        string name
        string grade
        string section
        int academicYearId FK
        datetime createdAt
        datetime updatedAt
    }

    Student {
        int id PK
        string studentNumber UK
        string firstName
        string middleName
        string lastName
        Gender gender
        datetime dateOfBirth
        string phone
        string parentName
        string parentPhone
        string address
        StudentStatus status
        datetime createdAt
        datetime updatedAt
    }

    Teacher {
        int id PK
        string employeeNo UK
        string firstName
        string lastName
        string phone
        string email
        string specialty
        boolean active
        datetime createdAt
        datetime updatedAt
    }

    Subject {
        int id PK
        string code UK
        string name
        boolean active
        datetime createdAt
        datetime updatedAt
    }

    TeacherClassSubject {
        int id PK
        int teacherId FK
        int classId FK
        int subjectId FK
        datetime createdAt
    }

    Enrollment {
        int id PK
        int studentId FK
        int classId FK
        int academicYearId FK
        datetime enrolledAt
        datetime createdAt
    }

    Attendance {
        int id PK
        int studentId FK
        int classId FK
        datetime date
        AttendanceStatus status
        string note
        datetime createdAt
        datetime updatedAt
    }

    Grade {
        int id PK
        int studentId FK
        int subjectId FK
        int classId FK
        string examName
        float score
        float maxScore
        datetime date
        datetime createdAt
        datetime updatedAt
    }

    AuditLog {
        int id PK
        int userId FK
        string action
        string entity
        string entityId
        string metadata
        string ipAddress
        datetime timestamp
    }
```

---

## 3. Database Indexes Strategy

| Model | Indexed Fields | Purpose |
| :--- | :--- | :--- |
| `Student` | `studentNumber` (UNIQUE) | High-speed single student lookup |
| `Student` | `[lastName, firstName]` | Compound search across student full names |
| `Student` | `firstName`, `lastName` | Partial string queries and sorting |
| `Student` | `status` | Instant filtering by active/inactive/graduated status |
| `Student` | `parentPhone` | Quick parent search |
| `Teacher` | `employeeNo` (UNIQUE) | Fast teacher code identifier lookup |
| `Teacher` | `[lastName, firstName]` | Alphabetical listing and sorting |
| `Teacher` | `active` | Active faculty filtering |
| `Attendance` | `[studentId, date]` (UNIQUE) | Prevents duplicate daily attendance per student |
| `Attendance` | `date` | Date range query optimization for attendance reports |
| `Attendance` | `classId`, `status` | Class-level daily roll calls |
| `Grade` | `studentId`, `subjectId`, `classId` | Grade matrix and report card aggregations |
| `Enrollment` | `[studentId, classId]` (UNIQUE) | Prevents double enrollment in same class |
| `AuditLog` | `userId`, `action`, `entity`, `timestamp` | Audit trails & security monitoring |

---

## 4. Preservation of Historical Data
When a student moves from one academic year to the next (e.g. Grade 7 in 2025/2026 -> Grade 8 in 2026/2027), prior records in `Enrollment`, `Attendance`, and `Grade` are permanently retained. Slicing by `academicYearId` allows retrieving exact historical student performance at any time.
