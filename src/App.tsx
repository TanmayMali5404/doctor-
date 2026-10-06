import React, { useEffect, useState } from 'react';
import { QueryProvider } from './providers/query-provider';
import { ThemeProvider } from './providers/theme-provider';
import { useAuthStore } from './lib/auth';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoginView } from './views/LoginView';
import { AdminDashboard } from './views/dashboards/AdminDashboard';
import { ClinicDashboard } from './views/dashboards/ClinicDashboard';
import { DoctorDashboard } from './views/dashboards/DoctorDashboard';
import { PatientDashboard } from './views/dashboards/PatientDashboard';
import { UnifiedDashboardHero } from './components/dashboard/UnifiedDashboardHero';

import { ClinicsView } from './views/modules/ClinicsView';
import { DoctorsView } from './views/modules/DoctorsView';
import { SpecializationsView } from './views/modules/SpecializationsView';
import { StaffView } from './views/modules/StaffView';
import { PatientsView } from './views/modules/PatientsView';
import { SchedulesView } from './views/modules/SchedulesView';
import { AvailabilityView } from './views/modules/AvailabilityView';
import { AppointmentsView } from './views/modules/AppointmentsView';
import { MedicalRecordsView } from './views/modules/MedicalRecordsView';
import { PrescriptionsView } from './views/modules/PrescriptionsView';
import { ReviewsView } from './views/modules/ReviewsView';
import { NotificationsView } from './views/modules/NotificationsView';
import { NAV_ITEMS } from './components/layout/Sidebar';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function AppContent() {
  const { isAuthenticated, isLoading, fetchCurrentUser, user } = useAuthStore();
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-zinc-500 tracking-wide uppercase">
          Initializing ChedoCare Platform...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginView onLoginSuccess={() => setCurrentView('dashboard')} />;
  }

  // Determine which page component to display
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <UnifiedDashboardHero />
            {user.role === 'admin' && <AdminDashboard onNavigate={setCurrentView} />}
            {user.role === 'clinic' && <ClinicDashboard onNavigate={setCurrentView} />}
            {user.role === 'doctor' && <DoctorDashboard onNavigate={setCurrentView} />}
            {user.role === 'patient' && <PatientDashboard onNavigate={setCurrentView} />}
            {user.role === 'staff' && <ClinicDashboard onNavigate={setCurrentView} />}
          </div>
        );

      case 'clinics':
        return <ClinicsView />;
      case 'doctors':
        return <DoctorsView />;
      case 'specializations':
        return <SpecializationsView />;
      case 'staff':
        return <StaffView />;
      case 'patients':
        return <PatientsView />;
      case 'schedules':
        return <SchedulesView />;
      case 'availability':
        return <AvailabilityView />;
      case 'appointments':
        return <AppointmentsView />;
      case 'medical-records':
        return <MedicalRecordsView />;
      case 'prescriptions':
        return <PrescriptionsView />;
      case 'reviews':
        return <ReviewsView />;
      case 'notifications':
        return <NotificationsView />;

      default:
        return <AdminDashboard onNavigate={setCurrentView} />;
    }
  };

  const navItem = NAV_ITEMS.find((item) => item.id === currentView);
  const currentTitle = navItem?.label || 'Overview';

  return (
    <DashboardLayout
      currentView={currentView}
      onNavigate={setCurrentView}
      title={currentTitle}
    >
      <ErrorBoundary key={currentView} fallbackTitle={`Error rendering ${currentTitle}`}>
        {renderCurrentView()}
      </ErrorBoundary>
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </QueryProvider>
  );
}
