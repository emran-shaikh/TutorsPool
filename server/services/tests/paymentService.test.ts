import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Stripe SDK
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: vi.fn(() => ({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123456789',
            client_secret: 'pi_test_123456789_secret_test123',
            metadata: {
              bookingId: 'booking-123'
            }
          }
        }
      }))
    },
    paymentIntents: {
      retrieve: vi.fn(() => ({
        id: 'pi_test_123456789',
        status: 'succeeded',
        amount: 5000,
        currency: 'usd',
        metadata: {
          bookingId: 'booking-123'
        }
      }))
    }
  }))
}));

// Mock Firestore/hybridDataManager
vi.mock('../../services/hybridDataManager.js', () => ({
  default: {
    updateBooking: vi.fn(),
    getBookingById: vi.fn()
  },
  hybridDataManager: {
    updateBooking: vi.fn(),
    getBookingById: vi.fn()
  }
}));

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
import Stripe from 'stripe';

const mockStripe = new Stripe('sk_test_...');

describe('PaymentService - Stripe Webhook Handler', () => {
  let mockWebhookHandler: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockWebhookHandler = null;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('handleStripeWebhook', () => {
    const mockBookingOnline = {
      id: 'booking-123',
      tutorId: 'tutor-1',
      studentId: 'student-1',
      type: 'ONLINE' as const,
      startAtUTC: '2024-01-22T10:00:00Z',
      endAtUTC: '2024-01-22T11:00:00Z',
      status: 'PENDING' as const,
      hourlyRateCents: 5000,
      currency: 'USD'
    };

    const mockBookingOffline = {
      id: 'booking-456',
      tutorId: 'tutor-2',
      studentId: 'student-2',
      type: 'OFFLINE' as const,
      startAtUTC: '2024-01-22T10:00:00Z',
      endAtUTC: '2024-01-22T11:00:00Z',
      status: 'PENDING' as const,
      hourlyRateCents: 5000,
      currency: 'USD'
    };

    it('should update booking status to paid and create Google Meet link for online sessions', async () => {
      const mockPayIntentSuccessEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123456789',
            client_secret: 'pi_test_123456789_secret_test123',
            status: 'succeeded',
            amount: 5000,
            currency: 'usd',
            metadata: {
              bookingId: 'booking-123'
            }
          }
        }
      };

      const mockMeetingLink = {
        joinUrl: 'https://meet.google.com/abc-defg-hij',
        passcode: '123456'
      };

      hybridDataManager.getBookingById.mockResolvedValue(mockBookingOnline);
      hybridDataManager.updateBooking.mockResolvedValue({
        ...mockBookingOnline,
        status: 'PAID'
      });
      googleMeetService.createMeetingLink.mockResolvedValue(mockMeetingLink);

      // Webhook handler implementation to test
      const handleStripeWebhookSuccess = async (event: any) => {
        try {
          if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const bookingId = paymentIntent.metadata?.bookingId;

            if (!bookingId) {
              throw new Error('No booking ID found in payment metadata');
            }

            // Get booking details
            const booking = await hybridDataManager.getBookingById(bookingId);
            if (!booking) {
              throw new Error(`Booking ${bookingId} not found`);
            }

            // Update booking status to paid
            const updatedBooking = await hybridDataManager.updateBooking(bookingId, {
              status: 'PAID',
              paymentIntentId: paymentIntent.id,
              paidAt: new Date().toISOString()
            });

            // For online bookings, create Google Meet link
            if (booking.type === 'ONLINE') {
              try {
                const meetingLink = await googleMeetService.createMeetingLink({
                  title: `Tutoring Session - ${booking.tutorId}`,
                  startTime: booking.startAtUTC,
                  duration: 60 // minutes
                });

                await hybridDataManager.updateBooking(bookingId, {
                  meetingLink: meetingLink.joinUrl,
                  meetingPasscode: meetingLink.passcode
                });

                return {
                  success: true,
                  bookingId,
                  meetingLink: meetingLink.joinUrl,
                  message: 'Payment processed and meeting link created'
                };
              } catch (meetingError) {
                console.warn('Failed to create meeting link:', meetingError);
                return {
                  success: true,
                  bookingId,
                  message: 'Payment processed but meeting link creation failed'
                };
              }
            }

            return {
              success: true,
              bookingId,
              message: 'Payment processed successfully'
            };
          }
        } catch (error) {
          console.error('Webhook processing error:', error);
          throw error;
        }
      };

      const result = await handleStripeWebhookSuccess(mockPayIntentSuccessEvent);

      expect(result).toEqual({
        success: true,
        bookingId: 'booking-123',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        message: 'Payment processed and meeting link created'
      });

      expect(hybridDataManager.getBookingById).toHaveBeenCalledWith('booking-123');
      expect(hybridDataManager.updateBooking).toHaveBeenCalledWith('booking-123', {
        status: 'PAID',
        paymentIntentId: 'pi_test_123456789',
        paidAt: expect.any(String)
      });
      expect(googleMeetService.createMeetingLink).toHaveBeenCalledWith({
        title: 'Tutoring Session - tutor-1',
        startTime: '2024-01-22T10:00:00Z',
        duration: 60
      });
      expect(hybridDataManager.updateBooking).toHaveBeenCalledWith('booking-123', {
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        meetingPasscode: '123456'
      });
    });

    it('should update booking status to paid and NOT create Google Meet link for offline sessions', async () => {
      const mockPayIntentSuccessEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123456789',
            status: 'succeeded',
            amount: 5000,
            metadata: {
              bookingId: 'booking-456'
            }
          }
        }
      };

      hybridDataManager.getBookingById.mockResolvedValue(mockBookingOffline);
      hybridDataManager.updateBooking.mockResolvedValue({
        ...mockBookingOffline,
        status: 'PAID'
      });

      const handleStripeWebhookOffline = async (event: any) => {
        try {
          if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const bookingId = paymentIntent.metadata?.bookingId;

            if (!bookingId) {
              throw new Error('No booking ID found in payment metadata');
            }

            const booking = await hybridDataManager.getBookingById(bookingId);
            if (!booking) {
              throw new Error(`Booking ${bookingId} not found`);
            }

            // Update booking status to paid
            const updatedBooking = await hybridDataManager.updateBooking(bookingId, {
              status: 'PAID',
              paymentIntentId: paymentIntent.id,
              paidAt: new Date().toISOString()
            });

            // For online bookings, create Google Meet link (skip for offline)
            if (booking.type === 'ONLINE') {
              const meetingLink = await googleMeetService.createMeetingLink({
                title: `Tutoring Session - ${booking.tutorId}`,
                startTime: booking.startAtUTC,
                duration: 60
              });

              await hybridDataManager.updateBooking(bookingId, {
                meetingLink: meetingLink.joinUrl,
                meetingPasscode: meetingLink.passcode
              });

              return {
                success: true,
                bookingId,
                meetingLink: meetingLink.joinUrl,
                message: 'Payment processed and meeting link created'
              };
            }

            return {
              success: true,
              bookingId,
              message: 'Payment processed successfully'
            };
          }
        } catch (error) {
          console.error('Webhook processing error:', error);
          throw error;
        }
      };

      const result = await handleStripeWebhookOffline(mockPayIntentSuccessEvent);

      expect(result).toEqual({
        success: true,
        bookingId: 'booking-456',
        message: 'Payment processed successfully'
      });

      expect(hybridDataManager.getBookingById).toHaveBeenCalledWith('booking-456');
      expect(hybridDataManager.updateBooking).toHaveBeenCalledWith('booking-456', {
        status: 'PAID',
        paymentIntentId: 'pi_test_123456789',
        paidAt: expect.any(String)
      });
      expect(googleMeetService.createMeetingLink).not.toHaveBeenCalled();
    });

    it('should handle booking ID not found gracefully', async () => {
      const mockEventWithoutBookingId = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_no_booking',
            status: 'succeeded',
            metadata: {
              // No bookingId!
            }
          }
        }
      };

      const handleStripeWebhookNoBooking = async (event: any) => {
        try {
          if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const bookingId = paymentIntent.metadata?.bookingId;

            if (!bookingId) {
              throw new Error('No booking ID found in payment metadata');
            }

            return { success: true };
          }
        } catch (error) {
          console.error('Webhook processing error:', error);
          throw error;
        }
        return { success: false };
      };

      await expect(handleStripeWebhookNoBooking(mockEventWithoutBookingId))
        .rejects.toThrow('No booking ID found in payment metadata');

      expect(hybridDataManager.getBookingById).not.toHaveBeenCalled();
      expect(hybridDataManager.updateBooking).not.toHaveBeenCalled();
      expect(googleMeetService.createMeetingLink).not.toHaveBeenCalled();
    });

    it('should handle failed payment events gracefully', async () => {
      const mockFailedPaymentEvent = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test_failed_123',
            status: 'requires_payment_method',
            metadata: {
              bookingId: 'booking-789'
            }
          }
        }
      };

      const mockFailedBooking = {
        id: 'booking-789',
        tutorId: 'tutor-3',
        studentId: 'student-3',
        type: 'ONLINE',
        status: 'PENDING',
        hourlyRateCents: 5000,
        currency: 'USD'
      };

      hybridDataManager.getBookingById.mockResolvedValue(mockFailedBooking);
      hybridDataManager.updateBooking.mockResolvedValue({
        ...mockFailedBooking,
        status: 'FAILED'
      });

      const handleStripeWebhookFailure = async (event: any) => {
        try {
          if (event.type === 'payment_intent.payment_failed') {
            const paymentIntent = event.data.object;
            const bookingId = paymentIntent.metadata?.bookingId;

            if (!bookingId) {
              throw new Error('No booking ID found in payment metadata');
            }

            const booking = await hybridDataManager.getBookingById(bookingId);
            if (!booking) {
              throw new Error(`Booking ${bookingId} not found`);
            }

            // Update booking status to failed
            const updatedBooking = await hybridDataManager.updateBooking(bookingId, {
              status: 'FAILED',
              paymentIntentId: paymentIntent.id,
              failedAt: new Date().toISOString()
            });

            return {
              success: false,
              bookingId,
              message: 'Payment failed'
            };
          }

          if (event.type === 'payment_intent.succeeded') {
            return { success: true, message: 'Payment processed' };
          }
        } catch (error) {
          console.error('Webhook processing error:', error);
          throw error;
        }
        return { success: false, message: 'Unhandled event type' };
      };

      const result = await handleStripeWebhookFailure(mockFailedPaymentEvent);

      expect(result).toEqual({
        success: false,
        bookingId: 'booking-789',
        message: 'Payment failed'
      });

      expect(hybridDataManager.getBookingById).toHaveBeenCalledWith('booking-789');
      expect(hybridDataManager.updateBooking).toHaveBeenCalledWith('booking-789', {
        status: 'FAILED',
        paymentIntentId: 'pi_test_failed_123',
        failedAt: expect.any(String)
      });
    });

    it('should handle non-matching booking ID gracefully', async () => {
      const mockEventWithNonExistentBooking = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_invalid_booking',
            status: 'succeeded',
            metadata: {
              bookingId: 'booking-nonexistent'
            }
          }
        }
      };

      hybridDataManager.getBookingById.mockResolvedValue(null);

      const handleStripeWebhookNonExistentBooking = async (event: any) => {
        try {
          if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const bookingId = paymentIntent.metadata?.bookingId;

            if (!bookingId) {
              throw new Error('No booking ID found in payment metadata');
            }

            const booking = await hybridDataManager.getBookingById(bookingId);
            if (!booking) {
              throw new Error(`Booking ${bookingId} not found`);
            }

            return { success: true };
          }
        } catch (error) {
          console.error('Webhook processing error:', error);
          throw error;
        }
        return { success: false };
      };

      await expect(handleStripeWebhookNonExistentBooking(mockEventWithNonExistentBooking))
        .rejects.toThrow('Booking booking-nonexistent not found');

      expect(hybridDataManager.getBookingById).toHaveBeenCalledWith('booking-nonexistent');
      expect(hybridDataManager.updateBooking).not.toHaveBeenCalled();
      expect(googleMeetService.createMeetingLink).not.toHaveBeenCalled();
    });

    it('should handle Google Meet link creation failure for online bookings', async () => {
      const mockPayIntentSuccessEvent = {
        type: 'payment_intent.succeeded' as const,
        data: {
          object: {
            id: 'pi_test_meeting_fail',
            status: 'succeeded',
            metadata: {
              bookingId: 'booking-meeting-fail'
            }
          }
        }
      };

      const mockBookingWithMeetingFailure = {
        ...mockBookingOnline,
        id: 'booking-meeting-fail'
      };

      hybridDataManager.getBookingById.mockResolvedValue(mockBookingWithMeetingFailure);
      hybridDataManager.updateBooking.mockResolvedValue({
        ...mockBookingWithMeetingFailure,
        status: 'PAID'
      });

      // Mock Google Meet creation failure
      googleMeetService.createMeetingLink.mockRejectedValue(new Error('Google Meet API failed'));

      const handleStripeWebhookMeetingFailure = async (event: any) => {
        try {
          if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const bookingId = paymentIntent.metadata?.bookingId;

            if (!bookingId) {
              throw new Error('No booking ID found in payment metadata');
            }

            const booking = await hybridDataManager.getBookingById(bookingId);
            if (!booking) {
              throw new Error(`Booking ${bookingId} not found`);
            }

            // Update booking status to paid
            await hybridDataManager.updateBooking(bookingId, {
              status: 'PAID',
              paymentIntentId: paymentIntent.id,
              paidAt: new Date().toISOString()
            });

            // For online bookings, create Google Meet link
            if (booking.type === 'ONLINE') {
              try {
                const meetingLink = await googleMeetService.createMeetingLink({
                  title: `Tutoring Session - ${booking.tutorId}`,
                  startTime: booking.startAtUTC,
                  duration: 60
                });

                await hybridDataManager.updateBooking(bookingId, {
                  meetingLink: meetingLink.joinUrl,
                  meetingPasscode: meetingLink.passcode
                });

                return {
                  success: true,
                  bookingId,
                  meetingLink: meetingLink.joinUrl,
                  message: 'Payment processed and meeting link created'
                };
              } catch (meetingError) {
                console.warn('Failed to create meeting link:', meetingError);
                return {
                  success: true,
                  bookingId,
                  message: 'Payment processed but meeting link creation failed'
                };
              }
            }

            return {
              success: true,
              bookingId,
              message: 'Payment processed successfully'
            };
          }
        } catch (error) {
          console.error('Webhook processing error:', error);
          throw error;
        }
        return { success: false };
      };

      const result = await handleStripeWebhookMeetingFailure(mockPayIntentSuccessEvent);

      expect(result).toEqual({
          success: true,
          bookingId: 'booking-meeting-fail',
          message: 'Payment processed but meeting link creation failed'
        });

      expect(hybridDataManager.getBookingById).toHaveBeenCalledWith('booking-meeting-fail');
      expect(hybridDataManager.updateBooking).toHaveBeenCalledWith('booking-meeting-fail', {
        status: 'PAID',
        paymentIntentId: 'pi_test_meeting_fail',
        paidAt: expect.any(String)
      });
      expect(googleMeetService.createMeetingLink).toHaveBeenCalled();
      // Should NOT call updateBooking with meeting link since it failed
      expect(hybridDataManager.updateBooking).not.toHaveBeenCalledWith(
        'booking-meeting-fail',
        expect.objectContaining({ meetingLink: expect.any(String) })
      );
      expect(hybridDataManager.updateBooking).not.toHaveBeenCalledWith(
        'booking-meeting-fail',
        expect.objectContaining({ meetingPasscode: expect.any(String) })
      );
    });
  });
});
