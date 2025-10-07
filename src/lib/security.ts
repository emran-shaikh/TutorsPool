// Security utilities for production
import DOMPurify from 'dompurify';

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return DOMPurify.sanitize(input.trim());
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Phone number validation
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Rate limiting helper
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }
}

// XSS protection
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// CSRF token generation
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Validate CSRF token
export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token && storedToken && token === storedToken;
};

// Content Security Policy
export const getCSPHeaders = (): Record<string, string> => {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://vercel.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https: wss: ws:",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'"
    ].join('; ')
  };
};

// Secure headers
export const getSecurityHeaders = (): Record<string, string> => {
  return {
    ...getCSPHeaders(),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  };
};

// Input validation schemas
export const validationSchemas = {
  email: {
    required: true,
    type: 'email',
    validator: isValidEmail,
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    minLength: 8,
    validator: isValidPassword,
    message: 'Password must be at least 8 characters with uppercase, lowercase, and number'
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    validator: (value: string) => /^[a-zA-Z\s\-'\.]+$/.test(value),
    message: 'Name can only contain letters, spaces, hyphens, apostrophes, and periods'
  },
  phone: {
    required: false,
    validator: (value: string) => !value || isValidPhone(value),
    message: 'Please enter a valid phone number'
  }
};

// Validate form data
export const validateFormData = (data: Record<string, any>, schema: Record<string, any>): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  Object.keys(schema).forEach(field => {
    const fieldSchema = schema[field];
    const value = data[field];
    
    // Required validation
    if (fieldSchema.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${field} is required`;
      return;
    }
    
    // Skip validation if field is empty and not required
    if (!value && !fieldSchema.required) return;
    
    // Length validation
    if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
      errors[field] = `${field} must be at least ${fieldSchema.minLength} characters`;
      return;
    }
    
    if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
      errors[field] = `${field} must be no more than ${fieldSchema.maxLength} characters`;
      return;
    }
    
    // Custom validator
    if (fieldSchema.validator && !fieldSchema.validator(value)) {
      errors[field] = fieldSchema.message || `${field} is invalid`;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
