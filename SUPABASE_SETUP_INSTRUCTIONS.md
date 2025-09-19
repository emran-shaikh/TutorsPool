# Supabase Setup Instructions

## Current Status ✅
- ✅ Server authentication error fixed
- ✅ Backend server running on port 5174
- ✅ Frontend running on port 8080
- ✅ All API endpoints working
- ✅ Hybrid data manager ready for Supabase integration

## To Complete Supabase Integration:

### 1. Create Environment File
Create a `.env` file in the project root with your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Frontend Supabase Configuration (for client-side)
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Stripe Configuration (keep existing)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Server Configuration
PORT=5174
NODE_ENV=development

# Optional: Database fallback (for gradual migration)
USE_SUPABASE=false
```

### 2. Get Your Supabase Credentials
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy your:
   - Project URL
   - Anon (public) key
   - Service role key

### 3. Set Up Database Schema
1. Open your Supabase SQL Editor
2. Copy and paste the contents of `supabase-schema.sql`
3. Run the SQL commands to create all tables

### 4. Test Supabase Connection
```bash
# Test the connection
node scripts/setup-supabase.js

# Migrate existing data (optional)
npm run supabase:migrate
```

### 5. Enable Supabase
Once everything is set up, change in your `.env` file:
```env
USE_SUPABASE=true
```

Then restart your server:
```bash
npm run server:dev
```

## Current Functionality ✅
- ✅ User authentication and authorization
- ✅ Student and tutor registration
- ✅ Session booking and management
- ✅ Payment processing with Stripe
- ✅ Real-time chat system
- ✅ Review and rating system
- ✅ Admin dashboard with full functionality
- ✅ AI-based subject suggestions
- ✅ Notification system
- ✅ Success story feature

## Available Scripts
- `npm run server:dev` - Start backend server
- `npm run dev` - Start frontend development server
- `npm run dev:all` - Start both servers
- `npm run supabase:setup` - Test Supabase connection
- `npm run supabase:migrate` - Migrate data to Supabase

## Hybrid Data Manager
The application uses a hybrid data manager that can work with both:
- **JSON file storage** (current default)
- **Supabase database** (when configured)

This allows for gradual migration and fallback support.

## Next Steps
1. Set up your Supabase project
2. Add your credentials to `.env`
3. Run the database schema
4. Test the connection
5. Enable Supabase by setting `USE_SUPABASE=true`
6. Restart the server

The application is fully functional and ready for Supabase integration!
