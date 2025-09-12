import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Clock, Award, Calendar, Bookmark, User } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const FeaturedTutors: React.FC = () => {
  // Fetch featured tutors from API
  const { data: tutorsData, isLoading, error } = useQuery({
    queryKey: ['featured-tutors'],
    queryFn: () => apiClient.searchTutors({ 
      page: 1, 
      limit: 100, // Get more tutors to sort and pick top rated
      ratingMin: 0 // Show all tutors regardless of rating
    }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Sort tutors by rating (highest first) and take top 4
  const tutors = (tutorsData?.items || [])
    .sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0))
    .slice(0, 4);

  // Fetch online status for all tutors
  const { data: onlineStatusData } = useQuery({
    queryKey: ['tutors-online-status', tutors.map(t => t.id)],
    queryFn: async () => {
      if (tutors.length === 0) return {};
      const tutorIds = tutors.map(t => t.id);
      const response = await fetch(`/api/tutors/online-status?tutorIds=${tutorIds.join(',')}`);
      return response.json();
    },
    enabled: tutors.length > 0,
    staleTime: 30 * 1000, // Cache for 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  const onlineStatus = onlineStatusData || {};

  // Helper functions
  const formatRate = (cents: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(cents / 100);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => {
      const isFilled = i < Math.floor(rating);
      
      return (
        <Star
          key={i}
          className={`h-4 w-4 ${
            isFilled 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300'
          }`}
        />
      );
    });
  };

  // Simulate online status (in a real app, this would come from WebSocket or real-time API)
  const isOnline = (tutorId: string) => {
    return onlineStatus[tutorId] || false;
  };

  if (isLoading) {
    return (
      <section id="tutors" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse Subjects</h2>
            <p className="text-xl text-gray-600">Find tutors for your academic subjects</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gradient-to-r from-gray-300 to-gray-400"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="h-4 w-4 bg-gray-300 rounded"></div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <div className="h-6 bg-gray-300 rounded w-16"></div>
                    <div className="h-10 bg-gray-300 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="tutors" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Tutors</h2>
            <p className="text-xl text-gray-600 mb-8">
              Unable to load tutors at the moment. Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="tutors" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Tutors</h2>
          <p className="text-xl text-gray-600">Find the best tutors for your learning needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tutors.map((tutor) => {
            const onlineStatus = isOnline(tutor.id);
            const tutorName = tutor.user?.name || 'Anonymous Tutor';
            const avatarUrl = tutor.user?.avatarUrl;
            const subjects = tutor.subjects || [];
            const levels = tutor.levels || [];
            const rating = tutor.ratingAvg || 0;
            const reviewCount = tutor.ratingCount || 0;
            const experience = tutor.yearsExperience || 0;
            const location = tutor.user?.country || 'Online';
            const rate = formatRate(tutor.hourlyRateCents || 0, tutor.currency || 'USD');

            return (
              <div
                key={tutor.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1"
              >
                {/* Header with gradient background */}
                <div className="relative h-48 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 p-4">
                  {/* Top icons */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex space-x-2">
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <Bookmark className="h-4 w-4 text-white" />
                      </div>
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    {onlineStatus && (
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold">
                          {getInitials(tutorName)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  {/* Rating badge */}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                    <span className="text-sm font-semibold text-gray-800">{rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Body content */}
                <div className="p-6">
                  {/* Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{tutorName}</h3>
                  
                  {/* Rating with reviews */}
                  <div className="flex items-center mb-4">
                    <div className="flex items-center mr-2">
                      {renderStars(rating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {rating.toFixed(1)} ({reviewCount} reviews)
                    </span>
                  </div>

                  {/* Subjects */}
                  {subjects.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center mb-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-gray-700">Subjects</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-4">{subjects.slice(0, 2).join(', ')}</p>
                    </div>
                  )}

                  {/* Levels */}
                  {levels.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-gray-700">Levels</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-4">{levels.slice(0, 2).join(', ')}</p>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-2 text-red-500" />
                    <span>{location}</span>
                  </div>

                  {/* Experience */}
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Clock className="h-4 w-4 mr-2 text-purple-500" />
                    <span>{experience} years experience</span>
                  </div>

                  {/* Rate and Book Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">{rate}</span>
                      <span className="text-sm text-gray-500 ml-1">/hr</span>
                    </div>
                    <Button 
                      asChild
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center shadow-md hover:shadow-lg"
                    >
                      <Link to={`/tutor/${tutor.id}`}>
                        <Calendar className="h-4 w-4 mr-1" />
                        Book Now
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button 
            asChild
            variant="outline"
            size="lg"
            className="px-8 py-3 text-lg font-semibold"
          >
            <Link to="/search">View All Tutors</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTutors;