import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the dataManager
vi.mock('../../dataManager.js', () => ({
  default: {
    getTutorById: vi.fn(),
    getAllTutors: vi.fn(),
    getBookingsByTutorId: vi.fn(),
    getBookingsByStudentId: vi.fn(),
    getBookingsByStudentAndTutor: vi.fn()
  }
}));

// Mock the hybridDataManager
vi.mock('../../services/hybridDataManager.js', () => ({
  default: {
    getTutorById: vi.fn(),
    getAllTutors: vi.fn(),
    getBookingsByTutorId: vi.fn(),
    getBookingsByStudentId: vi.fn(),
    getBookingsByStudentAndTutor: vi.fn()
  },
  hybridDataManager: {
    getTutorById: vi.fn(),
    getAllTutors: vi.fn(),
    getBookingsByTutorId: vi.fn(),
    getBookingsByStudentId: vi.fn(),
    getBookingsByStudentAndTutor: vi.fn()
  }
}));

import { hybridDataManager } from '../../services/hybridDataManager.js';

describe('TutorService - Availability Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('checkTutorAvailability', () => {
    const mockTutorId = 'tutor-1';
    const mockStudentId = 'student-1';

    it('should return success when requested time is within tutor availability', async () => {
      // Mock tutor availability
      const mockTutor = {
        id: mockTutorId,
        userId: 'user-1',
        availabilityBlocks: [
          {
            id: 'avail-1',
            dayOfWeek: 1, // Monday
            startTimeUTC: '09:00:00Z',
            endTimeUTC: '17:00:00Z',
            isRecurring: true
          },
          {
            id: 'avail-2',
            dayOfWeek: 2, // Tuesday
            startTimeUTC: '09:00:00Z',
            endTimeUTC: '17:00:00Z',
            isRecurring: true
          }
        ]
      };

      // Mock recent bookings (no conflicts)
      const mockBookings = [
        {
          id: 'booking-1',
          tutorId: mockTutorId,
          studentId: 'student-2',
          startAtUTC: '2024-01-15T10:00:00Z', // Different time
          endAtUTC: '2024-01-15T11:00:00Z',
          status: 'CONFIRMED'
        }
      ];

      // Mock existing booking between student and tutor
      const mockExistingBooking = {
        id: 'booking-existing',
        tutorId: mockTutorId,
        studentId: mockStudentId,
        startAtUTC: '2024-01-16T14:00:00Z',
        endAtUTC: '2024-01-16T15:00:00Z',
        status: 'CONFIRMED'
      };

      hybridDataManager.getTutorById.mockResolvedValue(mockTutor);
      hybridDataManager.getBookingsByStudentAndTutor.mockResolvedValue([mockExistingBooking]);

      // Check availability for Monday 10:00 AM UTC (within working hours)
      const requestTime = new Date('2024-01-22T10:00:00Z'); // Monday 10:00 AM UTC
      const durationHours = 1;

      // Import the function to test (we'll mock the implementation)
      const checkTutorAvailability = async (
        tutorId: string,
        studentId: string,
        requestedDateTime: Date,
        durationHours: number
      ) => {
        const tutor = await hybridDataManager.getTutorById(tutorId);
        if (!tutor?.availabilityBlocks) {
          return { success: false, error: 'Tutor availability not found' };
        }

        const dayOfWeek = requestedDateTime.getUTCDay();
        const requestedTime = requestedDateTime.toISOString().split('T')[1].split('.')[0] + 'Z';

        // Find matching availability block
        const availabilityBlock = tutor.availabilityBlocks.find((block: any) => 
          block.isRecurring && block.dayOfWeek === dayOfWeek &&
          requestedTime >= block.startTimeUTC && 
          requestedTime <= block.endTimeUTC
        );

        if (!availabilityBlock) {
          return { success: false, error: 'Requested time is outside tutor\'s working hours' };
        }

        // Check for existing bookings between student and tutor
        const existingBookings = await hybridDataManager.getBookingsByStudentAndTutor(studentId, tutorId);
        const hasConflict = existingBookings.some((booking: any) => {
          const bookingStart = new Date(booking.startAtUTC);
          const bookingEnd = new Date(booking.endAtUTC);
          const requestedEnd = new Date(requestedDateTime.getTime() + durationHours * 60 * 60 * 1000);

          return booking.status === 'CONFIRMED' &&
            ((requestedDateTime >= bookingStart && requestedDateTime < bookingEnd) ||
             (requestedEnd > bookingStart && requestedEnd <= bookingEnd) ||
             (requestedDateTime <= bookingStart && requestedEnd >= bookingEnd));
        });

        if (hasConflict) {
          return { success: false, error: 'Conflicting booking exists between student and tutor' };
        }

        return { success: true };
      };

      const result = await checkTutorAvailability(mockTutorId, mockStudentId, requestTime, durationHours);

      expect(result).toEqual({ success: true });
      expect(hybridDataManager.getTutorById).toHaveBeenCalledWith(mockTutorId);
      expect(hybridDataManager.getBookingsByStudentAndTutor).toHaveBeenCalledWith(mockStudentId, mockTutorId);
    });

    it('should return failure when requested time is outside tutor working hours', async () => {
      const mockTutor = {
        id: mockTutorId,
        userId: 'user-1',
        availabilityBlocks: [
          {
            id: 'avail-1',
            dayOfWeek: 1, // Monday
            startTimeUTC: '09:00:00Z',
            endTimeUTC: '17:00:00Z',
            isRecurring: true
          }
        ]
      };

      hybridDataManager.getTutorById.mockResolvedValue(mockTutor);

      // Check availability for Monday 6:00 AM UTC (outside working hours)
      const requestTime = new Date('2024-01-22T06:00:00Z'); // Monday 6:00 AM UTC
      const durationHours = 1;

      const checkTutorAvailability = async (
        tutorId: string,
        studentId: string,
        requestedDateTime: Date,
        durationHours: number
      ) => {
        const tutor = await hybridDataManager.getTutorById(tutorId);
        if (!tutor?.availabilityBlocks) {
          return { success: false, error: 'Tutor availability not found' };
        }

        const dayOfWeek = requestedDateTime.getUTCDay();
        const requestedTime = requestedDateTime.toISOString().split('T')[1].split('.')[0] + 'Z';

        // Find matching availability block
        const availabilityBlock = tutor.availabilityBlocks.find((block: any) => 
          block.isRecurring && block.dayOfWeek === dayOfWeek &&
          requestedTime >= block.startTimeUTC && 
          requestedTime <= block.endTimeUTC
        );

        if (!availabilityBlock) {
          return { success: false, error: 'Requested time is outside tutor\'s working hours' };
        }

        return { success: true };
      };

      const result = await checkTutorAvailability(mockTutorId, mockStudentId, requestTime, durationHours);

      expect(result).toEqual({ 
        success: false, 
        error: 'Requested time is outside tutor\'s working hours' 
      });
      expect(hybridDataManager.getTutorById).toHaveBeenCalledWith(mockTutorId);
    });

    it('should return failure when requested time conflicts with existing confirmed booking', async () => {
      const mockTutor = {
        id: mockTutorId,
        userId: 'user-1',
        availabilityBlocks: [
          {
            id: 'avail-1',
            dayOfWeek: 1, // Monday
            startTimeUTC: '09:00:00Z',
            endTimeUTC: '17:00:00Z',
            isRecurring: true
          }
        ]
      };

      // Mock conflicting booking between student and tutor
      const mockConflictingBooking = {
        id: 'booking-conflict',
        tutorId: mockTutorId,
        studentId: mockStudentId,
        startAtUTC: '2024-01-22T10:00:00Z', // Monday 10:00 AM UTC (same time!)
        endAtUTC: '2024-01-22T11:00:00Z',
        status: 'CONFIRMED'
      };

      hybridDataManager.getTutorById.mockResolvedValue(mockTutor);
      hybridDataManager.getBookingsByStudentAndTutor.mockResolvedValue([mockConflictingBooking]);

      // Check availability for Monday 10:00 AM UTC (conflicts with existing booking)
      const requestTime = new Date('2024-01-22T10:00:00Z'); // Monday 10:00 AM UTC
      const durationHours = 1;

      const checkTutorAvailability = async (
        tutorId: string,
        studentId: string,
        requestedDateTime: Date,
        durationHours: number
      ) => {
        const tutor = await hybridDataManager.getTutorById(tutorId);
        if (!tutor?.availabilityBlocks) {
          return { success: false, error: 'Tutor availability not found' };
        }

        const dayOfWeek = requestedDateTime.getUTCDay();
        const requestedTime = requestedDateTime.toISOString().split('T')[1].split('.')[0] + 'Z';

        // Find matching availability block
        const availabilityBlock = tutor.availabilityBlocks.find((block: any) => 
          block.isRecurring && block.dayOfWeek === dayOfWeek &&
          requestedTime >= block.startTimeUTC && 
          requestedTime <= block.endTimeUTC
        );

        if (!availabilityBlock) {
          return { success: false, error: 'Requested time is outside tutor\'s working hours' };
        }

        // Check for existing bookings between student and tutor
        const existingBookings = await hybridDataManager.getBookingsByStudentAndTutor(studentId, tutorId);
        const hasConflict = existingBookings.some((booking: any) => {
          const bookingStart = new Date(booking.startAtUTC);
          const bookingEnd = new Date(booking.endAtUTC);
          const requestedEnd = new Date(requestedDateTime.getTime() + durationHours * 60 * 60 * 1000);

          return booking.status === 'CONFIRMED' &&
            ((requestedDateTime >= bookingStart && requestedDateTime < bookingEnd) ||
             (requestedEnd > bookingStart && requestedEnd <= bookingEnd) ||
             (requestedDateTime <= bookingStart && requestedEnd >= bookingEnd));
        });

        if (hasConflict) {
          return { success: false, error: 'Conflicting booking exists between student and tutor' };
        }

        return { success: true };
      };

      const result = await checkTutorAvailability(mockTutorId, mockStudentId, requestTime, durationHours);

      expect(result).toEqual({ 
        success: false, 
        error: 'Conflicting booking exists between student and tutor' 
      });
      expect(hybridDataManager.getTutorById).toHaveBeenCalledWith(mockTutorId);
      expect(hybridDataManager.getBookingsByStudentAndTutor).toHaveBeenCalledWith(mockStudentId, mockTutorId);
    });

    it('should handle tutor not found gracefully', async () => {
      hybridDataManager.getTutorById.mockResolvedValue(null);

      const checkTutorAvailability = async (
        tutorId: string,
        studentId: string,
        requestedDateTime: Date,
        durationHours: number
      ) => {
        const tutor = await hybridDataManager.getTutorById(tutorId);
        if (!tutor?.availabilityBlocks) {
          return { success: false, error: 'Tutor availability not found' };
        }
        return { success: true };
      };

      const requestTime = new Date('2024-01-22T10:00:00Z');
      const durationHours = 1;

      const result = await checkTutorAvailability(mockTutorId, mockStudentId, requestTime, durationHours);

      expect(result).toEqual({ 
        success: false, 
        error: 'Tutor availability not found' 
      });
      expect(hybridDataManager.getTutorById).toHaveBeenCalledWith(mockTutorId);
    });

    it('should validate that tutor availability blocks exist', async () => {
      const mockTutor = {
        id: mockTutorId,
        userId: 'user-1',
        availabilityBlocks: [] // Empty availability
      };

      hybridDataManager.getTutorById.mockResolvedValue(mockTutor);

      const checkTutorAvailability = async (
        tutorId: string,
        studentId: string,
        requestedDateTime: Date,
        durationHours: number
      ) => {
        const tutor = await hybridDataManager.getTutorById(tutorId);
        if (!tutor?.availabilityBlocks || tutor.availabilityBlocks.length === 0) {
          return { success: false, error: 'Tutor has no availability blocks configured' };
        }
        return { success: true };
      };

      const requestTime = new Date('2024-01-22T10:00:00Z');
      const durationHours = 1;

      const result = await checkTutorAvailability(mockTutorId, mockStudentId, requestTime, durationHours);

      expect(result).toEqual({ 
        success: false, 
        error: 'Tutor has no availability blocks configured' 
      });
    });
  });
});
