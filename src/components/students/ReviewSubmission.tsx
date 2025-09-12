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
import { apiClient, reviewsApi } from '@/lib/api';
import { 
  Star, 
  StarIcon, 
  MessageSquare, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Award
} from 'lucide-react';

interface CompletedSession {
  id: string;
  bookingId: string;
  studentId: string;
  tutorId: string;
  tutorName: string;
  tutorEmail: string;
  subject: string;
  startAtUTC: string;
  endAtUTC: string;
  status: string;
  priceCents: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewSubmissionProps {
  studentId: string;
}

export const ReviewSubmission: React.FC<ReviewSubmissionProps> = ({ studentId }) => {
  const [completedSessions, setCompletedSessions] = useState<CompletedSession[]>([]);
  const [submittedReviews, setSubmittedReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CompletedSession | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const { toast } = useToast();

  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
    wouldRecommend: true,
    sessionQuality: 5,
    tutorCommunication: 5,
    tutorKnowledge: 5,
    tutorPatience: 5,
    overallExperience: 5
  });

  useEffect(() => {
    loadCompletedSessions();
  }, [studentId]);

  const loadCompletedSessions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBookings();
      const bookings = response.bookings || [];
      
      // Filter for completed sessions that haven't been reviewed yet
      const completed = bookings.filter((booking: any) => 
        booking.status === 'COMPLETED' && 
        booking.studentId === studentId
      );

      // Check which sessions already have reviews and fetch submitted reviews
      const sessionsWithReviews = new Set();
      try {
        const reviewsResponse = await reviewsApi.getStudentReviews(studentId);
        setSubmittedReviews(reviewsResponse);
        reviewsResponse.forEach((review: any) => {
          sessionsWithReviews.add(review.bookingId);
        });
      } catch (error) {
        console.log('No existing reviews found:', error);
        setSubmittedReviews([]);
      }

      // Filter out sessions that already have reviews
      const unreviewedSessions = completed.filter((session: any) => 
        !sessionsWithReviews.has(session.id)
      );


      setCompletedSessions(unreviewedSessions);
    } catch (error) {
      console.error('Error loading completed sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load completed sessions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedSession) return;

    try {
      setSubmitting(true);
      
      const reviewPayload = {
        bookingId: selectedSession.id,
        tutorId: selectedSession.tutorId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        wouldRecommend: reviewData.wouldRecommend,
        sessionQuality: reviewData.sessionQuality,
        tutorCommunication: reviewData.tutorCommunication,
        tutorKnowledge: reviewData.tutorKnowledge,
        tutorPatience: reviewData.tutorPatience,
        overallExperience: reviewData.overallExperience
      };

      await apiClient.submitReview(reviewPayload);
      
      toast({
        title: 'Success',
        description: 'Review submitted successfully! Thank you for your feedback.',
      });

      setIsReviewModalOpen(false);
      setSelectedSession(null);
      setReviewData({
        rating: 5,
        comment: '',
        wouldRecommend: true,
        sessionQuality: 5,
        tutorCommunication: 5,
        tutorKnowledge: 5,
        tutorPatience: 5,
        overallExperience: 5
      });
      
      loadCompletedSessions(); // Refresh the list
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openReviewModal = (session: CompletedSession) => {
    setSelectedSession(session);
    setIsReviewModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(cents / 100);
  };

  const StarRating = ({ rating, onRatingChange, readOnly = false }: { 
    rating: number; 
    onRatingChange?: (rating: number) => void; 
    readOnly?: boolean;
  }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onRatingChange?.(star)}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading completed sessions...</span>
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
          <h2 className="text-2xl font-bold text-gray-900">Rate & Review Sessions</h2>
          <p className="text-gray-600">Share your experience to help other students and improve our tutors</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {completedSessions.length} sessions pending review
        </Badge>
      </div>

      {/* Sessions List */}
      {completedSessions.length > 0 ? (
        <div className="space-y-4">
          {completedSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{session.subject}</h3>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Tutor: {session.tutorName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(session.startAtUTC)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        <span>{formatCurrency(session.priceCents, session.currency)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => openReviewModal(session)}
                      className="flex items-center gap-2"
                    >
                      <Star className="h-4 w-4" />
                      Rate & Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sessions to Review</h3>
            <p className="text-gray-600">
              You don't have any completed sessions to review yet. Complete some sessions to share your feedback!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Submitted Reviews Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Your Submitted Reviews</h3>
        {submittedReviews.length > 0 ? (
          <div className="space-y-4">
            {submittedReviews.map((review) => (
              <Card key={review.id} className="bg-gray-50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{review.tutorName}</h4>
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          <Award className="w-3 h-3 mr-1" />
                          Reviewed
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <StarRating rating={review.rating} readOnly={true} />
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 mb-3 italic">"{review.comment}"</p>
                      )}
                      <div className="text-sm text-gray-500">
                        <span>Reviewed on {formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews submitted yet</h3>
              <p className="text-gray-600">Your reviews will appear here once you submit them.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Rate Your Session
            </DialogTitle>
            <DialogDescription>
              Help other students by sharing your experience with {selectedSession?.tutorName}
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-6">
              {/* Session Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedSession.subject}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>Tutor: {selectedSession.tutorName}</div>
                  <div>Date: {formatDate(selectedSession.startAtUTC)}</div>
                </div>
              </div>

              {/* Overall Rating */}
              <div>
                <Label className="text-base font-medium">Overall Rating *</Label>
                <StarRating 
                  rating={reviewData.rating} 
                  onRatingChange={(rating) => setReviewData({ ...reviewData, rating })}
                />
              </div>

              {/* Detailed Ratings */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Detailed Ratings</h4>
                
                <div>
                  <Label className="text-sm">Session Quality</Label>
                  <StarRating 
                    rating={reviewData.sessionQuality} 
                    onRatingChange={(rating) => setReviewData({ ...reviewData, sessionQuality: rating })}
                  />
                </div>

                <div>
                  <Label className="text-sm">Tutor Communication</Label>
                  <StarRating 
                    rating={reviewData.tutorCommunication} 
                    onRatingChange={(rating) => setReviewData({ ...reviewData, tutorCommunication: rating })}
                  />
                </div>

                <div>
                  <Label className="text-sm">Tutor Knowledge</Label>
                  <StarRating 
                    rating={reviewData.tutorKnowledge} 
                    onRatingChange={(rating) => setReviewData({ ...reviewData, tutorKnowledge: rating })}
                  />
                </div>

                <div>
                  <Label className="text-sm">Tutor Patience</Label>
                  <StarRating 
                    rating={reviewData.tutorPatience} 
                    onRatingChange={(rating) => setReviewData({ ...reviewData, tutorPatience: rating })}
                  />
                </div>

                <div>
                  <Label className="text-sm">Overall Experience</Label>
                  <StarRating 
                    rating={reviewData.overallExperience} 
                    onRatingChange={(rating) => setReviewData({ ...reviewData, overallExperience: rating })}
                  />
                </div>
              </div>

              {/* Recommendation */}
              <div>
                <Label className="text-base font-medium">Would you recommend this tutor?</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Button
                    variant={reviewData.wouldRecommend ? "default" : "outline"}
                    size="sm"
                    onClick={() => setReviewData({ ...reviewData, wouldRecommend: true })}
                    className="flex items-center gap-2"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Yes
                  </Button>
                  <Button
                    variant={!reviewData.wouldRecommend ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setReviewData({ ...reviewData, wouldRecommend: false })}
                    className="flex items-center gap-2"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    No
                  </Button>
                </div>
              </div>

              {/* Comment */}
              <div>
                <Label htmlFor="comment" className="text-base font-medium">
                  Share your experience (optional)
                </Label>
                <Textarea
                  id="comment"
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  placeholder="Tell other students about your experience with this tutor..."
                  className="mt-2"
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReviewModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={submitting || reviewData.rating === 0}
              className="flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Star className="h-4 w-4" />
                  Submit Review
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};