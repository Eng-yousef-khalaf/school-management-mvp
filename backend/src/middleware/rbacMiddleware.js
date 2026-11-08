function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Permission denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    next();
  };
}

const adminOnly = requireRoles('ADMIN');
const staffOnly = requireRoles('STAFF');
const teacherOnly = requireRoles('TEACHER');
const staffOrAdmin = requireRoles('ADMIN', 'STAFF');
const allAuthenticated = requireRoles('ADMIN', 'STAFF', 'TEACHER');

module.exports = {
  requireRoles,
  adminOnly,
  staffOnly,
  teacherOnly,
  staffOrAdmin,
  allAuthenticated
};
