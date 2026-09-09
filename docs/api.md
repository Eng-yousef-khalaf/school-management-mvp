# REST API Documentation (School Management System V2)

Base URL: `http://localhost:4000/api`

All endpoints (except `/api/auth/login` and `/api/health`) require an HTTP header:
`Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/login`
- **Body**: `{ "email": "admin@school.local", "password": "ChangeMe123!" }`
- **Response**: `{ "token": "...", "user": { "id": 1, "email": "...", "fullName": "...", "role": "ADMIN" } }`

### `GET /api/auth/profile`
- **Response**: Returns current authenticated user object.

### `POST /api/auth/change-password`
- **Body**: `{ "currentPassword": "...", "newPassword": "..." }`

---

## 2. Dashboard (`/api/dashboard`)

### `GET /api/dashboard`
- **Response**:
  - `overview`: `{ totalStudents, activeStudents, totalTeachers, totalClasses, totalSubjects, todayAttendance }`
  - `charts`: `{ studentsByClass, attendanceOverview, studentsByGender }`
  - `recentActivities`: Array of recent AuditLog actions.

---

## 3. Students (`/api/students`)

### `GET /api/students`
- **Query Parameters**:
  - `q`: Search string (student number, first name, last name, phone)
  - `status`: `ACTIVE`, `INACTIVE`, `GRADUATED`, `WITHDRAWN`
  - `gender`: `MALE`, `FEMALE`, `OTHER`
  - `classId`: Filter by class
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
- **Response**: `{ items: [...], pagination: { total, page, limit, totalPages } }`

### `GET /api/students/:id`
- **Response**: Student object with full personal info, enrollment history, attendance summary %, subject grade breakdown, and overall average grade.

### `POST /api/students` (Staff & Admin)
- **Body**: `{ studentNumber, firstName, middleName, lastName, gender, dateOfBirth, phone, parentName, parentPhone, address, status, classId }`

### `PUT /api/students/:id` (Staff & Admin)
- **Body**: Updated fields.

### `DELETE /api/students/:id` (Staff & Admin)
- Soft deactivates the student by setting status to `INACTIVE`.

### `POST /api/students/import/preview` (Staff & Admin)
- **Content-Type**: `multipart/form-data` with `file`
- **Response**: Parsed stats with `validCount`, `invalidCount`, `duplicateCount`, `validRows`, `invalidRows`, `duplicateRows`.

### `POST /api/students/import/execute` (Staff & Admin)
- **Body**: `{ validRows: [...] }`
- **Response**: `{ success: true, createdCount, failedCount }`

### `GET /api/students/export`
- Downloads `.xlsx` spreadsheet formatted with active student filters.

---

## 4. Teachers (`/api/teachers`)

### `GET /api/teachers`
- **Query**: `q`, `active`, `specialty`, `page`, `limit`

### `GET /api/teachers/:id`
- **Response**: Teacher profile with assigned classes & subjects.

### `POST /api/teachers` (Staff & Admin)
- **Body**: `{ employeeNo, firstName, lastName, phone, email, specialty, active }`

### `POST /api/teachers/assign` (Staff & Admin)
- **Body**: `{ teacherId, classId, subjectId }`

### `DELETE /api/teachers/assign/:linkId` (Staff & Admin)
- Removes assignment.

### `GET /api/teachers/export`
- Downloads `.xlsx` teacher directory.

---

## 5. Classes & Subjects

### `GET /api/classes`
- **Query**: `academicYearId`, `grade`
- **Response**: Classes list with student counts and teacher links.

### `POST /api/classes` (Staff & Admin)
- **Body**: `{ name, grade, section, academicYearId }`

### `GET /api/subjects`
- **Response**: Subjects list with teacher counts.

### `POST /api/subjects` (Staff & Admin)
- **Body**: `{ code, name, active }`

---

## 6. Academic Years & Enrollment

### `GET /api/academic-years`
### `POST /api/academic-years/:id/set-active` (Staff & Admin)
- Activates chosen academic year and deactivates others.

### `GET /api/enrollments`
- **Query**: `academicYearId`, `classId`, `studentId`, `page`, `limit`

### `POST /api/enrollments` (Staff & Admin)
- **Body**: `{ studentId, classId, academicYearId }`

### `POST /api/enrollments/bulk` (Staff & Admin)
- **Body**: `{ studentIds: [1, 2, 3], classId: 4, academicYearId: 1 }`

---

## 7. Attendance (`/api/attendance`)

### `GET /api/attendance/sheet`
- **Query**: `classId`, `date`
- **Response**: Enrolled students roster with existing attendance status.

### `POST /api/attendance/bulk`
- **Body**: `{ classId, date, records: [{ studentId, status: "PRESENT", note: "" }] }`

### `POST /api/attendance/mark-all-present`
- **Body**: `{ classId, date }`

### `GET /api/attendance/report`
- **Query**: `dateFrom`, `dateTo`, `classId`, `status`, `page`, `limit`

### `GET /api/attendance/export`
- Downloads `.xlsx` attendance history.

---

## 8. Grades (`/api/grades`)

### `GET /api/grades/sheet`
- **Query**: `classId`, `subjectId`, `examName`

### `POST /api/grades/bulk`
- **Body**: `{ classId, subjectId, examName, maxScore: 100, date, grades: [{ studentId, score }] }`

### `GET /api/grades/report`
- **Query**: `classId`, `academicYearId`, `examName`
- **Response**: Matrix of student scores across all subjects and computed averages.

### `GET /api/grades/export`
- Downloads `.xlsx` grades matrix spreadsheet.

---

## 9. User & Audit Management (Admin Only)

### `GET /api/users`
### `POST /api/users`
- **Body**: `{ email, fullName, password, role: "ADMIN"|"STAFF"|"TEACHER", teacherId }`

### `POST /api/users/:id/reset-password`
- **Body**: `{ newPassword: "..." }`

### `GET /api/audit-logs`
- **Query**: `action`, `entity`, `userId`, `page`, `limit`
