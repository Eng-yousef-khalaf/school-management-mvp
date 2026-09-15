import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const AcademicYearContext = createContext(null);

const DEFAULT_ACTIVE_YEAR = {
  id: 1,
  name: '2026/2027',
  startDate: '2026-09-01',
  endDate: '2027-06-30',
  active: true,
  isCurrent: true
};

const DEFAULT_ALL_YEARS = [
  {
    id: 1,
    name: '2026/2027',
    startDate: '2026-09-01',
    endDate: '2027-06-30',
    active: true,
    isCurrent: true,
    _count: { classes: 4, enrollments: 10 }
  },
  {
    id: 2,
    name: '2025/2026',
    startDate: '2025-09-01',
    endDate: '2026-06-30',
    active: false,
    isCurrent: false,
    _count: { classes: 4, enrollments: 10 }
  }
];

export function AcademicYearProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();

  const [activeYear, setActiveYear] = useState(DEFAULT_ACTIVE_YEAR);
  const [allYears, setAllYears] = useState(DEFAULT_ALL_YEARS);
  const [selectedYearId, setSelectedYearId] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchYears = useCallback(async () => {
    try {
      const [activeRes, allRes] = await Promise.all([
        api.get('/academic-years/active').catch(() => null),
        user?.role === 'ADMIN' ? api.get('/academic-years').catch(() => []) : Promise.resolve([])
      ]);

      if (activeRes && activeRes.id) {
        setActiveYear(activeRes);
        setSelectedYearId(prev => (prev ? prev : activeRes.id));
      }

      if (Array.isArray(allRes) && allRes.length > 0) {
        setAllYears(allRes);
      }
    } catch (err) {
      console.error('Academic years background sync notice:', err);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchYears();
  }, [fetchYears]);

  // If user is not admin, always enforce active year
  useEffect(() => {
    if (user?.role !== 'ADMIN' && activeYear) {
      setSelectedYearId(activeYear.id);
    }
  }, [user?.role, activeYear]);

  const selectedYear = (allYears && allYears.find(y => y.id === selectedYearId)) || activeYear;
  const isArchiveView = Boolean(
    user?.role === 'ADMIN' &&
    activeYear &&
    selectedYear &&
    selectedYear.id !== activeYear.id
  );

  const setViewingYearId = (yearId) => {
    if (user?.role !== 'ADMIN') return;
    const yId = yearId ? Number(yearId) : activeYear?.id;
    setSelectedYearId(yId);
    const target = allYears.find(y => y.id === yId);
    if (target && !target.active) {
      toast.info(`تم الانتقال إلى أرشيف العام الدراسي (${target.name}) في وضع القراءة والمراجعة.`);
    } else {
      toast.success('تمت العودة إلى العام الدراسي الحالي النشط.');
    }
  };

  const resetToActiveYear = () => {
    if (activeYear) {
      setSelectedYearId(activeYear.id);
      toast.success('تمت العودة إلى العام الدراسي الحالي النشط.');
    }
  };

  return (
    <AcademicYearContext.Provider
      value={{
        activeYear,
        allYears,
        selectedYearId,
        selectedYear,
        isArchiveView,
        loading,
        fetchYears,
        setViewingYearId,
        resetToActiveYear
      }}
    >
      {children}
    </AcademicYearContext.Provider>
  );
}

export function useAcademicYear() {
  const context = useContext(AcademicYearContext);
  if (!context) {
    throw new Error('useAcademicYear must be used within an AcademicYearProvider');
  }
  return context;
}
