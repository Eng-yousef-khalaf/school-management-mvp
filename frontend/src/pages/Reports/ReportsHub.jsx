import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import { DownloadIcon, StudentsIcon, TeachersIcon, AttendanceIcon, GradesIcon } from '../../components/common/Icons';

export default function ReportsHub({ onNavigate }) {
  const toast = useToast();

  const [demographics, setDemographics] = useState(null);
  const [teachersWorkload, setTeachersWorkload] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHubData = async () => {
    try {
      setLoading(true);
      setError('');
      const [demo, workload] = await Promise.all([
        api.get('/reports/demographics'),
        api.get('/reports/teachers')
      ]);
      setDemographics(demo);
      setTeachersWorkload(workload);
    } catch (err) {
      setError(err.message || 'Failed to compile report summaries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHubData();
  }, []);

  const exportStudentsDirectory = async () => {
    try {
      toast.info('Downloading student directory report...');
      await api.download('/reports/students/export', 'student_directory_report.xlsx');
      toast.success('Downloaded student directory report!');
    } catch (err) {
      toast.error(err.message || 'Export failed');
    }
  };

  const exportTeachersReport = async () => {
    try {
      toast.info('Downloading teacher workload report...');
      await api.download('/reports/teachers/export', 'teacher_workload_report.xlsx');
      toast.success('Downloaded teacher workload report!');
    } catch (err) {
      toast.error(err.message || 'Export failed');
    }
  };

  if (loading) return <PageLoader text="Loading analytical reports hub..." />;
  if (error) return <ErrorAlert message={error} onRetry={loadHubData} />;

  return (
    <div>
      {/* Report Categories Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 28 }}>
        <div className="panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div className="stat-icon primary">
              <StudentsIcon />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Student Directory Report</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Complete roster with parent details & status</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('students')}>
              View in Roster
            </button>
            <button className="btn btn-primary btn-sm" onClick={exportStudentsDirectory}>
              <DownloadIcon /> Export Excel
            </button>
          </div>
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div className="stat-icon success">
              <AttendanceIcon />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Attendance Audit Report</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Presence, absences, tardiness trends</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('attendance-reports')}>
              Open Attendance Reports
            </button>
          </div>
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div className="stat-icon warning">
              <GradesIcon />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Academic Grade Matrix</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Cross-subject exam scores and rankings</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('grade-reports')}>
              Open Grade Reports
            </button>
          </div>
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div className="stat-icon secondary">
              <TeachersIcon />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Faculty Workload Report</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Assigned classes and teaching subjects</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-primary btn-sm" onClick={exportTeachersReport}>
              <DownloadIcon /> Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Faculty Workload Table */}
      <div className="panel">
        <div className="panel-header">
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Faculty Workload & Class Assignment Summary</h3>
          <button className="btn btn-secondary btn-sm" onClick={exportTeachersReport}>
            <DownloadIcon /> Export Workload
          </button>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Employee No</th>
                <th>Faculty Name</th>
                <th>Specialty</th>
                <th>Total Assignments</th>
                <th>Assigned Classes</th>
                <th>Assigned Subjects</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {teachersWorkload.map((t, idx) => (
                <tr key={idx}>
                  <td><strong>{t.employeeNo}</strong></td>
                  <td><span style={{ fontWeight: 600 }}>{t.fullName}</span></td>
                  <td>{t.specialty}</td>
                  <td><strong>{t.totalAssignments}</strong></td>
                  <td>{t.classes}</td>
                  <td>{t.subjects}</td>
                  <td>
                    <span className={`badge ${t.active === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                      {t.active}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
