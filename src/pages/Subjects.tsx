import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Calculator, 
  Microscope, 
  BookOpen, 
  Code, 
  Music, 
  Palette, 
  Globe, 
  TrendingUp,
  User,
  Settings,
  Star,
  Users,
  Clock,
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

const Subjects: React.FC = () => {

  const subjects = [
    { name: 'Mathematics', slug: 'mathematics', icon: Calculator, description: 'Algebra, Calculus, Geometry, Statistics', tutors: 247 },
    { name: 'Physics', slug: 'physics', icon: Microscope, description: 'Mechanics, Thermodynamics, Quantum Physics', tutors: 156 },
    { name: 'Chemistry', slug: 'chemistry', icon: Microscope, description: 'Organic, Inorganic, Physical Chemistry', tutors: 134 },
    { name: 'Biology', slug: 'biology', icon: Microscope, description: 'Cell Biology, Genetics, Ecology', tutors: 189 },
    { name: 'English', slug: 'english', icon: BookOpen, description: 'Literature, Grammar, Creative Writing', tutors: 298 },
    { name: 'Computer Science', slug: 'computer-science', icon: Code, description: 'Programming, Algorithms, Data Structures', tutors: 167 },
    { name: 'History', slug: 'history', icon: Globe, description: 'World History, American History', tutors: 89 },
    { name: 'Economics', slug: 'economics', icon: TrendingUp, description: 'Micro/Macro Economics, Finance', tutors: 73 },
    { name: 'Art', slug: 'art', icon: Palette, description: 'Drawing, Painting, Art History', tutors: 45 },
    { name: 'Music', slug: 'music', icon: Music, description: 'Instrumental, Theory, Composition', tutors: 67 },
    { name: 'Foreign Languages', slug: 'languages', icon: Globe, description: 'Spanish, French, German, Mandarin', tutors: 203 },
    { name: 'SAT/ACT Prep', slug: 'test-prep', icon: TrendingUp, description: 'Standardized test preparation', tutors: 134 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Header variant="transparent" />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
             <span className="text-[#2C2E71]">Expert Tutoring</span> in Every Subject
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
             Find the perfect tutor for any subject, any level, anytime you need help.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              to="/search"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#2C2E71] to-[#F47B2F] text-white font-semibold rounded-lg"
            >
              <Users className="h-5 w-5 mr-2" />
              Find Your Tutor
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* SubjectGrid */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Card key={subject.slug} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-xl">
                      <subject.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{subject.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">{subject.tutors} Expert Tutors</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <CardDescription className="text-gray-600 mb-4">
                    {subject.description}
                  </CardDescription>
                  
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/search?subject=${subject.slug}`}
                      className="text-[#2C2E71] hover:text-[#1e2048] font-medium flex items-center group"
                    >
                      Browse Tutors
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    
                    <Badge variant="outline" className="text-xs">
                      {subject.tutors} tutors
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Subjects;
