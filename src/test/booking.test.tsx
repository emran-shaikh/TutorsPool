import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import Booking from '@/pages/Booking'
import Search from '@/pages/Search'

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

describe('Booking & Scheduling', () => {
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

  describe('TC-014: Student books available slot', () => {
    it('should confirm booking when student books available slot', async () => {
      const user = userEvent.setup()
      
      // Mock successful booking API response
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            tutors: [
              {
                id: 'tutor-1',
                userId: 'user-1',
                headline: 'Math Tutor',
                bio: 'Experienced math tutor',
                hourlyRateCents: 2500,
                currency: 'USD',
                subjects: ['Mathematics'],
                ratingAvg: 4.8,
                ratingCount: 24,
                user: { name: 'Jane Smith' }
              }
            ]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            booking: {
              id: 'booking-1',
              studentId: 'student-1',
              tutorId: 'tutor-1',
              subjectId: 'mathematics',
              startAtUTC: '2025-09-09T10:00:00Z',
              endAtUTC: '2025-09-09T11:00:00Z',
              status: 'CONFIRMED',
              priceCents: 2500,
              currency: 'USD'
            }
          })
        })

      render(
        <TestWrapper>
          <Booking />
        </TestWrapper>
      )

      // Should display booking form
      await waitFor(() => {
        expect(screen.getByText(/book a session/i)).toBeInTheDocument()
      })

      // Fill booking form
      const subjectSelect = screen.getByLabelText(/subject/i)
      const dateInput = screen.getByLabelText(/date/i)
      const timeInput = screen.getByLabelText(/time/i)

      await user.selectOptions(subjectSelect, 'mathematics')
      await user.type(dateInput, '2025-09-09')
      await user.type(timeInput, '10:00')

      // Submit booking
      const submitButton = screen.getByRole('button', { name: /book session/i })
      await user.click(submitButton)

      // Should show confirmation
      await waitFor(() => {
        expect(screen.getByText(/booking confirmed/i)).toBeInTheDocument()
      })
    })
  })

  describe('TC-015: Booking conflict prevention', () => {
    it('should prevent booking when slot is already taken', async () => {
      const user = userEvent.setup()
      
      // Mock conflict API response
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          error: 'Time slot is already booked'
        })
      })

      render(
        <TestWrapper>
          <Booking />
        </TestWrapper>
      )

      // Fill booking form with conflicting time
      const subjectSelect = screen.getByLabelText(/subject/i)
      const dateInput = screen.getByLabelText(/date/i)
      const timeInput = screen.getByLabelText(/time/i)

      await user.selectOptions(subjectSelect, 'mathematics')
      await user.type(dateInput, '2025-09-09')
      await user.type(timeInput, '10:00')

      // Submit booking
      const submitButton = screen.getByRole('button', { name: /book session/i })
      await user.click(submitButton)

      // Should show conflict error
      await waitFor(() => {
        expect(screen.getByText(/time slot is already booked/i)).toBeInTheDocument()
      })
    })
  })

  describe('TC-016: Cancel booking before start', () => {
    it('should trigger refund flow when booking is cancelled before start', async () => {
      const user = userEvent.setup()
      
      // Mock successful cancellation with refund
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Booking cancelled and refund processed',
          refund: {
            amount: 2500,
            currency: 'USD',
            status: 'PROCESSED'
          }
        })
      })

      render(
        <TestWrapper>
          <Booking />
        </TestWrapper>
      )

      // Should show cancel button for upcoming bookings
      const cancelButton = screen.getByRole('button', { name: /cancel booking/i })
      await user.click(cancelButton)

      // Should show refund confirmation
      await waitFor(() => {
        expect(screen.getByText(/refund processed/i)).toBeInTheDocument()
      })
    })
  })

  describe('TC-017: ICS calendar download', () => {
    it('should provide working ICS calendar download link', async () => {
      const user = userEvent.setup()
      
      // Mock successful booking
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          booking: {
            id: 'booking-1',
            startAtUTC: '2025-09-09T10:00:00Z',
            endAtUTC: '2025-09-09T11:00:00Z',
            subjectId: 'mathematics',
            tutor: { user: { name: 'Jane Smith' } }
          },
          icsUrl: 'data:text/calendar;charset=utf8,BEGIN:VCALENDAR...'
        })
      })

      render(
        <TestWrapper>
          <Booking />
        </TestWrapper>
      )

      // Submit booking
      const submitButton = screen.getByRole('button', { name: /book session/i })
      await user.click(submitButton)

      // Should show calendar download link
      await waitFor(() => {
        const calendarLink = screen.getByText(/add to calendar/i)
        expect(calendarLink).toBeInTheDocument()
        expect(calendarLink.closest('a')).toHaveAttribute('href', expect.stringContaining('data:text/calendar'))
      })
    })
  })
})
