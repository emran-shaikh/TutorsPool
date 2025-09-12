import React from 'react';
import { Shield, Clock, Globe, CreditCard, MessageSquare, Award, Users, BookOpen } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: 'Verified Tutors',
      description: 'All tutors undergo rigorous background checks and qualification verification for your safety and quality assurance.'
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Learn at your own pace with tutors available across different time zones, ensuring flexible scheduling.'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Connect with expert tutors from around the world, bringing diverse perspectives and teaching methods.'
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      description: 'Safe and secure payment processing with multiple payment options including PayPal, Stripe, and local methods.'
    },
    {
      icon: MessageSquare,
      title: 'AI-Powered Matching',
      description: 'Our intelligent system matches you with the perfect tutor based on your learning style and requirements.'
    },
    {
      icon: Award,
      title: 'Quality Guarantee',
      description: 'Not satisfied with your first lesson? Get a full refund or we\'ll find you a better-matched tutor.'
    },
    {
      icon: Users,
      title: 'Small Group Classes',
      description: 'Join small group sessions with peers at similar levels for collaborative learning experiences.'
    },
    {
      icon: BookOpen,
      title: 'Resource Library',
      description: 'Access thousands of study materials, practice tests, and educational resources curated by our experts.'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose TutorsPool?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We provide a comprehensive learning platform with features designed to ensure your academic success and peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="text-center group hover:bg-gray-50 p-6 rounded-2xl transition-all duration-300"
              >
                <div className="bg-orange-100 rounded-2xl p-4 w-16 h-16 mx-auto mb-6 group-hover:bg-orange-200 transition-colors">
                  <Icon className="h-8 w-8 text-orange-500 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="mt-20 bg-gray-50 rounded-2xl p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Trusted by Students Worldwide
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-900 mb-2">98%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-900 mb-2">4.9/5</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-900 mb-2">50k+</div>
              <div className="text-gray-600">Lessons Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-900 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;