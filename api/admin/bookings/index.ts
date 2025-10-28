import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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

  res.status(405).json({ error: 'Method Not Allowed' });
}


