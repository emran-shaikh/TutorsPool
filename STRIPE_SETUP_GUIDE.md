# 💳 Stripe Payment Integration Guide

## ✅ Your Stripe Keys

Your Stripe test keys have been configured:

```bash
# Test Keys (for development/testing)
STRIPE_SECRET_KEY=sk_test_51SMjtW2KWM3gO8YuexcjxdbiUgnsGXlRAtDbEK3fxVUZv4mPGVE8BWmr8M8gvElue1FPm1C76OJma69EadrNkxQ000e1kUzs9Z
STRIPE_PUBLISHABLE_KEY=pk_test_51SMjtW2KWM3gO8Yuog9nvAQU3fGH32asuQp4F3BXPKcKbkRJVJGkNjpZEOqgAGHeJe0EQu9poO020OgEEEOT8tfj00xu4sAb6J
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SMjtW2KWM3gO8Yuog9nvAQU3fGH32asuQp4F3BXPKcKbkRJVJGkNjpZEOqgAGHeJe0EQu9poO020OgEEEOT8tfj00xu4sAb6J
```

## 🎯 Environment Setup

### For Vercel Production

Add these to Vercel Dashboard → Settings → Environment Variables:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_51SMjtW2KWM3gO8YuexcjxdbiUgnsGXlRAtDbEK3fxVUZv4mPGVE8BWmr8M8gvElue1FPm1C76OJma69EadrNkxQ000e1kUzs9Z
STRIPE_PUBLISHABLE_KEY=pk_test_51SMjtW2KWM3gO8Yuog9nvAQU3fGH32asuQp4F3BXPKcKbkRJVJGkNjpZEOqgAGHeJe0EQu9poO020OgEEEOT8tfj00xu4sAb6J
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SMjtW2KWM3gO8Yuog9nvAQU3fGH32asuQp4F3BXPKcKbkRJVJGkNjpZEOqgAGHeJe0EQu9poO020OgEEEOT8tfj00xu4sAb6J
```

**Important**: Check ✅ Production, ✅ Preview, ✅ Development for each variable

### For Local Development

Create/update `.env.local`:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SMjtW2KWM3gO8Yuog9nvAQU3fGH32asuQp4F3BXPKcKbkRJVJGkNjpZEOqgAGHeJe0EQu9poO020OgEEEOT8tfj00xu4sAb6J
STRIPE_SECRET_KEY=sk_test_51SMjtW2KWM3gO8YuexcjxdbiUgnsGXlRAtDbEK3fxVUZv4mPGVE8BWmr8M8gvElue1FPm1C76OJma69EadrNkxQ000e1kUzs9Z
```

## 🔧 Stripe Webhook Setup

### 1. Create Webhook in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter endpoint URL:
   - **Local**: `http://localhost:5174/api/webhooks/stripe`
   - **Production**: `https://tutorspool.com/api/webhooks/stripe`
4. Select events to listen for:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. Click "Add endpoint"
6. Copy the webhook signing secret (starts with `whsec_`)

### 2. Add Webhook Secret to Environment

```bash
# Add to Vercel
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 🧪 Testing Stripe Integration

### Test Cards

Use these test cards in Stripe test mode:

| Card Number | Description | Expected Result |
|-------------|-------------|-----------------|
| `4242 4242 4242 4242` | Visa | Success |
| `4000 0025 0000 3155` | Visa (requires authentication) | Success with 3D Secure |
| `4000 0000 0000 9995` | Visa | Declined |
| `5555 5555 5555 4444` | Mastercard | Success |
| `3782 822463 10005` | American Express | Success |

**Test Details:**
- **Expiry**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### Test Payment Flow

1. **Create Payment Intent**
   ```bash
   curl -X POST https://tutorspool.com/api/payments/create-intent \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{
       "amount": 5000,
       "currency": "usd",
       "description": "Tutoring session payment"
     }'
   ```

2. **Complete Payment**
   - Use test card: `4242 4242 4242 4242`
   - Enter any future expiry date
   - Enter any CVC
   - Payment should succeed

3. **Verify Webhook**
   - Check Stripe Dashboard → Developers → Webhooks
   - Verify webhook was triggered
   - Check Vercel function logs for webhook processing

## 💰 Payment Features in TutorsPool

### 1. Tutor Booking Payments
- Students pay for tutoring sessions
- Amount based on tutor's hourly rate
- Payment processed before booking confirmation

### 2. Subscription Plans (Optional)
- Monthly/yearly subscriptions for premium features
- Automatic recurring billing
- Subscription management in user dashboard

### 3. Platform Fees
- Platform takes a percentage of each transaction
- Configurable in settings
- Automatic split payments to tutors

## 🔐 Security Best Practices

### ✅ Do's
- ✅ Always use HTTPS in production
- ✅ Validate webhook signatures
- ✅ Store secret key server-side only
- ✅ Use publishable key in frontend
- ✅ Implement idempotency keys
- ✅ Log all payment events
- ✅ Handle errors gracefully

### ❌ Don'ts
- ❌ Never expose secret key in frontend
- ❌ Don't store card details yourself
- ❌ Don't skip webhook signature verification
- ❌ Don't use test keys in production
- ❌ Don't hardcode amounts in frontend

## 🚀 Going Live (Production)

### 1. Get Live API Keys

1. Go to: https://dashboard.stripe.com/apikeys
2. Toggle to "Live mode" (top right)
3. Copy your live keys:
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...`

### 2. Update Environment Variables

In Vercel Dashboard, update:

```bash
# Replace test keys with live keys
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
```

### 3. Create Production Webhook

1. Go to: https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://tutorspool.com/api/webhooks/stripe`
3. Select same events as test webhook
4. Copy webhook secret
5. Add to Vercel: `STRIPE_WEBHOOK_SECRET=whsec_...`

### 4. Activate Your Account

1. Complete Stripe account verification
2. Add business details
3. Add bank account for payouts
4. Enable payment methods

### 5. Test in Production

- Make a small real payment ($0.50)
- Verify webhook triggers
- Check payment appears in Stripe Dashboard
- Verify payout schedule

## 📊 Monitoring Payments

### Stripe Dashboard
- **Payments**: https://dashboard.stripe.com/payments
- **Customers**: https://dashboard.stripe.com/customers
- **Subscriptions**: https://dashboard.stripe.com/subscriptions
- **Webhooks**: https://dashboard.stripe.com/webhooks
- **Logs**: https://dashboard.stripe.com/logs

### Vercel Function Logs
- Go to Vercel Dashboard → Functions
- Monitor webhook processing
- Check for errors

### Key Metrics to Monitor
- ✅ Payment success rate
- ✅ Failed payment reasons
- ✅ Webhook delivery success
- ✅ Average transaction amount
- ✅ Refund rate

## 🐛 Common Issues & Solutions

### Issue: "No such customer"
**Solution**: Create customer before creating payment intent
```javascript
const customer = await stripe.customers.create({
  email: user.email,
  name: user.name
});
```

### Issue: "Invalid API Key"
**Solution**: 
- Verify key is correct
- Check if using test key in production or vice versa
- Ensure key starts with `sk_` (secret) or `pk_` (publishable)

### Issue: Webhook signature verification fails
**Solution**:
- Verify webhook secret is correct
- Check raw body is being passed to verification
- Ensure no middleware modifies request body

### Issue: Payment succeeds but webhook not received
**Solution**:
- Check webhook endpoint is accessible
- Verify webhook URL is correct
- Check Stripe webhook logs for delivery attempts
- Ensure endpoint returns 200 status

## 📚 Stripe Resources

- **Documentation**: https://stripe.com/docs
- **API Reference**: https://stripe.com/docs/api
- **Testing**: https://stripe.com/docs/testing
- **Webhooks**: https://stripe.com/docs/webhooks
- **Security**: https://stripe.com/docs/security
- **Support**: https://support.stripe.com/

## ✅ Integration Checklist

Before going live:

- [ ] Test keys working in development
- [ ] Payment flow tested with test cards
- [ ] Webhook endpoint created and tested
- [ ] Webhook signature verification implemented
- [ ] Error handling implemented
- [ ] Payment success/failure UI feedback
- [ ] Receipt emails configured
- [ ] Refund functionality tested
- [ ] Live keys obtained from Stripe
- [ ] Production webhook created
- [ ] Stripe account fully activated
- [ ] Bank account added for payouts
- [ ] Real payment tested in production
- [ ] Monitoring and logging set up

## 🎯 Next Steps

1. **Add to Vercel**: Copy environment variables to Vercel Dashboard
2. **Test Locally**: Test payment flow with test cards
3. **Deploy**: Push changes and deploy to Vercel
4. **Test Production**: Verify payments work in production
5. **Go Live**: Switch to live keys when ready

---

**Status**: ✅ Stripe Keys Configured  
**Mode**: Test Mode (Ready for Development)  
**Next**: Add environment variables to Vercel and test payment flow
