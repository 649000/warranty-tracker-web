// Component to protect routes that require authentication
// Currently unused - will be implemented later
'use client';

import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // For now, just render children without protection
  return <>{children}</>;
}
