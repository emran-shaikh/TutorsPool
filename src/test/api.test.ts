import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient, adminApi } from '@/lib/api'

// Mock fetch globally
global.fetch = vi.fn()

describe('API Client Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Authentication', () => {
    it('should handle successful login', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          user: { id: 'user-1', role: 'STUDENT' },
          token: 'mock-token'
        })
      }

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

      // Use the singleton instance
      const result = await apiClient.login('test@example.com', 'password')

      expect(result.success).toBe(true)
      expect(result.user.role).toBe('STUDENT')
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-token')
    })

    it('should handle login failure', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({
          error: 'Invalid credentials'
        })
      }

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

      // Use the singleton instance
      
      await expect(apiClient.login('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials')
    })

    it('should handle registration', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          user: { id: 'user-1', role: 'STUDENT' },
          token: 'mock-token'
        })
      }

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

      // Use the singleton instance
      const result = await apiClient.register({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        country: 'USA',
        role: 'STUDENT'
      })

      expect(result.success).toBe(true)
      // The register method might return different structure
      expect(result).toHaveProperty('success')
    })
  })

  describe('Admin API', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'admin-token')
    })

    it('should fetch admin dashboard data', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          stats: {
            totalUsers: 156,
            totalTutors: 23,
            totalStudents: 133,
            totalBookings: 89
          }
        })
      }

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

      // Use the singleton instance
      const result = await apiClient.getAdminDashboard()

      expect(result.stats.totalUsers).toBe(156)
      expect(result.stats.totalTutors).toBe(23)
    })

    it('should fetch users list', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          users: [
            {
              id: 'user-1',
              name: 'John Doe',
              email: 'john@example.com',
              role: 'STUDENT'
            }
          ]
        })
      }

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

      // Use the singleton instance
      const result = await adminApi.getUsers()

      expect(result.users).toHaveLength(1)
      expect(result.users[0].name).toBe('John Doe')
    })

    it('should update user status', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          message: 'User status updated'
        })
      }

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

      // Use the singleton instance
      const result = await adminApi.updateUserStatus('user-1', 'ACTIVE')

      expect(result.success).toBe(true)
      // Verify the API was called
      expect(global.fetch).toHaveBeenCalled()
    })

    it('should delete user', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          message: 'User deleted'
        })
      }

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

      // Use the singleton instance
      const result = await adminApi.deleteUser('user-1')

      expect(result.success).toBe(true)
      // Verify the API was called
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  describe('Tutor API', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'tutor-token')
    })

    it('should fetch tutors list', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          tutors: [
            {
              id: 'tutor-1',
              userId: 'user-1',
              headline: 'Math Expert',
              hourlyRateCents: 2500,
              ratingAvg: 4.8
            }
          ]
        })
      }

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

      // Use the singleton instance
      const result = await adminApi.getTutors()

      expect(result.tutors).toHaveLength(1)
      expect(result.tutors[0].headline).toBe('Math Expert')
    })

    it('should search tutors with filters', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          tutors: [
            {
              id: 'tutor-1',
              headline: 'Math Expert',
              subjects: ['Mathematics'],
              hourlyRateCents: 2500
            }
          ],
          total: 1
        })
      }

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

      // Use the singleton instance
      const result = await apiClient.searchTutors({
        subject: 'Mathematics',
        minPrice: 20,
        maxPrice: 30
      })

      expect(result.tutors).toHaveLength(1)
      expect(result.total).toBe(1)
    })
  })

  describe('Booking API', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'student-token')
    })

    it('should create booking', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          booking: {
            id: 'booking-1',
            studentId: 'student-1',
            tutorId: 'tutor-1',
            status: 'CONFIRMED'
          }
        })
      }

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

      // Use the singleton instance
      const result = await apiClient.createBooking({
        tutorId: 'tutor-1',
        subjectId: 'mathematics',
        startAtUTC: '2025-09-09T10:00:00Z',
        endAtUTC: '2025-09-09T11:00:00Z'
      })

      expect(result.success).toBe(true)
      expect(result.booking.status).toBe('CONFIRMED')
    })

    it('should get bookings', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          bookings: [
            {
              id: 'booking-1',
              studentId: 'student-1',
              tutorId: 'tutor-1',
              status: 'CONFIRMED',
              startAtUTC: '2025-09-09T10:00:00Z'
            }
          ]
        })
      }

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

      const result = await apiClient.getBookings()

      expect(result.bookings).toHaveLength(1)
      expect(result.bookings[0].status).toBe('CONFIRMED')
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

      // Use the singleton instance
      
      await expect(apiClient.login('test@example.com', 'password'))
        .rejects.toThrow('Network error')
    })

    it('should handle 401 unauthorized', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({
          error: 'Unauthorized'
        })
      }

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

      // Use the singleton instance
      
      await expect(apiClient.getAdminDashboard())
        .rejects.toThrow('Unauthorized')
    })

    it('should handle 403 forbidden', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        json: async () => ({
          error: 'Access denied'
        })
      }

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

      // Use the singleton instance
      
      await expect(apiClient.getAdminDashboard())
        .rejects.toThrow('Access denied')
    })
  })
})
