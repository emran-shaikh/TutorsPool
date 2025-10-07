import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Phone, 
  Mail,
  ExternalLink,
  Loader2,
  Minimize2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  quickReplies?: string[];
}

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
}

const CHATBOT_KNOWLEDGE = {
  greetings: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'hola', 'namaste'],
  about: ['about', 'what is', 'tell me about', 'information', 'who are you', 'what do you do'],
  services: ['services', 'what do you offer', 'tutoring', 'tutors', 'offerings', 'what can i get'],
  pricing: ['price', 'cost', 'how much', 'fee', 'rates', 'payment', 'charge', 'expensive'],
  contact: ['contact', 'phone', 'email', 'reach', 'get in touch', 'talk to', 'speak with'],
  help: ['help', 'support', 'assist', 'problem', 'issue', 'stuck', 'confused'],
  booking: ['book', 'schedule', 'appointment', 'session', 'reserve', 'class', 'lesson'],
  subjects: ['subjects', 'math', 'science', 'english', 'history', 'physics', 'chemistry', 'biology', 'language', 'computer', 'programming'],
  howItWorks: ['how does it work', 'how it works', 'process', 'steps', 'get started', 'begin'],
  tutorInfo: ['tutor', 'teacher', 'instructor', 'qualified', 'experienced', 'find tutor'],
  studentInfo: ['student', 'learner', 'i am a student', 'for students'],
  refund: ['refund', 'money back', 'cancel', 'cancellation policy', 'return'],
};

const CHATBOT_RESPONSES = {
  greeting: "👋 Hello! I'm the TutorsPool AI assistant. I can help you with information about our tutoring services, pricing, subjects, and more. How can I assist you today?",
  about: "🎓 TutorsPool is a comprehensive online tutoring platform that connects students with qualified tutors. We offer personalized learning experiences across various subjects and grade levels, with live video sessions, interactive tools, and flexible scheduling.",
  services: "✨ We offer:\n\n• 📚 One-on-one tutoring sessions\n• 👥 Group study sessions\n• 📝 Subject-specific help\n• 📖 Homework assistance\n• 🎯 Exam preparation\n• 💬 Real-time chat support\n• ⏰ Flexible scheduling\n• 📊 Progress tracking\n• 🎥 HD video sessions",
  pricing: "💰 Our pricing varies by tutor and subject:\n\n• $15-25/hour for basic subjects\n• $30-50/hour for advanced subjects\n• 📦 Package deals available (save up to 20%)\n• 🎁 Free trial sessions for new students\n• 💳 Flexible payment options\n\nAll prices include platform features and 24/7 support!",
  contact: "📞 You can reach us through:\n\n• 📧 Email: support@tutorspool.com\n• 📱 Phone: +1 (555) 123-4567\n• 💬 Live chat support (24/7)\n• 📝 Contact form on our website\n• 💚 WhatsApp support\n\nOur team typically responds within 5 minutes!",
  help: "🤝 I'm here to help! You can ask me about:\n\n• 👨‍🏫 Our services and tutors\n• 💵 Pricing and packages\n• 📅 How to book sessions\n• 📚 Available subjects\n• 👤 Account setup\n• 🔧 Technical issues\n• 📋 Platform features\n\nJust type your question!",
  booking: "📅 To book a session:\n\n1. 🔍 Browse our available tutors\n2. 📚 Select your preferred subject\n3. ⏰ Choose a time slot\n4. 💳 Complete payment\n5. 🎥 Join your session!\n\nBookings confirm instantly, and you'll receive email + SMS reminders!",
  subjects: "📚 We offer tutoring in 50+ subjects:\n\n🔢 Mathematics (Algebra, Calculus, Statistics, Geometry)\n🔬 Sciences (Physics, Chemistry, Biology, Earth Science)\n🗣️ Languages (English, Spanish, French, German, Mandarin)\n🌍 Social Studies (History, Geography, Economics)\n💻 Computer Science (Python, Java, Web Dev)\n🎨 Arts & Music\n\n...and many more!",
  howItWorks: "🚀 Getting started is easy:\n\n1. 📝 Sign up for free\n2. 🔍 Browse qualified tutors\n3. 📅 Book your first session\n4. 🎥 Join via video call\n5. 📈 Track your progress\n\nNew students get a FREE trial session!",
  tutorInfo: "👨‍🏫 Our tutors are:\n\n✅ Verified & background-checked\n🎓 Highly qualified (degrees & certifications)\n⭐ Rated by students (4.5+ average)\n🌍 Available worldwide\n💬 Fluent in multiple languages\n📊 Track record of student success\n\nAll tutors go through rigorous screening!",
  studentInfo: "🎒 For students, we offer:\n\n📈 Personalized learning paths\n🎯 Goal-oriented sessions\n📊 Progress reports\n🏆 Achievement badges\n💬 Parent updates (for K-12)\n📝 Study materials & resources\n🎥 Session recordings\n\nJoin 10,000+ successful students!",
  refund: "💚 Our refund policy:\n\n• 100% money-back guarantee on first session\n• Cancel anytime with 24-hour notice\n• Unused credits never expire\n• Pro-rated refunds available\n• No hidden fees\n\nYour satisfaction is guaranteed!",
  escalation: "🤝 I understand you need more detailed assistance. Let me connect you with one of our human agents who can provide personalized help. Please provide your contact information below:",
  fallback: "🤔 I'm sorry, I didn't quite understand that. Could you please rephrase your question?\n\nI can help with:\n• Services & features\n• Pricing & packages\n• Booking sessions\n• Tutor information\n• Available subjects\n\nOr type 'help' to see all options!"
};

const QUICK_REPLIES = {
  initial: ['📚 Services', '💰 Pricing', '📅 Book Session', '👨‍🏫 Find Tutor', '🤝 Talk to Agent'],
  afterGreeting: ['How it works', 'View subjects', 'Pricing info', 'Talk to human'],
  afterPricing: ['Book a session', 'See packages', 'Free trial', 'Talk to agent'],
  afterSubjects: ['Find tutor', 'Book session', 'More info', 'Pricing'],
};

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: CHATBOT_RESPONSES.greeting,
      timestamp: new Date(),
      quickReplies: QUICK_REPLIES.initial
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: '',
    phone: '',
    email: ''
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setUnreadCount(0);
    }
  }, [isOpen]);

  const generateResponse = async (userMessage: string): Promise<{ content: string; quickReplies?: string[] }> => {
    const message = userMessage.toLowerCase();
    
    // Check for escalation keywords first
    if (message.includes('human') || message.includes('agent') || message.includes('representative') || 
        message.includes('speak to') || message.includes('talk to') || message.includes('real person')) {
      setShowContactForm(true);
      return { content: CHATBOT_RESPONSES.escalation };
    }

    try {
      // Try to get AI response from backend
      const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || ((import.meta as any).env?.PROD ? '/api' : 'http://localhost:5174/api');
      const conversationId = `chatbot_${Date.now()}`;
      
      const response = await fetch(`${API_BASE_URL}/ai-chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'chatbot_user',
          message: userMessage,
          conversationId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return data.data;
        }
      }
    } catch (error) {
      console.log('AI service unavailable, using fallback responses');
    }

    // Fallback to rule-based responses if AI service fails
    const message_lower = message.toLowerCase();
    
    if (CHATBOT_KNOWLEDGE.greetings.some(greeting => message_lower.includes(greeting))) {
      return { content: CHATBOT_RESPONSES.greeting, quickReplies: QUICK_REPLIES.afterGreeting };
    }
    
    if (CHATBOT_KNOWLEDGE.about.some(keyword => message_lower.includes(keyword))) {
      return { content: CHATBOT_RESPONSES.about, quickReplies: QUICK_REPLIES.initial };
    }
    
    if (CHATBOT_KNOWLEDGE.services.some(keyword => message_lower.includes(keyword))) {
      return { content: CHATBOT_RESPONSES.services, quickReplies: ['Book session', 'Pricing', 'Find tutor'] };
    }
    
    if (CHATBOT_KNOWLEDGE.pricing.some(keyword => message_lower.includes(keyword))) {
      return { content: CHATBOT_RESPONSES.pricing, quickReplies: QUICK_REPLIES.afterPricing };
    }
    
    if (CHATBOT_KNOWLEDGE.contact.some(keyword => message_lower.includes(keyword))) {
      return { content: CHATBOT_RESPONSES.contact, quickReplies: ['Talk to agent', 'Send email', 'Call us'] };
    }
    
    if (CHATBOT_KNOWLEDGE.help.some(keyword => message_lower.includes(keyword))) {
      return { content: CHATBOT_RESPONSES.help, quickReplies: QUICK_REPLIES.initial };
    }
    
    if (CHATBOT_KNOWLEDGE.booking.some(keyword => message_lower.includes(keyword))) {
      return { content: CHATBOT_RESPONSES.booking, quickReplies: ['Find tutor', 'View subjects', 'Pricing'] };
    }
    
    if (CHATBOT_KNOWLEDGE.subjects.some(keyword => message_lower.includes(keyword))) {
      return { content: CHATBOT_RESPONSES.subjects, quickReplies: QUICK_REPLIES.afterSubjects };
    }

    if (CHATBOT_KNOWLEDGE.howItWorks.some(keyword => message_lower.includes(keyword))) {
      return { content: CHATBOT_RESPONSES.howItWorks, quickReplies: ['Sign up', 'View pricing', 'Find tutor'] };
    }

    if (CHATBOT_KNOWLEDGE.tutorInfo.some(keyword => message_lower.includes(keyword))) {
      return { content: CHATBOT_RESPONSES.tutorInfo, quickReplies: ['Find tutor', 'Book session', 'View subjects'] };
    }

    if (CHATBOT_KNOWLEDGE.studentInfo.some(keyword => message_lower.includes(keyword))) {
      return { content: CHATBOT_RESPONSES.studentInfo, quickReplies: ['Sign up', 'Free trial', 'Find tutor'] };
    }

    if (CHATBOT_KNOWLEDGE.refund.some(keyword => message_lower.includes(keyword))) {
      return { content: CHATBOT_RESPONSES.refund, quickReplies: ['Talk to agent', 'More info', 'Book session'] };
    }
    
    return { content: CHATBOT_RESPONSES.fallback, quickReplies: QUICK_REPLIES.initial };
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Get AI response
    (async () => {
      try {
        const response = await generateResponse(userMessage.content);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: response.content,
          timestamp: new Date(),
          quickReplies: response.quickReplies
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        
        // Update unread count if chat is closed
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
      } catch (error) {
        console.error('Error getting response:', error);
        setIsTyping(false);
      }
    })();
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInfo.name || !contactInfo.phone || !contactInfo.email) return;

    setIsSubmittingContact(true);

    try {
      // Create WhatsApp link
      const whatsappMessage = `Hello! I'm ${contactInfo.name} and I need assistance with TutorsPool. My email is ${contactInfo.email}.`;
      const whatsappUrl = `https://wa.me/+15551234567?text=${encodeURIComponent(whatsappMessage)}`;
      
      // Add system message
      const systemMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: `Great! I've prepared your WhatsApp connection. Click the button below to start chatting with our support team.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, systemMessage]);
      setShowContactForm(false);

      // Open WhatsApp in new tab
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1500);

    } catch (error) {
      console.error('Error submitting contact info:', error);
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-gradient-to-br from-orange-500 via-orange-600 to-blue-600 hover:from-orange-600 hover:via-orange-700 hover:to-blue-700 shadow-2xl z-50 transition-all duration-300 hover:scale-105 group"
          size="icon"
        >
          <MessageCircle className="h-7 w-7 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white animate-bounce">
              {unreadCount}
            </span>
          )}
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className={cn(
          "fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] shadow-2xl z-50 flex flex-col transition-all duration-300 border-2 border-orange-200 overflow-hidden",
          isMinimized ? "h-16" : "h-[600px] max-h-[calc(100vh-3rem)]"
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-3 px-4 bg-gradient-to-r from-orange-500 via-orange-600 to-blue-600 text-white rounded-t-lg flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bot className="h-6 w-6" />
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <CardTitle className="text-base font-semibold">TutorsPool AI</CardTitle>
                <p className="text-xs text-blue-100">Online • Ready to help</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-7 w-7 p-0 hover:bg-orange-600 text-white"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 p-0 hover:bg-orange-600 text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className={cn("flex-1 flex flex-col p-0 overflow-hidden", isMinimized && "hidden")}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
              {messages.map((message, index) => (
                <div key={message.id} className="w-full">
                  <div
                    className={cn(
                      "flex animate-in fade-in slide-in-from-bottom-2 duration-500",
                      message.type === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-md transition-all hover:shadow-lg break-words",
                        message.type === 'user'
                          ? "bg-gradient-to-br from-orange-500 to-blue-600 text-white rounded-br-sm"
                          : message.type === 'system'
                          ? "bg-gradient-to-br from-green-100 to-green-200 text-green-900 border border-green-300"
                          : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                      )}
                    >
                      <div className="flex items-start space-x-2">
                        {message.type === 'bot' && (
                          <div className="bg-gradient-to-br from-orange-100 to-blue-100 rounded-full p-1 mt-0.5 flex-shrink-0">
                            <Bot className="h-3 w-3 text-orange-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="whitespace-pre-wrap leading-relaxed break-words">{message.content}</div>
                          <div className={cn(
                            "text-xs mt-1.5 flex items-center",
                            message.type === 'user' ? "text-blue-100" : "text-gray-500"
                          )}>
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Replies */}
                  {message.quickReplies && index === messages.length - 1 && !isTyping && (
                    <div className="flex flex-wrap gap-2 mt-3 ml-2 max-w-full">
                      {message.quickReplies.map((reply, idx) => (
                        <Button
                          key={idx}
                          onClick={() => handleQuickReply(reply)}
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-blue-50 hover:text-orange-600 hover:border-orange-300 transition-all shadow-sm hover:shadow-md flex-shrink-0"
                        >
                          {reply}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 w-full">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 text-sm shadow-md">
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-100 rounded-full p-1">
                        <Bot className="h-3 w-3 text-blue-600" />
                      </div>
                      <div className="flex space-x-1 items-center">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Contact Form */}
            {showContactForm && (
              <div className="border-t border-gray-200 p-4 bg-gradient-to-b from-gray-50 to-white flex-shrink-0">
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <Sparkles className="h-5 w-5 text-green-600" />
                    <div className="text-sm font-semibold text-gray-800">
                      Connect with a Human Agent
                    </div>
                  </div>
                  
                  <Input
                    placeholder="Your name"
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  
                  <Input
                    placeholder="Phone number (with country code)"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  
                  <Input
                    placeholder="Email address"
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  
                  <div className="flex space-x-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowContactForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmittingContact}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 shadow-md"
                    >
                      {isSubmittingContact ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <ExternalLink className="h-4 w-4 mr-2" />
                      )}
                      WhatsApp
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Input */}
            {!showContactForm && (
              <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
                <div className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isTyping}
                    className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-full px-4"
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isTyping}
                    size="icon"
                    className="bg-gradient-to-br from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 rounded-full h-10 w-10 shadow-md transition-all hover:scale-105 flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 text-xs text-center text-gray-400">
                  Powered by TutorsPool AI • Always here to help
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ChatBot;
