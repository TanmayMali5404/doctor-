'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '../../src/lib/auth';
import { DashboardLayout } from '../../src/components/layout/DashboardLayout';

export default function AppDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated) {
      // guard route
    }
  }, [isAuthenticated]);

  const handleNavigate = (viewId: string) => {
    if (typeof window !== 'undefined') {
      if (viewId === 'dashboard') {
        window.location.href = '/dashboard';
      } else {
        window.location.href = `/${viewId}`;
      }
    }
  };

  return (
    <DashboardLayout
      currentView="dashboard"
      onNavigate={handleNavigate}
      title="ChedoCare Health"
    >
      {children}
    </DashboardLayout>
  );
}
