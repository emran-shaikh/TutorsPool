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
    const { name, email, role, phone, country } = req.body;

    // Validate required fields
    if (!name || !email || !role) {
      res.status(400).json({ 
        success: false, 
        error: 'Name, email, and role are required' 
      });
      return;
    }

    const ZEPTO_TOKEN = 'Zoho-enczapikey wSsVR60k80XzCaspyWWsIOs+z19SBwj/F0p10AOo4n+tHKjLpsdqxRXGBgWvFKUeFGU6QWQSpbp/mUsD2jFf2d0oyg0BDiiF9mqRe1U4J3x17qnvhDzPWGVckxaALIwKwAxpkmJhFc5u';

    // Get role-specific information
    const roleInfo = {
      STUDENT: { label: 'Student', emoji: '🎓', dashboard: '/student/dashboard' },
      TUTOR: { label: 'Tutor', emoji: '👨‍🏫', dashboard: '/tutor/dashboard' },
      ADMIN: { label: 'Admin', emoji: '👑', dashboard: '/admin' }
    };

    const userRole = roleInfo[role as keyof typeof roleInfo] || roleInfo.STUDENT;

    // Admin notification email
    const adminHtml = `
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
          .badge { display: inline-block; background: #F47B2F; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New User Registration</h1>
            <p>TutorsPool Platform</p>
          </div>
          <div class="content">
            <div style="text-align: center; margin-bottom: 20px;">
              <span class="badge">${userRole.emoji} ${userRole.label}</span>
            </div>
            
            <div class="field">
              <div class="label">👤 Name:</div>
              <div class="value">${name}</div>
            </div>
            
            <div class="field">
              <div class="label">📧 Email:</div>
              <div class="value">${email}</div>
            </div>
            
            <div class="field">
              <div class="label">👥 Role:</div>
              <div class="value">${userRole.emoji} ${userRole.label}</div>
            </div>
            
            ${phone ? `
            <div class="field">
              <div class="label">📱 Phone:</div>
              <div class="value">${phone}</div>
            </div>
            ` : ''}
            
            ${country ? `
            <div class="field">
              <div class="label">🌍 Country:</div>
              <div class="value">${country}</div>
            </div>
            ` : ''}
            
            <div class="field">
              <div class="label">📅 Registration Date:</div>
              <div class="value">${new Date().toLocaleString()}</div>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated notification from TutorsPool</p>
            <p>© ${new Date().getFullYear()} TutorsPool. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // User welcome email
    const userHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2c2e71 0%, #F47B2F 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #F47B2F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .feature { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 3px solid #2c2e71; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to TutorsPool!</h1>
            <p>Your account has been created successfully</p>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Welcome to TutorsPool! We're excited to have you join our community as a <strong>${userRole.label}</strong> ${userRole.emoji}</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://www.tutorspool.com${userRole.dashboard}" class="button">Go to Your Dashboard</a>
            </div>
            
            <h3 style="color: #2c2e71; margin-top: 30px;">✨ What's Next?</h3>
            
            ${role === 'STUDENT' ? `
            <div class="feature">
              <strong>🔍 Find Your Perfect Tutor</strong><br>
              Browse our qualified tutors and book your first session
            </div>
            <div class="feature">
              <strong>📅 Schedule Sessions</strong><br>
              Choose times that work for you with flexible scheduling
            </div>
            <div class="feature">
              <strong>📊 Track Your Progress</strong><br>
              Monitor your learning journey and achievements
            </div>
            ` : ''}
            
            ${role === 'TUTOR' ? `
            <div class="feature">
              <strong>📝 Complete Your Profile</strong><br>
              Add your qualifications, subjects, and availability
            </div>
            <div class="feature">
              <strong>👥 Connect with Students</strong><br>
              Start receiving booking requests from students
            </div>
            <div class="feature">
              <strong>💰 Manage Your Earnings</strong><br>
              Track sessions and manage your income
            </div>
            ` : ''}
            
            ${role === 'ADMIN' ? `
            <div class="feature">
              <strong>👥 Manage Users</strong><br>
              Oversee student and tutor accounts
            </div>
            <div class="feature">
              <strong>📊 View Analytics</strong><br>
              Monitor platform performance and metrics
            </div>
            <div class="feature">
              <strong>⚙️ Platform Settings</strong><br>
              Configure and customize the platform
            </div>
            ` : ''}
            
            <h3 style="color: #2c2e71; margin-top: 30px;">📞 Need Help?</h3>
            <p>Our support team is here to help you get started:</p>
            <ul>
              <li>📧 Email: info@tutorspool.com</li>
              <li>📱 Phone: +92 345 3284 284</li>
              <li>💬 Live chat available 24/7</li>
            </ul>
            
            <p style="margin-top: 30px;">Best regards,<br><strong>The TutorsPool Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TutorsPool. All rights reserved.</p>
            <p>You're receiving this email because you registered on TutorsPool</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log(`Sending registration emails for ${role}: ${email}`);

    // Send admin notification
    const adminPayload = {
      from: {
        address: 'info@tutorspool.com',
        name: 'TutorsPool Registration'
      },
      to: [
        {
          email_address: {
            address: 'talkoftrend@gmail.com',
            name: 'TutorsPool Admin'
          }
        }
      ],
      subject: `New ${userRole.label} Registration - ${name}`,
      htmlbody: adminHtml,
    };

    const adminResponse = await fetch('https://api.zeptomail.com/v1.1/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': ZEPTO_TOKEN,
      },
      body: JSON.stringify(adminPayload),
    });

    if (!adminResponse.ok) {
      const errorText = await adminResponse.text();
      console.error('Admin notification error:', errorText);
      // Don't throw - continue to send user email
    } else {
      console.log('Admin notification sent successfully');
    }

    // Send user welcome email
    const userPayload = {
      from: {
        address: 'info@tutorspool.com',
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
      subject: `Welcome to TutorsPool, ${name}! 🎉`,
      htmlbody: userHtml,
    };

    const userResponse = await fetch('https://api.zeptomail.com/v1.1/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': ZEPTO_TOKEN,
      },
      body: JSON.stringify(userPayload),
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('User welcome email error:', errorText);
      throw new Error(`Failed to send welcome email: ${userResponse.status}`);
    }

    console.log('User welcome email sent successfully');

    res.status(200).json({
      success: true,
      message: 'Registration emails sent successfully',
    });
  } catch (error: any) {
    console.error('Registration email error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send registration emails',
      details: error.message,
    });
  }
}
