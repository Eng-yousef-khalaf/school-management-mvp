import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const SchoolConfigContext = createContext(null);
const STORAGE_KEY = 'smart_school_instance_config';

export function SchoolConfigProvider({ children }) {
  // Read initial school configuration from localStorage or environment variables with sensible defaults
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          schoolCode: parsed.schoolCode || import.meta.env.VITE_SCHOOL_CODE || 'SCH-MASTER',
          schoolNameAr: parsed.schoolNameAr || import.meta.env.VITE_SCHOOL_NAME_AR || 'نظام إدارة المدرسة الذكي',
          schoolNameEn: parsed.schoolNameEn || import.meta.env.VITE_SCHOOL_NAME_EN || 'Smart School Management System',
          schoolSloganAr: parsed.schoolSloganAr || import.meta.env.VITE_SCHOOL_SLOGAN_AR || 'المنصة الأكاديمية الشاملة لإدارة العمليات المدرسية',
          schoolSloganEn: parsed.schoolSloganEn || import.meta.env.VITE_SCHOOL_SLOGAN_EN || 'Comprehensive Academic & School Operations Platform',
          logoUrl: parsed.logoUrl !== undefined ? parsed.logoUrl : (import.meta.env.VITE_SCHOOL_LOGO_URL || ''),
          primaryColor: parsed.primaryColor || import.meta.env.VITE_PRIMARY_COLOR || '#4f46e5',
          primaryHover: parsed.primaryHover || import.meta.env.VITE_PRIMARY_HOVER || '#4338ca',
          instanceType: parsed.instanceType || import.meta.env.VITE_INSTANCE_TYPE || 'MASTER',
          supabaseProject: parsed.supabaseProject || import.meta.env.VITE_SUPABASE_PROJECT_ID || 'isolated-supabase-db',
          allocatedStorageMb: parseInt(parsed.allocatedStorageMb || import.meta.env.VITE_ALLOCATED_STORAGE_MB || '500', 10),
          supportEmail: parsed.supportEmail || import.meta.env.VITE_SUPPORT_EMAIL || 'support@school-management.dev',
          supportPhone: parsed.supportPhone || import.meta.env.VITE_SUPPORT_PHONE || '+966 50 000 0000',
        };
      }
    } catch (e) {
      console.warn('Failed to parse saved school config from localStorage', e);
    }

    return {
      schoolCode: import.meta.env.VITE_SCHOOL_CODE || 'SCH-MASTER',
      schoolNameAr: import.meta.env.VITE_SCHOOL_NAME_AR || 'نظام إدارة المدرسة الذكي',
      schoolNameEn: import.meta.env.VITE_SCHOOL_NAME_EN || 'Smart School Management System',
      schoolSloganAr: import.meta.env.VITE_SCHOOL_SLOGAN_AR || 'المنصة الأكاديمية الشاملة لإدارة العمليات المدرسية',
      schoolSloganEn: import.meta.env.VITE_SCHOOL_SLOGAN_EN || 'Comprehensive Academic & School Operations Platform',
      logoUrl: import.meta.env.VITE_SCHOOL_LOGO_URL || '',
      primaryColor: import.meta.env.VITE_PRIMARY_COLOR || '#4f46e5',
      primaryHover: import.meta.env.VITE_PRIMARY_HOVER || '#4338ca',
      instanceType: import.meta.env.VITE_INSTANCE_TYPE || 'MASTER', // MASTER | DEDICATED_SCHOOL
      supabaseProject: import.meta.env.VITE_SUPABASE_PROJECT_ID || 'isolated-supabase-db',
      allocatedStorageMb: parseInt(import.meta.env.VITE_ALLOCATED_STORAGE_MB || '500', 10),
      supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@school-management.dev',
      supportPhone: import.meta.env.VITE_SUPPORT_PHONE || '+966 50 000 0000',
    };
  });

  // Dynamically inject the school's primary color into CSS root variables
  useEffect(() => {
    if (config.primaryColor) {
      document.documentElement.style.setProperty('--primary', config.primaryColor);
      document.documentElement.style.setProperty('--primary-hover', config.primaryHover || config.primaryColor);
      document.documentElement.style.setProperty('--primary-light', `${config.primaryColor}15`);
    }
  }, [config.primaryColor, config.primaryHover]);

  // Update branding helper and persist to localStorage
  const updateSchoolBranding = (newValues) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newValues };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to persist school config to localStorage', err);
      }
      return updated;
    });
  };

  // Reset to environment defaults
  const resetSchoolBranding = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    setConfig({
      schoolCode: import.meta.env.VITE_SCHOOL_CODE || 'SCH-MASTER',
      schoolNameAr: import.meta.env.VITE_SCHOOL_NAME_AR || 'نظام إدارة المدرسة الذكي',
      schoolNameEn: import.meta.env.VITE_SCHOOL_NAME_EN || 'Smart School Management System',
      schoolSloganAr: import.meta.env.VITE_SCHOOL_SLOGAN_AR || 'المنصة الأكاديمية الشاملة لإدارة العمليات المدرسية',
      schoolSloganEn: import.meta.env.VITE_SCHOOL_SLOGAN_EN || 'Comprehensive Academic & School Operations Platform',
      logoUrl: import.meta.env.VITE_SCHOOL_LOGO_URL || '',
      primaryColor: import.meta.env.VITE_PRIMARY_COLOR || '#4f46e5',
      primaryHover: import.meta.env.VITE_PRIMARY_HOVER || '#4338ca',
      instanceType: import.meta.env.VITE_INSTANCE_TYPE || 'MASTER',
      supabaseProject: import.meta.env.VITE_SUPABASE_PROJECT_ID || 'isolated-supabase-db',
      allocatedStorageMb: parseInt(import.meta.env.VITE_ALLOCATED_STORAGE_MB || '500', 10),
      supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@school-management.dev',
      supportPhone: import.meta.env.VITE_SUPPORT_PHONE || '+966 50 000 0000',
    });
  };

  // Update browser document title dynamically
  const updateDocumentTitle = (pageTitle, isRtl) => {
    const schoolName = isRtl ? config.schoolNameAr : config.schoolNameEn;
    document.title = pageTitle ? `${pageTitle} | ${schoolName}` : schoolName;
  };

  const value = useMemo(() => ({
    config,
    setConfig,
    updateSchoolBranding,
    resetSchoolBranding,
    updateDocumentTitle,
    isMasterInstance: config.instanceType === 'MASTER',
    schoolNameAr: config.schoolNameAr,
    schoolNameEn: config.schoolNameEn,
    schoolSloganAr: config.schoolSloganAr,
    schoolSloganEn: config.schoolSloganEn,
    logoUrl: config.logoUrl,
    primaryColor: config.primaryColor,
    schoolCode: config.schoolCode,
    allocatedStorageMb: config.allocatedStorageMb,
  }), [config]);

  return (
    <SchoolConfigContext.Provider value={value}>
      {children}
    </SchoolConfigContext.Provider>
  );
}

export function useSchoolConfig() {
  const context = useContext(SchoolConfigContext);
  if (!context) {
    throw new Error('useSchoolConfig must be used within a SchoolConfigProvider');
  }
  return context;
}
