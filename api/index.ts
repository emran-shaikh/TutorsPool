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

  // Default response for unknown endpoints
  res.status(404).json({
    error: 'Endpoint not found',
    path: pathname,
    method: req.method
  });
}
