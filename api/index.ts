import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple API handler for Vercel
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
      res.status(200).json({
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: 'user-1',
          email: 'demo@example.com',
          role: 'student',
          name: 'Demo User'
        }
      });
      return;
    }
  }

  if (pathname === '/api/auth/register') {
    if (req.method === 'POST') {
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: 'user-new',
          email: req.body?.email || 'new@example.com',
          role: 'student'
        }
      });
      return;
    }
  }

  if (pathname === '/api/tutors') {
    res.status(200).json({
      success: true,
      tutors: [
        {
          id: 'tutor-1',
          name: 'John Doe',
          subject: 'Mathematics',
          rating: 4.8,
          pricePerHour: 50,
          availability: 'Available'
        },
        {
          id: 'tutor-2',
          name: 'Jane Smith',
          subject: 'Physics',
          rating: 4.9,
          pricePerHour: 60,
          availability: 'Available'
        }
      ]
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
          email: req.body?.email || 'student@example.com',
          name: req.body?.name || 'New Student',
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
          tutorId: req.body?.tutorId || 'tutor-1',
          studentId: req.body?.studentId || 'student-1',
          subject: req.body?.subject || 'Mathematics',
          date: req.body?.date || '2024-01-20',
          time: req.body?.time || '2:00 PM',
          duration: req.body?.duration || 60,
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

  // Default response for unknown endpoints
  res.status(404).json({
    error: 'Endpoint not found',
    path: pathname,
    method: req.method
  });
}
