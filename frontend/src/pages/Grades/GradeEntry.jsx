import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';

export default function GradeEntry() {
  const toast = useToast();

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [examName, setExamName] = useState('Midterm Exam');
  const [maxScore, setMaxScore] = useState(100);

  const [sheet, setSheet] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadDropdowns = async () => {
    try {
      const [cls, subs] = await Promise.all([
        api.get('/classes'),
        api.get('/subjects')
      ]);
      setClasses(cls);
      setSubjects(subs);
      if (cls[0]) setSelectedClassId(cls[0].id);
      if (subs[0]) setSelectedSubjectId(subs[0].id);
    } catch {}
  };

  const loadGradeSheet = useCallback(async () => {
    if (!selectedClassId || !selectedSubjectId || !examName) return;
    try {
      setLoading(true);
      setError('');
      const queryParams = new URLSearchParams({
        classId: String(selectedClassId),
        subjectId: String(selectedSubjectId),
        examName: examName.trim()
      });

      const res = await api.get(`/grades/sheet?${queryParams.toString()}`);
      setSheet(res.sheet || []);
    } catch (err) {
      setError(err.message || 'Failed to load grade entry sheet');
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, selectedSubjectId, examName]);

  useEffect(() => {
    loadDropdowns();
  }, []);

  useEffect(() => {
    if (selectedClassId && selectedSubjectId) {
      loadGradeSheet();
    }
  }, [loadGradeSheet]);

  const handleScoreChange = (studentId, scoreVal) => {
    setSheet(prev =>
      prev.map(row => {
        if (row.studentId === studentId) {
          const num = scoreVal === '' ? '' : Number(scoreVal);
          const percent = num !== '' && maxScore > 0 ? Math.round((num / maxScore) * 100) : null;
          return { ...row, score: num, percentage: percent };
        }
        return row;
      })
    );
  };

  const handleSaveGrades = async () => {
    setSaving(true);
    try {
      const gradePayload = sheet
        .filter(s => s.score !== null && s.score !== '' && s.score !== undefined)
        .map(s => ({
          studentId: s.studentId,
          score: Number(s.score)
        }));

      if (gradePayload.length === 0) {
        toast.warning('Please enter scores for at least one student before saving.');
        setSaving(false);
        return;
      }

      await api.post('/grades/bulk', {
        classId: Number(selectedClassId),
        subjectId: Number(selectedSubjectId),
        examName: examName.trim(),
        maxScore: Number(maxScore),
        grades: gradePayload
      });

      toast.success(`Grades saved successfully for ${gradePayload.length} students!`);
      loadGradeSheet();
    } catch (err) {
      toast.error(err.message || 'Failed to save grades');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Grade Entry Controls */}
      <div className="panel" style={{ padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, alignItems: 'flex-end' }}>
          <div>
            <label className="form-label">Class Section</label>
            <select
              className="form-select"
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

          <div>
            <label className="form-label">Curriculum Subject</label>
            <select
              className="form-select"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Exam / Assessment Name</label>
            <input
              type="text"
              className="form-input"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="e.g. Midterm Exam, Quiz 1"
            />
          </div>

          <div>
            <label className="form-label">Max Score</label>
            <input
              type="number"
              className="form-input"
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              min="1"
            />
          </div>

          <div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', height: 42 }}
              onClick={handleSaveGrades}
              disabled={saving || sheet.length === 0}
            >
              {saving ? 'Saving...' : 'Save Grades to Database'}
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={loadGradeSheet} />}

      {/* Grade Entry Sheet Table */}
      <div className="panel">
        <div className="panel-header">
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>
            Student Grading Sheet ({sheet.length} Students)
          </h3>
        </div>
        <div className="table-responsive">
          {loading ? (
            <PageLoader text="Loading grading roster..." />
          ) : sheet.length === 0 ? (
            <EmptyState
              title="No students in this class"
              description="Enroll students into this class before recording grades."
            />
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: 140 }}>Student ID</th>
                  <th>Student Full Name</th>
                  <th style={{ width: 180 }}>Score (out of {maxScore})</th>
                  <th style={{ width: 140 }}>Percentage</th>
                  <th>Status Assessment</th>
                </tr>
              </thead>
              <tbody>
                {sheet.map((row) => (
                  <tr key={row.studentId}>
                    <td><strong>{row.studentNumber}</strong></td>
                    <td><span style={{ fontWeight: 600 }}>{row.fullName}</span></td>
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        style={{ padding: '6px 12px', fontWeight: 700, fontSize: 14, width: 120 }}
                        placeholder="0"
                        min="0"
                        max={maxScore}
                        value={row.score === null || row.score === undefined ? '' : row.score}
                        onChange={(e) => handleScoreChange(row.studentId, e.target.value)}
                      />
                    </td>
                    <td>
                      {row.percentage !== null ? (
                        <strong
                          style={{
                            fontSize: 15,
                            color: row.percentage >= 80 ? 'var(--success)' : row.percentage >= 60 ? 'var(--primary)' : 'var(--danger)'
                          }}
                        >
                          {row.percentage}%
                        </strong>
                      ) : (
                        <span style={{ color: 'var(--text-light)' }}>—</span>
                      )}
                    </td>
                    <td>
                      {row.percentage !== null && (
                        <span
                          className={`badge ${
                            row.percentage >= 85
                              ? 'badge-active'
                              : row.percentage >= 60
                              ? 'badge-late'
                              : 'badge-inactive'
                          }`}
                        >
                          {row.percentage >= 85 ? 'Excellent' : row.percentage >= 60 ? 'Passing' : 'Needs Improvement'}
                        </span>
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
