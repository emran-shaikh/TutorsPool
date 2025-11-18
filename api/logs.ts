import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed', allowedMethods: ['POST'] });
    return;
  }

  const body: any = (req as any).body || {};
  const errors = Array.isArray(body.errors) ? body.errors : [];

  // eslint-disable-next-line no-console
  console.error('[CLIENT ERRORS]', { count: errors.length, sample: errors[0] });

  res.status(200).json({ success: true, logged: errors.length });
}

