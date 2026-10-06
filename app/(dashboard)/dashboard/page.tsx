'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../../../src/lib/auth';

export default function DashboardRedirectPage() {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!isAuthenticated || !user) {
        window.location.href = '/login';
        return;
      }

      switch (user.role) {
        case 'admin':
          window.location.href = '/admin';
          break;
        case 'clinic':
          window.location.href = '/clinic';
          break;
        case 'doctor':
          window.location.href = '/doctor';
          break;
        case 'patient':
          window.location.href = '/patient';
          break;
        default:
          window.location.href = '/clinic';
      }
    }
  }, [user, isAuthenticated]);

  return (
    <div className="p-8 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
