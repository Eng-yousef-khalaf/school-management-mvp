import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import StatCard from '../../components/common/StatCard';
import { TeachersIcon, AttendanceIcon, CheckIcon } from '../../components/common/Icons';

// Official school morning start time reference (7:45 AM)
const OFFICIAL_START_HOUR = 7;
const OFFICIAL_START_MINUTE = 45;

export default function TeacherTracker({ onViewTeacher }) {
  const toast = useToast();
  const { user, isAdmin, isStaff, canRecordTeacherAttendance } = useAuth();
  const { t, isRtl } = useLanguage();

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState(null);

  // Live Current Time display
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // Edit / Custom Check-in Modal
  const [editingItem, setEditingItem] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('PRESENT');
  const [timeInput, setTimeInput] = useState('');
  const [noteInput, setNoteInput] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/teachers/attendance/today?date=${date}`);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load teacher attendance tracker');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  // Helper to parse time string like "08:15 AM", "08:15", "8:15 ص" into minutes from midnight
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const clean = timeStr.trim().toUpperCase();
    const match = clean.match(/(\d{1,2}):(\d{2})\s*(AM|PM|ص|م)?/i);
    if (!match) return null;

    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const period = match[3] || '';

    if ((period === 'PM' || period === 'م') && hour < 12) hour += 12;
    if ((period === 'AM' || period === 'ص') && hour === 12) hour = 0;

    return hour * 60 + minute;
  };

  // Helper to calculate tardiness in minutes from official start time (07:45 AM = 465 min)
  const getTardinessInfo = (checkInStr) => {
    if (!checkInStr) return null;
    const arrivalMinutes = parseTimeToMinutes(checkInStr);
    if (arrivalMinutes === null) return null;

    const officialMinutes = OFFICIAL_START_HOUR * 60 + OFFICIAL_START_MINUTE; // 465
    const diff = arrivalMinutes - officialMinutes;

    if (diff > 0) {
      return {
        isLate: true,
        minutes: diff,
        badgeText: isRtl ? `متأخر ${diff} دقيقة` : `${diff}m late`,
        color: '#b45309',
        bg: '#fef3c7'
      };
    } else {
      return {
        isLate: false,
        minutes: Math.abs(diff),
        badgeText: isRtl ? (diff === 0 ? 'في الموعد تماماً' : `مبكر ${Math.abs(diff)} د`) : 'On Time',
        color: '#059669',
        bg: '#d1fae5'
      };
    }
  };

  // Quick 1-Click Clock In using Current Time
  const handleQuickClockIn = async (teacherId) => {
    if (!canRecordTeacherAttendance) {
      toast.warning(isRtl ? 'تسجيل الحضور مخصص لموظف شؤون الطلاب فقط' : 'Only Staff can log teacher attendance');
      return;
    }

    try {
      setSavingId(teacherId);
      const now = new Date();
      const currentFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTotalMin = currentHour * 60 + currentMinute;
      const officialTotalMin = OFFICIAL_START_HOUR * 60 + OFFICIAL_START_MINUTE;

      const isLateArrival = currentTotalMin > officialTotalMin;
      const lateMinutes = isLateArrival ? currentTotalMin - officialTotalMin : 0;
      const status = isLateArrival ? 'LATE' : 'PRESENT';
      const autoNote = isLateArrival ? (isRtl ? `تأخر عن الطابور الصباحي بمقدار ${lateMinutes} دقيقة` : `Late arrival (${lateMinutes} mins)`) : (isRtl ? 'حضور في الموعد' : 'On time arrival');

      await api.post('/teachers/attendance', {
        teacherId,
        date,
        status,
        checkIn: currentFormatted,
        note: autoNote
      });

      toast.success(
        isRtl
          ? `تم تسجيل ${status === 'LATE' ? 'تأخير' : 'حضور'} المعلم في تمام الساعة ${currentFormatted}`
          : `Check-in recorded at ${currentFormatted} (${status})`
      );
      loadAttendance();
    } catch (err) {
      toast.error(err.message || 'Failed to record check-in');
    } finally {
      setSavingId(null);
    }
  };

  // Quick Status Toggle (PRESENT / LATE / ABSENT / EXCUSED)
  const handleUpdateStatus = async (teacherId, newStatus) => {
    if (!canRecordTeacherAttendance) {
      toast.warning(isRtl ? 'تسجيل الحضور مخصص لموظف شؤون الطلاب فقط' : 'Only Staff can log teacher attendance');
      return;
    }

    try {
      setSavingId(teacherId);
      let currentTime = null;
      let defaultNote = null;

      if (newStatus === 'PRESENT') {
        currentTime = '07:40 AM';
        defaultNote = isRtl ? 'حضور في الموعد الرسمي' : 'On time arrival';
      } else if (newStatus === 'LATE') {
        currentTime = '08:15 AM';
        defaultNote = isRtl ? 'تأخر 30 دقيقة عن موعد الطابور' : '30 min late arrival';
      } else if (newStatus === 'ABSENT') {
        defaultNote = isRtl ? 'غياب بدون إذن مسبق' : 'Unexcused absence';
      } else if (newStatus === 'EXCUSED') {
        defaultNote = isRtl ? 'إجازة رسمية / عذر معتمد' : 'Approved leave / excuse';
      }

      await api.post('/teachers/attendance', {
        teacherId,
        date,
        status: newStatus,
        checkIn: currentTime,
        note: defaultNote
      });

      toast.success(isRtl ? 'تم تحديث حالة المعلم بنجاح' : 'Teacher status updated');
      loadAttendance();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setSavingId(null);
    }
  };

  // Save from Modal
  const handleSaveModalDetails = async () => {
    if (!editingItem) return;
    if (!canRecordTeacherAttendance) {
      toast.warning(isRtl ? 'تسجيل الحضور مخصص لموظف شؤون الطلاب فقط' : 'Only Staff can log teacher attendance');
      return;
    }

    try {
      setSavingId(editingItem.teacherId);
      await api.post('/teachers/attendance', {
        teacherId: editingItem.teacherId,
        date,
        status: selectedStatus,
        checkIn: (selectedStatus === 'PRESENT' || selectedStatus === 'LATE') ? (timeInput || '07:45 AM') : null,
        note: noteInput.trim() || null
      });

      toast.success(isRtl ? 'تم حفظ وتحديث بيانات دوام المعلم بنجاح' : 'Attendance details saved successfully');
      setEditingItem(null);
      loadAttendance();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSavingId(null);
    }
  };

  if (loading && !data) return <PageLoader text={t('loading')} />;
  if (error && !data) return <ErrorAlert message={error} onRetry={loadAttendance} />;

  const { summary, items } = data || { summary: {}, items: [] };

  const filteredItems = (items || []).filter((item) => {
    const matchesSearch =
      item.fullName.toLowerCase().includes(search.toLowerCase()) ||
      item.employeeNo.toLowerCase().includes(search.toLowerCase()) ||
      (item.specialty && item.specialty.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return { label: isRtl ? 'حاضر في الموعد' : 'Present', bg: 'var(--success-light)', color: 'var(--success)', icon: '🟢' };
      case 'LATE':
        return { label: isRtl ? 'متأخر' : 'Late', bg: 'var(--warning-light)', color: 'var(--warning)', icon: '🟡' };
      case 'ABSENT':
        return { label: isRtl ? 'غائب' : 'Absent', bg: 'var(--danger-light)', color: 'var(--danger)', icon: '🔴' };
      case 'EXCUSED':
        return { label: isRtl ? 'إجازة / عذر' : 'Excused', bg: 'rgba(14, 165, 233, 0.12)', color: '#0284c7', icon: '🔵' };
      default:
        return { label: isRtl ? 'بانتظار الحضور' : 'Awaiting Check-in', bg: '#f1f5f9', color: 'var(--text-muted)', icon: '⚪' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Role Header Banner */}
      {isStaff ? (
        <div style={{
          background: 'linear-gradient(135deg, #059669, #0d9488)',
          color: '#fff',
          padding: '20px 24px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 8px 20px -4px rgba(5, 150, 105, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              <span>📋</span>
              <span>{isRtl ? 'مكتب تسجيل وضبط دوام المعلمين (بوابة شؤون الطلاب)' : 'Teacher Attendance Check-In Desk'}</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
              {isRtl ? 'تسجيل ومتابعة حضور وتأخير الكادر التعليمي' : 'Teacher Attendance Logging & Tardiness Tracker'}
            </h2>
            <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: 13 }}>
              {isRtl
                ? 'أنت المسؤول المباشر عن تسجيل حضور المعلمين، رصد أوقات الوصول بالدقائق، وتدوين أسباب التأخير والإجازات.'
                : 'You are the authorized registrar to log teacher clock-ins, calculate arrival tardiness, and document absence reasons.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.18)', padding: '6px 12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: 11, opacity: 0.85 }}>{isRtl ? 'بداية الدوام الرسمي' : 'Official Shift Start'}</div>
              <strong style={{ fontSize: 15 }}>07:45 AM</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', color: 'var(--text-main)', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{isRtl ? 'التاريخ:' : 'Date:'}</span>
              <input
                type="date"
                className="form-input"
                style={{ padding: '2px 6px', fontSize: 13, border: 'none', fontWeight: 700 }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'rgba(79, 70, 229, 0.08)',
          border: '1px solid rgba(79, 70, 229, 0.25)',
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 26 }}>👔</span>
            <div>
              <strong style={{ color: 'var(--primary-dark)', fontSize: 14 }}>
                {isRtl ? 'لوحة تقارير ونسب دوام المعلمين (اطلاع ومراقبة للمدير العام):' : 'Executive Faculty Attendance Overview (Read-Only):'}
              </strong>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                {isRtl
                  ? 'يظهر لك كشف تحليلي شامل لنسب الحضور والغياب وأوقات وصول المعلمين. (تسجيل الحضور وضبط الدوام يتم حصرياً عبر موظف شؤون الطلاب).'
                  : 'You have full executive visibility into daily faculty presence, check-in times, and attendance statistics (Data entry is handled by Staff).'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="badge badge-primary" style={{ fontWeight: 700, fontSize: 11 }}>
              {isRtl ? 'اطلاع وإشراف عام' : 'Read-Only Oversight'}
            </span>
            <input
              type="date"
              className="form-input"
              style={{ padding: '4px 8px', fontSize: 12, width: 140 }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* KPI Stats Row */}
      <div className="grid-cards-4">
        <StatCard
          title={isRtl ? 'إجمالي المعلمين' : 'Total Teachers'}
          value={summary.total || 0}
          subtext={isRtl ? 'الهيئة التعليمية' : 'Registered faculty'}
          icon={<TeachersIcon />}
          color="primary"
        />
        <StatCard
          title={isRtl ? 'حضور في الموعد' : 'Present On Time'}
          value={summary.present || 0}
          subtext={`${summary.present ? Math.round((summary.present / (summary.total || 1)) * 100) : 0}% ${isRtl ? 'نسبة الانضباط' : 'rate'}`}
          icon={<CheckIcon />}
          color="success"
        />
        <StatCard
          title={isRtl ? 'تأخير في الحضور' : 'Late Arrivals'}
          value={summary.late || 0}
          subtext={isRtl ? 'بعد 07:45 ص' : 'After 07:45 AM'}
          icon={<AttendanceIcon />}
          color="warning"
        />
        <StatCard
          title={isRtl ? 'غياب وإجازات' : 'Absent / Excused'}
          value={(summary.absent || 0) + (summary.excused || 0)}
          subtext={`${summary.absent || 0} ${isRtl ? 'غائب' : 'absent'} | ${summary.excused || 0} ${isRtl ? 'إجازة' : 'excused'}`}
          icon={<AttendanceIcon />}
          color="danger"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 280, flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-input"
              style={{ flex: 1, minWidth: 200 }}
              placeholder={isRtl ? 'البحث باسم المعلم، الرقم الوظيفي، أو التخصص...' : 'Search by teacher name, ID, or specialty...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 180 }}
            >
              <option value="ALL">{isRtl ? 'كافة الحالات' : 'All Statuses'}</option>
              <option value="PRESENT">{isRtl ? '🟢 حاضر في الموعد' : '🟢 Present On Time'}</option>
              <option value="LATE">{isRtl ? '🟡 متأخر' : '🟡 Late'}</option>
              <option value="ABSENT">{isRtl ? '🔴 غائب' : '🔴 Absent'}</option>
              <option value="EXCUSED">{isRtl ? '🔵 إجازة / عذر' : '🔵 Excused'}</option>
              <option value="NOT_MARKED">{isRtl ? '⚪ بانتظار الحضور' : '⚪ Awaiting Check-in'}</option>
            </select>
          </div>

          <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🕒</span>
            <span>{isRtl ? `الوقت الحالي: ${currentTimeStr || '—'}` : `Current Time: ${currentTimeStr || '—'}`}</span>
          </div>
        </div>
      </div>

      {/* Teachers Attendance & Activity Table */}
      <div className="panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>
              {isRtl ? `كشف دوام وأوقات حضور المعلمين (${filteredItems.length} معلم)` : `Teacher Presence & Clock-in Roster (${filteredItems.length} Teachers)`}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {canRecordTeacherAttendance
                ? (isRtl ? 'اضغط "تسجيل حضور الآن" لرصد الوقت الفعلي فوراً، أو استخدم الأزرار السريعة لتحديث الحالة والملاحظة.' : 'Click "Clock In Now" to log current timestamp or toggle status with custom notes.')
                : (isRtl ? 'عرض أوقات الوصول الفعلية وحالة انضباط كل معلم بالنسبة لموعد الدوام الرسمي (07:45 ص).' : 'View actual arrival timestamps and tardiness relative to official start (07:45 AM).')}
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>{isRtl ? 'الرقم الوظيفي' : 'Employee ID'}</th>
                <th>{isRtl ? 'اسم المعلم والتخصص' : 'Teacher & Specialty'}</th>
                <th>{isRtl ? 'الشعب والمواد المسندة' : 'Assigned Sections'}</th>
                <th>{isRtl ? 'الحالة اليوم' : 'Status'}</th>
                <th>{isRtl ? 'وقت الوصول الفعلي' : 'Actual Arrival Time'}</th>
                <th>{isRtl ? 'مؤشر الانضباط / التأخير' : 'Tardiness Indicator'}</th>
                <th>{isRtl ? 'ملاحظة أو عذر' : 'Note / Reason'}</th>
                {canRecordTeacherAttendance && (
                  <th style={{ textAlign: 'center', minWidth: 200 }}>{isRtl ? 'إجراءات التسجيل والضبط' : 'Staff Check-In Actions'}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const badge = getStatusBadge(item.status);
                  const isSaving = savingId === item.teacherId;
                  const tardiness = getTardinessInfo(item.checkIn);

                  return (
                    <tr key={item.teacherId}>
                      <td>
                        <strong
                          style={{ color: 'var(--primary)', fontFamily: 'monospace', cursor: 'pointer' }}
                          onClick={() => onViewTeacher && onViewTeacher(item.teacherId)}
                        >
                          {item.employeeNo}
                        </strong>
                      </td>
                      <td>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{item.fullName}</span>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.specialty || 'General'}</div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {item.classes.length > 0 ? item.classes.join(', ') : '—'}
                          {item.subjects.length > 0 ? ` (${item.subjects.join(', ')})` : ''}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            background: badge.bg,
                            color: badge.color,
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontWeight: 700,
                            fontSize: 12,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <span>{badge.icon}</span>
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td>
                        {item.checkIn ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', background: '#f8fafc', padding: '3px 8px', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                              🕒 {item.checkIn}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-light)', fontSize: 13 }}>—</span>
                        )}
                      </td>
                      <td>
                        {tardiness ? (
                          <span
                            style={{
                              background: tardiness.bg,
                              color: tardiness.color,
                              padding: '3px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              display: 'inline-block'
                            }}
                          >
                            {tardiness.badgeText}
                          </span>
                        ) : item.status === 'ABSENT' ? (
                          <span style={{ color: 'var(--danger)', fontSize: 11, fontWeight: 700 }}>
                            {isRtl ? 'غائب كامل اليوم' : 'Absent'}
                          </span>
                        ) : item.status === 'EXCUSED' ? (
                          <span style={{ color: '#0284c7', fontSize: 11, fontWeight: 700 }}>
                            {isRtl ? 'إجازة رسمية' : 'Excused'}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-light)' }}>—</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: item.note ? 'italic' : 'normal' }}>
                          {item.note || '—'}
                        </span>
                      </td>

                      {/* Staff Only Actions Column */}
                      {canRecordTeacherAttendance && (
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {/* Quick Clock-in Now button if not marked yet or want to re-clock */}
                            <button
                              className="btn btn-sm"
                              style={{
                                background: '#10b981',
                                color: '#fff',
                                padding: '4px 8px',
                                fontSize: 11,
                                fontWeight: 700,
                                border: 'none'
                              }}
                              disabled={isSaving}
                              onClick={() => handleQuickClockIn(item.teacherId)}
                              title={isRtl ? 'تسجيل حضور بالوقت الحالي فوراً' : 'Clock in with current time'}
                            >
                              ⚡ {isRtl ? 'حضور الآن' : 'Clock In'}
                            </button>

                            <button
                              className="btn btn-sm"
                              style={{
                                background: item.status === 'LATE' ? '#f59e0b' : '#fffbeb',
                                color: item.status === 'LATE' ? '#fff' : '#b45309',
                                border: '1px solid #f59e0b',
                                padding: '4px 8px',
                                fontSize: 11,
                                fontWeight: 700
                              }}
                              disabled={isSaving}
                              onClick={() => handleUpdateStatus(item.teacherId, 'LATE')}
                              title={isRtl ? 'تسجيل متأخر (08:15 ص)' : 'Mark Late'}
                            >
                              ⏱️ {isRtl ? 'متأخر' : 'Late'}
                            </button>

                            <button
                              className="btn btn-sm"
                              style={{
                                background: item.status === 'ABSENT' ? 'var(--danger)' : '#fef2f2',
                                color: item.status === 'ABSENT' ? '#fff' : 'var(--danger)',
                                border: '1px solid var(--danger)',
                                padding: '4px 8px',
                                fontSize: 11,
                                fontWeight: 700
                              }}
                              disabled={isSaving}
                              onClick={() => handleUpdateStatus(item.teacherId, 'ABSENT')}
                              title={isRtl ? 'تسجيل غائب' : 'Mark Absent'}
                            >
                              ✕ {isRtl ? 'غائب' : 'Absent'}
                            </button>

                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px', fontSize: 11 }}
                              onClick={() => {
                                setEditingItem(item);
                                setSelectedStatus(item.status === 'NOT_MARKED' ? 'PRESENT' : item.status);
                                setTimeInput(item.checkIn || currentTimeStr || '07:45 AM');
                                setNoteInput(item.note || '');
                              }}
                              title={isRtl ? 'تعديل الوقت المحدد والملاحظة' : 'Edit Exact Time & Note'}
                            >
                              ✏️ {isRtl ? 'تخصيص' : 'Edit'}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={canRecordTeacherAttendance ? 8 : 7} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                    {t('noDataFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Edit / Custom Check-in Modal */}
      {canRecordTeacherAttendance && editingItem && (
        <div className="modal-backdrop" onClick={() => setEditingItem(null)}>
          <div className="modal-content" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>
                {isRtl ? `تسجيل وتعديل دوام: ${editingItem.fullName}` : `Attendance Log: ${editingItem.fullName}`}
              </h3>
              <button className="btn-icon" onClick={() => setEditingItem(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20 }}>
              <div>
                <label className="form-label">{isRtl ? 'حالة الحضور والدوام' : 'Attendance Status'}</label>
                <select
                  className="form-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="PRESENT">{isRtl ? '🟢 حاضر في الموعد (Present)' : '🟢 Present'}</option>
                  <option value="LATE">{isRtl ? '🟡 متأخر عن الطابور الصباحي (Late)' : '🟡 Late Arrival'}</option>
                  <option value="ABSENT">{isRtl ? '🔴 غائب بدون عذر (Absent)' : '🔴 Absent'}</option>
                  <option value="EXCUSED">{isRtl ? '🔵 إجازة رسمية / عذر طبي (Excused)' : '🔵 Excused Leave'}</option>
                </select>
              </div>

              {(selectedStatus === 'PRESENT' || selectedStatus === 'LATE') && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      {isRtl ? 'وقت الوصول المحدد (Actual Check-in Time)' : 'Check-in Time'}
                    </label>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 11, padding: '2px 8px' }}
                      onClick={() => setTimeInput(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}
                    >
                      🕒 {isRtl ? 'استخدام الوقت الحالي' : 'Use Current Time'}
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 07:45 AM, 08:15 AM"
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                  />
                  {timeInput && getTardinessInfo(timeInput) && (
                    <div style={{ marginTop: 6, fontSize: 12 }}>
                      <span
                        style={{
                          background: getTardinessInfo(timeInput).bg,
                          color: getTardinessInfo(timeInput).color,
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontWeight: 700
                        }}
                      >
                        {getTardinessInfo(timeInput).badgeText} ({isRtl ? 'بالنسبة للدوام 07:45 ص' : 'vs 07:45 AM'})
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="form-label">{isRtl ? 'سبب التأخير أو الغياب / ملاحظات' : 'Reason / Notes'}</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {[
                    isRtl ? 'ازدحام مروري' : 'Traffic',
                    isRtl ? 'ظرف عائلي طارئ' : 'Family emergency',
                    isRtl ? 'مهمة إدارية رسمية' : 'Official duty',
                    isRtl ? 'إجازة مرضية' : 'Sick leave',
                    isRtl ? 'إذن خروج مسبق' : 'Prior permission'
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 11, padding: '2px 8px' }}
                      onClick={() => setNoteInput(chip)}
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder={isRtl ? 'اكتب ملاحظة أو سبب الغياب أو الإجازة...' : 'Enter any notes, excuses or reasons...'}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button className="btn btn-secondary" onClick={() => setEditingItem(null)}>
                  {t('cancel')}
                </button>
                <button className="btn btn-primary" onClick={handleSaveModalDetails}>
                  {isRtl ? '💾 حفظ السجل والتوقيت' : '💾 Save Attendance'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
