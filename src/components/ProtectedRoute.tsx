
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useOptimizedCourse } from '@/contexts/OptimizedCourseContext';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, isAuthenticated, isLoading } = useOptimizedCourse();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && (!profile || !profile.is_admin)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
