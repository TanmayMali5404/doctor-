'use client';

import React from 'react';
import { AdminDashboard } from '../../../src/views/dashboards/AdminDashboard';

export default function AdminPage() {
  const handleNavigate = (viewId: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/${viewId}`;
    }
  };

  return <AdminDashboard onNavigate={handleNavigate} />;
}
