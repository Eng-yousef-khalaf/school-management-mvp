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
  const isStaffOnly = user?.role === 'STAFF';

  const fetchNotices = useCallback(async () => {
    if (!isStaffOnly) {
      setPendingNotices([]);
      setActivePopupNotice(null);
      return;
    }
    try {
      // Read from API or fallback to localStorage
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

      // Check for newly arrived notices that weren't in previous set and not dismissed
      const currentIds = new Set(list.map(n => n.id));
      const newlyArrived = list.find(n => !prevNoticeIdsRef.current.has(n.id) && !dismissedIds.includes(n.id));

      if (newlyArrived) {
        setActivePopupNotice(newlyArrived);
        playChimeSound();
      } else if (list.length > 0 && !activePopupNotice) {
        // If there's an un-dismissed pending notice, show it
        const firstUndismissed = list.find(n => !dismissedIds.includes(n.id));
        if (firstUndismissed) {
          setActivePopupNotice(firstUndismissed);
        }
      }

      prevNoticeIdsRef.current = currentIds;
    } catch (err) {
      console.warn('Error fetching pending notices:', err);
    }
  }, [isStaffOnly, dismissedIds, activePopupNotice]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  // Real-time multi-tab and poll listener
  useEffect(() => {
    if (!isStaffOnly) return;

    const handleSync = () => {
      fetchNotices();
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('payment_notice_updated', handleSync);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') fetchNotices();
    });

    const timer = setInterval(fetchNotices, 4000);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('payment_notice_updated', handleSync);
      clearInterval(timer);
    };
  }, [isStaffOnly, fetchNotices]);

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
    if (!isStaffOnly) return;
    setActivePopupNotice(notice);
    playChimeSound();
  };

  return (
    <NotificationContext.Provider
      value={{
        pendingNotices: isStaffOnly ? pendingNotices : [],
        unreadCount: isStaffOnly ? pendingNotices.length : 0,
        activePopupNotice: isStaffOnly ? activePopupNotice : null,
        dismissPopup,
        showPopupForNotice,
        refreshNotices: fetchNotices,
        playChime: playChimeSound,
        isStaffOnly
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
