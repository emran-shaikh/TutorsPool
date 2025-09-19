-- Supabase Database Schema for TutorsPool
-- Run this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Row Level Security (RLS) - Enable on all tables
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

-- RLS Policies for Public Access (customize based on your needs)
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Public can view active users (for tutor listings)
CREATE POLICY "Public can view active users" ON users
  FOR SELECT USING (status = 'ACTIVE');

-- Tutors can view and update their own profile
CREATE POLICY "Tutors can manage own profile" ON tutors
  FOR ALL USING (auth.uid() = user_id);

-- Public can view tutors (for search)
CREATE POLICY "Public can view tutors" ON tutors
  FOR SELECT USING (true);

-- Students can manage their own profile
CREATE POLICY "Students can manage own profile" ON students
  FOR ALL USING (auth.uid() = user_id);

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() IN (
    SELECT user_id FROM tutors WHERE id = tutor_id
  ));

-- Users can create bookings
CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Tutors can update bookings they're assigned to
CREATE POLICY "Tutors can update their bookings" ON bookings
  FOR UPDATE USING (auth.uid() IN (
    SELECT user_id FROM tutors WHERE id = tutor_id
  ));

-- Public can view approved reviews
CREATE POLICY "Public can view approved reviews" ON reviews
  FOR SELECT USING (status = 'APPROVED');

-- Students can create reviews for their bookings
CREATE POLICY "Students can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can view messages they're part of
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can create messages
CREATE POLICY "Users can create messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() IN (
    SELECT user_id FROM tutors WHERE id = tutor_id
  ));

-- Users can view their own payouts
CREATE POLICY "Tutors can view own payouts" ON payouts
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM tutors WHERE id = tutor_id
  ));

-- Users can view their own disputes
CREATE POLICY "Users can view own disputes" ON disputes
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() IN (
    SELECT user_id FROM tutors WHERE id = tutor_id
  ));

-- Users can view their own learning progress
CREATE POLICY "Users can view own learning progress" ON learning_progress
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() IN (
    SELECT user_id FROM tutors WHERE id = tutor_id
  ));

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutors_updated_at BEFORE UPDATE ON tutors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON payouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_progress_updated_at BEFORE UPDATE ON learning_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
