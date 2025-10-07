// Temporarily commented out until package is installed
// import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Temporary type definition
type GoogleGenerativeAI = any;

interface AIResponse {
  content: string;
  quickReplies?: string[];
}

// System prompt that defines the chatbot's personality and knowledge
const SYSTEM_PROMPT = `You are TutorsPool AI, a helpful and friendly AI assistant for TutorsPool - an online tutoring platform.

YOUR ROLE:
- Help users learn about TutorsPool's services, pricing, tutors, and features
- Answer questions clearly and concisely
- Be warm, professional, and encouraging
- Always stay on topic about tutoring and education

ABOUT TUTORSPOOL:
- We connect students with qualified tutors for one-on-one and group sessions
- We offer 50+ subjects including Math, Science, Languages, Computer Science, and more
- Pricing: $15-25/hour for basic subjects, $30-50/hour for advanced subjects
- Features: HD video sessions, progress tracking, flexible scheduling, 24/7 support
- All tutors are verified, background-checked, and highly qualified
- Free trial session for new students
- 100% money-back guarantee on first session

SERVICES:
- One-on-one tutoring sessions
- Group study sessions
- Subject-specific help
- Homework assistance
- Exam preparation
- Real-time chat support
- Flexible scheduling
- Progress tracking
- Session recordings

HOW IT WORKS:
1. Sign up for free
2. Browse qualified tutors
3. Book your first session
4. Join via video call
5. Track your progress

CONTACT:
- Email: support@tutorspool.com
- Phone: +1 (555) 123-4567
- Live chat support (24/7)
- WhatsApp support available

IMPORTANT GUIDELINES:
- Keep responses concise (2-3 paragraphs max)
- Use emojis sparingly and appropriately
- If asked about something outside tutoring/education, politely redirect to TutorsPool topics
- If the user needs detailed help, suggest connecting with a human agent
- Always be encouraging and supportive about learning
- Never make up information - if you don't know, say so and offer to connect them with an agent

RESPONSE STYLE:
- Be conversational but professional
- Use bullet points for lists
- Be specific with numbers and facts
- Encourage action (sign up, book session, contact support)`;

class AIChatService {
  private googleAI: GoogleGenerativeAI | null = null;
  private provider: string;
  private conversationHistory: Map<string, ChatMessage[]> = new Map();

  constructor() {
    this.provider = process.env.AI_PROVIDER || 'local';
    
    // Initialize Google Gemini if selected
    if (this.provider === 'google' && process.env.GOOGLE_AI_API_KEY) {
      try {
        // Temporarily disabled until @google/generative-ai is installed
        // this.googleAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
        console.log('⚠️ Google Gemini package not installed yet - using rule-based responses');
        this.provider = 'local'; // Force local mode
      } catch (error) {
        console.log('⚠️ AI Chat Service running in local mode (rule-based)');
      }
    } else {
      console.log('⚠️ AI Chat Service running in local mode (rule-based)');
    }
  }

  /**
   * Get AI response for user message
   */
  async getResponse(
    userId: string,
    userMessage: string,
    conversationId?: string
  ): Promise<AIResponse> {
    const convId = conversationId || userId;

    try {
      // Get or create conversation history
      if (!this.conversationHistory.has(convId)) {
        this.conversationHistory.set(convId, [
          { role: 'system', content: SYSTEM_PROMPT }
        ]);
      }

      const history = this.conversationHistory.get(convId)!;

      // Add user message to history
      history.push({ role: 'user', content: userMessage });

      // Keep only last 10 messages (plus system prompt) to manage token usage
      if (history.length > 21) {
        history.splice(1, history.length - 21);
      }

      let response: AIResponse;

      if (this.googleAI && this.provider === 'google') {
        response = await this.getGoogleAIResponse(history, userMessage);
      } else {
        // Fallback to rule-based responses
        response = this.getRuleBasedResponse(userMessage);
      }

      // Add assistant response to history
      if (response.content) {
        history.push({ role: 'assistant', content: response.content });
      }

      return response;
    } catch (error) {
      console.error('AI Chat Service Error:', error);
      // Fallback to rule-based on error
      return this.getRuleBasedResponse(userMessage);
    }
  }

  /**
   * Get response from Google Gemini AI
   */
  private async getGoogleAIResponse(history: ChatMessage[], userMessage: string): Promise<AIResponse> {
    if (!this.googleAI) {
      throw new Error('Google AI not initialized');
    }

    const model = this.googleAI.getGenerativeModel({ 
      model: process.env.GOOGLE_AI_MODEL || 'gemini-pro' 
    });

    // Format conversation history for Gemini
    const conversationContext = history
      .filter(msg => msg.role !== 'system')
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const prompt = `${SYSTEM_PROMPT}

Previous conversation:
${conversationContext}

User: ${userMessage}

Provide a helpful, concise response (2-3 paragraphs max) that stays on topic about TutorsPool tutoring services.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    const quickReplies = this.generateQuickReplies(content);

    return {
      content,
      quickReplies,
    };
  }

  /**
   * Fallback rule-based responses (same as current chatbot)
   */
  private getRuleBasedResponse(userMessage: string): AIResponse {
    const message = userMessage.toLowerCase();

    const CHATBOT_RESPONSES = {
      greeting: "👋 Hello! I'm the TutorsPool AI assistant. I can help you with information about our tutoring services, pricing, subjects, and more. How can I assist you today?",
      about: "🎓 TutorsPool is a comprehensive online tutoring platform that connects students with qualified tutors. We offer personalized learning experiences across various subjects and grade levels, with live video sessions, interactive tools, and flexible scheduling.",
      services: "✨ We offer:\n\n• 📚 One-on-one tutoring sessions\n• 👥 Group study sessions\n• 📝 Subject-specific help\n• 📖 Homework assistance\n• 🎯 Exam preparation\n• 💬 Real-time chat support\n• ⏰ Flexible scheduling\n• 📊 Progress tracking\n• 🎥 HD video sessions",
      pricing: "💰 Our pricing varies by tutor and subject:\n\n• $15-25/hour for basic subjects\n• $30-50/hour for advanced subjects\n• 📦 Package deals available (save up to 20%)\n• 🎁 Free trial sessions for new students\n• 💳 Flexible payment options\n\nAll prices include platform features and 24/7 support!",
      fallback: "I can help you with information about our services, pricing, tutors, booking sessions, and more. What would you like to know?",
    };

    // Simple keyword matching
    if (/hello|hi|hey|greet/i.test(message)) {
      return {
        content: CHATBOT_RESPONSES.greeting,
        quickReplies: ['Services', 'Pricing', 'Book Session', 'Find Tutor'],
      };
    }

    if (/about|what is|tell me/i.test(message)) {
      return {
        content: CHATBOT_RESPONSES.about,
        quickReplies: ['Services', 'Pricing', 'How it works'],
      };
    }

    if (/service|offer|tutor/i.test(message)) {
      return {
        content: CHATBOT_RESPONSES.services,
        quickReplies: ['Book session', 'Pricing', 'Find tutor'],
      };
    }

    if (/price|cost|how much|fee/i.test(message)) {
      return {
        content: CHATBOT_RESPONSES.pricing,
        quickReplies: ['Book session', 'Free trial', 'Talk to agent'],
      };
    }

    return {
      content: CHATBOT_RESPONSES.fallback,
      quickReplies: ['Services', 'Pricing', 'Book Session', 'Talk to Agent'],
    };
  }

  /**
   * Generate contextual quick replies based on response
   */
  private generateQuickReplies(response: string): string[] {
    const lowerResponse = response.toLowerCase();

    // Generate quick replies based on what was discussed
    if (lowerResponse.includes('pricing') || lowerResponse.includes('cost')) {
      return ['Book a session', 'Free trial', 'See packages', 'Talk to agent'];
    }

    if (lowerResponse.includes('service') || lowerResponse.includes('offer')) {
      return ['Book session', 'Pricing', 'Find tutor', 'How it works'];
    }

    if (lowerResponse.includes('book') || lowerResponse.includes('session')) {
      return ['Find tutor', 'View subjects', 'Pricing', 'Sign up'];
    }

    if (lowerResponse.includes('tutor')) {
      return ['Find tutor', 'Book session', 'View subjects', 'Pricing'];
    }

    // Default quick replies
    return ['Services', 'Pricing', 'Book Session', 'Talk to Agent'];
  }

  /**
   * Clear conversation history for a user
   */
  clearConversation(conversationId: string): void {
    this.conversationHistory.delete(conversationId);
  }

  /**
   * Get conversation history
   */
  getConversationHistory(conversationId: string): ChatMessage[] {
    return this.conversationHistory.get(conversationId) || [];
  }
}

// Export singleton instance
export const aiChatService = new AIChatService();

