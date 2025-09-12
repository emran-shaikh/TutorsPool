import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Clock, DollarSign, BookOpen } from 'lucide-react';
import { TutorProfile, User } from '@/lib/api';

interface TutorCardProps {
  tutor: TutorProfile & { user: User };
  onBook?: (tutorId: string) => void;
  onViewProfile?: (tutorId: string) => void;
}

export const TutorCard: React.FC<TutorCardProps> = ({ 
  tutor, 
  onBook, 
  onViewProfile 
}) => {
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
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={tutor.user.avatarUrl || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(tutor.user.name || 'T')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">
                {tutor.user.name || 'Anonymous Tutor'}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {tutor.headline || 'Professional Tutor'}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="ml-2">
            {tutor.yearsExperience || 0}+ years
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Rating and Reviews */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {renderStars(tutor.ratingAvg || 0)}
          </div>
          <span className="text-sm font-medium">
            {tutor.ratingAvg?.toFixed(1) || '0.0'}
          </span>
          <span className="text-sm text-muted-foreground">
            ({tutor.ratingCount || 0} reviews)
          </span>
        </div>

        {/* Bio */}
        {tutor.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {tutor.bio}
          </p>
        )}

        {/* Subjects */}
        {tutor.subjects && Array.isArray(tutor.subjects) && tutor.subjects.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tutor.subjects.slice(0, 3).map((subject: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                <BookOpen className="h-3 w-3 mr-1" />
                {subject}
              </Badge>
            ))}
            {tutor.subjects.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tutor.subjects.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Location and Rate */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{tutor.user.country || 'Online'}</span>
          </div>
          <div className="flex items-center space-x-1 font-semibold">
            <DollarSign className="h-4 w-4" />
            <span>
              {tutor.hourlyRateCents 
                ? formatRate(tutor.hourlyRateCents, tutor.currency || 'USD')
                : 'Rate not set'
              }/hr
            </span>
          </div>
        </div>

        {/* Availability Indicator */}
        <div className="flex items-center space-x-1 text-sm text-green-600">
          <Clock className="h-4 w-4" />
          <span>Available now</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewProfile?.(tutor.id)}
          >
            View Profile
          </Button>
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => onBook?.(tutor.id)}
          >
            Book Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
