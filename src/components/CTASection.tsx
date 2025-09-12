import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, GraduationCap } from 'lucide-react';

const CTASection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Excel in Your Studies?
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Join thousands of successful students who have achieved their academic goals with our expert tutors. 
            Start your learning journey today!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Student CTA */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/15 transition-all duration-300">
            <div className="bg-orange-500 rounded-full p-4 w-16 h-16 mx-auto mb-6">
              <Users className="h-8 w-8 text-white mx-auto" />
            </div>
            <h3 className="text-2xl font-bold mb-4">For Students</h3>
            <p className="text-blue-100 mb-6 leading-relaxed">
              Find your perfect tutor and start improving your grades with personalized 1-on-1 lessons.
            </p>
            <ul className="text-left text-blue-100 mb-8 space-y-2">
              <li>• Browse 2,500+ verified tutors</li>
              <li>• Book flexible lesson times</li>
              <li>• Get instant homework help</li>
              <li>• Track your progress</li>
            </ul>
            <Link 
              to="/search" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center w-full transition-all transform hover:scale-105"
            >
              Find a Tutor
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>

          {/* Tutor CTA */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/15 transition-all duration-300">
            <div className="bg-green-500 rounded-full p-4 w-16 h-16 mx-auto mb-6">
              <GraduationCap className="h-8 w-8 text-white mx-auto" />
            </div>
            <h3 className="text-2xl font-bold mb-4">For Tutors</h3>
            <p className="text-blue-100 mb-6 leading-relaxed">
              Share your expertise and earn money by teaching students from around the world.
            </p>
            <ul className="text-left text-blue-100 mb-8 space-y-2">
              <li>• Set your own rates & schedule</li>
              <li>• Teach from anywhere</li>
              <li>• Access to 10,000+ students</li>
              <li>• Secure payment processing</li>
            </ul>
            <Link 
              to="/signup" 
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center w-full transition-all transform hover:scale-105"
            >
              Become a Tutor
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-20 bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
            <p className="text-blue-100">Get study tips, tutor spotlights, and exclusive offers delivered to your inbox.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;