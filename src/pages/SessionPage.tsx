import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Video, 
  Phone, 
  MessageCircle, 
  Clock, 
  Calendar, 
  BookOpen,
  ArrowLeft,
  Users,
  Mic,
  MicOff,
  VideoOff,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  subjectId: string;
  startAtUTC: string;
  endAtUTC: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED';
  priceCents: number;
  currency: string;
  tutor?: {
    id: string;
    user?: {
      id: string;
      name?: string;
      avatarUrl?: string;
    };
    subjects?: Array<{
      id: string;
      name: string;
    }>;
  };
}

const SessionPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId || !user) return;
      
      try {
        setIsLoading(true);
        const bookings = await apiClient.request('/bookings/student');
        const foundBooking = bookings.find((b: Booking) => b.id === bookingId);
        
        if (foundBooking) {
          setBooking(foundBooking);
          // Check if session is active (current time is between start and end)
          const now = new Date();
          const startTime = new Date(foundBooking.startAtUTC);
          const endTime = new Date(foundBooking.endAtUTC);
          
          setIsSessionActive(now >= startTime && now <= endTime);
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleStartSession = () => {
    setIsSessionActive(true);
    // TODO: Implement actual video call integration (WebRTC, Zoom, etc.)
  };

  const handleEndSession = async () => {
    if (!booking) return;
    
    try {
      // Mark session as completed
      await apiClient.request(`/bookings/${booking.id}/complete`, {
        method: 'POST'
      });
      
      // Redirect to dashboard with success message
      navigate('/student-dashboard', { 
        state: { message: 'Session completed successfully!' } 
      });
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Session Not Found</h3>
            <p className="text-gray-600 mb-4">
              The session you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => navigate('/student-dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const now = new Date();
  const startTime = new Date(booking.startAtUTC);
  const endTime = new Date(booking.endAtUTC);
  const sessionStarted = now >= startTime;
  const sessionEnded = now >= endTime;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/student-dashboard')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tutoring Session</h1>
              <p className="text-gray-600">{booking.subjectId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={sessionStarted && !sessionEnded ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {sessionStarted && !sessionEnded ? 'Live' : sessionEnded ? 'Ended' : 'Scheduled'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Area */}
          <div className="lg:col-span-2">
            <Card className="h-96">
              <CardContent className="h-full flex items-center justify-center bg-gray-900 text-white">
                {!sessionStarted ? (
                  <div className="text-center">
                    <Clock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">Session Not Started</h3>
                    <p className="text-gray-400">
                      Your session will begin at {formatTime(booking.startAtUTC)}
                    </p>
                  </div>
                ) : sessionEnded ? (
                  <div className="text-center">
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">Session Ended</h3>
                    <p className="text-gray-400">
                      This session has concluded. Thank you for learning with us!
                    </p>
                  </div>
                ) : !isSessionActive ? (
                  <div className="text-center">
                    <Video className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                    <h3 className="text-xl font-semibold mb-2">Ready to Start</h3>
                    <p className="text-gray-400 mb-4">
                      Your session is ready to begin
                    </p>
                    <Button onClick={handleStartSession} className="bg-blue-600 hover:bg-blue-700">
                      <Video className="h-4 w-4 mr-2" />
                      Start Session
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="bg-red-500 rounded-full w-4 h-4 mx-auto mb-4 animate-pulse"></div>
                    <h3 className="text-xl font-semibold mb-2">Session Active</h3>
                    <p className="text-gray-400 mb-4">
                      Your tutoring session is now live
                    </p>
                    <div className="flex space-x-4 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setIsMuted(!isMuted)}
                        className={isMuted ? 'bg-red-100 text-red-800' : ''}
                      >
                        {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsVideoOff(!isVideoOff)}
                        className={isVideoOff ? 'bg-red-100 text-red-800' : ''}
                      >
                        {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleEndSession}
                        className="bg-red-100 text-red-800 hover:bg-red-200"
                      >
                        End Session
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Session Info Sidebar */}
          <div className="space-y-6">
            {/* Tutor Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Your Tutor</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={booking.tutor?.user?.avatarUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {booking.tutor?.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{booking.tutor?.user?.name || 'Tutor'}</h3>
                    <p className="text-sm text-gray-600">{booking.subjectId}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message Tutor
                </Button>
              </CardContent>
            </Card>

            {/* Session Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Session Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">{formatDate(booking.startAtUTC)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium">
                    {formatTime(booking.startAtUTC)} - {formatTime(booking.endAtUTC)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subject</span>
                  <span className="font-medium">{booking.subjectId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Price</span>
                  <span className="font-medium">
                    ${(booking.priceCents / 100).toFixed(2)} {booking.currency}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge className={booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {booking.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Session Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Session Tools</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Materials
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Open Chat
                </Button>
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Session Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionPage;
