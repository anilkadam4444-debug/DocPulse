import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './features/landing/LandingPage';
import { DoctorDiscoveryPlaceholder } from './features/discovery/DoctorDiscoveryPlaceholder';
import { DoctorRegisterWizard } from './features/doctor-registration/DoctorRegisterWizard';
import { DoctorLoginPlaceholder } from './features/doctor-auth/DoctorLoginPlaceholder';
import { DoctorDashboardPlaceholder } from './features/doctor-dashboard/DoctorDashboardPlaceholder';
import { NotFoundPage } from './features/not-found/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        {/* Public Landing Page */}
        <Route index element={<LandingPage />} />

        {/* Patient Doctor Discovery */}
        <Route path="doctors" element={<DoctorDiscoveryPlaceholder />} />

        {/* Doctor Portal Routes */}
        <Route path="doctor/register" element={<DoctorRegisterWizard />} />
        <Route path="doctor/login" element={<DoctorLoginPlaceholder />} />
        <Route path="doctor/dashboard" element={<DoctorDashboardPlaceholder />} />

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
