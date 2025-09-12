import express from 'express';
import cors from 'cors';
import { dataManager } from './dataManager';
const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5174;
app.use(cors());
app.use(express.json());
// Initialize sample data
dataManager.initializeSampleData();
// Simple JWT-like token generation (for development)
const generateToken = (userId, email, role) => {
    return Buffer.from(JSON.stringify({ userId, email, role, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64');
};
const verifyToken = (token) => {
    try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        if (decoded.exp < Date.now()) {
            throw new Error('Token expired');
        }
        return decoded;
    }
    catch (error) {
        throw new Error('Invalid token');
    }
};
// Middleware for authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    try {
        const decoded = verifyToken(token);
        console.log(`[AUTH] Decoded token:`, decoded);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.log(`[AUTH] Token verification failed:`, error.message);
        return res.status(403).json({ error: 'Invalid token' });
    }
};
// Middleware for role-based access
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
});
// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, phone, country, timezone, role = 'STUDENT' } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }
        // Check if user already exists
        const existingUser = dataManager.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const user = {
            name,
            email,
            phone,
            country,
            timezone,
            role,
        };
        dataManager.addUser(user);
        const addedUser = dataManager.getUserByEmail(email);
        const token = generateToken(addedUser.id, addedUser.email, addedUser.role);
        res.status(201).json({
            success: true,
            user: { ...addedUser, password: undefined },
            token
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ error: 'Registration failed' });
    }
});
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = dataManager.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = generateToken(user.id, user.email, user.role);
        res.json({
            success: true,
            user: { ...user, password: undefined },
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ error: 'Login failed' });
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('OTP verification error:', error);
        res.status(400).json({ error: 'OTP verification failed' });
    }
});
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = dataManager.getUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ ...user, password: undefined });
    }
    catch (error) {
        console.error('Auth check error:', error);
        res.status(400).json({ error: 'Authentication failed' });
    }
});
// User profile endpoints
app.post('/api/students', authenticateToken, async (req, res) => {
    try {
        const { gradeLevel, learningGoals, preferredMode, budgetMin, budgetMax, specialRequirements, uploads } = req.body;
        const profile = {
            userId: req.user.userId,
            gradeLevel,
            learningGoals,
            preferredMode,
            budgetMin,
            budgetMax,
            specialRequirements,
            uploads,
        };
        dataManager.addStudent(profile);
        const addedProfile = dataManager.getStudentByUserId(req.user.userId);
        res.status(201).json({ success: true, profile: addedProfile });
    }
    catch (error) {
        console.error('Student profile creation error:', error);
        res.status(400).json({ error: 'Failed to create student profile' });
    }
});
// Get student profile
app.get('/api/students/profile', authenticateToken, async (req, res) => {
    try {
        const profile = dataManager.getStudentByUserId(req.user.userId);
        if (!profile) {
            return res.status(404).json({ error: 'Student profile not found' });
        }
        res.json({ success: true, profile });
    }
    catch (error) {
        console.error('Student profile fetch error:', error);
        res.status(400).json({ error: 'Failed to fetch student profile' });
    }
});
// Update student profile
app.put('/api/students/profile', authenticateToken, async (req, res) => {
    try {
        const { gradeLevel, learningGoals, preferredMode, budgetMin, budgetMax, specialRequirements, uploads } = req.body;
        const profile = dataManager.getStudentByUserId(req.user.userId);
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
    }
    catch (error) {
        console.error('Student profile update error:', error);
        res.status(400).json({ error: 'Failed to update student profile' });
    }
});
// Get student bookings
app.get('/api/students/bookings', authenticateToken, async (req, res) => {
    try {
        const studentBookings = dataManager.getBookingsByStudentId(req.user.userId);
        res.json({ success: true, bookings: studentBookings, total: studentBookings.length });
    }
    catch (error) {
        console.error('Student bookings fetch error:', error);
        res.status(400).json({ error: 'Failed to fetch student bookings' });
    }
});
// Get student stats
app.get('/api/students/stats', authenticateToken, async (req, res) => {
    try {
        const studentBookings = dataManager.getBookingsByStudentId(req.user.userId);
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
    }
    catch (error) {
        console.error('Student stats fetch error:', error);
        res.status(400).json({ error: 'Failed to fetch student stats' });
    }
});
app.post('/api/tutors', authenticateToken, async (req, res) => {
    try {
        const { headline, bio, hourlyRateCents, currency, yearsExperience, subjects, levels, slug, certifications } = req.body;
        const profile = {
            userId: req.user.userId,
            headline,
            bio,
            hourlyRateCents,
            currency,
            yearsExperience,
            subjects,
            levels,
            slug,
            certifications,
            ratingAvg: 0,
            ratingCount: 0,
        };
        dataManager.addTutor(profile);
        const addedProfile = dataManager.getTutorByUserId(req.user.userId);
        res.status(201).json({ success: true, profile: addedProfile });
    }
    catch (error) {
        console.error('Tutor profile creation error:', error);
        res.status(400).json({ error: 'Failed to create tutor profile' });
    }
});
// Tutor search and discovery
app.get('/api/tutors', async (req, res) => {
    try {
        const { q, priceMin, priceMax, ratingMin, page = 1, limit = 20 } = req.query;
        let filteredTutors = [...dataManager.getAllTutors()];
        // Apply filters
        if (q) {
            const query = q.toString().toLowerCase();
            filteredTutors = filteredTutors.filter(tutor => {
                const user = dataManager.getUserById(tutor.userId);
                return (tutor.headline?.toLowerCase().includes(query) ||
                    tutor.bio?.toLowerCase().includes(query) ||
                    user?.name?.toLowerCase().includes(query));
            });
        }
        if (priceMin) {
            filteredTutors = filteredTutors.filter(tutor => tutor.hourlyRateCents >= parseInt(priceMin.toString()));
        }
        if (priceMax) {
            filteredTutors = filteredTutors.filter(tutor => tutor.hourlyRateCents <= parseInt(priceMax.toString()));
        }
        if (ratingMin) {
            filteredTutors = filteredTutors.filter(tutor => tutor.ratingAvg >= parseFloat(ratingMin.toString()));
        }
        // Add user data to tutors
        const tutorsWithUsers = filteredTutors.map(tutor => {
            const user = dataManager.getUserById(tutor.userId);
            return {
                ...tutor,
                user: user ? {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatarUrl: user.avatarUrl,
                    country: user.country
                } : null
            };
        });
        // Pagination
        const startIndex = (parseInt(page.toString()) - 1) * parseInt(limit.toString());
        const endIndex = startIndex + parseInt(limit.toString());
        const paginatedTutors = tutorsWithUsers.slice(startIndex, endIndex);
        res.json({
            items: paginatedTutors,
            total: tutorsWithUsers.length,
            page: parseInt(page.toString()),
            limit: parseInt(limit.toString())
        });
    }
    catch (error) {
        console.error('Tutor search error:', error);
        res.status(400).json({ error: 'Search failed' });
    }
});
// Booking endpoints
app.post('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const { tutorId, subjectId, startAtUTC, endAtUTC, priceCents, currency } = req.body;
        const booking = {
            studentId: req.user.userId,
            tutorId,
            subjectId,
            startAtUTC,
            endAtUTC,
            status: 'PENDING',
            priceCents,
            currency,
        };
        dataManager.addBooking(booking);
        const addedBooking = dataManager.getAllBookings().find(b => b.studentId === req.user.userId && b.tutorId === tutorId);
        res.status(201).json({ success: true, booking: addedBooking });
    }
    catch (error) {
        console.error('Booking creation error:', error);
        res.status(400).json({ error: 'Failed to create booking' });
    }
});
app.get('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const userBookings = dataManager.getAllBookings().filter(booking => booking.studentId === req.user.userId || booking.tutorId === req.user.userId);
        res.json({ items: userBookings, total: userBookings.length });
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Categories fetch error:', error);
        res.status(400).json({ error: 'Failed to fetch categories' });
    }
});
// Admin endpoints
// Admin Dashboard - Get comprehensive stats and data
app.get('/api/admin/dashboard', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
    try {
        const allUsers = dataManager.getAllUsers();
        const allTutors = dataManager.getAllTutors();
        const allStudents = dataManager.getAllStudents();
        const allBookings = dataManager.getAllBookings();
        const stats = {
            totalUsers: allUsers.length,
            totalTutors: allTutors.length,
            totalStudents: allStudents.length,
            totalBookings: allBookings.length,
            pendingReviews: allTutors.filter(t => t.ratingCount === 0).length,
            activeSessions: allBookings.filter(b => b.status === 'CONFIRMED').length,
            completedSessions: allBookings.filter(b => b.status === 'COMPLETED').length,
            pendingBookings: allBookings.filter(b => b.status === 'PENDING').length
        };
        const recentBookings = allBookings.slice(-10).reverse().map(booking => ({
            ...booking,
            student: allUsers.find(u => u.id === booking.studentId),
            tutor: allTutors.find(t => t.id === booking.tutorId)
        }));
        const recentUsers = allUsers.slice(-10).reverse();
        res.json({
            stats,
            recentBookings,
            recentUsers
        });
    }
    catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(400).json({ error: 'Failed to fetch dashboard data' });
    }
});
// Admin - Get all users with details
app.get('/api/admin/users', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
    try {
        const allUsers = dataManager.getAllUsers();
        const allTutors = dataManager.getAllTutors();
        const allStudents = dataManager.getAllStudents();
        const usersWithDetails = allUsers.map(user => {
            const tutor = allTutors.find(t => t.userId === user.id);
            const student = allStudents.find(s => s.userId === user.id);
            return {
                ...user,
                tutorProfile: tutor || null,
                studentProfile: student || null,
                role: user.role
            };
        });
        res.json({ users: usersWithDetails });
    }
    catch (error) {
        console.error('Admin users error:', error);
        res.status(400).json({ error: 'Failed to fetch users' });
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Admin user deletion error:', error);
        res.status(400).json({ error: 'Failed to delete user' });
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
        const userId = req.user.userId;
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
    }
    catch (error) {
        console.error('Error fetching tutor profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/api/tutors/:tutorId', (req, res) => {
    try {
        const { tutorId } = req.params;
        const tutor = dataManager.getAllTutors().find(t => t.id === tutorId);
        if (!tutor) {
            return res.status(404).json({ error: 'Tutor not found' });
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
    }
    catch (error) {
        console.error('Error fetching tutor profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Tutor reviews endpoint
app.get('/api/tutors/:tutorId/reviews', (req, res) => {
    try {
        const { tutorId } = req.params;
        const tutor = dataManager.getAllTutors().find(t => t.id === tutorId);
        if (!tutor) {
            return res.status(404).json({ error: 'Tutor not found' });
        }
        // Generate sample reviews for demo
        const sampleReviews = [
            {
                id: 'review-1',
                tutorId: tutorId,
                studentId: 'student-1',
                studentName: 'Sarah Johnson',
                rating: 5,
                comment: 'Excellent tutor! Very patient and explains concepts clearly. Highly recommended.',
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            },
            {
                id: 'review-2',
                tutorId: tutorId,
                studentId: 'student-2',
                studentName: 'Michael Chen',
                rating: 5,
                comment: 'Great teaching style and very knowledgeable. Helped me improve significantly.',
                createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
            },
            {
                id: 'review-3',
                tutorId: tutorId,
                studentId: 'student-3',
                studentName: 'Emily Davis',
                rating: 4,
                comment: 'Good tutor, explains things well. Sometimes runs a bit over time but that\'s okay.',
                createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
            }
        ];
        res.json(sampleReviews);
    }
    catch (error) {
        console.error('Error fetching tutor reviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Tutor profile update endpoint
app.put('/api/tutors/profile', authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;
        const tutor = dataManager.getAllTutors().find(t => t.userId === userId);
        if (!tutor) {
            return res.status(404).json({ error: 'Tutor profile not found' });
        }
        const updates = req.body;
        const updatedTutor = { ...tutor, ...updates, updatedAt: new Date().toISOString() };
        dataManager.updateTutor(tutor.id, updates);
        res.json({ success: true, profile: updatedTutor });
    }
    catch (error) {
        console.error('Error updating tutor profile:', error);
        res.status(500).json({ error: 'Internal server error' });
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
    }
    catch (error) {
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
            userId: req.user.userId,
            message: 'Authentication working'
        });
    }
    catch (error) {
        console.error('Auth test error:', error);
        res.status(500).json({ error: 'Auth test failed' });
    }
});
// Tutor bookings endpoint - simplified version
app.get('/api/tutors/bookings', authenticateToken, async (req, res) => {
    try {
        const user = dataManager.getUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const tutor = dataManager.getTutorByUserId(user.id);
        if (!tutor) {
            return res.status(404).json({ error: 'Tutor profile not found' });
        }
        const tutorBookings = dataManager.getBookingsByTutorId(tutor.id);
        res.json(tutorBookings);
    }
    catch (error) {
        console.error('Error fetching tutor bookings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Tutor stats endpoint - simplified version
app.get('/api/tutors/stats', authenticateToken, async (req, res) => {
    try {
        const user = dataManager.getUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const tutor = dataManager.getTutorByUserId(user.id);
        if (!tutor) {
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
    }
    catch (error) {
        console.error('Error fetching tutor stats:', error);
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
    }
    catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({ error: 'Debug failed' });
    }
});
// Error logging endpoints
app.post('/api/logs/client-errors', (req, res) => {
    try {
        const { errors, sessionId, userId } = req.body;
        // Log each error to console with structured format
        errors.forEach((error) => {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Error fetching error logs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.listen(PORT, () => {
    console.log(`Tutorspool API listening on http://localhost:${PORT}`);
    console.log(`Sample data loaded: ${dataManager.getAllUsers().length} users, ${dataManager.getAllTutors().length} tutors`);
});
