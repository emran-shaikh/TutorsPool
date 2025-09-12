import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import TutorProfile from '@/pages/TutorProfile'

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

describe('Reviews & Ratings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    
    // Mock student user
    localStorage.setItem('token', 'student-token')
    localStorage.setItem('user', JSON.stringify({
      id: 'student-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'STUDENT'
    }))
  })

  describe('TC-022: Student submits review after completed class', () => {
    it('should submit review with PENDING status after completed class', async () => {
      const user = userEvent.setup()
      
      // Mock successful review submission
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          review: {
            id: 'review-1',
            tutorId: 'tutor-1',
            studentId: 'student-1',
            rating: 5,
            comment: 'Excellent tutor!',
            status: 'PENDING',
            createdAt: '2025-09-08T10:00:00Z'
          }
        })
      })

      render(
        <TestWrapper>
          <TutorProfile />
        </TestWrapper>
      )

      // Should show review form for completed bookings
      await waitFor(() => {
        expect(screen.getByText(/write a review/i)).toBeInTheDocument()
      })

      // Fill review form
      const ratingInput = screen.getByLabelText(/rating/i)
      const commentInput = screen.getByLabelText(/comment/i)

      await user.type(ratingInput, '5')
      await user.type(commentInput, 'Excellent tutor!')

      // Submit review
      const submitButton = screen.getByRole('button', { name: /submit review/i })
      await user.click(submitButton)

      // Should show pending status
      await waitFor(() => {
        expect(screen.getByText(/review submitted/i)).toBeInTheDocument()
        expect(screen.getByText(/pending approval/i)).toBeInTheDocument()
      })
    })
  })

  describe('TC-023: Admin approves review', () => {
    it('should make review visible on tutor profile after admin approval', async () => {
      // Mock tutor profile with approved reviews
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tutor: {
            id: 'tutor-1',
            userId: 'user-1',
            headline: 'Math Expert',
            bio: 'Experienced math tutor',
            hourlyRateCents: 2500,
            currency: 'USD',
            subjects: ['Mathematics'],
            ratingAvg: 4.8,
            ratingCount: 24,
            user: { name: 'Jane Smith' }
          },
          reviews: [
            {
              id: 'review-1',
              tutorId: 'tutor-1',
              studentId: 'student-1',
              studentName: 'John Doe',
              rating: 5,
              comment: 'Excellent tutor!',
              status: 'APPROVED',
              createdAt: '2025-09-08T10:00:00Z'
            }
          ]
        })
      })

      render(
        <TestWrapper>
          <TutorProfile />
        </TestWrapper>
      )

      // Should display approved review
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Excellent tutor!')).toBeInTheDocument()
        expect(screen.getByText('5 stars')).toBeInTheDocument()
      })
    })
  })

  describe('TC-024: Student tries to review without booking', () => {
    it('should block review submission if student has no completed booking', async () => {
      const user = userEvent.setup()
      
      // Mock tutor profile without completed bookings
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tutor: {
            id: 'tutor-1',
            userId: 'user-1',
            headline: 'Math Expert',
            bio: 'Experienced math tutor',
            hourlyRateCents: 2500,
            currency: 'USD',
            subjects: ['Mathematics'],
            ratingAvg: 4.8,
            ratingCount: 24,
            user: { name: 'Jane Smith' }
          },
          reviews: [],
          completedBookings: [] // No completed bookings
        })
      })

      render(
        <TestWrapper>
          <TutorProfile />
        </TestWrapper>
      )

      // Should not show review form
      await waitFor(() => {
        expect(screen.queryByText(/write a review/i)).not.toBeInTheDocument()
      })

      // Should show message about needing completed booking
      expect(screen.getByText(/book a session to leave a review/i)).toBeInTheDocument()
    })
  })

  describe('TC-039: Tutor cannot approve own reviews', () => {
    it('should prevent tutors from approving their own reviews', async () => {
      // Mock tutor user trying to access admin functions
      localStorage.setItem('token', 'tutor-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'tutor-1',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'TUTOR'
      }))

      // Mock unauthorized response
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          error: 'Cannot approve own reviews'
        })
      })

      render(
        <TestWrapper>
          <TutorProfile />
        </TestWrapper>
      )

      // Should not show approve button for own reviews
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /approve review/i })).not.toBeInTheDocument()
      })
    })
  })
})
