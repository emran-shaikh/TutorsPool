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

The project is configured for Replit Deployments:
- **Type**: Autoscale (stateless web application)
- **Build**: Compiles TypeScript and builds production assets
- **Run**: Starts both backend and frontend servers

To deploy:
1. Click the "Deploy" button in Replit
2. Set required environment variables in Secrets
3. Deploy to production

### Required Environment Variables for Production
- `JWT_SECRET` - Authentication secret
- Optional: Firebase, Stripe, AI service credentials (app works without them)

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
