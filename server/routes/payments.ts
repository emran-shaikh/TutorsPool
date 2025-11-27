import express from 'express';
import { PaymentService } from '../services/paymentService';
import { dataManager } from '../dataManager';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { stripe } from '../config/stripe';

const router = express.Router();
const paymentService = new PaymentService(dataManager);

// Create payment intent for a booking
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { bookingId, amount, currency = 'usd' } = req.body;
    const userId = (req as any).user?.userId;

    if (!bookingId || !amount) {
      return res.status(400).json({ error: 'Booking ID and amount are required' });
    }

    // Verify booking belongs to student
    const booking = dataManager.getBookingById(bookingId);
    if (!booking || booking.studentId !== userId) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }

    const result = await paymentService.createPaymentIntent(bookingId, amount, currency);
    res.json(result);

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Confirm payment
router.post('/confirm-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    const result = await paymentService.confirmPayment(paymentIntentId);
    res.json(result);

  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Get payment history for student
router.get('/student/payments', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    const payments = dataManager.getPaymentsByStudent(userId);
    
    res.json({
      success: true,
      payments: payments
    });

  } catch (error) {
    console.error('Error fetching student payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get payout history for tutor
router.get('/tutor/payouts', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    const tutor = dataManager.getTutorByUserId(userId);
    
    if (!tutor) {
      return res.status(404).json({ error: 'Tutor profile not found' });
    }

    const payouts = dataManager.getPayoutsByTutor(tutor.id);
    
    res.json({
      success: true,
      payouts: payouts
    });

  } catch (error) {
    console.error('Error fetching tutor payouts:', error);
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
});

// Request refund
router.post('/request-refund', authenticateToken, async (req, res) => {
  try {
    const { paymentId, reason } = req.body;
    const userId = (req as any).user?.userId;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    // Verify payment belongs to student
    const payment = dataManager.getPaymentById(paymentId);
    if (!payment || payment.studentId !== userId) {
      return res.status(404).json({ error: 'Payment not found or unauthorized' });
    }

    const result = await paymentService.processRefund(paymentId, undefined, reason);
    res.json(result);

  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

// Create dispute
router.post('/create-dispute', authenticateToken, async (req, res) => {
  try {
    const { paymentId, reason, description } = req.body;
    const userId = (req as any).user?.userId;

    if (!paymentId || !reason) {
      return res.status(400).json({ error: 'Payment ID and reason are required' });
    }

    // Verify payment belongs to student
    const payment = dataManager.getPaymentById(paymentId);
    if (!payment || payment.studentId !== userId) {
      return res.status(404).json({ error: 'Payment not found or unauthorized' });
    }

    const dispute = {
      id: `dispute_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentId: paymentId,
      studentId: userId,
      tutorId: payment.tutorId,
      reason: reason,
      description: description,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminNotes: null,
      resolution: null
    };

    dataManager.addDispute(dispute);

    // Create notification for admin
    dataManager.addNotification({
      userId: 'admin', // Notify all admins
      type: 'DISPUTE_CREATED',
      title: 'New Payment Dispute',
      message: `Student ${dataManager.getUserById(userId)?.name} has created a dispute for payment ${paymentId}`,
      data: { disputeId: dispute.id, paymentId: paymentId },
      read: false
    });

    res.json({
      success: true,
      dispute: dispute
    });

  } catch (error) {
    console.error('Error creating dispute:', error);
    res.status(500).json({ error: 'Failed to create dispute' });
  }
});

// Get disputes for student
router.get('/student/disputes', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    const disputes = dataManager.getDisputesByStudent(userId);
    
    res.json({
      success: true,
      disputes: disputes
    });

  } catch (error) {
    console.error('Error fetching student disputes:', error);
    res.status(500).json({ error: 'Failed to fetch disputes' });
  }
});

// Get disputes for tutor
router.get('/tutor/disputes', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    const tutor = dataManager.getTutorByUserId(userId);
    
    if (!tutor) {
      return res.status(404).json({ error: 'Tutor profile not found' });
    }

    const disputes = dataManager.getDisputesByTutor(tutor.id);
    
    res.json({
      success: true,
      disputes: disputes
    });

  } catch (error) {
    console.error('Error fetching tutor disputes:', error);
    res.status(500).json({ error: 'Failed to fetch disputes' });
  }
});

// Admin endpoints
router.get('/admin/payments', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const payments = dataManager.getAllPayments();
    
    res.json({
      success: true,
      payments: payments
    });

  } catch (error) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

router.get('/admin/payouts', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const payouts = dataManager.getAllPayouts();
    
    res.json({
      success: true,
      payouts: payouts
    });

  } catch (error) {
    console.error('Error fetching all payouts:', error);
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
});

router.get('/admin/disputes', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const disputes = dataManager.getAllDisputes();
    
    res.json({
      success: true,
      disputes: disputes
    });

  } catch (error) {
    console.error('Error fetching all disputes:', error);
    res.status(500).json({ error: 'Failed to fetch disputes' });
  }
});

// Admin: Process payout
router.post('/admin/process-payout', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { payoutId } = req.body;

    if (!payoutId) {
      return res.status(400).json({ error: 'Payout ID is required' });
    }

    const result = await paymentService.processTutorPayout(payoutId, true);
    res.json(result);

  } catch (error) {
    console.error('Error processing payout:', error);
    res.status(500).json({ error: 'Failed to process payout' });
  }
});

// Admin: Handle dispute
router.post('/admin/handle-dispute', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { disputeId, status, adminNotes, resolution } = req.body;

    if (!disputeId || !status) {
      return res.status(400).json({ error: 'Dispute ID and status are required' });
    }

    const dispute = dataManager.getDisputeById(disputeId);
    if (!dispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    dispute.status = status;
    dispute.adminNotes = adminNotes;
    dispute.resolution = resolution;
    dispute.updatedAt = new Date().toISOString();

    dataManager.updateDispute(dispute);

    // If dispute is resolved, process accordingly
    if (status === 'RESOLVED') {
      await paymentService.handleDispute(disputeId, status, adminNotes);
    }

    res.json({
      success: true,
      dispute: dispute
    });

  } catch (error) {
    console.error('Error handling dispute:', error);
    res.status(500).json({ error: 'Failed to handle dispute' });
  }
});

// Admin: Get payment analytics
router.get('/admin/analytics', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const result = await paymentService.getPaymentAnalytics(
      startDate as string,
      endDate as string
    );
    
    res.json(result);

  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Stripe webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_1234567890abcdef';

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      
      // Confirm payment in our system
      try {
        await paymentService.confirmPayment(paymentIntent.id);
      } catch (error) {
        console.error('Error confirming payment:', error);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('PaymentIntent failed:', failedPayment.id);
      
      // Update payment status to failed
      try {
        const payment = dataManager.getPaymentByStripeId(failedPayment.id);
        if (payment) {
          payment.status = 'FAILED';
          payment.updatedAt = new Date().toISOString();
          dataManager.updatePayment(payment);
        }
      } catch (error) {
        console.error('Error updating failed payment:', error);
      }
      break;

    case 'charge.dispute.created':
      const dispute = event.data.object;
      console.log('Dispute created:', dispute.id);
      
      // Create dispute record
      try {
        const payment = dataManager.getPaymentByStripeId(dispute.payment_intent);
        if (payment) {
          const disputeRecord = {
            id: `stripe_dispute_${dispute.id}`,
            paymentId: payment.id,
            studentId: payment.studentId,
            tutorId: payment.tutorId,
            stripeDisputeId: dispute.id,
            reason: dispute.reason,
            amount: dispute.amount / 100,
            status: 'OPEN',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            adminNotes: null,
            resolution: null
          };
          
          dataManager.addDispute(disputeRecord);
          
          // Notify admin
          dataManager.addNotification({
            userId: 'admin',
            type: 'DISPUTE_CREATED',
            title: 'Stripe Dispute Created',
            message: `A dispute has been created for payment ${payment.id}`,
            data: { disputeId: disputeRecord.id, paymentId: payment.id },
            read: false
          });
        }
      } catch (error) {
        console.error('Error creating dispute record:', error);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

export default router;
