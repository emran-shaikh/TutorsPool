import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Eye, 
  MessageSquare,
  User,
  DollarSign,
  MapPin,
  Video,
  Phone,
  Star,
  RefreshCw
} from 'lucide-react';

interface UpcomingSession {
  id: string;
  bookingId: string;
  studentId: string;
  tutorId: string;
  tutorName: string;
  tutorEmail?: string;
  subject: string;
  startAtUTC: string;
  endAtUTC: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  priceCents: number;
  currency: string;
  meetingLink?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  statusReason?: string;
}

interface Tutor {
  id: string;
  userId: string;
  headline: string;
  bio: string;
  hourlyRateCents: number;
  currency: string;
  subjects: string[];
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

interface UpcomingSessionsProps {
  studentId: string;
}

export const UpcomingSessions: React.FC<UpcomingSessionsProps> = ({ studentId }) => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<UpcomingSession[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<UpcomingSession | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  const [newBooking, setNewBooking] = useState({
    tutorId: '',
    subject: '',
    startDate: '',
    startTime: '',
    duration: 60,
    notes: '',
    meetingType: 'ONLINE' as 'ONLINE' | 'OFFLINE'
  });

  // Load sessions and tutors
  useEffect(() => {
    loadData();
  }, [studentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load bookings (which represent sessions)
      const bookingsResponse = await apiClient.getStudentBookings();
      const tutorsResponse = await apiClient.searchTutors();
      
      // Transform bookings into upcoming sessions format
      const upcomingSessions: UpcomingSession[] = bookingsResponse.bookings
        .filter((booking: any) => {
          const sessionDate = new Date(booking.startAtUTC);
          const now = new Date();
          // Only show future sessions or recent past sessions (within 24 hours)
          return sessionDate > now || (now.getTime() - sessionDate.getTime()) < 24 * 60 * 60 * 1000;
        })
        .map((booking: any) => ({
          id: booking.id,
          bookingId: booking.id,
          studentId: booking.studentId,
          tutorId: booking.tutorId,
          tutorName: booking.tutor?.user?.name || 'Unknown Tutor',
          tutorEmail: booking.tutor?.user?.email,
          subject: booking.subjectId || 'General Tutoring',
          startAtUTC: booking.startAtUTC,
          endAtUTC: booking.endAtUTC,
          status: booking.status,
          priceCents: booking.priceCents,
          currency: booking.currency,
          meetingLink: booking.meetingLink,
          notes: booking.notes,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          statusReason: booking.statusReason
        }));

      setSessions(upcomingSessions);
      setTutors(tutorsResponse.items || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load upcoming sessions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    try {
      if (!newBooking.tutorId || !newBooking.subject || !newBooking.startDate || !newBooking.startTime) {
        toast({
          title: 'Missing Information',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      const selectedTutor = tutors.find(t => t.id === newBooking.tutorId);
      if (!selectedTutor) {
        toast({
          title: 'Error',
          description: 'Selected tutor not found',
          variant: 'destructive',
        });
        return;
      }

      console.log('Selected tutor:', selectedTutor);
      console.log('Tutor hourlyRateCents:', selectedTutor.hourlyRateCents);
      console.log('Tutor currency:', selectedTutor.currency);

      const startDateTime = new Date(`${newBooking.startDate}T${newBooking.startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + newBooking.duration * 60 * 1000);

      const bookingData = {
        tutorId: newBooking.tutorId,
        subjectId: newBooking.subject,
        startAtUTC: startDateTime.toISOString(),
        endAtUTC: endDateTime.toISOString(),
        priceCents: selectedTutor.hourlyRateCents || 5000, // Default to $50 if not set
        currency: selectedTutor.currency || 'USD', // Default to USD if not set
      };

      console.log('Booking data:', bookingData);

      await apiClient.createBooking(bookingData);
      
      toast({
        title: 'Success',
        description: 'Session booking request sent to tutor!',
      });

      setIsBookingModalOpen(false);
      setNewBooking({
        tutorId: '',
        subject: '',
        startDate: '',
        startTime: '',
        duration: 60,
        notes: '',
        meetingType: 'ONLINE'
      });
      
      loadData(); // Refresh sessions
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to create booking',
        variant: 'destructive',
      });
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    try {
      await apiClient.cancelBooking(sessionId, 'Cancelled by student');
      toast({
        title: 'Success',
        description: 'Session cancelled successfully',
      });
      loadData();
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel session',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: Clock,
        text: 'Awaiting Tutor Confirmation'
      },
      CONFIRMED: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle,
        text: 'Confirmed - Ready for Session'
      },
      REJECTED: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: XCircle,
        text: 'Rejected by Tutor'
      },
      CANCELLED: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: AlertCircle,
        text: 'Cancelled'
      },
      COMPLETED: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: CheckCircle,
        text: 'Session Completed'
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getDuration = (startAt: string, endAt: string) => {
    const start = new Date(startAt);
    const end = new Date(endAt);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    return diffMins;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading upcoming sessions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Sessions</h2>
          <p className="text-gray-600">Manage your tutoring sessions and track their status</p>
        </div>
        <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Book New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Book a New Session</DialogTitle>
              <DialogDescription>
                Select a tutor and schedule your tutoring session
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tutor">Select Tutor *</Label>
                  <Select value={newBooking.tutorId} onValueChange={(value) => setNewBooking({ ...newBooking, tutorId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a tutor" />
                    </SelectTrigger>
                    <SelectContent>
                      {tutors.map((tutor) => (
                        <SelectItem key={tutor.id} value={tutor.id}>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{tutor.user.name}</div>
                              <div className="text-sm text-gray-500">{tutor.headline}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={newBooking.subject}
                    onChange={(e) => setNewBooking({ ...newBooking, subject: e.target.value })}
                    placeholder="e.g., Mathematics, Physics"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newBooking.startDate}
                    onChange={(e) => setNewBooking({ ...newBooking, startDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newBooking.startTime}
                    onChange={(e) => setNewBooking({ ...newBooking, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select value={newBooking.duration.toString()} onValueChange={(value) => setNewBooking({ ...newBooking, duration: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="meetingType">Meeting Type</Label>
                <Select value={newBooking.meetingType} onValueChange={(value: 'ONLINE' | 'OFFLINE') => setNewBooking({ ...newBooking, meetingType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONLINE">
                      <div className="flex items-center space-x-2">
                        <Video className="h-4 w-4" />
                        <span>Online (Video Call)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="OFFLINE">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>In-Person</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                  placeholder="Any specific topics you'd like to cover or special requirements..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBookingModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBooking}>
                Send Booking Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Sessions</h3>
            <p className="text-gray-600 mb-4">Book a session with a tutor to get started with your learning journey.</p>
            <Button onClick={() => setIsBookingModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Book Your First Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const { date, time } = formatDateTime(session.startAtUTC);
            const duration = getDuration(session.startAtUTC, session.endAtUTC);
            
            return (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{session.subject}</h3>
                          <p className="text-gray-600">with {session.tutorName}</p>
                        </div>
                        {getStatusBadge(session.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{date}</div>
                            <div>{time} ({duration} min)</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Price</div>
                            <div>{formatCurrency(session.priceCents)}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MessageSquare className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Status</div>
                            <div className="text-xs">
                              {session.status === 'PENDING' && 'Waiting for tutor confirmation'}
                              {session.status === 'CONFIRMED' && 'Ready for session'}
                              {session.status === 'REJECTED' && 'Tutor declined'}
                              {session.status === 'CANCELLED' && 'Session cancelled'}
                              {session.status === 'COMPLETED' && 'Session completed'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {session.statusReason && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-gray-700">
                            <strong>Note:</strong> {session.statusReason}
                          </p>
                        </div>
                      )}

                      {session.meetingLink && session.status === 'CONFIRMED' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center space-x-2">
                            <Video className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Meeting Link Available</span>
                          </div>
                          <a 
                            href={session.meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-green-600 hover:text-green-700 underline mt-1 block"
                          >
                            Join Session
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSession(session);
                          setIsDetailsModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      
                      {(session.status === 'PENDING' || session.status === 'CONFIRMED') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleCancelSession(session.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}

                      {session.status === 'COMPLETED' && (
                        <Button
                          size="sm"
                          className="bg-yellow-500 hover:bg-yellow-600 text-white"
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Rate & Review
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Session Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>
              Complete information about your tutoring session
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Subject</Label>
                  <p className="text-lg font-semibold">{selectedSession.subject}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Tutor</Label>
                  <p className="text-lg font-semibold">{selectedSession.tutorName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date & Time</Label>
                  <p className="text-lg">{formatDateTime(selectedSession.startAtUTC).date}</p>
                  <p className="text-lg">{formatDateTime(selectedSession.startAtUTC).time}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Duration</Label>
                  <p className="text-lg">{getDuration(selectedSession.startAtUTC, selectedSession.endAtUTC)} minutes</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Price</Label>
                  <p className="text-lg font-semibold">{formatCurrency(selectedSession.priceCents)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedSession.status)}</div>
                </div>
              </div>

              {selectedSession.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Notes</Label>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedSession.notes}</p>
                </div>
              )}

              {selectedSession.statusReason && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status Reason</Label>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedSession.statusReason}</p>
                </div>
              )}

              <div className="flex justify-between text-sm text-gray-500 pt-4 border-t">
                <span>Created: {formatDateTime(selectedSession.createdAt).date}</span>
                {selectedSession.updatedAt && (
                  <span>Updated: {formatDateTime(selectedSession.updatedAt).date}</span>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
