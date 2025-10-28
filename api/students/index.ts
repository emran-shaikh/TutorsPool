import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const body: any = (req as any).body || {};
    res.status(201).json({
      success: true,
      message: 'Student profile created successfully',
      student: {
        id: 'student-new',
        name: body.name || 'New Student',
        email: body.email || 'student@example.com',
        role: 'STUDENT',
      }
    });
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}


