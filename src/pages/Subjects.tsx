import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const { user, getDashboardUrl } = useAuth();

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
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="TutorsPool" className="h-10 w-auto" />
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-[#2C2E71] font-medium transition-colors">Home</Link>
              <Link to="/search" className="text-gray-700 hover:text-[#2C2E71] font-medium transition-colors">Find Tutors</Link>
              <Link to="/subjects" className="text-[#2C2E71] font-medium">Subjects</Link>
              <Link to="/about" className="text-gray-700 hover:text-[#2C2E71] font-medium transition-colors">About</Link>
              <Link to="/contact" className="text-gray-700 hover:text-[#2C2E71] font-medium transition-colors">Contact</Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Welcome, {user.name}</span>
                  <Link to={getDashboardUrl()} className="bg-[#2C2E71] text-white px-4 py-2 rounded-lg">
                    Dashboard
                  </Link>
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-[#2C2E71] font-medium transition-colors">Sign In</Link>
                  <Link to="/signup" className="bg-gradient-to-r from-[#2C2E71] to-[#F47B2F] text-white px-6 py-2 rounded-lg">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img src="/logo.png" alt="TutorsPool" className="h-12 w-auto" />
                {/* <span className="text-2xl font-bold">TutorsPool</span> */}
              </div>
              <p className="text-gray-400">
                Empowering students with personalized tutoring and expert guidance for academic success.
              </p>
              <div className="flex space-x-4">
                <Facebook className="h-6 w-6 text-gray-400 hover:text-[#F47B2F] cursor-pointer transition-colors" />
                <Twitter className="h-6 w-6 text-gray-400 hover:text-[#F47B2F] cursor-pointer transition-colors" />
                <Instagram className="h-6 w-6 text-gray-400 hover:text-[#F47B2F] cursor-pointer transition-colors" />
                <Linkedin className="h-6 w-6 text-gray-400 hover:text-[#F47B2F] cursor-pointer transition-colors" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/subjects" className="text-gray-400 hover:text-white transition-colors">Subjects</Link></li>
                <li><Link to="/search" className="text-gray-400 hover:text-white transition-colors">Find Tutors</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-[#F47B2F]" />
                  <span className="text-gray-400">123 Education St, Learning City, LC 12345</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-[#F47B2F]" />
                  <span className="text-gray-400">(555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-[#F47B2F]" />
                  <span className="text-gray-400">support@tutorspool.com</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TutorsPool. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Subjects;
