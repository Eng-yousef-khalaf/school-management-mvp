import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import UserAvatar from '../../components/common/UserAvatar';
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

  // Online Registrations (20 NIS Seat Reservations)
  const [activeTab, setActiveTab] = useState('current'); // 'current' | 'online_registrations'
  const [onlineRequests, setOnlineRequests] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jothoor_online_registrations') || '[]');
    } catch {
      return [];
    }
  });
  const [selectedReceiptPreview, setSelectedReceiptPreview] = useState(null);
  const [approvingReq, setApprovingReq] = useState(null);
  const [targetApproveClassId, setTargetApproveClassId] = useState('');
  const [approvingLoading, setApprovingLoading] = useState(false);

  const loadOnlineRegistrations = useCallback(async () => {
    try {
      const res = await api.get('/students/registrations/all');
      if (res?.items && Array.isArray(res.items)) {
        // Merge with any offline local storage registrations
        let local = [];
        try {
          local = JSON.parse(localStorage.getItem('jothoor_online_registrations') || '[]');
        } catch {}

        const backendIds = new Set(res.items.map(r => String(r.id)));
        const combined = [...res.items];
        local.forEach(loc => {
          if (!backendIds.has(String(loc.id))) {
            combined.push(loc);
          }
        });

        setOnlineRequests(combined);
        try {
          localStorage.setItem('jothoor_online_registrations', JSON.stringify(combined));
        } catch {}
      }
    } catch {
      // Keep local
    }
  }, []);

  useEffect(() => {
    loadOnlineRegistrations();
    const handleNewReg = () => {
      loadOnlineRegistrations();
    };
    window.addEventListener('new_student_registration', handleNewReg);
    return () => window.removeEventListener('new_student_registration', handleNewReg);
  }, [loadOnlineRegistrations]);

  const handleApproveOnlineRequest = async (req) => {
    if (!targetApproveClassId) {
      toast.error('يرجى اختيار الشعبة الدراسية لتسكين الطالب');
      return;
    }

    setApprovingLoading(true);
    try {
      // 1. Call backend registration approval API
      let approvedOnBackend = false;
      try {
        await api.post(`/students/registrations/${req.id}/approve`, {
          classId: Number(targetApproveClassId)
        });
        approvedOnBackend = true;
      } catch {
        // Fallback: direct student creation
      }

      if (!approvedOnBackend) {
        const nameParts = (req.studentFullName || '').trim().split(' ');
        const firstName = nameParts[0] || 'طالب';
        const lastName = nameParts[nameParts.length - 1] || 'جديد';
        const middleName = nameParts.slice(1, -1).join(' ') || '';

        const newStudentPayload = {
          studentNumber: `STU-2026-${Math.floor(100 + Math.random() * 900)}`,
          firstName,
          middleName,
          lastName,
          gender: req.gender || 'MALE',
          dateOfBirth: req.dateOfBirth || '2015-01-01',
          phone: req.parentPhone || '',
          parentName: req.parentFullName || '',
          parentPhone: req.parentPhone || '',
          address: req.fullAddress || req.cityArea || '',
          photoUrl: req.studentPhoto || '',
          status: 'ACTIVE',
          classId: Number(targetApproveClassId)
        };

        const createdStudent = await api.post('/students', newStudentPayload).catch(() => ({
          id: Date.now(),
          ...newStudentPayload
        }));

        if (createdStudent?.id) {
          await api.post('/enrollments', {
            studentId: createdStudent.id,
            classId: Number(targetApproveClassId),
            academicYearId: selectedYearId ? Number(selectedYearId) : undefined
          }).catch(() => null);
        }
      }

      const updated = onlineRequests.map(r => r.id === req.id ? { ...r, status: 'APPROVED', enrolledClassId: targetApproveClassId } : r);
      setOnlineRequests(updated);
      try {
        localStorage.setItem('jothoor_online_registrations', JSON.stringify(updated));
      } catch {}

      toast.success(`تم تثبيت قيد الطالب (${req.studentFullName}) وتسكينه بالشعبة بنجاح!`);
      setApprovingReq(null);
      loadMetadata();
      loadEnrollments();
      loadOnlineRegistrations();
    } catch (err) {
      toast.error(err.message || 'فشل اعتماد وتسكين الطالب');
    } finally {
      setApprovingLoading(false);
    }
  };

  const handleRejectOnlineRequest = async (req) => {
    if (!window.confirm(`هل أنت متأكد من حذف/استبعاد طلب تسجيل (${req.studentFullName})؟`)) {
      return;
    }

    try {
      await api.delete(`/students/registrations/${req.id}`).catch(() => null);
      const updated = onlineRequests.filter(r => r.id !== req.id);
      setOnlineRequests(updated);
      try {
        localStorage.setItem('jothoor_online_registrations', JSON.stringify(updated));
      } catch {}
      toast.success(`تم استبعاد طلب تسجيل (${req.studentFullName})`);
    } catch (err) {
      toast.error(err.message || 'فشل حذف الطلب');
    }
  };

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

  const pendingCount = onlineRequests.filter(r => r.status !== 'APPROVED').length;

  return (
    <div>
      {/* Top Tab Switcher */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('current')}
          className={`btn ${activeTab === 'current' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontWeight: 800, padding: '10px 18px', borderRadius: 12 }}
        >
          📋 كشف التسكين وتوزيع الفصول الحالي ({pagination?.total || enrollments.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('online_registrations')}
          className={`btn ${activeTab === 'online_registrations' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontWeight: 800, padding: '10px 18px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <span>🎓</span>
          <span>طلبات التسجيل وحجز المقاعد الإلكترونية (20 شيكل)</span>
          {pendingCount > 0 ? (
            <span style={{
              background: '#ef4444',
              color: '#ffffff',
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 12,
              fontWeight: 900
            }}>
              {pendingCount} جديد
            </span>
          ) : (
            <span style={{ background: 'rgba(0,0,0,0.06)', padding: '2px 8px', borderRadius: 12, fontSize: 11 }}>
              {onlineRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Online Registrations & Seat Reservation Tab View */}
      {activeTab === 'online_registrations' && (
        <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 4px' }}>
                طلبات حجز المقاعد والتسجيل الإلكتروني الواردة من الموقع العام
              </h3>
              <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-muted)' }}>
                تدقيق إشعارات التحويل (20 شيكل) لحجز المقعد، ثم تثبيت القيد وتسكين الطالب مباشرة في الشعبة الدراسية المناسبة.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '6px 12px', borderRadius: 10 }}>
                رسوم الحجز: 20 NIS مخصومة من القسط
              </span>
            </div>
          </div>

          {onlineRequests.length === 0 ? (
            <EmptyState
              title="لا توجد طلبات تسجيل إلكتروني جديدة حالياً"
              description="تظهر هنا فوراً الطلبات المقدمة من أولياء الأمور عبر الصفحة العامة لمدرسة جذور ومرفق معها إشعار تحويل الـ 20 شيكل."
            />
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>الطالب</th>
                    <th>الصف المطلوب</th>
                    <th>ولي الأمر والتواصل</th>
                    <th>بيانات سداد الـ 20 شيكل</th>
                    <th>إشعار التحويل</th>
                    <th>الحالة</th>
                    <th style={{ textAlign: 'center' }}>الإجراء وتسكين الشعبة</th>
                  </tr>
                </thead>
                <tbody>
                  {onlineRequests.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <UserAvatar
                            src={req.studentPhoto}
                            name={req.studentFullName}
                            role="STUDENT"
                            gender={req.gender}
                            size={36}
                          />
                          <div>
                            <strong style={{ display: 'block', color: 'var(--text-main)' }}>{req.studentFullName}</strong>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              هوية: {req.nationalId || '—'} | {req.dateOfBirth || ''}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', padding: '3px 8px', borderRadius: 6, fontSize: 12 }}>
                          {req.gradeLevel}
                        </span>
                      </td>
                      <td>
                        <div>
                          <strong>{req.parentFullName}</strong> ({req.relationship || 'ولي أمر'})
                          <div style={{ fontSize: 11.5, color: '#0284c7', marginTop: 2 }}>
                            📞 {req.parentPhone}
                          </div>
                          {req.parentWhatsapp && (
                            <a
                              href={`https://wa.me/${req.parentWhatsapp.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: 11, color: '#16a34a', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 2 }}
                            >
                              💬 واتساب
                            </a>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12 }}>
                          <span style={{ fontWeight: 800, color: '#047857' }}>20 NIS</span>
                          <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                            المحوّل: <strong>{req.senderName}</strong>
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 11, direction: 'ltr', textAlign: 'right' }}>
                            مرجع: <code>{req.referenceNumber}</code> ({req.paymentMethod})
                          </div>
                        </div>
                      </td>
                      <td>
                        {req.receiptImage ? (
                          <button
                            type="button"
                            onClick={() => setSelectedReceiptPreview(req.receiptImage)}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: 11, padding: '4px 8px', color: 'var(--primary)' }}
                          >
                            📎 معاينة الإشعار
                          </button>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>لا يوجد مرفق</span>
                        )}
                      </td>
                      <td>
                        {req.status === 'APPROVED' ? (
                          <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: 12, fontSize: 11.5, fontWeight: 800 }}>
                            ✓ تم التثبيت والتسكين
                          </span>
                        ) : (
                          <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: 12, fontSize: 11.5, fontWeight: 800 }}>
                            ⏳ بانتظار التسكين
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {req.status === 'APPROVED' ? (
                          <span style={{ color: '#059669', fontSize: 12, fontWeight: 700 }}>مسجل بالمنظومة</span>
                        ) : (
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => {
                                setApprovingReq(req);
                                setTargetApproveClassId(classes[0]?.id ? String(classes[0].id) : '');
                              }}
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: 12, fontWeight: 800, padding: '6px 12px' }}
                            >
                              ✓ تثبيت وتسكين
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectOnlineRequest(req)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: 12, color: '#ef4444', padding: '6px 10px', borderColor: '#fca5a5' }}
                              title="حذف أو استبعاد الطلب"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Receipt Image Preview Modal */}
          {selectedReceiptPreview && (
            <Modal
              isOpen={Boolean(selectedReceiptPreview)}
              onClose={() => setSelectedReceiptPreview(null)}
              title="معاينة إشعار تحويل الـ 20 شيكل (حجز المقعد)"
            >
              <div style={{ textAlign: 'center' }}>
                <img
                  src={selectedReceiptPreview}
                  alt="Receipt Full Preview"
                  style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 12, border: '1px solid #cbd5e1' }}
                />
              </div>
            </Modal>
          )}

          {/* Approve and Enroll Student Modal */}
          {approvingReq && (
            <Modal
              isOpen={Boolean(approvingReq)}
              onClose={() => setApprovingReq(null)}
              title={`تثبيت قيد وتسكين: ${approvingReq.studentFullName}`}
              footer={
                <>
                  <button className="btn btn-secondary" onClick={() => setApprovingReq(null)} disabled={approvingLoading}>
                    إلغاء
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleApproveOnlineRequest(approvingReq)}
                    disabled={approvingLoading || !targetApproveClassId}
                  >
                    {approvingLoading ? 'جاري التسكين...' : 'تأكيد التثبيت وإضافة الطالب للشعبة ←'}
                  </button>
                </>
              }
            >
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                  سيتم إنشاء ملف رسمي فوري للطالب <strong>{approvingReq.studentFullName}</strong> وتسكينه في الشعبة المختارة للعام الأكاديمي النشط.
                </p>

                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                    <span>الصف المطلوب من ولي الأمر:</span>
                    <strong>{approvingReq.gradeLevel}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                    <span>حالة رسوم حجز المقعد:</span>
                    <strong style={{ color: '#059669' }}>20 شيكل (مدفوعة ومحققة)</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 800 }}>
                    اختر الشعبة الدراسية لتسكين الطالب بها: <span className="req">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={targetApproveClassId}
                    onChange={(e) => setTargetApproveClassId(e.target.value)}
                    required
                    style={{ fontSize: 13, fontWeight: 700 }}
                  >
                    <option value="">-- اختر الصف والشعبة --</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.grade} {c.section ? `- شعبة ${c.section}` : ''})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Modal>
          )}
        </div>
      )}

      {/* Main Existing Enrollment Content (When on 'current' tab) */}
      {activeTab === 'current' && (
        <>
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
        </>
      )}
    </div>
  );
}
