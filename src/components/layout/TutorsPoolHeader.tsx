import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  Settings, 
  LogOut, 
  User, 
  GraduationCap, 
  BookOpen, 
  Shield,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '@/components/notifications/NotificationBell';

interface TutorsPoolHeaderProps {
  className?: string;
}

const TutorsPoolHeader: React.FC<TutorsPoolHeaderProps> = ({ className = '' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'TUTOR': return <GraduationCap className="h-4 w-4" />;
      case 'STUDENT': return <BookOpen className="h-4 w-4" />;
      case 'ADMIN': return <Shield className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'TUTOR': return 'text-purple-600';
      case 'STUDENT': return 'text-blue-600';
      case 'ADMIN': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getDashboardPath = (role: string) => {
    switch (role) {
      case 'TUTOR': return '/tutor/dashboard';
      case 'STUDENT': return '/student/dashboard';
      case 'ADMIN': return '/admin';
      default: return '/';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className={`bg-white border-b border-gray-200 shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="TutorsPool Logo" 
                className="h-12 w-auto"
              />
              {/* <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  TutorsPool
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Learning Platform</p>
              </div> */}
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to={getDashboardPath(user?.role || '')} 
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              Dashboard
            </Link>
            {user?.role === 'STUDENT' && (
              <>
                <Link to="/search" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                  Find Tutors
                </Link>
                <Link to="/booking" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                  Book Session
                </Link>
              </>
            )}
            {user?.role === 'TUTOR' && (
              <>
                <Link to="/search" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                  Browse Students
                </Link>
                <Link to="/tutor/register" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                  Profile Settings
                </Link>
              </>
            )}
            {user?.role === 'ADMIN' && (
              <>
                <Link to="/admin/users" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                  Users
                </Link>
                <Link to="/admin/bookings" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                  Bookings
                </Link>
                <Link to="/admin/reports" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                  Reports
                </Link>
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationBell />

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
                      {user?.name ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                    <div className="flex items-center space-x-1">
                      {getRoleIcon(user?.role || '')}
                      <p className={`text-xs ${getRoleColor(user?.role || '')}`}>
                        {user?.role || 'USER'}
                      </p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/account')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/account')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TutorsPoolHeader;
