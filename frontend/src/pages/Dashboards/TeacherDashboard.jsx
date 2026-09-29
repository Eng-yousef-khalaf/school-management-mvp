import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import StatCard from '../../components/common/StatCard';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import {
  ClassesIcon,
  SubjectsIcon,
  StudentsIcon,
  AttendanceIcon,
  GradesIcon
} from '../../components/common/Icons';
import UserAvatar from '../../components/common/UserAvatar';

export default function TeacherDashboard({ onNavigate }) {
  const { user } = useAuth();
  const { t, isRtl } = useLanguage();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTeacherData() {
      try {
        setLoading(true);
        setError('');
        const [clsRes, subRes] = await Promise.all([
          api.get('/classes').catch(() => []),
          api.get('/subjects').catch(() => [])
        ]);
        const safeClasses = Array.isArray(clsRes) ? clsRes : (clsRes?.items || []);
        const safeSubjects = Array.isArray(subRes) ? subRes : (subRes?.items || []);
        setClasses(safeClasses);
        setSubjects(safeSubjects);
      } catch (err) {
        setError(err.message || 'Failed to load teacher data');
      } finally {
        setLoading(false);
      }
    }
    loadTeacherData();
  }, []);

  if (loading) return <PageLoader text={t('loading')} />;
  if (error) return <ErrorAlert message={error} />;

  const safeClassesList = Array.isArray(classes) ? classes : [];
  const safeSubjectsList = Array.isArray(subjects) ? subjects : [];
  const totalAssignedStudents = safeClassesList.reduce((acc, c) => acc + (c._count?.enrollments || c.studentCount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Teacher Welcome Role Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0ea5e9, #4f46e5)',
        color: '#fff',
        padding: '16px 20px',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 4px 14px rgba(14, 165, 233, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <UserAvatar
            src={user?.photoUrl || user?.teacher?.photoUrl}
            name={user?.fullName || 'المعلم'}
            role="TEACHER"
            size={58}
            showRoleBadge={true}
            style={{ border: '2.5px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
          />
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: '14px', fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>
              <span>👨‍🏫</span>
              <span>{isRtl ? 'بوابة المعلم المعتمدة' : 'Official Teacher Portal'}</span>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
              {isRtl ? `أهلاً بك، أستاذ ${user?.fullName || ''}` : `Welcome back, Instructor ${user?.fullName || ''}`}
            </h2>
            <p style={{ margin: '3px 0 0', opacity: 0.9, fontSize: 12 }}>
              {isRtl
                ? 'مساحة العمل المخصصة لمتابعة صفوفك، رصد الحضور اليومي، وإدخال درجات وتقييمات الطلاب'
                : 'Your dedicated workspace for managing assigned classes, recording daily attendance, and submitting exam grades'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onNavigate('attendance')}
            className="btn btn-sm"
            style={{ background: '#fff', color: 'var(--primary)', fontWeight: 800 }}
          >
            <AttendanceIcon /> {isRtl ? 'رصد الحضور اليوم' : 'Mark Today Attendance'}
          </button>
          <button
            onClick={() => onNavigate('grades')}
            className="btn btn-sm"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', fontWeight: 700 }}
          >
            <GradesIcon /> {isRtl ? 'رصد الدرجات' : 'Enter Grades'}
          </button>
        </div>
      </div>

      {/* Teacher Top Metrics Cards */}
      <div className="grid-cards-4">
        <StatCard
          title={isRtl ? 'الصفوف والشعب المسندة' : 'Assigned Class Sections'}
          value={classes.length}
          subtext={isRtl ? 'الشعب الدراسية النشطة' : 'Active class sections'}
          icon={<ClassesIcon />}
          color="secondary"
        />
        <StatCard
          title={isRtl ? 'المواد والمناهج' : 'Curriculum Subjects'}
          value={subjects.length}
          subtext={isRtl ? 'المقررات التعليمية' : 'Course modules'}
          icon={<SubjectsIcon />}
          color="warning"
        />
        <StatCard
          title={isRtl ? 'إجمالي طلاب شعبك' : 'Total Students in Classes'}
          value={totalAssignedStudents}
          subtext={isRtl ? 'طالب مسجل في صفوفك' : 'Enrolled students'}
          icon={<StudentsIcon />}
          color="primary"
        />
        <StatCard
          title={isRtl ? 'المهام الأكاديمية' : 'Teacher Workflows'}
          value={isRtl ? 'جاهز' : 'Ready'}
          subtext={isRtl ? 'الحضور والدرجات مفعلة' : 'Attendance & grading active'}
          icon={<AttendanceIcon />}
          color="success"
        />
      </div>

      {/* Teacher Teaching Sections Grid */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">
              {isRtl ? 'صفوفك ومقرراتك الدراسية (My Teaching Sections)' : 'My Teaching Sections & Classes'}
            </h3>
            <p className="panel-subtitle">
              {isRtl ? 'اختر الصف لاتخاذ إجراء مباشر برصد الحضور أو إدخال درجات المادة' : 'Select a section to immediately record attendance or enter grades'}
            </p>
          </div>
        </div>

        <div style={{ padding: 14 }}>
          {safeClassesList.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
              {safeClassesList.map((cls) => (
                <div
                  key={cls.id}
                  style={{
                    background: 'var(--bg-main)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                        {cls.name}
                      </h4>
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        {cls.grade} {cls.section ? `- ${cls.section}` : ''}
                      </span>
                    </div>
                    <span className="badge badge-primary" style={{ fontWeight: 700 }}>
                      {cls._count?.enrollments || cls.studentCount || 0} {isRtl ? 'طالب' : 'Students'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 'auto' }}>
                    <button
                      onClick={() => onNavigate('attendance', { attendanceClassId: cls.id })}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: 12, justifyContent: 'center' }}
                    >
                      <AttendanceIcon /> {isRtl ? 'دفتر الحضور' : 'Attendance'}
                    </button>
                    <button
                      onClick={() => onNavigate('grades')}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 12, justifyContent: 'center' }}
                    >
                      <GradesIcon /> {isRtl ? 'الدرجات' : 'Grades'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '36px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>👨‍🏫</div>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px 0' }}>
                {isRtl ? `أهلاً بك أستاذ ${user?.fullName || ''} في المنظومة المدرسية` : `Welcome Instructor ${user?.fullName || ''}`}
              </h4>
              <p style={{ fontSize: 13, color: '#64748b', margin: '0 auto 14px', maxWidth: 520, lineHeight: 1.6 }}>
                {isRtl
                  ? 'تم تفعيل واعتماد حسابك كمعلم رسمي في المنظومة بنجاح. بمجرد قيام إدارة المدرسة بإنشاء وتوزيع الشعب الدراسية للعام الجديد، ستظهر هنا فوراً لرصد الحضور والدرجات.'
                  : 'Your teacher account is authenticated and active. Once class sections are allocated by administration, they will appear here.'}
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ecfdf5', color: '#047857', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
                <span>✅</span>
                <span>{isRtl ? 'حسابك معتمد ومفعل بصلاحيات معلم كاملة' : 'Account active with full faculty privileges'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Role Boundaries Notice for Teacher */}
      <div style={{
        background: 'rgba(14, 165, 233, 0.08)',
        border: '1px solid rgba(14, 165, 233, 0.25)',
        padding: '16px 20px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: 14
      }}>
        <span style={{ fontSize: 24 }}>🔒</span>
        <div>
          <strong style={{ color: 'var(--text-main)', fontSize: 14 }}>
            {isRtl ? 'نطاق صلاحيات حساب المعلم (Role Permissions Scope):' : 'Teacher Role Permissions Scope:'}
          </strong>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
            {isRtl
              ? 'صلاحياتك مخصصة لرصد الحضور، تسجيل الدرجات، واستعراض كشوف الطلاب للشعب المسندة إليك. تعديل هيكل المدرسة وإدارة المستخدمين محجوبة وتتطلب صلاحية الإدارة.'
              : 'Your permissions are focused on attendance taking, grade submission, and student roster viewing for your classes. Administrative settings and user management are restricted to Admin and Staff.'}
          </div>
        </div>
      </div>
    </div>
  );
}
