import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import { AcademicYearProvider } from './context/AcademicYearContext';
import './styles/index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <AcademicYearProvider>
              <App />
            </AcademicYearProvider>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </React.StrictMode>
  );
}
