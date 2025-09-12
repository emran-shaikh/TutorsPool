import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, 
  Calendar, 
  User, 
  Video, 
  MapPin,
  MessageCircle,
  BookOpen
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

interface SessionCountdownProps {
  onJoinSession?: (bookingId: string) => void;
  onMessageTutor?: (tutorId: string) => void;
}

const SessionCountdown: React.FC<SessionCountdownProps> = ({ 
  onJoinSession, 
  onMessageTutor 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nextSession, setNextSession] = useState<Booking | null>(null);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [totalUpcomingSessions, setTotalUpcomingSessions] = useState(0);

  // Fetch next confirmed session
  useEffect(() => {
    const fetchNextSession = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const response = await apiClient.request('/students/bookings');
        const bookings = response.bookings || [];
        
        console.log('SessionCountdown: All bookings:', bookings.length);
        
        // Filter for confirmed bookings that are in the future
        const now = new Date();
        const confirmedBookings = bookings.filter(
          (booking: Booking) => {
            const isConfirmed = booking.status === 'CONFIRMED';
            const isFuture = new Date(booking.startAtUTC) > now;
            console.log(`Booking ${booking.id}: status=${booking.status}, startAt=${booking.startAtUTC}, isConfirmed=${isConfirmed}, isFuture=${isFuture}`);
            return isConfirmed && isFuture;
          }
        );
        
        console.log('SessionCountdown: Confirmed future bookings:', confirmedBookings.length);
        
        // Track total upcoming sessions
        setTotalUpcomingSessions(confirmedBookings.length);
        
        if (confirmedBookings.length > 0) {
          // Sort by start time and get the earliest one (nearest upcoming)
          const sortedBookings = confirmedBookings.sort(
            (a: Booking, b: Booking) => 
              new Date(a.startAtUTC).getTime() - new Date(b.startAtUTC).getTime()
          );
          
          const nearestSession = sortedBookings[0];
          console.log('SessionCountdown: Nearest session:', {
            id: nearestSession.id,
            startAt: nearestSession.startAtUTC,
            subject: nearestSession.subjectId,
            tutor: nearestSession.tutor?.user?.name,
            totalUpcoming: confirmedBookings.length
          });
          
          setNextSession(nearestSession);
        } else {
          console.log('SessionCountdown: No confirmed future sessions found');
          setNextSession(null);
        }
      } catch (error) {
        console.error('Error fetching next session:', error);
        setNextSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNextSession();
    
    // Refresh every 30 seconds to catch new confirmed sessions
    const interval = setInterval(fetchNextSession, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Update countdown timer
  useEffect(() => {
    if (!nextSession) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const sessionTime = new Date(nextSession.startAtUTC).getTime();
      const difference = sessionTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          total: difference
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextSession]);

  const formatTime = (time: number) => time.toString().padStart(2, '0');
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeOnly = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeUntilSession = () => {
    if (timeLeft.total <= 0) return 'Session time!';
    
    if (timeLeft.days > 0) {
      return `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`;
    } else if (timeLeft.hours > 0) {
      return `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`;
    } else if (timeLeft.minutes > 0) {
      return `${timeLeft.minutes}m ${timeLeft.seconds}s`;
    } else {
      return `${timeLeft.seconds}s`;
    }
  };

  const getCountdownColor = () => {
    if (timeLeft.total <= 0) return 'text-red-600';
    if (timeLeft.total <= 5 * 60 * 1000) return 'text-orange-600'; // 5 minutes
    if (timeLeft.total <= 30 * 60 * 1000) return 'text-yellow-600'; // 30 minutes
    return 'text-green-600';
  };

  const getStatusBadge = () => {
    if (timeLeft.total <= 0) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Session Started</Badge>;
    }
    if (timeLeft.total <= 5 * 60 * 1000) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Starting Soon</Badge>;
    }
    if (timeLeft.total <= 30 * 60 * 1000) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Upcoming</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800 border-green-200">Scheduled</Badge>;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading next session...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!nextSession) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Upcoming Sessions</h3>
            <p className="text-sm">You don't have any confirmed sessions scheduled.</p>
            <Button className="mt-4" onClick={() => navigate('/')}>
              Browse Tutors
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>Next Session</span>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              Nearest
            </Badge>
            {totalUpcomingSessions > 1 && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                {totalUpcomingSessions} Total
              </Badge>
            )}
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Countdown Timer */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${getCountdownColor()} mb-2`}>
            {getTimeUntilSession()}
          </div>
          <p className="text-sm text-gray-600">
            {timeLeft.total <= 0 ? 'Your session is ready to join!' : 'Until your session starts'}
          </p>
        </div>

        {/* Session Details */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={nextSession.tutor?.user?.avatarUrl} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                {nextSession.tutor?.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'T'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">
                  {nextSession.tutor?.user?.name || 'Tutor'}
                </h3>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>{nextSession.subjectId}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(nextSession.startAtUTC)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{formatTimeOnly(nextSession.startAtUTC)} - {formatTimeOnly(nextSession.endAtUTC)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Video className="h-4 w-4" />
                  <span>Online Session</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {timeLeft.total <= 0 && (
            <Button 
              onClick={() => navigate(`/session/${nextSession.id}`)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Video className="h-4 w-4 mr-2" />
              Join Session
            </Button>
          )}
          {timeLeft.total > 0 && (
            <Button 
              variant="outline" 
              className="flex-1"
              disabled
            >
              <Clock className="h-4 w-4 mr-2" />
              Session in {getTimeUntilSession()}
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => onMessageTutor?.(nextSession.tutorId)}
            className="flex items-center"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>

        {/* Session Info */}
        <div className="text-xs text-gray-500 text-center">
          Session ID: {nextSession.id} • Price: ${(nextSession.priceCents / 100).toFixed(2)} {nextSession.currency}
          <br />
          <span className="text-blue-600 font-medium">
            {totalUpcomingSessions > 1 
              ? `This is your nearest of ${totalUpcomingSessions} upcoming sessions` 
              : 'This is your nearest upcoming session'
            }
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionCountdown;
