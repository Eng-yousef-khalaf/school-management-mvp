import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import { DownloadIcon } from '../../components/common/Icons';

export default function AttendanceReports() {
  const toast = useToast();

  const [classes, setClasses] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [data, setData] = useState({ items: [], summary: {}, pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const loadClasses = async () => {
    try {
      const cls = await api.get('/classes');
      setClasses(cls);
    } catch {}
  };

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '25'
      });
      if (dateFrom) queryParams.set('dateFrom', dateFrom);
      if (dateTo) queryParams.set('dateTo', dateTo);
      if (selectedClassId) queryParams.set('classId', selectedClassId);
      if (selectedStatus && selectedStatus !== 'ALL') queryParams.set('status', selectedStatus);

      const res = await api.get(`/attendance/report?${queryParams.toString()}`);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch attendance report');
    } finally {
      setLoading(false);
    }
  }, [page, dateFrom, dateTo, selectedClassId, selectedStatus]);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleExport = async () => {
    try {
      toast.info('Exporting attendance report...');
      const queryParams = new URLSearchParams();
      if (dateFrom) queryParams.set('dateFrom', dateFrom);
      if (dateTo) queryParams.set('dateTo', dateTo);
      if (selectedClassId) queryParams.set('classId', selectedClassId);
      if (selectedStatus && selectedStatus !== 'ALL') queryParams.set('status', selectedStatus);

      await api.download(`/attendance/export?${queryParams.toString()}`, 'attendance_report.xlsx');
      toast.success('Attendance report exported to Excel!');
    } catch (err) {
      toast.error(err.message || 'Export failed');
    }
  };

  const { items = [], summary = {}, pagination } = data;

  return (
    <div>
      {/* Filter Toolbar */}
      <div className="panel" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div className="toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>From:</span>
              <input
                type="date"
                className="form-input"
                style={{ width: 140, padding: '7px 10px' }}
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>To:</span>
              <input
                type="date"
                className="form-input"
                style={{ width: 140, padding: '7px 10px' }}
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <select
              className="filter-select"
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LATE">Late</option>
              <option value="EXCUSED">Excused</option>
            </select>
          </div>

          <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={handleExport}>
            <DownloadIcon /> Export Excel
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {summary.totalRecords !== undefined && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
          <div style={{ background: '#fff', padding: 16, borderRadius: 10, border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Records</span>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{summary.totalRecords}</div>
          </div>
          <div style={{ background: 'var(--success-light)', padding: 16, borderRadius: 10, border: '1px solid #bbf7d0' }}>
            <span style={{ fontSize: 12, color: '#166534' }}>Present Count</span>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)' }}>{summary.present}</div>
          </div>
          <div style={{ background: 'var(--danger-light)', padding: 16, borderRadius: 10, border: '1px solid #fecaca' }}>
            <span style={{ fontSize: 12, color: '#991b1b' }}>Absent Count</span>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--danger)' }}>{summary.absent}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Average Attendance Rate</span>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{summary.attendanceRate}%</div>
          </div>
        </div>
      )}

      {error && <ErrorAlert message={error} onRetry={loadReport} />}

      {/* Report Table */}
      <div className="panel">
        <div className="table-responsive">
          {loading ? (
            <PageLoader text="Compiling attendance analytics..." />
          ) : items.length === 0 ? (
            <EmptyState
              title="No attendance records found"
              description="No attendance logged matching the selected date and class filters."
            />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student Number</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Status</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.date}</strong></td>
                    <td>{r.studentNumber}</td>
                    <td>{r.studentName}</td>
                    <td>{r.className}</td>
                    <td>
                      <Badge status={r.status} />
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{r.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pagination && (
          <Pagination
            pagination={pagination}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>
    </div>
  );
}
