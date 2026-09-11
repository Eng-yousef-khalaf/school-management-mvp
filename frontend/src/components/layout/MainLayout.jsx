import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { useLanguage } from '../../context/LanguageContext';

export default function MainLayout({ children, currentPage, onNavigate, pageTitle, pageSubtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isArchiveView, selectedYear, activeYear, resetToActiveYear } = useAcademicYear();
  const { isRtl } = useLanguage();

  return (
    <div className="app-container">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main-wrapper">
        <Header
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onNavigate={onNavigate}
        />

        {/* Admin-Exclusive Archive Inspection Banner */}
        {isArchiveView && (
          <div style={{
            background: 'linear-gradient(135deg, #78350f, #92400e)',
            color: '#ffffff',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderBottom: '2px solid #f59e0b'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>📁</span>
              <div>
                <strong style={{ fontSize: 14 }}>
                  {isRtl
                    ? `وضع مراجعة الأرشيف: أنت تستعرض الآن بيانات العام الدراسي (${selectedYear?.name})`
                    : `Archive Inspection Mode: You are reviewing records for (${selectedYear?.name})`}
                </strong>
                <span style={{ display: 'block', fontSize: 12, opacity: 0.85, marginTop: 2 }}>
                  {isRtl
                    ? `(هذا العام منتهي ومؤرشف وغير نشط - العرض للقراءة والمراجعة الإدارية فقط دون تغيير العام النشط: ${activeYear?.name})`
                    : `(This year is archived/inactive - Read-only review mode without affecting active year: ${activeYear?.name})`}
                </span>
              </div>
            </div>

            <button
              onClick={resetToActiveYear}
              className="btn btn-sm"
              style={{
                background: '#f59e0b',
                color: '#ffffff',
                fontWeight: 800,
                border: 'none',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              {isRtl ? '↩ العودة للعام الحالي النشط' : '↩ Return to Active Year'}
            </button>
          </div>
        )}

        <main className="content-body">{children}</main>
      </div>
    </div>
  );
}
