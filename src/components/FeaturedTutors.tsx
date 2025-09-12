import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Clock, Award, Video, Bookmark } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const FeaturedTutors: React.FC = () => {
  // Fetch featured tutors from API
  const { data: tutorsData, isLoading, error } = useQuery({
    queryKey: ['featured-tutors'],
    queryFn: () => apiClient.searchTutors({ 
      page: 1, 
      limit: 4, // Show exactly 4 tutors as in the screenshot
      ratingMin: 0 // Show all tutors regardless of rating
    }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const tutors = tutorsData?.items || [];

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

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    return Array.from({ length: 5 }, (_, i) => {
      const isFilled = i < Math.floor(rating);
      const isHalfFilled = i === Math.floor(rating) && rating % 1 >= 0.5;
      
      return (
        <Star
          key={i}
          className={`${sizeClasses[size]} ${
            isFilled 
              ? 'text-yellow-400 fill-current' 
              : isHalfFilled 
                ? 'text-yellow-400 fill-current opacity-50' 
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
      <section id="tutors" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Our Top-Rated Tutors
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn from verified educators with proven track records, extensive experience, and outstanding student reviews.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl shadow-xl overflow-hidden animate-pulse border border-gray-100">
                <div className="h-72 bg-gradient-to-r from-gray-300 to-gray-400"></div>
                <div className="p-8 space-y-4">
                  <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="h-4 w-4 bg-gray-300 rounded"></div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="h-8 bg-gray-300 rounded w-16"></div>
                    <div className="h-12 bg-gray-300 rounded w-24"></div>
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
      <section id="tutors" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Our Top-Rated Tutors
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Unable to load tutors at the moment. Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="tutors" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Meet Our Top-Rated Tutors
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn from verified educators with proven track records, extensive experience, and outstanding student reviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:-translate-y-3 border border-gray-100"
            >
              <div className="relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={tutorName}
                      className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        // Fallback to avatar component if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback Avatar */}
                  <div className={`w-full h-72 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center ${avatarUrl ? 'hidden' : ''}`}>
                    <Avatar className="h-40 w-40 border-4 border-white shadow-lg">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="bg-white text-blue-600 text-3xl font-bold">
                        {getInitials(tutorName)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Online Status */}
                  {onlineStatus && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></div>
                      Online
                  </div>
                )}

                  {/* Verified Badge */}
                  <div className="absolute top-4 left-4 bg-blue-600 text-white p-2 rounded-full shadow-lg">
                    <Award className="h-5 w-5" />
                  </div>

                  {/* Bookmark Icon */}
                  <div className="absolute top-4 left-16 bg-white/90 text-gray-600 p-2 rounded-full hover:bg-white hover:text-blue-500 transition-all duration-300 cursor-pointer shadow-lg">
                    <Bookmark className="h-4 w-4" />
              </div>

                  {/* Rating Badge */}
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-sm font-semibold flex items-center shadow-lg">
                    <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                    {rating.toFixed(1)}
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{tutorName}</h3>
                  
                  {/* Rating with Reviews */}
                  <div className="flex items-center mb-4">
                    <div className="flex items-center mr-3">
                      {renderStars(rating)}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {rating.toFixed(1)} ({reviewCount} reviews)
                    </span>
                  </div>

                  {/* Tutor Details */}
                  <div className="space-y-3 mb-6">
                    {subjects.length > 0 && (
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Subjects</p>
                          <p className="text-sm text-gray-600">{subjects.join(', ')}</p>
                        </div>
                      </div>
                    )}
                    {levels.length > 0 && (
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Levels</p>
                          <p className="text-sm text-gray-600">{levels.join(', ')}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-red-500" />
                      <span className="font-medium">{location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="font-medium">{experience} years experience</span>
                    </div>
                  </div>

                  {/* Rate and Book Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-3xl font-bold text-orange-500">{rate}</span>
                      <span className="text-sm text-gray-500 ml-1">/hr</span>
                </div>
                  <Link 
                      to={`/tutor/${tutor.id}`}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                      <Video className="h-5 w-5 mr-2" />
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <Link 
            to="/search" 
            className="bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 inline-block shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            View All Tutors
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTutors;