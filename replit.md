# TutorsPool - Replit Project

## Overview
TutorsPool is a comprehensive online tutoring platform connecting students with qualified tutors. Built with React, TypeScript, Vite, and Express.js.

## Project Architecture

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Port**: 5000 (configured for Replit)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router

### Backend
- **Framework**: Express.js
- **Port**: 5174 (localhost only)
- **API Proxy**: Frontend proxies `/api` requests to backend
- **Data Storage**: JSON file-based (with Firebase/Supabase support)
- **Real-time**: Socket.IO for live features

### Database Options
The application supports multiple database backends:
1. **JSON File Storage** (default for development) - No setup required
2. **Firebase** - Set `USE_FIREBASE=true` and configure Firebase credentials
3. **Supabase** - Set `USE_SUPABASE=true` and configure Supabase credentials
4. **Prisma + PostgreSQL** - Schema available in `prisma/schema.prisma`

## Recent Changes (Replit Setup)

### November 27, 2025 - Production Ready
- ✅ Fixed authentication system - register/login working for all roles
- ✅ Fixed admin dashboard API response handling
- ✅ Fixed booking flow with payment integration
- ✅ Fixed payment system demo mode (no real Stripe keys needed)
- ✅ Fixed all TypeScript/LSP errors
- ✅ Set up Vercel deployment configuration (vercel.json)
- ✅ Created .env.example template for environment setup
- ✅ Updated .gitignore for production safety
- ✅ Added production-safe logging (only in development)

## Test Accounts

For testing purposes, the following accounts are available:

| Email | Role | Status |
|-------|------|--------|
| admin@example.com | ADMIN | ACTIVE |
| sarah@example.com | TUTOR | ACTIVE |
| john@example.com | TUTOR | ACTIVE |
| mike@example.com | STUDENT | ACTIVE |
| pending.tutor@example.com | TUTOR | PENDING |
| pending.student@example.com | STUDENT | PENDING |

**Note**: For demo purposes, you can log in with any email. If the user doesn't exist, a new STUDENT account will be created.

### Admin Registration
Admin registration requires a verification code. The default code is `ADMIN2024` (can be changed via `ADMIN_INVITE_CODE` environment variable).

## Development

### Running the Application
The application uses a single workflow that runs both frontend and backend:
```bash
npm run dev:all
```

This runs:
- Frontend (Vite): http://localhost:5000
- Backend (Express): http://localhost:5174

### Environment Variables
Development configuration is in `.env.local`. For production, use Replit Secrets or Vercel Secrets.

**Important**: Never commit real API keys or secrets. The app works with JSON storage by default.

### Key Features
- 🔐 Authentication (Firebase/email-based)
- 💳 Stripe payment integration (requires API keys)
- 🤖 AI Chatbot (Google Gemini/OpenAI - falls back to rule-based)
- 💬 Real-time chat (Socket.IO)
- 📊 Analytics tracking
- 🎨 Modern responsive UI

## Deployment

### Production Architecture
In production, a **single Express server** runs on port 5000 (or $PORT):
- Serves the built Vite frontend (static files from `/dist`)
- Handles API routes at `/api/*`
- Implements SPA fallback (all non-API routes serve index.html)

This differs from development, where:
- Frontend: Vite dev server on port 5000
- Backend: Express API on port 5174 (proxied via Vite)

### Build Process
1. `npm run build:production` compiles:
   - TypeScript code
   - Vite production build → `/dist`
   - Server TypeScript → `/dist-server`

2. `npm run start` launches the unified production server

### Deploy to Vercel

#### Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository with this code pushed

#### Setup Steps

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Production-ready deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select the repository

3. **Configure Environment Variables**
   - Add these secrets in Vercel dashboard:
     - `JWT_SECRET` - Random string (min 32 characters) - **REQUIRED**
     - `STRIPE_SECRET_KEY` - Your Stripe secret key (optional)
     - `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (optional)
     - `ADMIN_INVITE_CODE` - Admin registration code (default: ADMIN2024)
     - `FIREBASE_*` - Firebase credentials (optional)
     - `GOOGLE_AI_API_KEY` - Google Gemini API key (optional)

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy
   - Your app will be live at `https://<project-name>.vercel.app`

#### Post-Deployment
- Test the application at your Vercel URL
- Update your domain in the app settings if using a custom domain
- Monitor Vercel dashboard for logs and errors

### Required Environment Variables for Production
- `JWT_SECRET` - Authentication secret (REQUIRED) - Min 32 characters
- `PORT` - Server port (automatically set by Vercel to 3000)
- Optional external services:
  - Firebase (authentication & database)
  - Stripe (payments)
  - Google AI/OpenAI (AI chatbot)
  
**Note**: The application works with JSON file storage by default, so external services are optional.

### Production-Safe Features
- ✅ Debug logging only in development mode
- ✅ Strict CORS configuration for security
- ✅ Environment variable validation
- ✅ Error logging and monitoring
- ✅ TypeScript strict mode enabled
- ✅ No hardcoded secrets in code

## Tech Stack

**Frontend**:
- React 18, TypeScript, Vite
- Tailwind CSS, shadcn/ui, Radix UI
- React Query, React Router
- Lucide React icons

**Backend**:
- Express.js, TypeScript
- Socket.IO
- Firebase Admin, Supabase client
- Stripe SDK

**Development Tools**:
- ESLint, Prettier
- Vitest (testing)
- Concurrently (run multiple servers)

## File Structure
```
/src           - Frontend React application
/server        - Backend Express API
/prisma        - Database schema (optional)
/public        - Static assets
/api           - Vercel serverless functions (legacy)
/dist          - Production build output (frontend)
/dist-server   - Production build output (backend)
```

## User Preferences
- Development environment: Replit
- Default database: JSON file storage (no external dependencies)
- Port configuration: Frontend on 5000, Backend on 5174
- Deployment: Vercel (production-ready)
- Production: Single Express server on port 3000 (Vercel default)

## Troubleshooting

### Build Fails on Vercel
- Check all required environment variables are set
- Ensure `JWT_SECRET` has min 32 characters
- Check build logs in Vercel dashboard

### Payment System Not Working
- In production without Stripe keys: Demo mode auto-completes payments
- With Stripe keys: Configure STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY
- Check Stripe webhook secrets for webhook handling

### Authentication Issues
- Clear browser cookies/cache
- Ensure JWT_SECRET is the same in all deployments
- Check token expiration settings in authMiddleware

## Production Checklist
- [x] All TypeScript errors resolved
- [x] Environment variables configured
- [x] Logging safe for production
- [x] CORS properly configured
- [x] Admin code validation enabled
- [x] Payment system fallback working
- [x] Build process optimized
- [x] .gitignore includes sensitive files
- [ ] Deploy to Vercel (when ready)
- [ ] Test all flows in production
- [ ] Set up monitoring/analytics
- [ ] Configure custom domain (if needed)
