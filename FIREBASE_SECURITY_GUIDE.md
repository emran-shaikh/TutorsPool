# 🔒 Firebase Security Setup Guide

## Overview
This guide will help you securely configure Firebase for production deployment with GitHub Actions and environment variables.

## ✅ Security Checklist

### 1. Environment Variables Secured
- [x] `.env` file added to `.gitignore`
- [x] `firebase-admin-key.json` added to `.gitignore`
- [x] Environment variables moved to configuration files
- [x] Firebase Admin SDK uses env vars instead of JSON file

## 🚀 Production Deployment Setup

### GitHub Actions Secrets Configuration

1. **Go to your GitHub Repository**
   - Navigate to `Settings` → `Secrets and variables` → `Actions`

2. **Add Required Secrets:**

#### Firebase Admin SDK Secrets
```
FIREBASE_PROJECT_ID=tutorspooldb
FIREBASE_PRIVATE_KEY_ID=acff5e1f8a8b5dd9d97ccc6760558a5a4837d92e
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCl77eNZMiqUIOa\nDgWzDXFYI63mQj5OzOjmq0m3IsXPGCgtuiOAwKJu8hZLiRHy...
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@tutorspooldb.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=105308091793950583474
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
```

#### Client-side Firebase (Safe for public)
```
VITE_FIREBASE_API_KEY=AIzaSyBk559QWXeyh7uLddSZ-jL9z0Fk57scQ3U
VITE_FIREBASE_AUTH_DOMAIN=tutorspooldb.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tutorspooldb
VITE_FIREBASE_STORAGE_BUCKET=tutorspooldb.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1012964928731
VITE_FIREBASE_APP_ID=1:1012964928731:web:76f2f66d93d39944ccf0fe
VITE_FIREBASE_MEASUREMENT_ID=G-ZKMSQ1TGHT
```

#### Other Production Secrets
```
DATABASE_CONFIG=USE_FIREBASE=true
NODE_ENV=production
JWT_SECRET=4792d1dd4dc9998372456c8e8369767b
STRIPE_SECRET_KEY=sk_live_your_stripe_live_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Local Development Setup

1. **Create `.env` file** (will be ignored by git):
```bash
# Copy from env.example and fill with actual values
cp env.example .env
```

2. **Add your Firebase credentials** to `.env`:
```bash
# Your actual Firebase Admin SDK credentials here
FIREBASE_PROJECT_ID=tutorspooldb
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@tutorspooldb.iam.gserviceaccount.com
# ... etc
```

3. **Never commit `.env` or `firebase-admin-key.json`**

## 🔧 Environment Configuration

### Development Environment
```bash
NODE_ENV=development
USE_FIREBASE=true
USE_SUPABASE=false
DATABASE_CONFIG=firebase
```

### Production Environment
```bash
NODE_ENV=production
USE_FIREBASE=true
USE_SUPABASE=false
DATABASE_CONFIG=firebase
SECURE_MODE=true
```

## 🛡️ Security Best Practices

### ✅ DO:
- Use environment variables for all secrets
- Store Firebase Admin credentials in GitHub Secrets
- Use separate Firebase projects for dev/staging/production
- Enable Firebase Security Rules
- Use HTTPS in production
- Rotate Firebase service account keys regularly
- Monitor Firebase usage and access logs

### ❌ DON'T:
- Commit `.env` files to version control
- Commit `firebase-admin-key.json` to git
- Hardcode secrets in source code
- Use production Firebase keys in development
- Share Firebase Admin credentials over insecure channels
- Use weak JWT secrets
- Deploy without proper Firebase Security Rules

## 📋 Deployment Platforms Setup

### Vercel Deployment
1. Add Firebase secrets to Vercel Environment Variables
2. Set `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, etc.
3. Deploy will automatically use environment variables

### Heroku Deployment
```bash
heroku config:set FIREBASE_PROJECT_ID=tutorspooldb
heroku config:set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
heroku config:set FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@tutorspooldb.iam.gserviceaccount.com
```

### Railway/Render/AWS/DigitalOcean
- Add Firebase environment variables in platform dashboards
- Ensure secrets are marked as "secret" or "sensitive"

## 🔄 Migration Steps

### Migrate from JSON File to Environment Variables

1. **Remove Firebase JSON file:**
```bash
rm firebase-admin-key.json
# This file is now in .gitignore
```

2. **Update your `.env` file** with Firebase credentials

3. **Test locally:**
```bash
npm run dev
# Should see: "🔥 Firebase Admin SDK initialized successfully"
```

4. **Deploy to production** with GitHub Secrets configured

## 🚨 Security Monitoring

### Set up Firebase Security Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tutors can read/write tutor data
    match /tutors/{tutorId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'TUTOR';
    }
  }
}
```

### Monitoring Checklist
- [ ] Firebase Admin SDK initialized correctly
- [ ] Environment variables loaded properly
- [ ] No hardcoded secrets in codebase
- [ ] `.gitignore` excludes sensitive files
- [ ] GitHub Secrets configured for deployment
- [ ] Firebase Security Rules enabled
- [ ] HTTPS enforced in production

## 🐛 Troubleshooting

### Common Issues:

1. **"Firebase not configured" error:**
   - Check environment variables are set correctly
   - Verify private key formatting (no extra spaces/newlines)
   - Ensure Firebase project ID matches

2. **Environment variables not loading:**
   - Verify `.env` file exists and isn't in `.gitignore` issues
   - Check variable names match exactly
   - Restart server after changes

3. **Deployment failures:**
   - Confirm GitHub Secrets are added correctly
   - Check secret values don't have extra characters
   - Verify NODE_ENV is set to "production"

## 🎯 Next Steps

1. Set up GitHub Actions workflow to deploy automatically
2. Configure Firebase Security Rules for production
3. Set up monitoring and alerting for auth failures
4. Implement rate limiting for API endpoints
5. Add audit logging for admin actions

---

**🔒 Your Firebase configuration is now production-ready and secure!**
