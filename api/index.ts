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

  // Default response for unknown endpoints
  res.status(404).json({
    error: 'Endpoint not found',
    path: pathname,
    method: req.method
  });
}
