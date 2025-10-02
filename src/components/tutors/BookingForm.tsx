import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface BookingFormProps {
  tutorId: string;
  tutor?: any;
  onBookingSuccess?: (booking: any) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ tutorId, tutor, onBookingSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [duration, setDuration] = useState<number>(60);
  const [sessionType, setSessionType] = useState<'ONLINE' | 'IN_PERSON'>('ONLINE');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch subjects
  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => apiClient.getSubjects() as any,
  });

  const subjects = subjectsData?.items || [];
  const tutorSubjects = tutor?.subjects || [];

  // Calculate pricing
  const hourlyRate = tutor?.hourlyRateCents || 0;
  const totalPrice = Math.round((hourlyRate * duration) / 60);

  // Load available time slots when date changes
  useEffect(() => {
    if (selectedDate && tutorId) {
      loadAvailableSlots();
    }
  }, [selectedDate, tutorId, duration]);

  const loadAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const response = await apiClient.request(
        `/tutors/${tutorId}/availability/slots?date=${selectedDate}&duration=${duration}`
      );
      
      if (response.slots && Array.isArray(response.slots)) {
        // Format slots for display (convert ISO to local time strings)
        const formattedSlots = response.slots.map((slot: string) => {
          const date = new Date(slot);
          return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
        });
        setAvailableSlots(formattedSlots);
      } else {
        setAvailableSlots([]);
      }
      
      // Clear selected time slot if it's no longer available
      if (selectedTimeSlot && !response.slots?.includes(selectedTimeSlot)) {
        setSelectedTimeSlot('');
      }
      
    } catch (error) {
      console.error('Error loading available slots:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available time slots.',
        variant: 'destructive',
      });
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSubject || !selectedDate || !selectedTimeSlot || !duration) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create start and end times
      const startTime = new Date(`${selectedDate}T${selectedTimeSlot}:00`);
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

      // Check availability before creating booking
      const availabilityCheck = await apiClient.request(
        `/tutors/${tutorId}/availability/check`,
        {
          method: 'POST',
          body: JSON.stringify({
            startTime: startTime.toISOString(),
            duration
          })
        }
      );

      if (!availabilityCheck.isAvailable) {
        toast({
          title: 'Time slot unavailable',
          description: availabilityCheck.reason || 'The selected time slot is no longer available.',
          variant: 'destructive',
        });
        
        // Refresh available slots
        await loadAvailableSlots();
        return;
      }

      // Create booking
      const bookingData = {
        tutorId,
        subjectId: selectedSubject,
        startAtUTC: startTime.toISOString(),
        endAtUTC: endTime.toISOString(),
        priceCents: totalPrice,
        currency: 'USD',
        sessionType,
        notes: notes || undefined,
      };

      const booking = await apiClient.createBooking(bookingData);

      if (booking.success) {
        setCreatedBooking(booking.booking);
        setShowPayment(true);
        
        toast({
          title: 'Booking created',
          description: 'Please complete payment to confirm your session.',
        });
      } else {
        throw new Error(booking.error || 'Failed to create booking');
      }

    } catch (error: any) {
      console.error('Booking creation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = (paymentResult: any) => {
    toast({
      title: 'Payment successful',
      description: 'Your session has been confirmed! You will receive a confirmation email shortly.',
    });
    
    if (onBookingSuccess) {
      onBookingSuccess(createdBooking);
    }
    
    setShowPayment(false);
    setCreatedBooking(null);
    
    // Reset form
    setSelectedSubject('');
    setSelectedDate('');
    setSelectedTimeSlot('');
    setNotes('');
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast({
      title: 'Payment failed',
      description: error.message || 'Payment could not be processed. Please try again.',
      variant: 'destructive',
    });
    setShowPayment(false);
    setCreatedBooking(null);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // Allow booking up to 30 days ahead
    return maxDate.toISOString().split('T')[0];
  };

  if (showPayment && createdBooking) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span>Complete Your Payment</span>
          </CardTitle>
          <CardDescription>
            Your session has been reserved. Complete payment to confirm your booking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span>Tutor:</span>
              <span className="font-medium">{tutor?.user?.name || 'Unknown Tutor'}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="font-medium">
                {new Date(selectedDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span className="font-medium">
                {selectedTimeSlot} ({duration} minutes)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Session Type:</span>
              <Badge variant={sessionType === 'ONLINE' ? 'default' : 'secondary'}>
                {sessionType === 'ONLINE' ? 'Online' : 'In-Person'}
              </Badge>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>${(totalPrice / 100).toFixed(2)}</span>
            </div>
          </div>

          <PaymentProcessor
            amount={totalPrice}
            currency="USD"
            description={`Tutoring session with ${tutor?.user?.name || 'tutor'}`}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Book a Session</span>
        </CardTitle>
        <CardDescription>
          Select your preferred subject, date, and time for your personalized learning session.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tutor and Pricing Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tutor:</span>
              <span className="font-medium">{tutor?.user?.name || 'Unknown Tutor'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Hourly Rate:</span>
              <span className="font-medium text-green-600">
                ${(hourlyRate / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Estimated Total:</span>
              <span className="font-medium text-lg">
                ${(totalPrice / 100).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <Label htmlFor="subject">
              Subject <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects
                  .filter(subject => tutorSubjects.includes(subject.id))
                  .map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {tutorSubjects.length === 0 && (
              <p className="text-sm text-gray-500">This tutor hasn't specified their subjects yet.</p>
            )}
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">
              Date <span className="text-red-500">*</span>
            </Label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTimeSlot(''); // Reset time slot when date changes
              }}
              min={getMinDate()}
              max={getMaxDate()}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          {/* Available Time Slots */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="time">
                Available Time Slots <span className="text-red-500">*</span>
              </Label>
              {loadingSlots && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading slots...</span>
                </div>
              )}
            </div>
            
            {selectedDate && !loadingSlots ? (
              availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map(slot => (
                    <Button
                      key={slot}
                      type="button"
                      variant={selectedTimeSlot === slot ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className="text-sm"
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No available time slots for this date.</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={loadAvailableSlots}
                    className="mt-2"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              )
            ) : (
              <p className="text-sm text-gray-500">Select a date to see available time slots.</p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">
              Duration <span className="text-red-500">*</span>
            </Label>
            <Select value={duration.toString()} onValueChange={(value) => setDuration(Number(value))}>
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

          {/* Session Type */}
          <div className="space-y-2">
            <Label htmlFor="sessionType">Session Type</Label>
            <Select value={sessionType} onValueChange={(value: 'ONLINE' | 'IN_PERSON') => setSessionType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ONLINE">Online (Google Meet)</SelectItem>
                <SelectItem value="IN_PERSON">In-Person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Special Notes or Requirements</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific topics you'd like to focus on, questions you have, or special requirements..."
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-[#2c2e71] to-[#f79e3c] hover:from-[#1e2048] hover:to-[#e88a2a]"
            disabled={isSubmitting || !selectedSubject || !selectedDate || !selectedTimeSlot}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Booking...
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4 mr-2" />
                Create Booking & Proceed to Payment
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
