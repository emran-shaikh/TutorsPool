# ⚡ Quick Deploy - TutorsPool

## 🎯 3 Steps to Production

### 1️⃣ Add Environment Variables to Vercel (10 min)

**Go to**: https://vercel.com/dashboard → Project → Settings → Environment Variables

**Copy-paste these** (check ✅ Production, Preview, Development for each):

```bash
SUPABASE_URL=https://wtvfgcotbgkiuxkhnovc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dmZnY290YmdraXV4a2hub3ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODEwMzksImV4cCI6MjA3MzI1NzAzOX0.cHU6ftP0TWNnvyMQTtC_YWOsUm5dvqUIqQwdQ965FNY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dmZnY290YmdraXV4a2hub3ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY4MTAzOSwiZXhwIjoyMDczMjU3MDM5fQ.78giZptBn7k0V-gzeqJTjFLFbmo6xo4YAqqnB690EYA
VITE_SUPABASE_URL=https://wtvfgcotbgkiuxkhnovc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dmZnY290YmdraXV4a2hub3ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODEwMzksImV4cCI6MjA3MzI1NzAzOX0.cHU6ftP0TWNnvyMQTtC_YWOsUm5dvqUIqQwdQ965FNY
VITE_API_URL=/api
ZEPTO_API_KEY=YOUR_ZEPTO_KEY
ZEPTO_FROM_EMAIL=info@tutorspool.com
ZEPTO_ADMIN_EMAIL=talkoftrend@gmail.com
STRIPE_SECRET_KEY=sk_test_51SMjtW2KWM3gO8YuexcjxdbiUgnsGXlRAtDbEK3fxVUZv4mPGVE8BWmr8M8gvElue1FPm1C76OJma69EadrNkxQ000e1kUzs9Z
STRIPE_PUBLISHABLE_KEY=pk_test_51SMjtW2KWM3gO8Yuog9nvAQU3fGH32asuQp4F3BXPKcKbkRJVJGkNjpZEOqgAGHeJe0EQu9poO020OgEEEOT8tfj00xu4sAb6J
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SMjtW2KWM3gO8Yuog9nvAQU3fGH32asuQp4F3BXPKcKbkRJVJGkNjpZEOqgAGHeJe0EQu9poO020OgEEEOT8tfj00xu4sAb6J
NODE_ENV=production
USE_SUPABASE=true
```

### 2️⃣ Deploy (Choose One)

**Option A - Automatic** (Easiest):
```bash
git add .
git commit -m "Production deployment"
git push origin main
```

**Option B - Script**:
```powershell
.\deploy-production.ps1
```

**Option C - CLI**:
```bash
vercel --prod
```

### 3️⃣ Test (5 min)

Visit these URLs:
- ✅ https://tutorspool.com/signup
- ✅ https://tutorspool.com/login
- ✅ Test payment: Card 4242 4242 4242 4242

---

## 🧪 Quick Test

**Register as Student:**
1. Go to /signup
2. Fill 4 steps
3. Check email
4. Login

**Test Payment:**
- Card: 4242 4242 4242 4242
- Expiry: 12/34
- CVC: 123

---

## 📚 Full Docs

- **START_HERE.md** - Detailed guide
- **STRIPE_SETUP_GUIDE.md** - Payment setup
- **FINAL_DEPLOYMENT_SUMMARY.md** - Complete overview

---

## ✅ What's Ready

- ✅ Authentication (Student/Tutor/Admin)
- ✅ Stripe Payments (Test mode)
- ✅ Email Service
- ✅ All Routes
- ✅ Production Build

---

**Status**: Ready to Deploy! 🚀  
**Time**: 15 minutes total  
**Next**: Add env vars → Deploy → Test
