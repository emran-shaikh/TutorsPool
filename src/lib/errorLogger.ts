// Error logging system for Tutorspool
interface ErrorLog {
  id: string;
  timestamp: string;
  type: 'error' | 'warning' | 'info';
  level: 'client' | 'server';
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

class ErrorLogger {
  private sessionId: string;
  private userId?: string;
  private errorQueue: ErrorLog[] = [];
  private maxQueueSize = 100;
  private flushInterval = 30000; // 30 seconds
  private isOnline = navigator.onLine;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupEventListeners();
    this.startPeriodicFlush();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrors();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Listen for unhandled errors
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        component: 'global',
        action: 'unhandled_error',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      });
    });

    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        component: 'global',
        action: 'unhandled_promise_rejection',
        metadata: {
          reason: event.reason,
        }
      });
    });
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  logError(errorData: Partial<ErrorLog>): void {
    const errorLog: ErrorLog = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      type: 'error',
      level: 'client',
      message: errorData.message || 'Unknown error',
      stack: errorData.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.userId,
      sessionId: this.sessionId,
      component: errorData.component,
      action: errorData.action,
      metadata: errorData.metadata,
    };

    this.addToQueue(errorLog);
    this.logToConsole(errorLog);
  }

  logWarning(warningData: Partial<ErrorLog>): void {
    const warningLog: ErrorLog = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      type: 'warning',
      level: 'client',
      message: warningData.message || 'Unknown warning',
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.userId,
      sessionId: this.sessionId,
      component: warningData.component,
      action: warningData.action,
      metadata: warningData.metadata,
    };

    this.addToQueue(warningLog);
    this.logToConsole(warningLog);
  }

  logInfo(infoData: Partial<ErrorLog>): void {
    const infoLog: ErrorLog = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      type: 'info',
      level: 'client',
      message: infoData.message || 'Info message',
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.userId,
      sessionId: this.sessionId,
      component: infoData.component,
      action: infoData.action,
      metadata: infoData.metadata,
    };

    this.addToQueue(infoLog);
    this.logToConsole(infoLog);
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addToQueue(errorLog: ErrorLog): void {
    this.errorQueue.push(errorLog);
    
    // Keep queue size manageable
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(-this.maxQueueSize);
    }

    // Try to flush immediately if online
    if (this.isOnline) {
      this.flushErrors();
    }
  }

  private logToConsole(errorLog: ErrorLog): void {
    const logMethod = errorLog.type === 'error' ? 'error' : 
                     errorLog.type === 'warning' ? 'warn' : 'info';
    
    console[logMethod](`[${errorLog.type.toUpperCase()}] ${errorLog.component || 'Global'}:`, {
      message: errorLog.message,
      component: errorLog.component,
      action: errorLog.action,
      metadata: errorLog.metadata,
      timestamp: errorLog.timestamp,
      sessionId: errorLog.sessionId,
    });
  }

  private startPeriodicFlush(): void {
    setInterval(() => {
      if (this.isOnline && this.errorQueue.length > 0) {
        this.flushErrors();
      }
    }, this.flushInterval);
  }

  private async flushErrors(): Promise<void> {
    if (!this.isOnline || this.errorQueue.length === 0) {
      return;
    }

    const errorsToSend = [...this.errorQueue];
    this.errorQueue = [];

    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errors: errorsToSend,
          sessionId: this.sessionId,
          userId: this.userId,
        }),
      });

      // Handle 405 errors gracefully - don't re-queue, just log locally
      if (response.status === 405) {
        console.warn('[ErrorLogger] Server endpoint not available (405), keeping errors local');
        return; // Don't re-queue errors for 405
      }

      if (!response.ok) {
        // Re-add errors to queue if sending failed (but not for 405)
        this.errorQueue.unshift(...errorsToSend);
        console.warn('Failed to send error logs to server');
      }
    } catch (error) {
      // Re-add errors to queue if sending failed
      this.errorQueue.unshift(...errorsToSend);
      console.warn('Error sending logs to server:', error);
    }
  }

  // Method to manually flush errors (useful for testing)
  async forceFlush(): Promise<void> {
    await this.flushErrors();
  }

  // Get current error queue (for debugging)
  getErrorQueue(): ErrorLog[] {
    return [...this.errorQueue];
  }

  // Clear error queue
  clearQueue(): void {
    this.errorQueue = [];
  }
}

// Create singleton instance
export const errorLogger = new ErrorLogger();

// Export types for use in other files
export type { ErrorLog };
