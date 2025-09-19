import { createClient } from '@supabase/supabase-js';

interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
}

class SupabaseService {
  private supabase;

  constructor() {
    const config: SupabaseConfig = {
      url: process.env.SUPABASE_URL || '',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    };

    if (!config.url || !config.serviceRoleKey) {
      console.warn('Supabase configuration missing. Using fallback data manager.');
    }

    this.supabase = createClient(config.url, config.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  // User Management
  async createUser(userData: {
    email: string;
    name: string;
    phone?: string;
    country?: string;
    timezone?: string;
    role: 'STUDENT' | 'TUTOR' | 'ADMIN';
    status?: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
    avatar_url?: string;
  }) {
    const { data, error } = await this.supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserById(id: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserByEmail(email: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getAllUsers() {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async updateUser(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Tutor Management
  async createTutor(tutorData: {
    user_id: string;
    subjects: string[];
    hourly_rate_cents: number;
    currency?: string;
    experience_years?: number;
    education?: string;
    bio?: string;
    availability?: any;
  }) {
    const { data, error } = await this.supabase
      .from('tutors')
      .insert(tutorData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getTutorById(id: string) {
    const { data, error } = await this.supabase
      .from('tutors')
      .select(`
        *,
        users:user_id (*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getTutorsByUserIds(userIds: string[]) {
    const { data, error } = await this.supabase
      .from('tutors')
      .select(`
        *,
        users:user_id (*)
      `)
      .in('user_id', userIds);
    
    if (error) throw error;
    return data;
  }

  async getAllTutors() {
    const { data, error } = await this.supabase
      .from('tutors')
      .select(`
        *,
        users:user_id (*)
      `)
      .eq('users.status', 'ACTIVE')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async updateTutor(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from('tutors')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Student Management
  async createStudent(studentData: {
    user_id: string;
    grade_level?: string;
    subjects_of_interest?: string[];
    learning_goals?: string;
    preferred_languages?: string[];
  }) {
    const { data, error } = await this.supabase
      .from('students')
      .insert(studentData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getStudentById(id: string) {
    const { data, error } = await this.supabase
      .from('students')
      .select(`
        *,
        users:user_id (*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getAllStudents() {
    const { data, error } = await this.supabase
      .from('students')
      .select(`
        *,
        users:user_id (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // Booking Management
  async createBooking(bookingData: {
    student_id: string;
    tutor_id: string;
    subject_id: string;
    start_at_utc: string;
    end_at_utc: string;
    price_cents: number;
    currency?: string;
    status?: string;
    payment_status?: string;
    payment_required?: boolean;
    notes?: string;
    meeting_type?: string;
  }) {
    const { data, error } = await this.supabase
      .from('bookings')
      .insert(bookingData)
      .select(`
        *,
        students:student_id (
          *,
          users:user_id (*)
        ),
        tutors:tutor_id (
          *,
          users:user_id (*)
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getBookingById(id: string) {
    const { data, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        students:student_id (
          *,
          users:user_id (*)
        ),
        tutors:tutor_id (
          *,
          users:user_id (*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getBookingsByStudentId(studentId: string) {
    const { data, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        students:student_id (
          *,
          users:user_id (*)
        ),
        tutors:tutor_id (
          *,
          users:user_id (*)
        )
      `)
      .eq('student_id', studentId)
      .order('start_at_utc', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async getBookingsByTutorId(tutorId: string) {
    const { data, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        students:student_id (
          *,
          users:user_id (*)
        ),
        tutors:tutor_id (
          *,
          users:user_id (*)
        )
      `)
      .eq('tutor_id', tutorId)
      .order('start_at_utc', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async updateBooking(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from('bookings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getAllBookings() {
    const { data, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        students:student_id (
          *,
          users:user_id (*)
        ),
        tutors:tutor_id (
          *,
          users:user_id (*)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // Review Management
  async createReview(reviewData: {
    tutor_id: string;
    student_id: string;
    booking_id?: string;
    rating: number;
    comment: string;
    subject?: string;
    improvement?: string;
    status?: string;
    is_success_story?: boolean;
  }) {
    const { data, error } = await this.supabase
      .from('reviews')
      .insert(reviewData)
      .select(`
        *,
        students:student_id (
          *,
          users:user_id (*)
        ),
        tutors:tutor_id (
          *,
          users:user_id (*)
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getReviewsByTutorId(tutorId: string) {
    const { data, error } = await this.supabase
      .from('reviews')
      .select(`
        *,
        students:student_id (
          *,
          users:user_id (*)
        ),
        tutors:tutor_id (
          *,
          users:user_id (*)
        )
      `)
      .eq('tutor_id', tutorId)
      .eq('status', 'APPROVED')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async getFeaturedReviews() {
    const { data, error } = await this.supabase
      .from('reviews')
      .select(`
        *,
        students:student_id (
          *,
          users:user_id (*)
        ),
        tutors:tutor_id (
          *,
          users:user_id (*)
        )
      `)
      .eq('status', 'APPROVED')
      .gte('rating', 4)
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(6);
    
    if (error) throw error;
    return data;
  }

  async updateReview(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from('reviews')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Notification Management
  async createNotification(notificationData: {
    user_id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    read?: boolean;
  }) {
    const { data, error } = await this.supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getNotificationsByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async markNotificationAsRead(id: string) {
    const { data, error } = await this.supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Message Management (Chat)
  async createMessage(messageData: {
    sender_id: string;
    receiver_id: string;
    content: string;
    message_type?: string;
  }) {
    const { data, error } = await this.supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getMessagesByUsers(userId1: string, userId2: string) {
    const { data, error } = await this.supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id (*),
        receiver:receiver_id (*)
      `)
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  // Payment Management
  async createPayment(paymentData: {
    student_id: string;
    tutor_id: string;
    booking_id: string;
    stripe_payment_intent_id?: string;
    amount_cents: number;
    currency?: string;
    status?: string;
  }) {
    const { data, error } = await this.supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getPaymentsByStudentId(studentId: string) {
    const { data, error } = await this.supabase
      .from('payments')
      .select(`
        *,
        bookings:booking_id (*),
        tutors:tutor_id (
          *,
          users:user_id (*)
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async updatePayment(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from('payments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Helper method to check if Supabase is configured
  isConfigured(): boolean {
    return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
}

export const supabaseService = new SupabaseService();
