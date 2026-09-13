import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await api.get('/auth/profile');
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const switchPortalRole = async (targetRole) => {
    let targetEmail = 'admin@school.local';
    if (targetRole === 'STAFF') targetEmail = 'staff@school.local';
    if (targetRole === 'TEACHER') targetEmail = 'ahmed.khalil@school.local';

    return login(targetEmail, 'ChangeMe123!');
  };

  const loginAsDeveloper = async (masterKey = 'YOUSEF_MASTER_2026') => {
    try {
      // Try developer master authentication via backend
      const data = await api.post('/developer/master-auth', { masterKey }).catch(async () => {
        // Fallback to local admin login
        return login('admin@school.local', 'ChangeMe123!');
      });

      if (data?.token && data?.user) {
        localStorage.setItem('token', data.token);
        const devUser = { ...data.user, isDeveloper: true, fullName: 'Yousef Khalaf (Lead Developer)' };
        localStorage.setItem('user', JSON.stringify(devUser));
        setUser(devUser);
        return devUser;
      }
      return data;
    } catch {
      return login('admin@school.local', 'ChangeMe123!');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };


  useEffect(() => {
    fetchProfile();

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [fetchProfile]);

  const isAdmin = user?.role === 'ADMIN' || user?.isDeveloper;
  const isStaff = user?.role === 'STAFF';
  const isTeacher = user?.role === 'TEACHER';
  const isDeveloper = user?.isDeveloper || user?.email?.includes('dev') || user?.role === 'ADMIN';
  
  // Specific permission capabilities
  const canManageStudents = user?.role === 'STAFF' || user?.isDeveloper; // Student data entry & admissions belongs strictly to Staff
  const canEnterGrades = user?.role === 'TEACHER' || user?.isDeveloper; // Grade entry belongs exclusively to Teachers
  const canTrackTeachers = user?.role === 'STAFF' || user?.role === 'ADMIN' || user?.isDeveloper; // Staff & Admin can view teacher presence
  const canRecordTeacherAttendance = user?.role === 'STAFF' || user?.isDeveloper; // Staff can take action
  const canManageUsers = user?.role === 'ADMIN' || user?.isDeveloper; // User accounts & security audit
  const canAudit = user?.role === 'ADMIN' || user?.isDeveloper;
  const canManageStructure = user?.role === 'ADMIN' || user?.role === 'STAFF' || user?.isDeveloper;
  const canManageAcademicYears = user?.role === 'ADMIN' || user?.isDeveloper; // Strictly Admin & Super Admin
  const isAdminReadOnly = user?.role === 'ADMIN' && !user?.isDeveloper;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginAsDeveloper,
        logout,
        switchPortalRole,
        fetchProfile,
        isAdmin,
        isStaff,
        isTeacher,
        isDeveloper,
        canManageStudents,
        canEnterGrades,
        canTrackTeachers,
        canRecordTeacherAttendance,
        canManageUsers,
        canAudit,
        canManageStructure,
        canManageAcademicYears,
        isAdminReadOnly
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
