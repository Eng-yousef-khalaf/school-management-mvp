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
    if (targetRole === 'TEACHER') targetEmail = 'teacher@school.local';

    return login(targetEmail, 'ChangeMe123!');
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

  const isAdmin = user?.role === 'ADMIN';
  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN'; // Admin inherits general staff structural privileges
  const isTeacher = user?.role === 'TEACHER';
  
  // Specific permission capabilities
  const canManageStudents = user?.role === 'STAFF'; // Student data entry & admissions belongs strictly to Staff
  const canManageUsers = user?.role === 'ADMIN'; // User accounts & security audit belongs strictly to Admin
  const canAudit = user?.role === 'ADMIN';
  const canManageStructure = user?.role === 'ADMIN' || user?.role === 'STAFF';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        switchPortalRole,
        fetchProfile,
        isAdmin,
        isStaff,
        isTeacher,
        canManageStudents,
        canManageUsers,
        canAudit,
        canManageStructure
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
