import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { name, email, subject, messageType, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      res.status(400).json({ 
        success: false, 
        error: 'Name, email, and message are required' 
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ 
        success: false, 
        error: 'Invalid email address' 
      });
      return;
    }

    // Prepare email content
    const messageTypeLabel = messageType || 'General Inquiry';
    const subjectLine = subject || `New Contact Form Submission - ${messageTypeLabel}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2c2e71 0%, #F47B2F 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .field { margin-bottom: 20px; }
          .label { font-weight: bold; color: #2c2e71; margin-bottom: 5px; }
          .value { background: white; padding: 10px; border-radius: 5px; border-left: 3px solid #F47B2F; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 New Contact Form Submission</h1>
            <p>TutorsPool Contact Form</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">👤 Name:</div>
              <div class="value">${name}</div>
            </div>
            
            <div class="field">
              <div class="label">📧 Email:</div>
              <div class="value">${email}</div>
            </div>
            
            <div class="field">
              <div class="label">📋 Message Type:</div>
              <div class="value">${messageTypeLabel}</div>
            </div>
            
            ${subject ? `
            <div class="field">
              <div class="label">📌 Subject:</div>
              <div class="value">${subject}</div>
            </div>
            ` : ''}
            
            <div class="field">
              <div class="label">💬 Message:</div>
              <div class="value">${message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
          <div class="footer">
            <p>This email was sent from the TutorsPool contact form</p>
            <p>© ${new Date().getFullYear()} TutorsPool. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Use ZeptoMail REST API (works better in serverless)
    const ZEPTO_API_KEY = 'wSsVR60jrBf4Cf17yTf4L+c+mw5VUVuiFUUv3Qb0uCX5GP6Qpcc+xBLODQajFaJNEGRgFmNH8bMvnhoH0DEIh4h+zVgAWiiF9mqRe1U4J3x17qnvhDzDW25ZlhuNKY8IwQxvk2lpFswm+g==';
    
    console.log('Sending email to admin...');
    
    // Send email to admin
    const adminEmailResponse = await fetch('https://api.zeptomail.com/v1.1/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Zoho-enczapikey ${ZEPTO_API_KEY}`,
      },
      body: JSON.stringify({
        from: {
          address: 'noreply@tutorspool.com',
          name: 'TutorsPool Contact Form'
        },
        to: [
          {
            email_address: {
              address: 'info@tutorspool.com',
              name: 'TutorsPool Admin'
            }
          }
        ],
        reply_to: [
          {
            address: email,
            name: name
          }
        ],
        subject: subjectLine,
        htmlbody: htmlContent,
      }),
    });

    if (!adminEmailResponse.ok) {
      const errorData = await adminEmailResponse.text();
      console.error('ZeptoMail API Error:', errorData);
      throw new Error(`Failed to send admin email: ${errorData}`);
    }
    
    console.log('Admin email sent successfully');

    // Send confirmation email to user
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2c2e71 0%, #F47B2F 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #F47B2F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Message Received!</h1>
            <p>Thank you for contacting TutorsPool</p>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for reaching out to us! We've received your message and our team will get back to you within 24 hours.</p>
            
            <p><strong>Your message:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 5px; border-left: 3px solid #2c2e71;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            
            <p>In the meantime, feel free to explore our platform:</p>
            <a href="https://www.tutorspool.com" class="button">Visit TutorsPool</a>
            
            <p>If you have any urgent questions, you can reach us at:</p>
            <ul>
              <li>📧 Email: info@tutorspool.com</li>
              <li>📱 Phone: +92 345 3284 284</li>
            </ul>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TutorsPool. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send confirmation email to user
    console.log('Sending confirmation email to user...');
    const userEmailResponse = await fetch('https://api.zeptomail.com/v1.1/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Zoho-enczapikey ${ZEPTO_API_KEY}`,
      },
      body: JSON.stringify({
        from: {
          address: 'noreply@tutorspool.com',
          name: 'TutorsPool Team'
        },
        to: [
          {
            email_address: {
              address: email,
              name: name
            }
          }
        ],
        subject: 'We received your message - TutorsPool',
        htmlbody: confirmationHtml,
      }),
    });

    if (!userEmailResponse.ok) {
      const errorData = await userEmailResponse.text();
      console.error('Failed to send user confirmation:', errorData);
      // Don't throw here - admin email was sent successfully
    } else {
      console.log('User confirmation email sent successfully');
    }

    res.status(200).json({
      success: true,
      message: 'Email sent successfully! Check your inbox for confirmation.',
    });
  } catch (error: any) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email. Please try again later.',
      details: error.message,
    });
  }
}
