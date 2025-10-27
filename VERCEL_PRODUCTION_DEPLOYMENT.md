# 🚀 Vercel Production Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Setup
Before deploying, you need to set up environment variables in Vercel:

#### Required Environment Variables:
```bash
# Supabase (Database & Auth)
SUPABASE_URL=https://wtvfgcotbgkiuxkhnovc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Frontend (Vite)
VITE_SUPABASE_URL=https://wtvfgcotbgkiuxkhnovc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=/api

# Email (ZeptoMail)
ZEPTO_API_KEY=Zoho-enczapikey wSsVR61+...
ZEPTO_FROM_EMAIL=info@tutorspool.com
ZEPTO_ADMIN_EMAIL=talkoftrend@gmail.com

# App Configuration
NODE_ENV=production
USE_SUPABASE=true
```

#### Optional Environment Variables:
```bash
# Stripe (Payment Processing)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Google AI (Gemini)
GEMINI_API_KEY=AIzaSy...

# Firebase (if using)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# WhatsApp Business (if using)
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_VERIFY_TOKEN=...
```

### 2. Update vercel.json for Production

Your current `vercel.json` is good, but let's ensure it's optimized:

```json
{
  "version": 2,
  "buildCommand": "npm run build:production",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

### 3. Update package.json Scripts

Ensure your `package.json` has the correct build scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:production": "NODE_ENV=production tsc && vite build --mode production",
    "vercel-build": "npm run build:production",
    "preview": "vite preview"
  }
}
```

## 🔧 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Production ready: Fixed authentication and routing"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select the repository: `emran-shaikh/TutorsPool`

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required variables from the list above
   - Make sure to select "Production", "Preview", and "Development" for each

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your site will be live at: `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Production**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add SUPABASE_URL production
   vercel env add VITE_SUPABASE_URL production
   # ... add all other variables
   ```

## 🌐 Custom Domain Setup

### Add Custom Domain (tutorspool.com)

1. **In Vercel Dashboard**
   - Go to Project Settings → Domains
   - Click "Add Domain"
   - Enter: `tutorspool.com` and `www.tutorspool.com`

2. **Update DNS Records**
   Add these records in your domain registrar:

   **For Root Domain (tutorspool.com):**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

   **For WWW Subdomain:**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **Wait for DNS Propagation** (5-30 minutes)

4. **Enable HTTPS** (Automatic via Vercel)

## 🧪 Post-Deployment Testing

### 1. Test Authentication
```bash
# Test student registration
curl -X POST https://tutorspool.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Student","email":"test@test.com","country":"USA","role":"STUDENT"}'

# Test login
curl -X POST https://tutorspool.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### 2. Test Routes
Visit these URLs and verify they work:
- ✅ https://tutorspool.com/
- ✅ https://tutorspool.com/signup
- ✅ https://tutorspool.com/login
- ✅ https://tutorspool.com/student/dashboard (after login)
- ✅ https://tutorspool.com/tutor/dashboard (after login)
- ✅ https://tutorspool.com/admin (after login)

### 3. Test Contact Form
- Go to https://tutorspool.com/contact
- Fill out and submit form
- Check if emails are received

### 4. Test Registration Emails
- Register a new account
- Check for welcome email
- Check admin notification email

## 🔍 Monitoring & Debugging

### View Deployment Logs
```bash
vercel logs
```

### View Function Logs
1. Go to Vercel Dashboard
2. Select your project
3. Click "Functions" tab
4. View real-time logs

### Check Build Logs
1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments" tab
4. Click on a deployment
5. View "Build Logs"

## 🚨 Common Issues & Solutions

### Issue 1: Build Fails
**Error**: `Module not found` or `Cannot find module`

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build:production
```

### Issue 2: Environment Variables Not Working
**Error**: `undefined` values in production

**Solution**:
- Ensure all `VITE_` prefixed variables are set
- Redeploy after adding variables
- Check variable names match exactly

### Issue 3: API Routes Return 404
**Error**: `/api/*` routes not found

**Solution**:
- Verify `vercel.json` rewrites are correct
- Ensure API files are in `/api` directory
- Check file naming: `[...route].ts` for catch-all

### Issue 4: CORS Errors
**Error**: `CORS policy blocked`

**Solution**:
- Add CORS headers in API routes
- Set `Access-Control-Allow-Origin: *` or specific domain
- Handle OPTIONS preflight requests

### Issue 5: Large Bundle Size
**Warning**: Bundle size exceeds limit

**Solution**:
```bash
# Analyze bundle
npm run build:production
npx vite-bundle-visualizer

# Optimize imports
# Use dynamic imports for large components
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
```

## 📊 Performance Optimization

### 1. Enable Edge Functions
In `vercel.json`, add:
```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "edge"
    }
  }
}
```

### 2. Enable Image Optimization
```json
{
  "images": {
    "domains": ["tutorspool.com", "supabase.co"],
    "formats": ["image/avif", "image/webp"]
  }
}
```

### 3. Add Caching Headers
Already configured in `vercel.json` headers section.

### 4. Code Splitting
Already configured in `vite.config.ts` with manual chunks.

## 🔒 Security Checklist

- ✅ All sensitive keys in environment variables (not in code)
- ✅ HTTPS enabled (automatic with Vercel)
- ✅ Security headers configured (X-Frame-Options, etc.)
- ✅ CORS properly configured
- ✅ API routes protected with authentication
- ✅ Input validation on all forms
- ✅ SQL injection prevention (using Supabase/Prisma)
- ✅ XSS prevention (React escapes by default)

## 📈 Analytics & Monitoring

### Add Vercel Analytics
```bash
npm install @vercel/analytics
```

In `src/main.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

<Analytics />
```

### Add Error Tracking (Optional)
```bash
npm install @sentry/react
```

## ✅ Production Readiness Checklist

Before going live, ensure:

- [ ] All environment variables set in Vercel
- [ ] Custom domain configured and DNS updated
- [ ] SSL certificate active (HTTPS working)
- [ ] All routes tested and working
- [ ] Authentication flows tested
- [ ] Email sending tested
- [ ] Database connections working
- [ ] API endpoints responding correctly
- [ ] Error pages configured (404, 500)
- [ ] Loading states implemented
- [ ] Mobile responsive design verified
- [ ] Browser compatibility tested
- [ ] Performance metrics acceptable
- [ ] Security headers configured
- [ ] GDPR/Privacy policy added (if required)
- [ ] Terms of service added (if required)

## 🎯 Deployment Timeline

1. **Preparation** (30 minutes)
   - Set up environment variables
   - Test build locally
   - Review checklist

2. **Initial Deployment** (5 minutes)
   - Push to GitHub
   - Connect to Vercel
   - Configure project

3. **Configuration** (15 minutes)
   - Add environment variables
   - Configure custom domain
   - Set up DNS

4. **Testing** (30 minutes)
   - Test all routes
   - Test authentication
   - Test email sending
   - Test API endpoints

5. **Monitoring** (Ongoing)
   - Watch deployment logs
   - Monitor error rates
   - Check performance metrics

## 📞 Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vite Documentation**: https://vitejs.dev/
- **Supabase Documentation**: https://supabase.com/docs
- **Project Issues**: https://github.com/emran-shaikh/TutorsPool/issues

## 🚀 Quick Deploy Command

```bash
# One-command deployment
git add . && git commit -m "Deploy to production" && git push origin main
```

Then Vercel will automatically deploy!

---

**Status**: Ready for Production Deployment  
**Estimated Time**: 1-2 hours (including DNS propagation)  
**Next Step**: Follow deployment steps above
