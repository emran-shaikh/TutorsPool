import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { 
  Bell, 
  BellRing, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  User,
  MessageSquare,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

interface Notification {
  id: string;
  userId: string;
  type: 'BOOKING_REQUEST' | 'BOOKING_CONFIRMED' | 'BOOKING_REJECTED' | 'BOOKING_CANCELLED' | 'SESSION_REMINDER' | 'REVIEW_RECEIVED';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
  readAt?: string;
}

interface NotificationCenterProps {
  userId: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId }) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getNotifications();
      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_REQUEST':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'BOOKING_CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'BOOKING_REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'BOOKING_CANCELLED':
        return <XCircle className="h-4 w-4 text-orange-600" />;
      case 'SESSION_REMINDER':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'REVIEW_RECEIVED':
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'BOOKING_REQUEST':
        return 'bg-blue-50 border-blue-200';
      case 'BOOKING_CONFIRMED':
        return 'bg-green-50 border-green-200';
      case 'BOOKING_REJECTED':
        return 'bg-red-50 border-red-200';
      case 'BOOKING_CANCELLED':
        return 'bg-orange-50 border-orange-200';
      case 'SESSION_REMINDER':
        return 'bg-yellow-50 border-yellow-200';
      case 'REVIEW_RECEIVED':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount} unread</Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Stay updated with your tutoring session requests and updates
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadNotifications}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">You're all caught up! New notifications will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`cursor-pointer transition-colors hover:shadow-md ${
                    notification.read ? 'opacity-75' : ''
                  } ${getNotificationColor(notification.type)}`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.createdAt)}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                          {notification.message}
                        </p>
                        {notification.data && (
                          <div className="mt-2 text-xs text-gray-600">
                            {notification.data.subject && (
                              <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
                                {notification.data.subject}
                              </span>
                            )}
                            {notification.data.studentName && (
                              <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
                                Student: {notification.data.studentName}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
