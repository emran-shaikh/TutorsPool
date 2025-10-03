import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import FeaturedTutors from '@/components/FeaturedTutors';
import { 
  ArrowRight, 
  Play, 
  CheckCircle, 
  Clock, 
  Award, 
  Star, 
  Laptop, 
  GraduationCap,
  Users, 
  Shield, 
  BookOpen, 
  Calculator, 
  Microscope, 
  Globe, 
  Code, 
  FileText,
  Languages,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Building,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  MessageSquare,
  MessageCircle,
  TrendingUp
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { user, hasRole, getDashboardUrl } = useAuth();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Fetch featured tutors
  const { data: featuredTutors, isLoading: tutorsLoading } = useQuery({
    queryKey: ['featured-tutors'],
    queryFn: () => apiClient.searchTutors({ limit: 6 }),
  });

  // Dynamic stats - these could come from API
  const stats = {
    students: 15000,
    tutors: 500,
    subjects: 25,
    successRate: 95,
    rating: 4.8,
    reviews: 10000
  };

  // Dynamic testimonials
  const testimonials = [
    {
      id: 1,
      name: 'Emily Rodriguez',
      grade: 'Grade 12 • English (USA)',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b042?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      text: 'I was struggling with essay writing, but my tutor\'s guidance helped me develop strong analytical skills. Highly recommended!',
    },
    {
      id: 2,
      name: 'Marcus Johnson',
      grade: 'Grade 11 • Math (Canada)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      text: 'My math tutor made complex algebra concepts so clear. My grades improved from C to A in just 2 months!',
    },
    {
      id: 3,
      name: 'Sarah Chen',
      grade: 'College • Physics (Australia)',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      text: 'The personalized approach helped me understand physics like never before. Perfect for exam preparation.',
    }
  ];

  // Current testimonial
  const currentTestimonial = testimonials[activeTestimonial];

  // Auto-rotate testimonials
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="TutorsPool" className="h-12 w-auto" />
              {/* <span className="text-xl font-bold text-gradient-brand-primary">TutorsPool</span> */}
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-gradient-brand-primary font-medium transition-colors">Home</Link>
              <Link to="/search" className="text-gray-700 hover:text-gradient-brand-primary font-medium transition-colors">Find Tutors</Link>
              <Link to="/subjects" className="text-gray-700 hover:text-gradient-brand-primary font-medium transition-colors">Subjects</Link>
              <Link to="/about" className="text-gray-700 hover:text-gradient-brand-primary font-medium transition-colors">About</Link>
              <Link to="/contact" className="text-gray-700 hover:text-gradient-brand-primary font-medium transition-colors">Contact</Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="text-gray-600">
                      Welcome, <span className="font-semibold text-gray-900">{user.name}</span>
                    </div>
                    <Badge className="bg-gradient-to-r from-[#2C2E71] to-[#F47B2F] text-white text-xs px-2 py-1">
                      {user.role}
                    </Badge>
                  </div>
                  <Link
                    to={getDashboardUrl()}
                    className="btn-gradient-primary px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                  >
                    Dashboard
                  </Link>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-[#2C2E71] font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-gradient-primary px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {/* Trust Badge */}
              <div className="inline-flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-lg border border-gray-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Trusted by 15,000+ students worldwide</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Transform Your <span className="text-gradient-brand-primary">Learning Journey</span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Connect with world-class tutors for personalized 1-on-1 sessions. Master any subject with expert guidance and flexible scheduling.
                </p>
              </div>

              {/* Key Benefits */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#2C2E71]/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-[#2C2E71]" />
                  </div>
                    <span className="text-sm font-medium text-gray-700">Expert Tutors</span>
                  </div>
                  <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#F47B2F]/10 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-[#F47B2F]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">24/7 Available</span>
                  </div>
                  <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#10B981]/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-[#10B981]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">95% Success Rate</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  to="/signup"
                  className="btn-gradient-primary inline-flex items-center justify-center px-8 py-4 font-semibold rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Start Learning Today
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
                
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-gray-300 hover:bg-gray-50">
                  <Play className="h-5 w-5 mr-2" />
                  Book Free Trial
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    <Avatar className="h-8 w-8 border-2 border-white">
                      <AvatarFallback className="text-xs">S1</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-8 w-8 border-2 border-white">
                      <AvatarFallback className="text-xs">S2</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-8 w-8 border-2 border-white">
                      <AvatarFallback className="text-xs">S3</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-8 w-8 border-2 border-white">
                      <AvatarFallback className="text-xs">S4</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-8 w-8 border-2 border-white">
                      <AvatarFallback className="text-xs">S5</AvatarFallback>
                    </Avatar>
                  </div>
                  <span><strong className="text-gray-700">500+</strong> students joined this week</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">15,000+</div>
                  <div className="text-sm text-gray-600">Happy Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Expert Tutors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">25+</div>
                  <div className="text-sm text-gray-600">Subjects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">95%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Students learning and collaborating together" 
                  className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
                />
              
              {/* Floating Cards */}
              <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium">Live Session</span>
                </div>
                <div className="text-xs text-gray-600">2:00 PM - Active now</div>
              </div>
              
              <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">4.8/5 Rating</span>
                </div>
              </div>
              
              <div className="absolute bottom-4 right-4 bg-white rounded-lg p-3 shadow-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-[#10B981]">95%</div>
                  <div className="text-xs text-gray-600">Success Rate</div>
                </div>
                <div className="text-xs text-gray-500 mt-1">Student Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting started with personalized tutoring is simple and straightforward
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto">
                  01
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Choose Your Subject</h3>
              <p className="text-gray-600">
                Select from 25+ subjects including Math, Science, English, Coding, and more.
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto">
                  02
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                  <Wifi className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Pick Online or Offline</h3>
              <p className="text-gray-600">
                Choose between online video sessions or in-person tutoring based on today’s preference.
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto">
                  03
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Start Learning</h3>
              <p className="text-gray-600">
                Connect with expert tutors and begin your personalized learning journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tutoring Programs Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tutoring Programs</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive learning support across all major subjects and skill levels
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: 'Mathematics', icon: Calculator, color: 'bg-blue-500' },
              { name: 'Science', icon: Microscope, color: 'bg-green-500' },
              { name: 'English', icon: BookOpen, color: 'bg-red-500' },
              { name: 'Test Prep', icon: FileText, color: 'bg-purple-500' },
              { name: 'Coding', icon: Code, color: 'bg-orange-500' },
              { name: 'Languages', icon: Languages, color: 'bg-pink-500' },
            ].map((subject, index) => (
              <Card key={index} className="text-center group hover:shadow-xl transition-all duration-300 cursor-pointer">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${subject.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <subject.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-3">{subject.name}</h3>
                  <Button variant="outline" size="sm" className="text-xs">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tutors Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-[#2C2E71]/10 text-[#2C2E71] mb-4">Why Choose Us</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Expert Tutors</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Meet our top-rated tutors who have helped thousands of students achieve their academic goals
            </p>
          </div>

          <FeaturedTutors 
            tutors={featuredTutors?.items || []} 
            isLoading={tutorsLoading}
            limit={6}
          />
        </div>
      </section>

      {/* TutorsPool Advantage Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-[#F47B2F]/10 text-[#F47B2F] mb-4">Why Choose Us</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">The TutorsPool Advantage</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the difference with our innovative approach to personalized learning
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: 'Expert Tutors',
                description: 'Hand-picked professionals with proven expertise and passion for teaching.',
                color: 'bg-blue-500'
              },
              {
                icon: Clock,
                title: '24/7 Learning',
                description: 'Learn anytime, anywhere with flexible scheduling that fits your lifestyle.',
                color: 'bg-green-500'
              },
              {
                icon: Shield,
                title: 'Secure & Safe',
                description: 'Your data and payments are protected with enterprise-grade security.',
                color: 'bg-purple-500'
              },
              {
                icon: TrendingUp,
                title: 'Proven Results',
                description: '86% of students see significant improvement in their grades and confidence.',
                color: 'bg-orange-500'
              }
            ].map((feature, index) => (
              <Card key={index} className="text-center group hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-gradient-to-r from-[#2C2E71] to-[#F47B2F] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-medium">4.8/5 Average Rating</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Success Stories</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Real students, real results. See how TutorsPool has transformed learning journeys worldwide.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-8 text-center">
                <div className="text-6xl text-white/30 mb-6">"</div>
                <blockquote className="text-xl md:text-2xl font-medium mb-8 leading-relaxed">
                  {currentTestimonial.text}
                </blockquote>
                
                <div className="flex items-center justify-center">
                  <Avatar className="h-16 w-16 border-2 border-white mr-4">
                    <AvatarImage src={currentTestimonial.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-[#2C2E71] to-[#F47B2F]">{currentTestimonial.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <h4 className="font-bold text-lg">{currentTestimonial.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-white/80">{currentTestimonial.grade}</span>
                      <div className="flex">
                        {[...Array(currentTestimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation dots */}
                <div className="flex justify-center space-x-2 mt-8">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === activeTestimonial 
                          ? 'bg-white' 
                          : 'bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">10,000+</div>
                <div className="text-white/80">Reviews</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">95%</div>
                <div className="text-white/80">Success Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">Loved</div>
                <div className="text-white/80">by Students</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Choose Your Learning Style */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Learning Style</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Both online and offline tutoring options available to suit they preferences
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Online Learning */}
            <Card className="bg-gradient-to-br from-[#2C2E71] to-[#2C2E71]/80 text-white overflow-hidden">
              <CardContent className="p-8">
                <div className="mb-8">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
                    <Laptop className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Online Learning</h3>
                  <p className="text-white/90 mb-6">Learn from anywhere, anytime</p>
                  
                  <div className="space-y-4">
                    {[
                      'Interactive video sessions',
                      'Flexible scheduling',
                      'No travel time required',
                      'Screen sharing & digital tools'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button className="w-full bg-white text-[#2C2E71] hover:bg-gray-100">
                  Start Online Learning
                </Button>
              </CardContent>
            </Card>

            {/* Offline Learning */}
            <Card className="bg-gradient-to-br from-[#F47B2F] to-[#F47B2F]/80 text-white overflow-hidden">
              <CardContent className="p-8">
                <div className="mb-8">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
                    <Building className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Offline Learning</h3>
                  <p className="text-white/90 mb-6">Traditional face-to-face tutoring</p>
                  
                  <div className="space-y-4">
                    {[
                      'Personal face-to-face interaction',
                      'Physical learning materials',
                      'Group study opportunities',
                      'Immediate feedback & support'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button className="w-full bg-white text-[#F47B2F] hover:bg-gray-100">
                  Find Local Tutors
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that works best for your learning goals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Hourly Sessions */}
            <Card className="text-center hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Hourly Sessions</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-2">$25</div>
                  <div className="text-gray-600">per hour</div>
                </div>
                
                <div className="space-y-3 mb-8">
                  {['One-on-one tutoring', 'Flexible scheduling', 'Online or offline', 'Expert tutors', 'Progress tracking'].map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full border-[#2C2E71] text-[#2C2E71] hover:bg-[#2C2E71] hover:text-white">
                  Book Now
                </Button>
              </CardContent>
            </Card>

            {/* Monthly Package */}
            <Card className="text-center hover:shadow-xl transition-all duration-300 relative border-2 border-[#2C2E71] transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-[#2C2E71] text-white px-4 py-1">Most Popular</Badge>
              </div>
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Monthly Package</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-2">$199</div>
                  <div className="text-gray-600">per month</div>
                </div>
                
                <div className="space-y-3 mb-8">
                  {['8 hours of tutoring', 'Unlimited subjects', 'Priority scheduling', 'Study materials', 'Progress reports', '24/7 support'].map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button className="w-full bg-[#2C2E71] hover:bg-[#1e3a8a] text-white">
                  Book Now
                </Button>
              </CardContent>
            </Card>

            {/* Group Sessions */}
            <Card className="text-center hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Group Sessions</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-2">$15</div>
                  <div className="text-gray-600">per hour</div>
                </div>
                
                <div className="space-y-3 mb-8">
                  {['Small group learning', 'Peer interaction', 'Cost-effective', 'Collaborative environment', 'Regular assessments'].map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full border-[#2C2E71] text-[#2C2E71] hover:bg-[#2C2E71] hover:text-white">
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#2C2E71] to-[#F47B2F] text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Boost Your Grades Today</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of successful students who have improved their grades with our expert tutoring.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="bg-white text-[#2C2E71] hover:bg-gray-100 px-8 py-3 text-lg">
              Join Online Learning
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#2C2E71] px-8 py-3 text-lg">
              Find Offline Tutors
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1F2937] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img src="/logo.png" alt="TutorsPool" className="h-12 w-auto" />
                {/* <span className="text-xl font-bold">TutorsPool</span> */}
              </div>
              <p className="text-gray-400 max-w-sm">
                Empowering students with personalized tutoring and expert guidance for academic success.
              </p>
              <div className="flex space-x-4">
                <Facebook className="h-6 w-6 text-gray-400 hover:text-[#F47B2F] cursor-pointer transition-colors" />
                <Twitter className="h-6 w-6 text-gray-400 hover:text-[#F47B2F] cursor-pointer transition-colors" />
                <Linkedin className="h-6 w-6 text-gray-400 hover:text-[#F47B2F] cursor-pointer transition-colors" />
                <Instagram className="h-6 w-6 text-gray-400 hover:text-[#F47B2F] cursor-pointer transition-colors" />
              </div>
            </div>   
            <div className="space-y-2">
              <h3 className="font-semibold">Quick Links</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                <Link to="/about">About Us</Link>
                <Link to="/subjects">Subjects</Link>
                <Link to="/search">Find Tutors</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/about">Pricing</Link>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Support</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div>Help Center</div>
                <div>FAQ</div>
                <div>Privacy Policy</div>
                <div>Terms of Service</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Get In Touch</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-[#F47B2F]" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-[#F47B2F]" />
                  <span>support@tutorspool.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-[#F47B2F]" />
                  <span>123 Education St, Learning City</span>
                </div>
                
                <div className="pt-4">
                  <Button className="bg-green-500 hover:bg-green-600 text-white text-sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TutorsPool. All rights reserved | Made with ❤️ for students</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Support Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button className="bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl">
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;