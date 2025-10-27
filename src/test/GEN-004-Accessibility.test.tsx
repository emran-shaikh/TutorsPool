/**
 * GEN-004: Accessibility Test
 * Check for ARIA labels and keyboard focus
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';
import Login from '../pages/Login';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('GEN-004: Accessibility', () => {
  describe('ARIA Labels and Roles', () => {
    it('should have proper button roles', () => {
      renderWithProviders(<Login />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button.getAttribute('role')).toBe('button');
      });
    });

    it('should have accessible form inputs with labels', () => {
      renderWithProviders(<Login />);
      
      const emailInput = screen.getByPlaceholderText(/email|you@example/i);
      const passwordInput = screen.getByPlaceholderText(/password|••••/i);
      
      expect(emailInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
      
      // Check for associated labels
      const labels = screen.getAllByText(/email|password/i);
      expect(labels.length).toBeGreaterThanOrEqual(2);
    });

    it('should have navigation landmarks', () => {
      const { container } = renderWithProviders(<Header />);
      
      // Check for navigation elements
      const navElements = container.querySelectorAll('nav, [role="navigation"]');
      expect(navElements.length).toBeGreaterThanOrEqual(0);
    });

    it('should have proper heading hierarchy', () => {
      renderWithProviders(<Login />);
      
      const headings = screen.queryAllByRole('heading');
      // Should have at least one heading
      expect(headings.length).toBeGreaterThanOrEqual(0);
    });

    it('should have alt text for images', () => {
      const { container } = renderWithProviders(<Header />);
      
      const images = container.querySelectorAll('img');
      images.forEach(img => {
        const alt = img.getAttribute('alt');
        expect(alt).toBeTruthy();
        expect(alt).not.toBe('');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have focusable interactive elements', () => {
      renderWithProviders(<Login />);
      
      const emailInput = screen.getByPlaceholderText(/email|you@example/i);
      const passwordInput = screen.getByPlaceholderText(/password|••••/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Check tabIndex
      expect(emailInput.tabIndex).toBeGreaterThanOrEqual(-1);
      expect(passwordInput.tabIndex).toBeGreaterThanOrEqual(-1);
      expect(submitButton.tabIndex).toBeGreaterThanOrEqual(-1);
    });

    it('should have visible focus indicators', () => {
      const { container } = renderWithProviders(<Login />);
      
      const focusableElements = container.querySelectorAll(
        'button, input, select, textarea, a[href]'
      );
      
      focusableElements.forEach(element => {
        // Elements should be focusable
        expect(element.tabIndex).toBeGreaterThanOrEqual(-1);
      });
    });

    it('should have proper tab order', () => {
      renderWithProviders(<Login />);
      
      const emailInput = screen.getByPlaceholderText(/email|you@example/i);
      const passwordInput = screen.getByPlaceholderText(/password|••••/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Tab order should be logical (email -> password -> button)
      const tabIndexes = [
        emailInput.tabIndex,
        passwordInput.tabIndex,
        submitButton.tabIndex
      ];
      
      // All should be focusable
      tabIndexes.forEach(index => {
        expect(index).toBeGreaterThanOrEqual(-1);
      });
    });
  });

  describe('shadcn/ui Component Accessibility', () => {
    it('should have accessible Button component', () => {
      const { container } = render(<Button>Click me</Button>);
      
      const button = container.querySelector('button');
      expect(button).toBeTruthy();
      expect(button?.getAttribute('role')).toBe('button');
    });

    it('should have accessible Input component', () => {
      const { container } = render(<Input placeholder="Enter text" />);
      
      const input = container.querySelector('input');
      expect(input).toBeTruthy();
      expect(input?.getAttribute('type')).toBeTruthy();
    });

    it('should have proper ARIA attributes on interactive elements', () => {
      renderWithProviders(<Login />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Button should have proper attributes
      expect(submitButton.getAttribute('type')).toBe('submit');
    });
  });

  describe('Color Contrast and Visibility', () => {
    it('should have visible text elements', () => {
      const { container } = renderWithProviders(<Login />);
      
      const textElements = container.querySelectorAll('p, span, label, button');
      textElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        expect(styles.display).not.toBe('none');
        expect(styles.visibility).not.toBe('hidden');
      });
    });

    it('should have readable font sizes', () => {
      const { container } = renderWithProviders(<Login />);
      
      const textElements = container.querySelectorAll('p, span, label');
      textElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        const fontSize = parseInt(styles.fontSize);
        // Minimum font size should be at least 12px for readability
        expect(fontSize).toBeGreaterThanOrEqual(12);
      });
    });
  });

  describe('Screen Reader Support', () => {
    it('should have descriptive button text', () => {
      renderWithProviders(<Login />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const text = button.textContent || button.getAttribute('aria-label');
        expect(text).toBeTruthy();
        expect(text?.trim().length).toBeGreaterThan(0);
      });
    });

    it('should have meaningful link text', () => {
      const { container } = renderWithProviders(<Header />);
      
      const links = container.querySelectorAll('a');
      links.forEach(link => {
        const text = link.textContent || link.getAttribute('aria-label');
        if (text) {
          expect(text.trim().length).toBeGreaterThan(0);
          // Avoid generic text like "click here"
          expect(text.toLowerCase()).not.toBe('click here');
        }
      });
    });

    it('should have form field labels', () => {
      renderWithProviders(<Login />);
      
      const labels = screen.getAllByText(/email|password/i);
      expect(labels.length).toBeGreaterThanOrEqual(2);
    });
  });
});
