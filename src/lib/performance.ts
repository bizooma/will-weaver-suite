import { ENV_CONFIG } from './config';
import { logger } from './logger';

// Performance monitoring utilities
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined' && ENV_CONFIG.features.enablePerformanceMonitoring) {
      this.initializeMonitoring();
    }
  }

  private initializeMonitoring() {
    // Monitor navigation timing
    this.trackPageLoad();
    
    // Monitor resource loading
    this.trackResourceLoading();
    
    // Monitor user interactions
    this.trackUserInteractions();
    
    // Monitor API calls
    this.trackApiCalls();
  }

  private trackPageLoad() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      
      this.recordMetric('page_load_time', loadTime);
      
      if (loadTime > ENV_CONFIG.performance.maxPageLoadTime) {
        logger.warn('Slow page load detected', { loadTime, threshold: ENV_CONFIG.performance.maxPageLoadTime });
      }
    });
  }

  private trackResourceLoading() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            const loadTime = resourceEntry.responseEnd - resourceEntry.requestStart;
            
            this.recordMetric(`resource_${resourceEntry.initiatorType}_load_time`, loadTime);
            
            // Track large resources
            if (resourceEntry.transferSize > ENV_CONFIG.performance.maxImageSize) {
              logger.warn('Large resource detected', {
                name: resourceEntry.name,
                size: resourceEntry.transferSize,
                type: resourceEntry.initiatorType,
              });
            }
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    }
  }

  private trackUserInteractions() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'event') {
            const eventEntry = entry as PerformanceEventTiming;
            this.recordMetric('user_interaction_delay', eventEntry.processingStart - eventEntry.startTime);
          }
        }
      });
      
      try {
        observer.observe({ entryTypes: ['event'] });
        this.observers.push(observer);
      } catch (e) {
        // Event timing not supported in all browsers
      }
    }
  }

  private trackApiCalls() {
    // Override fetch to monitor API performance
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.recordMetric('api_response_time', duration);
        
        if (duration > ENV_CONFIG.performance.maxApiResponseTime) {
          logger.warn('Slow API response', {
            url: args[0],
            duration,
            threshold: ENV_CONFIG.performance.maxApiResponseTime,
          });
        }
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        logger.error('API request failed', error as Error, {
          url: args[0],
          duration: endTime - startTime,
        });
        throw error;
      }
    };
  }

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 values to prevent memory leaks
    if (values.length > 100) {
      values.shift();
    }
    
    // Log performance issues
    if (ENV_CONFIG.isDevelopment) {
      console.debug(`Performance metric: ${name} = ${value}ms`);
    }
  }

  getMetricSummary(name: string) {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return null;
    
    const sorted = [...values].sort((a, b) => a - b);
    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  getAllMetrics() {
    const summary: Record<string, any> = {};
    for (const [name] of this.metrics) {
      summary[name] = this.getMetricSummary(name);
    }
    return summary;
  }

  // Clean up observers
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// Web Vitals tracking
class WebVitalsMonitor {
  private vitals: Record<string, number> = {};

  constructor() {
    if (typeof window !== 'undefined') {
      this.trackCoreWebVitals();
    }
  }

  private trackCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    this.observeMetric('largest-contentful-paint', (entry) => {
      this.vitals.lcp = entry.startTime;
      if (entry.startTime > 2500) {
        logger.warn('Poor LCP detected', { lcp: entry.startTime, threshold: 2500 });
      }
    });

    // First Input Delay (FID)
    this.observeMetric('first-input', (entry) => {
      this.vitals.fid = (entry as any).processingStart - entry.startTime;
      if (this.vitals.fid > 100) {
        logger.warn('Poor FID detected', { fid: this.vitals.fid, threshold: 100 });
      }
    });

    // Cumulative Layout Shift (CLS)
    this.observeMetric('layout-shift', (entry) => {
      if (!(entry as any).hadRecentInput) {
        this.vitals.cls = (this.vitals.cls || 0) + (entry as any).value;
        if (this.vitals.cls > 0.1) {
          logger.warn('Poor CLS detected', { cls: this.vitals.cls, threshold: 0.1 });
        }
      }
    });
  }

  private observeMetric(type: string, callback: (entry: PerformanceEntry) => void) {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            callback(entry);
          }
        });
        observer.observe({ entryTypes: [type] });
      } catch (e) {
        // Metric not supported
      }
    }
  }

  getVitals() {
    return { ...this.vitals };
  }
}

export const performanceMonitor = new PerformanceMonitor();
export const webVitalsMonitor = new WebVitalsMonitor();
