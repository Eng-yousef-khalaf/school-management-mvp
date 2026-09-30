import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function playChimeSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;
    
    // Tone 1: 659Hz (E5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Tone 2: 1318Hz (E6) shimmer
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1174.66, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.25);
    gain2.gain.setValueAtTime(0.12, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.7);
  } catch {}
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [pendingNotices, setPendingNotices] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [activePopupNotice, setActivePopupNotice] = useState(null);
  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      const stored = sessionStorage.getItem('dismissed_payment_notices');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const prevNoticeIdsRef = useRef(new Set());
  const prevRegIdsRef = useRef(new Set());
  const canReceiveAlerts = user?.role === 'STAFF' || user?.role === 'ADMIN' || user?.isDeveloper;

  const fetchNotices = useCallback(async () => {
    if (!canReceiveAlerts) {
      setPendingNotices([]);
      setPendingRegistrations([]);
      setActivePopupNotice(null);
      return;
    }

    // 1. Fetch pending fee transfers
    try {
      let list = [];
      try {
        const res = await api.get('/fees/pending-notices');
        list = Array.isArray(res) ? res : (res?.items || []);
      } catch {
        const raw = localStorage.getItem('school_mock_payments_store');
        if (raw) {
          const parsed = JSON.parse(raw);
          list = parsed.filter(p => p.status === 'PENDING');
        }
      }

      setPendingNotices(list);

      const currentIds = new Set(list.map(n => n.id));
      const newlyArrived = list.find(n => !prevNoticeIdsRef.current.has(n.id) && !dismissedIds.includes(n.id));

      if (newlyArrived) {
        setActivePopupNotice({ ...newlyArrived, noticeType: 'PAYMENT' });
        playChimeSound();
      } else if (list.length > 0 && !activePopupNotice) {
        const firstUndismissed = list.find(n => !dismissedIds.includes(n.id));
        if (firstUndismissed) {
          setActivePopupNotice({ ...firstUndismissed, noticeType: 'PAYMENT' });
        }
      }

      prevNoticeIdsRef.current = currentIds;
    } catch (err) {
      console.warn('Error fetching pending notices:', err);
    }

    // 2. Fetch pending online student registrations
    try {
      let regList = [];
      try {
        const res = await api.get('/students/registrations/all');
        regList = Array.isArray(res) ? res.filter(r => r.status === 'PENDING_APPROVAL') : [];
      } catch {
        const raw = localStorage.getItem('alsalam_online_registrations') || localStorage.getItem('jothoor_online_registrations');
        if (raw) {
          const parsed = JSON.parse(raw);
          regList = parsed.filter(r => r.status === 'PENDING_APPROVAL');
        }
      }

      setPendingRegistrations(regList);

      const currentRegIds = new Set(regList.map(r => r.registrationNumber || r.id));
      const newlyArrivedReg = regList.find(r => {
        const idKey = r.registrationNumber || r.id;
        return !prevRegIdsRef.current.has(idKey) && !dismissedIds.includes(idKey);
      });

      if (newlyArrivedReg && !activePopupNotice) {
        setActivePopupNotice({
          ...newlyArrivedReg,
          id: newlyArrivedReg.registrationNumber || newlyArrivedReg.id,
          noticeType: 'REGISTRATION'
        });
        playChimeSound();
      }

      prevRegIdsRef.current = currentRegIds;
    } catch (err) {
      console.warn('Error fetching online registrations:', err);
    }
  }, [canReceiveAlerts, dismissedIds, activePopupNotice]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  // Real-time multi-tab and poll listener
  useEffect(() => {
    if (!canReceiveAlerts) return;

    const handleSync = () => {
      fetchNotices();
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('payment_notice_updated', handleSync);
    window.addEventListener('new_student_registration', handleSync);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') fetchNotices();
    });

    const timer = setInterval(fetchNotices, 4000);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('payment_notice_updated', handleSync);
      window.removeEventListener('new_student_registration', handleSync);
      clearInterval(timer);
    };
  }, [canReceiveAlerts, fetchNotices]);

  const dismissPopup = (noticeId) => {
    if (!noticeId) {
      setActivePopupNotice(null);
      return;
    }
    const updated = [...dismissedIds, noticeId];
    setDismissedIds(updated);
    try {
      sessionStorage.setItem('dismissed_payment_notices', JSON.stringify(updated));
    } catch {}
    setActivePopupNotice(null);
  };

  const showPopupForNotice = (notice) => {
    if (!canReceiveAlerts) return;
    setActivePopupNotice(notice);
    playChimeSound();
  };

  const pendingRegistrationsCount = pendingRegistrations.length;
  const unreadCount = pendingNotices.length + pendingRegistrationsCount;

  return (
    <NotificationContext.Provider
      value={{
        pendingNotices: canReceiveAlerts ? pendingNotices : [],
        pendingRegistrations: canReceiveAlerts ? pendingRegistrations : [],
        pendingRegistrationsCount: canReceiveAlerts ? pendingRegistrationsCount : 0,
        unreadCount: canReceiveAlerts ? unreadCount : 0,
        activePopupNotice: canReceiveAlerts ? activePopupNotice : null,
        dismissPopup,
        showPopupForNotice,
        refreshNotices: fetchNotices,
        playChime: playChimeSound,
        isStaffOnly: canReceiveAlerts
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    return {
      pendingNotices: [],
      unreadCount: 0,
      activePopupNotice: null,
      dismissPopup: () => {},
      showPopupForNotice: () => {},
      refreshNotices: () => {},
      playChime: () => {},
      isStaffOnly: false
    };
  }
  return ctx;
}
