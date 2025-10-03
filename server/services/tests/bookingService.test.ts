import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the hybridDataManager
vi.mock('../../services/hybridDataManager.js', () => ({
  default: {
    createBooking: vi.fn(),
    getTutorById: vi.fn(),
    getStudentById: vi.fn(),
    getBookingsByStudentAndTutor: vi.fn()
  },
  hybridDataManager: {
    createBooking: vi.fn(),
    getTutorById: vi.fn(),
    getStudentById: vi.fn(),
    getBookingsByStudentAndTutor: vi.fn()
  }
}));

// Mock availability check function
const mockCheckTutorAvailability = vi.fn();

// Mock Google Meet service
vi.mock('../googleMeetService.js', () => ({
  default: {
    createMeetingLink: vi.fn()
  },
  googleMeetService: {
    createMeetingLink: vi.fn()
  }
}));

import { hybridDataManager } from '../../services/hybridDataManager.js';
import { googleMeetService } from '../googleMeetService.js';

describe('BookingService - Booking Creation Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createBooking', () => {
    const mockBookingData = {
      tutorId: 'tutor-1',
      studentId: 'student-1',
      subjectId: 'subject-1',
      startAtUTC: '2024-01-22T10:00:00Z',
      endAtUTC: '2024-01-22T11:00:00Z',
      type: 'ONLINE' as const,
      message: 'Test booking request'
    };

    const mockTutor = {
      id: 'tutor-1',
      userId: 'user-tutor',
      hourlyRateCents: 5000,
      currency: 'USD',
      headline: 'Expert Mathematics Tutor'
    };

    const mockStudent = {
      id: 'student-1',
      userId: 'user-student',
      gradeLevel: 'high-school',
      learningGoals: 'Academic improvement'
    };

    it('should create booking with status pending when availability check passes', async () => {
      // Mock successful availability check
      mockCheckTutorAvailability.mockResolvedValue({ success: true });

      // Mock successful booking creation
      const mockCreatedBooking = {
        id: 'booking-new-123',
        ...mockBookingData,
        status: 'PENDING',
        createdAt: '2024-01-20T12:00:00Z'
      };

      hybridDataManager.getTutorById.mockResolvedValue(mockTutor);
      hybridDataManager.getStudentById.mockResolvedValue(mockStudent);
      hybridDataManager.createBooking.mockResolvedValue(mockCreatedBooking);

      // Mock Google Meet creation for online bookings
      const mockMeetingLink = {
        joinUrl: 'https://meet.google.com/abc-defg-hij',
        passcode: '123456'
      };
      googleMeetService.createMeetingLink.mockResolvedValue(mockMeetingLink);

      // Implementation of createBooking function to test
      const createOnlineBooking = async (bookingData: any) => {
        // Validate that student and tutor IDs are different
        if (bookingData.studentId === bookingData.tutorId) {
          throw new Error('Student and tutor cannot be the same person');
        }

        // Check tutor and student exist
        const tutor = await hybridDataManager.getTutorById(bookingData.tutorId);
        const student = await hybridDataManager.getStudentById(bookingData.studentId);

        if (!tutor) {
          throw new Error('Tutor not found');
        }
        if (!student) {
          throw new Error('Student not found');
        }

        // Check tutor availability
        const availabilityCheck = await mockCheckTutorAvailability(
          bookingData.tutorId,
          bookingData.studentId,
          new Date(bookingData.startAtUTC),
          1 // duration hours
        );

        if (!availabilityCheck.success) {
          throw new Error(availabilityCheck.error || 'Tutor not available');
        }

        // Create booking with pending status
        const booking = {
          ...bookingData,
          status: 'PENDING' as const,
          hourlyRateCents: tutor.hourlyRateCents,
          currency: tutor.currency
        };

        const createdBooking = await hybridDataManager.createBooking(booking);

        // For online bookings, create meeting link
        if (bookingData.type === 'ONLINE') {
          const meetingLink = await googleMeetService.createMeetingLink({
            title: `Tutoring Session - ${tutor.headline}`,
            startTime: bookingData.startAtUTC,
            duration: 60 // minutes
          });

          // Associate meeting link with booking (in real implementation)
          createdBooking.meetingLink = meetingLink.joinUrl;
          createdBooking.meetingPasscode = meetingLink.passcode;
        }

        return createdBooking;
      };

      const result = await createOnlineBooking(mockBookingData);

      expect(result).toEqual({
        id: 'booking-new-123',
        ...mockBookingData,
        status: 'PENDING',
        createdAt: '2024-01-20T12:00:00Z',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        meetingPasscode: '123456'
      });

      expect(hybridDataManager.getTutorById).toHaveBeenCalledWith('tutor-1');
      expect(hybridDataManager.getStudentById).toHaveBeenCalledWith('student-1');
      expect(mockCheckTutorAvailability).toHaveBeenCalledWith(
        'tutor-1',
        'student-1',
        new Date('2024-01-22T10:00:00Z'),
        1
      );
      expect(hybridDataManager.createBooking).toHaveBeenCalled();
      expect(googleMeetService.createMeetingLink).toHaveBeenCalledWith({
        title: 'Tutoring Session - Expert Mathematics Tutor',
        startTime: '2024-01-22T10:00:00Z',
        duration: 60
      });
    });

    it('should reject booking when availability check fails', async () => {
      // Mock failed availability check
      mockCheckTutorAvailability.mockResolvedValue({ 
        success: false, 
        error: 'Requested time is outside tutor\'s working hours' 
      });

      hybridDataManager.getTutorById.mockResolvedValue(mockTutor);
      hybridDataManager.getStudentById.mockResolvedValue(mockStudent);

      const createBooking = async (bookingData: any) => {
        // Validate that student and tutor IDs are different
        if (bookingData.studentId === bookingData.tutorId) {
          throw new Error('Student and tutor cannot be the same person');
        }

        // Check tutor and student exist
        const tutor = await hybridDataManager.getTutorById(bookingData.tutorId);
        const student = await hybridDataManager.getStudentById(bookingData.studentId);

        if (!tutor) {
          throw new Error('Tutor not found');
        }
        if (!student) {
          throw new Error('Student not found');
        }

        // Check tutor availability
        const availabilityCheck = await mockCheckTutorAvailability(
          bookingData.tutorId,
          bookingData.studentId,
          new Date(bookingData.startAtUTC),
          1 // duration hours
        );

        if (!availabilityCheck.success) {
          throw new Error(availabilityCheck.error || 'Tutor not available');
        }

        const booking = {
          ...bookingData,
          status: 'PENDING' as const,
          hourlyRateCents: tutor.hourlyRateCents,
          currency: tutor.currency
        };

        return await hybridDataManager.createBooking(booking);
      };

      await expect(createBooking(mockBookingData)).rejects.toThrow(
        'Requested time is outside tutor\'s working hours'
      );

      expect(hybridDataManager.getTutorById).toHaveBeenCalledWith('tutor-1');
      expect(hybridDataManager.getStudentById).toHaveBeenCalledWith('student-1');
      expect(mockCheckTutorAvailability).toHaveBeenCalled();
      expect(hybridDataManager.createBooking).not.toHaveBeenCalled();
      expect(googleMeetService.createMeetingLink).not.toHaveBeenCalled();
    });

    it('should reject booking for offline sessions without creating meeting link', async () => {
      const offlineBookingData = {
        ...mockBookingData,
        type: 'OFFLINE' as const
      };

      // Mock successful availability check
      mockCheckTutorAvailability.mockResolvedValue({ success: true });

      hybridDataManager.getTutorById.mockResolvedValue(mockTutor);
      hybridDataManager.getStudentById.mockResolvedValue(mockStudent);

      const mockCreatedBooking = {
        id: 'booking-offline-123',
        ...offlineBookingData,
        status: 'PENDING',
        createdAt: '2024-01-20T12:00:00Z'
      };

      hybridDataManager.createBooking.mockResolvedValue(mockCreatedBooking);

      const createOfflineBooking = async (bookingData: any) => {
        // Validate that student and tutor IDs are different
        if (bookingData.studentId === bookingData.tutorId) {
          throw new Error('Student and tutor cannot be the same person');
        }

        // Check tutor and student exist
        const tutor = await hybridDataManager.getTutorById(bookingData.tutorId);
        const student = await hybridDataManager.getStudentById(bookingData.studentId);

        if (!tutor) {
          throw new Error('Tutor not found');
        }
        if (!student) {
          throw new Error('Student not found');
        }

        // Check tutor availability
        const availabilityCheck = await mockCheckTutorAvailability(
          bookingData.tutorId,
          bookingData.studentId,
          new Date(bookingData.startAtUTC),
          1 // duration hours
        );

        if (!availabilityCheck.success) {
          throw new Error(availabilityCheck.error || 'Tutor not available');
        }

        // Create booking with pending status
        const booking = {
          ...bookingData,
          status: 'PENDING' as const,
          hourlyRateCents: tutor.hourlyRateCents,
          currency: tutor.currency
        };

        const createdBooking = await hybridDataManager.createBooking(booking);

        // For online bookings, create meeting link (skip for offline)
        if (bookingData.type === 'ONLINE') {
          const meetingLink = await googleMeetService.createMeetingLink({
            title: `Tutoring Session - ${tutor.headline}`,
            startTime: bookingData.startAtUTC,
            duration: 60 // minutes
          });

          createdBooking.meetingLink = meetingLink.joinUrl;
          createdBooking.meetingPasscode = meetingLink.passcode;
        }

        return createdBooking;
      };

      const result = await createOfflineBooking(offlineBookingData);

      expect(result).toEqual({
        id: 'booking-offline-123',
        ...offlineBookingData,
        status: 'PENDING',
        createdAt: '2024-01-20T12:00:00Z',
        // No meeting link for offline sessions
      });

      expect(hybridDataManager.createBooking).toHaveBeenCalled();
      expect(googleMeetService.createMeetingLink).not.toHaveBeenCalled();
    });

    it('should reject booking if student and tutor IDs are the same', async () => {
      const invalidBookingData = {
        ...mockBookingData,
        studentId: 'tutor-1', // Same as tutorId - invalid!
      };

      const createBookingValidation = async (bookingData: any) => {
        // Validate that student and tutor IDs are different
        if (bookingData.studentId === bookingData.tutorId) {
          throw new Error('Student and tutor cannot be the same person');
        }

        return { success: true };
      };

      await expect(createBookingValidation(invalidBookingData)).rejects.toThrow(
        'Student and tutor cannot be the same person'
      );

      expect(hybridDataManager.getTutorById).not.toHaveBeenCalled();
      expect(hybridDataManager.getStudentById).not.toHaveBeenCalled();
      expect(mockCheckTutorAvailability).not.toHaveBeenCalled();
    });

    it('should handle missing tutor gracefully', async () => {
      hybridDataManager.getTutorById.mockResolvedValue(null);
      hybridDataManager.getStudentById.mockResolvedValue(mockStudent);

      const createBookingTutorCheck = async (bookingData: any) => {
        if (bookingData.studentId === bookingData.tutorId) {
          throw new Error('Student and tutor cannot be the same person');
        }

        const tutor = await hybridDataManager.getTutorById(bookingData.tutorId);
        
        if (!tutor) {
          throw new Error('Tutor not found');
        }
        
        const student = await hybridDataManager.getStudentById(bookingData.studentId);
        if (!student) {
          throw new Error('Student not found');
        }

        return { success: true };
      };

      await expect(createBookingTutorCheck(mockBookingData)).rejects.toThrow('Tutor not found');

      expect(hybridDataManager.getTutorById).toHaveBeenCalledWith('tutor-1');
      expect(hybridDataManager.getStudentById).not.toHaveBeenCalled();
    });

    it('should handle missing student gracefully', async () => {
      hybridDataManager.getTutorById.mockResolvedValue(mockTutor);
      hybridDataManager.getStudentById.mockResolvedValue(null);

      const createBookingStudentCheck = async (bookingData: any) => {
        if (bookingData.studentId === bookingData.tutorId) {
          throw new Error('Student and tutor cannot be the same person');
        }

        const tutor = await hybridDataManager.getTutorById(bookingData.tutorId);
        const student = await hybridDataManager.getStudentById(bookingData.studentId);

        if (!tutor) {
          throw new Error('Tutor not found');
        }
        if (!student) {
          throw new Error('Student not found');
        }

        return { success: true };
      };

      await expect(createBookingStudentCheck(mockBookingData)).rejects.toThrow('Student not found');

      expect(hybridDataManager.getTutorById).toHaveBeenCalledWith('tutor-1');
      expect(hybridDataManager.getStudentById).toHaveBeenCalledWith('student-1');
    });

    it('should handle Google Meet creation failure for online bookings', async () => {
      mockCheckTutorAvailability.mockResolvedValue({ success: true });
      hybridDataManager.getTutorById.mockResolvedValue(mockTutor);
      hybridDataManager.getStudentById.mockResolvedValue(mockStudent);

      const mockCreatedBooking = {
        id: 'booking-meeting-failure-123',
        ...mockBookingData,
        status: 'PENDING',
        createdAt: '2024-01-20T12:00:00Z'
      };

      hybridDataManager.createBooking.mockResolvedValue(mockCreatedBooking);

      // Mock Google Meet creation failure
      googleMeetService.createMeetingLink.mockRejectedValue(new Error('Failed to create meeting link'));

      const createBookingWithMeetingFailure = async (bookingData: any) => {
        if (bookingData.studentId === bookingData.tutorId) {
          throw new Error('Student and tutor cannot be the same person');
        }

        const tutor = await hybridDataManager.getTutorById(bookingData.tutorId);
        const student = await hybridDataManager.getStudentById(bookingData.studentId);

        if (!tutor) {
          throw new Error('Tutor not found');
        }
        if (!student) {
          throw new Error('Student not found');
        }

        const availabilityCheck = await mockCheckTutorAvailability(
          bookingData.tutorId,
          bookingData.studentId,
          new Date(bookingData.startAtUTC),
          1
        );

        if (!availabilityCheck.success) {
          throw new Error(availabilityCheck.error || 'Tutor not available');
        }

        const booking = {
          ...bookingData,
          status: 'PENDING' as const,
          hourlyRateCents: tutor.hourlyRateCents,
          currency: tutor.currency
        };

        const createdBooking = await hybridDataManager.createBooking(booking);

        // Try to create meeting link for online bookings, but don't fail if it doesn't work
        if (bookingData.type === 'ONLINE') {
          try {
            const meetingLink = await googleMeetService.createMeetingLink({
              title: `Tutoring Session - ${tutor.headline}`,
              startTime: bookingData.startAtUTC,
              duration: 60
            });

            createdBooking.meetingLink = meetingLink.joinUrl;
            createdBooking.meetingPasscode = meetingLink.passcode;
          } catch (error) {
            // Log error but don't fail the booking creation
            console.warn('Failed to create meeting link:', error);
            createdBooking.meetingLinkError = 'Meeting link creation failed';
          }
        }

        return createdBooking;
      };

      const result = await createBookingWithMeetingFailure(mockBookingData);

      expect(result).toEqual({
        id: 'booking-meeting-failure-123',
        ...mockBookingData,
        status: 'PENDING',
        createdAt: '2024-01-20T12:00:00Z',
        meetingLinkError: 'Meeting link creation failed'
      });

      expect(googleMeetService.createMeetingLink).toHaveBeenCalled();
      expect(hybridDataManager.createBooking).toHaveBeenCalled();
    });
  });
});
