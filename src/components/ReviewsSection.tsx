import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, Quote, Loader2, Heart, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { reviewsApi } from '@/lib/api';
import SuccessStoryForm from '@/components/reviews/SuccessStoryForm';

const ReviewsSection: React.FC = () => {
  const { user } = useAuth();
  const [showSuccessStoryForm, setShowSuccessStoryForm] = useState(false);

  // Fetch featured reviews from API
  const { data: reviewsData, isLoading, error } = useQuery({
    queryKey: ['featured-reviews'],
    queryFn: reviewsApi.getFeaturedReviews,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fallback reviews if no real reviews exist yet
  const fallbackReviews = [
    {
      id: 'fallback-1',
      studentName: 'Alex Thompson',
      studentImage: 'https://d64gsuwffb70l.cloudfront.net/68b7dd2986832bae1512527d_1756880223451_d93521e5.webp',
      tutorName: 'Dr. Sarah Johnson',
      subject: 'A Level Mathematics',
      rating: 5,
      comment: 'Dr. Johnson helped me improve my A Level Math grade from C to A*. Her teaching method is exceptional and she makes complex concepts easy to understand.',
      improvement: 'Grade improved from C to A*'
    },
    {
      id: 'fallback-2',
      studentName: 'Priya Sharma',
      studentImage: 'https://d64gsuwffb70l.cloudfront.net/68b7dd2986832bae1512527d_1756880225164_ccdb0a68.webp',
      tutorName: 'Prof. Ahmed Hassan',
      subject: 'IGCSE Chemistry',
      rating: 5,
      comment: 'Amazing tutor! Prof. Hassan made chemistry fun and engaging. I went from struggling with basic concepts to achieving top grades in my IGCSE exams.',
      improvement: 'Achieved Grade 9 in IGCSE'
    },
    {
      id: 'fallback-3',
      studentName: 'James Wilson',
      studentImage: 'https://d64gsuwffb70l.cloudfront.net/68b7dd2986832bae1512527d_1756880231224_4e479eb9.webp',
      tutorName: 'Ms. Emily Chen',
      subject: 'English Literature',
      rating: 5,
      comment: 'Ms. Chen\'s passion for literature is contagious. She helped me develop critical thinking skills and improved my essay writing significantly.',
      improvement: '40% improvement in essays'
    },
    {
      id: 'fallback-4',
      studentName: 'Maria Garcia',
      studentImage: 'https://d64gsuwffb70l.cloudfront.net/68b7dd2986832bae1512527d_1756880232924_86e749b8.webp',
      tutorName: 'Dr. Michael Brown',
      subject: 'Computer Science',
      rating: 5,
      comment: 'Dr. Brown\'s expertise in programming is outstanding. He guided me through complex algorithms and helped me build confidence in coding.',
      improvement: 'Mastered Python & Java'
    }
  ];

  // Use API reviews if available, otherwise use fallback
  const reviews = reviewsData?.reviews && reviewsData.reviews.length > 0 
    ? reviewsData.reviews 
    : fallbackReviews;

  console.log('Reviews data:', { 
    apiReviews: reviewsData?.reviews?.length || 0, 
    usingFallback: !reviewsData?.reviews || reviewsData.reviews.length === 0,
    error: error?.message 
  });

  const handleWriteReview = () => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    setShowSuccessStoryForm(true);
  };

  if (isLoading) {
    return (
      <section id="reviews" className="py-20 bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading success stories...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="reviews" className="py-20 bg-gradient-to-br from-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Success Stories from Our Students
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real results from real students. See how our expert tutors have helped thousands achieve their academic goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.map((review: any) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative"
            >
              <Quote className="absolute top-6 right-6 h-8 w-8 text-orange-200" />
              
              <div className="flex items-center mb-6">
                <img
                  src={review.studentImage || review.image}
                  alt={review.studentName || review.student}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                  onError={(e) => {
                    // Fallback to generated avatar if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.studentName || review.student)}&background=random`;
                  }}
                />
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{review.studentName || review.student}</h4>
                  <p className="text-gray-600">{review.subject}</p>
                  <p className="text-sm text-gray-500">with {review.tutorName || review.tutor}</p>
                </div>
              </div>

              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                "{review.comment || review.review}"
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="bg-green-500 rounded-full p-1 mr-3">
                    <Star className="h-4 w-4 text-white fill-current" />
                  </div>
                  <span className="text-green-800 font-semibold">
                    Result: {review.improvement}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Share Your Success Story
            </h3>
            <p className="text-gray-600 mb-6">
              Had a great experience with one of our tutors? We'd love to hear about it!
            </p>
            <button 
              onClick={handleWriteReview}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
            >
              <Heart className="h-5 w-5" />
              <span>Write a Review</span>
            </button>
            
            {!user && (
              <p className="text-sm text-gray-500 mt-3">
                <Users className="h-4 w-4 inline mr-1" />
                Sign in to share your success story
              </p>
            )}
          </div>
        </div>

        {/* Success Story Form Modal */}
        <SuccessStoryForm 
          isOpen={showSuccessStoryForm} 
          onOpenChange={setShowSuccessStoryForm} 
        />
      </div>
    </section>
  );
};

export default ReviewsSection;