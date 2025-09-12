# Error Logging System - Tutorspool

## 🎯 Overview

The Tutorspool application now includes a comprehensive error logging system that captures, tracks, and monitors errors across both client and server sides. This system helps identify and fix issues that users encounter while using the application.

## 🏗️ Architecture

### Client-Side Error Logging
- **ErrorLogger Class**: Captures JavaScript errors, promise rejections, and custom errors
- **Error Boundary**: React component that catches and logs React component errors
- **useErrorLogger Hook**: Easy-to-use hook for logging errors in components
- **Automatic Error Capture**: Unhandled errors and promise rejections are automatically captured

### Server-Side Error Logging
- **API Endpoints**: `/api/logs/client-errors` and `/api/logs/server-error`
- **Structured Logging**: Errors are logged with context, user information, and metadata
- **Admin Dashboard**: Real-time error monitoring and management

## 📁 Files Created/Modified

### New Files
- `src/lib/errorLogger.ts` - Core error logging system
- `src/components/ErrorBoundary.tsx` - React error boundary component
- `src/hooks/useErrorLogger.ts` - React hook for error logging
- `src/pages/admin/ErrorMonitoring.tsx` - Admin error monitoring dashboard
- `src/pages/ErrorTest.tsx` - Test page for error logging system

### Modified Files
- `src/App.tsx` - Added ErrorBoundary and new routes
- `src/contexts/AuthContext.tsx` - Integrated error logging with user sessions
- `src/pages/TutorProfile.tsx` - Added error logging to component
- `server/index.ts` - Added error logging API endpoints

## 🚀 How to Use

### 1. Access Error Test Page
Visit `http://localhost:8080/error-test` to test the error logging system.

### 2. Access Admin Error Dashboard
Visit `http://localhost:8080/admin/errors` (requires admin login) to view error logs.

### 3. Using Error Logging in Components

```typescript
import { useErrorLogger } from '@/hooks/useErrorLogger';

const MyComponent = () => {
  const { logError, logWarning, logInfo } = useErrorLogger({ 
    component: 'MyComponent',
    action: 'user_action'
  });

  const handleSomething = async () => {
    try {
      // Some operation that might fail
      await riskyOperation();
    } catch (error) {
      logError(error as Error, { 
        action: 'risky_operation',
        metadata: { additionalInfo: 'value' }
      });
    }
  };
};
```

### 4. Manual Error Logging

```typescript
import { errorLogger } from '@/lib/errorLogger';

// Log an error
errorLogger.logError({
  message: 'Something went wrong',
  component: 'MyComponent',
  action: 'user_action',
  metadata: { userId: '123' }
});

// Log a warning
errorLogger.logWarning({
  message: 'This is a warning',
  component: 'MyComponent'
});

// Log info
errorLogger.logInfo({
  message: 'User performed action',
  component: 'MyComponent'
});
```

## 🔍 Error Types Captured

### Automatic Capture
- **JavaScript Errors**: Unhandled exceptions and runtime errors
- **Promise Rejections**: Unhandled promise rejections
- **React Errors**: Component errors caught by ErrorBoundary
- **Network Errors**: Failed API requests

### Manual Capture
- **Custom Errors**: Application-specific errors
- **Warnings**: Non-critical issues
- **Info Messages**: User actions and events

## 📊 Error Data Structure

Each error log contains:
```typescript
interface ErrorLog {
  id: string;                    // Unique error ID
  timestamp: string;             // When the error occurred
  type: 'error' | 'warning' | 'info';
  level: 'client' | 'server';
  message: string;              // Error message
  stack?: string;               // Stack trace
  url: string;                  // Page URL where error occurred
  userAgent: string;            // Browser information
  userId?: string;              // User ID (if logged in)
  sessionId: string;            // Session ID
  component?: string;           // React component name
  action?: string;              // User action that triggered error
  metadata?: Record<string, any>; // Additional context
}
```

## 🛠️ Error Monitoring Dashboard

The admin dashboard provides:
- **Real-time Error Viewing**: See errors as they occur
- **Error Filtering**: Filter by type, component, or time
- **Error Statistics**: Count and frequency of errors
- **User Context**: See which users are experiencing errors
- **Local Queue Management**: View and manage errors waiting to be sent

## 🔧 Configuration

### Error Queue Settings
- **Max Queue Size**: 100 errors (configurable)
- **Flush Interval**: 30 seconds (configurable)
- **Offline Support**: Errors are queued when offline and sent when online

### Server Endpoints
- `POST /api/logs/client-errors` - Receive client errors
- `POST /api/logs/server-error` - Log server errors
- `GET /api/logs/errors` - Get error logs (admin only)

## 🐛 Common Errors to Monitor

### Client-Side Errors
1. **Component Errors**: React component crashes
2. **API Errors**: Failed network requests
3. **Navigation Errors**: Routing issues
4. **Form Validation Errors**: User input issues
5. **Authentication Errors**: Login/logout problems

### Server-Side Errors
1. **Database Errors**: Data access issues
2. **Authentication Errors**: Token validation failures
3. **Validation Errors**: Input validation failures
4. **Rate Limiting**: Too many requests
5. **File Upload Errors**: Media upload issues

## 📈 Error Analysis

### Key Metrics to Track
- **Error Frequency**: How often errors occur
- **Error Types**: Most common error types
- **User Impact**: Which users are affected
- **Component Issues**: Which components have most errors
- **Performance Impact**: Errors affecting user experience

### Error Patterns to Look For
- **Spike Patterns**: Sudden increases in errors
- **User-Specific**: Errors affecting specific users
- **Browser-Specific**: Errors in specific browsers
- **Time-Based**: Errors occurring at specific times
- **Feature-Specific**: Errors in specific features

## 🚨 Alerting (Future Enhancement)

Consider implementing:
- **Email Alerts**: For critical errors
- **Slack Notifications**: For development team
- **Error Thresholds**: Automatic alerts when error rates exceed limits
- **User Impact Alerts**: When errors affect multiple users

## 🔄 Maintenance

### Regular Tasks
1. **Monitor Error Dashboard**: Check daily for new errors
2. **Analyze Error Patterns**: Look for trends and patterns
3. **Fix High-Priority Errors**: Address errors affecting user experience
4. **Update Error Handling**: Improve error handling based on logs
5. **Clean Up Old Logs**: Archive or delete old error logs

### Error Resolution Process
1. **Identify Error**: Use dashboard to identify the error
2. **Reproduce Error**: Try to reproduce the error locally
3. **Fix Error**: Implement the fix
4. **Test Fix**: Verify the fix works
5. **Monitor**: Watch for the error to stop occurring

## 🎉 Benefits

- **Proactive Issue Detection**: Find problems before users report them
- **Better User Experience**: Fix issues quickly
- **Data-Driven Decisions**: Make improvements based on real error data
- **Reduced Support Load**: Fewer user complaints about bugs
- **Improved Reliability**: More stable application over time

## 🔗 Related Documentation

- [React Error Boundaries](https://reactjs.org/docs/error-boundaries.html)
- [JavaScript Error Handling](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- [Error Monitoring Best Practices](https://sentry.io/for/javascript/)

---

**Note**: This error logging system is designed to help improve the application's reliability and user experience. Regular monitoring and maintenance are essential for its effectiveness.
