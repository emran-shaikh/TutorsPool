import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { AvailabilityManager } from '@/components/tutors/AvailabilityManager';
import { TutorReviews } from '@/components/tutors/TutorReviews';
import BookingForm from '@/components/tutors/BookingForm';
import TutorLocationCard from '@/components/tutors/TutorLocationCard';
import { reviewsApi } from '@/lib/api';
import { 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  BookOpen, 
  Calendar,
  MessageCircle,
  Award,
  GraduationCap,
  AlertCircle,
  Users,
  CheckCircle,
  ArrowLeft,
  Edit,
  Globe,
  Phone,
  Mail,
  RefreshCw,
  User
} from 'lucide-react';

const TutorProfile: React.FC = () => {
  const { tutorId } = useParams<{ tutorId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { logError } = useErrorLogger({ component: 'TutorProfile' });
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'reviews' | 'availability' | 'booking'>('overview');

  // Fetch tutor profile
  const { data: tutorData, isLoading, error, refetch: refetchProfile } = useQuery({
    queryKey: ['tutor-profile', tutorId],
    queryFn: () => apiClient.getTutorProfile(tutorId!),
    enabled: !!tutorId,
  });

  // Fetch tutor reviews
  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ['tutor-reviews', tutorId],
    queryFn: () => reviewsApi.getTutorReviews(tutorId!),
    enabled: !!tutorId,
  });

  // Handle errors separately
  React.useEffect(() => {
    if (error) {
      logError(error as Error, { action: 'fetch_tutor_profile', tutorId });
    }
  }, [error, logError, tutorId]);


  const handleBookSession = () => {
    try {
      if (!user) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to book a session with this tutor.',
          variant: 'destructive',
        });
        return;
      }
      navigate(`/booking?tutorId=${tutorId}`);
    } catch (error) {
      logError(error as Error, { action: 'book_session', tutorId });
    }
  };

  const handleContactTutor = () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to contact this tutor.',
        variant: 'destructive',
      });
      return;
    }
    // In a real app, this would open a messaging interface
    toast({
      title: 'Contact feature coming soon',
      description: 'Messaging functionality will be available soon.',
    });
  };

  const formatRate = (cents: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(cents / 100);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !tutorData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tutor Not Found</h3>
            <p className="text-gray-600 mb-4">
              The tutor you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/search')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tutor = tutorData as any;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/search')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>

        {/* Header Section */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Tutor Info */}
              <div className="flex-1">
                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={tutor.user?.avatarUrl || ''} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {tutor.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                          {tutor.user?.name || 'Anonymous Tutor'}
                        </h1>
                        <p className="text-xl text-gray-600 mb-4">
                          {tutor.headline || 'Professional Tutor'}
                        </p>
                        
                        {/* Refresh Button */}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            refetchProfile();
                            refetchReviews();
                          }}
                          className="mb-4"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                        
                        {/* Rating and Reviews */}
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {renderStars(tutor.ratingAvg || 0)}
                            </div>
                            <span className="text-2xl font-bold text-gray-900">
                              {tutor.ratingAvg?.toFixed(1) || '0.0'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <span className="text-lg">
                              ({tutor.ratingCount || 0} reviews)
                            </span>
                            {reviewsData?.ratingStats && reviewsData.ratingStats.totalReviews > 0 && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {reviewsData.ratingStats.ratingDistribution?.[5] || 0} five-star reviews
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Location and Experience */}
                        <div className="flex items-center space-x-6 text-gray-600 mb-4">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{tutor.user?.country || 'Online'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <GraduationCap className="h-4 w-4" />
                            <span>{tutor.yearsExperience || 0}+ years experience</span>
                          </div>
                        </div>

                        {/* Rate */}
                        <div className="flex items-center space-x-1 text-2xl font-bold text-green-600 mb-4">
                          <DollarSign className="h-6 w-6" />
                          <span>
                            {tutor.hourlyRateCents 
                              ? formatRate(tutor.hourlyRateCents, tutor.currency || 'USD')
                              : 'Rate not set'
                            }/hr
                          </span>
                        </div>

                        {/* Latest Review Highlight */}
                        {reviewsData?.reviews && reviewsData.reviews.length > 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start space-x-3">
                              <div className="flex items-center space-x-1">
                                {renderStars(reviewsData.reviews[0].rating)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900">
                                    {reviewsData.reviews[0].studentName || 'Anonymous Student'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(reviewsData.reviews[0].createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                {reviewsData.reviews[0].comment && (
                                  <p className="text-sm text-gray-700 italic">
                                    "{reviewsData.reviews[0].comment.length > 120 
                                      ? reviewsData.reviews[0].comment.substring(0, 120) + '...'
                                      : reviewsData.reviews[0].comment
                                    }"
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-3">
                        <Button 
                          onClick={handleBookSession}
                          size="lg"
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Session
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={handleContactTutor}
                          size="lg"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contact Tutor
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'subjects', label: 'Subjects', icon: BookOpen },
            { id: 'reviews', label: 'Reviews', icon: Star },
            { id: 'availability', label: 'Availability', icon: Clock },
            { id: 'booking', label: 'Book Session', icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <Card>
                <CardHeader>
                  <CardTitle>About {tutor.user?.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {tutor.bio && (
                    <div>
                      <h3 className="font-semibold mb-2">Bio</h3>
                      <p className="text-gray-700 leading-relaxed">{tutor.bio}</p>
                    </div>
                  )}
                  
                  {tutor.education && (
                    <div>
                      <h3 className="font-semibold mb-2">Education</h3>
                      <p className="text-gray-700">{tutor.education}</p>
                    </div>
                  )}

                  {tutor.teachingPhilosophy && (
                    <div>
                      <h3 className="font-semibold mb-2">Teaching Philosophy</h3>
                      <p className="text-gray-700 leading-relaxed">{tutor.teachingPhilosophy}</p>
                    </div>
                  )}

                  {/* Achievements */}
                  {tutor.achievements && tutor.achievements.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Achievements</h3>
                      <ul className="space-y-1">
                        {tutor.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-center space-x-2 text-gray-700">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recent Reviews */}
                  {reviewsData?.reviews && reviewsData.reviews.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-4">Recent Reviews</h3>
                      <div className="space-y-4">
                        {reviewsData.reviews.slice(0, 3).map((review: any) => (
                          <div key={review.id} className="border-l-4 border-blue-500 pl-4 py-2">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex items-center space-x-1">
                                {renderStars(review.rating)}
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {review.studentName || 'Anonymous Student'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-gray-700 text-sm leading-relaxed">
                                "{review.comment}"
                              </p>
                            )}
                          </div>
                        ))}
                        {reviewsData.reviews.length > 3 && (
                          <div className="text-center pt-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setActiveTab('reviews')}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              View all {reviewsData.reviews.length} reviews
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'subjects' && (
              <Card>
                <CardHeader>
                  <CardTitle>Subjects & Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  {tutor.subjects && tutor.subjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tutor.subjects.map((subject, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <h3 className="font-semibold text-lg mb-2">{subject}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <BookOpen className="h-4 w-4" />
                            <span>Expert Level</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No subjects listed</p>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'reviews' && (
              <TutorReviews tutorId={tutorId} />
            )}

            {activeTab === 'availability' && (
              <AvailabilityManager
                availabilityBlocks={tutor?.availabilityBlocks || []}
                readOnly={true}
              />
            )}

            {activeTab === 'booking' && (
              <div className="space-y-6">
                {!user ? (
                  <Card className="text-center">
                    <CardContent className="py-8">
                      <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign In Required</h3>
                      <p className="text-gray-600 mb-4">
                        Please sign in to book a session with this tutor.
                      </p>
                      <Button onClick={() => navigate('/login')}>
                        Sign In
                      </Button>
                    </CardContent>
                  </Card>
                ) : user.role !== 'STUDENT' ? (
                  <Card className="text-center">
                    <CardContent className="py-8">
                      <AlertCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Access Required</h3>
                      <p className="text-gray-600 mb-4">
                        Only students can book sessions. Admins can create bookings in the admin panel.
                      </p>
                      <Button onClick={() => navigate('/app')}>
                        Go to Dashboard
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <BookingForm 
                    tutorId={tutorId!} 
                    tutor={tutor}
                    onBookingSuccess={(booking) => {
                      toast({
                        title: 'Booking Successful',
                        description: 'Your session has been confirmed!',
                      });
                      // Optionally switch back to overview
                      setActiveTab('overview');
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-medium">Within 2 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Students Taught</span>
                  <span className="font-medium">{tutor.studentsTaught || 0}+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Sessions Completed</span>
                  <span className="font-medium">{tutor.sessionsCompleted || 0}+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-medium text-green-600">98%</span>
                </div>

                {/* Review Summary */}
                {reviewsData?.ratingStats && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Review Summary</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Average Rating</span>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">{reviewsData.ratingStats.averageRating?.toFixed(1) || '0.0'}</span>
                          <div className="flex items-center space-x-1">
                            {renderStars(reviewsData.ratingStats.averageRating || 0)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Reviews</span>
                        <span className="font-medium">{reviewsData.ratingStats.totalReviews || 0}</span>
                      </div>
                      {reviewsData.ratingStats.ratingDistribution && (
                        <div className="space-y-1">
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center space-x-2 text-sm">
                              <span className="text-gray-600 w-3">{rating}</span>
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-400 h-2 rounded-full" 
                                  style={{ 
                                    width: `${(reviewsData.ratingStats.ratingDistribution[rating] / reviewsData.ratingStats.totalReviews) * 100}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="text-gray-600 text-xs w-6">
                                {reviewsData.ratingStats.ratingDistribution[rating] || 0}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 text-green-600 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Verified Tutor</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-600 mb-2">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm font-medium">Online & In-Person</span>
                  </div>
                  <div className="flex items-center space-x-2 text-purple-600">
                    <Award className="h-4 w-4" />
                    <span className="text-sm font-medium">Top Rated</span>
                  </div>
                </div>

                <Button 
                  onClick={handleBookSession}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Session Now
                </Button>
              </CardContent>
            </Card>

            {/* Tutor Location Card */}
            <TutorLocationCard
              tutorName={tutor.user?.name || 'Tutor'}
              tutorLocation={tutor.inPersonLocation}
              onContact={handleContactTutor}
              showDirections={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfile;
