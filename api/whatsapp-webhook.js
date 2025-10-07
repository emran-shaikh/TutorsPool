// WhatsApp Webhook Handler for Vercel
const whatsappService = require('../src/lib/whatsappService');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Webhook verification
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        console.log('WhatsApp webhook verified successfully');
        return res.status(200).send(challenge);
      } else {
        console.log('WhatsApp webhook verification failed');
        return res.status(403).json({ error: 'Verification failed' });
      }
    }

    if (req.method === 'POST') {
      // Handle incoming messages
      const signature = req.headers['x-hub-signature-256'];
      const payload = JSON.stringify(req.body);

      // Verify webhook signature
      if (whatsappService.verifyWebhookSignature(payload, signature)) {
        await whatsappService.handleWebhook(req.body);
        return res.status(200).json({ status: 'success' });
      } else {
        console.log('Invalid webhook signature');
        return res.status(403).json({ error: 'Invalid signature' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
