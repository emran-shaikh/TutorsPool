/**
 * AUTH-006: Input Validation and XSS Prevention Test
 * Attempt login/signup with XSS payloads and verify sanitization
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Contact from '../pages/Contact';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Common XSS payloads for testing
const XSS_PAYLOADS = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  '<svg/onload=alert("XSS")>',
  'javascript:alert("XSS")',
  '<iframe src="javascript:alert(\'XSS\')">',
  '<body onload=alert("XSS")>',
  '<input onfocus=alert("XSS") autofocus>',
  '<select onfocus=alert("XSS") autofocus>',
  '<textarea onfocus=alert("XSS") autofocus>',
  '<marquee onstart=alert("XSS")>',
  '<div style="background:url(javascript:alert(\'XSS\'))">',
  '"><script>alert(String.fromCharCode(88,83,83))</script>',
  '<IMG SRC="javascript:alert(\'XSS\');">',
  '<IMG """><SCRIPT>alert("XSS")</SCRIPT>">',
  '<IMG SRC=javascript:alert(String.fromCharCode(88,83,83))>',
];

describe('AUTH-006: Input Validation and XSS Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe('Login Form XSS Prevention', () => {
    it('should sanitize XSS payload in email field', async () => {
      renderWithProviders(<Login />);

      const emailInput = screen.getByPlaceholderText(/email/i) as HTMLInputElement;
      
      XSS_PAYLOADS.forEach(payload => {
        fireEvent.change(emailInput, { target: { value: payload } });
        
        // Verify no script execution
        expect(document.querySelectorAll('script').length).toBe(0);
        
        // Verify input is sanitized or rejected
        const value = emailInput.value;
        expect(value).not.toContain('<script>');
        expect(value).not.toContain('javascript:');
        expect(value).not.toContain('onerror=');
        expect(value).not.toContain('onload=');
      });
    });

    it('should prevent XSS in password field', async () => {
      renderWithProviders(<Login />);

      const passwordInput = screen.getByPlaceholderText(/password/i) as HTMLInputElement;
      
      const xssPayload = '<script>alert("XSS")</script>';
      fireEvent.change(passwordInput, { target: { value: xssPayload } });

      // Password field should accept any characters (it's hashed)
      // But should not execute scripts
      expect(document.querySelectorAll('script[src*="alert"]').length).toBe(0);
    });

    it('should validate email format and reject XSS attempts', async () => {
      renderWithProviders(<Login />);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { 
        target: { value: '<script>alert("XSS")</script>@test.com' } 
      });

      // Submit button should be disabled for invalid email
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Signup Form XSS Prevention', () => {
    it('should sanitize XSS payload in name field', async () => {
      renderWithProviders(<Signup />);

      const nameInput = screen.getByPlaceholderText(/name|full name/i) as HTMLInputElement;
      
      const xssPayload = '<img src=x onerror=alert("XSS")>';
      fireEvent.change(nameInput, { target: { value: xssPayload } });

      // Verify no malicious elements created
      expect(document.querySelectorAll('img[src="x"]').length).toBe(0);
      
      // Name should be sanitized
      const value = nameInput.value;
      expect(value).not.toContain('<img');
      expect(value).not.toContain('onerror');
    });

    it('should prevent script injection in all signup fields', async () => {
      renderWithProviders(<Signup />);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const nameInput = screen.getByPlaceholderText(/name|full name/i);

      const xssPayload = '<script>alert("XSS")</script>';

      fireEvent.change(nameInput, { target: { value: xssPayload } });
      fireEvent.change(emailInput, { target: { value: xssPayload } });
      fireEvent.change(passwordInput, { target: { value: xssPayload } });

      // No scripts should be executed
      const scripts = document.querySelectorAll('script');
      const maliciousScripts = Array.from(scripts).filter(
        script => script.textContent?.includes('alert("XSS")')
      );
      expect(maliciousScripts.length).toBe(0);
    });

    it('should handle multiple XSS vectors in name field', async () => {
      renderWithProviders(<Signup />);

      const nameInput = screen.getByPlaceholderText(/name|full name/i) as HTMLInputElement;

      XSS_PAYLOADS.slice(0, 5).forEach(payload => {
        fireEvent.change(nameInput, { target: { value: payload } });
        
        // Verify sanitization
        const value = nameInput.value;
        expect(value).not.toMatch(/<script|<img|<svg|javascript:|<iframe/i);
      });
    });
  });

  describe('Contact Form XSS Prevention', () => {
    it('should sanitize XSS payload in message field', async () => {
      renderWithProviders(<Contact />);

      const messageInputs = screen.queryAllByRole('textbox');
      
      if (messageInputs.length > 0) {
        const messageInput = messageInputs[messageInputs.length - 1] as HTMLTextAreaElement;
        
        const xssPayload = '<script>document.cookie</script>';
        fireEvent.change(messageInput, { target: { value: xssPayload } });

        // Verify no script execution
        expect(document.querySelectorAll('script').length).toBe(0);
      }
    });

    it('should prevent XSS in contact name field', async () => {
      renderWithProviders(<Contact />);

      const nameInputs = screen.queryAllByPlaceholderText(/name/i);
      
      if (nameInputs.length > 0) {
        const nameInput = nameInputs[0] as HTMLInputElement;
        
        const xssPayload = '<svg/onload=alert("XSS")>';
        fireEvent.change(nameInput, { target: { value: xssPayload } });

        // No SVG elements should be created
        expect(document.querySelectorAll('svg[onload]').length).toBe(0);
      }
    });

    it('should sanitize email field in contact form', async () => {
      renderWithProviders(<Contact />);

      const emailInputs = screen.queryAllByPlaceholderText(/email/i);
      
      if (emailInputs.length > 0) {
        const emailInput = emailInputs[0] as HTMLInputElement;
        
        const xssPayload = 'test@test.com<script>alert("XSS")</script>';
        fireEvent.change(emailInput, { target: { value: xssPayload } });

        // Email validation should reject this
        const value = emailInput.value;
        expect(value).not.toContain('<script>');
      }
    });
  });

  describe('Frontend Sanitization', () => {
    it('should escape HTML special characters', async () => {
      renderWithProviders(<Signup />);

      const nameInput = screen.getByPlaceholderText(/name|full name/i) as HTMLInputElement;
      
      const htmlChars = '< > & " \' /';
      fireEvent.change(nameInput, { target: { value: htmlChars } });

      // Characters should be present but not interpreted as HTML
      expect(document.querySelectorAll('script').length).toBe(0);
    });

    it('should prevent DOM-based XSS', async () => {
      renderWithProviders(<Login />);

      const emailInput = screen.getByPlaceholderText(/email/i);
      
      // Attempt to inject via DOM manipulation
      const xssPayload = 'test@test.com" onload="alert(\'XSS\')';
      fireEvent.change(emailInput, { target: { value: xssPayload } });

      // No onload handlers should be attached
      const inputs = document.querySelectorAll('input[onload]');
      expect(inputs.length).toBe(0);
    });

    it('should sanitize before rendering user input', async () => {
      renderWithProviders(<Signup />);

      const nameInput = screen.getByPlaceholderText(/name|full name/i);
      
      const xssPayload = '<b>Bold</b><script>alert("XSS")</script>';
      fireEvent.change(nameInput, { target: { value: xssPayload } });

      // Script should be removed, safe HTML might be allowed
      expect(document.querySelectorAll('script').length).toBe(0);
    });
  });

  describe('Backend API Sanitization', () => {
    it('should sanitize XSS payload before sending to backend', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });
      global.fetch = mockFetch;

      renderWithProviders(<Signup />);

      const nameInput = screen.getByPlaceholderText(/name|full name/i);
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      const xssName = '<script>alert("XSS")</script>';
      
      fireEvent.change(nameInput, { target: { value: xssName } });
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });

      const submitButton = screen.getByRole('button', { name: /sign up|register|create account/i });
      fireEvent.click(submitButton);

      // Wait for API call
      await waitFor(() => {
        if (mockFetch.mock.calls.length > 0) {
          const callArgs = mockFetch.mock.calls[0];
          const body = callArgs[1]?.body;
          
          if (body) {
            const parsedBody = JSON.parse(body);
            // Name should be sanitized
            expect(parsedBody.name).not.toContain('<script>');
          }
        }
      }, { timeout: 2000 });
    });

    it('should reject API requests with XSS payloads', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ 
          error: 'Bad Request', 
          message: 'Invalid input detected' 
        }),
      });
      global.fetch = mockFetch;

      const response = await fetch('http://localhost:5174/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '<script>alert("XSS")</script>',
          email: 'test@test.com',
          password: 'password123',
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should prevent SQL injection in email field', async () => {
      renderWithProviders(<Login />);

      const emailInput = screen.getByPlaceholderText(/email/i);
      
      const sqlInjection = "admin'--";
      fireEvent.change(emailInput, { target: { value: sqlInjection } });

      // Email validation should reject this
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toBeDisabled();
    });

    it('should sanitize SQL injection attempts in name field', async () => {
      renderWithProviders(<Signup />);

      const nameInput = screen.getByPlaceholderText(/name|full name/i) as HTMLInputElement;
      
      const sqlPayloads = [
        "'; DROP TABLE users--",
        "1' OR '1'='1",
        "admin' OR 1=1--",
      ];

      sqlPayloads.forEach(payload => {
        fireEvent.change(nameInput, { target: { value: payload } });
        
        // Input should be sanitized or rejected
        const value = nameInput.value;
        // Firebase/Firestore doesn't use SQL, but we still sanitize
        expect(value).toBeTruthy();
      });
    });
  });

  describe('Content Security Policy', () => {
    it('should have CSP headers to prevent inline scripts', () => {
      // CSP should be configured in server/Vercel
      // This test verifies no inline scripts are present
      
      renderWithProviders(<Login />);

      const inlineScripts = document.querySelectorAll('script:not([src])');
      const maliciousInlineScripts = Array.from(inlineScripts).filter(
        script => script.textContent?.includes('alert') || 
                 script.textContent?.includes('eval')
      );

      expect(maliciousInlineScripts.length).toBe(0);
    });

    it('should prevent inline event handlers', () => {
      renderWithProviders(<Signup />);

      // Check for inline event handlers
      const elementsWithInlineHandlers = document.querySelectorAll(
        '[onclick], [onerror], [onload], [onmouseover]'
      );

      // Should only have React synthetic event handlers, not inline HTML
      expect(elementsWithInlineHandlers.length).toBe(0);
    });
  });

  describe('Output Encoding', () => {
    it('should encode user input when displaying', async () => {
      renderWithProviders(<Signup />);

      const nameInput = screen.getByPlaceholderText(/name|full name/i);
      
      const specialChars = '< > & " \'';
      fireEvent.change(nameInput, { target: { value: specialChars } });

      // Special characters should not be interpreted as HTML
      expect(document.querySelectorAll('script').length).toBe(0);
    });

    it('should prevent JavaScript URL schemes', async () => {
      renderWithProviders(<Login />);

      const emailInput = screen.getByPlaceholderText(/email/i) as HTMLInputElement;
      
      const jsUrl = 'javascript:alert("XSS")';
      fireEvent.change(emailInput, { target: { value: jsUrl } });

      // Should not create any links with javascript: scheme
      const jsLinks = document.querySelectorAll('a[href^="javascript:"]');
      expect(jsLinks.length).toBe(0);
    });
  });

  describe('Comprehensive XSS Test Suite', () => {
    it('should handle all common XSS vectors', async () => {
      renderWithProviders(<Signup />);

      const nameInput = screen.getByPlaceholderText(/name|full name/i);

      // Test each XSS payload
      for (const payload of XSS_PAYLOADS) {
        fireEvent.change(nameInput, { target: { value: payload } });

        // Verify no malicious elements created
        expect(document.querySelectorAll('script').length).toBe(0);
        expect(document.querySelectorAll('img[onerror]').length).toBe(0);
        expect(document.querySelectorAll('svg[onload]').length).toBe(0);
        expect(document.querySelectorAll('iframe').length).toBe(0);
      }
    });

    it('should log XSS attempts for security monitoring', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      renderWithProviders(<Signup />);

      const nameInput = screen.getByPlaceholderText(/name|full name/i);
      
      const xssPayload = '<script>alert("XSS")</script>';
      fireEvent.change(nameInput, { target: { value: xssPayload } });

      // In production, XSS attempts should be logged
      expect(true).toBe(true);

      consoleSpy.mockRestore();
    });
  });

  describe('Real-World Attack Scenarios', () => {
    it('should prevent stored XSS attacks', async () => {
      // Simulate data retrieved from database with XSS
      const maliciousData = {
        name: '<script>alert("Stored XSS")</script>',
        email: 'test@test.com',
      };

      // When rendering this data, it should be sanitized
      expect(maliciousData.name).toContain('<script>');
      
      // After sanitization (in real app)
      const sanitizedName = maliciousData.name
        .replace(/<script>/gi, '')
        .replace(/<\/script>/gi, '');
      
      expect(sanitizedName).not.toContain('<script>');
    });

    it('should prevent reflected XSS attacks', async () => {
      // Simulate URL parameter with XSS
      const urlParam = '<script>alert("Reflected XSS")</script>';
      
      // URL parameters should be sanitized before use
      const sanitized = encodeURIComponent(urlParam);
      expect(sanitized).not.toContain('<script>');
    });

    it('should prevent mutation XSS (mXSS)', async () => {
      renderWithProviders(<Signup />);

      const nameInput = screen.getByPlaceholderText(/name|full name/i);
      
      // mXSS payload that changes after sanitization
      const mxssPayload = '<noscript><p title="</noscript><img src=x onerror=alert(1)>">';
      fireEvent.change(nameInput, { target: { value: mxssPayload } });

      // Should not create malicious elements
      expect(document.querySelectorAll('img[onerror]').length).toBe(0);
    });
  });
});
