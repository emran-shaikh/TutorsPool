import React from 'react';
import { TutorCard } from './TutorCard';
import { TutorProfile, User } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface TutorGridProps {
  tutors: (TutorProfile & { user: User })[];
  loading?: boolean;
  onBook?: (tutorId: string) => void;
  onViewProfile?: (tutorId: string) => void;
}

const TutorCardSkeleton = () => (
  <div className="rounded-lg border p-6 space-y-4">
    <div className="flex items-center space-x-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
    <div className="flex space-x-2">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-6 w-14" />
    </div>
    <div className="flex space-x-2">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
);

export const TutorGrid: React.FC<TutorGridProps> = ({ 
  tutors, 
  loading = false, 
  onBook, 
  onViewProfile 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <TutorCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (tutors.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          No tutors found
        </h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria or check back later for new tutors.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tutors.map((tutor) => (
        <TutorCard
          key={tutor.id}
          tutor={tutor}
          onBook={onBook}
          onViewProfile={onViewProfile}
        />
      ))}
    </div>
  );
};
