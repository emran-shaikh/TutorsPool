import { useCallback } from 'react';
import { errorLogger } from '@/lib/errorLogger';

interface UseErrorLoggerOptions {
  component: string;
  action?: string;
}

export const useErrorLogger = (options: UseErrorLoggerOptions) => {
  const { component, action } = options;

  const logError = useCallback((error: Error | string, metadata?: Record<string, any>) => {
    const message = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'string' ? undefined : error.stack;

    errorLogger.logError({
      message,
      stack,
      component,
      action,
      metadata,
    });
  }, [component, action]);

  const logWarning = useCallback((message: string, metadata?: Record<string, any>) => {
    errorLogger.logWarning({
      message,
      component,
      action,
      metadata,
    });
  }, [component, action]);

  const logInfo = useCallback((message: string, metadata?: Record<string, any>) => {
    errorLogger.logInfo({
      message,
      component,
      action,
      metadata,
    });
  }, [component, action]);

  return {
    logError,
    logWarning,
    logInfo,
  };
};
