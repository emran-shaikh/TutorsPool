import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { errorLogger } from '@/lib/errorLogger';

const ErrorTest: React.FC = () => {
  const { logError, logWarning, logInfo } = useErrorLogger({ 
    component: 'ErrorTest',
    action: 'test_errors'
  });

  const triggerJavaScriptError = () => {
    // This will trigger an unhandled error
    throw new Error('This is a test JavaScript error');
  };

  const triggerPromiseRejection = () => {
    // This will trigger an unhandled promise rejection
    Promise.reject(new Error('This is a test promise rejection'));
  };

  const triggerLoggedError = () => {
    logError(new Error('This is a logged error from ErrorTest component'));
  };

  const triggerLoggedWarning = () => {
    logWarning('This is a logged warning from ErrorTest component');
  };

  const triggerLoggedInfo = () => {
    logInfo('This is a logged info message from ErrorTest component');
  };

  const triggerNetworkError = async () => {
    try {
      // This will trigger a network error
      await fetch('/api/nonexistent-endpoint');
    } catch (error) {
      logError(error as Error, { action: 'network_request' });
    }
  };

  const checkErrorQueue = () => {
    const queue = errorLogger.getErrorQueue();
    console.log('Current error queue:', queue);
    alert(`Error queue has ${queue.length} errors. Check console for details.`);
  };

  const forceFlushErrors = async () => {
    try {
      await errorLogger.forceFlush();
      alert('Errors flushed to server successfully!');
    } catch (error) {
      alert('Failed to flush errors: ' + (error as Error).message);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Error Logging Test Page</CardTitle>
          <CardDescription>
            Test the error logging system by triggering different types of errors.
            Check the browser console and server logs to see the errors being captured.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-red-600">Unhandled Errors</h3>
              <Button 
                onClick={triggerJavaScriptError}
                variant="destructive"
                className="w-full"
              >
                Trigger JavaScript Error
              </Button>
              <Button 
                onClick={triggerPromiseRejection}
                variant="destructive"
                className="w-full"
              >
                Trigger Promise Rejection
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-blue-600">Logged Errors</h3>
              <Button 
                onClick={triggerLoggedError}
                variant="outline"
                className="w-full"
              >
                Log Error
              </Button>
              <Button 
                onClick={triggerLoggedWarning}
                variant="outline"
                className="w-full"
              >
                Log Warning
              </Button>
              <Button 
                onClick={triggerLoggedInfo}
                variant="outline"
                className="w-full"
              >
                Log Info
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-orange-600">Network Errors</h3>
              <Button 
                onClick={triggerNetworkError}
                variant="outline"
                className="w-full"
              >
                Trigger Network Error
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-green-600">Error Management</h3>
              <Button 
                onClick={checkErrorQueue}
                variant="outline"
                className="w-full"
              >
                Check Error Queue
              </Button>
              <Button 
                onClick={forceFlushErrors}
                variant="outline"
                className="w-full"
              >
                Force Flush Errors
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Click any button to trigger different types of errors</li>
              <li>Check the browser console to see client-side error logging</li>
              <li>Check the server console to see server-side error logging</li>
              <li>Visit <code>/admin/errors</code> to see the error monitoring dashboard</li>
              <li>Use "Check Error Queue" to see errors waiting to be sent</li>
              <li>Use "Force Flush Errors" to manually send errors to the server</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorTest;
