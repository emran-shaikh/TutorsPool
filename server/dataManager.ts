import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data.json');

interface DataStore {
  users: any[];
  tutors: any[];
  students: any[];
  bookings: any[];
  learningProgress: { [studentId: string]: any };
  reviews: any[];
  notifications: any[];
  messages: any[];
  payments: any[];
  payouts: any[];
  disputes: any[];
  lastId: number;
}

class DataManager {
  private data: DataStore;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DataStore {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        const data = JSON.parse(fileContent);
        
        // Ensure all required arrays exist
        if (!data.users) data.users = [];
        if (!data.tutors) data.tutors = [];
        if (!data.students) data.students = [];
        if (!data.bookings) data.bookings = [];
        if (!data.learningProgress) data.learningProgress = {};
        if (!data.reviews) data.reviews = [];
        if (!data.notifications) data.notifications = [];
        if (!data.messages) data.messages = [];
        if (!data.payments) data.payments = [];
        if (!data.payouts) data.payouts = [];
        if (!data.disputes) data.disputes = [];
        if (!data.lastId) data.lastId = 0;
        
        return data;
      }
    } catch (error) {
      console.error('Error loading data file:', error);
    }
    
    // Return default empty structure
    return {
      users: [],
      tutors: [],
      students: [],
      bookings: [],
      learningProgress: {},
      reviews: [],
      notifications: [],
      messages: [],
      payments: [],
      payouts: [],
      disputes: [],
      lastId: 0
    };
  }

  private saveData(): void {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving data file:', error);
    }
  }

  // User methods
  addUser(user: any): void {
    user.id = `user-${++this.data.lastId}`;
    user.createdAt = new Date().toISOString();
    user.status = user.status || 'PENDING'; // Default to PENDING for new users
    user.approvedAt = null;
    user.approvedBy = null;
    user.avatarUrl = user.avatarUrl || null; // Add avatar support
    this.data.users.push(user);
    this.saveData();
  }

  getUserById(id: string): any {
    return this.data.users.find(u => u.id === id);
  }

  updateUser(id: string, updates: any): void {
    const userIndex = this.data.users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      this.data.users[userIndex] = { ...this.data.users[userIndex], ...updates };
      this.saveData();
    }
  }


  getUserByEmail(email: string): any {
    return this.data.users.find(u => u.email === email);
  }

  getAllUsers(): any[] {
    return this.data.users;
  }

  // User approval methods
  approveUser(userId: string, approvedBy: string): void {
    const userIndex = this.data.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.data.users[userIndex] = { 
        ...this.data.users[userIndex], 
        status: 'ACTIVE',
        approvedAt: new Date().toISOString(),
        approvedBy: approvedBy
      };
      this.saveData();
    }
  }

  rejectUser(userId: string, rejectedBy: string, reason?: string): void {
    const userIndex = this.data.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.data.users[userIndex] = { 
        ...this.data.users[userIndex], 
        status: 'REJECTED',
        rejectedAt: new Date().toISOString(),
        rejectedBy: rejectedBy,
        rejectionReason: reason
      };
      this.saveData();
    }
  }

  suspendUser(userId: string, suspendedBy: string, reason?: string): void {
    const userIndex = this.data.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.data.users[userIndex] = { 
        ...this.data.users[userIndex], 
        status: 'SUSPENDED',
        suspendedAt: new Date().toISOString(),
        suspendedBy: suspendedBy,
        suspensionReason: reason
      };
      this.saveData();
    }
  }

  getPendingUsers(): any[] {
    return this.data.users.filter(u => u.status === 'PENDING');
  }

  getUsersByStatus(status: string): any[] {
    return this.data.users.filter(u => u.status === status);
  }

  // Tutor methods
  addTutor(tutor: any): void {
    tutor.id = `tutor-${++this.data.lastId}`;
    tutor.createdAt = new Date().toISOString();
    this.data.tutors.push(tutor);
    this.saveData();
  }

  getTutorById(id: string): any {
    return this.data.tutors.find(t => t.id === id);
  }

  getTutorByUserId(userId: string): any {
    return this.data.tutors.find(t => t.userId === userId);
  }

  updateTutor(id: string, updates: any): void {
    const tutorIndex = this.data.tutors.findIndex(t => t.id === id);
    if (tutorIndex !== -1) {
      this.data.tutors[tutorIndex] = { ...this.data.tutors[tutorIndex], ...updates };
      this.saveData();
    }
  }

  getAllTutors(): any[] {
    return this.data.tutors;
  }

  // Student methods
  addStudent(student: any): void {
    student.id = `student-${++this.data.lastId}`;
    student.createdAt = new Date().toISOString();
    this.data.students.push(student);
    this.saveData();
  }

  getStudentById(id: string): any {
    return this.data.students.find(s => s.id === id);
  }

  getStudentByUserId(userId: string): any {
    return this.data.students.find(s => s.userId === userId);
  }

  getStudentProfileByUserId(userId: string): any {
    const student = this.data.students.find(s => s.userId === userId);
    if (!student) return null;
    
    // Get student's bookings for analysis
    const bookings = this.getBookingsByStudentId(userId);
    
    return {
      ...student,
      bookings: bookings
    };
  }

  updateStudent(id: string, updates: any): void {
    const studentIndex = this.data.students.findIndex(s => s.id === id);
    if (studentIndex !== -1) {
      this.data.students[studentIndex] = { ...this.data.students[studentIndex], ...updates };
      this.saveData();
    }
  }

  getAllStudents(): any[] {
    return this.data.students;
  }

  // Booking methods
  addBooking(booking: any): void {
    booking.id = `booking-${++this.data.lastId}`;
    booking.createdAt = new Date().toISOString();
    this.data.bookings.push(booking);
    this.saveData();
  }

  getBookingById(id: string): any {
    return this.data.bookings.find(b => b.id === id);
  }

  getBookingsByTutorId(tutorId: string): any[] {
    return this.data.bookings.filter(b => b.tutorId === tutorId);
  }

  getBookingsByStudentId(studentId: string): any[] {
    return this.data.bookings.filter(b => b.studentId === studentId);
  }

  updateBooking(id: string, updates: any): void {
    const bookingIndex = this.data.bookings.findIndex(b => b.id === id);
    if (bookingIndex !== -1) {
      this.data.bookings[bookingIndex] = { ...this.data.bookings[bookingIndex], ...updates };
      this.saveData();
    }
  }

  getAllBookings(): any[] {
    return this.data.bookings;
  }

  // Initialize with sample data if empty
  clearAllData(): void {
    this.data = {
      users: [],
      tutors: [],
      students: [],
      bookings: [],
      learningProgress: {},
      reviews: [],
      notifications: [],
      messages: [],
      payments: [],
      payouts: [],
      disputes: [],
      lastId: 0
    };
    this.saveData();
    console.log('[DATA MANAGER] All data cleared');
  }

  initializeSampleData(): void {
    console.log(`[DATA MANAGER] Current users count: ${this.data.users.length}`);
    console.log(`[DATA MANAGER] Current tutors count: ${this.data.tutors.length}`);
    if (this.data.users.length === 0) {
      console.log('[DATA MANAGER] Loading sample data...');
      const sampleUsers = [
        {
          id: 'user-1',
          name: 'John Smith',
          email: 'john@example.com',
          phone: '+1234567890',
          country: 'USA',
          timezone: 'America/New_York',
          role: 'TUTOR',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
          approvedBy: 'user-4',
        },
        {
          id: 'user-2',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          phone: '+1234567891',
          country: 'USA',
          timezone: 'America/New_York',
          role: 'TUTOR',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
          approvedBy: 'user-4',
        },
        {
          id: 'user-3',
          name: 'Mike Wilson',
          email: 'mike@example.com',
          phone: '+1234567892',
          country: 'USA',
          timezone: 'America/New_York',
          role: 'STUDENT',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
          approvedBy: 'user-4',
        },
        {
          id: 'user-4',
          name: 'Admin User',
          email: 'admin@example.com',
          phone: '+1234567893',
          country: 'USA',
          timezone: 'America/New_York',
          role: 'ADMIN',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
          approvedBy: 'system',
        },
        // Add some pending users for testing
        {
          id: 'user-5',
          name: 'Pending Tutor',
          email: 'pending.tutor@example.com',
          phone: '+1234567894',
          country: 'USA',
          timezone: 'America/New_York',
          role: 'TUTOR',
          status: 'PENDING',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          approvedAt: null,
          approvedBy: null,
        },
        {
          id: 'user-6',
          name: 'Pending Student',
          email: 'pending.student@example.com',
          phone: '+1234567895',
          country: 'USA',
          timezone: 'America/New_York',
          role: 'STUDENT',
          status: 'PENDING',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          approvedAt: null,
          approvedBy: null,
        }
      ];

      const sampleTutors = [
        {
          id: 'tutor-1',
          userId: 'user-1',
          headline: 'Experienced Math Tutor',
          bio: 'I have been teaching mathematics for over 5 years. I specialize in algebra, calculus, and statistics.',
          hourlyRateCents: 2500,
          currency: 'USD',
          yearsExperience: 5,
          subjects: ['Mathematics', 'Statistics'],
          levels: ['High School (9-12)', 'College/University'],
          slug: 'john-smith-math',
          certifications: ['Bachelor of Mathematics', 'Teaching Certificate'],
          rating: 4.8,
          ratingCount: 24,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'tutor-2',
          userId: 'user-2',
          headline: 'Science Expert',
          bio: 'Passionate about physics and chemistry with 3 years of tutoring experience.',
          hourlyRateCents: 3000,
          currency: 'USD',
          yearsExperience: 3,
          subjects: ['Physics', 'Chemistry'],
          levels: ['High School (9-12)', 'College/University'],
          slug: 'sarah-johnson-science',
          certifications: ['Master of Physics', 'Chemistry Teaching License'],
          rating: 4.9,
          ratingCount: 18,
          createdAt: new Date().toISOString(),
        }
      ];

      const sampleBookings = [
        {
          id: 'booking-1',
          studentId: 'user-2',
          tutorId: 'tutor-1',
          subjectId: 'math-algebra',
          startAtUTC: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endAtUTC: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
          status: 'PENDING',
          priceCents: 2500,
          currency: 'USD',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'booking-2',
          studentId: 'user-3',
          tutorId: 'tutor-2',
          subjectId: 'science-physics',
          startAtUTC: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          endAtUTC: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
          status: 'CONFIRMED',
          priceCents: 3000,
          currency: 'USD',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'booking-3',
          studentId: 'user-2',
          tutorId: 'tutor-1',
          subjectId: 'math-calculus',
          startAtUTC: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          endAtUTC: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
          status: 'COMPLETED',
          priceCents: 2500,
          currency: 'USD',
          createdAt: new Date().toISOString(),
        },
        // Add completed bookings for user-153 (the current student)
        {
          id: 'booking-student-1',
          studentId: 'user-153',
          tutorId: 'tutor-143',
          subjectId: 'mathematics',
          startAtUTC: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endAtUTC: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
          status: 'COMPLETED',
          priceCents: 5000,
          currency: 'USD',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'booking-student-2',
          studentId: 'user-153',
          tutorId: 'tutor-143',
          subjectId: 'physics',
          startAtUTC: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          endAtUTC: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
          status: 'COMPLETED',
          priceCents: 7500,
          currency: 'USD',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ];

      // Add sample reviews
      const sampleReviews = [
        {
          id: 'review-sample-1',
          tutorId: 'tutor-1',
          studentId: 'user-2',
          bookingId: 'booking-1',
          rating: 5,
          comment: 'John is an amazing math tutor! He helped me understand calculus concepts that I was struggling with for months. His teaching style is clear and patient.',
          subject: 'A Level Mathematics',
          improvement: 'Grade improved from C to A*',
          status: 'APPROVED',
          isSuccessStory: true,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'review-sample-2',
          tutorId: 'tutor-2',
          studentId: 'user-2',
          bookingId: 'booking-2',
          rating: 5,
          comment: 'Sarah made physics so much easier to understand! Her real-world examples and interactive approach helped me ace my final exam.',
          subject: 'IGCSE Physics',
          improvement: 'Achieved 92% in final exam',
          status: 'APPROVED',
          isSuccessStory: true,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'review-sample-3',
          tutorId: 'tutor-1',
          studentId: 'user-3',
          bookingId: 'booking-3',
          rating: 5,
          comment: 'Absolutely brilliant! This tutor transformed my understanding of mathematics. I went from failing to getting top grades in my class.',
          subject: 'O Level Mathematics',
          improvement: 'From failing to top of class',
          status: 'APPROVED',
          isSuccessStory: true,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'review-sample-4',
          tutorId: 'tutor-2',
          studentId: 'user-3',
          rating: 5,
          comment: 'The best chemistry tutor I\'ve ever had! She makes complex reactions seem simple and her lab examples are fantastic.',
          subject: 'A Level Chemistry',
          improvement: 'Mastered organic chemistry',
          status: 'APPROVED',
          isSuccessStory: true,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ];

      this.data.users = sampleUsers;
      this.data.tutors = sampleTutors;
      this.data.bookings = sampleBookings;
      this.data.reviews = sampleReviews;
      this.data.lastId = 10;
      this.saveData();
      console.log('[DATA MANAGER] Sample data loaded successfully');
    } else {
      console.log('[DATA MANAGER] Sample data already exists, skipping load');
    }
  }

  // Simple Learning Progress methods
  getLearningProgress(studentId: string) {
    // Initialize learningProgress if it doesn't exist (for existing data files)
    if (!this.data.learningProgress) {
      this.data.learningProgress = {};
    }
    
    if (!this.data.learningProgress[studentId]) {
      // Initialize with default data for new students
      this.data.learningProgress[studentId] = {
        totalGoals: 0,
        completedGoals: 0,
        totalSessions: 0,
        completedSessions: 0,
        currentStreak: 0,
        totalHours: 0,
        recentGoals: [],
        upcomingSessions: []
      };
      this.saveData();
    }
    return this.data.learningProgress[studentId];
  }

  addLearningGoal(studentId: string, goal: any) {
    // Initialize learningProgress if it doesn't exist
    if (!this.data.learningProgress) {
      this.data.learningProgress = {};
    }
    if (!this.data.learningProgress[studentId]) {
      this.getLearningProgress(studentId); // Initialize if needed
    }
    
    const progress = this.data.learningProgress[studentId];
    progress.recentGoals.push(goal);
    progress.totalGoals = progress.recentGoals.length;
    progress.completedGoals = progress.recentGoals.filter(g => g.status === 'COMPLETED').length;
    
    this.saveData();
    return goal;
  }

  updateLearningGoal(studentId: string, goalId: string, updates: any) {
    // Initialize learningProgress if it doesn't exist
    if (!this.data.learningProgress) {
      this.data.learningProgress = {};
    }
    if (!this.data.learningProgress[studentId]) {
      return null;
    }
    
    const progress = this.data.learningProgress[studentId];
    const goalIndex = progress.recentGoals.findIndex(g => g.id === goalId);
    if (goalIndex !== -1) {
      progress.recentGoals[goalIndex] = { ...progress.recentGoals[goalIndex], ...updates };
      progress.completedGoals = progress.recentGoals.filter(g => g.status === 'COMPLETED').length;
      this.saveData();
      return progress.recentGoals[goalIndex];
    }
    return null;
  }

  deleteLearningGoal(studentId: string, goalId: string) {
    // Initialize learningProgress if it doesn't exist
    if (!this.data.learningProgress) {
      this.data.learningProgress = {};
    }
    if (!this.data.learningProgress[studentId]) {
      return false;
    }
    
    const progress = this.data.learningProgress[studentId];
    progress.recentGoals = progress.recentGoals.filter(g => g.id !== goalId);
    progress.totalGoals = progress.recentGoals.length;
    progress.completedGoals = progress.recentGoals.filter(g => g.status === 'COMPLETED').length;
    
    this.saveData();
    return true;
  }

  addUpcomingSession(studentId: string, session: any) {
    // Initialize learningProgress if it doesn't exist
    if (!this.data.learningProgress) {
      this.data.learningProgress = {};
    }
    if (!this.data.learningProgress[studentId]) {
      this.getLearningProgress(studentId); // Initialize if needed
    }
    
    const progress = this.data.learningProgress[studentId];
    progress.upcomingSessions.push(session);
    this.saveData();
    return session;
  }

  completeSession(studentId: string, sessionId: string) {
    // Initialize learningProgress if it doesn't exist
    if (!this.data.learningProgress) {
      this.data.learningProgress = {};
    }
    if (!this.data.learningProgress[studentId]) {
      return false;
    }
    
    const progress = this.data.learningProgress[studentId];
    const sessionIndex = progress.upcomingSessions.findIndex(s => s.id === sessionId);
    if (sessionIndex !== -1) {
      const completedSession = progress.upcomingSessions.splice(sessionIndex, 1)[0];
      progress.completedSessions++;
      progress.totalSessions++;
      progress.currentStreak++;
      progress.totalHours += completedSession.duration || 60;
      this.saveData();
      return true;
    }
    return false;
  }

  // Review and Rating methods
  addReview(review: any) {
    review.id = `review-${++this.data.lastId}`;
    review.createdAt = new Date().toISOString();
    review.status = 'PENDING'; // Reviews need admin approval
    this.data.reviews.push(review);
    this.saveData();
    return review;
  }

  getReviewsByTutor(tutorId: string) {
    return this.data.reviews.filter(r => r.tutorId === tutorId && r.status === 'APPROVED');
  }

  getReviewsByStudent(studentId: string) {
    return this.data.reviews.filter(r => r.studentId === studentId);
  }

  getReviewById(reviewId: string) {
    return this.data.reviews.find(r => r.id === reviewId);
  }

  updateReviewStatus(reviewId: string, status: string, adminId: string) {
    const reviewIndex = this.data.reviews.findIndex(r => r.id === reviewId);
    if (reviewIndex !== -1) {
      this.data.reviews[reviewIndex].status = status;
      this.data.reviews[reviewIndex].reviewedAt = new Date().toISOString();
      this.data.reviews[reviewIndex].reviewedBy = adminId;
      this.saveData();
      return this.data.reviews[reviewIndex];
    }
    return null;
  }

  getTutorAverageRating(tutorId: string) {
    const approvedReviews = this.getReviewsByTutor(tutorId);
    if (approvedReviews.length === 0) return 0;
    
    const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((totalRating / approvedReviews.length) * 10) / 10; // Round to 1 decimal place
  }

  getTutorRatingStats(tutorId: string) {
    const approvedReviews = this.getReviewsByTutor(tutorId);
    if (approvedReviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((totalRating / approvedReviews.length) * 10) / 10;
    
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    approvedReviews.forEach(review => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    return {
      averageRating,
      totalReviews: approvedReviews.length,
      ratingDistribution
    };
  }

  getAllReviews(status?: string) {
    if (status) {
      return this.data.reviews.filter(r => r.status === status);
    }
    return this.data.reviews;
  }

  getFeaturedReviews() {
    // Get approved reviews with high ratings (4+ stars)
    const featuredReviews = this.data.reviews
      .filter(r => r.status === 'APPROVED' && r.rating >= 4)
      .sort((a, b) => {
        // Sort by rating (descending) then by creation date (newest first)
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 6) // Get top 6 reviews
      .map(review => {
        // Enrich with student and tutor information
        const student = this.getUserById(review.studentId);
        const tutor = this.getTutorById(review.tutorId);
        const tutorUser = tutor ? this.getUserById(tutor.userId) : null;
        
        // Get booking details for subject information
        const booking = review.bookingId ? this.getBookingById(review.bookingId) : null;
        
        return {
          ...review,
          studentName: student?.name || 'Anonymous Student',
          studentImage: student?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student?.name || 'Student')}&background=random`,
          tutorName: tutorUser?.name || 'Tutor',
          subject: review.subject || booking?.subjectId || 'General Tutoring',
          improvement: review.improvement || 'Significant improvement achieved'
        };
      });

    return featuredReviews;
  }

  deleteReview(reviewId: string) {
    const reviewIndex = this.data.reviews.findIndex(r => r.id === reviewId);
    if (reviewIndex !== -1) {
      this.data.reviews.splice(reviewIndex, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  // Notification methods
  addNotification(notification: {
    userId: string;
    type: 'BOOKING_REQUEST' | 'BOOKING_CONFIRMED' | 'BOOKING_REJECTED' | 'BOOKING_CANCELLED' | 'SESSION_REMINDER' | 'REVIEW_RECEIVED' | 'NEW_MESSAGE' | 'DISPUTE_CREATED';
    title: string;
    message: string;
    data?: any;
    read?: boolean;
  }) {
    const newNotification = {
      id: `notification-${++this.data.lastId}`,
      ...notification,
      read: notification.read || false,
      createdAt: new Date().toISOString()
    };
    this.data.notifications.push(newNotification);
    this.saveData();
    return newNotification;
  }

  getNotificationsByUserId(userId: string, unreadOnly: boolean = false) {
    let notifications = this.data.notifications.filter(n => n.userId === userId);
    if (unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }
    return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  markNotificationAsRead(notificationId: string) {
    const notificationIndex = this.data.notifications.findIndex(n => n.id === notificationId);
    if (notificationIndex !== -1) {
      this.data.notifications[notificationIndex].read = true;
      this.data.notifications[notificationIndex].readAt = new Date().toISOString();
      this.saveData();
      return true;
    }
    return false;
  }

  markAllNotificationsAsRead(userId: string) {
    this.data.notifications.forEach(notification => {
      if (notification.userId === userId && !notification.read) {
        notification.read = true;
        notification.readAt = new Date().toISOString();
      }
    });
    this.saveData();
  }

  getUnreadNotificationCount(userId: string) {
    return this.data.notifications.filter(n => n.userId === userId && !n.read).length;
  }

  // Enhanced booking method with notifications
  addBookingWithNotification(booking: any) {
    this.addBooking(booking);
    const newBooking = this.getAllBookings().find(b => 
      b.studentId === booking.studentId && 
      b.tutorId === booking.tutorId && 
      b.startAtUTC === booking.startAtUTC
    );
    
    if (!newBooking) {
      throw new Error('Failed to create booking');
    }
    
    // Send notification to tutor about new booking request
    const tutor = this.getTutorById(booking.tutorId);
    if (tutor) {
      const student = this.getUserById(booking.studentId);
      this.addNotification({
        userId: tutor.userId,
        type: 'BOOKING_REQUEST',
        title: 'New Session Request',
        message: `${student?.name || 'A student'} has requested a ${booking.subjectId || 'tutoring'} session with you.`,
        data: {
          bookingId: newBooking.id,
          studentId: booking.studentId,
          studentName: student?.name,
          subject: booking.subjectId,
          startAt: booking.startAtUTC,
          endAt: booking.endAtUTC
        }
      });
    }
    
    return newBooking;
  }

  // Enhanced booking update with notifications
  updateBookingWithNotification(bookingId: string, updates: any, updatedBy: string) {
    const booking = this.getBookingById(bookingId);
    if (!booking) return false;

    const oldStatus = booking.status;
    this.updateBooking(bookingId, updates);
    const updatedBooking = this.getBookingById(bookingId);

    // Send notifications based on status change
    if (oldStatus !== updatedBooking.status) {
      const tutor = this.getTutorById(booking.tutorId);
      const student = this.getUserById(booking.studentId);
      
      if (updatedBooking.status === 'CONFIRMED') {
        // Notify student
        this.addNotification({
          userId: booking.studentId,
          type: 'BOOKING_CONFIRMED',
          title: 'Session Confirmed!',
          message: `${tutor?.user?.name || 'Your tutor'} has confirmed your ${booking.subjectId || 'tutoring'} session.`,
          data: {
            bookingId: bookingId,
            tutorId: booking.tutorId,
            tutorName: tutor?.user?.name,
            subject: booking.subjectId,
            startAt: booking.startAtUTC,
            endAt: booking.endAtUTC
          }
        });
      } else if (updatedBooking.status === 'REJECTED') {
        // Notify student
        this.addNotification({
          userId: booking.studentId,
          type: 'BOOKING_REJECTED',
          title: 'Session Request Declined',
          message: `${tutor?.user?.name || 'The tutor'} has declined your ${booking.subjectId || 'tutoring'} session request.`,
          data: {
            bookingId: bookingId,
            tutorId: booking.tutorId,
            tutorName: tutor?.user?.name,
            subject: booking.subjectId,
            reason: updates.statusReason
          }
        });
      } else if (updatedBooking.status === 'CANCELLED') {
        // Notify the other party
        if (updatedBy === booking.studentId) {
          // Student cancelled, notify tutor
          this.addNotification({
            userId: booking.tutorId,
            type: 'BOOKING_CANCELLED',
            title: 'Session Cancelled',
            message: `${student?.name || 'The student'} has cancelled the ${booking.subjectId || 'tutoring'} session.`,
            data: {
              bookingId: bookingId,
              studentId: booking.studentId,
              studentName: student?.name,
              subject: booking.subjectId,
              reason: updates.statusReason
            }
          });
        } else {
          // Tutor cancelled, notify student
          this.addNotification({
            userId: booking.studentId,
            type: 'BOOKING_CANCELLED',
            title: 'Session Cancelled',
            message: `${tutor?.user?.name || 'The tutor'} has cancelled the ${booking.subjectId || 'tutoring'} session.`,
            data: {
              bookingId: bookingId,
              tutorId: booking.tutorId,
              tutorName: tutor?.user?.name,
              subject: booking.subjectId,
              reason: updates.statusReason
            }
          });
        }
      }
    }

    return true;
  }



  updateTutorRatingStats(tutorId: string): void {
    const reviews = this.data.reviews.filter(r => r.tutorId === tutorId && r.status === 'APPROVED');
    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const tutorIndex = this.data.tutors.findIndex(t => t.id === tutorId);
    if (tutorIndex !== -1) {
      this.data.tutors[tutorIndex].ratingAvg = Math.round(averageRating * 10) / 10;
      this.data.tutors[tutorIndex].ratingCount = reviews.length;
      this.saveData();
    }
  }

  // Admin methods
  updateUserStatus(userId: string, status: string, adminId?: string, reason?: string): boolean {
    const userIndex = this.data.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    this.data.users[userIndex].status = status;
    this.data.users[userIndex].statusUpdatedAt = new Date().toISOString();
    this.data.users[userIndex].statusUpdatedBy = adminId;
    if (reason) {
      this.data.users[userIndex].statusReason = reason;
    }

    // Update corresponding tutor if applicable
    if (this.data.users[userIndex].role === 'TUTOR') {
      const tutorIndex = this.data.tutors.findIndex(t => t.userId === userId);
      if (tutorIndex !== -1) {
        this.data.tutors[tutorIndex].status = status;
      }
    }

    this.saveData();
    return true;
  }

  deleteUser(userId: string, adminId?: string): boolean {
    const userIndex = this.data.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    // Remove user
    const deletedUser = this.data.users.splice(userIndex, 1)[0];

    // Remove corresponding tutor if applicable
    if (deletedUser.role === 'TUTOR') {
      const tutorIndex = this.data.tutors.findIndex(t => t.userId === userId);
      if (tutorIndex !== -1) {
        this.data.tutors.splice(tutorIndex, 1);
      }
    }

    // Cancel user's bookings
    this.data.bookings = this.data.bookings.map(booking => {
      if (booking.studentId === userId || booking.tutorId === userId) {
        return { ...booking, status: 'CANCELLED', statusReason: 'User deleted' };
      }
      return booking;
    });

    // Log the deletion
    console.log(`User ${userId} deleted by admin ${adminId}`);

    this.saveData();
    return true;
  }

  // ==================== MESSAGE MANAGEMENT ====================
  
  addMessage(message: any): void {
    this.data.messages.push(message);
    this.saveData();
  }

  getMessagesByChatRoom(chatRoomId: string): any[] {
    return this.data.messages.filter(msg => msg.chatRoomId === chatRoomId);
  }

  getMessagesByUsers(userId1: string, userId2: string): any[] {
    return this.data.messages.filter(msg => 
      (msg.senderId === userId1 && msg.recipientId === userId2) ||
      (msg.senderId === userId2 && msg.recipientId === userId1)
    );
  }

  getMessagesByUser(userId: string): any[] {
    return this.data.messages.filter(msg => 
      msg.senderId === userId || msg.recipientId === userId
    );
  }

  getUnreadMessageCount(userId: string): number {
    return this.data.messages.filter(msg => 
      msg.recipientId === userId && !msg.read
    ).length;
  }

  markMessagesAsRead(userId: string, senderId: string): void {
    this.data.messages.forEach(msg => {
      if (msg.senderId === senderId && msg.recipientId === userId && !msg.read) {
        msg.read = true;
        msg.readAt = new Date().toISOString();
      }
    });
    this.saveData();
  }

  getAllMessages(): any[] {
    return this.data.messages;
  }

  // ==================== PAYMENT MANAGEMENT ====================
  
  // Payment methods
  addPayment(payment: any): void {
    this.data.payments.push(payment);
    this.saveData();
  }

  getPaymentById(paymentId: string): any {
    return this.data.payments.find(payment => payment.id === paymentId);
  }

  getPaymentByStripeId(stripePaymentIntentId: string): any {
    return this.data.payments.find(payment => payment.stripePaymentIntentId === stripePaymentIntentId);
  }

  updatePayment(payment: any): void {
    const index = this.data.payments.findIndex(p => p.id === payment.id);
    if (index !== -1) {
      this.data.payments[index] = payment;
      this.saveData();
    }
  }

  getAllPayments(): any[] {
    return this.data.payments;
  }

  getPaymentsByStudent(studentId: string): any[] {
    return this.data.payments.filter(payment => payment.studentId === studentId);
  }

  getPaymentsByTutor(tutorId: string): any[] {
    return this.data.payments.filter(payment => payment.tutorId === tutorId);
  }

  // Payout methods
  addPayout(payout: any): void {
    this.data.payouts.push(payout);
    this.saveData();
  }

  getPayoutById(payoutId: string): any {
    return this.data.payouts.find(payout => payout.id === payoutId);
  }

  updatePayout(payout: any): void {
    const index = this.data.payouts.findIndex(p => p.id === payout.id);
    if (index !== -1) {
      this.data.payouts[index] = payout;
      this.saveData();
    }
  }

  getAllPayouts(): any[] {
    return this.data.payouts;
  }

  getPayoutsByTutor(tutorId: string): any[] {
    return this.data.payouts.filter(payout => payout.tutorId === tutorId);
  }

  // Dispute methods
  addDispute(dispute: any): void {
    this.data.disputes.push(dispute);
    this.saveData();
  }

  getDisputeById(disputeId: string): any {
    return this.data.disputes.find(dispute => dispute.id === disputeId);
  }

  updateDispute(dispute: any): void {
    const index = this.data.disputes.findIndex(d => d.id === dispute.id);
    if (index !== -1) {
      this.data.disputes[index] = dispute;
      this.saveData();
    }
  }

  getAllDisputes(): any[] {
    return this.data.disputes;
  }

  getDisputesByStudent(studentId: string): any[] {
    return this.data.disputes.filter(dispute => dispute.studentId === studentId);
  }

  getDisputesByTutor(tutorId: string): any[] {
    return this.data.disputes.filter(dispute => dispute.tutorId === tutorId);
  }
}

export const dataManager = new DataManager();
