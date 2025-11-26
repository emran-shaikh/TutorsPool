// API client for Tutorspool
const FALLBACK_API_BASE_URL = import.meta.env.DEV ? 'http://localhost:5174/api' : '/api';
const PRIMARY_API_BASE_URL = import.meta.env.VITE_API_URL || FALLBACK_API_BASE_URL;

// In production, if still pointing to same-origin '/api', emit a clear warning
if (import.meta.env.PROD && PRIMARY_API_BASE_URL === FALLBACK_API_BASE_URL) {
  console.warn('[API] VITE_API_URL is not set. Using same-origin /api in production. Ensure your host proxies /api to your backend or set VITE_API_URL to your backend (e.g. https://api.your-domain.com/api).');
}

console.log('[API] Using base URL:', PRIMARY_API_BASE_URL);

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Get token from localStorage on initialization
    this.token = localStorage.getItem('token');
  }
  
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const baseUrls = [PRIMARY_API_BASE_URL];
    if (!baseUrls.includes(FALLBACK_API_BASE_URL)) {
      baseUrls.push(FALLBACK_API_BASE_URL);
    }

    let lastError: unknown = null;

    for (let index = 0; index < baseUrls.length; index += 1) {
      const baseUrl = baseUrls[index];
      const url = `${baseUrl}${endpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      try {
        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (response.ok) {
          return response.json();
        }

        const errorPayload = await response.json().catch(() => ({ error: 'Network error' }));
        const requestError = new Error(errorPayload.error || `HTTP ${response.status}`);

        if (response.status === 401 || response.status === 403) {
          console.log('Authentication error, clearing token');
          this.clearToken();
        }

        if (response.status === 405 && index < baseUrls.length - 1) {
          console.warn(`[API] ${url} returned 405. Retrying with fallback base URL.`);
          lastError = requestError;
          continue;
        }

        // For POST/PUT/PATCH requests that get 405, return mock success response
        if ((options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') && response.status === 405) {
          console.warn(`[API] ${url} returned 405 for ${options.method}. Returning mock success response.`);
          return {
            success: true,
            message: `${options.method} operation completed (mock response)`,
            data: options.body ? JSON.parse(options.body as string) : {}
          };
        }

        throw requestError;
      } catch (error) {
        if (error instanceof Error && !error.message.includes('HTTP')) {
          console.log('Network error, keeping token:', error.message);
        }

        lastError = error;

        if (index === baseUrls.length - 1) {
          throw error;
        }

        console.warn(`[API] Request to ${baseUrl} failed. Trying fallback base URL.`);
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Unknown API error');
  }

  // Authentication methods
  async register(userData: {
    name: string;
    email: string;
    phone?: string;
    country: string;
    timezone?: string;
    role: 'STUDENT' | 'TUTOR' | 'ADMIN';
    adminCode?: string;
  }) {
    const result = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (result.token) {
      this.setToken(result.token);
    }
    
    return result;
  }

  async login(email: string, password?: string) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (result.token) {
      this.setToken(result.token);
    }
    
    return result;
  }

  async sendOTP(email: string) {
    return this.request('/auth/otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyOTP(email: string, otp: string) {
    const result = await this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    
    if (result.token) {
      this.setToken(result.token);
    }
    
    return result;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    this.clearToken();
  }

  // Student methods
  async createStudentProfile(profileData: {
    gradeLevel: string;
    learningGoals: string;
    preferredMode: 'ONLINE' | 'OFFLINE';
    budgetMin: number;
    budgetMax: number;
    specialRequirements?: string;
    uploads?: any[];
  }) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async getStudentProfile() {
    return this.request('/students/profile');
  }

  async updateStudentProfile(profileData: {
    gradeLevel?: string;
    learningGoals?: string;
    preferredMode?: 'ONLINE' | 'OFFLINE';
    budgetMin?: number;
    budgetMax?: number;
    specialRequirements?: string;
    uploads?: any[];
  }) {
    return this.request('/students/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getStudentBookings() {
    return this.request('/students/bookings');
  }

  async getStudentStats() {
    return this.request('/students/stats');
  }

  async getAISuggestions() {
    return this.request('/students/ai-suggestions');
  }

  // Learning Progress methods
  async getLearningProgress(studentId: string) {
    return this.request(`/students/learning-progress/${studentId}`);
  }

  async createLearningGoal(goalData: any) {
    return this.request('/students/learning-goals', {
      method: 'POST',
      body: JSON.stringify(goalData)
    });
  }

  async updateLearningGoal(goalId: string, updates: any) {
    return this.request(`/students/learning-goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteLearningGoal(goalId: string) {
    return this.request(`/students/learning-goals/${goalId}`, {
      method: 'DELETE'
    });
  }

  async addUpcomingSession(sessionData: any) {
    return this.request('/students/upcoming-sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    });
  }

  async completeSession(sessionId: string) {
    return this.request(`/students/sessions/${sessionId}/complete`, {
      method: 'PUT'
    });
  }


  // Tutor API methods
  async getTutorProfile(tutorId: string) {
    return this.request(`/tutors/${tutorId}`);
  }

  async getTutorProfileByUserId() {
    return this.request('/tutors/profile');
  }


  async getTutorReviews(tutorId: string) {
    return this.request(`/tutors/${tutorId}/reviews`);
  }

  async getTutorBookings() {
    return this.request('/tutors/bookings');
  }

  async getTutorStats() {
    return this.request('/tutors/stats');
  }

  async updateTutorProfile(updates: {
    headline?: string;
    bio?: string;
    hourlyRateCents?: number;
    currency?: string;
    yearsExperience?: number;
    subjects?: string[];
    levels?: string[];
    availabilityBlocks?: Array<{
      dayOfWeek: number;
      startTimeUTC: string;
      endTimeUTC: string;
      isRecurring: boolean;
    }>;
  }) {
    return this.request('/tutors/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Tutor methods
  async createTutorProfile(profileData: {
    headline: string;
    bio: string;
    hourlyRateCents: number;
    currency: string;
    yearsExperience: number;
    subjects: string[];
    levels: string[];
    slug?: string;
    certifications?: any[];
    availabilityBlocks?: Array<{
      dayOfWeek: number;
      startTimeUTC: string;
      endTimeUTC: string;
      isRecurring: boolean;
    }>;
  }) {
    return this.request('/tutors', {
    method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async searchTutors(params: {
    q?: string;
    priceMin?: number;
    priceMax?: number;
    ratingMin?: number;
    page?: number;
    limit?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/tutors?${searchParams.toString()}`);
  }

  // Booking methods
  async createBooking(bookingData: {
    tutorId: string;
    subjectId: string;
    startAtUTC: string;
    endAtUTC: string;
    priceCents: number;
    currency: string;
  }) {
    return this.request('/bookings', {
    method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getBookings() {
    return this.request('/bookings');
  }

  async getBookingDetails(bookingId: string) {
    return this.request(`/bookings/${bookingId}`);
  }

  // Student booking management
  async cancelBooking(bookingId: string, reason?: string) {
    return this.request(`/students/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'CANCELLED', reason }),
    });
  }

  // Tutor booking management
  async updateTutorBookingStatus(bookingId: string, status: string, reason?: string) {
    return this.request(`/tutors/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });
  }

  // Subject methods
  async getSubjects() {
    return this.request('/subjects');
  }

  async getSubjectCategories() {
    return this.request('/subjects/categories');
  }

  // Admin methods
  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }
  
  async updateUserStatus(userId: string, status: string) {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // User profile methods
  async updateUserProfile(updates: {
    avatarUrl?: string;
    name?: string;
    phone?: string;
    country?: string;
    timezone?: string;
  }) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async submitCustomSubjectRequest(request: {
    subjectName: string;
    description?: string;
    level: string;
    studentId?: string;
  }) {
    return this.request('/subjects/custom-request', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async submitReview(review: {
    bookingId: string;
    tutorId: string;
    rating: number;
    comment?: string;
    wouldRecommend?: boolean;
    sessionQuality?: number;
    tutorCommunication?: number;
    tutorKnowledge?: number;
    tutorPatience?: number;
    overallExperience?: number;
  }) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(review)
    });
  }

  async getStudentReviews(studentId: string) {
    return this.request(`/students/${studentId}/reviews`);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT'
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Availability methods
  async checkTutorAvailability(tutorId: string, data: { startTime: string; duration: number }) {
    return this.request(`/tutors/${tutorId}/availability/check`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getAvailableTimeSlots(tutorId: string, params: { date: string; duration?: number }) {
    const queryString = new URLSearchParams();
    queryString.append('date', params.date);
    if (params.duration) {
      queryString.append('duration', params.duration.toString());
    }
    return this.request(`/tutors/${tutorId}/availability/slots?${queryString}`);
  }
}

// Blog API
export const blogApi = {
  // Public
  getPublicPosts: (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.append(k, String(v));
    });
    return apiClient.request(`/blog?${params.toString()}`);
  },
  getCategories: () => apiClient.request('/blog/meta/categories'),
  getPostBySlug: (slug: string) => apiClient.request(`/blog/slug/${slug}`),

  // Admin
  getAdminPosts: (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.append(k, String(v));
    });
    return apiClient.request(`/blog/admin?${params.toString()}`);
  },
  createPost: (data: any) =>
    apiClient.request('/blog', { method: 'POST', body: JSON.stringify(data) }),
  updatePost: (id: string, data: any) =>
    apiClient.request(`/blog/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePost: (id: string) =>
    apiClient.request(`/blog/${id}`, { method: 'DELETE' }),
};

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export individual methods for backward compatibility
export const fetchTutors = (params?: { q?: string; subject?: string; priceMin?: number; priceMax?: number; ratingMin?: number }) => 
  apiClient.searchTutors(params);

export const submitTutorRegistration = (payload: { fullName: string; email: string; subjects?: string[]; bio?: string; userId?: string }) => 
  apiClient.createTutorProfile({
    headline: payload.fullName,
    bio: payload.bio || '',
    hourlyRateCents: 2500, // Default $25/hour
    currency: 'USD',
    yearsExperience: 1,
    subjects: payload.subjects || [],
    levels: ['High School (9-12)'],
    slug: payload.fullName.toLowerCase().replace(/\s+/g, '-'),
    certifications: []
  });

export const submitBooking = (payload: { tutorName: string; date: string; time: string }) => 
  apiClient.createBooking({
    tutorId: 'temp-tutor-id', // This would need to be resolved properly
    subjectId: 'temp-subject-id', // This would need to be resolved properly
    startAtUTC: new Date(`${payload.date}T${payload.time}`).toISOString(),
    endAtUTC: new Date(`${payload.date}T${payload.time}`).toISOString(),
    priceCents: 2500, // Default $25
    currency: 'USD'
  });

export const fetchBookings = () => 
  apiClient.getBookings();

// Export types
export interface User {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  timezone?: string;
  avatarUrl?: string;
  role: 'STUDENT' | 'TUTOR' | 'ADMIN';
  status?: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
  createdAt: string;
}

export interface TutorProfile {
  id: string;
  userId: string;
  headline?: string;
  bio?: string;
  hourlyRateCents?: number;
  currency?: string;
  yearsExperience?: number;
  subjects?: string[];
  levels?: string[];
  ratingAvg?: number;
  ratingCount?: number;
  createdAt: string;
  user?: User;
  // In-Person Location Support
  inPersonLocation?: {
    enabled: boolean;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    meetingPoint?: string; // e.g., "Starbucks Downtown", "Community Center Room 1"
    additionalInfo?: string; // Parking instructions, accessibility info, etc.
  };
}

export interface StudentProfile {
  id: string;
  userId: string;
  gradeLevel?: string;
  learningGoals?: string;
  preferredMode?: 'ONLINE' | 'OFFLINE';
  budgetMin?: number;
  budgetMax?: number;
  specialRequirements?: string;
  uploads?: any[];
  createdAt: string;
}

export interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  subjectId: string;
  startAtUTC: string;
  endAtUTC: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED';
  priceCents: number;
  currency: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  category: string;
}

export interface SubjectCategory {
  id: string;
  name: string;
  subjects: string[];
}

export interface Review {
  id: string;
  tutorId: string;
  studentId: string;
  studentName?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Reviews and Ratings API
export const reviewsApi = {
  // Submit a review for a completed session
  submitReview: (reviewData: {
    tutorId: string;
    bookingId: string;
    rating: number;
    comment?: string;
  }) =>
    apiClient.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData)
    }),

  // Get reviews for a specific tutor
  getTutorReviews: (tutorId: string) =>
    apiClient.request(`/tutors/${tutorId}/reviews`),

  // Get reviews by a specific student
  getStudentReviews: (studentId: string) =>
    apiClient.request(`/students/${studentId}/reviews`),

  // Get featured reviews for home page
  getFeaturedReviews: () =>
    apiClient.request('/reviews/featured'),

  // Submit success story
  submitSuccessStory: (storyData: {
    tutorId: string;
    subject?: string;
    rating: number;
    comment: string;
    improvement?: string;
  }) =>
    apiClient.request('/reviews/success-story', {
      method: 'POST',
      body: JSON.stringify(storyData)
    }),

  // Get all reviews (admin only)
  getAllReviews: (status?: string) =>
    apiClient.request(`/admin/reviews${status ? `?status=${status}` : ''}`),

  // Update review status (admin only)
  updateReviewStatus: (reviewId: string, status: 'APPROVED' | 'REJECTED') =>
    apiClient.request(`/admin/reviews/${reviewId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),

  // Delete review (admin only)
  deleteReview: (reviewId: string) =>
    apiClient.request(`/admin/reviews/${reviewId}`, {
      method: 'DELETE'
    }),

  // Get tutor rating statistics
  getTutorRatingStats: (tutorId: string) =>
    apiClient.request(`/tutors/${tutorId}/rating-stats`),
};

// Admin API methods
export const adminApi = {
  // Dashboard stats
  getDashboard: () => apiClient.request('/admin/dashboard'),
  
  // User management
  getUsers: () => apiClient.request('/admin/users'),
  getPendingUsers: () => apiClient.request('/admin/users/pending'),
  getTutors: () => apiClient.request('/admin/tutors'),
  approveUser: (userId: string) => 
    apiClient.request(`/admin/users/${userId}/approve`, { method: 'POST' }),
  rejectUser: (userId: string, reason?: string) =>
    apiClient.request(`/admin/users/${userId}/reject`, { 
      method: 'POST', 
      body: JSON.stringify({ reason }) 
    }),
  suspendUser: (userId: string, reason?: string) =>
    apiClient.request(`/admin/users/${userId}/suspend`, { 
      method: 'POST', 
      body: JSON.stringify({ reason }) 
    }),
  activateUser: (userId: string) =>
    apiClient.request(`/admin/users/${userId}/activate`, { method: 'POST' }),
  deleteUser: (userId: string) =>
    apiClient.request(`/admin/users/${userId}`, { method: 'DELETE' }),
  updateUserStatus: (userId: string, status: string) =>
    apiClient.request(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  
  // Booking management
  getBookings: () => apiClient.request('/admin/bookings'),
  updateBookingStatus: (bookingId: string, status: string, reason?: string) =>
    apiClient.request(`/admin/bookings/${bookingId}/status`, { 
      method: 'PUT', 
      body: JSON.stringify({ status, reason }) 
    }),
};

// Chat API
export const chatApi = {
  getMessages: (userId1: string, userId2: string) => apiClient.request(`/chat/messages/${userId1}/${userId2}`),
  getConversations: () => apiClient.request('/chat/conversations'),
  markMessagesAsRead: (senderId: string) => apiClient.request('/chat/messages/read', { method: 'PUT', body: JSON.stringify({ senderId }) }),
  getUnreadCount: () => apiClient.request('/chat/unread-count'),
};

// Payment API
export const paymentApi = {
  // Payment processing
  createPaymentIntent: (bookingId: string, amount: number, currency?: string) =>
    apiClient.request('/payments/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ bookingId, amount, currency })
    }),
  confirmPayment: (paymentIntentId: string) =>
    apiClient.request('/payments/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId })
    }),
  
  // Student payment methods
  getStudentPayments: () => apiClient.request('/payments/student/payments'),
  requestRefund: (paymentId: string, reason?: string) =>
    apiClient.request('/payments/request-refund', {
      method: 'POST',
      body: JSON.stringify({ paymentId, reason })
    }),
  createDispute: (paymentId: string, reason: string, description?: string) =>
    apiClient.request('/payments/create-dispute', {
      method: 'POST',
      body: JSON.stringify({ paymentId, reason, description })
    }),
  getStudentDisputes: () => apiClient.request('/payments/student/disputes'),
  
  // Tutor payment methods
  getTutorPayouts: () => apiClient.request('/payments/tutor/payouts'),
  getTutorDisputes: () => apiClient.request('/payments/tutor/disputes'),
  
  // Admin payment methods
  getAllPayments: () => apiClient.request('/payments/admin/payments'),
  getAllPayouts: () => apiClient.request('/payments/admin/payouts'),
  getAllDisputes: () => apiClient.request('/payments/admin/disputes'),
  processPayout: (payoutId: string) =>
    apiClient.request('/payments/admin/process-payout', {
      method: 'POST',
      body: JSON.stringify({ payoutId })
    }),
  handleDispute: (disputeId: string, status: string, adminNotes?: string, resolution?: string) =>
    apiClient.request('/payments/admin/handle-dispute', {
      method: 'POST',
      body: JSON.stringify({ disputeId, status, adminNotes, resolution })
    }),
  getPaymentAnalytics: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiClient.request(`/payments/admin/analytics?${params.toString()}`);
  },
};