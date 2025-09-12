import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, CheckCircle, XCircle, Trash2, Eye } from 'lucide-react';
import { reviewsApi } from '@/lib/api';
import { toast } from 'sonner';

export function ReviewsManagement() {
  const [selectedStatus, setSelectedStatus] = useState<string>('PENDING');
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews', selectedStatus],
    queryFn: () => reviewsApi.getAllReviews(selectedStatus)
  });

  const approveReviewMutation = useMutation({
    mutationFn: (reviewId: string) => reviewsApi.updateReviewStatus(reviewId, 'APPROVED'),
    onSuccess: () => {
      toast.success('Review approved successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve review');
    }
  });

  const rejectReviewMutation = useMutation({
    mutationFn: (reviewId: string) => reviewsApi.updateReviewStatus(reviewId, 'REJECTED'),
    onSuccess: () => {
      toast.success('Review rejected successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject review');
    }
  });

  const deleteReviewMutation = useMutation({
    mutationFn: reviewsApi.deleteReview,
    onSuccess: () => {
      toast.success('Review deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete review');
    }
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => {
      const isFilled = index < rating;
      return (
        <Star
          key={index}
          className={`h-4 w-4 ${
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'secondary',
      APPROVED: 'default',
      REJECTED: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading reviews...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews Management</CardTitle>
        <CardDescription>
          Manage and moderate student reviews
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="PENDING">Pending ({reviews?.filter((r: any) => r.status === 'PENDING').length || 0})</TabsTrigger>
            <TabsTrigger value="APPROVED">Approved ({reviews?.filter((r: any) => r.status === 'APPROVED').length || 0})</TabsTrigger>
            <TabsTrigger value="REJECTED">Rejected ({reviews?.filter((r: any) => r.status === 'REJECTED').length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus} className="space-y-4">
            {reviews && reviews.length > 0 ? (
              reviews
                .filter((review: any) => review.status === selectedStatus)
                .map((review: any) => (
                  <Card key={review.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{review.studentName}</span>
                          {getStatusBadge(review.status)}
                          <span className="text-sm text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-muted-foreground">
                            ({review.rating}/5)
                          </span>
                        </div>

                        {review.comment && (
                          <p className="text-sm text-muted-foreground">
                            "{review.comment}"
                          </p>
                        )}

                        <div className="text-xs text-muted-foreground">
                          Tutor ID: {review.tutorId} | Booking ID: {review.bookingId}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {review.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => approveReviewMutation.mutate(review.id)}
                              disabled={approveReviewMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectReviewMutation.mutate(review.id)}
                              disabled={rejectReviewMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteReviewMutation.mutate(review.id)}
                          disabled={deleteReviewMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No {selectedStatus.toLowerCase()} reviews</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
