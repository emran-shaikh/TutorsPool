import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
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

describe('Subjects & Search', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('TC-011: Filter tutors by subject (Math)', () => {
    it('should show only Math tutors when filtering by Mathematics subject', async () => {
      const user = userEvent.setup()
      
      // Mock API response with filtered results
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tutors: [
            {
              id: 'tutor-1',
              userId: 'user-1',
              headline: 'Math Expert',
              bio: 'Specialized in Mathematics',
              hourlyRateCents: 2500,
              currency: 'USD',
              subjects: ['Mathematics'],
              ratingAvg: 4.8,
              ratingCount: 24,
              user: { name: 'Jane Smith' }
            },
            {
              id: 'tutor-2',
              userId: 'user-2',
              headline: 'Advanced Math Tutor',
              bio: 'Mathematics and Statistics',
              hourlyRateCents: 3000,
              currency: 'USD',
              subjects: ['Mathematics', 'Statistics'],
              ratingAvg: 4.9,
              ratingCount: 18,
              user: { name: 'John Doe' }
            }
          ],
          total: 2,
          page: 1,
          limit: 10
        })
      })

      render(
        <TestWrapper>
          <Search />
        </TestWrapper>
      )

      // Select Mathematics subject filter
      const subjectFilter = screen.getByLabelText(/subject/i)
      await user.selectOptions(subjectFilter, 'Mathematics')

      // Trigger search
      const searchButton = screen.getByRole('button', { name: /search/i })
      await user.click(searchButton)

      // Should show only Math tutors
      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Math Expert')).toBeInTheDocument()
        expect(screen.getByText('Advanced Math Tutor')).toBeInTheDocument()
      })

      // Should not show non-Math tutors
      expect(screen.queryByText('Physics Tutor')).not.toBeInTheDocument()
    })
  })

  describe('TC-012: Filter tutors by price range', () => {
    it('should show tutors within specified price range', async () => {
      const user = userEvent.setup()
      
      // Mock API response with price-filtered results
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tutors: [
            {
              id: 'tutor-1',
              userId: 'user-1',
              headline: 'Affordable Math Tutor',
              bio: 'Budget-friendly math tutoring',
              hourlyRateCents: 2000, // $20/hour
              currency: 'USD',
              subjects: ['Mathematics'],
              ratingAvg: 4.5,
              ratingCount: 15,
              user: { name: 'Jane Smith' }
            },
            {
              id: 'tutor-2',
              userId: 'user-2',
              headline: 'Mid-range Math Tutor',
              bio: 'Quality math tutoring',
              hourlyRateCents: 2500, // $25/hour
              currency: 'USD',
              subjects: ['Mathematics'],
              ratingAvg: 4.7,
              ratingCount: 20,
              user: { name: 'John Doe' }
            }
          ],
          total: 2,
          page: 1,
          limit: 10
        })
      })

      render(
        <TestWrapper>
          <Search />
        </TestWrapper>
      )

      // Set price range filter ($20-$30)
      const minPriceInput = screen.getByLabelText(/min price/i)
      const maxPriceInput = screen.getByLabelText(/max price/i)
      
      await user.type(minPriceInput, '20')
      await user.type(maxPriceInput, '30')

      // Trigger search
      const searchButton = screen.getByRole('button', { name: /search/i })
      await user.click(searchButton)

      // Should show tutors within price range
      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('$20.00/hour')).toBeInTheDocument()
        expect(screen.getByText('$25.00/hour')).toBeInTheDocument()
      })

      // Should not show tutors outside price range
      expect(screen.queryByText('$50.00/hour')).not.toBeInTheDocument()
    })
  })

  describe('TC-013: Add custom subject request', () => {
    it('should allow adding custom subject requests that appear in admin panel', async () => {
      const user = userEvent.setup()
      
      // Mock successful custom subject request
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Custom subject request submitted',
          request: {
            id: 'request-1',
            subject: 'Advanced Quantum Physics',
            description: 'Need tutor for quantum mechanics',
            studentId: 'student-1',
            status: 'PENDING',
            createdAt: '2025-09-08T10:00:00Z'
          }
        })
      })

      render(
        <TestWrapper>
          <Search />
        </TestWrapper>
      )

      // Click on "Request Custom Subject" button
      const customSubjectButton = screen.getByRole('button', { name: /request custom subject/i })
      await user.click(customSubjectButton)

      // Fill custom subject form
      const subjectInput = screen.getByLabelText(/subject name/i)
      const descriptionInput = screen.getByLabelText(/description/i)

      await user.type(subjectInput, 'Advanced Quantum Physics')
      await user.type(descriptionInput, 'Need tutor for quantum mechanics')

      // Submit request
      const submitButton = screen.getByRole('button', { name: /submit request/i })
      await user.click(submitButton)

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/custom subject request submitted/i)).toBeInTheDocument()
      })

      // Should appear in admin panel (mocked)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/subjects/custom'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Advanced Quantum Physics')
        })
      )
    })
  })
})
