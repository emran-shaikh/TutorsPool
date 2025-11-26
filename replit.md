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

### November 26, 2025
- Configured Vite dev server to run on port 5000 with `0.0.0.0` host
- Added `allowedHosts` configuration for Replit proxy support
- Created `.env.local` with safe development defaults
- Set up unified workflow running both frontend and backend
- Configured deployment for autoscale target
- Verified application runs successfully with sample data
- **Security Fix**: Added server-side validation for admin registration (requires ADMIN_INVITE_CODE)
- Fixed authentication flows for all user roles (STUDENT, TUTOR, ADMIN)
- Verified admin dashboard endpoint works correctly
- Verified blog management CRUD operations work correctly

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
Development configuration is in `.env.local`. For production, use Replit Secrets.

**Important**: Never commit real API keys or secrets. The app works with JSON storage by default.

### Key Features
- 🔐 Authentication (Firebase/email-based)
- 💳 Stripe payment integration (requires API keys)
- 🤖 AI Chatbot (Google Gemini/OpenAI - falls back to rule-based)
- 💬 Real-time chat (Socket.IO)
- 📊 Analytics tracking
- 🎨 Modern responsive UI

## Deployment

The project is configured for Replit Deployments (Autoscale):

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

### Deployment Steps
1. Click the "Deploy" button in Replit
2. Set required environment variables in Replit Secrets:
   - `JWT_SECRET` - Authentication secret (required)
   - `NODE_ENV=production` (optional, set automatically)
   - Optional: Firebase, Stripe, AI service credentials
3. Deploy to production

### Required Environment Variables for Production
- `JWT_SECRET` - Authentication secret (REQUIRED)
- `PORT` - Server port (automatically set by Replit)
- Optional external services:
  - Firebase (authentication & database)
  - Stripe (payments)
  - Google AI/OpenAI (AI chatbot)
  
**Note**: The application works with JSON file storage by default, so external services are optional.

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
```

## User Preferences
- Development environment: Replit
- Default database: JSON file storage (no external dependencies)
- Port configuration: Frontend on 5000, Backend on 5174
- Deployment: Replit autoscale deployment
