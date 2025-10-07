// Analytics and monitoring utilities for production
import { inject } from '@vercel/analytics';

// Initialize Vercel Analytics in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  inject();
}

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

class Analytics {
  private isProduction = process.env.NODE_ENV === 'production';
  private isClient = typeof window !== 'undefined';

  // Track custom events
  track(event: AnalyticsEvent) {
    if (!this.isClient) return;

    if (this.isProduction) {
      // In production, send to analytics service
      console.log('Analytics Event:', event);
      
      // You can integrate with Google Analytics, Mixpanel, etc.
      if (window.gtag) {
        window.gtag('event', event.action, {
          event_category: event.category,
          event_label: event.label,
          value: event.value
        });
      }
    } else {
      // In development, just log
      console.log('🔍 Analytics Event:', event);
    }
  }

  // Track page views
  trackPageView(path: string) {
    this.track({
      action: 'page_view',
      category: 'navigation',
      label: path
    });
  }

  // Track user actions
  trackUserAction(action: string, details?: string) {
    this.track({
      action,
      category: 'user_action',
      label: details
    });
  }

  // Track errors
  trackError(error: Error, context?: string) {
    this.track({
      action: 'error',
      category: 'exception',
      label: `${context || 'unknown'}: ${error.message}`
    });
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number) {
    this.track({
      action: metric,
      category: 'performance',
      value
    });
  }

  // Track business metrics
  trackBusinessMetric(action: string, value?: number) {
    this.track({
      action,
      category: 'business',
      value
    });
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Export individual tracking functions for convenience
export const trackPageView = (path: string) => analytics.trackPageView(path);
export const trackUserAction = (action: string, details?: string) => analytics.trackUserAction(action, details);
export const trackError = (error: Error, context?: string) => analytics.trackError(error, context);
export const trackPerformance = (metric: string, value: number) => analytics.trackPerformance(metric, value);
export const trackBusinessMetric = (action: string, value?: number) => analytics.trackBusinessMetric(action, value);

// Global error tracking
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    analytics.trackError(event.error, 'global_error');
  });

  window.addEventListener('unhandledrejection', (event) => {
    analytics.trackError(new Error(event.reason), 'unhandled_promise_rejection');
  });
}

// Declare global gtag function for TypeScript
declare global {
  interface Window {
    gtag: (command: string, action: string, parameters?: any) => void;
  }
}
