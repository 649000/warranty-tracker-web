// Provider component to wrap the application with auth context
'use client';

import React from 'react';
import { AuthProvider } from '@/providers/auth/auth.context';

export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
