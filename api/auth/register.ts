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
    token,
  });
}
