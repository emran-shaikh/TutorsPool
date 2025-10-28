import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  GraduationCap, 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  PieChart,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  Star,
  AlertCircle
} from 'lucide-react';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { apiClient } from '@/lib/api';

const AdminReports: React.FC = () => {
  const { logError } = useErrorLogger({ component: 'AdminReports' });

  // Fetch users report
  const { data: usersReport, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-reports-users'],
    queryFn: async () => {
      return apiClient.request('/admin/reports/users');
    },
  });

  // Fetch revenue report
  const { data: revenueReport, isLoading: revenueLoading, error: revenueError, refetch: refetchRevenue } = useQuery({
    queryKey: ['admin-reports-revenue'],
    queryFn: async () => {
      return apiClient.request('/admin/reports/revenue');
    },
  });

  // Handle errors
  React.useEffect(() => {
    if (usersError) {
      logError(usersError as Error, { action: 'fetch_users_report' });
    }
  }, [usersError, logError]);

  React.useEffect(() => {
    if (revenueError) {
      logError(revenueError as Error, { action: 'fetch_revenue_report' });
    }
  }, [revenueError, logError]);

  const handleRefresh = () => {
    refetchUsers();
    refetchRevenue();
  };

  const handleExport = (type: string) => {
    // TODO: Implement export functionality
    console.log(`Exporting ${type} report...`);
  };

  if (usersLoading || revenueLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Loading reports...</span>
      </div>
    );
  }

  if (usersError || revenueError) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-red-500">Error loading reports</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive platform insights and statistics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => handleExport('all')}>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usersReport?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {usersReport?.activeUsers || 0} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usersReport?.totalTutors || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Verified professionals
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(revenueReport?.totalRevenue || 0) / 100}</div>
                <p className="text-xs text-muted-foreground">
                  {revenueReport?.totalBookings || 0} bookings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{revenueReport?.revenueGrowth || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Registrations</CardTitle>
                <CardDescription>Latest user signups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usersReport?.recentRegistrations?.slice(0, 5).map((user: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Users by role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(usersReport?.usersByRole || {}).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {role === 'STUDENT' && <Users className="h-4 w-4 text-blue-600" />}
                        {role === 'TUTOR' && <GraduationCap className="h-4 w-4 text-green-600" />}
                        {role === 'ADMIN' && <Star className="h-4 w-4 text-purple-600" />}
                        <span className="text-sm font-medium">{role}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{count as number}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Status Overview</CardTitle>
                <CardDescription>Current user status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Users</span>
                    <Badge variant="default">{usersReport?.activeUsers || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pending Users</span>
                    <Badge variant="secondary">{usersReport?.pendingUsers || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Suspended Users</span>
                    <Badge variant="destructive">{usersReport?.suspendedUsers || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Rejected Users</span>
                    <Badge variant="outline">{usersReport?.rejectedUsers || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
                <CardDescription>Download user data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExport('users')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export All Users
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExport('tutors')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Tutors Only
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExport('students')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Students Only
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Financial performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Revenue</span>
                    <span className="text-lg font-bold">${(revenueReport?.totalRevenue || 0) / 100}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Booking Value</span>
                    <span className="text-lg font-bold">${(revenueReport?.averageBookingValue || 0) / 100}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completed Bookings</span>
                    <Badge variant="default">{revenueReport?.completedBookings || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pending Bookings</span>
                    <Badge variant="secondary">{revenueReport?.pendingBookings || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Revenue Data</CardTitle>
                <CardDescription>Download financial reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExport('revenue')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Revenue Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExport('bookings')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Bookings Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Bookings</span>
                    <span className="text-lg font-bold">{revenueReport?.totalBookings || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-lg font-bold">
                      {revenueReport?.totalBookings > 0 
                        ? Math.round((revenueReport?.completedBookings / revenueReport?.totalBookings) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Cancellation Rate</span>
                    <span className="text-lg font-bold">
                      {revenueReport?.totalBookings > 0 
                        ? Math.round((revenueReport?.cancelledBookings / revenueReport?.totalBookings) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Analytics</CardTitle>
                <CardDescription>Download analytics data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExport('analytics')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Analytics Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExport('kpi')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export KPI Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReports;
