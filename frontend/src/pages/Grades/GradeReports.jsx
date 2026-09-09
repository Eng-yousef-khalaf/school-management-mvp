import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import { DownloadIcon } from '../../components/common/Icons';

export default function GradeReports() {
  const toast = useToast();

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [examFilter, setExamFilter] = useState('');

  const [reportData, setReportData] = useState({ subjects: [], report: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      const queryParams = new URLSearchParams();
      if (selectedClassId) queryParams.set('classId', selectedClassId);
      if (examFilter) queryParams.set('examName', examFilter);

      const res = await api.get(`/grades/report?${queryParams.toString()}`);
      setReportData(res);
    } catch (err) {
      setError(err.message || 'Failed to load grade report');
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, examFilter]);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleExport = async () => {
    try {
      toast.info('Generating grade matrix Excel export...');
      const queryParams = new URLSearchParams();
      if (selectedClassId) queryParams.set('classId', selectedClassId);
      if (examFilter) queryParams.set('examName', examFilter);

      await api.download(`/grades/export?${queryParams.toString()}`, 'grades_matrix_report.xlsx');
      toast.success('Grade matrix report downloaded!');
    } catch (err) {
      toast.error(err.message || 'Export failed');
    }
  };

  const { subjects = [], report = [] } = reportData;

  return (
    <div>
      {/* Filter Toolbar */}
      <div className="panel" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div className="toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <select
              className="filter-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.academicYear?.name})
                </option>
              ))}
            </select>

            <input
              type="text"
              className="form-input"
              style={{ width: 220 }}
              placeholder="Filter Exam Name (e.g. Midterm)..."
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
            />
          </div>

          <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={handleExport}>
            <DownloadIcon /> Export Excel
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={loadReport} />}

      {/* Grade Matrix Table */}
      <div className="panel">
        <div className="table-responsive">
          {loading ? (
            <PageLoader text="Compiling curriculum grade matrix..." />
          ) : report.length === 0 ? (
            <EmptyState
              title="No grades data available"
              description="No student grades match the specified filters."
            />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student Number</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  {subjects.map((sub) => (
                    <th key={sub.id} style={{ textAlign: 'center' }}>
                      {sub.name} ({sub.code})
                    </th>
                  ))}
                  <th style={{ textAlign: 'center' }}>Overall Average</th>
                </tr>
              </thead>
              <tbody>
                {report.map((row) => (
                  <tr key={row.studentId}>
                    <td><strong>{row.studentNumber}</strong></td>
                    <td><span style={{ fontWeight: 600 }}>{row.studentName}</span></td>
                    <td>{row.className}</td>
                    {subjects.map((sub) => {
                      const gradeInfo = row.subjectGrades[sub.code];
                      return (
                        <td key={sub.id} style={{ textAlign: 'center' }}>
                          {gradeInfo ? (
                            <div>
                              <strong style={{ fontSize: 13 }}>{gradeInfo.score} / {gradeInfo.maxScore}</strong>
                              <div style={{ fontSize: 11, color: gradeInfo.percentage >= 75 ? 'var(--success)' : 'var(--text-muted)' }}>
                                ({gradeInfo.percentage}%)
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-light)' }}>—</span>
                          )}
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'center' }}>
                      {row.average !== null ? (
                        <span
                          className={`badge ${
                            row.average >= 80 ? 'badge-active' : row.average >= 60 ? 'badge-late' : 'badge-inactive'
                          }`}
                          style={{ fontSize: 13, padding: '4px 10px' }}
                        >
                          {row.average}%
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-light)' }}>—</span>
                      )}
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
