import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Menu, X, Globe, Star, User, BookOpen, Calendar, Settings } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'STUDENT':
        return '/student/dashboard';
      case 'TUTOR':
        return '/tutor/dashboard';
      case 'ADMIN':
        return '/admin';
      default:
        return '/account';
    }
  };

  const getDashboardLabel = () => {
    if (!user) return 'Dashboard';
    
    switch (user.role) {
      case 'STUDENT':
        return 'Student Dashboard';
      case 'TUTOR':
        return 'Tutor Dashboard';
      case 'ADMIN':
        return 'Admin Panel';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold text-blue-900 hover:text-blue-700 transition-colors">
                Tutors<span className="text-orange-500">Pool</span>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/#subjects" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">Subjects</Link>
            <Link to="/search" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">Find Tutors</Link>
            <Link to="/#reviews" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">Reviews</Link>
            <Link to="/#about" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">About</Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <Globe className="h-4 w-4 mr-1" />
              <span>Global</span>
            </div>
            {user ? (
              <div className="flex items-center space-x-4">
                {getDashboardLink() && (
                  <Link 
                    to={getDashboardLink()!} 
                    className="text-blue-900 hover:text-blue-700 font-medium transition-colors flex items-center"
                  >
                    <User className="h-4 w-4 mr-1" />
                    {getDashboardLabel()}
                  </Link>
                )}
                <Link to="/account" className="text-blue-900 hover:text-blue-700 font-medium transition-colors flex items-center">
                  <Settings className="h-4 w-4 mr-1" />
                  Account
                </Link>
                <button 
                  onClick={handleSignOut} 
                  className="text-blue-900 hover:text-blue-700 font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-blue-900 hover:text-blue-700 font-medium transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link to="/#subjects" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">Subjects</Link>
              <Link to="/search" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">Find Tutors</Link>
              <Link to="/#reviews" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">Reviews</Link>
              <Link to="/#about" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">About</Link>
              <div className="pt-4 border-t border-gray-100">
                {user ? (
                  <div className="space-y-2">
                    {getDashboardLink() && (
                      <Link 
                        to={getDashboardLink()!} 
                        className="text-blue-900 hover:text-blue-700 font-medium block w-full text-left flex items-center"
                      >
                        <User className="h-4 w-4 mr-2" />
                        {getDashboardLabel()}
                      </Link>
                    )}
                    <Link 
                      to="/account" 
                      className="text-blue-900 hover:text-blue-700 font-medium block w-full text-left flex items-center"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Account
                    </Link>
                    <button 
                      onClick={handleSignOut} 
                      className="text-blue-900 hover:text-blue-700 font-medium block w-full text-left"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <>
                    <Link to="/login" className="text-blue-900 hover:text-blue-700 font-medium block w-full text-left mb-2">
                      Sign In
                    </Link>
                    <Link to="/signup" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium w-full inline-block text-center">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;