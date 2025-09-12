# TutorsPool - Vercel Deployment Guide

## 🚀 Fixing 404 Errors on Vercel

The 404 errors you're experiencing are common when deploying React SPAs to Vercel. Here's how to fix them:

## 🔧 Solution 1: Frontend Deployment (Recommended)

### Step 1: Deploy Frontend to Vercel

1. **Rename the configuration file:**
   ```bash
   mv vercel-frontend.json vercel.json
   ```

2. **Deploy to Vercel:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

3. **Set Environment Variables in Vercel Dashboard:**
   - Go to your project settings in Vercel
   - Add these environment variables:
     ```
     VITE_API_URL=https://your-backend-url.vercel.app
     ```

### Step 2: Deploy Backend Separately

1. **Create a new Vercel project for backend:**
   ```bash
   # In a separate directory
   mkdir tutorspool-backend
   cd tutorspool-backend
   
   # Copy backend files
   cp -r ../server .
   cp ../api .
   cp ../server/data.json .
   cp vercel-backend.json vercel.json
   ```

2. **Deploy backend:**
   ```bash
   vercel --prod
   ```

3. **Update frontend environment variable:**
   - Update `VITE_API_URL` in frontend project to point to your backend URL

## 🔧 Solution 2: Single Project Deployment

### Step 1: Update vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 2: Update package.json
Add build script:
```json
{
  "scripts": {
    "build": "vite build",
    "vercel-build": "vite build"
  }
}
```

## 🔧 Solution 3: Fix SPA Routing (Quick Fix)

If you're only deploying the frontend, update your `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🔧 Solution 4: Environment Variables Fix

### Frontend Environment Variables
Create `.env.production`:
```env
VITE_API_URL=https://your-backend-url.vercel.app
VITE_APP_NAME=TutorsPool
```

### Backend Environment Variables
In Vercel dashboard, add:
```
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

## 🚨 Common Issues and Fixes

### Issue 1: 404 on Login/Register
**Cause:** React Router routes not being handled by Vercel
**Fix:** Ensure `vercel.json` has proper rewrites:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Issue 2: API calls failing
**Cause:** API URL not configured correctly
**Fix:** Update environment variables:
```env
VITE_API_URL=https://your-backend-url.vercel.app/api
```

### Issue 3: CORS errors
**Cause:** Backend not allowing frontend origin
**Fix:** Update CORS in backend:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-frontend-url.vercel.app',
  credentials: true
}));
```

## 📋 Deployment Checklist

### Frontend Deployment:
- [ ] `vercel.json` configured for SPA routing
- [ ] Environment variables set in Vercel dashboard
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

### Backend Deployment:
- [ ] Separate Vercel project for API
- [ ] `api/index.js` created with serverless functions
- [ ] Environment variables set
- [ ] CORS configured for frontend URL

### Testing:
- [ ] Home page loads correctly
- [ ] Login/Register pages accessible
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] Navigation between pages works

## 🔄 Alternative: Use Netlify Instead

If Vercel continues to cause issues, consider Netlify:

### Netlify Configuration (_redirects file):
```
/*    /index.html   200
```

### Netlify Configuration (netlify.toml):
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🎯 Quick Fix Commands

### For immediate fix:
```bash
# 1. Copy the working vercel.json
cp vercel-frontend.json vercel.json

# 2. Deploy
vercel --prod

# 3. Set environment variables in Vercel dashboard
# VITE_API_URL=https://your-backend-url.vercel.app
```

## 📞 Need Help?

If you're still getting 404 errors:

1. **Check Vercel logs:** Go to your project → Functions tab → View logs
2. **Verify build:** Check that `dist` folder is created correctly
3. **Test locally:** Run `npm run build && npx serve dist`
4. **Check routes:** Ensure all routes are properly configured in `vercel.json`

The key is ensuring that all React Router routes are redirected to `index.html` so the client-side routing can handle them.
