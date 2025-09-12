import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, GraduationCap, BookOpen, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminApi.getDashboard,
  });

  const stats = dashboardData?.stats || {
    totalUsers: 0,
    totalTutors: 0,
    totalStudents: 0,
    totalBookings: 0,
    pendingReviews: 0,
    activeSessions: 0,
    completedSessions: 0,
    pendingBookings: 0,
  };

  const recentBookings = dashboardData?.recentBookings || [];
  const recentUsers = dashboardData?.recentUsers || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load dashboard data</p>
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
                <Shield className="w-8 h-8 text-purple-600" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {user?.name}! Manage your platform effectively.
              </p>
            </div>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Admin Access
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tutors</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTutors}</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                +15% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                +23% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Latest platform activities and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {booking.student?.name} booked session with {booking.tutor?.user?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {booking.status}
                    </Badge>
                  </div>
                ))}
                {recentUsers.slice(0, 3).map((user) => (
                  <div key={user.id} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {user.name} registered as {user.role}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {user.role}
                    </Badge>
                  </div>
                ))}
                {recentBookings.length === 0 && recentUsers.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No recent activities
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/admin/users">
                  <Button variant="outline" className="h-20 flex flex-col w-full">
                    <Users className="w-6 h-6 mb-2" />
                    Manage Users
                  </Button>
                </Link>
                <Link to="/admin/tutors">
                  <Button variant="outline" className="h-20 flex flex-col w-full">
                    <GraduationCap className="w-6 h-6 mb-2" />
                    Review Tutors
                  </Button>
                </Link>
                <Link to="/admin/bookings">
                  <Button variant="outline" className="h-20 flex flex-col w-full">
                    <BookOpen className="w-6 h-6 mb-2" />
                    View Bookings
                  </Button>
                </Link>
                <Button variant="outline" className="h-20 flex flex-col">
                  <AlertCircle className="w-6 h-6 mb-2" />
                  Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-orange-800">Pending Tutor Reviews</p>
                  <p className="text-sm text-orange-600">{stats.pendingReviews} tutors waiting for approval</p>
                </div>
                <Button size="sm" variant="outline">
                  Review
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-800">Active Sessions</p>
                  <p className="text-sm text-blue-600">{stats.activeSessions} tutoring sessions in progress</p>
                </div>
                <Button size="sm" variant="outline">
                  Monitor
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;