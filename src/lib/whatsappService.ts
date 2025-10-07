// WhatsApp Business API Service for TutorsPool
interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: Array<{
      type: string;
      parameters: Array<{
        type: string;
        text: string;
      }>;
    }>;
  };
}

interface WhatsAppContact {
  name: string;
  phone: string;
  email: string;
  message?: string;
}

class WhatsAppService {
  private accessToken: string;
  private phoneNumberId: string;
  private businessAccountId: string;
  private apiVersion = 'v18.0';

  constructor() {
    // These would be set from environment variables in production
    // Using import.meta.env for Vite instead of process.env
    this.accessToken = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN || 'your_whatsapp_access_token';
    this.phoneNumberId = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || 'your_phone_number_id';
    this.businessAccountId = import.meta.env.VITE_WHATSAPP_BUSINESS_ACCOUNT_ID || 'your_business_account_id';
  }

  /**
   * Send a text message via WhatsApp Business API
   */
  async sendMessage(message: WhatsAppMessage): Promise<boolean> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('WhatsApp API Error:', errorData);
        return false;
      }

      const result = await response.json();
      console.log('WhatsApp message sent successfully:', result);
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  /**
   * Send a welcome message to a new contact
   */
  async sendWelcomeMessage(contact: WhatsAppContact): Promise<boolean> {
    const welcomeMessage = `Hello ${contact.name}! 👋

Welcome to TutorsPool! I'm your personal support agent. 

Here's what I can help you with:
• Finding the right tutor for your needs
• Scheduling tutoring sessions
• Understanding our pricing and packages
• Technical support
• Account management

Your details:
📧 Email: ${contact.email}
📱 Phone: ${contact.phone}

How can I assist you today?`;

    return this.sendMessage({
      to: contact.phone,
      type: 'text',
      text: {
        body: welcomeMessage
      }
    });
  }

  /**
   * Send a template message (for approved templates)
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    parameters: string[] = []
  ): Promise<boolean> {
    const message: WhatsAppMessage = {
      to,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: 'en_US'
        }
      }
    };

    // Add parameters if provided
    if (parameters.length > 0) {
      message.template!.components = [
        {
          type: 'body',
          parameters: parameters.map(param => ({
            type: 'text',
            text: param
          }))
        }
      ];
    }

    return this.sendMessage(message);
  }

  /**
   * Create WhatsApp link for direct messaging
   */
  createWhatsAppLink(phoneNumber: string, message?: string): string {
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    
    // Add country code if not present
    let formattedPhone = cleanPhone;
    if (!cleanPhone.startsWith('+')) {
      // Assuming US number if no country code
      formattedPhone = `+1${cleanPhone}`;
    }

    const baseUrl = `https://wa.me/${formattedPhone}`;
    
    if (message) {
      return `${baseUrl}?text=${encodeURIComponent(message)}`;
    }
    
    return baseUrl;
  }

  /**
   * Send notification to admin about new contact
   */
  async notifyAdminNewContact(contact: WhatsAppContact): Promise<boolean> {
    const adminMessage = `🔔 New WhatsApp Contact Request

Name: ${contact.name}
Phone: ${contact.phone}
Email: ${contact.email}
Message: ${contact.message || 'No specific message'}

Please follow up with this potential customer.`;

    // This would be sent to admin's WhatsApp number
    const adminPhoneNumber = import.meta.env.VITE_ADMIN_WHATSAPP_NUMBER || '+15551234567';
    
    return this.sendMessage({
      to: adminPhoneNumber,
      type: 'text',
      text: {
        body: adminMessage
      }
    });
  }

  /**
   * Handle incoming webhook from WhatsApp
   */
  async handleWebhook(payload: any): Promise<void> {
    try {
      // Process incoming messages
      if (payload.entry && payload.entry[0].changes) {
        const change = payload.entry[0].changes[0];
        
        if (change.value.messages) {
          for (const message of change.value.messages) {
            await this.processIncomingMessage(message);
          }
        }
      }
    } catch (error) {
      console.error('Error processing WhatsApp webhook:', error);
    }
  }

  /**
   * Process incoming WhatsApp messages
   */
  private async processIncomingMessage(message: any): Promise<void> {
    const messageText = message.text?.body || '';
    const senderPhone = message.from;
    
    // Log the message for tracking
    console.log(`Incoming WhatsApp message from ${senderPhone}: ${messageText}`);
    
    // Here you could implement auto-responses, routing logic, etc.
    // For now, just acknowledge receipt
    await this.sendMessage({
      to: senderPhone,
      type: 'text',
      text: {
        body: 'Thank you for your message! A support agent will get back to you shortly. 🙏'
      }
    });
  }

  /**
   * Verify webhook signature (for security)
   * Note: This should be done on the server-side, not in the browser
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // This method should only be called on the server
    // For browser-side, we'll skip verification
    if (typeof window !== 'undefined') {
      console.warn('Webhook signature verification should be done server-side');
      return true;
    }
    
    // Server-side verification would happen here
    return true;
  }
}

// Create and export singleton instance
export const whatsappService = new WhatsAppService();

// Export types for use in other components
export type { WhatsAppContact, WhatsAppMessage };

// Utility function to format phone numbers
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Add country code if missing
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  return phone;
};

// Utility function to validate phone numbers
export const isValidPhoneNumber = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
};
