import Stripe from 'stripe';

// Stripe configuration for sandbox mode
export const stripeConfig = {
  // Use test keys for sandbox mode
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdef',
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_51234567890abcdef',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_1234567890abcdef',
  
  // Platform settings
  platformFeePercentage: 0.10, // 10% platform fee
  minimumPayoutAmount: 50, // $50 minimum payout
  holdPeriodDays: 7, // 7 days hold period for disputes
  
  // Currency settings
  currency: 'usd',
  supportedCurrencies: ['usd', 'eur', 'gbp', 'cad'],
  
  // Payment methods
  paymentMethods: ['card', 'bank_transfer'],
  
  // Sandbox mode
  isSandbox: true,
  sandboxMode: {
    testCards: {
      success: '4242424242424242',
      decline: '4000000000000002',
      insufficientFunds: '4000000000009995',
      expired: '4000000000000069'
    }
  }
};

// Initialize Stripe instance
export const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: '2024-06-20',
  typescript: true,
});

// Payment statuses
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED'
}

// Payout statuses
export enum PayoutStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD'
}

// Dispute statuses
export enum DisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}
