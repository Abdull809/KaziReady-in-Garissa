import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/authentication/AuthContext';
import { UserRole } from '@/src/types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F8FA]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0F9D83] border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-slate-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallbackRoute =
      user.role === 'admin'
        ? '/dashboard/admin'
        : user.role === 'employer'
        ? '/dashboard/employer'
        : '/dashboard/applicant';
    return <Navigate to={fallbackRoute} replace />;
  }

  return <>{children}</>;
}
