// Vercel serverless function for TutorsPool API
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Import our existing server logic
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());

// Import data manager
const DataManager = require('../server/dataManager');
const dataManager = new DataManager();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, country, timezone } = req.body;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = dataManager.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const user = {
      name,
      email,
      password, // In production, hash this password
      role,
      phone: phone || null,
      country: country || null,
      timezone: timezone || 'UTC',
      status: role === 'ADMIN' ? 'ACTIVE' : 'PENDING',
      createdAt: new Date().toISOString()
    };

    const newUser = dataManager.addUser(user);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = dataManager.getUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(401).json({ error: 'Account not active' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Tutors endpoints
app.get('/api/tutors', (req, res) => {
  try {
    const { page = 1, limit = 10, search, subject } = req.query;
    
    let tutors = dataManager.getTutors();
    
    // Filter by active users only
    tutors = tutors.filter(tutor => {
      const user = dataManager.getUserById(tutor.userId);
      return user && user.status === 'ACTIVE';
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      tutors = tutors.filter(tutor => {
        const user = dataManager.getUserById(tutor.userId);
        return (
          tutor.headline?.toLowerCase().includes(searchLower) ||
          tutor.bio?.toLowerCase().includes(searchLower) ||
          user?.name?.toLowerCase().includes(searchLower) ||
          tutor.subjects?.some(sub => sub.toLowerCase().includes(searchLower))
        );
      });
    }

    // Apply subject filter
    if (subject) {
      tutors = tutors.filter(tutor => 
        tutor.subjects?.includes(subject)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTutors = tutors.slice(startIndex, endIndex);

    res.json({
      items: paginatedTutors,
      total: tutors.length,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Tutors fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch tutors' });
  }
});

// Notifications endpoint
app.get('/api/notifications', authenticateToken, (req, res) => {
  try {
    const { unreadOnly } = req.query;
    const notifications = dataManager.getNotificationsByUserId(
      req.user.userId,
      unreadOnly === 'true'
    );
    
    res.json({
      success: true,
      notifications,
      total: notifications.length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Export the app for Vercel
module.exports = app;
