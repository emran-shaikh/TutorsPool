import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight, Calendar, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Tutor {
  id: string;
  slug?: string;
  userId: string;
  headline?: string;
  subjects?: string[];
  ratingAvg?: number;
  ratingCount?: number;
  hourlyRateCents?: number;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

interface FeaturedTutorsProps {
  tutors?: Tutor[];
  isLoading?: boolean;
  limit?: number;
}

const FeaturedTutors: React.FC<FeaturedTutorsProps> = ({ tutors = [], isLoading = false, limit = 6 }) => {
  const { hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C2E71] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading featured tutors...</p>
      </div>
    );
  }

  if (!tutors || tutors.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">No tutors available at the moment</div>
        <Button asChild>
          <Link to="/search">Find Tutors</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tutors.slice(0, limit).map((tutor) => (
        <Card key={tutor.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-[#2C2E71]/20 to-[#F47B2F]/20"></div>
            <div className="absolute top-4 left-4">
              <Badge className="bg-green-500 text-white">
                <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                Online Today
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                <AvatarImage src={tutor.user?.avatarUrl} />
                <AvatarFallback className="bg-gradient-to-br from-[#2C2E71] to-[#F47B2F] text-white text-lg">
                  {tutor.user?.name?.split(' ').map((n: string) => n[0]).join('') || 'T'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="font-bold text-lg">{tutor.user?.name || 'Expert Tutor'}</h3>
                <p className="text-[#2C2E71] font-medium">{tutor.headline || 'Professional Tutor'}</p>
                
                <div className="flex items-center mt-2 space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {(tutor.ratingAvg || 4.8).toFixed(1)} ({tutor.ratingCount || 12} reviews)
                  </span>
                </div>
                
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(tutor.subjects || ['Math', 'Science']).slice(0, 2).map((subject: string) => (
                      <Badge key={subject} variant="outline" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-gray-900">
                      ${tutor.hourlyRateCents ? (tutor.hourlyRateCents / 100).toFixed(0) : '25'}/hr
                    </div>
                    {hasRole('STUDENT') ? (
                      <Button size="sm" className="btn-gradient-accent" asChild>
                        <Link to={`/tutor/${tutor.slug || tutor.id}`}>
                          <Calendar className="h-4 w-4 mr-1" />
                          Book Now
                        </Link>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/tutor/${tutor.slug || tutor.id}`}>
                          <User className="h-4 w-4 mr-1" />
                          View Profile
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FeaturedTutors;