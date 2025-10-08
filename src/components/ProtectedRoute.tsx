import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user, loading, getDashboardUrl } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Check role-based access
  if (roles && roles.length > 0) {
    if (!roles.includes(user.role)) {
      // Redirect to appropriate dashboard based on user role
      const dashboardUrl = getDashboardUrl();
      return <Navigate to={dashboardUrl} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;


