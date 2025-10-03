// Hybrid Data Manager - Supports Firebase, Supabase, and JSON fallback
import { supabaseService } from './supabaseService.js';
import { firebaseService } from './firebaseService.js';
import { dataManager } from '../dataManager.js';

class HybridDataManager {
  private useFirebase: boolean;
  private useSupabase: boolean;

  constructor() {
    // Check priority: Firebase → Supabase → JSON fallback
    this.useFirebase = this.shouldUseFirebase();
    this.useSupabase = !this.useFirebase && this.shouldUseSupabase();
    
    if (this.useFirebase) {
      console.log('🔥 Using Firebase database');
    } else if (this.useSupabase) {
      console.log('🗄️  Using Supabase database');
    } else {
      console.log('📁 Using JSON file storage (fallback)');
    }
  }

  private shouldUseFirebase(): boolean {
    return process.env.USE_FIREBASE === 'true' && firebaseService.isConfigured();
  }

  private shouldUseSupabase(): boolean {
    return process.env.USE_SUPABASE === 'true' && supabaseService.isConfigured();
  }

  // User Management
  async createUser(userData: any) {
    if (this.useFirebase) {
      return await firebaseService.createUser(userData);
    } else if (this.useSupabase) {
      return await supabaseService.createUser(userData);
    } else {
      return dataManager.addUser(userData);
    }
  }

  async getUserById(id: string) {
    if (this.useFirebase) {
      return await firebaseService.getUserById(id);
    } else if (this.useSupabase) {
      return await supabaseService.getUserById(id);
    } else {
      return dataManager.getUserById(id);
    }
  }

  async getUserByEmail(email: string) {
    if (this.useFirebase) {
      return await firebaseService.getUserByEmail(email);
    } else if (this.useSupabase) {
      return await supabaseService.getUserByEmail(email);
    } else {
      return dataManager.getUserByEmail(email);
    }
  }

  async updateUser(id: string, updates: any) {
    if (this.useFirebase) {
      return await firebaseService.updateUser(id, updates);
    } else if (this.useSupabase) {
      return await supabaseService.updateUser(id, updates);
    } else {
      return dataManager.updateUser(id, updates);
    }
  }

  async deleteUser(id: string) {
    if (this.useFirebase) {
      return await firebaseService.deleteUser(id);
    } else if (this.useSupabase) {
      return await supabaseService.deleteUser(id);
    } else {
      return dataManager.deleteUser(id);
    }
  }

  async getAllUsers() {
    if (this.useFirebase) {
      return await firebaseService.getAllUsers();
    } else if (this.useSupabase) {
      return await supabaseService.getAllUsers();
    } else {
      return dataManager.getAllUsers();
    }
  }

  // Tutor Management
  async createTutor(tutorData: any) {
    if (this.useFirebase) {
      return await firebaseService.createTutor(tutorData);
    } else if (this.useSupabase) {
      return await supabaseService.createTutor(tutorData);
    } else {
      return dataManager.addTutor(tutorData);
    }
  }

  async getAllTutors() {
    if (this.useFirebase) {
      return await firebaseService.getAllTutors();
    } else if (this.useSupabase) {
      return await supabaseService.getAllTutors();
    } else {
      return dataManager.getAllTutors();
    }
  }

  async getTutorById(id: string) {
    if (this.useFirebase) {
      const tutors = await firebaseService.getAllTutors();
      return tutors.find(tutor => tutor.id === id) || null;
    } else if (this.useSupabase) {
      return await supabaseService.getTutorById(id);
    } else {
      return dataManager.getTutorById(id);
    }
  }

  async updateTutor(id: string, updates: any) {
    if (this.useFirebase) {
      return await firebaseService.updateUser(id, updates); // Assuming tutors are stored in users collection
    } else if (this.useSupabase) {
      return await supabaseService.updateTutor(id, updates);
    } else {
      return dataManager.updateTutor(id, updates);
    }
  }

  // Student Management
  async createStudent(studentData: any) {
    if (this.useFirebase) {
      return await firebaseService.createUser({
        ...studentData,
        role: 'STUDENT'
      });
    } else if (this.useSupabase) {
      return await supabaseService.createStudent(studentData);
    } else {
      return dataManager.addStudent(studentData);
    }
  }

  async getStudentById(id: string) {
    if (this.useFirebase) {
      return await firebaseService.getUserById(id);
    } else if (this.useSupabase) {
      return await supabaseService.getStudentById(id);
    } else {
      return dataManager.getStudentById(id);
    }
  }

  async getAllStudents() {
    if (this.useFirebase) {
      const users = await firebaseService.getAllUsers();
      return users.filter(user => user.role === 'STUDENT');
    } else if (this.useSupabase) {
      return await supabaseService.getAllStudents();
    } else {
      return dataManager.getAllStudents();
    }
  }

  // Booking Management
  async createBooking(bookingData: any) {
    if (this.useFirebase) {
      // Firebase booking logic would go here
      return dataManager.addBooking(bookingData); // Fallback for now
    } else if (this.useSupabase) {
      return await supabaseService.createBooking(bookingData);
    } else {
      return dataManager.addBooking(bookingData);
    }
  }

  async getBookingById(id: string) {
    if (this.useFirebase) {
      // Firebase booking lookup would go here
      return dataManager.getBookingById(id); // Fallback for now
    } else if (this.useSupabase) {
      return await supabaseService.getBookingById(id);
    } else {
      return dataManager.getBookingById(id);
    }
  }

  async getAllBookings() {
    if (this.useFirebase) {
      // Firebase bookings fetch would go here
      return dataManager.getAllBookings(); // Fallback for now
    } else if (this.useSupabase) {
      return await supabaseService.getAllBookings();
    } else {
      return dataManager.getAllBookings();
    }
  }

  getBookingsByStudentId(studentId: string) {
    if (this.useFirebase) {
      return dataManager.getBookingsByStudentId(studentId); // Fallback for now
    } else if (this.useSupabase) {
      return dataManager.getBookingsByStudentId(studentId); // Fallback for now
    } else {
      return dataManager.getBookingsByStudentId(studentId);
    }
  }

  getBookingsByTutorId(tutorId: string) {
    if (this.useFirebase) {
      return dataManager.getBookingsByTutorId(tutorId); // Fallback for now
    } else if (this.useSupabase) {
      return dataManager.getBookingsByTutorId(tutorId); // Fallback for now
    } else {
      return dataManager.getBookingsByTutorId(tutorId);
    }
  }

  // Payment Management
  createPayment(paymentData: any) {
    if (this.useFirebase) {
      return dataManager.addPayment(paymentData); // Fallback for now
    } else if (this.useSupabase) {
      return dataManager.addPayment(paymentData); // Fallback for now
    } else {
      return dataManager.addPayment(paymentData);
    }
  }

  updatePayment(id: string, updates: any) {
    if (this.useFirebase) {
      return dataManager.updatePayment(id, updates); // Fallback for now
    } else if (this.useSupabase) {
      return dataManager.updatePayment(id, updates); // Fallback for now
    } else {
      return dataManager.updatePayment(id, updates);
    }
  }

  getPaymentByStripeId(stripeId: string) {
    if (this.useFirebase) {
      return dataManager.getPaymentByStripeId(stripeId); // Fallback for now
    } else if (this.useSupabase) {
      return dataManager.getPaymentByStripeId(stripeId); // Fallback for now
    } else {
      return dataManager.getPaymentByStripeId(stripeId);
    }
  }

  getAllPayments() {
    if (this.useFirebase) {
      return dataManager.getAllPayments(); // Fallback for now
    } else if (this.useSupabase) {
      return dataManager.getAllPayments(); // Fallback for now
    } else {
      return dataManager.getAllPayments();
    }
  }

  // Notification Management
  addNotification(notificationData: any) {
    if (this.useFirebase) {
      return dataManager.addNotification(notificationData); // Fallback for now
    } else if (this.useSupabase) {
      return dataManager.addNotification(notificationData); // Fallback for now
    } else {
      return dataManager.addNotification(notificationData);
    }
  }

  getNotifications(userId: string) {
    if (this.useFirebase) {
      return dataManager.getNotifications(userId); // Fallback for now
    } else if (this.useSupabase) {
      return dataManager.getNotifications(userId); // Fallback for now
    } else {
      return dataManager.getNotifications(userId);
    }
  }

  // Utility Methods
  clearAllData() {
    if (this.useFirebase) {
      return firebaseService.clearAllData();
    } else if (this.useSupabase) {
      return supabaseService.clearAllData();
    } else {
      return dataManager.clearAllData();
    }
  }

  // Data manager compatibility methods
  get user() {
    return dataManager.user;
  }

  get tutor() {
    return dataManager.tutor;
  }

  get student() {
    return dataManager.student;
  }

  get tutorByUserId() {
    return dataManager.tutorByUserId;
  }

  get tutorById() {
    return this.getTutorById.bind(this);
  }

  get studentById() {
    return this.getStudentById.bind(this);
  }

  get bookingsByTutorId() {
    return this.getBookingsByTutorId.bind(this);
  }

  get bookingsByStudentId() {
    return this.getBookingsByStudentId.bind(this);
  }

  getAllAppointments() {
    return this.getAllBookings.bind(this);
  }

  addAppointment(appointmentData: any) {
    return this.createBooking.bind(this);
  }

  // Approval methods for existing compatibility
  async approveUser(userId?): Promise<any> {
    if (this.useFirebase) {
      return await firebaseService.updateUser(userId, { status: 'ACTIVE' });
    } else if (this.useSupabase) {
      return await supabaseService.approveUser(userId, 'admin');
    } else {
      return dataManager.approveUser(userId, 'admin');
    }
  }

  async rejectUser(userId?): Promise<any> {
    if (this.useFirebase) {
      return await firebaseService.updateUser(userId, { status: 'REJECTED' });
    } else if (this.useSupabase) {
      return await supabaseService.rejectUser(userId, 'admin');
    } else {
      return dataManager.rejectUser(userId, 'admin');
    }
  }

  async suspendUser(userId: string): Promise<any> {
    if (this.useFirebase) {
      return await firebaseService.updateUser(userId, { status: 'SUSPENDED' });
    } else if (this.useSupabase) {
      return await supabaseService.suspendUser(userId, 'admin');
    } else {
      return dataManager.suspendUser(userId, 'admin');
    }
  }

  // Advanced Firebase-specific methods
  async addBooking(bookingData: any) {
    return this.createBooking(bookingData);
  }

  async getUserById(userId: string) {
    return this.getUserById(userId);
  }

  async createUser(userData: any) {
    return this.createUser(userData);
  }

  async updateUserStatus(userId: string, status: string, adminId?: string) {
    const updates = { status };
    if (adminId) {
      updates.approvedBy = adminId;
      updates.approvedAt = new Date().toISOString();
    }
    return this.updateUser(userId, updates);
  }

  // New methods for compatibility
  async getStudentProfileByUserId(userId: string) {
    return this.getStudentById(userId);
  }

  async addBookingWithNotification(bookingData: any) {
    const booking = await this.createBooking(bookingData);
    
    // Add notification
    this.addNotification({
      id: `booking-${Date.now()}`,
      userId: booking.studentId,
      type: 'BOOKING_CONFIRMED',
      title: 'Booking Confirmed',
      message: 'Your tutor session has been confirmed!',
      createdAt: new Date().toISOString(),
      read: false
    });

    return booking;
  }
}

export const hybridDataManager = new HybridDataManager();
export default hybridDataManager;
