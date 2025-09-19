# Supabase Migration Guide for TutorsPool

## 🎯 Overview
This guide outlines the complete migration from JSON file-based storage to Supabase PostgreSQL database.

## 📋 Prerequisites

### 1. Supabase Account Setup
- Create account at [supabase.com](https://supabase.com)
- Create a new project
- Note down your project URL and anon key

### 2. Required Environment Variables
Add these to your `.env` file:
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Existing Stripe (keep these)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Database Schema

#### Core Tables

```sql
-- Users table (main authentication)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  country VARCHAR(100),
  timezone VARCHAR(100),
  role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'TUTOR', 'ADMIN')),
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('ACTIVE', 'PENDING', 'SUSPENDED')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES users(id)
);

-- Tutors table (extended profile for tutors)
CREATE TABLE tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subjects TEXT[] NOT NULL,
  hourly_rate_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  experience_years INTEGER,
  education TEXT,
  bio TEXT,
  availability JSONB DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table (extended profile for students)
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  grade_level VARCHAR(50),
  subjects_of_interest TEXT[],
  learning_goals TEXT,
  preferred_languages TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  subject_id VARCHAR(100) NOT NULL,
  start_at_utc TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at_utc TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PENDING_PAYMENT', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED', 'REFUNDED')),
  price_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_status VARCHAR(20) DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PAID', 'FAILED', 'REFUNDED')),
  payment_required BOOLEAN DEFAULT true,
  notes TEXT,
  meeting_type VARCHAR(20) DEFAULT 'ONLINE' CHECK (meeting_type IN ('ONLINE', 'IN_PERSON')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status_reason TEXT
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  subject VARCHAR(100),
  improvement TEXT,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  is_success_story BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table (chat)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'TEXT' CHECK (message_type IN ('TEXT', 'IMAGE', 'FILE')),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table (Stripe integration)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payouts table
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'PAID', 'FAILED')),
  stripe_transfer_id VARCHAR(255),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disputes table
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED')),
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Progress table
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  subject VARCHAR(100) NOT NULL,
  progress_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Indexes for Performance
```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_tutors_user_id ON tutors(user_id);
CREATE INDEX idx_tutors_subjects ON tutors USING GIN(subjects);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_bookings_student_id ON bookings(student_id);
CREATE INDEX idx_bookings_tutor_id ON bookings(tutor_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_at ON bookings(start_at_utc);
CREATE INDEX idx_reviews_tutor_id ON reviews(tutor_id);
CREATE INDEX idx_reviews_student_id ON reviews(student_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_tutor_id ON payments(tutor_id);
CREATE INDEX idx_payouts_tutor_id ON payouts(tutor_id);
```

#### Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (customize as needed)
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public can view active tutors" ON tutors
  FOR SELECT USING (true);

CREATE POLICY "Tutors can update their own profile" ON tutors
  FOR UPDATE USING (auth.uid() = user_id);
```

## 🔧 Migration Steps

### Step 1: Install Dependencies
```bash
npm install @supabase/supabase-js
```

### Step 2: Create Supabase Client
Create `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Step 3: Create Database Service Layer
Replace `server/dataManager.ts` with Supabase queries:
```typescript
// server/services/databaseService.ts
import { createClient } from '@supabase/supabase-js'

export class DatabaseService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  // User methods
  async createUser(userData: any) {
    const { data, error } = await this.supabase
      .from('users')
      .insert(userData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async getUserById(id: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  // ... other methods
}
```

### Step 4: Update API Endpoints
Replace all `dataManager` calls with `databaseService` calls in `server/index.ts`.

### Step 5: Data Migration Script
Create a script to migrate existing JSON data to Supabase:
```typescript
// scripts/migrate-to-supabase.ts
import { DatabaseService } from '../server/services/databaseService.js'
import fs from 'fs'

async function migrateData() {
  const db = new DatabaseService()
  const jsonData = JSON.parse(fs.readFileSync('server/data.json', 'utf8'))
  
  // Migrate users
  for (const user of jsonData.users) {
    await db.createUser(user)
  }
  
  // Migrate tutors, bookings, etc.
  // ...
}

migrateData()
```

## 🚀 Benefits of Migration

1. **Scalability**: PostgreSQL can handle much larger datasets
2. **Real-time**: Built-in real-time subscriptions
3. **Authentication**: Integrated auth system
4. **Security**: Row-level security policies
5. **Performance**: Proper indexing and query optimization
6. **Backup**: Automatic backups and point-in-time recovery
7. **Analytics**: Built-in analytics and monitoring

## 📊 Cost Considerations

- **Free Tier**: 500MB database, 2GB bandwidth, 50MB file storage
- **Pro Plan**: $25/month for production use
- **Team Plan**: $125/month for team collaboration

## 🔄 Migration Timeline

1. **Week 1**: Setup Supabase, create schema
2. **Week 2**: Implement database service layer
3. **Week 3**: Update API endpoints
4. **Week 4**: Data migration and testing
5. **Week 5**: Deploy and monitor

## 🛡️ Security Considerations

1. Use service role key only on server-side
2. Implement proper RLS policies
3. Validate all inputs
4. Use prepared statements
5. Enable audit logging

## 📝 Next Steps

1. Create Supabase project
2. Run the SQL schema
3. Update environment variables
4. Implement database service layer
5. Test thoroughly before going live
