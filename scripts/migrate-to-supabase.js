// Migration script to move data from JSON file to Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATA_FILE = path.join(__dirname, '..', 'server', 'data.json');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function migrateData() {
  try {
    console.log('🚀 Starting migration to Supabase...');
    
    // Load existing data
    if (!fs.existsSync(DATA_FILE)) {
      console.error('❌ Data file not found:', DATA_FILE);
      return;
    }

    const jsonData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    console.log('📊 Loaded data:', {
      users: jsonData.users?.length || 0,
      tutors: jsonData.tutors?.length || 0,
      students: jsonData.students?.length || 0,
      bookings: jsonData.bookings?.length || 0,
      reviews: jsonData.reviews?.length || 0,
      notifications: jsonData.notifications?.length || 0,
      messages: jsonData.messages?.length || 0,
      payments: jsonData.payments?.length || 0
    });

    // Clear existing data (optional - remove if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await clearExistingData();

    // Migrate users first (required for foreign keys)
    console.log('👥 Migrating users...');
    const userMapping = await migrateUsers(jsonData.users || []);
    console.log(`✅ Migrated ${userMapping.size} users`);

    // Migrate tutors
    console.log('🎓 Migrating tutors...');
    const tutorMapping = await migrateTutors(jsonData.tutors || [], userMapping);
    console.log(`✅ Migrated ${tutorMapping.size} tutors`);

    // Migrate students
    console.log('📚 Migrating students...');
    const studentMapping = await migrateStudents(jsonData.students || [], userMapping);
    console.log(`✅ Migrated ${studentMapping.size} students`);

    // Migrate bookings
    console.log('📅 Migrating bookings...');
    const bookingMapping = await migrateBookings(jsonData.bookings || [], userMapping, tutorMapping);
    console.log(`✅ Migrated ${bookingMapping.size} bookings`);

    // Migrate reviews
    console.log('⭐ Migrating reviews...');
    await migrateReviews(jsonData.reviews || [], userMapping, tutorMapping, bookingMapping);
    console.log(`✅ Migrated ${jsonData.reviews?.length || 0} reviews`);

    // Migrate notifications
    console.log('🔔 Migrating notifications...');
    await migrateNotifications(jsonData.notifications || [], userMapping);
    console.log(`✅ Migrated ${jsonData.notifications?.length || 0} notifications`);

    // Migrate messages
    console.log('💬 Migrating messages...');
    await migrateMessages(jsonData.messages || [], userMapping);
    console.log(`✅ Migrated ${jsonData.messages?.length || 0} messages`);

    // Migrate payments
    console.log('💳 Migrating payments...');
    await migratePayments(jsonData.payments || [], userMapping, tutorMapping, bookingMapping);
    console.log(`✅ Migrated ${jsonData.payments?.length || 0} payments`);

    console.log('🎉 Migration completed successfully!');
    console.log('\n📊 Final Summary:');
    console.log(`- Users: ${userMapping.size}`);
    console.log(`- Tutors: ${tutorMapping.size}`);
    console.log(`- Students: ${studentMapping.size}`);
    console.log(`- Bookings: ${bookingMapping.size}`);
    console.log(`- Reviews: ${jsonData.reviews?.length || 0}`);
    console.log(`- Notifications: ${jsonData.notifications?.length || 0}`);
    console.log(`- Messages: ${jsonData.messages?.length || 0}`);
    console.log(`- Payments: ${jsonData.payments?.length || 0}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function clearExistingData() {
  const tables = [
    'learning_progress', 'disputes', 'payouts', 'payments', 'messages', 
    'notifications', 'reviews', 'bookings', 'students', 'tutors', 'users'
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) {
        console.warn(`⚠️  Warning clearing ${table}:`, error.message);
      } else {
        console.log(`✅ Cleared ${table}`);
      }
    } catch (err) {
      console.warn(`⚠️  Warning clearing ${table}:`, err.message);
    }
  }
}

async function migrateUsers(users) {
  const userMapping = new Map();
  
  for (const user of users) {
    try {
      const userData = {
        email: user.email,
        name: user.name,
        phone: user.phone,
        country: user.country,
        timezone: user.timezone,
        role: user.role,
        status: user.status || 'ACTIVE',
        avatar_url: user.avatarUrl,
        created_at: user.createdAt || new Date().toISOString(),
        approved_at: user.approvedAt,
        approved_by: user.approvedBy
      };

      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select('id')
        .single();

      if (error) throw error;
      
      userMapping.set(user.id, data.id);
      console.log(`  ✅ Migrated user: ${user.name} (${user.id} -> ${data.id})`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate user ${user.name}:`, error.message);
    }
  }

  return userMapping;
}

async function migrateTutors(tutors, userMapping) {
  const tutorMapping = new Map();
  
  for (const tutor of tutors) {
    try {
      const userId = userMapping.get(tutor.userId);
      if (!userId) {
        console.warn(`  ⚠️  Skipping tutor ${tutor.id}: user not found`);
        continue;
      }

      const tutorData = {
        user_id: userId,
        subjects: tutor.subjects || [],
        hourly_rate_cents: tutor.hourlyRateCents || 5000,
        currency: tutor.currency || 'USD',
        experience_years: tutor.experienceYears,
        education: tutor.education,
        bio: tutor.bio,
        availability: tutor.availability || {},
        rating: tutor.rating || 0,
        total_reviews: tutor.totalReviews || 0,
        is_online: tutor.isOnline || false,
        last_seen: tutor.lastSeen || new Date().toISOString(),
        created_at: tutor.createdAt || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('tutors')
        .insert(tutorData)
        .select('id')
        .single();

      if (error) throw error;
      
      tutorMapping.set(tutor.id, data.id);
      console.log(`  ✅ Migrated tutor: ${tutor.id} -> ${data.id}`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate tutor ${tutor.id}:`, error.message);
    }
  }

  return tutorMapping;
}

async function migrateStudents(students, userMapping) {
  const studentMapping = new Map();
  
  for (const student of students) {
    try {
      const userId = userMapping.get(student.userId);
      if (!userId) {
        console.warn(`  ⚠️  Skipping student ${student.id}: user not found`);
        continue;
      }

      const studentData = {
        user_id: userId,
        grade_level: student.gradeLevel,
        subjects_of_interest: student.subjectsOfInterest || [],
        learning_goals: student.learningGoals,
        preferred_languages: student.preferredLanguages || [],
        created_at: student.createdAt || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('students')
        .insert(studentData)
        .select('id')
        .single();

      if (error) throw error;
      
      studentMapping.set(student.id, data.id);
      console.log(`  ✅ Migrated student: ${student.id} -> ${data.id}`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate student ${student.id}:`, error.message);
    }
  }

  return studentMapping;
}

async function migrateBookings(bookings, userMapping, tutorMapping) {
  const bookingMapping = new Map();
  
  for (const booking of bookings) {
    try {
      const studentId = userMapping.get(booking.studentId);
      const tutorId = tutorMapping.get(booking.tutorId);
      
      if (!studentId || !tutorId) {
        console.warn(`  ⚠️  Skipping booking ${booking.id}: student or tutor not found`);
        continue;
      }

      const bookingData = {
        student_id: studentId,
        tutor_id: tutorId,
        subject_id: booking.subjectId,
        start_at_utc: booking.startAtUTC,
        end_at_utc: booking.endAtUTC,
        status: booking.status || 'PENDING',
        price_cents: booking.priceCents || 5000,
        currency: booking.currency || 'USD',
        payment_status: booking.paymentStatus || 'UNPAID',
        payment_required: booking.paymentRequired !== false,
        notes: booking.notes,
        meeting_type: booking.meetingType || 'ONLINE',
        created_at: booking.createdAt || new Date().toISOString(),
        status_reason: booking.statusReason
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select('id')
        .single();

      if (error) throw error;
      
      bookingMapping.set(booking.id, data.id);
      console.log(`  ✅ Migrated booking: ${booking.id} -> ${data.id}`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate booking ${booking.id}:`, error.message);
    }
  }

  return bookingMapping;
}

async function migrateReviews(reviews, userMapping, tutorMapping, bookingMapping) {
  for (const review of reviews) {
    try {
      const studentId = userMapping.get(review.studentId);
      const tutorId = tutorMapping.get(review.tutorId);
      const bookingId = review.bookingId ? bookingMapping.get(review.bookingId) : null;
      
      if (!studentId || !tutorId) {
        console.warn(`  ⚠️  Skipping review ${review.id}: student or tutor not found`);
        continue;
      }

      const reviewData = {
        tutor_id: tutorId,
        student_id: studentId,
        booking_id: bookingId,
        rating: review.rating,
        comment: review.comment,
        subject: review.subject,
        improvement: review.improvement,
        status: review.status || 'PENDING',
        is_success_story: review.isSuccessStory || false,
        created_at: review.createdAt || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select('id')
        .single();

      if (error) throw error;
      console.log(`  ✅ Migrated review: ${review.id} -> ${data.id}`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate review ${review.id}:`, error.message);
    }
  }
}

async function migrateNotifications(notifications, userMapping) {
  for (const notification of notifications) {
    try {
      const userId = userMapping.get(notification.userId);
      if (!userId) {
        console.warn(`  ⚠️  Skipping notification ${notification.id}: user not found`);
        continue;
      }

      const notificationData = {
        user_id: userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        read: notification.read || false,
        created_at: notification.createdAt || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select('id')
        .single();

      if (error) throw error;
      console.log(`  ✅ Migrated notification: ${notification.id} -> ${data.id}`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate notification ${notification.id}:`, error.message);
    }
  }
}

async function migrateMessages(messages, userMapping) {
  for (const message of messages) {
    try {
      const senderId = userMapping.get(message.senderId);
      const receiverId = userMapping.get(message.receiverId);
      
      if (!senderId || !receiverId) {
        console.warn(`  ⚠️  Skipping message ${message.id}: sender or receiver not found`);
        continue;
      }

      const messageData = {
        sender_id: senderId,
        receiver_id: receiverId,
        content: message.content,
        message_type: message.messageType || 'TEXT',
        read_at: message.readAt,
        created_at: message.createdAt || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select('id')
        .single();

      if (error) throw error;
      console.log(`  ✅ Migrated message: ${message.id} -> ${data.id}`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate message ${message.id}:`, error.message);
    }
  }
}

async function migratePayments(payments, userMapping, tutorMapping, bookingMapping) {
  for (const payment of payments) {
    try {
      const studentId = userMapping.get(payment.studentId);
      const tutorId = tutorMapping.get(payment.tutorId);
      const bookingId = payment.bookingId ? bookingMapping.get(payment.bookingId) : null;
      
      if (!studentId || !tutorId) {
        console.warn(`  ⚠️  Skipping payment ${payment.id}: student or tutor not found`);
        continue;
      }

      const paymentData = {
        student_id: studentId,
        tutor_id: tutorId,
        booking_id: bookingId,
        stripe_payment_intent_id: payment.stripePaymentIntentId,
        amount_cents: payment.amountCents,
        currency: payment.currency || 'USD',
        status: payment.status || 'PENDING',
        created_at: payment.createdAt || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select('id')
        .single();

      if (error) throw error;
      console.log(`  ✅ Migrated payment: ${payment.id} -> ${data.id}`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate payment ${payment.id}:`, error.message);
    }
  }
}

// Run migration
migrateData();
