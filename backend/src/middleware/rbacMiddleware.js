function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // SUPER_ADMIN has full permissions to everything
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Permission denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    next();
  };
}

const superAdminOnly = requireRoles('SUPER_ADMIN');
const adminOnly = requireRoles('ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER');
const staffOnly = requireRoles('STAFF');
const teacherOnly = requireRoles('TEACHER');
const staffOrAdmin = requireRoles('ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF');
const allAuthenticated = requireRoles('ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF', 'TEACHER');

module.exports = {
  requireRoles,
  superAdminOnly,
  adminOnly,
  staffOnly,
  teacherOnly,
  staffOrAdmin,
  allAuthenticated
};
