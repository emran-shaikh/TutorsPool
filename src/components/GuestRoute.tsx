import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * GuestRoute - Redirects authenticated users to their dashboard
 * Used for login, signup, and other guest-only pages
 */
const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { user, loading, getDashboardUrl } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, redirect to their dashboard
  if (user) {
    const dashboardUrl = getDashboardUrl();
    return <Navigate to={dashboardUrl} replace />;
  }

  // User is not logged in, show the guest page (login/signup)
  return <>{children}</>;
};

export default GuestRoute;
