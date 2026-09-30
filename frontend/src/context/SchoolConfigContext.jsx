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
        const isStale = !parsed.schoolNameAr || parsed.schoolNameAr.includes('النور') || parsed.schoolNameAr.includes('جذور');
        return {
          schoolCode: (!isStale && parsed.schoolCode) ? parsed.schoolCode : (import.meta.env.VITE_SCHOOL_CODE || 'SCH-ALSALAM-2026'),
          schoolNameAr: !isStale ? parsed.schoolNameAr : (import.meta.env.VITE_SCHOOL_NAME_AR || 'روضة ومدرسة مجموعة السلام التعليمية الخاصة'),
          schoolNameEn: (!isStale && parsed.schoolNameEn) ? parsed.schoolNameEn : (import.meta.env.VITE_SCHOOL_NAME_EN || 'Al-Salam Educational Group Private School & Kindergarten'),
          schoolSloganAr: !isStale ? (parsed.schoolSloganAr || import.meta.env.VITE_SCHOOL_SLOGAN_AR || 'البيئة التعليمية النموذجية الأولى في فلسطين - خبرة 25 عاماً من الإبداع والتميز') : (import.meta.env.VITE_SCHOOL_SLOGAN_AR || 'البيئة التعليمية النموذجية الأولى في فلسطين - خبرة 25 عاماً من الإبداع والتميز'),
          schoolSloganEn: !isStale ? (parsed.schoolSloganEn || import.meta.env.VITE_SCHOOL_SLOGAN_EN || "Palestine's Premier Model Educational Environment - 25 Years of Excellence") : (import.meta.env.VITE_SCHOOL_SLOGAN_EN || "Palestine's Premier Model Educational Environment - 25 Years of Excellence"),
          logoUrl: parsed.logoUrl !== undefined && !isStale ? parsed.logoUrl : (import.meta.env.VITE_SCHOOL_LOGO_URL || '/school-logo.png'),
          primaryColor: parsed.primaryColor || import.meta.env.VITE_PRIMARY_COLOR || '#166534',
          primaryHover: parsed.primaryHover || import.meta.env.VITE_PRIMARY_HOVER || '#14532d',
          instanceType: parsed.instanceType || import.meta.env.VITE_INSTANCE_TYPE || 'MASTER',
          supabaseProject: parsed.supabaseProject || import.meta.env.VITE_SUPABASE_PROJECT_ID || 'isolated-supabase-db',
          allocatedStorageMb: parseInt(parsed.allocatedStorageMb || import.meta.env.VITE_ALLOCATED_STORAGE_MB || '500', 10),
          supportEmail: !isStale ? (parsed.supportEmail || import.meta.env.VITE_SUPPORT_EMAIL || 'info@alsalam-school.edu.ps') : (import.meta.env.VITE_SUPPORT_EMAIL || 'info@alsalam-school.edu.ps'),
          supportPhone: !isStale ? (parsed.supportPhone || import.meta.env.VITE_SUPPORT_PHONE || '+970 59 312 4444') : (import.meta.env.VITE_SUPPORT_PHONE || '+970 59 312 4444'),
          schoolStartTime: parsed.schoolStartTime || '07:45',
        };
      }
    } catch (e) {
      console.warn('Failed to parse saved school config from localStorage', e);
    }

    return {
      schoolCode: import.meta.env.VITE_SCHOOL_CODE || 'SCH-ALSALAM-2026',
      schoolNameAr: import.meta.env.VITE_SCHOOL_NAME_AR || 'روضة ومدرسة مجموعة السلام التعليمية الخاصة',
      schoolNameEn: import.meta.env.VITE_SCHOOL_NAME_EN || 'Al-Salam Educational Group Private School & Kindergarten',
      schoolSloganAr: import.meta.env.VITE_SCHOOL_SLOGAN_AR || 'البيئة التعليمية النموذجية الأولى في فلسطين - خبرة 25 عاماً من الإبداع والتميز',
      schoolSloganEn: import.meta.env.VITE_SCHOOL_SLOGAN_EN || "Palestine's Premier Model Educational Environment - 25 Years of Excellence",
      logoUrl: import.meta.env.VITE_SCHOOL_LOGO_URL || '/school-logo.png',
      primaryColor: import.meta.env.VITE_PRIMARY_COLOR || '#166534',
      primaryHover: import.meta.env.VITE_PRIMARY_HOVER || '#14532d',
      instanceType: import.meta.env.VITE_INSTANCE_TYPE || 'MASTER', // MASTER | DEDICATED_SCHOOL
      supabaseProject: import.meta.env.VITE_SUPABASE_PROJECT_ID || 'isolated-supabase-db',
      allocatedStorageMb: parseInt(import.meta.env.VITE_ALLOCATED_STORAGE_MB || '500', 10),
      supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'info@alsalam-school.edu.ps',
      supportPhone: import.meta.env.VITE_SUPPORT_PHONE || '+970 59 312 4444',
      schoolStartTime: '07:45',
    };
  });

  // Dynamically inject the school's primary color into CSS root variables and listen for multi-tab updates
  useEffect(() => {
    if (config.primaryColor) {
      document.documentElement.style.setProperty('--primary', config.primaryColor);
      document.documentElement.style.setProperty('--primary-hover', config.primaryHover || config.primaryColor);
      document.documentElement.style.setProperty('--primary-light', `${config.primaryColor}15`);
    }

    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setConfig(prev => ({ ...prev, ...parsed }));
        }
      } catch {}
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [config.primaryColor, config.primaryHover]);

  // Update branding helper and persist to localStorage
  const updateSchoolBranding = (newValues) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newValues };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error('Failed to persist school config to localStorage', err);
      }
      return updated;
    });
  };

  // Update any school configuration settings
  const updateSchoolConfig = (newSettings) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
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
      schoolCode: import.meta.env.VITE_SCHOOL_CODE || 'SCH-ALSALAM-2026',
      schoolNameAr: import.meta.env.VITE_SCHOOL_NAME_AR || 'روضة ومدرسة مجموعة السلام التعليمية الخاصة',
      schoolNameEn: import.meta.env.VITE_SCHOOL_NAME_EN || 'Al-Salam Educational Group Private School & Kindergarten',
      schoolSloganAr: import.meta.env.VITE_SCHOOL_SLOGAN_AR || 'البيئة التعليمية النموذجية الأولى في فلسطين - خبرة 25 عاماً من الإبداع والتميز',
      schoolSloganEn: import.meta.env.VITE_SCHOOL_SLOGAN_EN || "Palestine's Premier Model Educational Environment - 25 Years of Excellence",
      logoUrl: import.meta.env.VITE_SCHOOL_LOGO_URL || '/school-logo.png',
      primaryColor: import.meta.env.VITE_PRIMARY_COLOR || '#166534',
      primaryHover: import.meta.env.VITE_PRIMARY_HOVER || '#14532d',
      instanceType: import.meta.env.VITE_INSTANCE_TYPE || 'MASTER',
      supabaseProject: import.meta.env.VITE_SUPABASE_PROJECT_ID || 'isolated-supabase-db',
      allocatedStorageMb: parseInt(import.meta.env.VITE_ALLOCATED_STORAGE_MB || '500', 10),
      supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'info@alsalam-school.edu.ps',
      supportPhone: import.meta.env.VITE_SUPPORT_PHONE || '+970 59 312 4444',
      schoolStartTime: '07:45',
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
    updateSchoolConfig,
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
    schoolStartTime: config.schoolStartTime || '07:45',
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
