'use client';

import React from 'react';
import { DoctorDashboard } from '../../../src/views/dashboards/DoctorDashboard';

export default function DoctorPage() {
  const handleNavigate = (viewId: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/${viewId}`;
    }
  };

  return <DoctorDashboard onNavigate={handleNavigate} />;
}
