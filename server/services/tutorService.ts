import { hybridDataManager } from './hybridDataManager';
import { dataManager } from '../dataManager';

interface AvailabilityBlock {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTimeUTC: string; // Format: "HH:MM"
  endTimeUTC: string; // Format: "HH:MM"
  isRecurring: boolean;
}

interface Booking {
  id: string;
  tutorId: string;
  startAtUTC: string; // ISO string
  endAtUTC: string; // ISO string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED' | 'PENDING_PAYMENT';
}

interface AvailabilityCheckResult {
  isAvailable: boolean;
  reason?: string;
  conflictingBookings?: Booking[];
}

/**
 * Check if a tutor is available for a specific time slot
 * @param tutorId - The tutor's ID
 * @param startTime - The requested start time
 * @param duration - Duration in minutes
 * @returns Promise<AvailabilityCheckResult>
 */
export async function checkTutorAvailability(
  tutorId: string, 
  startTime: Date, 
  duration: number
): Promise<AvailabilityCheckResult> {
  try {
    console.log(`Checking availability for tutor ${tutorId} at ${startTime.toISOString()} for ${duration} minutes`);

    // Get tutor profile with availability blocks
    const tutor = await hybridDataManager.getTutorByUserId(tutorId);
    if (!tutor) {
      return {
        isAvailable: false,
        reason: 'Tutor not found'
      };
    }

    // Get tutor's availability blocks
    const availabilityBlocks: AvailabilityBlock[] = tutor.availabilityBlocks || [];
    if (availabilityBlocks.length === 0) {
      return {
        isAvailable: false,
        reason: 'Tutor has no availability set'
      };
    }

    // Calculate end time
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    // Check if the requested time falls within any availability block
    const dayOfWeek = startTime.getDay();
    const startTimeStr = startTime.toISOString().substr(11, 5); // Extract HH:MM
    const endTimeStr = endTime.toISOString().substr(11, 5); // Extract HH:MM

    console.log(`Checking day ${dayOfWeek}, time ${startTimeStr}-${endTimeStr}`);

    // Find matching availability block
    const matchingBlock = availabilityBlocks.find(block => 
      block.dayOfWeek === dayOfWeek &&
      block.startTimeUTC <= startTimeStr &&
      block.endTimeUTC >= endTimeStr
    );

    if (!matchingBlock) {
      return {
        isAvailable: false,
        reason: 'Requested time is outside tutor availability'
      };
    }

    // Get existing bookings for this tutor
    const existingBookings = await getTutorBookings(tutorId);
    
    // Check for conflicts with existing bookings
    const conflictingBookings = existingBookings.filter(booking => {
      if (booking.status === 'CANCELLED' || booking.status === 'REFUNDED') {
        return false; // Ignore cancelled/refunded bookings
      }

      const bookingStart = new Date(booking.startAtUTC);
      const bookingEnd = new Date(booking.endAtUTC);

      // Check for time overlap
      return (
        (startTime < bookingEnd && endTime > bookingStart)
      );
    });

    if (conflictingBookings.length > 0) {
      console.log(`Found ${conflictingBookings.length} conflicting bookings`);
      return {
        isAvailable: false,
        reason: 'Time slot conflicts with existing booking',
        conflictingBookings
      };
    }

    console.log('Tutor is available for the requested time slot');
    return {
      isAvailable: true
    };

  } catch (error) {
    console.error('Error checking tutor availability:', error);
    return {
      isAvailable: false,
      reason: 'Error checking availability'
    };
  }
}

/**
 * Get all bookings for a specific tutor
 * @param tutorId - The tutor's ID
 * @returns Promise<Booking[]>
 */
async function getTutorBookings(tutorId: string): Promise<Booking[]> {
  try {
    // Try to get bookings from hybrid data manager first
    const allBookings = await hybridDataManager.getAllBookings();
    const tutorBookings = allBookings.filter(booking => booking.tutorId === tutorId);
    
    return tutorBookings.map(booking => ({
      id: booking.id,
      tutorId: booking.tutorId,
      startAtUTC: booking.startAtUTC,
      endAtUTC: booking.endAtUTC,
      status: booking.status
    }));
  } catch (error) {
    console.error('Error fetching tutor bookings:', error);
    // Fallback to dataManager
    try {
      const allBookings = dataManager.getAllBookings();
      const tutorBookings = allBookings.filter(booking => booking.tutorId === tutorId);
      
      return tutorBookings.map(booking => ({
        id: booking.id,
        tutorId: booking.tutorId,
        startAtUTC: booking.startAtUTC,
        endAtUTC: booking.endAtUTC,
        status: booking.status
      }));
    } catch (fallbackError) {
      console.error('Fallback error fetching tutor bookings:', fallbackError);
      return [];
    }
  }
}

/**
 * Get tutor's available time slots for a specific date
 * @param tutorId - The tutor's ID
 * @param date - The date to check
 * @param duration - Duration in minutes
 * @returns Promise<Date[]>
 */
export async function getAvailableTimeSlots(
  tutorId: string, 
  date: Date, 
  duration: number = 60
): Promise<Date[]> {
  try {
    const tutor = await hybridDataManager.getTutorByUserId(tutorId);
    if (!tutor) {
      return [];
    }

    const availabilityBlocks: AvailabilityBlock[] = tutor.availabilityBlocks || [];
    const dayOfWeek = date.getDay();
    
    // Find availability blocks for this day
    const dayBlocks = availabilityBlocks.filter(block => block.dayOfWeek === dayOfWeek);
    
    if (dayBlocks.length === 0) {
      return [];
    }

    // Get existing bookings for this date
    const existingBookings = await getTutorBookings(tutorId);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const dayBookings = existingBookings.filter(booking => {
      const bookingDate = booking.startAtUTC.split('T')[0];
      return bookingDate === dateStr && 
             (booking.status === 'PENDING' || booking.status === 'CONFIRMED' || booking.status === 'PENDING_PAYMENT');
    });

    const availableSlots: Date[] = [];

    // Generate time slots for each availability block
    for (const block of dayBlocks) {
      const [startHour, startMinute] = block.startTimeUTC.split(':').map(Number);
      const [endHour, endMinute] = block.endTimeUTC.split(':').map(Number);
      
      const blockStart = new Date(date);
      blockStart.setHours(startHour, startMinute, 0, 0);
      
      const blockEnd = new Date(date);
      blockEnd.setHours(endHour, endMinute, 0, 0);

      // Generate 30-minute slots within this block
      const current = new Date(blockStart);
      while (current.getTime() + duration * 60 * 1000 <= blockEnd.getTime()) {
        const slotEnd = new Date(current.getTime() + duration * 60 * 1000);
        
        // Check if this slot conflicts with existing bookings
        const hasConflict = dayBookings.some(booking => {
          const bookingStart = new Date(booking.startAtUTC);
          const bookingEnd = new Date(booking.endAtUTC);
          
          return (current < bookingEnd && slotEnd > bookingStart);
        });

        if (!hasConflict) {
          availableSlots.push(new Date(current));
        }

        // Move to next 30-minute slot
        current.setMinutes(current.getMinutes() + 30);
      }
    }

    return availableSlots.sort((a, b) => a.getTime() - b.getTime());

  } catch (error) {
    console.error('Error getting available time slots:', error);
    return [];
  }
}

/**
 * Check if a specific time slot is available
 * @param tutorId - The tutor's ID
 * @param startTime - The start time
 * @param endTime - The end time
 * @returns Promise<boolean>
 */
export async function isTimeSlotAvailable(
  tutorId: string, 
  startTime: Date, 
  endTime: Date
): Promise<boolean> {
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  const result = await checkTutorAvailability(tutorId, startTime, duration);
  return result.isAvailable;
}
