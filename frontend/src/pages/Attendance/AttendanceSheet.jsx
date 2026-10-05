import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import { CheckIcon, CloseIcon, AttendanceIcon } from '../../components/common/Icons';

export default function AttendanceSheet({ initialClassId }) {
  const toast = useToast();
  const { t, isRtl } = useLanguage();
  const { isTeacher } = useAuth();

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(initialClassId ? String(initialClassId) : '');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [sheet, setSheet] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadClasses = async () => {
    try {
      const cls = await api.get('/classes');
      const safeClasses = Array.isArray(cls) ? cls : (cls?.items || cls?.classes || []);
      setClasses(safeClasses);
      if (safeClasses.length > 0) {
        if (!selectedClassId || !safeClasses.some(c => String(c.id) === String(selectedClassId))) {
          setSelectedClassId(String(safeClasses[0].id));
        }
      }
    } catch (err) {
      console.error('Failed to load classes', err);
    }
  };

  const loadAttendanceSheet = useCallback(async () => {
    if (!selectedClassId || !selectedDate) return;
    try {
      setLoading(true);
      setError('');
      const data = await api.get(`/attendance/sheet?classId=${selectedClassId}&date=${selectedDate}`);
      
      const rawSheet = Array.isArray(data) ? data : (data.sheet || data.students || data.records || []);
      
      // Ensure every student item has complete student details (id, number, full name)
      const formattedSheet = rawSheet.map((item, idx) => {
        const studentObj = item.student || {};
        const studentId = item.studentId || item.id || studentObj.id || (idx + 1);
        const studentNumber = item.studentNumber || studentObj.studentNumber || `STU-${1000 + studentId}`;
        const fullName = item.fullName || 
          (studentObj.firstName ? `${studentObj.firstName} ${studentObj.middleName ? studentObj.middleName + ' ' : ''}${studentObj.lastName}` : '') ||
          (item.firstName ? `${item.firstName} ${item.middleName ? item.middleName + ' ' : ''}${item.lastName}` : '') ||
          item.studentName || item.name || `طالب ${studentNumber}`;

        return {
          ...item,
          studentId,
          studentNumber,
          fullName: fullName.trim(),
          status: item.status || null,
          note: item.note || ''
        };
      });

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
  }, [selectedClassId, selectedDate, loadAttendanceSheet]);

  const handleStatusChange = (studentId, status) => {
    setSheet(prev =>
      prev.map(item => {
        if (item.studentId !== studentId) return item;
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

  const handleMarkAllPresent = () => {
    setSheet(prev =>
      prev.map(item => ({ ...item, status: 'PRESENT' }))
    );
    toast.info(t('markAllPresentToast') || (isRtl ? 'تم تحديد جميع الطلاب: حاضر' : 'All students marked as Present'));
  };

  const handleClearAllMarks = () => {
    setSheet(prev =>
      prev.map(item => ({ ...item, status: null }))
    );
    toast.info(t('clearAllToast') || (isRtl ? 'تم إلغاء التحديد' : 'All marks cleared'));
  };

  const handleSaveAttendance = async () => {
    const unselected = sheet.filter(s => !s.status);
    if (unselected.length > 0) {
      toast.warning(`${t('saveAttendanceWarning') || (isRtl ? 'يوجد طلاب لم يتم رصد حضورهم' : 'Unrecorded students')} (${unselected.length})`);
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

      toast.success(t('saveAttendanceSuccess') || (isRtl ? 'تم حفظ سجل الحضور والغياب بنجاح!' : 'Attendance saved successfully!'));
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
      <div className="panel" style={{ padding: '18px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          
          {/* Controls: Date and Class */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', flex: '1 1 auto' }}>
            <div style={{ flex: '1 1 150px', minWidth: 140 }}>
              <label className="form-label">
                📅 {t('selectDate')}
              </label>
              <input
                type="date"
                className="form-input"
                style={{ width: '100%', fontWeight: 700 }}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div style={{ flex: '1 1 200px', minWidth: 180 }}>
              <label className="form-label">
                🏫 {t('selectClass')}
              </label>
              <select
                className="form-select"
                style={{ width: '100%', fontWeight: 700 }}
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                {classes.map((c) => (
                  <option key={c.id} value={String(c.id)}>
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
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: 11.5,
                fontWeight: 700,
                background: isPreviouslyRecorded ? 'var(--success-light)' : 'var(--primary-light)',
                color: isPreviouslyRecorded ? 'var(--success-text)' : 'var(--primary-dark)',
                border: `1px solid ${isPreviouslyRecorded ? 'var(--success-border)' : 'rgba(79, 70, 229, 0.2)'}`
              }}>
                <span>{isPreviouslyRecorded ? '✓' : '✨'}</span>
                <span>{isPreviouslyRecorded ? (t('existingDaySheet') || (isRtl ? 'حضور مسجل مسبقاً' : 'Recorded')) : (t('newDayCleanSheet') || (isRtl ? 'رصد جديد لهذا اليوم' : 'New Sheet'))}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary btn-sm"
              type="button"
              onClick={handleMarkAllPresent}
              disabled={sheet.length === 0}
              title={t('markAllPresent')}
            >
              <CheckIcon /> {t('markAllPresent')}
            </button>

            <button
              className="btn btn-secondary btn-sm"
              type="button"
              onClick={handleClearAllMarks}
              disabled={sheet.length === 0}
              title={t('clearAllMarks')}
              style={{ color: 'var(--text-muted)' }}
            >
              <CloseIcon /> {t('clearAllMarks')}
            </button>

            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={handleSaveAttendance}
              disabled={saving || sheet.length === 0}
              style={{ fontWeight: 800 }}
            >
              {saving ? (t('savingAttendance') || 'Saving...') : (
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
          <div style={{ background: '#fff', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: 13, flex: '1 1 auto', minWidth: 110 }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }}>{isRtl ? 'إجمالي الطلاب' : 'Total Students'}</div>
            <div style={{ fontSize: 20, fontWeight: 900, marginTop: 2 }}>{summary.total}</div>
          </div>

          {summary.unrecorded > 0 && (
            <div style={{ background: 'var(--warning-light)', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--warning-border)', fontSize: 13, flex: '1 1 auto', minWidth: 120 }}>
              <div style={{ color: 'var(--warning-text)', fontSize: 11, fontWeight: 700 }}>⏳ {t('unmarkedBadge') || (isRtl ? 'بانتظار الرصد' : 'Unrecorded')}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--warning-text)', marginTop: 2 }}>{summary.unrecorded}</div>
            </div>
          )}

          <div style={{ background: 'var(--success-light)', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--success-border)', fontSize: 13, flex: '1 1 auto', minWidth: 110 }}>
            <div style={{ color: 'var(--success-text)', fontSize: 11, fontWeight: 700 }}>✓ {t('present')}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--success)', marginTop: 2 }}>{summary.present}</div>
          </div>

          <div style={{ background: 'var(--danger-light)', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger-border)', fontSize: 13, flex: '1 1 auto', minWidth: 110 }}>
            <div style={{ color: 'var(--danger-text)', fontSize: 11, fontWeight: 700 }}>✗ {t('absent')}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--danger)', marginTop: 2 }}>{summary.absent}</div>
          </div>

          <div style={{ background: 'var(--warning-light)', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--warning-border)', fontSize: 13, flex: '1 1 auto', minWidth: 110 }}>
            <div style={{ color: 'var(--warning-text)', fontSize: 11, fontWeight: 700 }}>⏰ {t('late')}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--warning)', marginTop: 2 }}>{summary.late}</div>
          </div>
        </div>
      )}

      {/* Interactive Attendance Table */}
      <div className="panel">
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
                  <th style={{ width: 50, textAlign: 'center' }}>#</th>
                  <th style={{ width: 130 }}>{t('studentIdHeader')}</th>
                  <th>{t('studentNameHeader')}</th>
                  <th style={{ textAlign: 'center', minWidth: 300 }}>{t('attendanceStatusHeader')}</th>
                  <th style={{ minWidth: 200 }}>{t('remarksHeader')}</th>
                </tr>
              </thead>
              <tbody>
                {sheet.map((row, index) => {
                  const isMarked = row.status !== null && row.status !== undefined;

                  return (
                    <tr
                      key={row.studentId || index}
                      style={{
                        background: !isMarked ? 'rgba(248, 250, 252, 0.7)' : 'transparent'
                      }}
                    >
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                        {index + 1}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          background: '#f1f5f9',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: 'var(--primary)',
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
                            color: isMarked ? 'var(--primary-dark)' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 12
                          }}>
                            {row.fullName ? row.fullName.trim().charAt(0) : 'S'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: 13.5 }}>
                              {row.fullName}
                            </div>
                            {!isMarked && (
                              <div style={{ fontSize: 10.5, color: '#d97706', fontWeight: 600 }}>
                                ⚠️ {t('unmarkedPlaceholder') || (isRtl ? 'لم يتم رصد الحضور بعد' : 'Unrecorded')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {statusOptions.map((opt) => {
                            const isSelected = row.status === opt.key;
                            return (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => handleStatusChange(row.studentId, opt.key)}
                                style={{
                                  padding: '5px 12px',
                                  fontSize: 12,
                                  fontWeight: 700,
                                  borderRadius: 'var(--radius-md)',
                                  border: isSelected ? `2px solid ${opt.activeBg}` : '1px solid var(--border-color)',
                                  background: isSelected ? opt.bg : '#ffffff',
                                  color: isSelected ? opt.color : 'var(--text-muted)',
                                  cursor: 'pointer',
                                  transition: 'var(--transition)',
                                  boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                                }}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-input"
                          style={{ padding: '6px 10px', fontSize: 12 }}
                          placeholder={isRtl ? 'ملاحظة (تأخر، عذر مرضي...)' : 'Optional notes...'}
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
