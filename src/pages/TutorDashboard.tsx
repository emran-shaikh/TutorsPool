import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw } from 'lucide-react';
import { AvailabilityManager } from '@/components/tutors/AvailabilityManager';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { TutorPayoutDashboard } from '@/components/payments/TutorPayoutDashboard';
import ProfilePictureUpload from '@/components/tutors/ProfilePictureUpload';
import { 
  User, 
  Calendar, 
  DollarSign, 
  Star, 
  BookOpen, 
  Settings,
  Edit,
  Clock,
  Users,
  TrendingUp,
  MessageCircle,
  Award,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const TutorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [editForm, setEditForm] = useState({
    headline: '',
    bio: '',
    hourlyRateCents: 0,
  });

  // Check user approval status
  if (user?.status === 'PENDING') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Pending Approval</h2>
            <p className="text-gray-600 mb-4">
              Your tutor account is currently under review by our admin team. You'll be able to access all features once approved.
            </p>
            <Badge variant="outline" className="text-yellow-600 border-yellow-600 mb-4">
              <Clock className="w-3 h-3 mr-1" />
              Pending Approval
            </Badge>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 text-left space-y-1">
              <li>• Our admin team will review your tutor application</li>
              <li>• You'll receive an email notification once approved</li>
              <li>• You can then start accepting bookings from students</li>
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
              Unfortunately, your tutor application was not approved. Please contact support for more information.
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
              Your tutor account has been temporarily suspended. Please contact support for more information.
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

  // Fetch tutor profile
  const { data: tutorProfile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['tutor-profile'],
    queryFn: () => apiClient.getTutorProfileByUserId(),
    enabled: !!user,
  });

  // Update avatar URL when profile loads
  useEffect(() => {
    if (tutorProfile?.user?.avatarUrl) {
      setAvatarUrl(tutorProfile.user.avatarUrl);
    }
  }, [tutorProfile]);

  // Fetch tutor bookings
  const { data: tutorBookings, isLoading: bookingsLoading, refetch: refetchBookings } = useQuery({
    queryKey: ['tutor-bookings'],
    queryFn: () => apiClient.getTutorBookings(),
    enabled: !!user,
  });

  // Fetch tutor stats
  const { data: tutorStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['tutor-stats'],
    queryFn: () => apiClient.getTutorStats(),
    enabled: !!user,
  });

  // Initialize edit form when profile data is available
  React.useEffect(() => {
    if (tutorProfile && !isEditing) {
      setEditForm({
        headline: tutorProfile.headline || '',
        bio: tutorProfile.bio || '',
        hourlyRateCents: tutorProfile.hourlyRateCents || 0,
      });
    }
  }, [tutorProfile, isEditing]);

  const handleUpdateProfile = async (profileData: any) => {
    try {
      await apiClient.updateTutorProfile(profileData);
      toast({
        title: 'Profile updated successfully',
        description: 'Your tutor profile has been updated.',
      });
      refetchProfile();
      refetchBookings();
      refetchStats();
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditFormChange = (field: string, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await handleUpdateProfile(editForm);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBookingStatusUpdate = async (bookingId: string, status: string, reason?: string) => {
    try {
      await apiClient.updateTutorBookingStatus(bookingId, status, reason);
      toast({
        title: 'Booking updated successfully',
        description: `Booking status updated to ${status}`,
      });
      refetchBookings();
      refetchStats();
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update booking status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatRate = (cents: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tutorProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tutor Profile Not Found</h3>
            <p className="text-gray-600 mb-4">
              It looks like you haven't completed your tutor registration yet.
            </p>
            <Button onClick={() => navigate('/tutor/register')}>
              Complete Registration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tutor Dashboard</h1>
            <p className="text-gray-600">Manage your tutoring profile and sessions</p>
          </div>
          <div className="flex space-x-4">
            <Button 
            onClick={() => {
              refetchProfile();
              refetchBookings();
              refetchStats();
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
          </div>
        </div>

        {/* Profile Overview */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={avatarUrl || tutorProfile.user?.avatarUrl || ''} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {tutorProfile.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'T'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {tutorProfile.user?.name || 'Anonymous Tutor'}
                  </h2>
                  <p className="text-gray-600">{tutorProfile.headline || 'Professional Tutor'}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="font-medium">
                        {tutorProfile.ratingAvg?.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-gray-500">
                        ({tutorProfile.ratingCount || 0} reviews)
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{tutorProfile.user?.country || 'Online'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {tutorStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold">{tutorStats.totalBookings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold">
                      {formatRate(tutorStats.totalEarnings)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Students Taught</p>
                    <p className="text-2xl font-bold">{tutorStats.studentsTaught}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Session Price</p>
                    <p className="text-2xl font-bold">
                      {formatRate(tutorStats.averageSessionPrice)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Recent Bookings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tutorBookings && tutorBookings.length > 0 ? (
                    <div className="space-y-4">
                      {tutorBookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{formatDate(booking.startAtUTC)}</p>
                            <p className="text-sm text-gray-600">
                              {formatRate(booking.priceCents)} • {booking.status}
                            </p>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No bookings yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Profile Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Profile Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Hourly Rate</span>
                    <span className="font-medium">
                      {formatRate(tutorProfile.hourlyRateCents || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Experience</span>
                    <span className="font-medium">{tutorProfile.yearsExperience || 0} years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subjects</span>
                    <span className="font-medium">{tutorProfile.subjects?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="font-medium">
                        {tutorProfile.ratingAvg?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>
                  Manage your tutoring sessions and bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tutorBookings && tutorBookings.length > 0 ? (
                  <div className="space-y-4">
                    {tutorBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-medium">{formatDate(booking.startAtUTC)}</p>
                              <p className="text-sm text-gray-600">
                                Duration: {Math.round((new Date(booking.endAtUTC).getTime() - new Date(booking.startAtUTC).getTime()) / (1000 * 60))} minutes
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatRate(booking.priceCents)}</p>
                              <p className="text-sm text-gray-600">Subject ID: {booking.subjectId}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          
                          {booking.status === 'PENDING' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleBookingStatusUpdate(booking.id, 'CONFIRMED', 'Confirmed by tutor')}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Confirm
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleBookingStatusUpdate(booking.id, 'CANCELLED', 'Cancelled by tutor')}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {booking.status === 'CONFIRMED' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => handleBookingStatusUpdate(booking.id, 'COMPLETED', 'Session completed')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
                    <p>Your bookings will appear here once students start booking sessions with you.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts">
            <TutorPayoutDashboard />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Picture Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>
                  Upload or update your profile picture. This will be visible to students on your profile.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfilePictureUpload
                  currentAvatarUrl={tutorProfile.user?.avatarUrl}
                  userName={tutorProfile.user?.name}
                  onUploadSuccess={(url) => {
                    setAvatarUrl(url);
                    refetchProfile();
                  }}
                />
              </CardContent>
            </Card>

            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your tutoring profile and information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Headline
                      </label>
                      <input
                        type="text"
                        value={editForm.headline}
                        onChange={(e) => handleEditFormChange('headline', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Expert Math Tutor with 5+ Years Experience"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => handleEditFormChange('bio', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tell students about your teaching experience and approach..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hourly Rate (in cents)
                      </label>
                      <input
                        type="number"
                        value={editForm.hourlyRateCents}
                        onChange={(e) => handleEditFormChange('hourlyRateCents', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="5000 (for $50/hour)"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Headline</h3>
                      <p className="text-gray-700">{tutorProfile.headline || 'Not set'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Bio</h3>
                      <p className="text-gray-700">{tutorProfile.bio || 'Not set'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Hourly Rate</h3>
                      <p className="text-gray-700">
                        {formatRate(tutorProfile.hourlyRateCents || 0)}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Subjects</h3>
                      <div className="flex flex-wrap gap-2">
                        {tutorProfile.subjects?.map((subject, index) => (
                          <Badge key={index} variant="outline">
                            {subject}
                          </Badge>
                        )) || <span className="text-gray-500">No subjects listed</span>}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability">
            <AvailabilityManager
              availabilityBlocks={tutorProfile?.availabilityBlocks || []}
              onUpdate={(blocks) => {
                // Refresh the profile data after update
                refetchProfile();
              }}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{tutorProfile.user?.email}</span>
                      </div>
                      {tutorProfile.user?.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{tutorProfile.user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Location</h3>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{tutorProfile.user?.country || 'Not specified'}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Account Actions</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Globe className="h-4 w-4 mr-2" />
                        Privacy Settings
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default TutorDashboard;
