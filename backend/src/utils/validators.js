const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const studentSchema = z.object({
  studentNumber: z.string().min(1, 'Student number is required'),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional().nullable(),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  parentName: z.string().optional().nullable(),
  parentPhone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'WITHDRAWN']).default('ACTIVE')
});

const teacherSchema = z.object({
  employeeNo: z.string().min(1, 'Employee number is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional().nullable(),
  email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  specialty: z.string().optional().nullable(),
  active: z.boolean().default(true)
});

const classSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  grade: z.string().min(1, 'Grade is required'),
  section: z.string().optional().nullable(),
  academicYearId: z.coerce.number().int().positive('Academic Year is required')
});

const subjectSchema = z.object({
  code: z.string().min(1, 'Subject code is required').toUpperCase(),
  name: z.string().min(1, 'Subject name is required'),
  active: z.boolean().default(true)
});

const academicYearSchema = z.object({
  name: z.string().min(1, 'Academic year name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  active: z.boolean().default(false)
});

const enrollmentSchema = z.object({
  studentId: z.coerce.number().int().positive('Valid Student ID is required'),
  classId: z.coerce.number().int().positive('Valid Class ID is required'),
  academicYearId: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().int().positive().nullable().optional()
  )
});

const attendanceRecordSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  classId: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().int().positive().nullable().optional()
  ),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
  note: z.string().optional().nullable()
});

const bulkAttendanceSchema = z.object({
  classId: z.coerce.number().int().positive('Class ID is required'),
  date: z.string().min(1, 'Date is required'),
  records: z.array(z.object({
    studentId: z.coerce.number().int().positive(),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
    note: z.string().optional().nullable()
  }))
});

const gradeSchema = z.object({
  studentId: z.coerce.number().int().positive('Student ID is required'),
  subjectId: z.coerce.number().int().positive('Subject ID is required'),
  classId: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().int().positive().nullable().optional()
  ),
  examName: z.string().min(1, 'Exam name is required'),
  score: z.coerce.number().min(0, 'Score must be 0 or greater'),
  maxScore: z.coerce.number().min(1, 'Max score must be greater than 0').default(100),
  date: z.string().optional().nullable()
});

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(1, 'Full name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['ADMIN', 'STAFF', 'TEACHER']).default('STAFF'),
  active: z.boolean().default(true),
  teacherId: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().int().positive().nullable().optional()
  )
});

module.exports = {
  loginSchema,
  studentSchema,
  teacherSchema,
  classSchema,
  subjectSchema,
  academicYearSchema,
  enrollmentSchema,
  attendanceRecordSchema,
  bulkAttendanceSchema,
  gradeSchema,
  userSchema
};
