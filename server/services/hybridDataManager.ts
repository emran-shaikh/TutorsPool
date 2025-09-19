// Hybrid Data Manager - Supports both JSON file and Supabase
import { supabaseService } from './supabaseService.js';
import { dataManager } from '../dataManager.js';

class HybridDataManager {
  private useSupabase: boolean;

  constructor() {
    // Check if Supabase is configured and enabled
    this.useSupabase = process.env.USE_SUPABASE === 'true' && supabaseService.isConfigured();
    
    if (this.useSupabase) {
      console.log('🗄️  Using Supabase database');
    } else {
      console.log('📁 Using JSON file storage (fallback)');
    }
  }

  // User Management
  async createUser(userData: any) {
    if (this.useSupabase) {
      return await supabaseService.createUser(userData);
    } else {
      return dataManager.addUser(userData);
    }
  }

  async getUserById(id: string) {
    if (this.useSupabase) {
      return await supabaseService.getUserById(id);
    } else {
      return dataManager.getUserById(id);
    }
  }

  async getUserByEmail(email: string) {
    if (this.useSupabase) {
      return await supabaseService.getUserByEmail(email);
    } else {
      return dataManager.getUserByEmail(email);
    }
  }

  async getAllUsers() {
    if (this.useSupabase) {
      return await supabaseService.getAllUsers();
    } else {
      return dataManager.getAllUsers();
    }
  }

  async updateUser(id: string, updates: any) {
    if (this.useSupabase) {
      return await supabaseService.updateUser(id, updates);
    } else {
      return dataManager.updateUser(id, updates);
    }
  }

  // Tutor Management
  async createTutor(tutorData: any) {
    if (this.useSupabase) {
      return await supabaseService.createTutor(tutorData);
    } else {
      return dataManager.addTutor(tutorData);
    }
  }

  async getTutorById(id: string) {
    if (this.useSupabase) {
      return await supabaseService.getTutorById(id);
    } else {
      return dataManager.getTutorById(id);
    }
  }

  async getTutorsByUserIds(userIds: string[]) {
    if (this.useSupabase) {
      return await supabaseService.getTutorsByUserIds(userIds);
    } else {
      return dataManager.getTutorsByUserIds(userIds);
    }
  }

  async getAllTutors() {
    if (this.useSupabase) {
      return await supabaseService.getAllTutors();
    } else {
      return dataManager.getAllTutors();
    }
  }

  async updateTutor(id: string, updates: any) {
    if (this.useSupabase) {
      return await supabaseService.updateTutor(id, updates);
    } else {
      return dataManager.updateTutor(id, updates);
    }
  }

  // Student Management
  async createStudent(studentData: any) {
    if (this.useSupabase) {
      return await supabaseService.createStudent(studentData);
    } else {
      return dataManager.addStudent(studentData);
    }
  }

  async getStudentById(id: string) {
    if (this.useSupabase) {
      return await supabaseService.getStudentById(id);
    } else {
      return dataManager.getStudentById(id);
    }
  }

  async getAllStudents() {
    if (this.useSupabase) {
      return await supabaseService.getAllStudents();
    } else {
      return dataManager.getAllStudents();
    }
  }

  // Booking Management
  async createBooking(bookingData: any) {
    if (this.useSupabase) {
      return await supabaseService.createBooking(bookingData);
    } else {
      return dataManager.addBooking(bookingData);
    }
  }

  async getBookingById(id: string) {
    if (this.useSupabase) {
      return await supabaseService.getBookingById(id);
    } else {
      return dataManager.getBookingById(id);
    }
  }

  async getBookingsByStudentId(studentId: string) {
    if (this.useSupabase) {
      return await supabaseService.getBookingsByStudentId(studentId);
    } else {
      return dataManager.getBookingsByStudentId(studentId);
    }
  }

  async getBookingsByTutorId(tutorId: string) {
    if (this.useSupabase) {
      return await supabaseService.getBookingsByTutorId(tutorId);
    } else {
      return dataManager.getBookingsByTutorId(tutorId);
    }
  }

  async updateBooking(id: string, updates: any) {
    if (this.useSupabase) {
      return await supabaseService.updateBooking(id, updates);
    } else {
      return dataManager.updateBooking(id, updates);
    }
  }

  async getAllBookings() {
    if (this.useSupabase) {
      return await supabaseService.getAllBookings();
    } else {
      return dataManager.getAllBookings();
    }
  }

  // Review Management
  async createReview(reviewData: any) {
    if (this.useSupabase) {
      return await supabaseService.createReview(reviewData);
    } else {
      return dataManager.addReview(reviewData);
    }
  }

  async getReviewsByTutorId(tutorId: string) {
    if (this.useSupabase) {
      return await supabaseService.getReviewsByTutorId(tutorId);
    } else {
      return dataManager.getReviewsByTutorId(tutorId);
    }
  }

  async getFeaturedReviews() {
    if (this.useSupabase) {
      return await supabaseService.getFeaturedReviews();
    } else {
      return dataManager.getFeaturedReviews();
    }
  }

  async updateReview(id: string, updates: any) {
    if (this.useSupabase) {
      return await supabaseService.updateReview(id, updates);
    } else {
      return dataManager.updateReview(id, updates);
    }
  }

  // Notification Management
  async createNotification(notificationData: any) {
    if (this.useSupabase) {
      return await supabaseService.createNotification(notificationData);
    } else {
      return dataManager.addNotification(notificationData);
    }
  }

  async getNotificationsByUserId(userId: string) {
    if (this.useSupabase) {
      return await supabaseService.getNotificationsByUserId(userId);
    } else {
      return dataManager.getNotificationsByUserId(userId);
    }
  }

  async markNotificationAsRead(id: string) {
    if (this.useSupabase) {
      return await supabaseService.markNotificationAsRead(id);
    } else {
      return dataManager.markNotificationAsRead(id);
    }
  }

  // Message Management (Chat)
  async createMessage(messageData: any) {
    if (this.useSupabase) {
      return await supabaseService.createMessage(messageData);
    } else {
      return dataManager.addMessage(messageData);
    }
  }

  async getMessagesByUsers(userId1: string, userId2: string) {
    if (this.useSupabase) {
      return await supabaseService.getMessagesByUsers(userId1, userId2);
    } else {
      return dataManager.getMessagesByUsers(userId1, userId2);
    }
  }

  // Payment Management
  async createPayment(paymentData: any) {
    if (this.useSupabase) {
      return await supabaseService.createPayment(paymentData);
    } else {
      return dataManager.addPayment(paymentData);
    }
  }

  async getPaymentsByStudentId(studentId: string) {
    if (this.useSupabase) {
      return await supabaseService.getPaymentsByStudentId(studentId);
    } else {
      return dataManager.getPaymentsByStudentId(studentId);
    }
  }

  async updatePayment(id: string, updates: any) {
    if (this.useSupabase) {
      return await supabaseService.updatePayment(id, updates);
    } else {
      return dataManager.updatePayment(id, updates);
    }
  }

  // Utility methods
  isUsingSupabase(): boolean {
    return this.useSupabase;
  }

  // Initialize sample data (only for JSON fallback)
  initializeSampleData(): void {
    if (!this.useSupabase) {
      dataManager.initializeSampleData();
    }
  }
}

export const hybridDataManager = new HybridDataManager();
