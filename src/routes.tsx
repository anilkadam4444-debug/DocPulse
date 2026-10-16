import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './features/landing/LandingPage';
import { DoctorDiscoveryPage } from './features/discovery/DoctorDiscoveryPage';
import { PublicDoctorProfilePage } from './features/discovery/PublicDoctorProfilePage';
import { DoctorRegisterWizard } from './features/doctor-registration/DoctorRegisterWizard';
import { DoctorLoginPage } from './features/doctor-auth/DoctorLoginPage';
import { DoctorDashboard } from './features/doctor-dashboard/DoctorDashboard';
import { DoctorSettingsPage } from './features/doctor-settings/DoctorSettingsPage';
import { NotFoundPage } from './features/not-found/NotFoundPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        {/* Public Landing Page */}
        <Route index element={<LandingPage />} />

        {/* Patient Doctor Discovery & Public Profile */}
        <Route path="doctors" element={<DoctorDiscoveryPage />} />
        <Route path="doctors/:doctorId" element={<PublicDoctorProfilePage />} />

        {/* Doctor Portal Routes */}
        <Route path="doctor/register" element={<DoctorRegisterWizard />} />
        <Route path="doctor/login" element={<DoctorLoginPage />} />
        <Route
          path="doctor/dashboard"
          element={
            <ProtectedRoute>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="doctor/settings"
          element={
            <ProtectedRoute>
              <DoctorSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
