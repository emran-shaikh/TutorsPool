# Supabase Connection Verification Guide

## Step 1: Get Your Supabase Credentials

### 1.1 Access Your Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**

### 1.2 Copy Required Credentials
You'll need these three values:
- **Project URL** (looks like: `https://your-project-id.supabase.co`)
- **Anon (public) key** (starts with `eyJ...`)
- **Service role key** (starts with `eyJ...`)

## Step 2: Create Environment File

Create a `.env` file in your project root with your actual credentials:

```env
# Replace with your actual Supabase credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Frontend Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server Configuration
PORT=5174
NODE_ENV=development

# Enable Supabase (set to true once everything is working)
USE_SUPABASE=false
```

## Step 3: Set Up Database Schema

### 3.1 Open SQL Editor
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**

### 3.2 Run Schema Script
1. Copy the entire contents of `supabase-schema.sql` from your project
2. Paste it into the SQL Editor
3. Click **Run** to execute all the table creation commands

### 3.3 Verify Tables Created
Go to **Table Editor** and verify these tables exist:
- ✅ users
- ✅ tutors
- ✅ students
- ✅ bookings
- ✅ reviews
- ✅ notifications
- ✅ messages
- ✅ payments
- ✅ payouts
- ✅ disputes
- ✅ learning_progress

## Step 4: Test Supabase Connection

### 4.1 Run Connection Test
```bash
node scripts/setup-supabase.js
```

**Expected Output:**
```
🚀 TutorsPool Supabase Setup Script

🔍 Testing Supabase connection...
✅ Connection successful!

📊 Checking database tables...
✅ Table 'users' exists
✅ Table 'tutors' exists
✅ Table 'students' exists
✅ Table 'bookings' exists
✅ Table 'reviews' exists
✅ Table 'notifications' exists
✅ Table 'messages' exists
✅ Table 'payments' exists
✅ Table 'payouts' exists
✅ Table 'disputes' exists
✅ Table 'learning_progress' exists

📈 Checking existing data...
✅ Database tables are accessible

🎉 Supabase setup completed successfully!
```

### 4.2 Test Data Migration (Optional)
```bash
npm run supabase:migrate
```

## Step 5: Enable Supabase in Your App

### 5.1 Update Environment File
Change in your `.env` file:
```env
USE_SUPABASE=true
```

### 5.2 Restart Your Server
```bash
# Kill current server processes
taskkill /f /im node.exe

# Start server with Supabase enabled
npm run server:dev
```

**Expected Output:**
```
🗄️  Using Supabase database
Tutorspool API listening on http://localhost:5174
```

## Step 6: Verify Data Storage

### 6.1 Create Test User
1. Go to your app: http://localhost:8080
2. Register a new user
3. Check Supabase **Table Editor** → **users** table
4. You should see your new user record

### 6.2 Test API Endpoints
```bash
# Test health endpoint
curl http://localhost:5174/api/health

# Test users endpoint (should show data from Supabase)
curl http://localhost:5174/api/tutors

# Test featured reviews
curl http://localhost:5174/api/reviews/featured
```

### 6.3 Check Real-time Data
1. Create a booking in your app
2. Immediately check Supabase **Table Editor** → **bookings** table
3. You should see the new booking record

## Step 7: Advanced Verification

### 7.1 Check Supabase Logs
1. Go to **Logs** in your Supabase dashboard
2. Look for API requests when you use your app
3. You should see database queries being executed

### 7.2 Test Real-time Features
1. Open two browser windows with your app
2. Send a chat message in one window
3. Check if it appears in the other window (real-time sync)
4. Verify messages are stored in Supabase **messages** table

### 7.3 Verify Authentication
1. Log in to your app
2. Check Supabase **Authentication** → **Users** section
3. Your user should appear there (if using Supabase Auth)

## Troubleshooting

### Connection Issues
```bash
# Check if environment variables are loaded
node -e "console.log('SUPABASE_URL:', process.env.SUPABASE_URL)"
```

### Database Issues
- Verify all tables exist in Supabase Table Editor
- Check if you have proper permissions (use service role key)
- Ensure your Supabase project is not paused

### Data Not Syncing
- Check server logs for Supabase errors
- Verify `USE_SUPABASE=true` in your .env file
- Restart server after changing environment variables

## Success Indicators

✅ **Supabase Connected When You See:**
- `🗄️  Using Supabase database` in server logs
- Data appearing in Supabase tables when you use the app
- API responses coming from Supabase (not JSON files)
- Real-time features working across multiple browser windows

❌ **Still Using Local Data When You See:**
- `📁 Using JSON file storage (fallback)` in server logs
- Data only in `server/data.json` file
- No new records in Supabase tables

## Next Steps After Verification

1. **Migrate Existing Data**: Run `npm run supabase:migrate` to move existing data
2. **Test All Features**: Go through all app features to ensure they work with Supabase
3. **Monitor Performance**: Check Supabase dashboard for query performance
4. **Set Up Backups**: Configure automatic backups in Supabase
5. **Production Deployment**: Update production environment variables

## Support Commands

```bash
# Test Supabase connection
node scripts/setup-supabase.js

# Migrate data to Supabase
npm run supabase:migrate

# Check current data source
curl http://localhost:5174/api/health

# View server logs
npm run server:dev
```

Remember: The app will automatically fall back to JSON file storage if Supabase is not properly configured, so your app will continue working while you set up Supabase!
