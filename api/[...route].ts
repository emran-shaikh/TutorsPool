import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple API handler for Vercel (catch-all)
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Set cache control headers to prevent caching for dynamic data
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { pathname } = new URL(req.url || '', `http://${req.headers.host}`);

  // Health check
  if (pathname === '/api/health') {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
    return;
  }

  // Mock API responses for now
  if (pathname === '/api/auth/login') {
    if (req.method === 'POST') {
      const { email, password } = req.body;
      
      // Mock admin login
      if (email === 'admin@example.com' && password === 'admin') {
        res.status(200).json({
          success: true,
          token: 'mock-admin-jwt-token',
          user: {
            id: 'admin-1',
            email: 'admin@example.com',
            role: 'ADMIN',
            name: 'Admin User'
          }
        });
        return;
      }
      
      // Mock tutor login
      if (email === 'tutor@example.com' && password === 'tutor') {
        res.status(200).json({
          success: true,
          token: 'mock-tutor-jwt-token',
          user: {
            id: 'tutor-1',
            email: 'tutor@example.com',
            role: 'TUTOR',
            name: 'Dr. Sarah Johnson'
          }
        });
        return;
      }
      
      // Mock student login
      res.status(200).json({
        success: true,
        token: 'mock-student-jwt-token',
        user: {
          id: 'student-1',
          email: email || 'demo@example.com',
          role: 'STUDENT',
          name: 'Demo Student'
        }
      });
      return;
    }
  }

  if (pathname === '/api/auth/me') {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'No token provided'
      });
      return;
    }
    
    // Mock token validation - in real app, you'd verify the JWT
    let user;
    if (token === 'mock-admin-jwt-token') {
      user = {
        id: 'admin-1',
        email: 'admin@example.com',
        role: 'ADMIN',
        name: 'Admin User'
      };
    } else if (token === 'mock-tutor-jwt-token') {
      user = {
        id: 'tutor-1',
        email: 'tutor@example.com',
        role: 'TUTOR',
        name: 'Dr. Sarah Johnson'
      };
    } else if (token === 'mock-student-jwt-token') {
      user = {
        id: 'student-1',
        email: 'demo@example.com',
        role: 'STUDENT',
        name: 'Demo Student'
      };
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      user
    });
    return;
  }

  if (pathname === '/api/auth/register') {
    if (req.method === 'POST') {
      const body: any = (req as any).body || {};
      const role = (body.role || 'STUDENT').toString().toUpperCase();
      const token = role === 'ADMIN' ? 'mock-admin-jwt-token' : role === 'TUTOR' ? 'mock-tutor-jwt-token' : 'mock-student-jwt-token';
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: 'user-new',
          email: body.email || 'new@example.com',
          role,
          status: role === 'ADMIN' ? 'ACTIVE' : 'PENDING',
        },
        token
      });
      return;
    }
  }

  if (pathname === '/api/tutors') {
    if (req.method === 'POST') {
      res.status(201).json({ success: true, profile: { id: 'tutor-new', ...((req as any).body || {}) } });
      return;
    }

    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const searchParams = url.searchParams;
    
    // Get search parameters
    const q = searchParams.get('q');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const ratingMin = searchParams.get('ratingMin');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Mock tutor data
    let tutors = [
      {
        id: 'tutor-1',
        name: 'Dr. Sarah Johnson',
        headline: 'Mathematics & Physics Expert',
        bio: 'PhD in Mathematics with 10+ years of teaching experience. Specialized in calculus, algebra, and physics.',
        subjects: ['Mathematics', 'Physics', 'Statistics'],
        levels: ['High School', 'University', 'Graduate'],
        hourlyRateCents: 7500, // $75/hour
        currency: 'USD',
        rating: 4.9,
        totalStudents: 156,
        totalSessions: 1247,
        yearsExperience: 12,
        availability: 'Available',
        profileImage: '/avatars/sarah.svg',
        location: 'New York, NY',
        mode: ['ONLINE', 'OFFLINE']
      },
      {
        id: 'tutor-2',
        name: 'Prof. Michael Chen',
        headline: 'Chemistry & Biology Specialist',
        bio: 'Professor of Chemistry with extensive research background. Expert in organic chemistry and biochemistry.',
        subjects: ['Chemistry', 'Biology', 'Organic Chemistry'],
        levels: ['University', 'Graduate'],
        hourlyRateCents: 8000, // $80/hour
        currency: 'USD',
        rating: 4.8,
        totalStudents: 98,
        totalSessions: 892,
        yearsExperience: 15,
        availability: 'Available',
        profileImage: '/avatars/michael.svg',
        location: 'San Francisco, CA',
        mode: ['ONLINE']
      },
      {
        id: 'tutor-3',
        name: 'Dr. Emily Rodriguez',
        headline: 'Language Arts & Literature Expert',
        bio: 'PhD in English Literature with passion for helping students excel in writing and critical thinking.',
        subjects: ['English', 'Literature', 'Writing'],
        levels: ['High School', 'University'],
        hourlyRateCents: 6000, // $60/hour
        currency: 'USD',
        rating: 4.7,
        totalStudents: 134,
        totalSessions: 678,
        yearsExperience: 8,
        availability: 'Available',
        profileImage: '/avatars/emily.svg',
        location: 'Austin, TX',
        mode: ['ONLINE', 'OFFLINE']
      },
      {
        id: 'tutor-4',
        name: 'Dr. James Wilson',
        headline: 'Computer Science & Programming',
        bio: 'Senior Software Engineer with expertise in multiple programming languages and computer science fundamentals.',
        subjects: ['Computer Science', 'Programming', 'Data Structures'],
        levels: ['High School', 'University', 'Graduate'],
        hourlyRateCents: 8500, // $85/hour
        currency: 'USD',
        rating: 4.9,
        totalStudents: 89,
        totalSessions: 456,
        yearsExperience: 10,
        availability: 'Available',
        profileImage: '/avatars/james.svg',
        location: 'Seattle, WA',
        mode: ['ONLINE']
      },
      {
        id: 'tutor-5',
        name: 'Ms. Lisa Thompson',
        headline: 'Elementary & Middle School Math',
        bio: 'Certified teacher with 12 years of experience helping young students build strong math foundations.',
        subjects: ['Mathematics', 'Arithmetic', 'Algebra'],
        levels: ['Elementary', 'Middle School'],
        hourlyRateCents: 4500, // $45/hour
        currency: 'USD',
        rating: 4.8,
        totalStudents: 203,
        totalSessions: 1456,
        yearsExperience: 12,
        availability: 'Available',
        profileImage: '/avatars/lisa.svg',
        location: 'Chicago, IL',
        mode: ['ONLINE', 'OFFLINE']
      }
    ];
    
    // Apply search filters
    if (q) {
      const query = q.toLowerCase();
      tutors = tutors.filter(tutor => 
        tutor.name.toLowerCase().includes(query) ||
        tutor.headline.toLowerCase().includes(query) ||
        tutor.bio.toLowerCase().includes(query) ||
        tutor.subjects.some(subject => subject.toLowerCase().includes(query))
      );
    }
    
    if (priceMin) {
      tutors = tutors.filter(tutor => tutor.hourlyRateCents >= parseInt(priceMin) * 100);
    }
    
    if (priceMax) {
      tutors = tutors.filter(tutor => tutor.hourlyRateCents <= parseInt(priceMax) * 100);
    }
    
    if (ratingMin) {
      tutors = tutors.filter(tutor => tutor.rating >= parseFloat(ratingMin));
    }
    
    // Apply pagination
    const total = tutors.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTutors = tutors.slice(startIndex, endIndex);
    
    res.status(200).json({
      success: true,
      items: paginatedTutors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
    return;
  }

  if (pathname === '/api/students') {
    if (req.method === 'POST') {
      res.status(201).json({
        success: true,
        message: 'Student profile created successfully',
        student: {
          id: 'student-new',
          email: (req as any).body?.email || 'student@example.com',
          name: (req as any).body?.name || 'New Student',
          role: 'student'
        }
      });
      return;
    }
    
    if (req.method === 'GET') {
      res.status(200).json({
        success: true,
        students: [
          {
            id: 'student-1',
            name: 'Alice Johnson',
            email: 'alice@example.com',
            role: 'student',
            subjects: ['Mathematics', 'Physics']
          },
          {
            id: 'student-2',
            name: 'Bob Wilson',
            email: 'bob@example.com',
            role: 'student',
            subjects: ['Chemistry', 'Biology']
          }
        ]
      });
      return;
    }
  }

  // Admin users list and actions
  if (pathname === '/api/admin/users') {
    if (req.method === 'GET') {
      res.status(200).json([
        { id: 'user-1', name: 'John Smith', email: 'john@example.com', role: 'TUTOR', status: 'ACTIVE', createdAt: new Date().toISOString() },
        { id: 'user-2', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'TUTOR', status: 'ACTIVE', createdAt: new Date().toISOString() },
        { id: 'user-3', name: 'Mike Wilson', email: 'mike@example.com', role: 'STUDENT', status: 'ACTIVE', createdAt: new Date().toISOString() },
        { id: 'user-5', name: 'Pending Tutor', email: 'pending.tutor@example.com', role: 'TUTOR', status: 'PENDING', createdAt: new Date().toISOString() },
        { id: 'user-6', name: 'Pending Student', email: 'pending.student@example.com', role: 'STUDENT', status: 'PENDING', createdAt: new Date().toISOString() },
      ]);
      return;
    }
    if (req.method === 'DELETE') {
      res.status(200).json({ success: true });
      return;
    }
  }

  // Admin approve user
  const approveMatch = pathname.match(/^\/api\/admin\/users\/(.+)\/approve$/);
  if (approveMatch) {
    if (req.method === 'POST') {
      const userId = approveMatch[1];
      res.status(200).json({ success: true, userId, status: 'ACTIVE' });
      return;
    }
  }

  // Admin bookings list and update
  if (pathname === '/api/admin/bookings') {
    if (req.method === 'GET') {
      res.status(200).json([
        { id: 'booking-1', studentId: 'user-3', tutorId: 'tutor-1', subjectId: 'math', startAtUTC: new Date().toISOString(), endAtUTC: new Date(Date.now()+3600000).toISOString(), status: 'CONFIRMED', priceCents: 5000, currency: 'USD', createdAt: new Date().toISOString() },
        { id: 'booking-2', studentId: 'user-2', tutorId: 'tutor-2', subjectId: 'physics', startAtUTC: new Date().toISOString(), endAtUTC: new Date(Date.now()+3600000).toISOString(), status: 'PENDING', priceCents: 7500, currency: 'USD', createdAt: new Date().toISOString() }
      ]);
      return;
    }
    if (req.method === 'PUT') {
      res.status(200).json({ success: true });
      return;
    }
  }

  if (pathname === '/api/bookings') {
    if (req.method === 'GET') {
      res.status(200).json({
        success: true,
        bookings: [
          {
            id: 'booking-1',
            tutorId: 'tutor-1',
            studentId: 'student-1',
            subject: 'Mathematics',
            date: '2024-01-15',
            time: '10:00 AM',
            duration: 60,
            status: 'confirmed'
          }
        ]
      });
      return;
    }
    
    if (req.method === 'POST') {
      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        booking: {
          id: 'booking-new',
          tutorId: (req as any).body?.tutorId || 'tutor-1',
          studentId: (req as any).body?.studentId || 'student-1',
          subject: (req as any).body?.subject || 'Mathematics',
          date: (req as any).body?.date || '2024-01-20',
          time: (req as any).body?.time || '2:00 PM',
          duration: (req as any).body?.duration || 60,
          status: 'pending'
        }
      });
      return;
    }
  }

  if (pathname === '/api/students/profile') {
    res.status(200).json({
      success: true,
      profile: {
        id: 'student-1',
        name: 'John Student',
        email: 'student@example.com',
        role: 'STUDENT',
        subjects: ['Mathematics', 'Physics'],
        level: 'High School',
        timezone: 'America/New_York',
        createdAt: '2024-01-01T00:00:00Z',
        preferences: {
          notificationEmail: true,
          notificationSms: false,
          reminderTime: 30
        }
      }
    });
    return;
  }

  if (pathname === '/api/students/stats') {
    res.status(200).json({
      success: true,
      stats: {
        totalBookings: 12,
        completedSessions: 10,
        upcomingSessions: 2,
        totalHours: 25,
        averageRating: 4.8,
        favoriteSubjects: ['Mathematics', 'Physics'],
        thisMonth: {
          bookings: 3,
          hours: 6
        }
      }
    });
    return;
  }

  if (pathname === '/api/students/bookings') {
    res.status(200).json({
      success: true,
      bookings: [
        {
          id: 'booking-1',
          tutorId: 'tutor-1',
          tutorName: 'Dr. Jane Smith',
          subject: 'Mathematics',
          date: '2024-01-15',
          time: '10:00 AM',
          duration: 60,
          status: 'confirmed',
          price: 50,
          currency: 'USD'
        },
        {
          id: 'booking-2',
          tutorId: 'tutor-2',
          tutorName: 'Prof. John Doe',
          subject: 'Physics',
          date: '2024-01-20',
          time: '2:00 PM',
          duration: 90,
          status: 'pending',
          price: 75,
          currency: 'USD'
        }
      ]
    });
    return;
  }

  if (pathname === '/api/notifications') {
    res.status(200).json({
      success: true,
      notifications: [
        {
          id: 'notif-1',
          type: 'booking_confirmed',
          title: 'Booking Confirmed',
          message: 'Your session with Dr. Jane Smith has been confirmed for tomorrow.',
          read: false,
          createdAt: '2024-01-14T10:00:00Z'
        },
        {
          id: 'notif-2',
          type: 'reminder',
          title: 'Session Reminder',
          message: 'You have a session with Prof. John Doe in 1 hour.',
          read: false,
          createdAt: '2024-01-14T09:00:00Z'
        },
        {
          id: 'notif-3',
          type: 'payment_received',
          title: 'Payment Received',
          message: 'Payment of $50 has been processed successfully.',
          read: true,
          createdAt: '2024-01-13T15:30:00Z'
        }
      ]
    });
    return;
  }

  if (pathname === '/api/tutors/profile') {
    res.status(200).json({
      success: true,
      profile: {
        id: 'tutor-1',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@example.com',
        role: 'TUTOR',
        headline: 'Mathematics & Physics Expert',
        bio: 'PhD in Mathematics with 10+ years of teaching experience. Specialized in calculus, algebra, and physics.',
        subjects: ['Mathematics', 'Physics', 'Statistics'],
        levels: ['High School', 'University', 'Graduate'],
        hourlyRateCents: 7500, // $75/hour
        currency: 'USD',
        yearsExperience: 12,
        rating: 4.9,
        totalStudents: 156,
        totalSessions: 1247,
        availability: 'Available',
        timezone: 'America/New_York',
        certifications: [
          {
            name: 'PhD Mathematics',
            issuer: 'MIT',
            year: 2012
          },
          {
            name: 'Teaching Excellence Award',
            issuer: 'National Education Association',
            year: 2020
          }
        ],
        createdAt: '2020-03-15T00:00:00Z',
        preferences: {
          notificationEmail: true,
          notificationSms: true,
          autoAcceptBookings: false,
          maxStudentsPerDay: 8
        }
      }
    });
    return;
  }

  if (pathname === '/api/tutors/stats') {
    res.status(200).json({
      success: true,
      stats: {
        totalBookings: 89,
        completedSessions: 82,
        upcomingSessions: 7,
        totalHours: 164,
        totalEarnings: 12300, // in cents
        currency: 'USD',
        averageRating: 4.9,
        totalStudents: 45,
        thisMonth: {
          bookings: 12,
          hours: 24,
          earnings: 1800
        },
        lastMonth: {
          bookings: 15,
          hours: 30,
          earnings: 2250
        },
        topSubjects: [
          { subject: 'Mathematics', sessions: 45 },
          { subject: 'Physics', sessions: 32 },
          { subject: 'Statistics', sessions: 12 }
        ],
        weeklySchedule: {
          monday: 4,
          tuesday: 6,
          wednesday: 5,
          thursday: 7,
          friday: 3,
          saturday: 2,
          sunday: 1
        }
      }
    });
    return;
  }

  // Admin endpoints
  if (pathname === '/api/admin/dashboard') {
    res.status(200).json({
      success: true,
      stats: {
        totalUsers: 156,
        totalTutors: 23,
        totalStudents: 133,
        totalBookings: 487,
        totalRevenue: 45600, // in cents
        currency: 'USD',
        thisMonth: {
          newUsers: 12,
          newTutors: 3,
          bookings: 45,
          revenue: 3400
        },
        pendingApprovals: 5,
        activeSessions: 8
      }
    });
    return;
  }

  if (pathname === '/api/logs/client-errors') {
    if (req.method === 'POST') {
      const body: any = (req as any).body || {};
      const errors = Array.isArray(body.errors) ? body.errors : [];
      // eslint-disable-next-line no-console
      console.error('[CLIENT ERRORS]', { count: errors.length, sample: errors[0] });
      res.status(200).json({ success: true, logged: errors.length });
      return;
    }
  }

  // Default response for unknown endpoints
  res.status(404).json({
    error: 'Endpoint not found',
    path: pathname,
    method: req.method
  });
}
