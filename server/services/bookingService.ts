import { checkTutorAvailability, isTimeSlotAvailable } from './tutorService';
import { hybridDataManager } from './hybridDataManager';
import { dataManager } from '../dataManager';
import { createGoogleMeetLink, formatMeetingInstructions, generateMeetingSummary } from './googleMeetService';

interface BookingData {
  studentId: string;
  tutorId: string;
  subjectId: string;
  startAtUTC: string;
  endAtUTC: string;
  priceCents: number;
  currency: string;
  sessionType?: 'ONLINE' | 'IN_PERSON';
  meetingLink?: string;
  meetingId?: string;
  meetingPassword?: string;
  onlinePlatform?: string;
  meetingDetails?: any;
  specialRequirements?: string;
  notes?: string;
}

interface BookingResult {
  success: boolean;
  bookingId?: string;
  error?: string;
  booking?: any;
}

/**
 * Create a new booking with availability check and Google Meet integration
 * @param data - Booking data
 * @param userRole - Role of the user creating the booking
 * @returns Promise<BookingResult>
 */
export async function createBooking(
  data: BookingData, 
  userRole: string
): Promise<BookingResult> {
  try {
    console.log('Creating booking with data:', data);
    console.log('User role:', userRole);

    // Validate required fields
    if (!data.studentId || !data.tutorId || !data.subjectId || !data.startAtUTC || !data.endAtUTC || !data.priceCents) {
      return {
        success: false,
        error: 'Missing required fields'
      };
    }

    // Parse dates
    const startTime = new Date(data.startAtUTC);
    const endTime: Date = new Date(data.endAtUTC);

    // Validate dates
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return {
        success: false,
        error: 'Invalid date format'
      };
    }

    if (startTime >= endTime) {
      return {
        success: false,
        error: 'Start time must be before end time'
      };
    }

    // Check if the time slot is in the future
    if (startTime <= new Date()) {
      return {
        success: false,
        error: 'Booking time must be in the future'
      };
    }

    // Check tutor availability
    console.log('Checking tutor availability...');
    const availabilityCheck = await checkTutorAvailability(
      data.tutorId, 
      startTime, 
      Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
    );

    if (!availabilityCheck.isAvailable) {
      console.log('Tutor not available:', availabilityCheck.reason);
      return {
        success: false,
        error: availabilityCheck.reason || 'Tutor not available for the requested time'
      };
    }

    // Verify student exists and is active
    const student = await hybridDataManager.getUserById(data.studentId);
    if (!student) {
      return {
        success: false,
        error: 'Student not found'
      };
    }

    if (student.role !== 'STUDENT') {
      return {
        success: false,
        error: 'User is not a student'
      };
    }

    if (student.status !== 'ACTIVE') {
      return {
        success: false,
        error: 'Student account is not active'
      };
    }

    // Verify tutor exists
    const tutor = await hybridDataManager.getTutorByUserId(data.tutorId);
    if (!tutor) {
      return {
        success: false,
        error: 'Tutor not found'
      };
    }

    // Get user details for tutor
    const tutorUser = await hybridDataManager.getUserById(tutor.userId);

    // Create Google Meet link for online sessions
    let meetingDetails: any = null;
    let meetingLink: string | null = null;
    let meetingPassword: string | null = null;
    let meetingId: string | null = null;

    if (data.sessionType === 'ONLINE' && tutorUser && student) {
      console.log('Creating Google Meet link for online session...');
      
      const meetLinkResult = await createGoogleMeetLink(
        tutorUser.email,
        student.email,
        startTime,
        endTime,
        `Tutoring Session: ${student.name} with ${tutorUser.name}`,
        data.notes || 'Prepare any questions or materials you want to discuss during the session.'
      );

      if (meetLinkResult.success) {
        meetingLink = meetLinkResult.meetingLink || null;
        meetingId = meetLinkResult.meetingId || null;
        meetingPassword = meetLinkResult.password || null;
        meetingDetails = meetLinkResult.meetingDetails || null;

        console.log('Google Meet link created:', {
          meetingLink,
          meetingId,
          meetingPassword,
          hasMeetingDetails: !!meetingDetails
        });
      } else {
        console.error('Failed to create Google Meet link:', meetLinkResult.error);
        // Continue without Google Meet link - could use backup system
      }
    }

    // Create booking object
    const booking = {
      studentId: data.studentId,
      tutorId: data.tutorId,
      subjectId: data.subjectId,
      startAtUTC: data.startAtUTC,
      endAtUTC: data.endAtUTC,
      status: 'PENDING' as const,
      priceCents: data.priceCents,
      currency: data.currency || 'USD',
      paymentStatus: 'PENDING' as const,
      paymentRequired: true,
      sessionType: data.sessionType || 'ONLINE',
      meetingLink: meetingLink || null,
      meetingId: meetingId || null,
      meetingPassword: meetingPassword || null,
      onlinePlatform: data.sessionType === 'ONLINE' ? 'google_meet' : null,
      meetingDetails: meetingDetails || null,
      specialRequirements: data.specialRequirements || null,
      notes: data.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Booking object created:', booking);

    // Save booking using dataManager (since it has the addBookingWithNotification method)
    const addedBooking = dataManager.addBookingWithNotification(booking);

    console.log('Booking saved with ID:', addedBooking.id);

    // Send enhanced notifications with Google Meet details
    try {
      if (tutorUser && student) {
        // Enhanced tutor notification with Google Meet details
        let tutorNotificationTitle = 'New Session Booking Request';
        let tutorNotificationMessage = `${student.name} has requested a ${booking.sessionType.toLowerCase()} session with you.`;
        
        if (booking.sessionType === 'ONLINE' && meetingLink) {
          tutorNotificationTitle = 'New Online Session Booking with Google Meet Link';
          tutorNotificationMessage = `${student.name} has booked an online session with you.`;
        }

        const tutorNotification = {
          id: `notification-${Date.now()}-tutor`,
          userId: tutor.userId,
          type: 'BOOKING_REQUEST' as const,
          title: tutorNotificationTitle,
          message: tutorNotificationMessage,
          data: {
            bookingId: addedBooking.id,
            studentName: student.name,
            sessionType: booking.sessionType,
            startTime: booking.startAtUTC,
            endTime: booking.endAtUTC,
            priceCents: booking.priceCents,
            meetingLink: meetingLink,
            meetingId: meetingId,
            meetingPassword: meetingPassword,
            meetingInstructions: meetingDetails ? formatMeetingInstructions(meetingDetails) : null
          },
          createdAt: new Date().toISOString(),
          read: false
        };

        // Enhanced student notification
        const studentNotification = {
          id: `notification-${Date.now()}-student`,
          userId: data.studentId,
          type: 'BOOKING_CONFIRMED' as const,
          title: booking.sessionType === 'ONLINE' ? 'Online Session Booked with Google Meet Link' : 'Session Booking Confirmed',
          message: `Your ${booking.sessionType.toLowerCase()} session with ${tutorUser.name} has been confirmed.`,
          data: {
            bookingId: addedBooking.id,
            tutorName: tutorUser.name,
            sessionType: booking.sessionType,
            startTime: booking.startAtUTC,
            endTime: booking.endAtUTC,
            priceCents: booking.priceCents,
            meetingLink: meetingLink,
            meetingId: meetingId,
            meetingPassword: meetingPassword,
            meetingInstructions: meetingDetails ? formatMeetingInstructions(meetingDetails) : null,
            meetingSummary: meetingDetails ? generateMeetingSummary(meetingDetails) : null
          },
          createdAt: new Date().toISOString(),
          read: false
        };

        dataManager.addNotification(tutorNotification);
        dataManager.addNotification(studentNotification);

        console.log('Enhanced notifications sent with Google Meet details');
      }
    } catch (notificationError) {
      console.error('Error sending enhanced booking notifications:', notificationError);
      // Don't fail the booking creation if notifications fail
    }

    return {
      success: true,
      bookingId: addedBooking.id,
      booking: {
        ...addedBooking,
        meetingLink,
        meetingId,
        meetingPassword,
        meetingDetails,
        notificationsSent: true
      }
    };

  } catch (error) {
    console.error('Error creating booking:', error);
    return {
      success: false,
      error: 'Failed to create booking'
    };
  }
}

/**
 * Update booking status
 * @param bookingId - The booking ID
 * @param status - New status
 * @param updatedBy - User ID who updated the booking
 * @param reason - Reason for status change
 * @returns Promise<BookingResult>
 */
export async function updateBookingStatus(
  bookingId: string,
  status: string,
  updatedBy: string,
  reason?: string
): Promise<BookingResult> {
  try {
    const booking = dataManager.getBookingById(bookingId);
    if (!booking) {
      return {
        success: false,
        error: 'Booking not found'
      };
    }

    // Update booking status
    const success = dataManager.updateBookingWithNotification(bookingId, {
      status,
      updatedAt: new Date().toISOString(),
      statusReason: reason || null
    }, updatedBy);

    if (!success) {
      return {
        success: false,
        error: 'Failed to update booking status'
      };
    }

    return {
      success: true,
      bookingId
    };

  } catch (result) {
    console.error('Error updating booking status:', error);
    return {
      success: false,
      error: 'Failed to update booking status'
    };
  }
}

/**
 * Get booking by ID
 * @param bookingId - The booking ID
 * @returns Promise<any>
 */
export async function getBookingById(bookingId: string): Promise<any> {
  try {
    return dataManager.getBookingById(bookingId);
  } catch (error) {
    console.error('Error getting booking by ID:', error);
    return null;
  }
}

/**
 * Get bookings for a specific tutor
 * @param tutorId - The tutor ID
 * @returns Promise<any[]>
 */
export async function getBookingsByTutorId(tutorId: string): Promise<any[]> {
  try {
    const allBookings = dataManager.getAllBookings();
    return allBookings.filter(booking => booking.tutorId === tutorId);
  } catch (error) {
    console.error('Error getting bookings by tutor ID:', error);
    return [];
  }
}

/**
 * Get bookings for a specific student
 * @param studentId - The student ID
 * @returns Promise<any[]>
 */
export async function getBookingsByStudentId(studentId: string): Promise<any[]> {
  try {
    const allBookings = dataManager.getAllBookings();
    return allBookings.filter(booking => booking.studentId === studentId);
  } catch (error) {
    console.error('Error getting bookings by student ID:', error);
    return [];
  }
}
