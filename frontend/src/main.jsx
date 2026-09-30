import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import { AcademicYearProvider } from './context/AcademicYearContext';
import { SchoolConfigProvider } from './context/SchoolConfigContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import './styles/index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <SchoolConfigProvider>
        <LanguageProvider>
          <ToastProvider>
            <AuthProvider>
              <AcademicYearProvider>
                <NotificationProvider>
                  <ErrorBoundary onReset={() => window.location.reload()}>
                    <App />
                  </ErrorBoundary>
                </NotificationProvider>
              </AcademicYearProvider>
            </AuthProvider>
          </ToastProvider>
        </LanguageProvider>
      </SchoolConfigProvider>
    </React.StrictMode>
  );
}
