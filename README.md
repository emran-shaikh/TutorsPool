# 🎓 TutorsPool - Online Tutoring Platform

A comprehensive online tutoring platform connecting students with qualified tutors. Built with React, TypeScript, Vite, and deployed on Vercel.

## ✨ Features

- 🔐 **Authentication** - Firebase Authentication with JWT
- 💳 **Payments** - Stripe integration for secure payments
- 🤖 **AI Chatbot** - Google Gemini-powered AI assistant
- 💬 **Real-time Chat** - Socket.IO for live communication
- 📱 **WhatsApp Integration** - Business API integration
- 📊 **Analytics** - Vercel Analytics integration
- 🎨 **Modern UI** - Tailwind CSS + shadcn/ui components
- 🚀 **Optimized Performance** - Code splitting, lazy loading, caching
- 🔒 **Security** - Security headers, CORS, input validation

## 🚀 Quick Start

### Windows Users (PowerShell Helper Scripts)

**No more execution policy errors!** Use our helper scripts:

```powershell
# Run tests
.\run-tests.ps1 all

# Start development server
.\run-dev.ps1 frontend

# Git operations
.\run-git.ps1 quick "Your commit message"
```

See **[QUICK_COMMANDS.md](./QUICK_COMMANDS.md)** for all commands.

### Development (Traditional)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start backend server (separate terminal)
npm run server:dev

# Or start both together
npm run dev:all
```

### Production Deployment

See **[PRODUCTION_READY_SUMMARY.md](./PRODUCTION_READY_SUMMARY.md)** for complete deployment guide.

**Quick deploy to Vercel:**

```bash
# Automated deployment (Linux/Mac)
./deploy-to-vercel.sh

# Automated deployment (Windows)
./deploy-to-vercel.ps1

# Or manually
npm run deploy:vercel
```

## 📚 Documentation

### Quick Reference
| Document | Purpose |
|----------|---------|
| [QUICK_COMMANDS.md](./QUICK_COMMANDS.md) | ⚡ Quick command reference |
| [TERMINAL_FIX_GUIDE.md](./TERMINAL_FIX_GUIDE.md) | 🔧 Fix PowerShell issues |

### Testing
| Document | Purpose |
|----------|---------|
| [TEST_SUITE_IMPLEMENTATION.md](./TEST_SUITE_IMPLEMENTATION.md) | 🧪 Test suite documentation (GEN-001 to GEN-005) |
| [AUTH_SECURITY_TEST_SUITE.md](./AUTH_SECURITY_TEST_SUITE.md) | 🔐 Authentication & security tests (AUTH-001, 003, 005, 006) |
| [TEST_EXECUTION_RESULTS.md](./TEST_EXECUTION_RESULTS.md) | 📊 Test execution results |
| [ROUTING_FIX_AND_TEST.md](./ROUTING_FIX_AND_TEST.md) | 🔀 Routing test guide |

### Deployment
| Document | Purpose |
|----------|---------|
| [PRODUCTION_READY_SUMMARY.md](./PRODUCTION_READY_SUMMARY.md) | Quick overview & getting started |
| [VERCEL_DEPLOYMENT_PRODUCTION.md](./VERCEL_DEPLOYMENT_PRODUCTION.md) | Complete deployment guide |
| [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) | All environment variables explained |
| [PRODUCTION_DEPLOYMENT_CHECKLIST.md](./PRODUCTION_DEPLOYMENT_CHECKLIST.md) | Pre-launch checklist |
| [DEPLOYMENT_FILES_SUMMARY.md](./DEPLOYMENT_FILES_SUMMARY.md) | Overview of deployment files |

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Navigation
- **React Query** - Data fetching
- **Vercel Analytics** - Analytics

### Backend
- **Express.js** - API server
- **Firebase** - Authentication & Database
- **Stripe** - Payment processing
- **Socket.IO** - Real-time features
- **Google Gemini** - AI chatbot
- **WhatsApp API** - Messaging integration

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase project
- Stripe account
- Vercel account (for deployment)
- Google Gemini API key (for AI chatbot)

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server
npm run server:dev       # Start backend server
npm run dev:all          # Start both

# Building
npm run build            # Build for development
npm run build:production # Build for production
npm run vercel-build     # Vercel build

# Quality & Testing
npm run type-check       # TypeScript check
npm run lint             # Lint code
npm run lint:fix         # Fix lint issues
npm run security:check   # Check for secrets
npm run test             # Run tests

# Deployment
npm run deploy:check     # Pre-deployment checks
npm run deploy:build     # Build with checks
npm run deploy:vercel    # Deploy to Vercel
```

## 🌍 Environment Variables

Copy `env.example` to `.env.local` for development:

```bash
cp env.example .env.local
```

For production, see [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md).

### Required Variables:
- `JWT_SECRET` - JWT authentication secret
- Firebase credentials (client & admin)
- Stripe API keys
- Google Gemini API key (for AI)

## 🚀 Deployment to Vercel

### Method 1: Automated Script

```bash
# Linux/Mac
chmod +x deploy-to-vercel.sh
./deploy-to-vercel.sh

# Windows PowerShell
./deploy-to-vercel.ps1
```

### Method 2: Vercel Dashboard

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy!

See [VERCEL_DEPLOYMENT_PRODUCTION.md](./VERCEL_DEPLOYMENT_PRODUCTION.md) for detailed instructions.

## 📊 Performance

Optimized for production:
- Bundle size: ~450KB (initial load)
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Lighthouse Score: >90

## 🔒 Security

- HTTPS everywhere
- Security headers configured
- CORS properly set up
- JWT authentication
- Input validation
- XSS & CSRF protection

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

ISC

## 📞 Support

For deployment help:
- Check [VERCEL_DEPLOYMENT_PRODUCTION.md](./VERCEL_DEPLOYMENT_PRODUCTION.md)
- Review [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)
- See troubleshooting section in deployment guide

---

**🎉 Ready for Production!** See [PRODUCTION_READY_SUMMARY.md](./PRODUCTION_READY_SUMMARY.md) to get started.
