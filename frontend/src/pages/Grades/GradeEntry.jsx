import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';

export default function GradeEntry() {
  const toast = useToast();
  const { user, isTeacher, canEnterGrades } = useAuth();
  const { t, isRtl } = useLanguage();

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
      {/* Teacher Role Banner */}
      {isTeacher ? (
        <div style={{
          background: 'rgba(14, 165, 233, 0.08)',
          border: '1px solid rgba(14, 165, 233, 0.25)',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>👨‍🏫</span>
            <div>
              <strong style={{ color: '#0284c7', fontSize: 13 }}>
                {isRtl ? 'بوابة رصد الدرجات الأكاديمية (خاص بالمعلم):' : 'Teacher Grade Entry Portal:'}
              </strong>
              <span style={{ color: 'var(--text-muted)', fontSize: 12, marginRight: 8, marginLeft: 8 }}>
                {isRtl
                  ? 'يتم رصد درجات الطلاب لشعبك ومقرراتك المسندة إليك مباشرة، وتنعكس النتائج فورياً في كشوف درجات شؤون الطلاب والمدير العام.'
                  : 'Record exam marks for your assigned classes and subjects. Saved marks instantly update registrar & management grade reports.'}
              </span>
            </div>
          </div>
          <span className="badge" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#0284c7', fontSize: 11, fontWeight: 700 }}>
            {isRtl ? 'رصد فوري' : 'Live Sync'}
          </span>
        </div>
      ) : (
        <div style={{
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>ℹ️</span>
            <div>
              <strong style={{ color: '#b45309', fontSize: 13 }}>
                {isRtl ? 'صلاحية إدخال الدرجات:' : 'Grading Authority Notice:'}
              </strong>
              <span style={{ color: 'var(--text-muted)', fontSize: 12, marginRight: 8, marginLeft: 8 }}>
                {isRtl
                  ? 'إدخال ورصد الدرجات مخصص لمعلم المادة والشعبة لضمان دقة التقييم. يمكنك استعراض وطباعة النتائج الجاهزة من قسم "كشوف ونتائج الطلاب".'
                  : 'Direct grade entry is assigned to the respective course teacher. You can inspect compiled results and averages in "Grade Reports".'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grade Entry Controls */}
      <div className="panel" style={{ padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, alignItems: 'flex-end' }}>
          <div>
            <label className="form-label">{isRtl ? 'الصف والشعبة' : 'Class Section'}</label>
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
            <label className="form-label">{isRtl ? 'المادة والمقرر' : 'Curriculum Subject'}</label>
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
            <label className="form-label">{isRtl ? 'نوع الاختبار / التقييم' : 'Exam / Assessment Name'}</label>
            <input
              type="text"
              className="form-input"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder={isRtl ? 'مثال: اختبار منتصف الفصل، تقويم 1...' : 'e.g. Midterm Exam, Quiz 1'}
            />
          </div>

          <div>
            <label className="form-label">{isRtl ? 'الدرجة العظمى' : 'Max Score'}</label>
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
              disabled={saving || sheet.length === 0 || !canEnterGrades}
            >
              {saving ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? '💾 حفظ الدرجات في النظام' : '💾 Save Grades')}
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={loadGradeSheet} />}

      {/* Grade Entry Sheet Table */}
      <div className="panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>
            {isRtl ? `كشف رصد درجات الطلاب (${sheet.length} طالب)` : `Student Grading Sheet (${sheet.length} Students)`}
          </h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {isRtl ? 'يتم حساب النسبة المئوية تلقائياً أثناء الإدخال' : 'Percentages calculate automatically upon typing'}
          </span>
        </div>
        <div className="table-responsive">
          {loading ? (
            <PageLoader text={isRtl ? 'جاري تحميل سجل درجات الفصل...' : 'Loading grading roster...'} />
          ) : sheet.length === 0 ? (
            <EmptyState
              title={isRtl ? 'لا يوجد طلاب مسجلين في هذه الشعبة' : 'No students in this class'}
              description={isRtl ? 'تأكد من تسكين الطلاب في الصف الدراسي قبل رصد الدرجات.' : 'Enroll students into this class before recording grades.'}
            />
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: 140 }}>{isRtl ? 'الرقم الأكاديمي' : 'Student ID'}</th>
                  <th>{isRtl ? 'اسم الطالب الرباعي' : 'Student Full Name'}</th>
                  <th style={{ width: 180 }}>{isRtl ? `الدرجة (من ${maxScore})` : `Score (out of ${maxScore})`}</th>
                  <th style={{ width: 140 }}>{isRtl ? 'النسبة المئوية' : 'Percentage'}</th>
                  <th>{isRtl ? 'التقدير والتقييم' : 'Status Assessment'}</th>
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
                        disabled={!canEnterGrades}
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
                          {row.percentage >= 85 
                            ? (isRtl ? 'ممتاز' : 'Excellent') 
                            : row.percentage >= 60 
                            ? (isRtl ? 'ناجح' : 'Passing') 
                            : (isRtl ? 'بحاجة لمعالجة' : 'Needs Improvement')}
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
