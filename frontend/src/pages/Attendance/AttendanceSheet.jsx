import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import { CheckIcon, CloseIcon, AttendanceIcon, AlertCircleIcon } from '../../components/common/Icons';

export default function AttendanceSheet({ initialClassId }) {
  const toast = useToast();
  const { t, isRtl } = useLanguage();

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(initialClassId || '');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [sheet, setSheet] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadClasses = async () => {
    try {
      const cls = await api.get('/classes');
      const safeClasses = Array.isArray(cls) ? cls : (cls?.items || []);
      setClasses(safeClasses);
      if (!selectedClassId && safeClasses.length > 0) {
        setSelectedClassId(safeClasses[0].id);
      }
    } catch {}
  };

  const loadAttendanceSheet = useCallback(async () => {
    if (!selectedClassId || !selectedDate) return;
    try {
      setLoading(true);
      setError('');
      const data = await api.get(`/attendance/sheet?classId=${selectedClassId}&date=${selectedDate}`);
      
      // Ensure each student item has status preserved if previously recorded, or null for clean new days
      const formattedSheet = (data.sheet || []).map(item => ({
        ...item,
        status: item.status || null,
        note: item.note || ''
      }));

      setSheet(formattedSheet);
      setClassInfo(data.class || null);
    } catch (err) {
      setError(err.message || 'Failed to load class attendance sheet');
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, selectedDate]);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadAttendanceSheet();
    }
  }, [loadAttendanceSheet]);

  const handleStatusChange = (studentId, status) => {
    setSheet(prev =>
      prev.map(item => {
        if (item.studentId !== studentId) return item;
        // If clicking the currently active status, toggle it back to unselected (null)
        const nextStatus = item.status === status ? null : status;
        return { ...item, status: nextStatus };
      })
    );
  };

  const handleNoteChange = (studentId, note) => {
    setSheet(prev =>
      prev.map(item =>
        item.studentId === studentId ? { ...item, note } : item
      )
    );
  };

  // Quick Action: Mark all students as PRESENT
  const handleMarkAllPresent = () => {
    setSheet(prev =>
      prev.map(item => ({ ...item, status: 'PRESENT' }))
    );
    toast.info(t('markAllPresentToast'));
  };

  // Quick Action: Clear all selections back to clean state
  const handleClearAllMarks = () => {
    setSheet(prev =>
      prev.map(item => ({ ...item, status: null }))
    );
    toast.info(t('clearAllToast'));
  };

  const handleSaveAttendance = async () => {
    const unselected = sheet.filter(s => !s.status);
    if (unselected.length > 0) {
      toast.warning(`${t('saveAttendanceWarning')} (${unselected.length})`);
      return;
    }

    setSaving(true);
    try {
      const records = sheet.map(s => ({
        studentId: s.studentId,
        status: s.status,
        note: s.note
      }));

      await api.post('/attendance/bulk', {
        classId: Number(selectedClassId),
        date: selectedDate,
        records
      });

      toast.success(t('saveAttendanceSuccess'));
      loadAttendanceSheet();
    } catch (err) {
      toast.error(err.message || 'Failed to save attendance records');
    } finally {
      setSaving(false);
    }
  };

  const isPreviouslyRecorded = sheet.length > 0 && sheet.some(s => s.status !== null);
  const unrecordedCount = sheet.filter(s => !s.status).length;

  const summary = {
    total: sheet.length,
    unrecorded: unrecordedCount,
    present: sheet.filter(s => s.status === 'PRESENT').length,
    absent: sheet.filter(s => s.status === 'ABSENT').length,
    late: sheet.filter(s => s.status === 'LATE').length,
    excused: sheet.filter(s => s.status === 'EXCUSED').length
  };

  const statusOptions = [
    { key: 'PRESENT', label: t('present'), bg: 'var(--success)', color: '#fff', activeBg: '#16a34a' },
    { key: 'ABSENT', label: t('absent'), bg: 'var(--danger)', color: '#fff', activeBg: '#dc2626' },
    { key: 'LATE', label: t('late'), bg: 'var(--warning)', color: '#fff', activeBg: '#ea580c' },
    { key: 'EXCUSED', label: t('excused'), bg: 'var(--info)', color: '#fff', activeBg: '#2563eb' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header & Day Status Banner */}
      <div className="panel" style={{ padding: '20px 24px', background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          
          {/* Controls: Date and Class */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block' }}>
                📅 {t('selectDate')}
              </label>
              <input
                type="date"
                className="form-input"
                style={{ width: 175, fontWeight: 600 }}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block' }}>
                🏫 {t('selectClass')}
              </label>
              <select
                className="form-select"
                style={{ width: 230, fontWeight: 600 }}
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.academicYear?.name ? `(${c.academicYear.name})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Date State Indicator */}
            {sheet.length > 0 && (
              <div style={{
                marginTop: 18,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: 12,
                fontWeight: 700,
                background: isPreviouslyRecorded ? '#f0fdf4' : '#eff6ff',
                color: isPreviouslyRecorded ? '#166534' : '#1d4ed8',
                border: isPreviouslyRecorded ? '1px solid #bbf7d0' : '1px solid #bfdbfe'
              }}>
                <span>{isPreviouslyRecorded ? '✓' : '✨'}</span>
                <span>{isPreviouslyRecorded ? t('existingDaySheet') : t('newDayCleanSheet')}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary btn-sm"
              type="button"
              onClick={handleMarkAllPresent}
              disabled={sheet.length === 0}
              title={t('markAllPresent')}
              style={{ fontWeight: 600 }}
            >
              <CheckIcon /> {t('markAllPresent')}
            </button>

            <button
              className="btn btn-secondary btn-sm"
              type="button"
              onClick={handleClearAllMarks}
              disabled={sheet.length === 0 || (!isPreviouslyRecorded && unrecordedCount === sheet.length)}
              title={t('clearAllMarks')}
              style={{ fontWeight: 600, color: 'var(--text-muted)' }}
            >
              <CloseIcon /> {t('clearAllMarks')}
            </button>

            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={handleSaveAttendance}
              disabled={saving || sheet.length === 0}
              style={{ fontWeight: 700, padding: '8px 18px' }}
            >
              {saving ? t('savingAttendance') : (
                <>
                  <AttendanceIcon /> {t('saveAttendance')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={loadAttendanceSheet} />}

      {/* Summary Stat Chips */}
      {sheet.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ background: '#fff', padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: 13, flex: '1 1 auto', minWidth: 110 }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }}>{isRtl ? 'إجمالي الطلاب' : 'Total Students'}</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{summary.total}</div>
          </div>

          {summary.unrecorded > 0 && (
            <div style={{ background: '#fffbeb', padding: '10px 16px', borderRadius: 8, border: '1px solid #fde68a', fontSize: 13, flex: '1 1 auto', minWidth: 120 }}>
              <div style={{ color: '#b45309', fontSize: 11, fontWeight: 700 }}>⏳ {t('unmarkedBadge')}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#92400e', marginTop: 2 }}>{summary.unrecorded}</div>
            </div>
          )}

          <div style={{ background: '#f0fdf4', padding: '10px 16px', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: 13, flex: '1 1 auto', minWidth: 110 }}>
            <div style={{ color: '#15803d', fontSize: 11, fontWeight: 700 }}>✓ {t('present')}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#166534', marginTop: 2 }}>{summary.present}</div>
          </div>

          <div style={{ background: '#fef2f2', padding: '10px 16px', borderRadius: 8, border: '1px solid #fecaca', fontSize: 13, flex: '1 1 auto', minWidth: 110 }}>
            <div style={{ color: '#b91c1c', fontSize: 11, fontWeight: 700 }}>✗ {t('absent')}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#991b1b', marginTop: 2 }}>{summary.absent}</div>
          </div>

          <div style={{ background: '#fff7ed', padding: '10px 16px', borderRadius: 8, border: '1px solid #fed7aa', fontSize: 13, flex: '1 1 auto', minWidth: 110 }}>
            <div style={{ color: '#c2410c', fontSize: 11, fontWeight: 700 }}>⏰ {t('late')}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#9a3412', marginTop: 2 }}>{summary.late}</div>
          </div>

          <div style={{ background: '#eff6ff', padding: '10px 16px', borderRadius: 8, border: '1px solid #bfdbfe', fontSize: 13, flex: '1 1 auto', minWidth: 110 }}>
            <div style={{ color: '#1d4ed8', fontSize: 11, fontWeight: 700 }}>📋 {t('excused')}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1e40af', marginTop: 2 }}>{summary.excused}</div>
          </div>
        </div>
      )}

      {/* Interactive Attendance Table */}
      <div className="panel" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          {loading ? (
            <PageLoader text={isRtl ? 'جاري تحميل قائمة طلاب الشعبة...' : 'Loading class attendance roster...'} />
          ) : sheet.length === 0 ? (
            <EmptyState
              title={t('noStudentsInClass')}
              description={t('noStudentsInClassDesc')}
            />
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: 60, textAlign: 'center' }}>#</th>
                  <th style={{ width: 140 }}>{t('studentIdHeader')}</th>
                  <th>{t('studentNameHeader')}</th>
                  <th style={{ textAlign: 'center', minWidth: 320 }}>{t('attendanceStatusHeader')}</th>
                  <th style={{ minWidth: 220 }}>{t('remarksHeader')}</th>
                </tr>
              </thead>
              <tbody>
                {sheet.map((row, index) => {
                  const isMarked = row.status !== null && row.status !== undefined;

                  return (
                    <tr
                      key={row.studentId}
                      style={{
                        background: !isMarked ? 'rgba(248, 250, 252, 0.6)' : 'transparent',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                        {index + 1}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          background: '#f1f5f9',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#475569',
                          fontFamily: 'monospace'
                        }}>
                          {row.studentNumber}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: isMarked ? 'var(--primary-light)' : '#e2e8f0',
                            color: isMarked ? 'var(--primary)' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 13
                          }}>
                            {row.fullName ? row.fullName.trim()[0] : 'S'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: 14 }}>
                              {row.fullName}
                            </div>
                            {!isMarked && (
                              <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>
                                ⚠️ {t('unmarkedPlaceholder')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                          {statusOptions.map((opt) => {
                            const isSelected = row.status === opt.key;

                            let btnBg = '#f8fafc';
                            let btnFg = '#64748b';
                            let btnBorder = '1px solid #cbd5e1';
                            let btnShadow = 'none';

                            if (isSelected) {
                              btnBg = opt.activeBg;
                              btnFg = '#ffffff';
                              btnBorder = `1px solid ${opt.activeBg}`;
                              btnShadow = '0 2px 8px rgba(0,0,0,0.12)';
                            }

                            return (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => handleStatusChange(row.studentId, opt.key)}
                                style={{
                                  padding: '6px 14px',
                                  borderRadius: 6,
                                  background: btnBg,
                                  color: btnFg,
                                  border: btnBorder,
                                  boxShadow: btnShadow,
                                  fontSize: 12,
                                  fontWeight: isSelected ? 800 : 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                                title={`${opt.label} - ${row.fullName}`}
                              >
                                {isSelected && <span>✓</span>}
                                <span>{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-input"
                          style={{ padding: '6px 10px', fontSize: 13 }}
                          placeholder={t('attendanceNotePlaceholder')}
                          value={row.note || ''}
                          onChange={(e) => handleNoteChange(row.studentId, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
