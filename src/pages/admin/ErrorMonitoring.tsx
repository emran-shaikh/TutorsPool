import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api';
import { errorLogger } from '@/lib/errorLogger';

interface ErrorLog {
  id: string;
  timestamp: string;
  type: 'error' | 'warning' | 'info';
  level: 'client' | 'server';
  message: string;
  component?: string;
  action?: string;
  url: string;
  userId?: string;
  sessionId: string;
  count?: number;
}

const ErrorMonitoring: React.FC = () => {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [localErrors, setLocalErrors] = useState<ErrorLog[]>([]);

  useEffect(() => {
    fetchErrors();
    // Get local errors from error logger
    setLocalErrors(errorLogger.getErrorQueue());
  }, []);

  const fetchErrors = async () => {
    try {
      const response = await apiClient.request('/logs/errors');
      setErrors(response.errors || []);
    } catch (error) {
      console.error('Failed to fetch error logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getErrorTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'default';
      default: return 'outline';
    }
  };

  const getLevelColor = (level: string) => {
    return level === 'client' ? 'default' : 'secondary';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const clearLocalErrors = () => {
    errorLogger.clearQueue();
    setLocalErrors([]);
  };

  const forceFlushErrors = async () => {
    try {
      await errorLogger.forceFlush();
      setLocalErrors([]);
    } catch (error) {
      console.error('Failed to flush errors:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Error Monitoring</h1>
        <p className="text-gray-600 mt-2">
          Monitor and track errors across the application
        </p>
      </div>

      <Tabs defaultValue="server" className="space-y-4">
        <TabsList>
          <TabsTrigger value="server">Server Errors</TabsTrigger>
          <TabsTrigger value="client">Client Errors</TabsTrigger>
          <TabsTrigger value="local">Local Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="server" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Server Error Logs</CardTitle>
              <CardDescription>
                Errors logged on the server side
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errors.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No server errors found. Great job! 🎉
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {errors.map((error) => (
                    <div key={error.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getErrorTypeColor(error.type)}>
                            {error.type.toUpperCase()}
                          </Badge>
                          <Badge variant={getLevelColor(error.level)}>
                            {error.level}
                          </Badge>
                          {error.count && (
                            <Badge variant="outline">
                              {error.count} occurrences
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatTimestamp(error.timestamp)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{error.message}</p>
                        {error.component && (
                          <p className="text-sm text-gray-600">
                            Component: {error.component}
                            {error.action && ` • Action: ${error.action}`}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          URL: {error.url}
                        </p>
                        {error.userId && (
                          <p className="text-sm text-gray-500">
                            User: {error.userId} • Session: {error.sessionId}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="client" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Error Logs</CardTitle>
              <CardDescription>
                Errors captured from client-side JavaScript
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  Client errors are automatically captured and sent to the server.
                  Check the browser console for real-time error logging.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="local" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Local Error Queue</CardTitle>
              <CardDescription>
                Errors waiting to be sent to the server
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Button onClick={forceFlushErrors} size="sm">
                    Force Flush
                  </Button>
                  <Button onClick={clearLocalErrors} variant="outline" size="sm">
                    Clear Queue
                  </Button>
                </div>
                <Badge variant="outline">
                  {localErrors.length} errors in queue
                </Badge>
              </div>

              {localErrors.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No errors in local queue. All errors have been sent to the server.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {localErrors.map((error) => (
                    <div key={error.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getErrorTypeColor(error.type)}>
                            {error.type.toUpperCase()}
                          </Badge>
                          <Badge variant={getLevelColor(error.level)}>
                            {error.level}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatTimestamp(error.timestamp)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{error.message}</p>
                        {error.component && (
                          <p className="text-sm text-gray-600">
                            Component: {error.component}
                            {error.action && ` • Action: ${error.action}`}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          URL: {error.url}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ErrorMonitoring;
