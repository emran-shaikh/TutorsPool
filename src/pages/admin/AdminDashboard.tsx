import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, GraduationCap, BookOpen, TrendingUp, AlertCircle, ArrowRight, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminApi.getDashboard,
    refetchInterval: 10000, // Refetch every 10 seconds to get updated stats
    staleTime: 0, // Always consider data stale
  });

  // Server returns stats directly, not nested
  const stats = dashboardData || {
    totalUsers: 0,
    totalTutors: 0,
    totalStudents: 0,
    totalBookings: 0,
    pendingReviews: 0,
    activeSessions: 0,
    completedSessions: 0,
    pendingBookings: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
  };

  // Debug logging
  console.log('[AdminDashboard] Dashboard data:', dashboardData);
  console.log('[AdminDashboard] Stats:', stats);

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
    console.error('Dashboard error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load dashboard data</p>
          <p className="text-sm text-gray-500 mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
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

        {/* Stats Grid - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingApprovals} pending approval
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
                {stats.totalStudents} students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeSessions} active sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${((stats.totalRevenue || 0) / 100).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From {stats.completedBookings || 0} completed bookings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingBookings || 0}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting payment/confirmation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.confirmedBookings || 0}</div>
              <p className="text-xs text-muted-foreground">
                Upcoming sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedBookings || 0}</div>
              <p className="text-xs text-muted-foreground">
                Finished sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.cancelledBookings || 0}</div>
              <p className="text-xs text-muted-foreground">
                Cancelled bookings
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
                        {booking.student?.name} booked session with {booking.tutor?.name || booking.tutor?.user?.name || 'Unknown'}
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
                <Link to="/admin/approvals">
                  <Button variant="outline" className="h-20 flex flex-col w-full">
                    <AlertCircle className="w-6 h-6 mb-2" />
                    User Approvals
                  </Button>
                </Link>
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
              {stats.pendingApprovals > 0 && (
                <Link to="/admin/approvals">
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 cursor-pointer transition">
                    <div>
                      <p className="font-medium text-orange-800">Pending User Approvals</p>
                      <p className="text-sm text-orange-600">{stats.pendingApprovals} users waiting for approval</p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <span>Review <ArrowRight className="h-3 w-3 ml-1" /></span>
                    </Button>
                  </div>
                </Link>
              )}
              {stats.pendingBookings > 0 && (
                <Link to="/admin/bookings">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer transition">
                    <div>
                      <p className="font-medium text-blue-800">Pending Bookings</p>
                      <p className="text-sm text-blue-600">{stats.pendingBookings} bookings need attention</p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <span>View <ArrowRight className="h-3 w-3 ml-1" /></span>
                    </Button>
                  </div>
                </Link>
              )}
              {stats.activeSessions > 0 && (
                <Link to="/admin/bookings">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 cursor-pointer transition">
                    <div>
                      <p className="font-medium text-green-800">Active Sessions</p>
                      <p className="text-sm text-green-600">{stats.activeSessions} tutoring sessions in progress</p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <span>Monitor <ArrowRight className="h-3 w-3 ml-1" /></span>
                    </Button>
                  </div>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
