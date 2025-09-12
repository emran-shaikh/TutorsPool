import React from 'react';
import { Star, Quote } from 'lucide-react';

const ReviewsSection: React.FC = () => {
  const reviews = [
    {
      id: 1,
      student: 'Alex Thompson',
      image: 'https://d64gsuwffb70l.cloudfront.net/68b7dd2986832bae1512527d_1756880223451_d93521e5.webp',
      tutor: 'Dr. Sarah Johnson',
      subject: 'A Level Mathematics',
      rating: 5,
      review: 'Dr. Johnson helped me improve my A Level Math grade from C to A*. Her teaching method is exceptional and she makes complex concepts easy to understand.',
      improvement: 'Grade improved from C to A*'
    },
    {
      id: 2,
      student: 'Priya Sharma',
      image: 'https://d64gsuwffb70l.cloudfront.net/68b7dd2986832bae1512527d_1756880225164_ccdb0a68.webp',
      tutor: 'Prof. Ahmed Hassan',
      subject: 'IGCSE Chemistry',
      rating: 5,
      review: 'Amazing tutor! Prof. Hassan made chemistry fun and engaging. I went from struggling with basic concepts to achieving top grades in my IGCSE exams.',
      improvement: 'Achieved Grade 9 in IGCSE'
    },
    {
      id: 3,
      student: 'James Wilson',
      image: 'https://d64gsuwffb70l.cloudfront.net/68b7dd2986832bae1512527d_1756880231224_4e479eb9.webp',
      tutor: 'Ms. Emily Chen',
      subject: 'English Literature',
      rating: 5,
      review: 'Ms. Chen\'s passion for literature is contagious. She helped me develop critical thinking skills and improved my essay writing significantly.',
      improvement: '40% improvement in essays'
    },
    {
      id: 4,
      student: 'Maria Garcia',
      image: 'https://d64gsuwffb70l.cloudfront.net/68b7dd2986832bae1512527d_1756880232924_86e749b8.webp',
      tutor: 'Dr. Michael Brown',
      subject: 'Computer Science',
      rating: 5,
      review: 'Dr. Brown is incredibly knowledgeable and patient. He helped me understand programming concepts that I was struggling with for months.',
      improvement: 'Mastered Python & Java'
    }
  ];

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
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative"
            >
              <Quote className="absolute top-6 right-6 h-8 w-8 text-orange-200" />
              
              <div className="flex items-center mb-6">
                <img
                  src={review.image}
                  alt={review.student}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{review.student}</h4>
                  <p className="text-gray-600">{review.subject}</p>
                  <p className="text-sm text-gray-500">with {review.tutor}</p>
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
                "{review.review}"
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
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Write a Review
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;