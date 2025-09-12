import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data.json');
class DataManager {
    constructor() {
        this.data = this.loadData();
    }
    loadData() {
        try {
            if (fs.existsSync(DATA_FILE)) {
                const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
                return JSON.parse(fileContent);
            }
        }
        catch (error) {
            console.error('Error loading data file:', error);
        }
        // Return default empty structure
        return {
            users: [],
            tutors: [],
            students: [],
            bookings: [],
            lastId: 0
        };
    }
    saveData() {
        try {
            fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2));
        }
        catch (error) {
            console.error('Error saving data file:', error);
        }
    }
    // User methods
    addUser(user) {
        user.id = `user-${++this.data.lastId}`;
        user.createdAt = new Date().toISOString();
        this.data.users.push(user);
        this.saveData();
    }
    getUserById(id) {
        return this.data.users.find(u => u.id === id);
    }
    getUserByEmail(email) {
        return this.data.users.find(u => u.email === email);
    }
    updateUser(id, updates) {
        const userIndex = this.data.users.findIndex(u => u.id === id);
        if (userIndex !== -1) {
            this.data.users[userIndex] = { ...this.data.users[userIndex], ...updates };
            this.saveData();
        }
    }
    getAllUsers() {
        return this.data.users;
    }
    // Tutor methods
    addTutor(tutor) {
        tutor.id = `tutor-${++this.data.lastId}`;
        tutor.createdAt = new Date().toISOString();
        this.data.tutors.push(tutor);
        this.saveData();
    }
    getTutorById(id) {
        return this.data.tutors.find(t => t.id === id);
    }
    getTutorByUserId(userId) {
        return this.data.tutors.find(t => t.userId === userId);
    }
    updateTutor(id, updates) {
        const tutorIndex = this.data.tutors.findIndex(t => t.id === id);
        if (tutorIndex !== -1) {
            this.data.tutors[tutorIndex] = { ...this.data.tutors[tutorIndex], ...updates };
            this.saveData();
        }
    }
    getAllTutors() {
        return this.data.tutors;
    }
    // Student methods
    addStudent(student) {
        student.id = `student-${++this.data.lastId}`;
        student.createdAt = new Date().toISOString();
        this.data.students.push(student);
        this.saveData();
    }
    getStudentById(id) {
        return this.data.students.find(s => s.id === id);
    }
    getStudentByUserId(userId) {
        return this.data.students.find(s => s.userId === userId);
    }
    updateStudent(id, updates) {
        const studentIndex = this.data.students.findIndex(s => s.id === id);
        if (studentIndex !== -1) {
            this.data.students[studentIndex] = { ...this.data.students[studentIndex], ...updates };
            this.saveData();
        }
    }
    getAllStudents() {
        return this.data.students;
    }
    // Booking methods
    addBooking(booking) {
        booking.id = `booking-${++this.data.lastId}`;
        booking.createdAt = new Date().toISOString();
        this.data.bookings.push(booking);
        this.saveData();
    }
    getBookingById(id) {
        return this.data.bookings.find(b => b.id === id);
    }
    getBookingsByTutorId(tutorId) {
        return this.data.bookings.filter(b => b.tutorId === tutorId);
    }
    getBookingsByStudentId(studentId) {
        return this.data.bookings.filter(b => b.studentId === studentId);
    }
    updateBooking(id, updates) {
        const bookingIndex = this.data.bookings.findIndex(b => b.id === id);
        if (bookingIndex !== -1) {
            this.data.bookings[bookingIndex] = { ...this.data.bookings[bookingIndex], ...updates };
            this.saveData();
        }
    }
    getAllBookings() {
        return this.data.bookings;
    }
    // Initialize with sample data if empty
    initializeSampleData() {
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
                    createdAt: new Date().toISOString(),
                },
                {
                    id: 'user-2',
                    name: 'Sarah Johnson',
                    email: 'sarah@example.com',
                    phone: '+1234567891',
                    country: 'USA',
                    timezone: 'America/New_York',
                    role: 'TUTOR',
                    createdAt: new Date().toISOString(),
                },
                {
                    id: 'user-3',
                    name: 'Mike Wilson',
                    email: 'mike@example.com',
                    phone: '+1234567892',
                    country: 'USA',
                    timezone: 'America/New_York',
                    role: 'STUDENT',
                    createdAt: new Date().toISOString(),
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
                }
            ];
            this.data.users = sampleUsers;
            this.data.tutors = sampleTutors;
            this.data.bookings = sampleBookings;
            this.data.lastId = 3;
            this.saveData();
            console.log('[DATA MANAGER] Sample data loaded successfully');
        }
        else {
            console.log('[DATA MANAGER] Sample data already exists, skipping load');
        }
    }
}
export const dataManager = new DataManager();
