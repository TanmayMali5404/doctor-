'use client';

import React from 'react';
import { LoginView } from '../../src/views/LoginView';

export default function LoginPage() {
  const handleSuccess = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  return <LoginView onLoginSuccess={handleSuccess} />;
}
