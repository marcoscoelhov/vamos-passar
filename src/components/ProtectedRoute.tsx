
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCourse } from '@/contexts/CourseContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useCourse();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && (!user || !user.isAdmin)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
