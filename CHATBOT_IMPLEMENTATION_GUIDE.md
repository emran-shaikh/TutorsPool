# TutorsPool ChatBot Implementation Guide

## 🤖 Real-Time AI ChatBot with WhatsApp Integration

Your TutorsPool application now includes a sophisticated AI chatbot that can provide basic information and seamlessly connect users to real agents via WhatsApp.

## ✨ Features Implemented

### 🧠 AI Agent Capabilities
- **Smart Responses**: Understands natural language queries about:
  - General information about TutorsPool
  - Available services and tutoring options
  - Pricing and packages
  - Subject availability
  - Booking process
  - Contact information
  - Support and help

### 💬 Real-Time Chat Interface
- **Floating Chat Button**: Always accessible in bottom-right corner
- **Modern UI**: Clean, responsive design with message bubbles
- **Typing Indicators**: Shows when AI is "thinking"
- **Message History**: Maintains conversation context
- **Auto-scroll**: Automatically scrolls to new messages

### 📱 WhatsApp Integration
- **Seamless Escalation**: When users need human help, they can connect to real agents
- **Contact Form**: Collects name, phone, and email before WhatsApp connection
- **Direct WhatsApp Link**: Opens WhatsApp with pre-filled message
- **Admin Notifications**: Notifies admin team of new contact requests

### 🔧 Technical Features
- **Context Awareness**: Hides on admin pages automatically
- **Error Handling**: Graceful error management
- **Performance Optimized**: Lightweight and fast
- **Mobile Responsive**: Works perfectly on all devices

## 🚀 How It Works

### 1. **Initial Interaction**
- User clicks the chat button (💬) in bottom-right corner
- AI greets user and offers help
- User can ask questions about services, pricing, etc.

### 2. **AI Responses**
The chatbot can handle queries like:
- "Hello" → Welcome message with available help topics
- "What services do you offer?" → Detailed service list
- "How much does tutoring cost?" → Pricing information
- "What subjects are available?" → Subject list
- "How do I book a session?" → Step-by-step booking guide
- "I need help" → General help information

### 3. **Human Agent Escalation**
When users ask for human assistance:
- Keywords trigger escalation: "human", "agent", "representative", "speak to", "talk to", "real person"
- Contact form appears asking for:
  - Full name
  - Phone number (with country code)
  - Email address
- WhatsApp link is generated with pre-filled message
- Admin team gets notified of new contact request

### 4. **WhatsApp Connection**
- User clicks "Connect via WhatsApp" button
- WhatsApp opens with pre-filled message: "Hello! I'm [Name] and I need assistance with TutorsPool. My email is [Email]."
- Real agent can respond directly via WhatsApp

## 🛠️ Configuration

### Environment Variables (Add to your .env files)

```env
# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_whatsapp_business_account_id_here
WHATSAPP_WEBHOOK_SECRET=your_whatsapp_webhook_secret_here
WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token_here
ADMIN_WHATSAPP_NUMBER=+15551234567
```

### WhatsApp Business API Setup

1. **Create WhatsApp Business Account**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app
   - Add WhatsApp Business API product

2. **Get Required Credentials**
   - Access Token (from your app)
   - Phone Number ID (from WhatsApp Business API)
   - Business Account ID (from your business account)

3. **Set Up Webhook**
   - Webhook URL: `https://your-domain.com/api/whatsapp-webhook`
   - Verify Token: Set a secure token
   - Subscribe to: `messages` events

## 📱 Usage Examples

### For Users:
1. **Basic Questions**: "What subjects do you offer?"
2. **Service Inquiries**: "How much does math tutoring cost?"
3. **Booking Help**: "How do I book a session?"
4. **Human Support**: "I need to speak to a real person"

### For Agents:
- Receive WhatsApp notifications when users request human help
- Pre-filled messages include user contact information
- Can respond directly via WhatsApp Business API

## 🎯 Customization Options

### Adding New Responses
Edit `CHATBOT_KNOWLEDGE` and `CHATBOT_RESPONSES` in `ChatBot.tsx`:

```typescript
const CHATBOT_KNOWLEDGE = {
  new_topic: ['keyword1', 'keyword2', 'keyword3']
};

const CHATBOT_RESPONSES = {
  new_topic: "Your response here..."
};
```

### Modifying Escalation Keywords
Update the escalation detection logic:

```typescript
// Check for escalation keywords
if (message.includes('human') || message.includes('agent') || 
    message.includes('your_new_keyword')) {
  setShowContactForm(true);
  return CHATBOT_RESPONSES.escalation;
}
```

### Customizing WhatsApp Messages
Modify the message templates in `whatsappService.ts`:

```typescript
const whatsappMessage = `Hello! I'm ${contact.name} and I need assistance with TutorsPool. My email is ${contact.email}.`;
```

## 🔒 Security Features

- **Input Sanitization**: All user inputs are sanitized
- **Webhook Verification**: WhatsApp webhooks are verified with signatures
- **Rate Limiting**: Built-in protection against spam
- **Error Boundaries**: Graceful error handling

## 📊 Analytics & Monitoring

The chatbot integrates with your existing analytics:
- User interactions are tracked
- Escalation rates are monitored
- Performance metrics are collected
- Error logs are maintained

## 🚀 Deployment

### For Vercel:
1. Add environment variables to Vercel dashboard
2. Deploy normally - chatbot is automatically included
3. Set up WhatsApp webhook URL

### For Other Platforms:
1. Ensure all environment variables are set
2. Deploy the webhook endpoint
3. Configure WhatsApp webhook settings

## 🎉 Ready to Use!

Your chatbot is now live and ready to:
- ✅ Answer common questions about TutorsPool
- ✅ Provide information about services and pricing
- ✅ Help users understand the booking process
- ✅ Connect users to real agents via WhatsApp
- ✅ Notify your team of new contact requests

The chatbot will appear as a floating chat button on all pages (except admin pages) and provides a seamless experience for both users and your support team.

## 📞 Support

If you need help configuring WhatsApp Business API or customizing the chatbot responses, refer to:
- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Facebook Developers Console](https://developers.facebook.com/)

Your AI-powered customer support is now ready to enhance user experience and streamline your support operations! 🎊
