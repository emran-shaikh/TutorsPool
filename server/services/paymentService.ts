import Stripe from 'stripe';
import { stripe, stripeConfig, PaymentStatus, PayoutStatus, DisputeStatus } from '../config/stripe';
import { DataManager } from '../dataManager';

export class PaymentService {
  private dataManager: DataManager;

  constructor(dataManager: DataManager) {
    this.dataManager = dataManager;
  }

  // Create payment intent for a booking
  async createPaymentIntent(bookingId: string, amount: number, currency: string = 'usd') {
    try {
      const booking = this.dataManager.getBookingById(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      const student = this.dataManager.getUserById(booking.studentId);
      const tutor = this.dataManager.getTutorById(booking.tutorId);
      
      if (!student || !tutor) {
        throw new Error('Student or tutor not found');
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          bookingId: bookingId,
          studentId: booking.studentId,
          tutorId: booking.tutorId,
          subject: booking.subject,
          sessionDate: booking.sessionDate,
          platform: 'tutorspool'
        },
        description: `Tutoring session: ${booking.subject} with ${tutor.user?.name}`,
        receipt_email: student.email,
      });

      // Create payment record
      const payment = {
        id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        bookingId: bookingId,
        studentId: booking.studentId,
        tutorId: booking.tutorId,
        amount: amount,
        currency: currency,
        stripePaymentIntentId: paymentIntent.id,
        status: PaymentStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          subject: booking.subject,
          sessionDate: booking.sessionDate,
          platformFee: amount * stripeConfig.platformFeePercentage,
          tutorAmount: amount * (1 - stripeConfig.platformFeePercentage)
        }
      };

      this.dataManager.addPayment(payment);

      return {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status
        },
        payment: payment
      };

    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Confirm payment and process payout
  async confirmPayment(paymentIntentId: string) {
    try {
      const payment = this.dataManager.getPaymentByStripeId(paymentIntentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Retrieve payment intent from Stripe
      const stripePaymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (stripePaymentIntent.status === 'succeeded') {
        // Update payment status
        payment.status = PaymentStatus.COMPLETED;
        payment.updatedAt = new Date().toISOString();
        payment.stripeChargeId = stripePaymentIntent.latest_charge as string;

        // Create payout record for tutor
        const payout = {
          id: `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          paymentId: payment.id,
          tutorId: payment.tutorId,
          amount: payment.metadata.tutorAmount,
          currency: payment.currency,
          status: PayoutStatus.PENDING,
          holdUntil: new Date(Date.now() + stripeConfig.holdPeriodDays * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            platformFee: payment.metadata.platformFee,
            subject: payment.metadata.subject,
            sessionDate: payment.metadata.sessionDate
          }
        };

        this.dataManager.addPayout(payout);
        this.dataManager.updatePayment(payment);

        // Update booking status
        const booking = this.dataManager.getBookingById(payment.bookingId);
        if (booking) {
          booking.status = 'CONFIRMED';
          booking.paymentStatus = 'PAID';
          this.dataManager.updateBooking(booking);
        }

        return {
          success: true,
          payment: payment,
          payout: payout
        };
      } else {
        payment.status = PaymentStatus.FAILED;
        payment.updatedAt = new Date().toISOString();
        this.dataManager.updatePayment(payment);

        return {
          success: false,
          error: 'Payment not succeeded',
          payment: payment
        };
      }

    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  // Process tutor payout
  async processTutorPayout(payoutId: string, adminApproval: boolean = false) {
    try {
      const payout = this.dataManager.getPayoutById(payoutId);
      if (!payout) {
        throw new Error('Payout not found');
      }

      if (!adminApproval) {
        // Check if hold period has passed
        const holdUntil = new Date(payout.holdUntil);
        if (holdUntil > new Date()) {
          throw new Error('Payout is still on hold');
        }
      }

      // Create Stripe transfer to tutor's account
      const tutor = this.dataManager.getTutorById(payout.tutorId);
      if (!tutor || !tutor.stripeAccountId) {
        throw new Error('Tutor Stripe account not found');
      }

      const transfer = await stripe.transfers.create({
        amount: Math.round(payout.amount * 100),
        currency: payout.currency,
        destination: tutor.stripeAccountId,
        metadata: {
          payoutId: payout.id,
          tutorId: payout.tutorId,
          paymentId: payout.paymentId
        }
      });

      // Update payout status
      payout.status = PayoutStatus.PAID;
      payout.stripeTransferId = transfer.id;
      payout.paidAt = new Date().toISOString();
      payout.updatedAt = new Date().toISOString();

      this.dataManager.updatePayout(payout);

      return {
        success: true,
        payout: payout,
        transfer: transfer
      };

    } catch (error) {
      console.error('Error processing payout:', error);
      throw error;
    }
  }

  // Handle refund
  async processRefund(paymentId: string, amount?: number, reason?: string) {
    try {
      const payment = this.dataManager.getPaymentById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      const refundAmount = amount || payment.amount;
      
      // Create Stripe refund
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: Math.round(refundAmount * 100),
        reason: reason || 'requested_by_customer',
        metadata: {
          paymentId: payment.id,
          bookingId: payment.bookingId,
          reason: reason || 'refund'
        }
      });

      // Update payment status
      payment.status = PaymentStatus.REFUNDED;
      payment.refundId = refund.id;
      payment.refundAmount = refundAmount;
      payment.updatedAt = new Date().toISOString();

      this.dataManager.updatePayment(payment);

      // Update booking status
      const booking = this.dataManager.getBookingById(payment.bookingId);
      if (booking) {
        booking.status = 'REFUNDED';
        booking.paymentStatus = 'REFUNDED';
        this.dataManager.updateBooking(booking);
      }

      return {
        success: true,
        refund: refund,
        payment: payment
      };

    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  // Handle dispute
  async handleDispute(disputeId: string, status: DisputeStatus, adminNotes?: string) {
    try {
      const dispute = this.dataManager.getDisputeById(disputeId);
      if (!dispute) {
        throw new Error('Dispute not found');
      }

      dispute.status = status;
      dispute.updatedAt = new Date().toISOString();
      
      if (adminNotes) {
        dispute.adminNotes = adminNotes;
      }

      this.dataManager.updateDispute(dispute);

      // If dispute is resolved in favor of student, process refund
      if (status === DisputeStatus.RESOLVED && dispute.resolution === 'STUDENT_WINS') {
        await this.processRefund(dispute.paymentId, undefined, 'Dispute resolved in favor of student');
      }

      return {
        success: true,
        dispute: dispute
      };

    } catch (error) {
      console.error('Error handling dispute:', error);
      throw error;
    }
  }

  // Get payment analytics
  async getPaymentAnalytics(startDate?: string, endDate?: string) {
    try {
      const payments = this.dataManager.getAllPayments();
      const payouts = this.dataManager.getAllPayouts();
      const disputes = this.dataManager.getAllDisputes();

      let filteredPayments = payments;
      let filteredPayouts = payouts;
      let filteredDisputes = disputes;

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        filteredPayments = payments.filter(p => {
          const date = new Date(p.createdAt);
          return date >= start && date <= end;
        });
        
        filteredPayouts = payouts.filter(p => {
          const date = new Date(p.createdAt);
          return date >= start && date <= end;
        });
        
        filteredDisputes = disputes.filter(d => {
          const date = new Date(d.createdAt);
          return date >= start && date <= end;
        });
      }

      const totalRevenue = filteredPayments
        .filter(p => p.status === PaymentStatus.COMPLETED)
        .reduce((sum, p) => sum + p.amount, 0);

      const totalPayouts = filteredPayouts
        .filter(p => p.status === PayoutStatus.PAID)
        .reduce((sum, p) => sum + p.amount, 0);

      const platformFees = filteredPayments
        .filter(p => p.status === PaymentStatus.COMPLETED)
        .reduce((sum, p) => sum + p.metadata.platformFee, 0);

      const pendingPayouts = filteredPayouts
        .filter(p => p.status === PayoutStatus.PENDING)
        .reduce((sum, p) => sum + p.amount, 0);

      const openDisputes = filteredDisputes.filter(d => d.status === DisputeStatus.OPEN).length;

      return {
        success: true,
        analytics: {
          totalRevenue,
          totalPayouts,
          platformFees,
          pendingPayouts,
          openDisputes,
          paymentCount: filteredPayments.length,
          payoutCount: filteredPayouts.length,
          disputeCount: filteredDisputes.length,
          averagePaymentAmount: filteredPayments.length > 0 ? totalRevenue / filteredPayments.length : 0,
          successRate: filteredPayments.length > 0 ? 
            (filteredPayments.filter(p => p.status === PaymentStatus.COMPLETED).length / filteredPayments.length) * 100 : 0
        }
      };

    } catch (error) {
      console.error('Error getting payment analytics:', error);
      throw error;
    }
  }
}
