'use client';

import React from 'react';
import { ClinicDashboard } from '../../../src/views/dashboards/ClinicDashboard';

export default function ClinicPage() {
  const handleNavigate = (viewId: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/${viewId}`;
    }
  };

  return <ClinicDashboard onNavigate={handleNavigate} />;
}
