import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Star, User, Calendar } from 'lucide-react';
import { reviewsApi } from '@/lib/api';

interface TutorReviewsProps {
  tutorId: string;
}

export function TutorReviews({ tutorId }: TutorReviewsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tutor-reviews', tutorId],
    queryFn: () => reviewsApi.getTutorReviews(tutorId)
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews & Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading reviews...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews & Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            Failed to load reviews
          </div>
        </CardContent>
      </Card>
    );
  }

  const reviews = data?.reviews || [];
  const ratingStats = data?.ratingStats || { 
    averageRating: 0, 
    totalReviews: 0, 
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } 
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };

    return Array.from({ length: 5 }, (_, index) => {
      const isFilled = index < rating;
      return (
        <Star
          key={index}
          className={`${sizeClasses[size]} ${
            isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      );
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews & Ratings</CardTitle>
        <CardDescription>
          What students say about this tutor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Summary */}
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">
              {ratingStats?.averageRating?.toFixed(1) || '0.0'}
            </div>
            <div className="flex items-center justify-center space-x-1">
              {renderStars(Math.round(ratingStats?.averageRating || 0), 'lg')}
            </div>
            <div className="text-sm text-muted-foreground">
              {ratingStats?.totalReviews || 0} review{(ratingStats?.totalReviews || 0) !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingStats?.ratingDistribution?.[star as keyof typeof ratingStats.ratingDistribution] || 0;
              const percentage = (ratingStats?.totalReviews || 0) > 0 ? (count / (ratingStats?.totalReviews || 1)) * 100 : 0;
              
              return (
                <div key={star} className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 w-8">
                    <span className="text-sm">{star}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="text-sm text-muted-foreground w-8">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-semibold">Recent Reviews</h4>
            {reviews.slice(0, 5).map((review: any) => (
              <div key={review.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{review.studentName}</span>
                    <Badge variant="secondary" className="text-xs">
                      Verified Student
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    {renderStars(review.rating, 'sm')}
                    <span className="text-sm text-muted-foreground">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground">
                    "{review.comment}"
                  </p>
                )}
              </div>
            ))}
            {reviews.length > 5 && (
              <div className="text-center">
                <Button variant="outline" size="sm">
                  View All Reviews ({reviews.length})
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No reviews yet</p>
            <p className="text-sm">Be the first to review this tutor!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
