import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentProcessor } from '@/components/payments/PaymentProcessor';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  BookOpen, 
  CreditCard,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Booking: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tutorIdFromUrl = searchParams.get('tutorId');
  
  const [selectedTutor, setSelectedTutor] = useState<string>(tutorIdFromUrl || '');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(60); // minutes
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  const { toast } = useToast();

  // Update selectedTutor when URL parameter changes
  useEffect(() => {
    if (tutorIdFromUrl) {
      setSelectedTutor(tutorIdFromUrl);
    }
  }, [tutorIdFromUrl]);

  // Fetch tutors and subjects
  const { data: tutorsData } = useQuery({
    queryKey: ['tutors-for-booking'],
    queryFn: () => apiClient.searchTutors({ limit: 100 }),
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects-for-booking'],
    queryFn: () => apiClient.getSubjects(),
  });

  const tutors = tutorsData?.tutors || [];

  const selectedTutorData = tutorsData?.items?.find(t => t.id === selectedTutor);
  const selectedSubjectData = subjectsData?.items?.find(s => s.id === selectedSubject);

  // Calculate pricing
  const hourlyRate = selectedTutorData?.hourlyRateCents || 0;
  const totalPrice = Math.round((hourlyRate * duration) / 60);

  // Generate time slots (simplified - in real app, check tutor availability)
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to book a session.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedTutor || !selectedSubject || !selectedDate || !selectedTime) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const startDateTime = new Date(`${selectedDate}T${selectedTime}`);
      const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

      const bookingResponse = await apiClient.createBooking({
        tutorId: selectedTutor,
        subjectId: selectedSubject,
        startAtUTC: startDateTime.toISOString(),
        endAtUTC: endDateTime.toISOString(),
        priceCents: totalPrice,
        currency: 'USD',
      });

      if (bookingResponse.success) {
        setCreatedBooking(bookingResponse.booking);
        setShowPayment(true);
        
        toast({
          title: 'Booking created successfully!',
          description: 'Please complete payment to confirm your session.',
        });
      } else {
        throw new Error('Failed to create booking');
      }

    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = (payment: any) => {
    toast({
      title: 'Payment successful!',
      description: 'Your session has been confirmed and payment processed.',
    });

    // Invalidate related queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['tutor-bookings'] });
    queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    queryClient.invalidateQueries({ queryKey: ['tutor-stats'] });
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });

    // Reset form and navigate
    setSelectedTutor('');
    setSelectedSubject('');
    setSelectedDate('');
    setSelectedTime('');
    setDuration(60);
    setNotes('');
    setShowPayment(false);
    setCreatedBooking(null);
    
    navigate('/student/dashboard');
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: 'Payment failed',
      description: error,
      variant: 'destructive',
    });
    setShowPayment(false);
    setCreatedBooking(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign In Required</h3>
            <p className="text-gray-600 mb-4">
              You need to be signed in to book a session.
            </p>
            <Button onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Book a Session
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Schedule a personalized learning session with an expert tutor
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Session Details</span>
                </CardTitle>
                <CardDescription>
                  Fill in the details for your tutoring session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Tutor Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="tutor">Select Tutor *</Label>
                    <Select value={selectedTutor} onValueChange={setSelectedTutor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a tutor" />
                      </SelectTrigger>
                      <SelectContent>
                        {tutorsData?.items?.map((tutor) => (
                          <SelectItem key={tutor.id} value={tutor.id}>
                            <div className="flex items-center space-x-2">
                              <span>{tutor.user?.name || 'Anonymous'}</span>
                              <Badge variant="outline" className="ml-2">
                                ${(tutor.hourlyRateCents || 0) / 100}/hr
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedTutorData && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-blue-900">
                          {selectedTutorData.user?.name}
                        </p>
                        <p className="text-sm text-blue-700">
                          {selectedTutorData.headline}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-blue-600">
                            ⭐ {selectedTutorData.ratingAvg?.toFixed(1) || '0.0'} 
                            ({selectedTutorData.ratingCount || 0} reviews)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Subject Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectsData?.items?.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={today}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Time *</Label>
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="duration">Session Duration</Label>
                    <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
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

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any specific topics you'd like to focus on or questions you have..."
                      rows={3}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !selectedTutor || !selectedSubject || !selectedDate || !selectedTime}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Requesting Session...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Request Session
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Booking Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTutorData ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tutor:</span>
                        <span className="font-medium">{selectedTutorData.user?.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subject:</span>
                        <span className="font-medium">{selectedSubjectData?.name || 'Not selected'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">
                          {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Not selected'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">{selectedTime || 'Not selected'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{duration} minutes</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Hourly Rate:</span>
                        <span className="font-medium">${hourlyRate / 100}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{duration / 60} hour(s)</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
                        <span>Total:</span>
                        <span>${totalPrice / 100}</span>
                      </div>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Payment will be processed after session completion</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a tutor to see pricing</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Processor Modal */}
      {showPayment && createdBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <PaymentProcessor
              booking={{
                id: createdBooking.id,
                subject: selectedSubject,
                sessionDate: selectedDate,
                duration: duration,
                tutorName: tutors?.find(t => t.id === selectedTutor)?.user?.name || 'Tutor',
                amount: totalPrice / 100,
                currency: 'USD'
              }}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;