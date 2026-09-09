function errorHandler(err, req, res, next) {
  console.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    code: err.code
  });

  // Prisma Unique Constraint Error
  if (err.code === 'P2002') {
    const fields = err.meta?.target || [];
    let message = 'A record with this unique value already exists.';
    if (fields.includes('studentNumber')) message = 'Student number already exists.';
    else if (fields.includes('employeeNo')) message = 'Teacher employee number already exists.';
    else if (fields.includes('email')) message = 'Email address is already in use.';
    else if (fields.includes('code')) message = 'Subject code already exists.';
    else if (fields.includes('name')) message = 'Name already exists in this context.';
    else if (fields.includes('studentId') && fields.includes('date')) message = 'Attendance for this student on this date already exists.';
    else if (fields.includes('studentId') && fields.includes('classId')) message = 'Student is already enrolled in this class.';
    return res.status(409).json({ error: message, field: fields[0] });
  }

  // Prisma Record Not Found
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Requested record was not found.' });
  }

  // Prisma Foreign Key Failure
  if (err.code === 'P2003') {
    return res.status(400).json({ error: 'Related record does not exist or has active dependencies.' });
  }

  // Multer Errors
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'An unexpected internal server error occurred.'
    : err.message || 'Internal server error';

  res.status(statusCode).json({ error: message });
}

module.exports = errorHandler;
