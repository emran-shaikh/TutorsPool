import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Mock users list
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

  res.status(405).json({ error: 'Method Not Allowed' });
}


