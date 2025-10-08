import { useEffect } from 'react';
import { trackPerformance } from '@/lib/analytics';

export const PerformanceMonitor = () => {
  useEffect(() => {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        trackPerformance('LCP', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          trackPerformance('FID', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        trackPerformance('CLS', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // First Contentful Paint (FCP)
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          trackPerformance('FCP', entry.startTime);
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Time to Interactive (TTI) approximation
      const ttiObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            const tti = navEntry.domContentLoadedEventEnd - navEntry.fetchStart;
            trackPerformance('TTI', tti);
          }
        });
      });
      ttiObserver.observe({ entryTypes: ['navigation'] });

      // Cleanup observers on unmount
      return () => {
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
        fcpObserver.disconnect();
        ttiObserver.disconnect();
      };
    }

    // Fallback: Basic performance monitoring
    const basicPerformanceMonitoring = () => {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        const domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart;
        
        trackPerformance('LoadTime', loadTime);
        trackPerformance('DOMReadyTime', domReadyTime);
      }
    };

    // Run basic monitoring after page load
    if (document.readyState === 'complete') {
      basicPerformanceMonitoring();
    } else {
      window.addEventListener('load', basicPerformanceMonitoring);
    }

    return () => {
      window.removeEventListener('load', basicPerformanceMonitoring);
    };
  }, []);

  return null; // This component doesn't render anything
};

// Hook for monitoring component render performance
export const useRenderPerformance = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // Only track if render takes longer than one frame (16ms)
        trackPerformance(`Render_${componentName}`, renderTime);
      }
    };
  });
};

// Hook for monitoring API call performance
export const useAPIPerformance = () => {
  const trackAPICall = async <T,>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      trackPerformance(`API_${endpoint}`, duration);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      trackPerformance(`API_${endpoint}_ERROR`, duration);
      
      throw error;
    }
  };

  return { trackAPICall };
};
