# 🚀 TutorsPool Production Deployment Guide for Vercel

This comprehensive guide will walk you through deploying TutorsPool to Vercel for production.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables Setup](#environment-variables-setup)
3. [Vercel Deployment Steps](#vercel-deployment-steps)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [Testing Production](#testing-production)
6. [Troubleshooting](#troubleshooting)
7. [Performance Optimization](#performance-optimization)

---

## 🔧 Prerequisites

Before deploying, ensure you have:

- ✅ A Vercel account ([sign up here](https://vercel.com/signup))
- ✅ Vercel CLI installed globally: `npm install -g vercel`
- ✅ Git repository pushed to GitHub, GitLab, or Bitbucket
- ✅ All required API keys and credentials ready
- ✅ Firebase project configured
- ✅ Stripe account (for payments)
- ✅ Google Gemini API key (for AI chatbot)

---

## 🔐 Environment Variables Setup

### Step 1: Prepare Your Environment Variables

Copy the production environment template:

```bash
cp env.production.example .env.production.local
```

### Step 2: Fill in ALL Required Variables

Open `.env.production.local` and fill in the following **CRITICAL** variables:

#### 🔒 Security (REQUIRED)
```env
JWT_SECRET=your_production_jwt_secret_min_32_chars_long_random_string
```
> **Generate a secure JWT secret:**
> ```bash
> openssl rand -base64 32
> ```

#### 🌐 URLs (Update after first deployment)
```env
VITE_FRONTEND_URL=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app
VITE_API_URL=https://your-app.vercel.app/api
BACKEND_URL=https://your-app.vercel.app/api
```

#### 🔥 Firebase Configuration
Get these from Firebase Console > Project Settings:

**Client-side (Safe to expose):**
```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-ABC123
```

**Server-side (KEEP SECRET!):**
Get from Firebase Console > Project Settings > Service Accounts > Generate New Private Key

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=abc123keyid
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
```

#### 💳 Stripe Payment (PRODUCTION KEYS)
Get from Stripe Dashboard > Developers > API keys:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

> ⚠️ **IMPORTANT:** Use LIVE keys (pk_live_ and sk_live_) for production!

#### 🤖 AI Chatbot (Google Gemini Recommended)
Get from [Google AI Studio](https://makersuite.google.com/app/apikey):

```env
AI_PROVIDER=google
GOOGLE_AI_API_KEY=AIzaSy...
GOOGLE_AI_MODEL=gemini-pro
```

#### 💬 WhatsApp Business API (Optional)
Get from [Meta for Developers](https://developers.facebook.com/):

```env
VITE_WHATSAPP_ACCESS_TOKEN=EAAXUlG3a7GcBPg9iZCkJu0cZC6ZBvTauIFk5bx34eswoj9AY7031zegN72DxV906o6ivzRJMaVnBlUuVd4ZAOPNSei4ZA08jYCgMZCJEHtzvljGaZAMnh53xgUIqrimW8tsZAluK4PYQc5skpsLulaw2SPAEZAsFRFbPYQZCRoUPOQKeo8qmZBtXAVSh1iBD7QVZBCUttQEh8OMGqY7Fl6zO3HDMJLyLevx1zw2cnMmDVUzXkp7rXnujbDOPwemJl3AeOgZDZD
VITE_WHATSAPP_PHONE_NUMBER_ID=841145552417635
VITE_WHATSAPP_BUSINESS_ACCOUNT_ID=792592937027748
VITE_ADMIN_WHATSAPP_NUMBER=+1234567890
```

---

## 🚀 Vercel Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Click "Add New Project"**

3. **Import your Git repository**
   - Connect your GitHub/GitLab/Bitbucket account
   - Select your TutorsPool repository

4. **Configure Project Settings**
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./` (leave empty)
   - **Build Command:** `npm run vercel-build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. **Add Environment Variables**
   - Click "Environment Variables"
   - Add ALL variables from your `.env.production.local` file
   - Select **"Production"** environment for all variables
   - For sensitive variables like `JWT_SECRET`, `STRIPE_SECRET_KEY`, and `FIREBASE_PRIVATE_KEY`, mark them as "Sensitive"

6. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (2-5 minutes)

7. **Update URLs**
   - After first deployment, you'll get your Vercel URL (e.g., `https://tutorspool.vercel.app`)
   - Go back to Environment Variables
   - Update all URL variables with your actual Vercel domain:
     - `VITE_FRONTEND_URL`
     - `FRONTEND_URL`
     - `VITE_API_URL`
     - `BACKEND_URL`
   - Trigger a **Redeploy** from the Deployments tab

### Method 2: Deploy via Vercel CLI

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Run Security Checks**
   ```bash
   npm run deploy:check
   ```

3. **Deploy to Production**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables (if not set via dashboard)**
   ```bash
   vercel env add VITE_FIREBASE_API_KEY production
   vercel env add JWT_SECRET production
   # ... repeat for all variables
   ```

5. **Trigger Redeploy**
   ```bash
   vercel --prod --force
   ```

---

## ⚙️ Post-Deployment Configuration

### 1. Configure Stripe Webhooks

1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. Enter webhook URL: `https://your-app.vercel.app/api/stripe/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** (whsec_...)
6. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
7. Redeploy

### 2. Configure Firebase Authentication

1. Go to Firebase Console > Authentication > Settings
2. Add your Vercel domain to **Authorized domains**:
   - `your-app.vercel.app`
3. Configure **OAuth redirect URIs** if using social login

### 3. Set up Custom Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update all `*_URL` environment variables with your custom domain
6. Redeploy

### 4. Enable Vercel Analytics

1. In Vercel Dashboard, go to your project
2. Click "Analytics" tab
3. Click "Enable Analytics"
4. Analytics will start collecting data automatically

---

## 🧪 Testing Production

### 1. Smoke Tests

After deployment, test these critical features:

- ✅ Homepage loads correctly
- ✅ User registration works
- ✅ User login works
- ✅ Browse tutors
- ✅ Book a session
- ✅ Payment processing (use Stripe test mode first!)
- ✅ AI Chatbot responds
- ✅ WhatsApp integration works (if enabled)
- ✅ Admin dashboard accessible
- ✅ Notifications work

### 2. Performance Tests

Run Lighthouse audit:
- Open Chrome DevTools
- Go to "Lighthouse" tab
- Run audit for Performance, Accessibility, Best Practices, SEO
- Target scores: >90 for all metrics

### 3. API Health Check

```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-10-07T...",
  "environment": "production"
}
```

---

## 🔧 Troubleshooting

### Issue: Build Fails

**Solution:**
1. Check build logs in Vercel dashboard
2. Run `npm run build:production` locally to reproduce
3. Common fixes:
   ```bash
   npm run lint:fix
   npm run type-check
   ```

### Issue: Environment Variables Not Working

**Solution:**
1. Ensure all variables are set in **Production** environment
2. Variables starting with `VITE_` are for frontend (exposed in browser)
3. Variables without `VITE_` are for backend (server-side only)
4. After adding/changing env vars, **always redeploy**

### Issue: API Returns 404

**Solution:**
1. Check `vercel.json` routes configuration
2. Ensure `api/index.js` exists and is properly configured
3. Check Vercel function logs: Dashboard > Deployments > View Function Logs

### Issue: Firebase Connection Fails

**Solution:**
1. Verify all Firebase env vars are correct
2. Check Firebase private key formatting:
   ```env
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
   ```
   - Must include quotes
   - Must include `\n` for newlines
3. Ensure Firebase domain is in Authorized domains

### Issue: Stripe Webhooks Not Working

**Solution:**
1. Verify webhook URL is correct: `https://your-app.vercel.app/api/stripe/webhook`
2. Check Stripe webhook signing secret matches env var
3. Test webhook in Stripe Dashboard > Webhooks > Send test webhook
4. Check Vercel function logs for errors

### Issue: AI Chatbot Returns Fallback Responses

**Solution:**
1. Verify `GOOGLE_AI_API_KEY` is set correctly
2. Check `AI_PROVIDER=google` is set
3. Uncomment the import in `server/services/aiChatService.ts`:
   ```typescript
   import { GoogleGenerativeAI } from '@google/generative-ai';
   ```
4. Ensure `@google/generative-ai` package is installed
5. Redeploy

---

## ⚡ Performance Optimization

### 1. Enable Vercel Edge Caching

Already configured in `vercel.json`:
- Static assets: 1 year cache
- index.html: no cache (always fresh)

### 2. Monitor Performance

- Use Vercel Analytics (built-in)
- Set up Vercel Speed Insights
- Monitor Core Web Vitals

### 3. Optimize Images

- Use WebP format where possible
- Implement lazy loading (already configured)
- Use Vercel Image Optimization API if needed

### 4. Database Optimization

- Use Firebase indexes for common queries
- Implement pagination for large datasets
- Cache frequently accessed data

---

## 📊 Monitoring & Maintenance

### Daily Checks
- ✅ Check Vercel deployment status
- ✅ Monitor error rate in Vercel dashboard
- ✅ Check Stripe webhook delivery

### Weekly Checks
- ✅ Review Vercel Analytics
- ✅ Check Firebase usage and quotas
- ✅ Review Stripe transactions
- ✅ Update dependencies: `npm outdated`

### Monthly Checks
- ✅ Security audit: `npm audit`
- ✅ Performance audit (Lighthouse)
- ✅ Review and rotate secrets if needed
- ✅ Check Firebase Security Rules

---

## 🎯 Quick Reference Commands

```bash
# Deploy to production
npm run deploy:vercel

# Check for issues before deploy
npm run deploy:check

# Build production locally
npm run build:production

# Preview production build
npm run preview

# Security check
npm run security:check

# Type check
npm run type-check

# Lint and fix
npm run lint:fix
```

---

## 📞 Support

If you encounter any issues:

1. Check Vercel function logs
2. Review build logs
3. Test locally with production build
4. Check this guide's troubleshooting section
5. Review [Vercel Documentation](https://vercel.com/docs)

---

## ✅ Production Readiness Checklist

Before going live, ensure:

- [ ] All environment variables set in Vercel
- [ ] URLs updated with actual Vercel domain
- [ ] Firebase domain authorized
- [ ] Stripe webhooks configured
- [ ] Payment testing completed
- [ ] Security audit passed
- [ ] Performance >90 on Lighthouse
- [ ] Error monitoring set up
- [ ] Backup strategy in place
- [ ] Custom domain configured (if using)
- [ ] SSL certificate active (automatic on Vercel)
- [ ] GDPR/Privacy policy pages added
- [ ] Terms of service updated
- [ ] Contact information updated

---

**🎉 Congratulations! Your TutorsPool application is now production-ready on Vercel!**

**Live URL:** https://your-app.vercel.app

---

*Last Updated: October 7, 2025*

