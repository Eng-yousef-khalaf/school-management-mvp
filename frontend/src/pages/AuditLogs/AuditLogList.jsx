import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';

export default function AuditLogList() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '30'
      });
      if (actionFilter && actionFilter !== 'ALL') queryParams.set('action', actionFilter);
      if (entityFilter && entityFilter !== 'ALL') queryParams.set('entity', entityFilter);

      const res = await api.get(`/audit-logs?${queryParams.toString()}`);
      setLogs(res.items);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, entityFilter]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
    <div>
      <div className="panel" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div className="toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Action Filter:</span>
            <select
              className="filter-select"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Actions</option>
              <option value="LOGIN">LOGIN</option>
              <option value="CREATE_STUDENT">CREATE_STUDENT</option>
              <option value="UPDATE_STUDENT">UPDATE_STUDENT</option>
              <option value="DEACTIVATE_STUDENT">DEACTIVATE_STUDENT</option>
              <option value="CREATE_TEACHER">CREATE_TEACHER</option>
              <option value="RECORD_ATTENDANCE">RECORD_ATTENDANCE</option>
              <option value="ENTER_GRADES">ENTER_GRADES</option>
              <option value="IMPORT_STUDENTS_EXCEL">IMPORT_STUDENTS_EXCEL</option>
              <option value="CREATE_USER">CREATE_USER</option>
            </select>

            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Entity:</span>
            <select
              className="filter-select"
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Entities</option>
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="SchoolClass">SchoolClass</option>
              <option value="Attendance">Attendance</option>
              <option value="Grade">Grade</option>
              <option value="User">User</option>
              <option value="AcademicYear">AcademicYear</option>
            </select>
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={loadLogs} />}

      <div className="panel">
        <div className="table-responsive">
          {loading ? (
            <PageLoader text="Loading security audit records..." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Entity ID</th>
                  <th>Executed By</th>
                  <th>IP Address</th>
                  <th>Audit Metadata Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: 12, whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <strong style={{ fontSize: 13, color: 'var(--text-main)' }}>{log.action}</strong>
                    </td>
                    <td>{log.entity}</td>
                    <td>{log.entityId ? `#${log.entityId}` : '—'}</td>
                    <td>
                      {log.user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{log.user.fullName}</span>
                          <Badge type={log.user.role} />
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-light)' }}>System</span>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{log.ipAddress || '—'}</td>
                    <td style={{ fontSize: 12, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <code style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                        {log.metadata || '—'}
                      </code>
                    </td>
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
