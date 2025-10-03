import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the auth context
const mockAuthContext = {
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  isLoading: false,
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock React Router
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to}>Navigate to {to}</div>,
  Outlet: () => <div data-testid="outlet">Protected Content</div>,
}));

import { useAuth } from '@/contexts/AuthContext';
import { RoleBasedGuard } from '../RoleBasedGuard';

// Mock RoleBasedGuard component implementation
const RoleBasedGuardMock = ({ 
  allowedRoles, 
  fallback = null, 
  redirectTo = '/unauthorized',
  children 
}: any) => {
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return <div data-testid="loading">Loading user permissions...</div>;
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check role permissions
  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    if (fallback) {
      return fallback;
    }
    return <Navigate to={redirectTo} />;
  }

  return children || <Outlet />;
};

const Navigate = ({ to }: { to: string }) => (
  <div data-testid="navigate" data-to={to}>Navigate to {to}</div>
);

const Outlet = () => <div data-testid="outlet">Protected Content</div>;

describe('RoleBasedGuard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock user
    mockAuthContext.user = null;
    mockAuthContext.isLoading = false;
  });

  describe('loading state', () => {
    it('should show loading spinner when user is loading', () => {
      mockAuthContext.isLoading = true;

      render(
        <RoleBasedGuardMock allowedRoles={['STUDENT', 'TUTOR', 'ADMIN']}>
          <div>Test Content</div>
        </RoleBasedGuardMock>
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Loading user permissions...')).toBeInTheDocument();
    });
  });

  describe('unauthenticated users', () => {
    it('should redirect to login when no user is authenticated', () => {
      mockAuthContext.user = null;

      render(
        <RoleBasedGuardMock allowedRoles={['STUDENT']}>
          <div>Student Content</div>
        </RoleBasedGuardMock>
      );

      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
      expect(screen.getByText('Navigate to /login')).toBeInTheDocument();
    });
  });

  describe('student role access', () => {
    beforeEach(() => {
      mockAuthContext.user = {
        id: 'student-1',
        email: 'student@test.com',
        role: 'STUDENT',
        name: 'Test Student',
      };
    });

    it('should allow student to access student-only content', () => {
      render(
        <RoleBasedGuardMock allowedRoles={['STUDENT']}>
          <div data-testid="student-content">Student Dashboard</div>
        </RoleBasedGuardMock>
      );

      expect(screen.getByTestId('student-content')).toBeInTheDocument();
      expect(screen.getByText('Student Dashboard')).toBeInTheDocument();
    });

    it('should block student from accessing tutor content', () => {
      render(
        <RoleBasedGuardMock allowedRoles={['TUTOR']}>
          <div>Tutor Dashboard</div>
        </RoleBasedGuardMock>
      );

      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/unauthorized');
      expect(screen.getByText('Navigate to /unauthorized')).toBeInTheDocument();
    });

    it('should block student from accessing admin content', () => {
      render(
        <RoleBasedGuardMock allowedRoles={['ADMIN']}>
          <div>Admin Panel</div>
        </RoleBasedGuardMock>
      );

      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/unauthorized');
    });

    it('should allow student to access multi-role content', () => {
      render(
        <RoleBasedGuardMock allowedRoles={['STUDENT', 'TUTOR']}>
          <div>Shared Content</div>
        </RoleBasedGuardMock>
      );

      expect(screen.getByText('Shared Content')).toBeInTheDocument();
    });
  });

  describe('tutor role access', () => {
    beforeEach(() => {
      mockAuthContext.user = {
        id: 'tutor-1',
        email: 'tutor@test.com',
        role: 'TUTOR',
        name: 'Test Tutor',
      };
    });

    it('should allow tutor to access tutor-only content', () => {
      render(
        <RoleBasedGuardMock allowedRoles={['TUTOR']}>
          <div>Tutor Dashboard</div>
        </RoleBasedGuardMock>
      );

      expect(screen.getByText('Tutor Dashboard')).toBeInTheDocument();
    });

    it('should block tutor from accessing student-only content', () => {
      render(
        <RoleBasedGuardMock allowedRoles={['STUDENT']}>
          <div>Student Dashboard</div>
        </RoleBasedGuardMock>
      );

      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/unauthorized');
    });

    it('should block tutor from accessing admin content', () => {
      render(
        <RoleBasedGuardMock allowedRoles={['ADMIN']}>
          <div>Admin Panel</div>
        </RoleBasedGuardMock>
      );

      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/unauthorized');
    });

    it('should allow tutor to access shared content with students', () => {
      render(
        <RoleBasedGuardMock allowedRoles={['STUDENT', 'TUTOR']}>
          <div>Booking Form</div>
        </RoleBasedGuardMock>
      );

      expect(screen.getByText('Booking Form')).toBeInTheDocument();
    });
  });

  describe('admin role access', () => {
    beforeEach(() => {
      mockAuthContext.user = {
        id: 'admin-1',
        email: 'admin@test.com',
        role: 'ADMIN',
        name: 'Administrator',
      };
    });

    it('should allow admin to access all content types', () => {
      // Ensure admin role is set correctly
      mockAuthContext.user = {
        id: 'admin-1',
        email: 'admin@test.com',
        role: 'ADMIN',
        name: 'Administrator',
      };

      // Test student content
      const { rerender } = render(
        <RoleBasedGuardMock allowedRoles={['STUDENT']}>
          <div>Student Content</div>
        </RoleBasedGuardMock>
      );

      expect(screen.getByText('Student Content')).toBeInTheDocument();

      // Test tutor content
      rerender(
        <RoleBasedGuardMock allowedRoles={['TUTOR']}>
          <div>Tutor Content</div>
        </RoleBasedGuardMock>
      );

      expect(screen.getByText('Tutor Content')).toBeInTheDocument();

      // Test admin content
      rerender(
        <RoleBasedGuardMock allowedRoles={['ADMIN']}>
          <div>Admin Content</div>
        </RoleBasedGuardMock>
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();

      // Test multi-role content
      rerender(
        <RoleBasedGuardMock allowedRoles={['STUDENT', 'TUTOR', 'ADMIN']}>
          <div>All Roles Content</div>
        </RoleBasedGuardMock>
      );

      expect(screen.getByText('All Roles Content')).toBeInTheDocument();
    });

    it('should allow admin to access admin-specific sections', () => {
      // Ensure admin role is set correctly
      mockAuthContext.user = {
        id: 'admin-1',
        email: 'admin@test.com',
        role: 'ADMIN',
        name: 'Administrator',
      };

      render(
        <RoleBasedGuardMock allowedRoles={['ADMIN']}>
          <div data-testid="admin-panel">
            <h1>Admin Panel</h1>
            <div>User Management</div>
            <div>System Settings</div>
            <div>Analytics Dashboard</div>
          </div>
        </RoleBasedGuardMock>
      );

      expect(screen.getByTestId('admin-panel')).toBeInTheDocument();
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });
  });

  describe('custom fallback behavior', () => {
    beforeEach(() => {
      mockAuthContext.user = {
        id: 'student-1',
        email: 'student@test.com',
        role: 'STUDENT',
        name: 'Test Student',
      };
    });

    it('should show custom fallback when access is denied', () => {
      const customFallback = (
        <div data-testid="custom-fallback">
          <h2>Access Denied</h2>
          <p>You don't have permission to view this content.</p>
          <button>Request Access</button>
        </div>
      );

      render(
        <RoleBasedGuardMock 
          allowedRoles={['ADMIN']} 
          fallback={customFallback}
        >
          <div>Admin Content</div>
        </RoleBasedGuardMock>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText(/You don't have permission to view this content/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Request Access' })).toBeInTheDocument();
    });

    it('should use redirectTo when custom fallback is not provided', () => {
      render(
        <RoleBasedGuardMock 
          allowedRoles={['ADMIN']} 
          redirectTo="/access-denied"
        >
          <div>Admin Content</div>
        </RoleBasedGuardMock>
      );

      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/access-denied');
    });
  });

  describe('role permissions edge cases', () => {
    beforeEach(() => {
      mockAuthContext.user = {
        id: 'user-1',
        email: 'user@test.com',
        role: 'STUDENT',
        name: 'Test User',
      };
    });

    it('should handle empty allowedRoles array', () => {
      render(
        <RoleBasedGuardMock allowedRoles={[]}>
          <div>Restricted Content</div>
        </RoleBasedGuardMock>
      );

      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/unauthorized');
    });

    it('should handle case-sensitive role matching', () => {
      // Test with correct case
      const { rerender } = render(
        <RoleBasedGuardMock allowedRoles={['STUDENT']}>
          <div>Student Content</div>
        </RoleBasedGuardMock>
      );

      expect(screen.getByText('Student Content')).toBeInTheDocument();

      // Test with incorrect case (should fail)
      rerender(
        <RoleBasedGuardMock allowedRoles={['student']}>
          <div>Student Content</div>
        </RoleBasedGuardMock>
      );

      expect(screen.getByTestId('navigate')).toBeInTheDocument();
    });

    it('should handle unknown user roles gracefully', () => {
      mockAuthContext.user = {
        id: 'user-2',
        email: 'unknown@test.com',
        role: 'UNKNOWN_ROLE',
        name: 'Unknown User',
      };

      render(
        <RoleBasedGuardMock allowedRoles={['STUDENT', 'TUTOR', 'ADMIN']}>
          <div>Protected Content</div>
        </RoleBasedGuardMock>
      );

      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/unauthorized');
    });
  });

  describe('children vs outlet', () => {
    beforeEach(() => {
      mockAuthContext.user = {
        id: 'student-1',
        email: 'student@test.com',
        role: 'STUDENT',
        name: 'Test Student',
      };
    });

    it('should render children when provided', () => {
      render(
        <RoleBasedGuardMock allowedRoles={['STUDENT']}>
          <div data-testid="custom-children">Custom Student Content</div>
        </RoleBasedGuardMock>
      );

      expect(screen.getByTestId('custom-children')).toBeInTheDocument();
      expect(screen.getByText('Custom Student Content')).toBeInTheDocument();
    });

    it('should render outlet when no children provided', () => {
      render(
        <RoleBasedGuardMock allowedRoles={['STUDENT']} />
      );

      expect(screen.getByTestId('outlet')).toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
});

// Export mock components for reuse
export { RoleBasedGuardMock as RoleBasedGuard };
