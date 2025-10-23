import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { email, password } = (req as any).body || {};

  if (email === 'admin@example.com' && password === 'admin') {
    res.status(200).json({
      success: true,
      token: 'mock-admin-jwt-token',
      user: { id: 'admin-1', email, role: 'ADMIN', name: 'Admin User' },
    });
    return;
  }

  if (email === 'tutor@example.com' && password === 'tutor') {
    res.status(200).json({
      success: true,
      token: 'mock-tutor-jwt-token',
      user: { id: 'tutor-1', email, role: 'TUTOR', name: 'Dr. Sarah Johnson' },
    });
    return;
  }

  res.status(200).json({
    success: true,
    token: 'mock-student-jwt-token',
    user: { id: 'student-1', email: email || 'demo@example.com', role: 'STUDENT', name: 'Demo Student' },
  });
}
