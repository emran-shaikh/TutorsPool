import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminApi } from '@/lib/api';
import { GraduationCap, Search, Filter, Star, DollarSign, Calendar, Eye, CheckCircle, XCircle } from 'lucide-react';

const TutorsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('ALL');

  const { data: tutorsData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-tutors'],
    queryFn: adminApi.getTutors,
  });

  const tutors = tutorsData?.tutors || [];

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.headline.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === 'ALL' || tutor.subjects.includes(subjectFilter);
    const matchesRating = ratingFilter === 'ALL' || 
                         (ratingFilter === 'HIGH' && tutor.ratingAvg >= 4.5) ||
                         (ratingFilter === 'MEDIUM' && tutor.ratingAvg >= 3.0 && tutor.ratingAvg < 4.5) ||
                         (ratingFilter === 'LOW' && tutor.ratingAvg < 3.0);
    
    return matchesSearch && matchesSubject && matchesRating;
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (tutor: any) => {
    if (tutor.totalBookings === 0) {
      return <Badge variant="outline" className="bg-gray-50 text-gray-600">New</Badge>;
    }
    if (tutor.pendingBookings > 0) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-600">Active</Badge>;
    }
    return <Badge variant="outline" className="bg-green-50 text-green-600">Verified</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tutors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load tutors</p>
          <Button onClick={() => refetch()} className="mt-4">Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-purple-600" />
                Tutors Management
              </h1>
              <p className="text-gray-600 mt-2">
                Review and manage all tutor profiles and performance
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Total Tutors: {tutors.length}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tutors.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tutors</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tutors.filter(t => t.totalBookings > 0).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Tutors</CardTitle>
              <XCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tutors.filter(t => t.totalBookings === 0).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tutors.length > 0 ? (tutors.reduce((sum, t) => sum + (t.ratingAvg || 0), 0) / tutors.length).toFixed(1) : '0.0'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tutors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Subjects</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Literature">Literature</SelectItem>
                  <SelectItem value="Economics">Economics</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Ratings</SelectItem>
                  <SelectItem value="HIGH">High (4.5+)</SelectItem>
                  <SelectItem value="MEDIUM">Medium (3.0-4.4)</SelectItem>
                  <SelectItem value="LOW">Low (&lt;3.0)</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tutors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutors.map((tutor) => (
            <Card key={tutor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{tutor.user?.name}</CardTitle>
                    <CardDescription className="mt-1">{tutor.headline}</CardDescription>
                  </div>
                  {getStatusBadge(tutor)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className={`font-medium ${getRatingColor(tutor.ratingAvg || 0)}`}>
                      {tutor.ratingAvg ? tutor.ratingAvg.toFixed(1) : 'No rating'}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({tutor.ratingCount} reviews)
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-medium">
                      ${(tutor.hourlyRateCents / 100).toFixed(2)}/{tutor.currency}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      {tutor.totalBookings} bookings ({tutor.completedBookings} completed)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {tutor.subjects.slice(0, 3).map((subject: string) => (
                      <Badge key={subject} variant="outline" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                    {tutor.subjects.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{tutor.subjects.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTutors.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tutors found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TutorsManagement;