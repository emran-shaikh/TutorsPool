import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, reviewsApi } from '@/lib/api';
import { Star, Heart, Users, Award } from 'lucide-react';

interface SuccessStoryFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SuccessStoryForm: React.FC<SuccessStoryFormProps> = ({ isOpen, onOpenChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    tutorId: '',
    subject: '',
    rating: 5,
    comment: '',
    improvement: ''
  });

  // Get student's completed sessions to show available tutors
  const { data: bookingsData } = useQuery({
    queryKey: ['student-bookings', user?.id],
    queryFn: () => apiClient.getBookings(),
    enabled: !!user?.id && isOpen,
  });

  // Get tutors data to show tutor names
  const { data: tutorsData } = useQuery({
    queryKey: ['tutors-for-review'],
    queryFn: () => apiClient.searchTutors({ limit: 100 }),
    enabled: isOpen,
  });

  const submitStoryMutation = useMutation({
    mutationFn: reviewsApi.submitSuccessStory,
    onSuccess: () => {
      toast({
        title: 'Success Story Submitted!',
        description: 'Thank you for sharing your experience. Your story will be reviewed and featured on our homepage.',
      });
      setFormData({
        tutorId: '',
        subject: '',
        rating: 5,
        comment: '',
        improvement: ''
      });
      queryClient.invalidateQueries({ queryKey: ['featured-reviews'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Submission Failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  // Get completed sessions with unique tutors
  const completedSessions = bookingsData?.bookings?.filter(
    (booking: any) => booking.status === 'COMPLETED'
  ) || [];

  const availableTutors = completedSessions
    .reduce((unique: any[], booking: any) => {
      if (!unique.find(t => t.tutorId === booking.tutorId)) {
        const tutor = tutorsData?.tutors?.find((t: any) => t.id === booking.tutorId);
        if (tutor) {
          unique.push({
            tutorId: booking.tutorId,
            tutorName: tutor.user?.name || 'Tutor',
            subject: booking.subjectId
          });
        }
      }
      return unique;
    }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tutorId || !formData.comment.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please select a tutor and write your story.',
        variant: 'destructive',
      });
      return;
    }

    submitStoryMutation.mutate(formData);
  };

  const renderStars = (rating: number, onRatingChange: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400 transition-colors`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating} star{rating !== 1 ? 's' : ''})</span>
      </div>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500" />
            <span>Share Your Success Story</span>
          </DialogTitle>
          <DialogDescription>
            Help other students by sharing your amazing experience with one of our tutors!
          </DialogDescription>
        </DialogHeader>

        {availableTutors.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Sessions</h3>
            <p className="text-gray-600 mb-4">
              You need to complete at least one tutoring session before you can share a success story.
            </p>
            <div className="space-y-3">
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => {
                  onOpenChange(false);
                  window.location.href = '/search';
                }}
              >
                Find a Tutor
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="tutor">Select Your Tutor</Label>
                <Select 
                  value={formData.tutorId} 
                  onValueChange={(value) => setFormData({ ...formData, tutorId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose the tutor you want to review" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTutors.map((tutor: any) => (
                      <SelectItem key={tutor.tutorId} value={tutor.tutorId}>
                        {tutor.tutorName} - {tutor.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Mathematics, Physics, English"
                />
              </div>

              <div>
                <Label>Overall Rating</Label>
                {renderStars(formData.rating, (rating) => setFormData({ ...formData, rating }))}
              </div>

              <div>
                <Label htmlFor="comment">Your Success Story *</Label>
                <Textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Tell us about your experience! How did this tutor help you? What did you achieve together?"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="improvement">What Did You Achieve?</Label>
                <Input
                  id="improvement"
                  value={formData.improvement}
                  onChange={(e) => setFormData({ ...formData, improvement: e.target.value })}
                  placeholder="e.g., Grade improved from C to A*, Passed my exam with 95%, Mastered calculus"
                />
              </div>
            </div>

            <DialogFooter className="space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitStoryMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitStoryMutation.isPending || !formData.tutorId || !formData.comment.trim()}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {submitStoryMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4 mr-2" />
                    Share My Story
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SuccessStoryForm;
