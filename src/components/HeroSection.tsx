import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, Award, Globe, ArrowRight } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: `url('https://d64gsuwffb70l.cloudfront.net/68b7dd2986832bae1512527d_1756880216596_4606a17f.webp')`
        }}
      ></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Connect with
              <span className="text-orange-400 block">Expert Tutors</span>
              Worldwide
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8 leading-relaxed">
              Master O Levels, IGCSE, and A Levels with personalized 1-on-1 tutoring from verified educators across the globe.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link 
                to="/search" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center transition-all transform hover:scale-105"
              >
                <Search className="h-5 w-5 mr-2" />
                Find a Tutor
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              <Link 
                to="/signup" 
                className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
              >
                Become a Tutor
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-orange-400 mr-2" />
                  <span className="text-2xl font-bold">10,000+</span>
                </div>
                <p className="text-blue-200">Active Students</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-6 w-6 text-orange-400 mr-2" />
                  <span className="text-2xl font-bold">2,500+</span>
                </div>
                <p className="text-blue-200">Verified Tutors</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-2">
                  <Globe className="h-6 w-6 text-orange-400 mr-2" />
                  <span className="text-2xl font-bold">50+</span>
                </div>
                <p className="text-blue-200">Countries</p>
              </div>
            </div>
          </div>

          {/* Quick Search Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Find Your Perfect Tutor</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                  <option>Select a subject...</option>
                  <option>Mathematics</option>
                  <option>Chemistry</option>
                  <option>Physics</option>
                  <option>Biology</option>
                  <option>English</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                  <option>Select level...</option>
                  <option>O Levels</option>
                  <option>IGCSE</option>
                  <option>A Levels</option>
                </select>
              </div>
              <Link 
                to="/search" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors inline-block text-center"
              >
                Search Tutors
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;