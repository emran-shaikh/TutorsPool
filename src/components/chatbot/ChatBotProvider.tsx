import React, { createContext, useContext, useState, useEffect } from 'react';
import { whatsappService, WhatsAppContact } from '@/lib/whatsappService';

interface ChatBotContextType {
  isVisible: boolean;
  toggleVisibility: () => void;
  showContactForm: boolean;
  setShowContactForm: (show: boolean) => void;
  submitContactInfo: (contact: WhatsAppContact) => Promise<boolean>;
  isSubmitting: boolean;
}

const ChatBotContext = createContext<ChatBotContextType | undefined>(undefined);

export const useChatBot = () => {
  const context = useContext(ChatBotContext);
  if (!context) {
    throw new Error('useChatBot must be used within a ChatBotProvider');
  }
  return context;
};

interface ChatBotProviderProps {
  children: React.ReactNode;
}

export const ChatBotProvider: React.FC<ChatBotProviderProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Make chatbot available on ALL pages (admin, student, tutor, public)
  useEffect(() => {
    const handleRouteChange = () => {
      const currentPath = window.location.pathname;
      
      // Only hide on very specific debug/test pages
      const hiddenPages = ['/debug-signup', '/error-test'];
      const shouldHide = hiddenPages.some(page => currentPath === page);
      
      setIsVisible(!shouldHide);
    };

    // Check on mount
    handleRouteChange();

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const submitContactInfo = async (contact: WhatsAppContact): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      // Create WhatsApp link for user
      const whatsappMessage = `Hello! I'm ${contact.name} and I need assistance with TutorsPool. My email is ${contact.email}.`;
      const whatsappUrl = whatsappService.createWhatsAppLink(contact.phone, whatsappMessage);
      
      // Notify admin about new contact (optional)
      await whatsappService.notifyAdminNewContact(contact);
      
      // Open WhatsApp for user
      window.open(whatsappUrl, '_blank');
      
      return true;
    } catch (error) {
      console.error('Error submitting contact info:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const value: ChatBotContextType = {
    isVisible,
    toggleVisibility,
    showContactForm,
    setShowContactForm,
    submitContactInfo,
    isSubmitting
  };

  return (
    <ChatBotContext.Provider value={value}>
      {children}
    </ChatBotContext.Provider>
  );
};
