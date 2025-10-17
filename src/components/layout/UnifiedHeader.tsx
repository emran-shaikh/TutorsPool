import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  Menu, 
  X, 
  Globe, 
  Star, 
  User, 
  BookOpen, 
  Calendar, 
  Settings,
  GraduationCap,
  Shield,
  Users,
  BarChart3,
  FileText,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface UnifiedHeaderProps {
  variant?: 'default' | 'transparent' | 'fixed';
  className?: string;
}

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({ 
  variant = 'default', 
  className = '' 
}) => {
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return <BookOpen className="h-4 w-4" />;
      case 'TUTOR':
        return <GraduationCap className="h-4 w-4" />;
      case 'ADMIN':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return 'text-blue-600';
      case 'TUTOR':
        return 'text-purple-600';
      case 'ADMIN':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Global navigation items (visible to everyone)
  const globalNavItems = [
    { label: 'Subjects', href: '/subjects', icon: BookOpen },
    { label: 'Find Tutors', href: '/search', icon: Search },
    { label: 'Blog', href: '/blog', icon: FileText },
    { label: 'Reviews', href: '/#reviews', icon: Star },
    { label: 'About', href: '/about', icon: Users },
    { label: 'Contact', href: '/contact', icon: User },
    { label: 'Become a Tutor', href: '/tutor/register', icon: GraduationCap },
  ];

  // Role-specific navigation items
  const getRoleSpecificNavItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'STUDENT':
        return [
          { label: 'My Bookings', href: '/student/dashboard', icon: Calendar },
          { label: 'Find Tutors', href: '/search', icon: Search },
        ];
      case 'TUTOR':
        return [
          { label: 'My Students', href: '/tutor/dashboard', icon: Users },
          { label: 'Browse Students', href: '/search', icon: Search },
          { label: 'Profile Settings', href: '/tutor/register', icon: Settings },
        ];
      case 'ADMIN':
        return [
          { label: 'Users', href: '/admin/users', icon: Users },
          { label: 'Tutors', href: '/admin/tutors', icon: GraduationCap },
          { label: 'Bookings', href: '/admin/bookings', icon: Calendar },
          { label: 'Blog', href: '/admin/blog', icon: FileText },
          { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
        ];
      default:
        return [];
    }
  };

  const getHeaderClasses = () => {
    const baseClasses = 'bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50';
    
    switch (variant) {
      case 'transparent':
        return 'bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm fixed top-0 left-0 right-0 z-50';
      case 'fixed':
        return 'bg-white shadow-sm border-b border-gray-100 fixed top-0 left-0 right-0 z-50';
      default:
        return baseClasses;
    }
  };

  const roleSpecificItems = getRoleSpecificNavItems();
  // Remove any global items that overlap with role-specific items (by href or label)
  const roleHrefs = new Set(roleSpecificItems.map((i) => i.href));
  const roleLabels = new Set(roleSpecificItems.map((i) => i.label));
  const displayGlobalNavItems = globalNavItems.filter(
    (i) => !roleHrefs.has(i.href) && !roleLabels.has(i.label)
  );

  return (
    <header className={`${getHeaderClasses()} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center space-x-3">
                <img 
                  src="/logo.png" 
                  alt="TutorsPool Logo" 
                  className="h-12 w-auto"
                />
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Global Navigation (only for logged-out users) */}
            {!user && displayGlobalNavItems.map((item) => (
              <Link 
                key={item.label}
                to={item.href} 
                className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
            
            {/* Role-specific Navigation */}
            {roleSpecificItems.length > 0 && (
              <>
                <div className="h-6 w-px bg-gray-300" />
                {roleSpecificItems.map((item) => (
                  <Link 
                    key={item.label}
                    to={item.href} 
                    className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <Globe className="h-4 w-4 mr-1" />
              <span>Global</span>
            </div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className={`text-xs ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate(getDashboardLink()!)}>
                    <User className="h-4 w-4 mr-2" />
                    {getDashboardLabel()}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/account')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Get Started
                </Link>
              </div>
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
              {/* Global Navigation (only for logged-out users) */}
              {!user && displayGlobalNavItems.map((item) => (
                <Link 
                  key={item.label}
                  to={item.href} 
                  className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Role-specific Navigation */}
              {roleSpecificItems.length > 0 && (
                <>
                  <div className="h-px bg-gray-300 my-2" />
                  {roleSpecificItems.map((item) => (
                    <Link 
                      key={item.label}
                      to={item.href} 
                      className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
              
              <div className="pt-4 border-t border-gray-100">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 mb-4">
                      {getRoleIcon(user.role)}
                      <span className="font-medium">{user.name}</span>
                      <span className={`text-xs ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                    
                    {getDashboardLink() && (
                      <Link 
                        to={getDashboardLink()!} 
                        className="text-blue-900 hover:text-blue-700 font-medium block w-full text-left flex items-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        {getDashboardLabel()}
                      </Link>
                    )}
                    
                    <Link 
                      to="/account" 
                      className="text-blue-900 hover:text-blue-700 font-medium block w-full text-left flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Link>
                    
                    <button 
                      onClick={handleSignOut} 
                      className="text-blue-900 hover:text-blue-700 font-medium block w-full text-left flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link 
                      to="/login" 
                      className="text-blue-900 hover:text-blue-700 font-medium block w-full text-left"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/signup" 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium block w-full text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default UnifiedHeader;
