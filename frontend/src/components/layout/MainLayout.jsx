import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import api from '../../services/api';

export default function MainLayout({ children, currentPage, onNavigate, pageTitle, pageSubtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeYear, setActiveYear] = useState(null);

  useEffect(() => {
    api.get('/academic-years/active')
      .then((data) => {
        if (data && data.name) {
          setActiveYear(data.name);
        }
      })
      .catch(() => {});
  }, []);

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
          activeYearName={activeYear}
          onNavigate={onNavigate}
        />
        <main className="content-body">{children}</main>
      </div>
    </div>
  );
}
