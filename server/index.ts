import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { dataManager } from './dataManager';
import errorLogger from './errorLogger.js';
import { authenticateToken, requireRole, requireActiveUser, generateToken, verifyToken } from './middleware/authMiddleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        exp: number;
      };
    }
  }
}

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5174;
const isProduction = process.env.NODE_ENV === 'production';

// CORS configuration
const allowedOrigins = [
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:8080",
  "http://localhost:3000",
  "https://www.tutorspool.com",
  "https://tutors-pool-git-main-emrans-projects-5d3e3a87.vercel.app"
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

if (process.env.REPLIT_DEV_DOMAIN) {
  allowedOrigins.push(`https://${process.env.REPLIT_DEV_DOMAIN}`);
}

if (process.env.REPLIT_DEPLOYMENT && process.env.REPL_SLUG) {
  allowedOrigins.push(`https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Debug middleware - only log in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    if (req.path.includes('/auth/login')) {
      console.log('[MIDDLEWARE] Login request:', req.method, req.path, req.body);
    }
    next();
  });
}

// Initialize sample data
dataManager.initializeSampleData();

// Token functions are now imported from ./middleware/authMiddleware

// Authentication middleware is now imported from ./middleware/authMiddleware

// requireActiveUser middleware is now imported from ./middleware/authMiddleware

// Role middleware is now imported from ./middleware/authMiddleware

// Import AI Chat routes
import aiChatRouter from './routes/aiChat';
import blogRouter from './routes/blog';
import paymentsRouter from './routes/payments';

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// AI Chatbot routes
app.use('/api/ai-chat', aiChatRouter);

// Blog routes
app.use('/api/blog', blogRouter);

// Payments routes
app.use('/api/payments', paymentsRouter);

// NOTE: Duplicate route removed - using the enhanced dashboard endpoint at line 3117

// User profile update
// NOTE: Duplicate route removed - using the enhanced one at line 2958

// Reviews endpoints
app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { tutorId, bookingId, rating, comment, subject, improvement } = req.body;
    if (!tutorId || !rating) return res.status(400).json({ error: 'tutorId and rating are required' });
    const review = dataManager.addReview({ tutorId, bookingId, studentId: req.user?.userId, rating, comment, subject, improvement });
    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

app.get('/api/reviews/featured', async (_req, res) => {
  try {
    const items = dataManager.getFeaturedReviews();
    res.json({ items, total: items.length });
  } catch (error) {
    console.error('Featured reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.get('/api/tutors/:tutorId/reviews', async (req, res) => {
  try {
    const { tutorId } = req.params;
    const items = dataManager.getReviewsByTutor(tutorId);
    res.json({ items, total: items.length });
  } catch (error) {
    console.error('Tutor reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch tutor reviews' });
  }
});

app.get('/api/students/:studentId/reviews', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    if (studentId !== req.user?.userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const items = dataManager.getReviewsByStudent(studentId);
    res.json({ items, total: items.length });
  } catch (error) {
    console.error('Student reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch student reviews' });
  }
});

// Admin review moderation
app.get('/api/admin/reviews', authenticateToken, requireRole(['ADMIN']), (req, res) => {
  const { status } = req.query;
  const items = dataManager.getAllReviews(status as string | undefined);
  res.json({ items, total: items.length });
});

app.put('/api/admin/reviews/:reviewId/status', authenticateToken, requireRole(['ADMIN']), (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;
    const updated = dataManager.updateReviewStatus(reviewId, status, req.user?.userId || '');
    if (!updated) return res.status(404).json({ error: 'Review not found' });
    // Recompute tutor rating stats if needed
    const review = dataManager.getReviewById(reviewId);
    if (review?.tutorId) dataManager.updateTutorRatingStats(review.tutorId);
    res.json({ success: true, review: updated });
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

app.delete('/api/admin/reviews/:reviewId', authenticateToken, requireRole(['ADMIN']), (req, res) => {
  try {
    const { reviewId } = req.params;
    const ok = dataManager.deleteReview(reviewId);
    if (!ok) return res.status(404).json({ error: 'Review not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Subjects custom request (simple notifier)
app.post('/api/subjects/custom-request', authenticateToken, (req, res) => {
  try {
    const { subjectName, description, level } = req.body;
    if (!subjectName || !level) return res.status(400).json({ error: 'subjectName and level are required' });
    dataManager.addNotification({
      userId: 'admin',
      type: 'NEW_MESSAGE',
      title: 'New subject request',
      message: `${req.user?.email || req.user?.userId} requested ${subjectName} (${level})`,
      data: { subjectName, description, level },
    });
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Custom subject request error:', error);
    res.status(500).json({ error: 'Failed to submit request' });
  }
});
app.post('/api/admin/reset-sample-data', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    // Clear existing data
    dataManager.clearAllData();
    // Reload sample data
    dataManager.initializeSampleData();
    
    res.json({ 
      success: true, 
      message: 'Sample data reset successfully',
      counts: {
        users: dataManager.getAllUsers().length,
        tutors: dataManager.getAllTutors().length,
        bookings: dataManager.getAllBookings().length,
        reviews: dataManager.getAllReviews().length
      }
    });
  } catch (error) {
    console.error('Error resetting sample data:', error);
    res.status(500).json({ error: 'Failed to reset sample data' });
  }
});

// Add completed booking for testing (development only)
app.post('/api/admin/add-test-booking', authenticateToken, async (req, res) => {
  try {
    const { studentId, tutorId, subjectId } = req.body;
    
    const completedBooking = {
      studentId: studentId || 'user-153',
      tutorId: tutorId || 'tutor-143',
      subjectId: subjectId || 'mathematics',
      startAtUTC: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endAtUTC: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      status: 'COMPLETED',
      priceCents: 5000,
      currency: 'USD',
      paymentStatus: 'PAID',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    const addedBooking = dataManager.addBooking(completedBooking);
    
    res.json({ 
      success: true, 
      booking: addedBooking,
      message: 'Test completed booking added successfully'
    });
  } catch (error) {
    console.error('Error adding test booking:', error);
    res.status(500).json({ error: 'Failed to add test booking' });
  }
});

// Error monitoring endpoints
app.get('/api/logs/errors', (req, res) => {
  try {
    const { type, limit = 50 } = req.query;
    let errors = errorLogger.getAllErrors();
    
    if (type) {
      errors = errors.filter(error => error.type === type);
    }
    
    errors = errors
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, parseInt(limit as string) || 50);
    
    res.json({
      success: true,
      errors,
      total: errorLogger.getAllErrors().length,
      filtered: errors.length
    });
  } catch (error) {
    console.error('Error fetching error logs:', error);
    res.status(500).json({ error: 'Failed to fetch error logs' });
  }
});

app.delete('/api/logs/errors', (req, res) => {
  try {
    errorLogger.clearErrors();
    res.json({ success: true, message: 'All error logs cleared' });
  } catch (error) {
    console.error('Error clearing error logs:', error);
    res.status(500).json({ error: 'Failed to clear error logs' });
  }
});

// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('[REGISTER] Request body:', req.body);
    const { name, email, phone, country, timezone, role = 'STUDENT', adminCode } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Server-side validation for admin registration
    // Admin registration requires a valid admin code from environment variable
    const ADMIN_INVITE_CODE = process.env.ADMIN_INVITE_CODE || 'ADMIN2024';
    let assignedRole = role;
    
    if (role === 'ADMIN') {
      if (!adminCode || adminCode !== ADMIN_INVITE_CODE) {
        console.log('[REGISTER] Invalid admin code provided');
        return res.status(403).json({ error: 'Invalid admin registration code. Admin registration requires a valid invite code.' });
      }
      console.log('[REGISTER] Valid admin code verified');
    }

    // Use provided name or generate from email
    const userName = name || email.split('@')[0];
    
    // Check if user already exists - if so, just return success
    let existingUser = dataManager.getUserByEmail(email);
    if (existingUser) {
      console.log('[REGISTER] User already exists, returning success');
      const token = generateToken(existingUser.id, existingUser.email, existingUser.role);
      return res.status(200).json({ 
        success: true, 
        user: { ...existingUser, password: undefined },
        token 
      });
    }

    console.log('[REGISTER] Creating new user with email:', email);
    const user = {
      name: userName,
      email,
      phone: phone || '',
      country: country || 'United States',
      timezone: timezone || 'UTC',
      role: assignedRole,
      status: assignedRole === 'ADMIN' ? 'ACTIVE' : 'PENDING'
    };

    try {
      dataManager.addUser(user);
      const addedUser = dataManager.getUserByEmail(email);
      
      if (!addedUser) {
        console.error('[REGISTER] Failed to retrieve added user');
        return res.status(500).json({ error: 'Failed to create user account' });
      }
      
      const token = generateToken(addedUser.id, addedUser.email, addedUser.role);
      console.log('[REGISTER] User created successfully:', addedUser.id);

      return res.status(201).json({ 
        success: true, 
        user: { ...addedUser, password: undefined },
        token 
      });
    } catch (addError) {
      console.error('[REGISTER] Error adding user:', addError);
      return res.status(500).json({ error: 'Failed to create user account' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    errorLogger.logError(error, { 
      endpoint: '/api/auth/register',
      method: 'POST',
      body: req.body
    });
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('[LOGIN] Request body:', req.body);
    const { email, password } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    console.log('[LOGIN] Looking for user with email:', email);
    // Create a test user if not found - for demo purposes
    let user = dataManager.getUserByEmail(email);
    
    if (!user) {
      console.log('[LOGIN] User not found, creating test user');
      const newUser = {
        name: email.split('@')[0],
        email,
        role: 'STUDENT',
        status: 'ACTIVE'
      };
      dataManager.addUser(newUser);
      user = dataManager.getUserByEmail(email);
      console.log('[LOGIN] Created test user:', user?.id);
    } else {
      console.log('[LOGIN] User found:', user.id);
    }

    const token = generateToken(user.id, user.email, user.role);
    console.log('[LOGIN] Generated token for user:', user.id);

    res.json({ 
      success: true, 
      user: { ...user, password: undefined },
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    errorLogger.logError(error, { 
      endpoint: '/api/auth/login',
      method: 'POST',
      body: req.body
    });
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

app.post('/api/auth/otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Generate OTP (in production, send via email/SMS)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP temporarily (in production, use Redis or similar)
    console.log(`OTP for ${email}: ${otp}`);
    
    res.json({ success: true, message: 'OTP sent' });
  } catch (error) {
    console.error('OTP error:', error);
    res.status(400).json({ error: 'Failed to send OTP' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // In production, verify OTP from storage
    // For demo purposes, accept any 6-digit OTP
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ error: 'Invalid OTP format' });
    }

    let user = dataManager.getUserByEmail(email);

    if (!user) {
      // Create user if they don't exist
      const newUser = {
    email,
        role: 'STUDENT',
      };
      dataManager.addUser(newUser);
      user = dataManager.getUserByEmail(email);
    }

    const token = generateToken(user.id, user.email, user.role);

    res.json({ 
      success: true, 
      user: { ...user, password: undefined },
      token 
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(400).json({ error: 'OTP verification failed' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = dataManager.getUserById(req.user?.userId || '');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ ...user, password: undefined });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(400).json({ error: 'Authentication failed' });
  }
});

// User profile endpoints
app.post('/api/students', authenticateToken, async (req, res) => {
  try {
    const { gradeLevel, learningGoals, preferredMode, budgetMin, budgetMax, specialRequirements, uploads } = req.body;

    const profile = {
      userId: req.user?.userId,
      gradeLevel,
      learningGoals,
      preferredMode,
      budgetMin,
      budgetMax,
      specialRequirements,
      uploads,
    };

    dataManager.addStudent(profile);
    const addedProfile = dataManager.getStudentByUserId(req.user?.userId || '');

    res.status(201).json({ success: true, profile: addedProfile });
  } catch (error) {
    console.error('Student profile creation error:', error);
    res.status(400).json({ error: 'Failed to create student profile' });
  }
});

// Get AI-powered subject suggestions for student
app.get('/api/students/ai-suggestions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get user (required)
    const user = dataManager.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has student profile, if not create a default one
    let studentProfile = dataManager.getStudentProfileByUserId(userId);
    if (!studentProfile) {
      // Create a default student profile for AI suggestions
      studentProfile = {
        id: `student-${userId}`,
        userId: userId,
        gradeLevel: 'high-school',
        learningGoals: 'Academic improvement and skill development',
        preferredMode: 'ONLINE',
        interests: ['general-education'],
        strengths: [],
        weaknesses: [],
        careerGoals: [],
        createdAt: new Date().toISOString()
      };
      
      // Add to data manager
      dataManager.addStudent(studentProfile);
    }

    // Get student's booking history for analysis
    const studentBookings = dataManager.getBookingsByStudentId(userId);
    const completedBookings = studentProfile.bookings?.filter(b => b.status === 'COMPLETED') || [];
    
    // Analyze learning patterns from completed sessions
    const subjectsStudied = [...new Set(completedBookings.map(b => b.subject))];
    const tutorsWorkedWith = [...new Set(completedBookings.map(b => b.tutorId))];
    
    // Get reviews given by student to understand preferences
    const studentReviews = dataManager.getReviewsByStudent(userId);
    const averageRating = studentReviews.length > 0 
      ? studentReviews.reduce((sum, review) => sum + review.rating, 0) / studentReviews.length 
      : 0;

    // Enhanced profile for AI analysis
    const enhancedProfile = {
      id: studentProfile.id,
      userId: userId,
      gradeLevel: studentProfile.gradeLevel || 'high-school',
      learningGoals: studentProfile.learningGoals || 'Academic improvement and skill development',
      preferredMode: studentProfile.preferredMode || 'ONLINE',
      budgetMin: studentProfile.budgetMin,
      budgetMax: studentProfile.budgetMax,
      specialRequirements: studentProfile.specialRequirements,
      interests: studentProfile.interests || ['general-education'],
      academicLevel: studentProfile.gradeLevel || 'high-school',
      learningStyle: studentProfile.learningStyle || 'Mixed Learning Style',
      subjectsStudied: subjectsStudied,
      strengths: studentProfile.strengths || ['dedicated', 'curious'],
      weaknesses: studentProfile.weaknesses || ['time-management'],
      careerGoals: studentProfile.careerGoals || ['professional-development'],
      hobbies: studentProfile.hobbies || ['learning'],
      // Additional analysis data
      sessionHistory: {
        totalSessions: completedBookings.length,
        averageSessionDuration: completedBookings.length > 0 
          ? completedBookings.reduce((sum, b) => sum + (b.durationMinutes || 60), 0) / completedBookings.length 
          : 60,
        preferredSubjects: subjectsStudied,
        tutorsWorkedWith: tutorsWorkedWith.length,
        averageRating: averageRating
      }
    };

    // Generate AI suggestions (simplified version for backend)
    const suggestions = generateAISuggestions(enhancedProfile);

    res.json({ 
      success: true, 
      suggestions,
      profileAnalysis: {
        learningStyle: enhancedProfile.learningStyle,
        academicLevel: enhancedProfile.academicLevel,
        interests: enhancedProfile.interests,
        strengths: enhancedProfile.strengths,
        areasForImprovement: enhancedProfile.weaknesses,
        sessionHistory: enhancedProfile.sessionHistory
      },
      personalizedMessage: `Based on your ${enhancedProfile.sessionHistory.totalSessions} completed sessions and interests in ${enhancedProfile.interests.join(', ')}, I recommend focusing on subjects that align with your learning goals.`
    });

  } catch (error) {
    console.error('AI suggestions error:', error);
    res.status(500).json({ error: 'Failed to generate AI suggestions' });
  }
});

// Helper function to generate AI suggestions
function generateAISuggestions(profile: any): any[] {
  const subjectsDatabase: { [key: string]: any } = {
    'mathematics': { difficulty: 'INTERMEDIATE', estimatedHours: 120, relatedSubjects: ['physics', 'chemistry', 'statistics'] },
    'physics': { difficulty: 'INTERMEDIATE', estimatedHours: 100, relatedSubjects: ['mathematics', 'chemistry', 'engineering'] },
    'chemistry': { difficulty: 'INTERMEDIATE', estimatedHours: 100, relatedSubjects: ['mathematics', 'physics', 'biology'] },
    'biology': { difficulty: 'BEGINNER', estimatedHours: 80, relatedSubjects: ['chemistry', 'medicine', 'environmental-science'] },
    'computer-science': { difficulty: 'INTERMEDIATE', estimatedHours: 150, relatedSubjects: ['mathematics', 'engineering', 'data-science'] },
    'english': { difficulty: 'BEGINNER', estimatedHours: 60, relatedSubjects: ['literature', 'communication', 'writing'] },
    'history': { difficulty: 'BEGINNER', estimatedHours: 60, relatedSubjects: ['geography', 'political-science', 'sociology'] },
    'geography': { difficulty: 'BEGINNER', estimatedHours: 50, relatedSubjects: ['environmental-science', 'history', 'political-science'] },
    'economics': { difficulty: 'INTERMEDIATE', estimatedHours: 80, relatedSubjects: ['mathematics', 'business', 'political-science'] },
    'psychology': { difficulty: 'BEGINNER', estimatedHours: 70, relatedSubjects: ['biology', 'sociology', 'philosophy'] }
  };

  const suggestions: any[] = [];
  const interests = profile.interests || [];
  const subjectsStudied = profile.subjectsStudied || [];
  const careerGoals = profile.careerGoals || [];

  // Generate suggestions based on interests
  interests.forEach((interest: string) => {
    const interestLower = interest.toLowerCase();
    let relatedSubjects: string[] = [];
    
    if (interestLower.includes('tech') || interestLower.includes('computer')) {
      relatedSubjects = ['computer-science', 'mathematics', 'physics'];
    } else if (interestLower.includes('science') || interestLower.includes('research')) {
      relatedSubjects = ['mathematics', 'physics', 'chemistry', 'biology'];
    } else if (interestLower.includes('business') || interestLower.includes('finance')) {
      relatedSubjects = ['economics', 'mathematics', 'english'];
    } else if (interestLower.includes('medicine') || interestLower.includes('health')) {
      relatedSubjects = ['biology', 'chemistry', 'physics'];
    } else if (interestLower.includes('arts') || interestLower.includes('creative')) {
      relatedSubjects = ['english', 'history', 'psychology'];
    } else {
      relatedSubjects = ['mathematics', 'english', 'science'];
    }

    relatedSubjects.forEach((subject: string) => {
      if (!subjectsStudied.includes(subject)) {
        const subjectData = subjectsDatabase[subject];
        if (subjectData) {
          suggestions.push({
            subject,
            confidence: 0.8,
            reason: `Based on your interest in ${interest}`,
            difficulty: subjectData.difficulty,
            estimatedHours: subjectData.estimatedHours,
            prerequisites: [],
            relatedSubjects: subjectData.relatedSubjects,
            careerRelevance: [],
            learningPath: []
          });
        }
      }
    });
  });

  // Add grade-appropriate subjects
  const gradeLevel = profile.gradeLevel || 'high-school';
  const gradeSubjects: { [key: string]: string[] } = {
    'elementary': ['mathematics', 'english', 'science'],
    'middle-school': ['mathematics', 'english', 'science', 'history'],
    'high-school': ['mathematics', 'physics', 'chemistry', 'biology', 'english', 'history'],
    'college': ['mathematics', 'physics', 'chemistry', 'biology', 'computer-science', 'economics']
  };

  const appropriateSubjects = gradeSubjects[gradeLevel] || gradeSubjects['high-school'];
  appropriateSubjects.forEach((subject: string) => {
    if (!subjectsStudied.includes(subject) && !suggestions.find((s: any) => s.subject === subject)) {
      const subjectData = subjectsDatabase[subject];
      if (subjectData) {
        suggestions.push({
          subject,
          confidence: 0.7,
          reason: `Appropriate for your ${gradeLevel} level`,
          difficulty: subjectData.difficulty,
          estimatedHours: subjectData.estimatedHours,
          prerequisites: [],
          relatedSubjects: subjectData.relatedSubjects,
          careerRelevance: [],
          learningPath: []
        });
      }
    }
  });

  // Remove duplicates and sort by confidence
  const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
    index === self.findIndex((s: any) => s.subject === suggestion.subject)
  );

  return uniqueSuggestions
    .sort((a: any, b: any) => b.confidence - a.confidence)
    .slice(0, 6);
}

// Get student profile
app.get('/api/students/profile', authenticateToken, async (req, res) => {
  try {
    const profile = dataManager.getStudentByUserId(req.user?.userId || '');
    if (!profile) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Student profile fetch error:', error);
    res.status(400).json({ error: 'Failed to fetch student profile' });
  }
});

// Update student profile
app.put('/api/students/profile', authenticateToken, async (req, res) => {
  try {
    const { gradeLevel, learningGoals, preferredMode, budgetMin, budgetMax, specialRequirements, uploads } = req.body;
    
    const profile = dataManager.getStudentByUserId(req.user?.userId || '');
    if (!profile) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const updates = {
      gradeLevel: gradeLevel || profile.gradeLevel,
      learningGoals: learningGoals || profile.learningGoals,
      preferredMode: preferredMode || profile.preferredMode,
      budgetMin: budgetMin || profile.budgetMin,
      budgetMax: budgetMax || profile.budgetMax,
      specialRequirements: specialRequirements || profile.specialRequirements,
      uploads: uploads || profile.uploads,
      updatedAt: new Date().toISOString(),
    };

    dataManager.updateStudent(profile.id, updates);
    const updatedProfile = dataManager.getStudentById(profile.id);

    res.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error('Student profile update error:', error);
    res.status(400).json({ error: 'Failed to update student profile' });
  }
});

// Get student bookings
app.get('/api/students/bookings', authenticateToken, async (req, res) => {
  try {
    const studentBookings = dataManager.getBookingsByStudentId(req.user?.userId || '');
    
    // Enrich bookings with tutor information
    const enrichedBookings = studentBookings.map(booking => {
      const tutor = dataManager.getTutorById(booking.tutorId);
      return {
        ...booking,
        tutor: tutor ? {
          id: tutor.id,
          user: dataManager.getUserById(tutor.userId),
          subjects: tutor.subjects
        } : null
      };
    });
    
    res.json({ success: true, bookings: enrichedBookings, total: enrichedBookings.length });
  } catch (error) {
    console.error('Student bookings fetch error:', error);
    res.status(400).json({ error: 'Failed to fetch student bookings' });
  }
});

// Get student stats
app.get('/api/students/stats', authenticateToken, async (req, res) => {
  try {
    const studentBookings = dataManager.getBookingsByStudentId(req.user?.userId || '');
    const completedBookings = studentBookings.filter(booking => booking.status === 'COMPLETED');
    const pendingBookings = studentBookings.filter(booking => booking.status === 'PENDING');
    const cancelledBookings = studentBookings.filter(booking => booking.status === 'CANCELLED');
    
    const totalSpent = completedBookings.reduce((sum, booking) => sum + (booking.priceCents || 0), 0);
    
    const stats = {
      totalBookings: studentBookings.length,
      completedBookings: completedBookings.length,
      pendingBookings: pendingBookings.length,
      cancelledBookings: cancelledBookings.length,
      totalSpentCents: totalSpent,
      averageSessionPrice: completedBookings.length > 0 ? totalSpent / completedBookings.length : 0,
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Student stats fetch error:', error);
    res.status(400).json({ error: 'Failed to fetch student stats' });
  }
});

// List/Search tutors (public)
app.get('/api/tutors', async (req, res) => {
  try {
    const { q, priceMin, priceMax, ratingMin, page = '1', limit = '10' } = req.query as Record<string, string>;

    let tutors = dataManager.getAllTutors();

    // Join with user for name/email if available
    const enrich = (t: any) => ({
      id: t.id,
      userId: t.userId,
      headline: t.headline,
      bio: t.bio,
      hourlyRateCents: t.hourlyRateCents,
      currency: t.currency,
      yearsExperience: t.yearsExperience,
      subjects: t.subjects,
      levels: t.levels,
      slug: t.slug,
      ratingAvg: t.ratingAvg ?? 0,
      ratingCount: t.ratingCount ?? 0,
      user: dataManager.getUserById(t.userId) || null,
    });

    // Filtering
    if (q && q.trim()) {
      const query = q.toLowerCase();
      tutors = tutors.filter((t: any) =>
        (t.headline?.toLowerCase().includes(query)) ||
        (t.bio?.toLowerCase().includes(query)) ||
        (Array.isArray(t.subjects) && t.subjects.join(' ').toLowerCase().includes(query))
      );
    }

    if (priceMin) {
      const min = Number(priceMin);
      if (!isNaN(min)) tutors = tutors.filter((t: any) => (t.hourlyRateCents ?? 0) >= min);
    }
    if (priceMax) {
      const max = Number(priceMax);
      if (!isNaN(max)) tutors = tutors.filter((t: any) => (t.hourlyRateCents ?? Infinity) <= max);
    }
    if (ratingMin) {
      const rmin = Number(ratingMin);
      if (!isNaN(rmin)) tutors = tutors.filter((t: any) => (t.ratingAvg ?? 0) >= rmin);
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit as string, 10) || 10));
    const total = tutors.length;
    const totalPages = Math.max(1, Math.ceil(total / limitNum));
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;
    const items = tutors.slice(start, end).map(enrich);

    res.json({ items, total, page: pageNum, totalPages, limit: limitNum });
  } catch (error) {
    console.error('Tutors list error:', error);
    res.status(500).json({ error: 'Failed to fetch tutors' });
  }
});

app.post('/api/tutors', authenticateToken, async (req, res) => {
  try {
    const { 
      headline, 
      bio, 
      hourlyRateCents, 
      currency, 
      yearsExperience, 
      subjects, 
      levels, 
      slug, 
      certifications, 
      availabilityBlocks,
      inPersonLocation 
    } = req.body;

    // Get user info to generate slug if not provided
    const user = dataManager.getUserById(req.user?.userId || '');
    const generatedSlug = user ? generateSlug(user.name) : slug;

    const profile = {
      userId: req.user?.userId,
      headline,
      bio,
      hourlyRateCents,
      currency,
      yearsExperience,
      subjects,
      levels,
      slug: slug || generatedSlug, // Use provided slug or generate one
      certifications,
      availabilityBlocks: availabilityBlocks || [],
      inPersonLocation: inPersonLocation || null,
      ratingAvg: 0,
      ratingCount: 0,
    };

    dataManager.addTutor(profile);
    const addedProfile = dataManager.getTutorByUserId(req.user?.userId || '');

    res.status(201).json({ success: true, profile: addedProfile });
  } catch (error) {
    console.error('Tutor profile creation error:', error);
    res.status(400).json({ error: 'Failed to create tutor profile' });
  }
});

// Check tutor availability
app.post('/api/tutors/:tutorId/availability/check', async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { startTime, duration } = req.body;

    if (!startTime || !duration) {
      return res.status(400).json({ error: 'Start time and duration are required' });
    }

    const startDate = new Date(startTime);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({ error: 'Invalid start time format' });
    }

    // Simplified availability check - in production would use proper tutor service
    res.json({ 
      isAvailable: true,
      reason: 'Basic availability check - implement full logic in production'
    });
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

// Get available time slots for a tutor
app.get('/api/tutors/:tutorId/availability/slots', async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { date, duration = 60 } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const targetDate = new Date(date as string);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Generate basic time slots
    const slots: string[] = [];
    const baseTime = new Date(targetDate);
    baseTime.setHours(9, 0, 0, 0);
    
    for (let i = 0; i < 8; i++) {
      const slotTime = new Date(baseTime.getTime() + i * 60 * 60 * 1000);
      slots.push(slotTime.toISOString());
    }

    res.json({ slots });
  } catch (error) {
    console.error('Available slots error:', error);
    res.status(500).json({ error: 'Failed to get available slots' });
  }
});

// Create Google Meet link for a session
app.post('/api/google-meet/create-link', authenticateToken, async (req, res) => {
  try {
    const { tutorEmail, studentEmail, startTime, endTime, meetingTitle, description } = req.body;

    if (!tutorEmail || !studentEmail || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Generate Google Meet link
    const generateMeetCode = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      const generatePart = () => {
        let part = '';
        for (let i = 0; i < 3; i++) {
          part += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return part;
      };
      return `${generatePart()}-${generatePart()}-${generatePart()}`;
    };

    const meetCode = generateMeetCode();
    const meetingId = `tutorspool-${Date.now()}-${meetCode}`;
    const meetingLink = `https://meet.google.com/${meetCode}`;
    const password = Math.random().toString(36).substr(2, 8).toUpperCase();

    const meetingDetails = {
      meetingId,
      meetCode,
      meetingLink,
      password,
      instructions: `Welcome to your tutoring session!\n\nMeeting Details:\n📅 Date: ${start.toLocaleDateString()}\n🕐 Time: ${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}\n👨‍🏫 Tutor: ${tutorEmail}\n👨‍🎓 Student: ${studentEmail}\n\nJoin Instructions:\n1. Click the meeting link: ${meetingLink}\n2. Use password if prompted: ${password}\n3. Enable your camera and microphone\n4. Wait for your tutor/student to join\n\n📝 Session Notes:\n${description || 'Please prepare any questions or materials you want to discuss during the session.'}\n\nNeed help? Contact TutorsPool support.`,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      tutorEmail,
      studentEmail,
      createdAt: new Date().toISOString(),
      title: meetingTitle || `Tutoring Session: ${studentEmail} with ${tutorEmail}`
    };

    res.status(201).json({
      success: true,
      meetingDetails
    });

  } catch (error) {
    console.error('Google Meet link creation error:', error);
    res.status(500).json({ error: 'Failed to create Google Meet link' });
  }
});

// Booking endpoints
app.post('/api/bookings', authenticateToken, requireActiveUser, async (req, res) => {
  try {
    const { tutorId, subjectId, startAtUTC, endAtUTC, priceCents, currency } = req.body;

    console.log('Booking request body:', req.body);
    console.log('User ID:', req.user?.userId);

    const booking = {
      studentId: req.user?.userId || '',
      tutorId,
      subjectId,
      startAtUTC,
      endAtUTC,
      status: 'PENDING_PAYMENT', // Changed to indicate payment is required
      priceCents,
      currency,
      paymentStatus: 'UNPAID', // Add payment status tracking
      paymentRequired: true,
    };

    console.log('Booking object:', booking);

    // Use the notification-enabled booking method
    const addedBooking = dataManager.addBookingWithNotification(booking);

    res.status(201).json({ success: true, booking: addedBooking });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(400).json({ error: 'Failed to create booking' });
  }
});

app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const userBookings = dataManager.getAllBookings().filter(booking => 
      booking.studentId === (req.user?.userId || '') || booking.tutorId === (req.user?.userId || '')
    );

    res.json({ items: userBookings, total: userBookings.length });
  } catch (error) {
    console.error('Bookings fetch error:', error);
    res.status(400).json({ error: 'Failed to fetch bookings' });
  }
});

// Subject endpoints
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = [
      { id: 'math', name: 'Mathematics', category: 'STEM' },
      { id: 'physics', name: 'Physics', category: 'STEM' },
      { id: 'chemistry', name: 'Chemistry', category: 'STEM' },
      { id: 'biology', name: 'Biology', category: 'STEM' },
      { id: 'english', name: 'English', category: 'Languages' },
      { id: 'history', name: 'History', category: 'Social Sciences' },
      { id: 'economics', name: 'Economics', category: 'Social Sciences' },
    ];

    res.json({ items: subjects, total: subjects.length });
  } catch (error) {
    console.error('Subjects fetch error:', error);
    res.status(400).json({ error: 'Failed to fetch subjects' });
  }
});

app.get('/api/subjects/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'stem', name: 'STEM', subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology'] },
      { id: 'languages', name: 'Languages', subjects: ['English', 'Spanish', 'French', 'German'] },
      { id: 'social', name: 'Social Sciences', subjects: ['History', 'Economics', 'Geography'] },
    ];

    res.json({ items: categories, total: categories.length });
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(400).json({ error: 'Failed to fetch categories' });
  }
});

// Admin endpoints
// Admin Dashboard - Get comprehensive stats and data

// Enhanced admin user management endpoints
app.get('/api/admin/users', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const users = dataManager.getAllUsers();
    const tutors = dataManager.getAllTutors();
    const students = dataManager.getAllStudents();
    
    const usersWithProfiles = users.map(user => {
      const tutorProfile = tutors.find(t => t.userId === user.id);
      const studentProfile = students.find(s => s.userId === user.id);
      
      return {
        ...user,
        profile: tutorProfile || studentProfile,
        lastLogin: user.lastLogin || null,
        status: user.status || 'PENDING'
      };
    });

    res.json(usersWithProfiles);
  } catch (error) {
    console.error('Admin users error:', error);
    errorLogger.logError(error, { 
      endpoint: '/api/admin/users',
      method: 'GET',
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending users for approval
app.get('/api/admin/users/pending', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    console.log('[ADMIN PENDING USERS] Fetching pending users...');
    const allUsers = dataManager.getAllUsers();
    console.log('[ADMIN PENDING USERS] Total users:', allUsers.length);
    console.log('[ADMIN PENDING USERS] Users by status:', {
      PENDING: allUsers.filter(u => u.status === 'PENDING').length,
      ACTIVE: allUsers.filter(u => u.status === 'ACTIVE').length,
      REJECTED: allUsers.filter(u => u.status === 'REJECTED').length,
    });
    
    const pendingUsers = dataManager.getPendingUsers();
    console.log('[ADMIN PENDING USERS] Pending users found:', pendingUsers.length);
    
    const tutors = dataManager.getAllTutors();
    const students = dataManager.getAllStudents();
    
    const pendingUsersWithProfiles = pendingUsers.map(user => {
      const tutorProfile = tutors.find(t => t.userId === user.id);
      const studentProfile = students.find(s => s.userId === user.id);
      
      return {
        ...user,
        profile: tutorProfile || studentProfile,
        daysPending: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      };
    });

    console.log('[ADMIN PENDING USERS] Returning', pendingUsersWithProfiles.length, 'pending users with profiles');
    res.json(pendingUsersWithProfiles);
  } catch (error) {
    console.error('Pending users error:', error);
    errorLogger.logError(error, { 
      endpoint: '/api/admin/users/pending',
      method: 'GET',
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User approval/rejection endpoints
app.post('/api/admin/users/:userId/approve', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    const user = dataManager.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Approve user using the new method
    dataManager.approveUser(userId, req.user?.userId || '');
    
    // If it's a tutor, also update tutor status
    const tutor = dataManager.getTutorByUserId(userId);
    if (tutor) {
      dataManager.updateTutor(tutor.id, { ...tutor, status: 'ACTIVE' });
    }

    errorLogger.logInfo(`User ${userId} approved by admin ${req.user?.userId}`, {
      endpoint: '/api/admin/users/:userId/approve',
      method: 'POST',
      adminId: req.user?.userId,
      targetUserId: userId
    });

    res.json({ success: true, message: 'User approved successfully' });
  } catch (error) {
    console.error('User approval error:', error);
    errorLogger.logError(error, { 
      endpoint: '/api/admin/users/:userId/approve',
      method: 'POST',
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/users/:userId/reject', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const user = dataManager.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Reject user using the new method
    dataManager.rejectUser(userId, req.user?.userId || '', reason);

    errorLogger.logInfo(`User ${userId} rejected by admin ${req.user?.userId}`, {
      endpoint: '/api/admin/users/:userId/reject',
      method: 'POST',
      adminId: req.user?.userId,
      targetUserId: userId,
      reason
    });

    res.json({ success: true, message: 'User rejected successfully' });
  } catch (error) {
    console.error('User rejection error:', error);
    errorLogger.logError(error, { 
      endpoint: '/api/admin/users/:userId/reject',
      method: 'POST',
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/users/:userId/suspend', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const user = dataManager.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Suspend user using the new method
    dataManager.suspendUser(userId, req.user?.userId || '', reason);

    errorLogger.logInfo(`User ${userId} suspended by admin ${req.user?.userId}`, {
      endpoint: '/api/admin/users/:userId/suspend',
      method: 'POST',
      adminId: req.user?.userId,
      targetUserId: userId,
      reason
    });

    res.json({ success: true, message: 'User suspended successfully' });
  } catch (error) {
    console.error('User suspension error:', error);
    errorLogger.logError(error, { 
      endpoint: '/api/admin/users/:userId/suspend',
      method: 'POST',
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/users/:userId/activate', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    const user = dataManager.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = { ...user, status: 'ACTIVE' };
    dataManager.updateUser(userId, updatedUser);

    errorLogger.logInfo(`User ${userId} activated by admin ${req.user?.userId}`, {
      endpoint: '/api/admin/users/:userId/activate',
      method: 'POST',
      adminId: req.user?.userId,
      targetUserId: userId
    });

    res.json({ success: true, message: 'User activated successfully' });
  } catch (error) {
    console.error('User activation error:', error);
    errorLogger.logError(error, { 
      endpoint: '/api/admin/users/:userId/activate',
      method: 'POST',
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Enhanced bookings endpoint for admin
app.get('/api/admin/bookings', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    console.log('[ADMIN BOOKINGS] Fetching all bookings...');
    const bookings = dataManager.getAllBookings();
    const users = dataManager.getAllUsers();
    const tutors = dataManager.getAllTutors();
    
    console.log('[ADMIN BOOKINGS] Total bookings:', bookings.length);
    
    const bookingsWithUsers = bookings.map(booking => {
      const student = users.find(u => u.id === booking.studentId);
      const tutorProfile = tutors.find(t => t.id === booking.tutorId);
      const tutorUser = tutorProfile ? users.find(u => u.id === tutorProfile.userId) : null;
      
      return {
        ...booking,
        student: student ? { 
          id: student.id,
          name: student.name, 
          email: student.email 
        } : null,
        tutor: tutorUser ? {
          id: tutorUser.id,
          name: tutorUser.name,
          user: tutorUser
        } : null
      };
    });

    console.log('[ADMIN BOOKINGS] Returning', bookingsWithUsers.length, 'bookings with user data');
    res.json({ bookings: bookingsWithUsers });
  } catch (error) {
    console.error('Admin bookings error:', error);
    errorLogger.logError(error, { 
      endpoint: '/api/admin/bookings',
      method: 'GET',
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin reports endpoints
app.get('/api/admin/reports/users', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const users = dataManager.getAllUsers();
    const tutors = dataManager.getAllTutors();
    const students = dataManager.getAllStudents();
    
    const report = {
      totalUsers: users.length,
      totalTutors: tutors.length,
      totalStudents: students.length,
      activeUsers: users.filter(u => u.status === 'ACTIVE').length,
      pendingUsers: users.filter(u => u.status === 'PENDING').length,
      suspendedUsers: users.filter(u => u.status === 'SUSPENDED').length,
      rejectedUsers: users.filter(u => u.status === 'REJECTED').length,
      usersByRole: {
        STUDENT: users.filter(u => u.role === 'STUDENT').length,
        TUTOR: users.filter(u => u.role === 'TUTOR').length,
        ADMIN: users.filter(u => u.role === 'ADMIN').length
      },
      recentRegistrations: users
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
    };

    res.json(report);
  } catch (error) {
    console.error('User report error:', error);
    errorLogger.logError(error, { 
      endpoint: '/api/admin/reports/users',
      method: 'GET',
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/reports/revenue', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const bookings = dataManager.getAllBookings();
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
    
    const report = {
      totalRevenue: completedBookings.reduce((sum, b) => sum + b.priceCents, 0),
      totalBookings: bookings.length,
      completedBookings: completedBookings.length,
      cancelledBookings: bookings.filter(b => b.status === 'CANCELLED').length,
      pendingBookings: bookings.filter(b => b.status === 'PENDING').length,
      averageBookingValue: completedBookings.length > 0 ? 
        completedBookings.reduce((sum, b) => sum + b.priceCents, 0) / completedBookings.length : 0,
      revenueByMonth: {}, // This would be calculated from booking dates
      topTutors: [], // This would be calculated from tutor earnings
      revenueGrowth: 0 // This would be calculated from historical data
    };

    res.json(report);
  } catch (error) {
    console.error('Revenue report error:', error);
    errorLogger.logError(error, { 
      endpoint: '/api/admin/reports/revenue',
      method: 'GET',
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Admin - Get all tutors with details
app.get('/api/admin/tutors', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const allTutors = dataManager.getAllTutors();
    const allUsers = dataManager.getAllUsers();

    const tutorsWithDetails = allTutors.map(tutor => {
      const user = allUsers.find(u => u.id === tutor.userId);
      const bookings = dataManager.getAllBookings().filter(b => b.tutorId === tutor.id);
      
      return {
        ...tutor,
        user,
        totalBookings: bookings.length,
        completedBookings: bookings.filter(b => b.status === 'COMPLETED').length,
        pendingBookings: bookings.filter(b => b.status === 'PENDING').length
      };
    });

    res.json({ tutors: tutorsWithDetails });
  } catch (error) {
    console.error('Admin tutors error:', error);
    res.status(400).json({ error: 'Failed to fetch tutors' });
  }
});

// Admin - Get all students with details
app.get('/api/admin/students', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const allStudents = dataManager.getAllStudents();
    const allUsers = dataManager.getAllUsers();

    const studentsWithDetails = allStudents.map(student => {
      const user = allUsers.find(u => u.id === student.userId);
      const bookings = dataManager.getAllBookings().filter(b => b.studentId === student.userId);
      
      return {
        ...student,
        user,
        totalBookings: bookings.length,
        completedBookings: bookings.filter(b => b.status === 'COMPLETED').length,
        pendingBookings: bookings.filter(b => b.status === 'PENDING').length
      };
    });

    res.json({ students: studentsWithDetails });
  } catch (error) {
    console.error('Admin students error:', error);
    res.status(400).json({ error: 'Failed to fetch students' });
  }
});

// Admin - Get all bookings with details
app.get('/api/admin/bookings', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const allBookings = dataManager.getAllBookings();
    const allUsers = dataManager.getAllUsers();
    const allTutors = dataManager.getAllTutors();

    const bookingsWithDetails = allBookings.map(booking => ({
      ...booking,
      student: allUsers.find(u => u.id === booking.studentId),
      tutor: allTutors.find(t => t.id === booking.tutorId)
    }));

    res.json({ bookings: bookingsWithDetails });
  } catch (error) {
    console.error('Admin bookings error:', error);
    res.status(400).json({ error: 'Failed to fetch bookings' });
  }
});

// Admin - Update user status (approve/disable)
app.put('/api/admin/users/:userId/status', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // 'active', 'disabled', 'pending'

    // For now, we'll just return success since we don't have status field in user model
    // In a real app, you'd update the user status in the database
    res.json({ success: true, message: `User ${userId} status updated to ${status}` });
  } catch (error) {
    console.error('Admin user status update error:', error);
    res.status(400).json({ error: 'Failed to update user status' });
  }
});

// Admin - Delete user
app.delete('/api/admin/users/:userId', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    
    // In a real app, you'd implement proper user deletion
    // For now, we'll just return success
    res.json({ success: true, message: `User ${userId} deleted successfully` });
  } catch (error) {
    console.error('Admin user deletion error:', error);
    res.status(400).json({ error: 'Failed to delete user' });
  }
});

// Booking status management endpoints
app.put('/api/admin/bookings/:bookingId/status', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, reason } = req.body;
    
    const booking = dataManager.getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Update booking status
    dataManager.updateBooking(bookingId, { 
      status, 
      updatedAt: new Date().toISOString(),
      statusReason: reason || null
    });

    errorLogger.logInfo(`Booking ${bookingId} status updated to ${status} by admin ${req.user?.userId}`, {
      endpoint: '/api/admin/bookings/:bookingId/status',
      method: 'PUT',
      adminId: req.user?.userId,
      bookingId,
      newStatus: status,
      reason
    });

    res.json({ success: true, message: `Booking status updated to ${status}` });
  } catch (error) {
    console.error('Booking status update error:', error);
    errorLogger.logError(error, { 
      endpoint: '/api/admin/bookings/:bookingId/status',
      method: 'PUT',
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Tutor booking management endpoints
app.put('/api/tutors/bookings/:bookingId/status', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, reason } = req.body;
    
    const booking = dataManager.getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify the tutor owns this booking
    const user = dataManager.getUserById(req.user?.userId || '');
    const tutor = dataManager.getTutorByUserId(user?.id || '');
    if (!tutor || booking.tutorId !== tutor.id) {
      return res.status(403).json({ error: 'Unauthorized to modify this booking' });
    }

    // Update booking status with notifications
    const success = dataManager.updateBookingWithNotification(bookingId, { 
      status, 
      updatedAt: new Date().toISOString(),
      statusReason: reason || null
    }, req.user?.userId || '');

    if (!success) {
      return res.status(400).json({ error: 'Failed to update booking status' });
    }

    errorLogger.logInfo(`Booking ${bookingId} status updated to ${status} by tutor ${req.user?.userId}`, {
      endpoint: '/api/tutors/bookings/:bookingId/status',
      method: 'PUT',
      tutorId: req.user?.userId,
      bookingId,
      newStatus: status,
      reason
    });

    res.json({ success: true, message: `Booking status updated to ${status}` });
  } catch (error) {
    console.error('Tutor booking status update error:', error);
    errorLogger.logError(error, { 
      endpoint: '/api/tutors/bookings/:bookingId/status',
      method: 'PUT',
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Student booking management endpoints
app.put('/api/students/bookings/:bookingId/status', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, reason } = req.body;
    
    const booking = dataManager.getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify the student owns this booking
    if (booking.studentId !== req.user?.userId) {
      return res.status(403).json({ error: 'Unauthorized to modify this booking' });
    }

    // Students can only cancel their own bookings
    if (status !== 'CANCELLED') {
      return res.status(400).json({ error: 'Students can only cancel bookings' });
    }

    // Update booking status with notifications
    const success = dataManager.updateBookingWithNotification(bookingId, { 
      status, 
      updatedAt: new Date().toISOString(),
      statusReason: reason || null
    }, req.user?.userId || '');

    if (!success) {
      return res.status(400).json({ error: 'Failed to cancel booking' });
    }

    errorLogger.logInfo(`Booking ${bookingId} cancelled by student ${req.user?.userId}`, {
      endpoint: '/api/students/bookings/:bookingId/status',
      method: 'PUT',
      studentId: req.user?.userId,
      bookingId,
      newStatus: status,
      reason
    });

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Student booking status update error:', error);
    errorLogger.logError(error, { 
      endpoint: '/api/students/bookings/:bookingId/status',
      method: 'PUT',
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Notification endpoints
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const { unreadOnly } = req.query;
    const notifications = dataManager.getNotificationsByUserId(
      req.user?.userId || '', 
      unreadOnly === 'true'
    );
    
    res.json({ 
      success: true, 
      notifications,
      unreadCount: dataManager.getUnreadNotificationCount(req.user?.userId || '')
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.put('/api/notifications/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const success = dataManager.markNotificationAsRead(notificationId);
    
    if (success) {
      res.json({ success: true, message: 'Notification marked as read' });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

app.put('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    dataManager.markAllNotificationsAsRead(req.user?.userId || '');
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Get booking details with status history
app.get('/api/bookings/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = dataManager.getBookingById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user has access to this booking
    const user = dataManager.getUserById(req.user?.userId || '');
    const tutor = dataManager.getTutorByUserId(user?.id || '');
    
    if (booking.studentId !== req.user?.userId && 
        (!tutor || booking.tutorId !== tutor.id) && 
        user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to view this booking' });
    }

    // Get related data
    const student = dataManager.getUserById(booking.studentId);
    const tutorProfile = dataManager.getTutorById(booking.tutorId);
    const tutorUser = tutorProfile ? dataManager.getUserById(tutorProfile.userId) : null;

    const bookingDetails = {
      ...booking,
      student,
      tutor: tutorProfile ? {
        ...tutorProfile,
        user: tutorUser
      } : null,
      statusHistory: [
        {
          status: 'PENDING',
          timestamp: booking.createdAt,
          reason: 'Booking created'
        },
        ...(booking.updatedAt ? [{
          status: booking.status,
          timestamp: booking.updatedAt,
          reason: booking.statusReason || 'Status updated'
        }] : [])
      ]
    };

    res.json(bookingDetails);
  } catch (error) {
    console.error('Booking details error:', error);
    errorLogger.logError(error, { 
      endpoint: '/api/bookings/:bookingId',
      method: 'GET',
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add some sample data for testing
const initializeSampleData = () => {
  // Add sample users
  const sampleUsers = [
    {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'TUTOR',
      country: 'United States',
    createdAt: new Date().toISOString(),
    },
    {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'STUDENT',
      country: 'Canada',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user-3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'TUTOR',
      country: 'United Kingdom',
      createdAt: new Date().toISOString(),
    }
  ];

  // Add sample tutors
  const sampleTutors = [
    {
      id: 'tutor-1',
      userId: 'user-1',
      headline: 'Experienced Math Tutor',
      bio: 'I have been teaching mathematics for over 5 years. I specialize in algebra, calculus, and statistics.',
      hourlyRateCents: 2500, // $25/hour
      currency: 'USD',
      yearsExperience: 5,
      subjects: ['Mathematics', 'Statistics'],
      levels: ['High School (9-12)', 'College/University'],
      ratingAvg: 4.8,
      ratingCount: 12,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tutor-2',
      userId: 'user-3',
      headline: 'Physics and Chemistry Expert',
      bio: 'PhD in Physics with extensive experience in teaching both physics and chemistry at university level.',
      hourlyRateCents: 3000, // $30/hour
      currency: 'USD',
      yearsExperience: 8,
      subjects: ['Physics', 'Chemistry'],
      levels: ['College/University', 'Graduate School'],
      ratingAvg: 4.9,
      ratingCount: 8,
      createdAt: new Date().toISOString(),
    }
  ];

  // Add sample bookings
  const sampleBookings = [
    {
      id: 'booking-1',
      studentId: 'user-2', // Student user
      tutorId: 'tutor-1', // Math tutor
      subjectId: 'math-algebra',
      startAtUTC: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      endAtUTC: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // Tomorrow + 1 hour
      status: 'PENDING',
      priceCents: 2500, // $25
      currency: 'USD',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'booking-2',
      studentId: 'user-3', // Another student
      tutorId: 'tutor-2', // Science tutor
      subjectId: 'science-physics',
      startAtUTC: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
      endAtUTC: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // Day after tomorrow + 1 hour
      status: 'CONFIRMED',
      priceCents: 3000, // $30
      currency: 'USD',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'booking-3',
      studentId: 'user-2', // Student user
      tutorId: 'tutor-1', // Math tutor
      subjectId: 'math-calculus',
      startAtUTC: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      endAtUTC: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // 3 days from now + 1 hour
      status: 'COMPLETED',
      priceCents: 2500, // $25
      currency: 'USD',
    createdAt: new Date().toISOString(),
    }
  ];
};

// Tutor profile endpoints
app.get('/api/tutors/profile', authenticateToken, (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const tutor = dataManager.getTutorByUserId(userId);
    
    if (!tutor) {
      return res.status(404).json({ error: 'Tutor profile not found' });
    }

    const user = dataManager.getUserById(tutor.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      ...tutor,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        country: user.country,
        phone: user.phone,
      }
    });
  } catch (error) {
    console.error('Error fetching tutor profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Tutor bookings endpoint - simplified version
app.get('/api/tutors/bookings', authenticateToken, async (req, res) => {
  try {
    console.log(`[TUTOR BOOKINGS] Starting request for user: ${req.user?.userId}`);
    
    const user = dataManager.getUserById(req.user?.userId || '');
    console.log(`[TUTOR BOOKINGS] User found: ${!!user}, ID: ${user?.id}`);
    
    if (!user) {
      console.log(`[TUTOR BOOKINGS] User not found for ID: ${req.user?.userId}`);
      errorLogger.logApiError('/api/tutors/bookings', 'GET', 404, 
        new Error('User not found'), { userId: req.user?.userId });
      return res.status(404).json({ error: 'User not found' });
    }

    const tutor = dataManager.getTutorByUserId(user.id);
    console.log(`[TUTOR BOOKINGS] Tutor found: ${!!tutor}, ID: ${tutor?.id}`);
    
    if (!tutor) {
      console.log(`[TUTOR BOOKINGS] Tutor profile not found for user: ${user.id}`);
      errorLogger.logApiError('/api/tutors/bookings', 'GET', 404, 
        new Error('Tutor profile not found'), { userId: req.user?.userId, userRole: user.role });
      return res.status(404).json({ error: 'Tutor profile not found' });
    }

    const tutorBookings = dataManager.getBookingsByTutorId(tutor.id);
    console.log(`[TUTOR BOOKINGS] Found ${tutorBookings.length} bookings for tutor: ${tutor.id}`);
    res.json(tutorBookings);
  } catch (error) {
    console.error('Error fetching tutor bookings:', error);
    errorLogger.logError(error, { 
      endpoint: '/api/tutors/bookings',
      method: 'GET',
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Tutor stats endpoint - simplified version
app.get('/api/tutors/stats', authenticateToken, async (req, res) => {
  try {
    const user = dataManager.getUserById(req.user?.userId || '');
    
    if (!user) {
      errorLogger.logApiError('/api/tutors/stats', 'GET', 404, 
        new Error('User not found'), { userId: req.user?.userId });
      return res.status(404).json({ error: 'User not found' });
    }

    const tutor = dataManager.getTutorByUserId(user.id);
    
    if (!tutor) {
      errorLogger.logApiError('/api/tutors/stats', 'GET', 404, 
        new Error('Tutor profile not found'), { userId: req.user?.userId, userRole: user.role });
      return res.status(404).json({ error: 'Tutor profile not found' });
    }

    const tutorBookings = dataManager.getBookingsByTutorId(tutor.id);
    const completedBookings = tutorBookings.filter(b => b.status === 'COMPLETED');
    const pendingBookings = tutorBookings.filter(b => b.status === 'PENDING');
    const cancelledBookings = tutorBookings.filter(b => b.status === 'CANCELLED');
    
    const totalEarnings = completedBookings.reduce((sum, booking) => sum + booking.priceCents, 0);
    const averageSessionPrice = completedBookings.length > 0 
      ? totalEarnings / completedBookings.length 
      : 0;

    const stats = {
      totalBookings: tutorBookings.length,
      completedBookings: completedBookings.length,
      pendingBookings: pendingBookings.length,
      cancelledBookings: cancelledBookings.length,
      totalEarnings,
      averageSessionPrice,
      studentsTaught: new Set(tutorBookings.map(b => b.studentId)).size,
      sessionsCompleted: completedBookings.length,
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching tutor stats:', error);
    errorLogger.logError(error, { 
      endpoint: '/api/tutors/stats',
      method: 'GET',
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper function to find tutor by ID or slug
function findTutorByIdOrSlug(identifier: string) {
  const tutors = dataManager.getAllTutors();
  
  // First try to find by exact ID
  let tutor = tutors.find(t => t.id === identifier);
  
  if (!tutor) {
    // If not found by ID, try to find by slug
    tutor = tutors.find(t => {
      const user = dataManager.getUserById(t.userId);
      if (!user) return false;
      const slug = generateSlug(user.name);
      return slug === identifier;
    });
  }
  
  return tutor;
}

app.get('/api/tutors/:tutorId', (req, res) => {
  try {
    const { tutorId } = req.params;
    const tutor = findTutorByIdOrSlug(tutorId);
    
    if (!tutor) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    const user = dataManager.getUserById(tutor.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      ...tutor,
      slug: generateSlug(user.name), // Include slug in response
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        country: user.country,
        phone: user.phone,
      }
    });
  } catch (error) {
    console.error('Error fetching tutor profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Tutor rating stats
app.get('/api/tutors/:tutorId/rating-stats', (req, res) => {
  try {
    const { tutorId } = req.params;
    const stats = dataManager.getTutorRatingStats(tutorId);
    res.json(stats);
  } catch (error) {
    console.error('Tutor rating stats error:', error);
    res.status(500).json({ error: 'Failed to fetch rating stats' });
  }
});

// Chat endpoints
app.get('/api/chat/messages/:userId1/:userId2', authenticateToken, (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    // Only allow if requester is one of the users or admin
    if (req.user?.userId !== userId1 && req.user?.userId !== userId2 && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const items = dataManager.getMessagesByUsers(userId1, userId2);
    res.json({ items, total: items.length });
  } catch (error) {
    console.error('Chat messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.put('/api/chat/messages/read', authenticateToken, (req, res) => {
  try {
    const { senderId } = req.body;
    if (!senderId) return res.status(400).json({ error: 'senderId required' });
    dataManager.markMessagesAsRead(req.user?.userId || '', senderId);
    res.json({ success: true });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

app.get('/api/chat/unread-count', authenticateToken, (req, res) => {
  try {
    const count = dataManager.getUnreadMessageCount(req.user?.userId || '');
    res.json({ count });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

app.get('/api/chat/conversations', authenticateToken, (req, res) => {
  try {
    const all = dataManager.getAllMessages();
    const myId = req.user?.userId || '';
    const peers = new Set<string>();
    all.forEach(m => {
      if (m.senderId === myId) peers.add(m.recipientId);
      if (m.recipientId === myId) peers.add(m.senderId);
    });
    const conversations = Array.from(peers).map(peerId => ({
      peerId,
      unread: dataManager.getUnreadMessageCount(myId),
    }));
    res.json({ conversations });
  } catch (error) {
    console.error('Conversations list error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Tutor profile update endpoint
app.put('/api/tutors/profile', authenticateToken, (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const tutor = dataManager.getAllTutors().find(t => t.userId === userId);
    
    if (!tutor) {
      return res.status(404).json({ error: 'Tutor profile not found' });
    }

    const updates = req.body;
    const updatedTutor = { ...tutor, ...updates, updatedAt: new Date().toISOString() };
    
    dataManager.updateTutor(tutor.id, updates);

    res.json({ success: true, profile: updatedTutor });
  } catch (error) {
    console.error('Error updating tutor profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Learning Progress endpoints with real data
app.get('/api/students/learning-progress/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const learningProgress = dataManager.getLearningProgress(studentId);
    res.json(learningProgress);
  } catch (error) {
    console.error('Learning progress fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch learning progress' });
  }
});

app.post('/api/students/learning-goals', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, priority, targetDate } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const newGoal = {
      id: `goal-${Date.now()}`,
      title,
      description,
      category,
      priority,
      targetDate,
      progress: 0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    
    dataManager.addLearningGoal(userId, newGoal);
    res.status(201).json({ success: true, goal: newGoal });
  } catch (error) {
    console.error('Learning goal creation error:', error);
    res.status(500).json({ error: 'Failed to create learning goal' });
  }
});

app.put('/api/students/learning-goals/:goalId', authenticateToken, async (req, res) => {
  try {
    const { goalId } = req.params;
    const { progress, status } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const updatedGoal = dataManager.updateLearningGoal(userId, goalId, { progress, status });
    if (updatedGoal) {
      res.json({ success: true, goal: updatedGoal });
    } else {
      res.status(404).json({ error: 'Goal not found' });
    }
  } catch (error) {
    console.error('Learning goal update error:', error);
    res.status(500).json({ error: 'Failed to update learning goal' });
  }
});

app.delete('/api/students/learning-goals/:goalId', authenticateToken, async (req, res) => {
  try {
    const { goalId } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const deleted = dataManager.deleteLearningGoal(userId, goalId);
    if (deleted) {
      res.json({ success: true, message: 'Goal deleted successfully' });
    } else {
      res.status(404).json({ error: 'Goal not found' });
    }
  } catch (error) {
    console.error('Learning goal deletion error:', error);
    res.status(500).json({ error: 'Failed to delete learning goal' });
  }
});

app.post('/api/students/upcoming-sessions', authenticateToken, async (req, res) => {
  try {
    const { tutor, subject, date, time, duration } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const newSession = {
      id: `session-${Date.now()}`,
      tutor,
      subject,
      date,
      time,
      duration: duration || 60
    };
    
    dataManager.addUpcomingSession(userId, newSession);
    res.status(201).json({ success: true, session: newSession });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

app.put('/api/students/sessions/:sessionId/complete', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const completed = dataManager.completeSession(userId, sessionId);
    if (completed) {
      res.json({ success: true, message: 'Session marked as completed' });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    console.error('Session completion error:', error);
    res.status(500).json({ error: 'Failed to complete session' });
  }
});

// Simple test endpoint without authentication
app.get('/api/test/tutor-lookup/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const tutor = dataManager.getTutorByUserId(userId);
    
    if (!tutor) {
      return res.status(404).json({ error: 'Tutor not found' });
    }
    
    res.json({ success: true, tutor });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ error: 'Test failed' });
  }
});

// Test authenticated endpoint
app.get('/api/test/auth', authenticateToken, (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
      userId: req.user?.userId,
      message: 'Authentication working'
    });
  } catch (error) {
    console.error('Auth test error:', error);
    res.status(500).json({ error: 'Auth test failed' });
  }
});

// Tutor bookings endpoint - simplified version
app.get('/api/tutors/bookings', authenticateToken, async (req, res) => {
  try {
    console.log(`[TUTOR BOOKINGS] Starting request for user: ${req.user?.userId}`);
    
    const user = dataManager.getUserById(req.user?.userId || '');
    console.log(`[TUTOR BOOKINGS] User found: ${!!user}, ID: ${user?.id}`);
    
    if (!user) {
      console.log(`[TUTOR BOOKINGS] User not found for ID: ${req.user?.userId}`);
      errorLogger.logApiError('/api/tutors/bookings', 'GET', 404, 
        new Error('User not found'), { userId: req.user?.userId });
      return res.status(404).json({ error: 'User not found' });
    }

    const tutor = dataManager.getTutorByUserId(user.id);
    console.log(`[TUTOR BOOKINGS] Tutor found: ${!!tutor}, ID: ${tutor?.id}`);
    
    if (!tutor) {
      console.log(`[TUTOR BOOKINGS] Tutor profile not found for user: ${user.id}`);
      errorLogger.logApiError('/api/tutors/bookings', 'GET', 404, 
        new Error('Tutor profile not found'), { userId: req.user?.userId, userRole: user.role });
      return res.status(404).json({ error: 'Tutor profile not found' });
    }

    const tutorBookings = dataManager.getBookingsByTutorId(tutor.id);
    console.log(`[TUTOR BOOKINGS] Found ${tutorBookings.length} bookings for tutor: ${tutor.id}`);
    res.json(tutorBookings);
  } catch (error) {
    console.error('Error fetching tutor bookings:', error);
    errorLogger.logError(error, { 
      endpoint: '/api/tutors/bookings',
      method: 'GET',
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Tutor stats endpoint - simplified version
app.get('/api/tutors/stats', authenticateToken, async (req, res) => {
  try {
    const user = dataManager.getUserById(req.user?.userId || '');
    
    if (!user) {
      errorLogger.logApiError('/api/tutors/stats', 'GET', 404, 
        new Error('User not found'), { userId: req.user?.userId });
      return res.status(404).json({ error: 'User not found' });
    }

    const tutor = dataManager.getTutorByUserId(user.id);
    
    if (!tutor) {
      errorLogger.logApiError('/api/tutors/stats', 'GET', 404, 
        new Error('Tutor profile not found'), { userId: req.user?.userId, userRole: user.role });
      return res.status(404).json({ error: 'Tutor profile not found' });
    }

    const tutorBookings = dataManager.getBookingsByTutorId(tutor.id);
    const completedBookings = tutorBookings.filter(b => b.status === 'COMPLETED');
    const pendingBookings = tutorBookings.filter(b => b.status === 'PENDING');
    const cancelledBookings = tutorBookings.filter(b => b.status === 'CANCELLED');
    
    const totalEarnings = completedBookings.reduce((sum, booking) => sum + booking.priceCents, 0);
    const averageSessionPrice = completedBookings.length > 0 
      ? totalEarnings / completedBookings.length 
      : 0;

    const stats = {
      totalBookings: tutorBookings.length,
      completedBookings: completedBookings.length,
      pendingBookings: pendingBookings.length,
      cancelledBookings: cancelledBookings.length,
      totalEarnings,
      averageSessionPrice,
      studentsTaught: new Set(tutorBookings.map(b => b.studentId)).size,
      sessionsCompleted: completedBookings.length,
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching tutor stats:', error);
    errorLogger.logError(error, { 
      endpoint: '/api/tutors/stats',
      method: 'GET',
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint to debug tutor lookup
app.get('/api/debug/tutor-lookup/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`[DEBUG] Looking up tutor for userId: ${userId}`);
    
    const allTutors = dataManager.getAllTutors();
    console.log(`[DEBUG] All tutors:`, allTutors.map(t => ({ id: t.id, userId: t.userId })));
    
    const tutor = dataManager.getTutorByUserId(userId);
    console.log(`[DEBUG] Tutor found:`, tutor);
    
    res.json({
      userId,
      allTutors: allTutors.map(t => ({ id: t.id, userId: t.userId })),
      tutorFound: !!tutor,
      tutor: tutor
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: 'Debug failed' });
  }
});

// Error logging endpoints
app.post('/api/logs', (req, res) => {
  try {
    const { errors, sessionId, userId } = req.body;
    
    // Log each error to console with structured format
    errors.forEach((error: any) => {
      console.error(`[CLIENT ERROR] ${error.type.toUpperCase()} - ${error.component || 'Unknown'}:`, {
        id: error.id,
        message: error.message,
        component: error.component,
        action: error.action,
        url: error.url,
        userId: userId || 'anonymous',
        sessionId: sessionId,
        timestamp: error.timestamp,
        metadata: error.metadata,
        stack: error.stack,
      });
    });

    // In a real application, you would save these to a database
    // For now, we'll just log them to console and return success
    res.json({ success: true, logged: errors.length });
  } catch (error) {
    console.error('Error processing client error logs:', error);
    res.status(500).json({ error: 'Failed to process error logs' });
  }
});

// Server-side error logging endpoint
app.post('/api/logs/server-error', (req, res) => {
  try {
    const { error, context, userId, sessionId } = req.body;
    
    console.error(`[SERVER ERROR] ${context || 'Unknown Context'}:`, {
      message: error.message,
      stack: error.stack,
      userId: userId || 'anonymous',
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
      context: context,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing server error log:', error);
    res.status(500).json({ error: 'Failed to process server error log' });
  }
});

// Get error logs (for admin dashboard)
app.get('/api/logs/errors', authenticateToken, requireRole(['ADMIN']), (req, res) => {
  try {
    // In a real application, you would fetch from database
    // For now, return mock data
    const mockErrors = [
      {
        id: 'error_1',
        timestamp: new Date().toISOString(),
        type: 'error',
        level: 'client',
        message: 'Failed to load tutor profile',
        component: 'TutorProfile',
        action: 'load_profile',
        url: '/tutor/123',
        userId: 'user_1',
        sessionId: 'session_1',
        count: 5,
      },
      {
        id: 'error_2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: 'warning',
        level: 'client',
        message: 'Slow API response',
        component: 'SearchPage',
        action: 'search_tutors',
        url: '/search',
        userId: 'user_2',
        sessionId: 'session_2',
        count: 3,
      },
    ];

    res.json({ errors: mockErrors });
  } catch (error) {
    console.error('Error fetching error logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin profile management endpoints
app.get('/api/admin/profile', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const user = dataManager.getUserById(req.user?.userId || '');
    if (!user) {
      return res.status(404).json({ error: 'Admin profile not found' });
    }

    const profile = {
      ...user,
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        weeklyReports: true,
        securityAlerts: true
      },
      security: {
        twoFactorEnabled: false,
        lastPasswordChange: user.createdAt,
        loginAttempts: 0
      }
    };

    res.json(profile);
  } catch (error) {
    console.error('Admin profile error:', error);
    errorLogger.logError(error, { 
      endpoint: '/api/admin/profile',
      method: 'GET',
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/profile', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.user?.userId || '';

    const user = dataManager.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Admin profile not found' });
    }

    dataManager.updateUser(userId, {
      name,
      email,
      phone,
      updatedAt: new Date().toISOString()
    });

    const updatedUser = dataManager.getUserById(userId);

    errorLogger.logInfo(`Admin profile updated by ${userId}`, {
      endpoint: '/api/admin/profile',
      method: 'PUT',
      adminId: userId,
      changes: { name, email, phone }
    });

    res.json({ success: true, profile: updatedUser });
  } catch (error) {
    console.error('Admin profile update error:', error);
    errorLogger.logError(error, { 
      endpoint: '/api/admin/profile',
      method: 'PUT',
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/profile/password', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId || '';

    // In a real app, you would verify the current password
    // For now, we'll just update it
    const user = dataManager.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Admin profile not found' });
    }

    dataManager.updateUser(userId, {
      password: newPassword, // In real app, this should be hashed
      lastPasswordChange: new Date().toISOString()
    });

    errorLogger.logInfo(`Admin password updated by ${userId}`, {
      endpoint: '/api/admin/profile/password',
      method: 'PUT',
      adminId: userId
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Admin password update error:', error);
    errorLogger.logError(error, { 
      endpoint: '/api/admin/profile/password',
      method: 'PUT',
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/profile/preferences', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const preferences = req.body;
    const userId = req.user?.userId || '';

    // In a real app, you would store preferences in a separate table
    // For now, we'll just log the update
    errorLogger.logInfo(`Admin preferences updated by ${userId}`, {
      endpoint: '/api/admin/profile/preferences',
      method: 'PUT',
      adminId: userId,
      preferences
    });

    res.json({ success: true, message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Admin preferences update error:', error);
    errorLogger.logError(error, { 
      endpoint: '/api/admin/profile/preferences',
      method: 'PUT',
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== REVIEWS & RATINGS ENDPOINTS ====================

// Submit a review for a completed session
app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { tutorId, bookingId, rating, comment } = req.body;
    const studentId = req.user?.userId;

    if (!studentId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate required fields
    if (!tutorId || !bookingId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid review data' });
    }

    // Check if booking exists and is completed
    const booking = dataManager.getBookingById(bookingId);
    if (!booking || booking.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Can only review completed sessions' });
    }

    // Check if student already reviewed this session
    const existingReview = dataManager.getAllReviews().find(r => 
      r.studentId === studentId && r.bookingId === bookingId
    );
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this session' });
    }

    const review = {
      tutorId,
      studentId,
      bookingId,
      rating: parseInt(rating),
      comment: comment || '',
      studentName: dataManager.getUserById(studentId)?.name || 'Anonymous'
    };

    const newReview = dataManager.addReview(review);
    res.status(201).json({ success: true, review: newReview });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// Get reviews for a specific tutor
app.get('/api/tutors/:tutorId/reviews', async (req, res) => {
  try {
    const { tutorId } = req.params;
    const reviews = dataManager.getReviewsByTutor(tutorId);
    const ratingStats = dataManager.getTutorRatingStats(tutorId);
    
    res.json({
      reviews,
      ratingStats
    });
  } catch (error) {
    console.error('Reviews fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get reviews by a specific student
app.get('/api/students/:studentId/reviews', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user?.userId;

    // Students can only view their own reviews
    if (userId !== studentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const reviews = dataManager.getReviewsByStudent(studentId);
    res.json(reviews);
  } catch (error) {
    console.error('Student reviews fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get all reviews (admin only)
app.get('/api/admin/reviews', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { status } = req.query;
    const reviews = dataManager.getAllReviews(status ? String(status) : undefined);
    res.json(reviews);
  } catch (error) {
    console.error('Admin reviews fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get featured reviews for home page
app.get('/api/reviews/featured', async (req, res) => {
  try {
    const featuredReviews = dataManager.getFeaturedReviews();
    res.json({ reviews: featuredReviews });
  } catch (error) {
    console.error('Featured reviews fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch featured reviews' });
  }
});

// Create success story (public review for home page)
app.post('/api/reviews/success-story', authenticateToken, async (req, res) => {
  try {
    const { tutorId, subject, rating, comment, improvement } = req.body;
    const studentId = req.user?.userId;

    if (!studentId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate required fields
    if (!tutorId || !rating || rating < 1 || rating > 5 || !comment) {
      return res.status(400).json({ error: 'Tutor ID, rating (1-5), and comment are required' });
    }

    // Check if student has completed sessions with this tutor
    const completedBookings = dataManager.getAllBookings().filter(b => 
      b.studentId === studentId && 
      b.tutorId === tutorId && 
      b.status === 'COMPLETED'
    );

    if (completedBookings.length === 0) {
      return res.status(400).json({ error: 'You can only review tutors you have completed sessions with' });
    }

    // Check if student already reviewed this tutor
    const existingReview = dataManager.getReviewsByStudent(studentId).find(r => r.tutorId === tutorId);
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this tutor' });
    }

    const review = {
      tutorId,
      studentId,
      rating: parseInt(rating),
      comment: comment.trim(),
      subject: subject || 'General Tutoring',
      improvement: improvement || 'Significant improvement achieved',
      isSuccessStory: true, // Mark as success story for home page display
    };

    const newReview = dataManager.addReview(review);

    // Create notification for tutor
    dataManager.addNotification({
      userId: tutorId,
      type: 'REVIEW_RECEIVED',
      title: 'New Success Story Received',
      message: `A student shared their success story about your tutoring!`,
      data: { reviewId: newReview.id, rating: rating }
    });

    res.status(201).json({
      success: true,
      review: newReview,
      message: 'Thank you for sharing your success story! It will be reviewed and featured on our homepage.'
    });

  } catch (error) {
    console.error('Success story submission error:', error);
    res.status(500).json({ error: 'Failed to submit success story' });
  }
});

// Update review status (admin only)
app.put('/api/admin/reviews/:reviewId/status', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;
    const adminId = req.user?.userId;

    if (!adminId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedReview = dataManager.updateReviewStatus(reviewId, status, adminId);
    if (updatedReview) {
      res.json({ success: true, review: updatedReview });
    } else {
      res.status(404).json({ error: 'Review not found' });
    }
  } catch (error) {
    console.error('Review status update error:', error);
    res.status(500).json({ error: 'Failed to update review status' });
  }
});

// Delete review (admin only)
app.delete('/api/admin/reviews/:reviewId', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { reviewId } = req.params;
    const deleted = dataManager.deleteReview(reviewId);
    if (deleted) {
      res.json({ success: true, message: 'Review deleted successfully' });
    } else {
      res.status(404).json({ error: 'Review not found' });
    }
  } catch (error) {
    console.error('Review deletion error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Online status endpoints
app.post('/api/users/online', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // In a real app, this would update a Redis cache or database
    // For now, we'll just return success
    res.json({ success: true, message: 'Online status updated' });
  } catch (error) {
    console.error('Online status update error:', error);
    res.status(500).json({ error: 'Failed to update online status' });
  }
});

app.get('/api/tutors/online-status', async (req, res) => {
  try {
    const { tutorIds } = req.query;
    
    if (!tutorIds) {
      return res.json({});
    }

    // Handle both array and comma-separated string formats
    let ids: string[];
    if (Array.isArray(tutorIds)) {
      ids = tutorIds.map(id => String(id));
    } else if (typeof tutorIds === 'string' && tutorIds.includes(',')) {
      ids = tutorIds.split(',');
    } else {
      ids = [String(tutorIds)];
    }

    const onlineStatus: { [key: string]: boolean } = {};

    // Simulate online status (in a real app, this would check Redis/database)
    ids.forEach((id: string) => {
      // Simple simulation: 70% chance of being online
      onlineStatus[id] = Math.random() > 0.3;
    });

    res.json(onlineStatus);
  } catch (error) {
    console.error('Online status fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch online status' });
  }
});

// User profile update endpoint
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { avatarUrl, name, phone, country, timezone } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = dataManager.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user profile
    const updates: any = {};
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (country !== undefined) updates.country = country;
    if (timezone !== undefined) updates.timezone = timezone;

    dataManager.updateUser(userId, updates);
    const updatedUser = dataManager.getUserById(userId);

    res.json({ 
      success: true, 
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl,
        phone: updatedUser.phone,
        country: updatedUser.country,
        timezone: updatedUser.timezone,
        role: updatedUser.role,
        status: updatedUser.status
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Submit custom subject request
app.post('/api/subjects/custom-request', async (req, res) => {
  try {
    const { subjectName, description, level, studentId } = req.body;
    
    if (!subjectName || !level) {
      return res.status(400).json({ error: 'Subject name and level are required' });
    }
    
    // In a real app, this would be saved to database and notify admins
    const customRequest = {
      id: `custom-${Date.now()}`,
      subjectName,
      description: description || '',
      level,
      studentId: studentId || 'anonymous',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    
    console.log('Custom subject request received:', customRequest);
    
    // For now, just return success
    res.json({ 
      success: true, 
      message: 'Custom subject request submitted successfully',
      requestId: customRequest.id 
    });
  } catch (error) {
    console.error('Error submitting custom subject request:', error);
    res.status(500).json({ error: 'Failed to submit custom subject request' });
  }
});

// Submit review
app.post('/api/reviews', async (req, res) => {
  try {
    const { bookingId, tutorId, rating, comment, wouldRecommend, sessionQuality, tutorCommunication, tutorKnowledge, tutorPatience, overallExperience } = req.body;
    
    if (!bookingId || !tutorId || !rating) {
      return res.status(400).json({ error: 'Booking ID, tutor ID, and rating are required' });
    }
    
    // Get booking and tutor details
    const booking = dataManager.getBookingById(bookingId);
    const tutor = dataManager.getTutorById(tutorId);
    const student = dataManager.getUserById(booking?.studentId || '');
    
    if (!booking || !tutor || !student) {
      return res.status(404).json({ error: 'Booking, tutor, or student not found' });
    }
    
    // Create review
    const review = {
      id: `review-${Date.now()}`,
      bookingId,
      tutorId,
      studentId: booking.studentId,
      tutorName: tutor.user?.name || 'Unknown Tutor',
      studentName: student.name,
      rating,
      comment: comment || '',
      wouldRecommend: wouldRecommend || false,
      sessionQuality: sessionQuality || rating,
      tutorCommunication: tutorCommunication || rating,
      tutorKnowledge: tutorKnowledge || rating,
      tutorPatience: tutorPatience || rating,
      overallExperience: overallExperience || rating,
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
    };
    
    // Add review to data manager
    dataManager.addReview(review);
    
    // Update tutor rating stats
    dataManager.updateTutorRatingStats(tutorId);
    
    console.log('Review submitted:', review);
    
    res.json({ 
      success: true, 
      message: 'Review submitted successfully',
      reviewId: review.id 
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// ==================== ADMIN ENDPOINTS ====================

// Admin dashboard stats
app.get('/api/admin/dashboard', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    console.log('[ADMIN DASHBOARD] Fetching dashboard data...');
    const users = dataManager.getAllUsers();
    const tutors = dataManager.getAllTutors();
    const bookings = dataManager.getAllBookings();
    const reviews = dataManager.getAllReviews();
    
    console.log('[ADMIN DASHBOARD] Data counts:', {
      users: users.length,
      tutors: tutors.length,
      bookings: bookings.length,
      reviews: reviews.length
    });

    // Calculate stats
    const totalUsers = users.length;
    const totalTutors = tutors.length;
    const totalStudents = users.filter(u => u.role === 'STUDENT').length;
    const totalBookings = bookings.length;
    const pendingApprovals = users.filter(u => u.status === 'PENDING').length;
    const activeSessions = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING').length;
    
    // Calculate revenue from completed bookings
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
    const totalRevenue = completedBookings.reduce((sum, booking) => sum + (booking.priceCents || 0), 0);
    
    // Calculate average rating
    const approvedReviews = reviews.filter(r => r.status === 'APPROVED');
    const averageRating = approvedReviews.length > 0 
      ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) / approvedReviews.length 
      : 0;

    // Get recent bookings (last 10)
    const recentBookings = bookings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(booking => {
        const student = users.find(u => u.id === booking.studentId);
        // Fix: booking.tutorId should match tutor.id, not tutor.userId
        const tutor = tutors.find(t => t.id === booking.tutorId);
        const tutorUser = tutor ? users.find(u => u.id === tutor.userId) : null;
        return {
          ...booking,
          student: student ? { name: student.name, email: student.email } : null,
          tutor: tutor ? { name: tutorUser?.name || 'Unknown', user: tutorUser } : null
        };
      });

    // Get recent users (last 10)
    const recentUsers = users
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    // Calculate booking stats
    const pendingBookings = bookings.filter(b => b.status === 'PENDING' || b.status === 'PENDING_PAYMENT').length;
    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;
    const completedBookingsCount = completedBookings.length;
    const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;

    res.json({
      totalUsers,
      totalTutors,
      totalStudents,
      totalBookings,
      totalRevenue,
      pendingApprovals,
      activeSessions,
      averageRating: Math.round(averageRating * 10) / 10,
      pendingBookings,
      confirmedBookings,
      completedBookings: completedBookingsCount,
      cancelledBookings,
      recentBookings,
      recentUsers
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get all users for admin
app.get('/api/admin/users', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    console.log('[ADMIN USERS] Fetching all users...');
    const users = dataManager.getAllUsers();
    console.log('[ADMIN USERS] Found users:', users.length);
    res.json(users);
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all bookings for admin
app.get('/api/admin/bookings', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    console.log('[ADMIN BOOKINGS] Fetching all bookings...');
    const bookings = dataManager.getAllBookings();
    console.log('[ADMIN BOOKINGS] Found bookings:', bookings.length);
    
    // Enrich bookings with user/tutor data
    const enrichedBookings = bookings.map(booking => ({
      ...booking,
      student: dataManager.getUserById(booking.studentId),
      tutor: dataManager.getUserById(booking.tutorId)
    }));

    res.json(enrichedBookings);
  } catch (error) {
    console.error('Admin bookings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Approve user
app.post('/api/admin/users/:userId/approve', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user?.userId;

    const success = dataManager.updateUserStatus(userId, 'ACTIVE', adminId);
    if (success) {
      res.json({ success: true, message: 'User approved successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('User approval error:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
});

// Reject user
app.post('/api/admin/users/:userId/reject', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.userId;

    const success = dataManager.updateUserStatus(userId, 'REJECTED', adminId, reason);
    if (success) {
      res.json({ success: true, message: 'User rejected successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('User rejection error:', error);
    res.status(500).json({ error: 'Failed to reject user' });
  }
});

// Suspend user
app.post('/api/admin/users/:userId/suspend', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.userId;

    const success = dataManager.updateUserStatus(userId, 'SUSPENDED', adminId, reason);
    if (success) {
      res.json({ success: true, message: 'User suspended successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('User suspension error:', error);
    res.status(500).json({ error: 'Failed to suspend user' });
  }
});

// Activate user
app.post('/api/admin/users/:userId/activate', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user?.userId;

    const success = dataManager.updateUserStatus(userId, 'ACTIVE', adminId);
    if (success) {
      res.json({ success: true, message: 'User activated successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('User activation error:', error);
    res.status(500).json({ error: 'Failed to activate user' });
  }
});

// Delete user
app.delete('/api/admin/users/:userId', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user?.userId;

    const success = dataManager.deleteUser(userId, adminId);
    if (success) {
      res.json({ success: true, message: 'User deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Update booking status (admin)
app.put('/api/admin/bookings/:bookingId/status', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, reason } = req.body;
    const adminId = req.user?.userId;

    const booking = dataManager.getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    dataManager.updateBooking(bookingId, { status, statusReason: reason });
    res.json({ success: true, message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Booking status update error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// NOTE: Duplicate route removed - using the one above at line 1195 which includes profiles

// Get all tutors for admin
app.get('/api/admin/tutors', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const tutors = dataManager.getAllTutors();
    res.json({ tutors });
  } catch (error) {
    console.error('Admin tutors fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch tutors' });
  }
});

// ==================== CHAT ENDPOINTS ====================

// Get messages between two users
app.get('/api/chat/messages/:userId1/:userId2', authenticateToken, async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const currentUserId = req.user?.userId;
    
    // Verify user has access to this conversation
    if (currentUserId !== userId1 && currentUserId !== userId2) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const messages = dataManager.getMessagesByUsers(userId1, userId2);
    res.json(messages);
  } catch (error) {
    console.error('Chat messages fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get all conversations for a user
app.get('/api/chat/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const messages = dataManager.getMessagesByUser(userId);
    
    // Group messages by conversation partner
    const conversations = new Map();
    
    messages.forEach(msg => {
      const partnerId = msg.senderId === userId ? msg.recipientId : msg.senderId;
      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, {
          partnerId,
          lastMessage: msg,
          unreadCount: 0
        });
      }
      
      const conversation = conversations.get(partnerId);
      if (msg.timestamp > conversation.lastMessage.timestamp) {
        conversation.lastMessage = msg;
      }
      
      if (msg.recipientId === userId && !msg.read) {
        conversation.unreadCount++;
      }
    });
    
    // Add user information to each conversation
    const conversationList = Array.from(conversations.values())
      .map(conv => {
        const partnerUser = dataManager.getUserById(conv.partnerId);
        return {
          ...conv,
          partnerName: partnerUser?.name || `User ${conv.partnerId.split('-')[1] || conv.partnerId}`,
          partnerAvatar: partnerUser?.avatarUrl,
          lastMessageTime: conv.lastMessage.timestamp
        };
      })
      .sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());
    
    res.json(conversationList);
  } catch (error) {
    console.error('Chat conversations fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Mark messages as read
app.put('/api/chat/messages/read', authenticateToken, async (req, res) => {
  try {
    const { senderId } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    dataManager.markMessagesAsRead(userId, senderId);
    res.json({ success: true });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get unread message count
app.get('/api/chat/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const count = dataManager.getUnreadMessageCount(userId);
    res.json({ count });
  } catch (error) {
    console.error('Unread count fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5175", "http://localhost:8080"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = verifyToken(token);
    socket.data.user = decoded;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.data.user.userId} connected to chat`);
  
  // Join user to their personal room
  socket.join(`user-${socket.data.user.userId}`);
  
  // Handle joining chat rooms (for student-tutor conversations)
  socket.on('join-chat', (data) => {
    const { studentId, tutorId } = data;
    const chatRoomId = `chat-${studentId}-${tutorId}`;
    socket.join(chatRoomId);
    console.log(`User ${socket.data.user.userId} joined chat room: ${chatRoomId}`);
  });
  
  // Handle sending messages
  socket.on('send-message', async (data) => {
    try {
      const { recipientId, message, chatRoomId } = data;
      const senderId = socket.data.user.userId;
      
      // Save message to database
      const messageData = {
        id: `msg-${Date.now()}`,
        senderId,
        recipientId,
        message,
        timestamp: new Date().toISOString(),
        chatRoomId
      };
      
      dataManager.addMessage(messageData);
      
      // Create notification for recipient
      const senderUser = dataManager.getUserById(senderId);
      dataManager.addNotification({
        userId: recipientId,
        type: 'NEW_MESSAGE',
        title: 'New Message',
        message: `You have a new message from ${senderUser?.name || 'a user'}`,
        data: {
          senderId,
          messageId: messageData.id,
          chatRoomId
        }
      });
      
      // Send message to recipient
      socket.to(`user-${recipientId}`).emit('receive-message', messageData);
      
      // Also send to chat room if it exists
      if (chatRoomId) {
        socket.to(chatRoomId).emit('receive-message', messageData);
      }
      
      console.log(`Message sent from ${senderId} to ${recipientId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  // Handle typing indicators
  socket.on('typing-start', (data) => {
    const { recipientId, chatRoomId } = data;
    socket.to(`user-${recipientId}`).emit('user-typing', {
      userId: socket.data.user.userId,
      isTyping: true
    });
    
    if (chatRoomId) {
      socket.to(chatRoomId).emit('user-typing', {
        userId: socket.data.user.userId,
        isTyping: true
      });
    }
  });
  
  socket.on('typing-stop', (data) => {
    const { recipientId, chatRoomId } = data;
    socket.to(`user-${recipientId}`).emit('user-typing', {
      userId: socket.data.user.userId,
      isTyping: false
    });
    
    if (chatRoomId) {
      socket.to(chatRoomId).emit('user-typing', {
        userId: socket.data.user.userId,
        isTyping: false
      });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User ${socket.data.user.userId} disconnected from chat`);
  });
});

// ==================== PAYMENT ROUTES ====================

// Create payment intent for a booking
app.post('/api/payments/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { bookingId, amount, currency = 'usd' } = req.body;
    const userId = req.user?.userId;

    if (!bookingId || !amount) {
      return res.status(400).json({ error: 'Booking ID and amount are required' });
    }

    // Verify booking belongs to student
    const booking = dataManager.getBookingById(bookingId);
    if (!booking || booking.studentId !== userId) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }

    // For now, create a mock payment intent (replace with actual Stripe integration)
    const paymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      status: 'requires_payment_method'
    };

    // Create payment record
    const payment = {
      id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bookingId: bookingId,
      studentId: booking.studentId,
      tutorId: booking.tutorId,
      amount: amount,
      currency: currency,
      stripePaymentIntentId: paymentIntent.id,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        subject: booking.subject,
        sessionDate: booking.sessionDate,
        platformFee: amount * 0.10, // 10% platform fee
        tutorAmount: amount * 0.90
      }
    };

    dataManager.addPayment(payment);

    res.json({
      success: true,
      paymentIntent: paymentIntent,
      payment: payment
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Confirm payment (mock implementation)
app.post('/api/payments/confirm-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    const payment = dataManager.getPaymentByStripeId(paymentIntentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Mock successful payment
    payment.status = 'COMPLETED';
    payment.updatedAt = new Date().toISOString();
    payment.stripeChargeId = `ch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payout record for tutor
    const payout = {
      id: `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentId: payment.id,
      tutorId: payment.tutorId,
      amount: payment.metadata.tutorAmount,
      currency: payment.currency,
      status: 'PENDING',
      holdUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days hold
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        platformFee: payment.metadata.platformFee,
        subject: payment.metadata.subject,
        sessionDate: payment.metadata.sessionDate
      }
    };

    dataManager.addPayout(payout);
    dataManager.updatePayment(payment);

    // Update booking status
    const booking = dataManager.getBookingById(payment.bookingId);
    if (booking) {
      booking.status = 'CONFIRMED';
      booking.paymentStatus = 'PAID';
        dataManager.updateBooking(booking.id, booking);
    }

    res.json({
      success: true,
      payment: payment,
      payout: payout
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Get payment history for student
app.get('/api/payments/student/payments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const payments = dataManager.getPaymentsByStudent(userId);
    
    res.json({
      success: true,
      payments: payments
    });

  } catch (error) {
    console.error('Error fetching student payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get payout history for tutor
app.get('/api/payments/tutor/payouts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const tutor = dataManager.getTutorByUserId(userId);
    
    if (!tutor) {
      return res.status(404).json({ error: 'Tutor profile not found' });
    }

    const payouts = dataManager.getPayoutsByTutor(tutor.id);
    
    res.json({
      success: true,
      payouts: payouts
    });

  } catch (error) {
    console.error('Error fetching tutor payouts:', error);
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
});

// Request refund
app.post('/api/payments/request-refund', authenticateToken, async (req, res) => {
  try {
    const { paymentId, reason } = req.body;
    const userId = req.user?.userId;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    // Verify payment belongs to student
    const payment = dataManager.getPaymentById(paymentId);
    if (!payment || payment.studentId !== userId) {
      return res.status(404).json({ error: 'Payment not found or unauthorized' });
    }

    // Mock refund processing
    payment.status = 'REFUNDED';
    payment.refundId = `re_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    payment.refundAmount = payment.amount;
    payment.refundReason = reason;
    payment.updatedAt = new Date().toISOString();

    dataManager.updatePayment(payment);

    // Update booking status
    const booking = dataManager.getBookingById(payment.bookingId);
    if (booking) {
      booking.status = 'REFUNDED';
      booking.paymentStatus = 'REFUNDED';
        dataManager.updateBooking(booking.id, booking);
    }

    res.json({
      success: true,
      refund: {
        id: payment.refundId,
        amount: payment.refundAmount,
        reason: payment.refundReason
      },
      payment: payment
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

// Create dispute
app.post('/api/payments/create-dispute', authenticateToken, async (req, res) => {
  try {
    const { paymentId, reason, description } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!paymentId || !reason) {
      return res.status(400).json({ error: 'Payment ID and reason are required' });
    }

    // Verify payment belongs to student
    const payment = dataManager.getPaymentById(paymentId);
    if (!payment || payment.studentId !== userId) {
      return res.status(404).json({ error: 'Payment not found or unauthorized' });
    }

    const dispute = {
      id: `dispute_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentId: paymentId,
      studentId: userId,
      tutorId: payment.tutorId,
      reason: reason,
      description: description,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminNotes: null,
      resolution: null
    };

    dataManager.addDispute(dispute);

    // Create notification for admin
    dataManager.addNotification({
      userId: 'admin', // Notify all admins
      type: 'NEW_MESSAGE' as any, // Using NEW_MESSAGE as closest match
      title: 'New Payment Dispute',
      message: `Student ${dataManager.getUserById(userId)?.name || 'Unknown'} has created a dispute for payment ${paymentId}`,
      data: { disputeId: dispute.id, paymentId: paymentId },
      read: false
    });

    res.json({
      success: true,
      dispute: dispute
    });

  } catch (error) {
    console.error('Error creating dispute:', error);
    res.status(500).json({ error: 'Failed to create dispute' });
  }
});

// Get disputes for student
app.get('/api/payments/student/disputes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const disputes = dataManager.getDisputesByStudent(userId);
    
    res.json({
      success: true,
      disputes: disputes
    });

  } catch (error) {
    console.error('Error fetching student disputes:', error);
    res.status(500).json({ error: 'Failed to fetch disputes' });
  }
});

// Get disputes for tutor
app.get('/api/payments/tutor/disputes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const tutor = dataManager.getTutorByUserId(userId);
    
    if (!tutor) {
      return res.status(404).json({ error: 'Tutor profile not found' });
    }

    const disputes = dataManager.getDisputesByTutor(tutor.id);
    
    res.json({
      success: true,
      disputes: disputes
    });

  } catch (error) {
    console.error('Error fetching tutor disputes:', error);
    res.status(500).json({ error: 'Failed to fetch disputes' });
  }
});

// Admin endpoints
app.get('/api/payments/admin/payments', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const payments = dataManager.getAllPayments();
    
    res.json({
      success: true,
      payments: payments
    });

  } catch (error) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

app.get('/api/payments/admin/payouts', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const payouts = dataManager.getAllPayouts();
    
    res.json({
      success: true,
      payouts: payouts
    });

  } catch (error) {
    console.error('Error fetching all payouts:', error);
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
});

app.get('/api/payments/admin/disputes', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const disputes = dataManager.getAllDisputes();
    
    res.json({
      success: true,
      disputes: disputes
    });

  } catch (error) {
    console.error('Error fetching all disputes:', error);
    res.status(500).json({ error: 'Failed to fetch disputes' });
  }
});

// Admin: Process payout
app.post('/api/payments/admin/process-payout', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { payoutId } = req.body;

    if (!payoutId) {
      return res.status(400).json({ error: 'Payout ID is required' });
    }

    const payout = dataManager.getPayoutById(payoutId);
    if (!payout) {
      return res.status(404).json({ error: 'Payout not found' });
    }

    // Mock payout processing
    payout.status = 'PAID';
    payout.stripeTransferId = `tr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    payout.paidAt = new Date().toISOString();
    payout.updatedAt = new Date().toISOString();

    dataManager.updatePayout(payout);

    res.json({
      success: true,
      payout: payout
    });

  } catch (error) {
    console.error('Error processing payout:', error);
    res.status(500).json({ error: 'Failed to process payout' });
  }
});

// Admin: Handle dispute
app.post('/api/payments/admin/handle-dispute', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { disputeId, status, adminNotes, resolution } = req.body;

    if (!disputeId || !status) {
      return res.status(400).json({ error: 'Dispute ID and status are required' });
    }

    const dispute = dataManager.getDisputeById(disputeId);
    if (!dispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    dispute.status = status;
    dispute.adminNotes = adminNotes;
    dispute.resolution = resolution;
    dispute.updatedAt = new Date().toISOString();

    dataManager.updateDispute(dispute);

    res.json({
      success: true,
      dispute: dispute
    });

  } catch (error) {
    console.error('Error handling dispute:', error);
    res.status(500).json({ error: 'Failed to handle dispute' });
  }
});

// Admin: Get payment analytics
app.get('/api/payments/admin/analytics', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const payments = dataManager.getAllPayments();
    const payouts = dataManager.getAllPayouts();
    const disputes = dataManager.getAllDisputes();

    let filteredPayments = payments;
    let filteredPayouts = payouts;
    let filteredDisputes = disputes;

    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      filteredPayments = payments.filter(p => {
        const date = new Date(p.createdAt);
        return date >= start && date <= end;
      });
      
      filteredPayouts = payouts.filter(p => {
        const date = new Date(p.createdAt);
        return date >= start && date <= end;
      });
      
      filteredDisputes = disputes.filter(d => {
        const date = new Date(d.createdAt);
        return date >= start && date <= end;
      });
    }

    const totalRevenue = filteredPayments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPayouts = filteredPayouts
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);

    const platformFees = filteredPayments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.metadata.platformFee, 0);

    const pendingPayouts = filteredPayouts
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + p.amount, 0);

    const openDisputes = filteredDisputes.filter(d => d.status === 'OPEN').length;

    res.json({
      success: true,
      analytics: {
        totalRevenue,
        totalPayouts,
        platformFees,
        pendingPayouts,
        openDisputes,
        paymentCount: filteredPayments.length,
        payoutCount: filteredPayouts.length,
        disputeCount: filteredDisputes.length,
        averagePaymentAmount: filteredPayments.length > 0 ? totalRevenue / filteredPayments.length : 0,
        successRate: filteredPayments.length > 0 ? 
          (filteredPayments.filter(p => p.status === 'COMPLETED').length / filteredPayments.length) * 100 : 0
      }
    });

  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Serve static files in production
if (isProduction) {
  const distPath = path.join(__dirname, '..', 'dist');
  
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  });
  
  console.log(`Static files served from: ${distPath}`);
}

// Start server
server.listen(PORT, () => {
  console.log(`Tutorspool API listening on http://localhost:${PORT}`);
  console.log(`Sample data loaded: ${dataManager.getAllUsers().length} users, ${dataManager.getAllTutors().length} tutors`);
  if (isProduction) {
    console.log('Running in PRODUCTION mode - serving static files');
  } else {
    console.log('Running in DEVELOPMENT mode');
  }
});