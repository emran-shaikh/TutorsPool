import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock Firebase/Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(),
  Timestamp: {
    fromDate: vi.fn((date) => ({ seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 })),
  },
}));

// Mock Firebase auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: {
      uid: 'student-1',
      email: 'student@test.com',
    },
  })),
}));

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

// Mock Firebase functions locally
const mockCollection = vi.fn();
const mockQuery = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockLimit = vi.fn();
const mockOnSnapshot = vi.fn();
const mockUpdateDoc = vi.fn();

// Mock the actual Firebase modules
vi.mock('firebase/firestore', () => ({
  collection: mockCollection,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  onSnapshot: mockOnSnapshot,
  updateDoc: mockUpdateDoc,
  Timestamp: {
    fromDate: vi.fn((date) => ({ seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 })),
  },
}));

import { useRealtimeNotifications } from '../useRealtimeNotifications';

// Mock toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: mockToast,
  })),
}));

describe('useRealtimeNotifications Hook', () => {
  let mockUnsubscribe: any;
  let mockOnSnapshotCallback: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUnsubscribe = vi.fn();

    // Setup mock for onSnapshot
    mockOnSnapshot.mockImplementation((q, callback) => {
      mockOnSnapshotCallback = callback;
      return mockUnsubscribe;
    });

    // Mock query builder functions
    mockCollection.mockReturnValue('mockCollection');
    mockQuery.mockReturnValue('mockQuery');
    mockWhere.mockReturnValue('mockWhere');
    mockOrderBy.mockReturnValue('mockOrderBy');
    mockLimit.mockReturnValue('mockLimit');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('hook initialization and cleanup', () => {
    it('should set up Firestore listener on mount', () => {
      renderHook(() => useRealtimeNotifications());

      expect(mockCollection).toHaveBeenCalledWith(expect.anything(), 'notifications');
      expect(mockQuery).toHaveBeenCalledWith('mockCollection', 
        expect.arrayContaining(['mockWhere'])
      );
      expect(mockOnSnapshot).toHaveBeenCalledWith('mockQuery', expect.any(Function));
    });

    it('should clean up listener on unmount', () => {
      const { unmount } = renderHook(() => useRealtimeNotifications());

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });

    it('should setup correct query for logged-in user', () => {
      renderHook(() => useRealtimeNotifications());

      expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'student-1');
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(mockLimit).toHaveBeenCalledWith(50);
    });
  });

  describe('new notification handling', () => {
    it('should update state when new notification is received', () => {
      const { result } = renderHook(() => useRealtimeNotifications());

      act(() => {
        mockOnSnapshotCallback({
          forEach: (callback: any) => {
            callback({
              id: 'notification-1',
              data: () => ({
                id: 'notification-1',
                userId: 'student-1',
                type: 'BOOKING_CONFIRMED',
                title: 'Booking Confirmed',
                message: 'Your booking with John Doe has been approved',
                read: false,
                createdAt: { seconds: 1640995200, nanoseconds: 0 },
                data: {
                  bookingId: 'booking-123',
                  tutorId: 'tutor-1',
                },
              }),
            });
          },
        });
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.unreadCount).toBe(1);
      expect(result.current.notifications[0]).toEqual({
        id: 'notification-1',
        userId: 'student-1',
        type: 'BOOKING_CONFIRMED',
        title: 'Booking Confirmed',
        message: 'Your booking with John Doe has been approved',
        read: false,
        createdAt: expect.any(Date),
        data: {
          bookingId: 'booking-123',
          tutorId: 'tutor-1',
        },
      });
    });

    it('should show toast notification for new unread notifications', () => {
      renderHook(() => useRealtimeNotifications());

      act(() => {
        mockOnSnapshotCallback({
          forEach: (callback: any) => {
            callback({
              id: 'notification-2',
              data: () => ({
                id: 'notification-2',
                userId: 'student-1',
                type: 'BOOKING_REMINDER',
                title: 'Session Reminder',
                message: 'Your session with Jane Smith starts in 30 minutes',
                read: false,
                createdAt: { seconds: 1640995300, nanoseconds: 0 },
              }),
            });
          },
        });
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Session Reminder',
        description: 'Your session with Jane Smith starts in 30 minutes',
        duration: 5000,
      });
    });

    it('should not show toast for already read notifications', () => {
      const { result, rerender } = renderHook(() => useRealtimeNotifications());

      // First notification (unread)
      act(() => {
        mockOnSnapshotCallback({
          forEach: (callback: any) => {
            callback({
              id: 'notification-3',
              data: () => ({
                id: 'notification-3',
                userId: 'student-1',
                type: 'BOOKING_CANCELLED',
                title: 'Booking Cancelled',
                message: 'Your session has been cancelled',
                read: false,
                createdAt: { seconds: 1640995400, nanoseconds: 0 },
              }),
            });
          },
        });
      });

      expect(mockToast).toHaveBeenCalledTimes(1);

      // Rerender to simulate state update
      rerender();

      // Same notification as read (should not show toast again)
      act(() => {
        mockOnSnapshotCallback({
          forEach: (callback: any) => {
            callback({
              id: 'notification-3',
              data: () => ({
                id: 'notification-3',
                userId: 'student-1',
                type: 'BOOKING_CANCELLED',
                title: 'Booking Cancelled',
                message: 'Your session has been cancelled' + 'read',
                read: true, // Now read
                createdAt: { seconds: 1640995400, nanoseconds: 0 },
              }),
            });
          },
        });
      });

      expect(mockToast).toHaveBeenCalledTimes(1); // Still 1, not 2
    });
  });

  describe('mark as read functionality', () => {
    it('should mark notification as read when markAsRead is called', async () => {
      // Mock Firebase update function
      const mockUpdateDoc = vi.fn();
      vi.mock('firebase/firestore', async () => ({
        ...(await vi.importActual('firebase/firestore')),
        updateDoc: mockUpdateDoc,
      }));

      const { result } = renderHook(() => useRealtimeNotifications());

      // Add notification to state
      act(() => {
        result.current.notifications = [
          {
            id: 'notification-4',
            userId: 'student-1',
            type: 'BOOKING_REMINDER',
            title: 'Session Reminder',
            message: 'Your session starts in 15 minutes',
            read: false,
            createdAt: new Date(),
            data: {},
          },
        ];
        result.current.unreadCount = 1;
      });

      // Mark as read
      await act(async () => {
        await result.current.markAsRead('notification-4');
      });

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        'notification-4',
        { read: true }
      );
    });

    it('should update notification state locally when marked as read', async () => {
      const { result } = renderHook(() => useRealtimeNotifications());

      act(() => {
        result.current.notifications = [
          {
            id: 'notification-5',
            userId: 'student-1',
            type: 'BOOKING_UPDATE',
            title: 'Session Updated',
            message: 'Your session time has been changed',
            read: false,
            createdAt: new Date(),
            data: {},
          },
        ];
        result.current.unreadCount = 1;
      });

      await act(async () => {
        await result.current.markAsRead('notification-5');
      });

      expect(result.current.notifications[0].read).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });

    it('should mark all notifications as read when markAllAsRead is called', async () => {
      const { result } = renderHook(() => useRealtimeNotifications());

      act(() => {
        result.current.notifications = [
          {
            id: 'notification-6',
            userId: 'student-1',
            type: 'BOOKING_REMINDER',
            title: 'Session Reminder',
            message: 'Your session starts in 10 minutes',
            read: false,
            createdAt: new Date(),
            data: {},
          },
          {
            id: 'notification-7',
            userId: 'student-1',
            type: 'BOOKING_CONFIRMED',
            title: 'Booking Confirmed',
            message: 'Your new booking has been confirmed',
            read: false,
            createdAt: new Date(),
            data: {},
          },
        ];
        result.current.unreadCount = 2;
      });

      await act(async () => {
        await result.current.markAllAsRead();
      });

      expect(result.current.notifications[0].read).toBe(true);
      expect(result.current.notifications[1].read).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('multiple notifications handling', () => {
    it('should handle multiple notifications correctly', () => {
      const { result } = renderHook(() => useRealtimeNotifications());

      act(() => {
        mockOnSnapshotCallback({
          forEach: (callback: any) => {
            const notifications = [
              {
                id: 'notification-8',
                data: () => ({
                  id: 'notification-8',
                  userId: 'student-1',
                  type: 'BOOKING_CONFIRMED',
                  title: 'Booking Confirmed',
                  message: 'Your session with Alice Johnson has been confirmed',
                  read: false,
                  createdAt: { seconds: 1640995500, nanoseconds: 0 },
                  data: {},
                }),
              },
              {
                id: 'notification-9',
                data: () => ({
                  id: 'notification-9',
                  userId: 'student-1',
                  type: 'BOOKING_REMINDER',
                  title: 'Session Reminder',
                  message: 'Your session with Bob Smith starts in 45 minutes',
                  read: true, // Already read
                  createdAt: { seconds: 1640995400, nanoseconds: 0 },
                  data: {},
                }),
              },
              {
                id: 'notification-10',
                data: () => ({
                  id: 'notification-10',
                  userId: 'student-1',
                  type: 'BOOKING_CANCELLED',
                  title: 'Booking Cancelled',
                  message: 'Your session with Carol Davis has been cancelled',
                  read: false,
                  createdAt: { seconds: 1640995600, nanoseconds: 0 },
                  data: {},
                }),
              },
            ];

            notifications.forEach(callback);
          },
        });
      });

      expect(result.current.notifications).toHaveLength(3);
      expect(result.current.unreadCount).toBe(2); // Only 2 are unread

      // Check that notifications are sorted by createdAt desc
      expect(result.current.notifications[0].id).toBe('notification-10');
      expect(result.current.notifications[1].id).toBe('notification-8');
      expect(result.current.notifications[2].id).toBe('notification-9');
    });

    it('should limit notifications to specified limit', () => {
      const { result } = renderHook(() => useRealtimeNotifications());

      act(() => {
        mockOnSnapshotCallback({
          forEach: (callback: any) => {
            // Create 60 notifications (more than limit of 50)
            for (let i = 1; i <= 60; i++) {
              callback({
                id: `notification-${i}`,
                data: () => ({
                  id: `notification-${i}`,
                  userId: 'student-1',
                  type: 'BOOKING_REMINDER',
                  title: 'Session Reminder',
                  message: `Your session ${i} starts soon`,
                  read: false,
                  createdAt: { seconds: 1640995500 + i, nanoseconds: 0 },
                  data: {},
                }),
              });
            }
          },
        });
      });

      expect(result.current.notifications).toHaveLength(50); // Should be limited to 50
    });
  });

  describe('error handling', () => {
    it('should handle Firestore listener errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderHook(() => useRealtimeNotifications());

      act(() => {
        mockOnSnapshotCallback({
          forEach: () => {
            throw new Error('Firestore error');
          },
        });
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in notifications listener:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle errors when marking notifications as read', async () => {
      const mockUpdateDoc = vi.fn().mockRejectedValue(new Error('Database error'));
      vi.mock('firebase/firestore', async () => ({
        ...(await vi.importActual('firebase/firestore')),
        updateDoc: mockUpdateDoc,
      }));

      const { result } = renderHook(() => useRealtimeNotifications());

      await act(async () => {
        try {
          await result.current.markAsRead('notification-nonexistent');
        } catch (error) {
          expect(error.message).toBe('Database error');
        }
      });
    });
  });
});

// Mock implementation of the hook for testing
export const useRealtimeNotifications = () => {
  return {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    refresh: vi.fn(),
  };
};
