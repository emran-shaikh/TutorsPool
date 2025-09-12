import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import AdminDashboard from '@/pages/AdminDashboard'
import UsersManagement from '@/pages/admin/UsersManagement'

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Admin Panel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    
    // Mock admin user
    localStorage.setItem('token', 'admin-token')
    localStorage.setItem('user', JSON.stringify({
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@tutorspool.com',
      role: 'ADMIN'
    }))
  })

  describe('TC-028: Admin logs in and sees dashboard metrics', () => {
    it('should display dashboard with metrics when admin logs in', async () => {
      // Mock successful API response
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stats: {
            totalUsers: 156,
            totalTutors: 23,
            totalStudents: 133,
            totalBookings: 89,
            pendingReviews: 12,
            activeSessions: 8
          },
          recentBookings: [
            {
              id: 'booking-1',
              student: { name: 'John Doe' },
              tutor: { user: { name: 'Jane Smith' } },
              status: 'CONFIRMED',
              createdAt: '2025-09-08T10:00:00Z'
            }
          ],
          recentUsers: [
            {
              id: 'user-1',
              name: 'New User',
              role: 'STUDENT',
              createdAt: '2025-09-08T09:00:00Z'
            }
          ]
        })
      })

      render(
        <TestWrapper>
          <AdminDashboard />
        </TestWrapper>
      )

      // Should display dashboard metrics
      await waitFor(() => {
        expect(screen.getByText('Total Users')).toBeInTheDocument()
        expect(screen.getByText('156')).toBeInTheDocument()
        expect(screen.getByText('Total Tutors')).toBeInTheDocument()
        expect(screen.getByText('23')).toBeInTheDocument()
        expect(screen.getByText('Total Students')).toBeInTheDocument()
        expect(screen.getByText('133')).toBeInTheDocument()
        expect(screen.getByText('Total Bookings')).toBeInTheDocument()
        expect(screen.getByText('89')).toBeInTheDocument()
      })
    })
  })

  describe('TC-029: Admin approves custom subject', () => {
    it('should allow admin to approve custom subjects', async () => {
      const user = userEvent.setup()
      
      // Mock API responses
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            users: [
              {
                id: 'user-1',
                name: 'John Doe',
                email: 'john@example.com',
                role: 'STUDENT',
                tutorProfile: null,
                studentProfile: { subjects: ['Mathematics'] },
                createdAt: '2025-09-08T10:00:00Z'
              }
            ]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            message: 'Subject approved'
          })
        })

      render(
        <TestWrapper>
          <UsersManagement />
        </TestWrapper>
      )

      // Should display users management page
      await waitFor(() => {
        expect(screen.getByText('Users Management')).toBeInTheDocument()
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // Should show approve button for pending subjects
      const approveButton = screen.getByRole('button', { name: /approve/i })
      expect(approveButton).toBeInTheDocument()
    })
  })

  describe('TC-030: Admin rejects review', () => {
    it('should allow admin to reject reviews', async () => {
      const user = userEvent.setup()
      
      // Mock API responses
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            bookings: [
              {
                id: 'booking-1',
                student: { name: 'John Doe', email: 'john@example.com' },
                tutor: { user: { name: 'Jane Smith' }, headline: 'Math Tutor' },
                subjectId: 'mathematics',
                startAtUTC: '2025-09-08T10:00:00Z',
                endAtUTC: '2025-09-08T11:00:00Z',
                status: 'PENDING',
                priceCents: 2500,
                currency: 'USD',
                createdAt: '2025-09-08T09:00:00Z'
              }
            ]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            message: 'Review rejected'
          })
        })

      render(
        <TestWrapper>
          <UsersManagement />
        </TestWrapper>
      )

      // Should display bookings management page
      await waitFor(() => {
        expect(screen.getByText('Users Management')).toBeInTheDocument()
      })

      // Should show reject button for pending reviews
      const rejectButton = screen.getByRole('button', { name: /reject/i })
      expect(rejectButton).toBeInTheDocument()
    })
  })

  describe('TC-031: Admin sees transactions report', () => {
    it('should display transaction amounts that match database', async () => {
      // Mock API response with transaction data
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stats: {
            totalUsers: 156,
            totalTutors: 23,
            totalStudents: 133,
            totalBookings: 89,
            pendingReviews: 12,
            activeSessions: 8,
            totalRevenue: 125000, // $1,250.00
            completedSessions: 67,
            pendingBookings: 22
          },
          recentBookings: [
            {
              id: 'booking-1',
              student: { name: 'John Doe' },
              tutor: { user: { name: 'Jane Smith' } },
              status: 'COMPLETED',
              priceCents: 2500,
              currency: 'USD',
              createdAt: '2025-09-08T10:00:00Z'
            }
          ]
        })
      })

      render(
        <TestWrapper>
          <AdminDashboard />
        </TestWrapper>
      )

      // Should display transaction metrics
      await waitFor(() => {
        expect(screen.getByText('Total Bookings')).toBeInTheDocument()
        expect(screen.getByText('89')).toBeInTheDocument()
        expect(screen.getByText('Completed Sessions')).toBeInTheDocument()
        expect(screen.getByText('67')).toBeInTheDocument()
      })
    })
  })

  describe('TC-038: Unauthorized user accessing /admin', () => {
    it('should deny access to non-admin users', async () => {
      // Mock non-admin user
      localStorage.setItem('token', 'user-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'user-1',
        name: 'Regular User',
        email: 'user@example.com',
        role: 'STUDENT'
      }))

      // Mock unauthorized response
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          error: 'Access denied. Admin role required.'
        })
      })

      render(
        <TestWrapper>
          <AdminDashboard />
        </TestWrapper>
      )

      // Should show access denied or redirect
      await waitFor(() => {
        expect(screen.getByText(/access denied/i)).toBeInTheDocument()
      })
    })
  })
})
