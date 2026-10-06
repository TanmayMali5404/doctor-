'use client';

import React from 'react';
import { PatientDashboard } from '../../../src/views/dashboards/PatientDashboard';

export default function PatientPage() {
  const handleNavigate = (viewId: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/${viewId}`;
    }
  };

  return <PatientDashboard onNavigate={handleNavigate} />;
}
