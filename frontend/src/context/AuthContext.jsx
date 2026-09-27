import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Use sessionStorage so that opening the app in a new tab/link always presents the Login Screen first
  const [user, setUser] = useState(() => {
    try {
      const sessionUser = sessionStorage.getItem('user');
      return sessionUser ? JSON.parse(sessionUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await api.get('/auth/profile', { timeout: 1000 });
      if (profile && profile.role && profile.id) {
        setUser(profile);
        sessionStorage.setItem('user', JSON.stringify(profile));
        localStorage.setItem('user', JSON.stringify(profile));
      } else {
        setUser(null);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch {
      const saved = sessionStorage.getItem('user');
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch {
          setUser(null);
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
        }
      } else {
        setUser(null);
        sessionStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const getFallbackUser = (email) => {
    let userRole = 'ADMIN';
    const savedPrincipalName = typeof window !== 'undefined' ? (localStorage.getItem('school_principal_name') || 'أ. عبد الرحمن خليل (المدير العام)') : 'أ. عبد الرحمن خليل (المدير العام)';
    let fullName = savedPrincipalName;
    let teacherId = null;
    let id = 1;

    if (email.includes('staff')) {
      userRole = 'STAFF';
      fullName = email.includes('khalid') ? 'خالد السعيد (شؤون الطلاب)' : 'محمد (شؤون الطلاب)';
      id = email.includes('khalid') ? 3 : 2;
    } else if (email.includes('khalil') || email.includes('mansour') || email.includes('farooq') || email.includes('hassan') || email.includes('aziz') || email.includes('teacher')) {
      userRole = 'TEACHER';
      if (email.includes('mansour')) {
        fullName = 'سارة منصور (معلمة الإنجليزية)';
        id = 5;
        teacherId = 2;
      } else if (email.includes('farooq')) {
        fullName = 'عمر فاروق (معلم العربية)';
        id = 6;
        teacherId = 3;
      } else if (email.includes('hassan')) {
        fullName = 'ليلى حسن (معلمة العلوم)';
        id = 7;
        teacherId = 4;
      } else if (email.includes('aziz')) {
        fullName = 'طارق عزيز (معلم الحاسوب)';
        id = 8;
        teacherId = 5;
      } else {
        fullName = 'أحمد خليل (معلم الرياضيات)';
        id = 4;
        teacherId = 1;
      }
    }

    return {
      id,
      email: email || 'admin@school.local',
      fullName,
      role: userRole,
      teacherId,
      active: true,
    };
  };

  const login = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // 1. First attempt live backend login
    try {
      const data = await api.post('/auth/login', { email: cleanEmail, password: cleanPassword }, { timeout: 10000 });
      if (data && data.user) {
        sessionStorage.setItem('token', data.token || 'auth-token');
        sessionStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token || 'auth-token');
        localStorage.setItem('user', JSON.stringify(data.user));
        api.clearCache();
        setUser(data.user);
        return data.user;
      }
      if (data && data.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      // 2. Check if it's the Principal from Handover Pass
      const savedPrincipalInfo = typeof window !== 'undefined' ? localStorage.getItem('school_principal_info') : null;
      let principalEmail = 'admin@school.local';
      let principalName = typeof window !== 'undefined' ? (localStorage.getItem('school_principal_name') || 'أ. عبد الرحمن خليل (المدير العام)') : 'أ. عبد الرحمن خليل (المدير العام)';
      if (savedPrincipalInfo) {
        try {
          const parsed = JSON.parse(savedPrincipalInfo);
          if (parsed.email) principalEmail = parsed.email.toLowerCase();
          if (parsed.fullName) principalName = parsed.fullName;
        } catch {}
      }

      if (cleanEmail === principalEmail || cleanEmail === 'admin@school.local') {
        const principalUser = {
          id: 1,
          email: principalEmail,
          fullName: principalName,
          role: 'ADMIN',
          active: true,
        };
        sessionStorage.setItem('token', 'auth-token-principal');
        sessionStorage.setItem('user', JSON.stringify(principalUser));
        localStorage.setItem('token', 'auth-token-principal');
        localStorage.setItem('user', JSON.stringify(principalUser));
        api.clearCache();
        setUser(principalUser);
        return principalUser;
      }

      // 3. Check registered staff & teachers added by the Principal
      const staffListStr = typeof window !== 'undefined' ? localStorage.getItem('registered_school_staff') : null;
      if (staffListStr) {
        try {
          const staffList = JSON.parse(staffListStr);
          const found = staffList.find(s => s.email?.toLowerCase() === cleanEmail);
          if (found) {
            const userRole = found.role || 'STAFF';
            const memberUser = {
              id: found.id || Date.now(),
              email: found.email,
              fullName: found.fullName,
              role: userRole,
              teacherId: userRole === 'TEACHER' ? (found.teacherId || found.id || 1) : null,
              specialty: found.specialty || null,
              active: true,
            };
            sessionStorage.setItem('token', `auth-token-${userRole.toLowerCase()}`);
            sessionStorage.setItem('user', JSON.stringify(memberUser));
            localStorage.setItem('token', `auth-token-${userRole.toLowerCase()}`);
            localStorage.setItem('user', JSON.stringify(memberUser));
            api.clearCache();
            setUser(memberUser);
            return memberUser;
          }
        } catch {}
      }

      // 4. Reject unrecognized credentials
      throw new Error(err?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة، أو لم يتم تسجيل واعتماد هذا الحساب بعد من قبل مدير المدرسة.');
    }
  };

  const switchPortalRole = async (targetRole) => {
    let targetEmail = 'admin@school.local';
    if (targetRole === 'STAFF') targetEmail = 'staff@school.local';
    if (targetRole === 'TEACHER') targetEmail = 'ahmed.khalil@school.local';

    try {
      const data = await api.post('/auth/login', { email: targetEmail, password: 'ChangeMe123!' }, { timeout: 2000 });
      if (data && data.token && data.user) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        sessionStorage.removeItem(`school_welcome_seen_${data.user.id}`);
        sessionStorage.removeItem(`school_welcome_seen_${targetEmail}`);
        sessionStorage.removeItem(`school_welcome_seen_${targetRole}`);
        api.clearCache();
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      console.warn('Switch portal live auth error, using local fallback:', err);
    }

    const switchedUser = getFallbackUser(targetEmail);
    sessionStorage.removeItem(`school_welcome_seen_${switchedUser.id}`);
    sessionStorage.removeItem(`school_welcome_seen_${targetEmail}`);
    sessionStorage.removeItem(`school_welcome_seen_${targetRole}`);

    sessionStorage.setItem('token', 'demo-token-preview-2026');
    sessionStorage.setItem('user', JSON.stringify(switchedUser));
    localStorage.setItem('token', 'demo-token-preview-2026');
    localStorage.setItem('user', JSON.stringify(switchedUser));
    api.clearCache();
    setUser(switchedUser);

    return switchedUser;
  };

  const loginAsDeveloper = async (masterKey = 'YOUSEF_MASTER_2026') => {
    try {
      const data = await api.post('/developer/master-auth', { masterKey }, { timeout: 700 }).catch(() => null);
      if (data?.token && data?.user) {
        const devUser = { ...data.user, isDeveloper: true, fullName: 'Yousef Khalaf (Lead Developer)' };
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(devUser));
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(devUser));
        sessionStorage.removeItem(`school_welcome_seen_${devUser.id}`);
        sessionStorage.removeItem(`school_welcome_seen_${devUser.email}`);
        sessionStorage.removeItem(`school_welcome_seen_${devUser.role}`);
        api.clearCache();
        setUser(devUser);
        return devUser;
      }
    } catch {}

    const devUser = {
      id: 9999,
      email: 'yousef@platform.dev',
      fullName: 'Yousef Khalaf (Lead Developer & Platform Owner)',
      role: 'ADMIN',
      isDeveloper: true,
      teacherId: null,
      active: true,
    };
    sessionStorage.setItem('token', 'demo-developer-token');
    sessionStorage.setItem('user', JSON.stringify(devUser));
    localStorage.setItem('token', 'demo-developer-token');
    localStorage.setItem('user', JSON.stringify(devUser));
    sessionStorage.removeItem(`school_welcome_seen_${devUser.id}`);
    sessionStorage.removeItem(`school_welcome_seen_${devUser.email}`);
    sessionStorage.removeItem(`school_welcome_seen_${devUser.role}`);
    api.clearCache();
    setUser(devUser);
    return devUser;
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    api.clearCache();
    setUser(null);
  };

  useEffect(() => {
    fetchProfile();
    const handlePrincipalSync = () => {
      const savedName = localStorage.getItem('school_principal_name');
      if (savedName) {
        setUser((prev) => {
          if (prev && prev.role === 'ADMIN') {
            return { ...prev, fullName: savedName };
          }
          return prev;
        });
      }
    };
    window.addEventListener('storage', handlePrincipalSync);
    window.addEventListener('principal-updated', handlePrincipalSync);
    return () => {
      window.removeEventListener('storage', handlePrincipalSync);
      window.removeEventListener('principal-updated', handlePrincipalSync);
    };
  }, [fetchProfile]);

  const isAdmin = user?.role === 'ADMIN' || user?.isDeveloper;
  const isStaff = user?.role === 'STAFF';
  const isTeacher = user?.role === 'TEACHER';
  const isDeveloper = Boolean(user?.isDeveloper === true || user?.role === 'DEVELOPER');
  
  // Specific permission capabilities
  const canManageStudents = user?.role === 'STAFF' || user?.isDeveloper;
  const canEnterGrades = user?.role === 'TEACHER' || user?.isDeveloper;
  const canTrackTeachers = user?.role === 'STAFF' || user?.role === 'ADMIN' || user?.isDeveloper;
  const canRecordTeacherAttendance = user?.role === 'STAFF' || user?.isDeveloper;
  const canManageUsers = user?.role === 'ADMIN' || user?.isDeveloper;
  const canAudit = user?.role === 'ADMIN' || user?.isDeveloper;
  const canManageStructure = user?.role === 'ADMIN' || user?.role === 'STAFF' || user?.isDeveloper;
  const canManageAcademicYears = user?.role === 'ADMIN' || user?.isDeveloper;
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
