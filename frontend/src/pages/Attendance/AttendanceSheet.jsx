import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import { CheckIcon, AttendanceIcon } from '../../components/common/Icons';

export default function AttendanceSheet({ initialClassId }) {
  const toast = useToast();

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
      setClasses(cls);
      if (!selectedClassId && cls.length > 0) {
        setSelectedClassId(cls[0].id);
      }
    } catch {}
  };

  const loadAttendanceSheet = useCallback(async () => {
    if (!selectedClassId || !selectedDate) return;
    try {
      setLoading(true);
      setError('');
      const data = await api.get(`/attendance/sheet?classId=${selectedClassId}&date=${selectedDate}`);
      setSheet(data.sheet || []);
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
      prev.map(item =>
        item.studentId === studentId ? { ...item, status } : item
      )
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
    toast.info('Marked all students as PRESENT (Click Save to store)');
  };

  const handleSaveAttendance = async () => {
    const unselected = sheet.filter(s => !s.status);
    if (unselected.length > 0) {
      toast.warning(`Please select status for all ${unselected.length} remaining students`);
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

      toast.success('Attendance saved to database successfully!');
      loadAttendanceSheet();
    } catch (err) {
      toast.error(err.message || 'Failed to save attendance records');
    } finally {
      setSaving(false);
    }
  };

  const summary = {
    total: sheet.length,
    present: sheet.filter(s => s.status === 'PRESENT').length,
    absent: sheet.filter(s => s.status === 'ABSENT').length,
    late: sheet.filter(s => s.status === 'LATE').length,
    excused: sheet.filter(s => s.status === 'EXCUSED').length
  };

  return (
    <div>
      {/* Controls Bar */}
      <div className="panel" style={{ padding: '18px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div>
              <label className="form-label" style={{ fontSize: 12 }}>Attendance Date</label>
              <input
                type="date"
                className="form-input"
                style={{ width: 170 }}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 12 }}>Select Class</label>
              <select
                className="form-select"
                style={{ width: 220 }}
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.academicYear?.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary btn-sm" type="button" onClick={handleMarkAllPresent} disabled={sheet.length === 0}>
              <CheckIcon /> Mark All Present
            </button>
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={handleSaveAttendance}
              disabled={saving || sheet.length === 0}
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={loadAttendanceSheet} />}

      {/* Summary Chips */}
      {sheet.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ background: '#fff', padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: 13 }}>
            Total: <strong>{summary.total}</strong>
          </div>
          <div style={{ background: 'var(--success-light)', padding: '8px 16px', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: 13, color: '#166534' }}>
            Present: <strong>{summary.present}</strong>
          </div>
          <div style={{ background: 'var(--danger-light)', padding: '8px 16px', borderRadius: 8, border: '1px solid #fecaca', fontSize: 13, color: '#991b1b' }}>
            Absent: <strong>{summary.absent}</strong>
          </div>
          <div style={{ background: 'var(--warning-light)', padding: '8px 16px', borderRadius: 8, border: '1px solid #fed7aa', fontSize: 13, color: '#9a3412' }}>
            Late: <strong>{summary.late}</strong>
          </div>
          <div style={{ background: 'var(--info-light)', padding: '8px 16px', borderRadius: 8, border: '1px solid #bfdbfe', fontSize: 13, color: '#1e40af' }}>
            Excused: <strong>{summary.excused}</strong>
          </div>
        </div>
      )}

      {/* Interactive Sheet Table */}
      <div className="panel">
        <div className="table-responsive">
          {loading ? (
            <PageLoader text="Loading class attendance roster..." />
          ) : sheet.length === 0 ? (
            <EmptyState
              title="No students enrolled in this class"
              description="Enroll students in this class before taking attendance."
            />
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: 140 }}>Student ID</th>
                  <th>Student Name</th>
                  <th style={{ textAlign: 'center', width: 340 }}>Attendance Status</th>
                  <th>Remarks / Note</th>
                </tr>
              </thead>
              <tbody>
                {sheet.map((row) => (
                  <tr key={row.studentId}>
                    <td>
                      <strong>{row.studentNumber}</strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{row.fullName}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((st) => {
                          const isSelected = row.status === st;
                          let bg = '#f1f5f9';
                          let fg = 'var(--text-main)';
                          let border = '1px solid var(--border-color)';

                          if (isSelected) {
                            if (st === 'PRESENT') { bg = 'var(--success)'; fg = '#fff'; border = 'none'; }
                            else if (st === 'ABSENT') { bg = 'var(--danger)'; fg = '#fff'; border = 'none'; }
                            else if (st === 'LATE') { bg = 'var(--warning)'; fg = '#fff'; border = 'none'; }
                            else if (st === 'EXCUSED') { bg = 'var(--info)'; fg = '#fff'; border = 'none'; }
                          }

                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusChange(row.studentId, st)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: 6,
                                background: bg,
                                color: fg,
                                border,
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {st}
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
                        placeholder="Optional note / reason..."
                        value={row.note || ''}
                        onChange={(e) => handleNoteChange(row.studentId, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
