import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import Login from '@/pages/Login'
import SignUp from '@/pages/SignUp'
import NotFound from '@/pages/NotFound'

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

describe('Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Login Page', () => {
    it('should render login form', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('should show sign up link', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      expect(screen.getByRole('link', { name: /create account/i })).toBeInTheDocument()
    })
  })

  describe('Sign Up Page', () => {
    it('should render sign up form with tabs', () => {
      render(
        <TestWrapper>
          <SignUp />
        </TestWrapper>
      )

      expect(screen.getByText('Create Your Account')).toBeInTheDocument()
      expect(screen.getByText("I'm a Student")).toBeInTheDocument()
      expect(screen.getByText("I'm a Tutor")).toBeInTheDocument()
      expect(screen.getByText("I'm an Admin")).toBeInTheDocument()
    })

    it('should show student registration form by default', () => {
      render(
        <TestWrapper>
          <SignUp />
        </TestWrapper>
      )

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    })
  })

  describe('404 Page', () => {
    it('should render 404 page', () => {
      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      )

      expect(screen.getByText('404')).toBeInTheDocument()
      expect(screen.getByText(/page not found/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /return to home/i })).toBeInTheDocument()
    })
  })
})
