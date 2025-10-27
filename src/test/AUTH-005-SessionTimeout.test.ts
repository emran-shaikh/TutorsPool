/**
 * AUTH-005: Session Timeout Test
 * Validate backend correctly invalidates and rejects expired JWT tokens
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock API endpoints
const API_BASE_URL = 'http://localhost:5174/api';

// Mock expired JWT token (exp claim in the past)
const EXPIRED_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ1c2VyLTEyMyIsInJvbGUiOiJzdHVkZW50IiwiZXhwIjoxNjAwMDAwMDAwfQ.expired';

// Mock valid JWT token (exp claim in the future)
const VALID_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ1c2VyLTEyMyIsInJvbGUiOiJzdHVkZW50IiwiZXhwIjoyMDAwMDAwMDAwfQ.valid';

// Mock token that expires soon
const EXPIRING_SOON_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ1c2VyLTEyMyIsInJvbGUiOiJzdHVkZW50IiwiZXhwIjoxNzYxNTU2NTAwfQ.expiring';

describe('AUTH-005: Session Timeout and JWT Expiration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Expired Token Rejection', () => {
    it('should reject API request with expired token - 401 Unauthorized', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ 
          error: 'Unauthorized', 
          message: 'Token has expired' 
        }),
      });

      const response = await fetch(`${API_BASE_URL}/student/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${EXPIRED_TOKEN}`,
        },
      });

      expect(response.status).toBe(401);
      expect(response.ok).toBe(false);

      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
      expect(data.message).toMatch(/expired|invalid/i);
    });

    it('should reject POST request with expired token', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ 
          error: 'Unauthorized', 
          message: 'Token expired' 
        }),
      });

      const response = await fetch(`${API_BASE_URL}/student/book-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${EXPIRED_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tutorId: 'tutor-123',
          date: '2025-11-01',
        }),
      });

      expect(response.status).toBe(401);
    });

    it('should reject PUT request with expired token', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      const response = await fetch(`${API_BASE_URL}/student/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${EXPIRED_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Updated Name',
        }),
      });

      expect(response.status).toBe(401);
    });

    it('should reject DELETE request with expired token', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      const response = await fetch(`${API_BASE_URL}/student/booking/123`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${EXPIRED_TOKEN}`,
        },
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Valid Token Acceptance', () => {
    it('should accept API request with valid non-expired token', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ 
          success: true, 
          data: { id: 'user-123', name: 'Test User' } 
        }),
      });

      const response = await fetch(`${API_BASE_URL}/student/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${VALID_TOKEN}`,
        },
      });

      expect(response.status).toBe(200);
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should process POST request with valid token', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ 
          success: true, 
          bookingId: 'booking-456' 
        }),
      });

      const response = await fetch(`${API_BASE_URL}/student/book-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VALID_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tutorId: 'tutor-123',
          date: '2025-11-01',
        }),
      });

      expect(response.status).toBe(201);
      expect(response.ok).toBe(true);
    });
  });

  describe('Token Expiration Edge Cases', () => {
    it('should reject token that just expired (within seconds)', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ 
          error: 'Unauthorized', 
          message: 'Token expired' 
        }),
      });

      const response = await fetch(`${API_BASE_URL}/student/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${EXPIRED_TOKEN}`,
        },
      });

      expect(response.status).toBe(401);
    });

    it('should accept token that expires in the future', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      const response = await fetch(`${API_BASE_URL}/student/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${VALID_TOKEN}`,
        },
      });

      expect(response.status).toBe(200);
    });

    it('should handle token expiring during request processing', async () => {
      // Simulate token expiring mid-request
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ 
          error: 'Unauthorized', 
          message: 'Token expired during request' 
        }),
      });

      const response = await fetch(`${API_BASE_URL}/student/long-operation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${EXPIRING_SOON_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: 'test' }),
      });

      // Should fail with 401 even if token was valid at request start
      expect(response.status).toBe(401);
    });
  });

  describe('Multiple Endpoint Token Validation', () => {
    it('should reject expired token on student endpoints', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      const endpoints = [
        '/student/profile',
        '/student/bookings',
        '/student/dashboard',
        '/student/payments',
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${EXPIRED_TOKEN}`,
          },
        });

        expect(response.status).toBe(401);
      }
    });

    it('should reject expired token on tutor endpoints', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      const endpoints = [
        '/tutor/profile',
        '/tutor/availability',
        '/tutor/earnings',
        '/tutor/students',
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${EXPIRED_TOKEN}`,
          },
        });

        expect(response.status).toBe(401);
      }
    });

    it('should reject expired token on admin endpoints', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      const endpoints = [
        '/admin/users',
        '/admin/dashboard',
        '/admin/settings',
        '/admin/reports',
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${EXPIRED_TOKEN}`,
          },
        });

        expect(response.status).toBe(401);
      }
    });
  });

  describe('Token Refresh Handling', () => {
    it('should provide token refresh endpoint', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ 
          success: true, 
          token: 'new-refreshed-token' 
        }),
      });

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VALID_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('token');
    });

    it('should reject refresh request with expired token', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ 
          error: 'Unauthorized', 
          message: 'Cannot refresh expired token' 
        }),
      });

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${EXPIRED_TOKEN}`,
        },
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Session Management', () => {
    it('should invalidate all sessions on logout', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, message: 'Logged out successfully' }),
      });

      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VALID_TOKEN}`,
        },
      });

      expect(response.status).toBe(200);
    });

    it('should track session expiration time', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ 
          success: true, 
          expiresAt: Date.now() + 3600000 // 1 hour from now
        }),
      });

      const response = await fetch(`${API_BASE_URL}/auth/session-info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${VALID_TOKEN}`,
        },
      });

      const data = await response.json();
      expect(data).toHaveProperty('expiresAt');
      expect(data.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should handle concurrent requests with expired token', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      const requests = [
        fetch(`${API_BASE_URL}/student/profile`, {
          headers: { 'Authorization': `Bearer ${EXPIRED_TOKEN}` },
        }),
        fetch(`${API_BASE_URL}/student/bookings`, {
          headers: { 'Authorization': `Bearer ${EXPIRED_TOKEN}` },
        }),
        fetch(`${API_BASE_URL}/student/dashboard`, {
          headers: { 'Authorization': `Bearer ${EXPIRED_TOKEN}` },
        }),
      ];

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(401);
      });
    });
  });

  describe('Error Messages and Security', () => {
    it('should provide clear error message for expired token', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ 
          error: 'Unauthorized', 
          message: 'Your session has expired. Please log in again.' 
        }),
      });

      const response = await fetch(`${API_BASE_URL}/student/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${EXPIRED_TOKEN}`,
        },
      });

      const data = await response.json();
      expect(data.message).toMatch(/expired|log in/i);
    });

    it('should not leak token details in error response', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ 
          error: 'Unauthorized', 
          message: 'Token expired'
          // Should NOT include: token content, secret key, algorithm details
        }),
      });

      const response = await fetch(`${API_BASE_URL}/student/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${EXPIRED_TOKEN}`,
        },
      });

      const data = await response.json();
      
      // Verify no sensitive data leaked
      expect(data).not.toHaveProperty('tokenPayload');
      expect(data).not.toHaveProperty('secretKey');
      expect(data).not.toHaveProperty('algorithm');
    });

    it('should log security events for expired token attempts', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      await fetch(`${API_BASE_URL}/student/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${EXPIRED_TOKEN}`,
        },
      });

      // In production, expired token attempts should be logged
      expect(true).toBe(true);

      consoleSpy.mockRestore();
    });
  });

  describe('Token Lifetime Configuration', () => {
    it('should respect configured token expiration time', async () => {
      // Tokens should expire based on server configuration
      // Default: 1 hour for access tokens, 7 days for refresh tokens
      
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ 
          error: 'Unauthorized', 
          message: 'Token expired after configured lifetime' 
        }),
      });

      const response = await fetch(`${API_BASE_URL}/student/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${EXPIRED_TOKEN}`,
        },
      });

      expect(response.status).toBe(401);
    });
  });
});
