import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { apiClient, User } from '@/lib/api'
import { errorLogger } from '@/lib/errorLogger'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password?: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  register: (userData: RegisterData) => Promise<{ error?: string }>
  sendOTP: (email: string) => Promise<{ error?: string }>
  verifyOTP: (email: string, otp: string) => Promise<{ error?: string }>
  updateProfile: (data: Partial<User>) => Promise<void>
  updatePassword: (password: string) => Promise<{ error?: string }>
  hasRole: (role: 'STUDENT' | 'TUTOR' | 'ADMIN') => boolean
  getDashboardUrl: () => string
  // Additional methods for compatibility
  signIn: (email: string, password?: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<{ error?: string }>
  resendEmailConfirmation: (email: string) => Promise<{ error?: string }>
}

interface RegisterData {
  name: string
  email: string
  phone?: string
  country: string
  timezone?: string
  role: 'STUDENT' | 'TUTOR' | 'ADMIN'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Only check auth if we have a token
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping auth check');
        setLoading(false);
        return;
      }

      const userData = await apiClient.getCurrentUser()
      setUser(userData)
      // Set user ID in error logger for session tracking
      errorLogger.setUserId(userData.id)
    } catch (error) {
      console.error('Auth check failed:', error)
      // Clear invalid token
      apiClient.clearToken()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password?: string) => {
    try {
      const result = await apiClient.login(email, password)
      setUser(result.user)
      // Set user ID in error logger for session tracking
      errorLogger.setUserId(result.user.id)
      return { error: undefined }
    } catch (error) {
      console.error('Login error:', error)
      return { error: error instanceof Error ? error.message : 'Login failed' }
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
      setUser(null)
      // Clear user ID from error logger
      errorLogger.setUserId('')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const result = await apiClient.register(userData)
      setUser(result.user)
      return { error: undefined }
    } catch (error) {
      console.error('Registration error:', error)
      return { error: error instanceof Error ? error.message : 'Registration failed' }
    }
  }

  const sendOTP = async (email: string) => {
    try {
      await apiClient.sendOTP(email)
      return { error: undefined }
    } catch (error) {
      console.error('OTP send error:', error)
      return { error: error instanceof Error ? error.message : 'Failed to send OTP' }
    }
  }

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const result = await apiClient.verifyOTP(email, otp)
      setUser(result.user)
      return { error: undefined }
    } catch (error) {
      console.error('OTP verification error:', error)
      return { error: error instanceof Error ? error.message : 'OTP verification failed' }
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      // For now, just update local state
      // In a real app, you'd make an API call to update the profile
      setUser(prev => prev ? { ...prev, ...data } : null)
    } catch (error) {
      console.error('Profile update error:', error)
      throw error
    }
  }

  const updatePassword = async (password: string) => {
    try {
      // For now, just simulate a successful password update
      // In a real app, you'd make an API call to update the password
      console.log('Password update requested for user:', user?.email)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return { error: undefined }
    } catch (error) {
      console.error('Password update error:', error)
      return { error: 'Failed to update password. Please try again.' }
    }
  }

  // Additional methods for compatibility
  const signIn = async (email: string, password?: string) => {
    return login(email, password)
  }

  const signOut = async () => {
    return logout()
  }

  const sendPasswordReset = async (email: string) => {
    try {
      // For now, just simulate sending password reset
      console.log('Password reset requested for:', email)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { error: undefined }
    } catch (error) {
      console.error('Password reset error:', error)
      return { error: error instanceof Error ? error.message : 'Failed to send password reset' }
    }
  }

  const resendEmailConfirmation = async (email: string) => {
    try {
      // For now, just simulate resending email confirmation
      console.log('Email confirmation resend requested for:', email)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { error: undefined }
    } catch (error) {
      console.error('Email confirmation resend error:', error)
      return { error: error instanceof Error ? error.message : 'Failed to resend email confirmation' }
    }
  }

  const hasRole = (role: 'STUDENT' | 'TUTOR' | 'ADMIN'): boolean => {
    return user?.role === role
  }

  const getDashboardUrl = (): string => {
    if (!user) return '/'
    
    switch (user.role) {
      case 'STUDENT':
        return '/student/dashboard'
      case 'TUTOR':
        return '/tutor/dashboard'
      case 'ADMIN':
        return '/admin'
      default:
        return '/account'
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
    sendOTP,
    verifyOTP,
    updateProfile,
    updatePassword,
    hasRole,
    getDashboardUrl,
    signIn,
    signOut,
    sendPasswordReset,
    resendEmailConfirmation,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}