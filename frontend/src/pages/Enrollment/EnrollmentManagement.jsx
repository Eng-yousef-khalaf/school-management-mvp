import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { PlusIcon, TrashIcon, SearchIcon } from '../../components/common/Icons';

export default function EnrollmentManagement() {
  const toast = useToast();
  const { isStaff } = useAuth();

  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected filters
  const [selectedYearId, setSelectedYearId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [page, setPage] = useState(1);

  // Quick Enroll State
  const [singleStudentId, setSingleStudentId] = useState('');
  const [singleClassId, setSingleClassId] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  // Bulk Enroll Modal
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkClassId, setBulkClassId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [bulkSearch, setBulkSearch] = useState('');
  const [bulkStudentsList, setBulkStudentsList] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const loadMetadata = async () => {
    try {
      const [years, cls, studs] = await Promise.all([
        api.get('/academic-years'),
        api.get('/classes'),
        api.get('/students?limit=200&status=ACTIVE')
      ]);
      setAcademicYears(years);
      setClasses(cls);
      setStudents(studs.items || []);

      const activeY = years.find((y) => y.active) || years[0];
      if (activeY) setSelectedYearId(activeY.id);
      if (cls[0]) {
        setSingleClassId(cls[0].id);
        setBulkClassId(cls[0].id);
      }
      if (studs.items && studs.items[0]) {
        setSingleStudentId(studs.items[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load enrollment metadata');
    }
  };

  const loadEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '25'
      });
      if (selectedYearId) queryParams.set('academicYearId', selectedYearId);
      if (selectedClassId) queryParams.set('classId', selectedClassId);

      const data = await api.get(`/enrollments?${queryParams.toString()}`);
      setEnrollments(data.items);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  }, [selectedYearId, selectedClassId, page]);

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    if (selectedYearId !== undefined) {
      loadEnrollments();
    }
  }, [loadEnrollments]);

  const handleSingleEnroll = async (e) => {
    e.preventDefault();
    if (!singleStudentId || !singleClassId) {
      toast.error('Please select both a student and a class.');
      return;
    }

    setEnrolling(true);
    try {
      await api.post('/enrollments', {
        studentId: Number(singleStudentId),
        classId: Number(singleClassId),
        academicYearId: selectedYearId ? Number(selectedYearId) : undefined
      });
      toast.success('Student enrolled successfully!');
      loadEnrollments();
    } catch (err) {
      toast.error(err.message || 'Failed to enroll student');
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async (id, studentName) => {
    try {
      await api.delete(`/enrollments/${id}`);
      toast.success(`Unenrolled ${studentName} from class`);
      loadEnrollments();
    } catch (err) {
      toast.error(err.message || 'Failed to unenroll student');
    }
  };

  const openBulkModal = async () => {
    setIsBulkModalOpen(true);
    setSelectedStudentIds([]);
    try {
      const res = await api.get('/students?limit=200&status=ACTIVE');
      setBulkStudentsList(res.items || []);
    } catch {}
  };

  const handleBulkEnrollSubmit = async () => {
    if (!bulkClassId || selectedStudentIds.length === 0) {
      toast.error('Please select a target class and at least one student');
      return;
    }

    setBulkLoading(true);
    try {
      const res = await api.post('/enrollments/bulk', {
        classId: Number(bulkClassId),
        studentIds: selectedStudentIds,
        academicYearId: selectedYearId ? Number(selectedYearId) : undefined
      });
      toast.success(`Enrolled ${res.enrolledCount} students! (${res.skippedCount} skipped/duplicates)`);
      setIsBulkModalOpen(false);
      loadEnrollments();
    } catch (err) {
      toast.error(err.message || 'Failed to bulk enroll students');
    } finally {
      setBulkLoading(false);
    }
  };

  const filteredBulkStudents = bulkStudentsList.filter(s =>
    `${s.studentNumber} ${s.firstName} ${s.lastName}`.toLowerCase().includes(bulkSearch.toLowerCase())
  );

  return (
    <div>
      {/* Quick Enroll Form Panel */}
      {isStaff && (
        <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Quick Student Enrollment</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Assign a student to a class section for the academic calendar</p>
            </div>
            <button className="btn btn-secondary btn-sm" type="button" onClick={openBulkModal}>
              <PlusIcon /> Bulk Enroll Multiple Students
            </button>
          </div>

          <form onSubmit={handleSingleEnroll} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="form-label">Academic Year</label>
              <select
                className="form-select"
                value={selectedYearId}
                onChange={(e) => setSelectedYearId(e.target.value)}
              >
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name} {y.active ? '(Active)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="form-label">Target Class Section</label>
              <select
                className="form-select"
                value={singleClassId}
                onChange={(e) => setSingleClassId(e.target.value)}
                required
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.academicYear?.name})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: 2, minWidth: 280 }}>
              <label className="form-label">Student</label>
              <select
                className="form-select"
                value={singleStudentId}
                onChange={(e) => setSingleStudentId(e.target.value)}
                required
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.studentNumber} - {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={enrolling} style={{ height: 42 }}>
              {enrolling ? 'Enrolling...' : 'Enroll Student'}
            </button>
          </form>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="panel" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div className="toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Filter View:</span>
            <select
              className="filter-select"
              value={selectedYearId}
              onChange={(e) => {
                setSelectedYearId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Academic Years</option>
              {academicYears.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                </option>
              ))}
            </select>

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
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={loadEnrollments} />}

      {/* Enrollments Table */}
      <div className="panel">
        <div className="table-responsive">
          {loading ? (
            <PageLoader text="Loading enrollments..." />
          ) : enrollments.length === 0 ? (
            <EmptyState
              title="No enrollments found"
              description="Enroll students into class sections using the enrollment form above."
            />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student Number</th>
                  <th>Student Full Name</th>
                  <th>Gender</th>
                  <th>Enrolled Class</th>
                  <th>Academic Year</th>
                  <th>Enrollment Date</th>
                  {isStaff && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.id}>
                    <td><strong>{e.student.studentNumber}</strong></td>
                    <td>{e.student.firstName} {e.student.lastName}</td>
                    <td>{e.student.gender || '—'}</td>
                    <td>
                      <strong style={{ color: 'var(--primary)' }}>{e.class.name}</strong>
                    </td>
                    <td>{e.class.academicYear?.name || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(e.enrolledAt).toLocaleDateString()}
                    </td>
                    {isStaff && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-icon"
                          title="Unenroll student"
                          onClick={() => handleUnenroll(e.id, `${e.student.firstName} ${e.student.lastName}`)}
                          style={{ color: 'var(--danger)' }}
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    )}
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

      {/* Bulk Enroll Modal */}
      {isBulkModalOpen && (
        <Modal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          title="Bulk Enroll Students"
          size="lg"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setIsBulkModalOpen(false)} disabled={bulkLoading}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleBulkEnrollSubmit}
                disabled={bulkLoading || selectedStudentIds.length === 0}
              >
                {bulkLoading ? 'Processing...' : `Enroll (${selectedStudentIds.length}) Selected Students`}
              </button>
            </>
          }
        >
          <div className="form-group">
            <label className="form-label">Assign Selected Students to Class <span className="req">*</span></label>
            <select
              className="form-select"
              value={bulkClassId}
              onChange={(e) => setBulkClassId(e.target.value)}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.academicYear?.name})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search students in selection list..."
              value={bulkSearch}
              onChange={(e) => setBulkSearch(e.target.value)}
            />
          </div>

          <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 8 }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.length === filteredBulkStudents.length && filteredBulkStudents.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudentIds(filteredBulkStudents.map(s => s.id));
                        } else {
                          setSelectedStudentIds([]);
                        }
                      }}
                    />
                  </th>
                  <th>Student Number</th>
                  <th>Full Name</th>
                  <th>Current Class</th>
                </tr>
              </thead>
              <tbody>
                {filteredBulkStudents.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(s.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudentIds(prev => [...prev, s.id]);
                          } else {
                            setSelectedStudentIds(prev => prev.filter(id => id !== s.id));
                          }
                        }}
                      />
                    </td>
                    <td><strong>{s.studentNumber}</strong></td>
                    <td>{s.firstName} {s.lastName}</td>
                    <td>{s.currentClass || 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
}
