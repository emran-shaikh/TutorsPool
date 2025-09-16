import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, reviewsApi } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  BookOpen, 
  Calendar, 
  DollarSign, 
  Target, 
  Settings, 
  Edit3, 
  Save, 
  X,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Award,
  FileText,
  Eye,
  Star
} from 'lucide-react';
import { SimpleLearningProgress } from '@/components/students/SimpleLearningProgress';
import { ReviewSubmission } from '@/components/students/ReviewSubmission';
import { UpcomingSessions } from '@/components/students/UpcomingSessions';
import SessionCountdown from '@/components/students/SessionCountdown';
import TutorsPoolHeader from '@/components/layout/TutorsPoolHeader';
import { AISuggestions } from '@/components/students/AISuggestions';
import { PaymentHistory } from '@/components/payments/PaymentHistory';

interface StudentProfile {
  id: string;
  userId: string;
  gradeLevel?: string;
  learningGoals?: string;
  preferredMode?: 'ONLINE' | 'OFFLINE';
  budgetMin?: number;
  budgetMax?: number;
  specialRequirements?: string;
  uploads?: any[];
  createdAt: string;
  updatedAt?: string;
}

interface StudentStats {
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalSpentCents: number;
  averageSessionPrice: number;
}

interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  subjectId: string;
  startAtUTC: string;
  endAtUTC: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED';
  priceCents: number;
  currency: string;
  createdAt: string;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // State management
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Partial<StudentProfile>>({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Check user approval status
  if (user?.status === 'PENDING') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Pending Approval</h2>
            <p className="text-gray-600 mb-4">
              Your account is currently under review by our admin team. You'll be able to access all features once approved.
            </p>
            <Badge variant="outline" className="text-yellow-600 border-yellow-600 mb-4">
              <Clock className="w-3 h-3 mr-1" />
              Pending Approval
            </Badge>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 text-left space-y-1">
              <li>• Our admin team will review your registration</li>
              <li>• You'll receive an email notification once approved</li>
              <li>• You can then access all student features</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (user?.status === 'REJECTED') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Rejected</h2>
            <p className="text-gray-600 mb-4">
              Unfortunately, your account registration was not approved. Please contact support for more information.
            </p>
            <Badge variant="outline" className="text-red-600 border-red-600 mb-4">
              <XCircle className="w-3 h-3 mr-1" />
              Account Rejected
            </Badge>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-900 mb-2">Need help?</h3>
            <p className="text-sm text-red-800 mb-3">
              If you believe this was an error or have questions, please contact our support team.
            </p>
            <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (user?.status === 'SUSPENDED') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Suspended</h2>
            <p className="text-gray-600 mb-4">
              Your account has been temporarily suspended. Please contact support for more information.
            </p>
            <Badge variant="outline" className="text-orange-600 border-orange-600 mb-4">
              <AlertCircle className="w-3 h-3 mr-1" />
              Account Suspended
            </Badge>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-medium text-orange-900 mb-2">Need assistance?</h3>
            <p className="text-sm text-orange-800 mb-3">
              If you have questions about your account suspension, please contact our support team.
            </p>
            <Button variant="outline" className="text-orange-600 border-orange-600 hover:bg-orange-50">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Load data on component mount
  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      // Load profile, stats, and bookings in parallel
      const [profileResponse, statsResponse, bookingsResponse] = await Promise.allSettled([
        apiClient.getStudentProfile(),
        apiClient.getStudentStats(),
        apiClient.getStudentBookings()
      ]);

      if (profileResponse.status === 'fulfilled') {
        setProfile(profileResponse.value.profile);
      }

      if (statsResponse.status === 'fulfilled') {
        setStats(statsResponse.value.stats);
      }

      if (bookingsResponse.status === 'fulfilled') {
        setBookings(bookingsResponse.value.bookings);
      }

    } catch (error) {
      console.error('Error loading student data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load student data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await apiClient.cancelBooking(bookingId, 'Cancelled by student');
      toast({
        title: 'Success',
        description: 'Booking cancelled successfully',
      });
      loadStudentData(); // Reload data
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel booking',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedBookingForReview) return;

    try {
      setSubmittingReview(true);
      
      const reviewPayload = {
        bookingId: selectedBookingForReview.id,
        tutorId: selectedBookingForReview.tutorId,
        rating: reviewRating,
        comment: reviewComment,
        wouldRecommend: reviewRating >= 4,
        sessionQuality: reviewRating,
        tutorCommunication: reviewRating,
        tutorKnowledge: reviewRating,
        tutorPatience: reviewRating,
        overallExperience: reviewRating
      };

      await reviewsApi.submitReview(reviewPayload);
      
      toast({
        title: "Success",
        description: "Review submitted successfully! Thank you for your feedback.",
      });

      // Close modal and reset form
      setShowReviewModal(false);
      setSelectedBookingForReview(null);
      setReviewRating(5);
      setReviewComment('');
      
      // Refresh bookings to remove the review button
      loadStudentData();
      
      // Invalidate tutor reviews cache to update tutor profile
      queryClient.invalidateQueries({ 
        queryKey: ['tutor-reviews', selectedBookingForReview.tutorId] 
      });
      
      // Invalidate featured tutors cache to update home page ratings
      queryClient.invalidateQueries({ 
        queryKey: ['featured-tutors'] 
      });
      
      // Invalidate search results cache to update search page ratings
      queryClient.invalidateQueries({ 
        queryKey: ['search-tutors'] 
      });
      
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditProfile = () => {
    setEditingProfile({
      gradeLevel: profile?.gradeLevel || '',
      learningGoals: profile?.learningGoals || '',
      preferredMode: profile?.preferredMode || 'ONLINE',
      budgetMin: profile?.budgetMin || 0,
      budgetMax: profile?.budgetMax || 0,
      specialRequirements: profile?.specialRequirements || '',
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      const response = await apiClient.updateStudentProfile(editingProfile);
      setProfile(response.profile);
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingProfile({});
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      CONFIRMED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: Award },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle },
      REFUNDED: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TutorsPoolHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-gray-600">
            Manage your learning journey and track your progress
          </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedBookings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpentCents)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Session Countdown Widget - Always Visible */}
        <SessionCountdown 
          onJoinSession={(bookingId) => {
            // Handle joining session - could open video call or redirect to session page
            console.log('Joining session:', bookingId);
            // TODO: Implement actual session joining logic
          }}
          onMessageTutor={(tutorId) => {
            // Handle messaging tutor - could open chat
            console.log('Messaging tutor:', tutorId);
            // TODO: Implement chat opening logic
          }}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="ai-suggestions">AI Suggestions</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Student Profile
                  </CardTitle>
                  <CardDescription>
                    Manage your learning preferences and goals
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button onClick={handleEditProfile} variant="outline">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="gradeLevel">Grade Level</Label>
                        <Select
                          value={editingProfile.gradeLevel}
                          onValueChange={(value) => setEditingProfile({ ...editingProfile, gradeLevel: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Elementary (K-5)">Elementary (K-5)</SelectItem>
                            <SelectItem value="Middle School (6-8)">Middle School (6-8)</SelectItem>
                            <SelectItem value="High School (9-12)">High School (9-12)</SelectItem>
                            <SelectItem value="College/University">College/University</SelectItem>
                            <SelectItem value="Adult Learning">Adult Learning</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="preferredMode">Preferred Mode</Label>
                        <Select
                          value={editingProfile.preferredMode}
                          onValueChange={(value: 'ONLINE' | 'OFFLINE') => setEditingProfile({ ...editingProfile, preferredMode: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ONLINE">Online</SelectItem>
                            <SelectItem value="OFFLINE">In-Person</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="learningGoals">Learning Goals</Label>
                      <Textarea
                        id="learningGoals"
                        value={editingProfile.learningGoals}
                        onChange={(e) => setEditingProfile({ ...editingProfile, learningGoals: e.target.value })}
                        placeholder="Describe your learning goals and what you want to achieve..."
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="budgetMin">Minimum Budget (per hour)</Label>
                        <Input
                          id="budgetMin"
                          type="number"
                          value={editingProfile.budgetMin}
                          onChange={(e) => setEditingProfile({ ...editingProfile, budgetMin: parseInt(e.target.value) })}
                          placeholder="20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="budgetMax">Maximum Budget (per hour)</Label>
                        <Input
                          id="budgetMax"
                          type="number"
                          value={editingProfile.budgetMax}
                          onChange={(e) => setEditingProfile({ ...editingProfile, budgetMax: parseInt(e.target.value) })}
                          placeholder="50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialRequirements">Special Requirements</Label>
                      <Textarea
                        id="specialRequirements"
                        value={editingProfile.specialRequirements}
                        onChange={(e) => setEditingProfile({ ...editingProfile, specialRequirements: e.target.value })}
                        placeholder="Any special requirements or accommodations needed..."
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button onClick={handleCancelEdit} variant="outline">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Grade Level</Label>
                        <p className="text-lg font-semibold">{profile?.gradeLevel || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Preferred Mode</Label>
                        <p className="text-lg font-semibold">{profile?.preferredMode || 'Not specified'}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-600">Learning Goals</Label>
                      <p className="text-lg">{profile?.learningGoals || 'No goals specified'}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Budget Range</Label>
                        <p className="text-lg font-semibold">
                          {profile?.budgetMin && profile?.budgetMax 
                            ? `${formatCurrency(profile.budgetMin * 100)} - ${formatCurrency(profile.budgetMax * 100)}`
                            : 'Not specified'
                          }
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Special Requirements</Label>
                        <p className="text-lg">{profile?.specialRequirements || 'None'}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Profile created: {formatDate(profile?.createdAt || '')}</span>
                        {profile?.updatedAt && (
                          <span>Last updated: {formatDate(profile.updatedAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Suggestions Tab */}
          <TabsContent value="ai-suggestions" className="space-y-6">
            <AISuggestions onSubjectSelect={(subject) => {
              // Navigate to search with the selected subject
              navigate(`/search?subject=${subject}`);
            }} />
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            {/* Upcoming Sessions List */}
            <UpcomingSessions studentId={user?.id || ''} />
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Your Bookings
                </CardTitle>
                <CardDescription>
                  Track your tutoring sessions and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-600 mb-4">Start your learning journey by booking a session with a tutor.</p>
                    <Button onClick={() => navigate('/search')}>
                      Find Tutors
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold">Tutoring Session</h3>
                              {getStatusBadge(booking.status)}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                              <div>
                                <span className="font-medium">Date:</span> {formatDate(booking.startAtUTC)}
                              </div>
                              <div>
                                <span className="font-medium">Duration:</span> 1 hour
                              </div>
                              <div>
                                <span className="font-medium">Price:</span> {formatCurrency(booking.priceCents)}
                              </div>
                            </div>
                            
                            {/* Progress indicator */}
                            <div className="mb-3">
                              <div className="flex items-center space-x-2 text-sm">
                                <span className="font-medium">Progress:</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      booking.status === 'COMPLETED' ? 'bg-green-500' :
                                      booking.status === 'CONFIRMED' ? 'bg-blue-500' :
                                      booking.status === 'CANCELLED' ? 'bg-red-500' :
                                      'bg-yellow-500'
                                    }`}
                                    style={{
                                      width: booking.status === 'COMPLETED' ? '100%' :
                                             booking.status === 'CONFIRMED' ? '75%' :
                                             booking.status === 'CANCELLED' ? '25%' :
                                             '50%'
                                    }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {booking.status === 'PENDING' ? 'Awaiting confirmation' :
                                   booking.status === 'CONFIRMED' ? 'Confirmed - Ready for session' :
                                   booking.status === 'COMPLETED' ? 'Session completed' :
                                   booking.status === 'CANCELLED' ? 'Cancelled' : 'Unknown'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Action buttons */}
                            <div className="flex space-x-2">
                              {booking.status === 'PENDING' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleCancelBooking(booking.id)}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Cancel
                                </Button>
                              )}
                              
                              {booking.status === 'CONFIRMED' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleCancelBooking(booking.id)}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Cancel
                                </Button>
                              )}

                              {booking.status === 'COMPLETED' && (
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Completed
                                  </Badge>
                                <Button 
                                  size="sm" 
                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                  onClick={() => {
                                      // Open review modal for this booking
                                      setSelectedBookingForReview(booking);
                                    setShowReviewModal(true);
                                  }}
                                >
                                  <Star className="w-4 h-4 mr-1" />
                                  Rate & Review
                                </Button>
                                </div>
                              )}
                              
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  // You could add a view details modal here
                                  console.log('View booking details:', booking.id);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <PaymentHistory />
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <ReviewSubmission studentId={user?.id || ''} />
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <SimpleLearningProgress studentId={user?.id || ''} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Manage your account preferences and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Name</Label>
                        <p className="text-lg">{user?.name || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Email</Label>
                        <p className="text-lg">{user?.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Phone</Label>
                        <p className="text-lg">{user?.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Country</Label>
                        <p className="text-lg">{user?.country || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="outline" onClick={() => navigate('/account')}>
                      <Settings className="h-4 w-4 mr-2" />
                      Update Account Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      {/* Review Modal */}
        {showReviewModal && selectedBookingForReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4">Rate & Review Session</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Session Details:</p>
                  <p className="font-medium">{selectedBookingForReview.subjectId}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedBookingForReview.startAtUTC).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overall Rating
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`text-2xl ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 focus:text-yellow-400`}
                        onClick={() => setReviewRating(star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comments (Optional)
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Share your experience..."
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedBookingForReview(null);
                    setReviewRating(5);
                    setReviewComment('');
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={submittingReview}
                >
                  Cancel
                </Button>
              </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default StudentDashboard;
