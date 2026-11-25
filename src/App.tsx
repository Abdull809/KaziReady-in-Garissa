import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/src/authentication/AuthContext';
import { ToastProvider } from '@/src/hooks/useToast';
import { PublicLayout } from '@/src/layouts/PublicLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';

import { HomePage } from '@/src/pages/HomePage';
import { OpportunitiesPage } from '@/src/pages/OpportunitiesPage';
import { OpportunityDetailPage } from '@/src/pages/OpportunityDetailPage';
import { ForEmployersPage } from '@/src/pages/ForEmployersPage';
import { DocumentationPage } from '@/src/pages/DocumentationPage';
import { AboutPage } from '@/src/pages/AboutPage';
import { ContactPage } from '@/src/pages/ContactPage';
import { LoginPage } from '@/src/pages/LoginPage';
import { RegisterPage } from '@/src/pages/RegisterPage';

import { ApplicantDashboard } from '@/src/dashboard/ApplicantDashboard';
import { EmployerDashboard } from '@/src/dashboard/EmployerDashboard';
import { AdminDashboard } from '@/src/dashboard/AdminDashboard';

function ScrollHandler() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.replace('#', ''));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ScrollHandler />
          <Routes>
            {/* Public Website Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/opportunities" element={<OpportunitiesPage />} />
              <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
              <Route path="/for-employers" element={<ForEmployersPage />} />
              <Route path="/documentation" element={<DocumentationPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Role-Based Protected Dashboards */}
            <Route
              path="/dashboard/applicant"
              element={
                <ProtectedRoute allowedRoles={['applicant']}>
                  <ApplicantDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/employer"
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <EmployerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
