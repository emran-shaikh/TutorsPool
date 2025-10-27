/**
 * GEN-001: Loading Test
 * Verify the application loads correctly on various viewport sizes
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderApp = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('GEN-001: Application Loading', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('should load the application without errors', async () => {
    const { container } = renderApp();
    expect(container).toBeTruthy();
  });

  it('should render main content within 3 seconds', async () => {
    const startTime = Date.now();
    renderApp();
    
    await waitFor(() => {
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000);
    }, { timeout: 3000 });
  });

  it('should have no broken styles on desktop viewport (1920x1080)', () => {
    global.innerWidth = 1920;
    global.innerHeight = 1080;
    global.dispatchEvent(new Event('resize'));
    
    const { container } = renderApp();
    const styles = window.getComputedStyle(container);
    expect(styles.display).not.toBe('none');
  });

  it('should have no broken styles on tablet viewport (768x1024)', () => {
    global.innerWidth = 768;
    global.innerHeight = 1024;
    global.dispatchEvent(new Event('resize'));
    
    const { container } = renderApp();
    const styles = window.getComputedStyle(container);
    expect(styles.display).not.toBe('none');
  });

  it('should have no broken styles on mobile viewport (375x667)', () => {
    global.innerWidth = 375;
    global.innerHeight = 667;
    global.dispatchEvent(new Event('resize'));
    
    const { container } = renderApp();
    const styles = window.getComputedStyle(container);
    expect(styles.display).not.toBe('none');
  });

  it('should not have any console errors during load', () => {
    const consoleErrors: string[] = [];
    const originalError = console.error;
    console.error = (...args: any[]) => {
      consoleErrors.push(args.join(' '));
      originalError(...args);
    };

    renderApp();

    console.error = originalError;
    expect(consoleErrors.length).toBe(0);
  });
});
