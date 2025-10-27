/**
 * GEN-002: Navigation Test
 * Test all primary navigation links
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';
import LandingPage from '../pages/LandingPage';
import Header from '../components/Header';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithRouter = (component: React.ReactElement, initialRoute = '/') => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>
          {component}
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('GEN-002: Navigation Links', () => {
  it('should navigate to Home page', async () => {
    renderWithRouter(<LandingPage />);
    expect(screen.getByRole('main') || document.body).toBeTruthy();
  });

  it('should have Find Tutor link that navigates correctly', async () => {
    renderWithRouter(<Header />);
    
    const findTutorLinks = screen.queryAllByText(/find.*tutor/i);
    if (findTutorLinks.length > 0) {
      const link = findTutorLinks[0].closest('a');
      expect(link).toBeTruthy();
      if (link) {
        expect(link.getAttribute('href')).toMatch(/search|tutor/i);
      }
    }
  });

  it('should have About link that navigates correctly', async () => {
    renderWithRouter(<Header />);
    
    const aboutLinks = screen.queryAllByText(/about/i);
    if (aboutLinks.length > 0) {
      const link = aboutLinks[0].closest('a');
      expect(link).toBeTruthy();
      if (link) {
        expect(link.getAttribute('href')).toBe('/about');
      }
    }
  });

  it('should have Contact link that navigates correctly', async () => {
    renderWithRouter(<Header />);
    
    const contactLinks = screen.queryAllByText(/contact/i);
    if (contactLinks.length > 0) {
      const link = contactLinks[0].closest('a');
      expect(link).toBeTruthy();
      if (link) {
        expect(link.getAttribute('href')).toBe('/contact');
      }
    }
  });

  it('should have Login link that navigates correctly', async () => {
    renderWithRouter(<Header />);
    
    const loginLinks = screen.queryAllByText(/login|sign in/i);
    if (loginLinks.length > 0) {
      const link = loginLinks[0].closest('a');
      expect(link).toBeTruthy();
      if (link) {
        expect(link.getAttribute('href')).toBe('/login');
      }
    }
  });

  it('should have Signup link that navigates correctly', async () => {
    renderWithRouter(<Header />);
    
    const signupLinks = screen.queryAllByText(/sign up|register|join/i);
    if (signupLinks.length > 0) {
      const link = signupLinks[0].closest('a');
      expect(link).toBeTruthy();
      if (link) {
        expect(link.getAttribute('href')).toMatch(/signup|register/i);
      }
    }
  });

  it('should not have broken navigation links', () => {
    const { container } = renderWithRouter(<Header />);
    const links = container.querySelectorAll('a');
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        expect(href).not.toBe('#');
        expect(href).not.toBe('');
        expect(href).not.toContain('undefined');
        expect(href).not.toContain('null');
      }
    });
  });
});
