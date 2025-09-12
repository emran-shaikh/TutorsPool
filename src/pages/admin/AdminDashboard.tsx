import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  Search,
  RefreshCw,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  Star,
  MessageSquare,
  Shield,
  Settings
} from 'lucide-react';
import { apiClient, adminApi } from '@/lib/api';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { ReviewsManagement } from '@/components/admin/ReviewsManagement';
import TutorsPoolHeader from '@/components/layout/TutorsPoolHeader';

interface DashboardStats {
  totalUsers: number;
  totalTutors: number;
  totalStudents: number;
  totalBookings: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeSessions: number;
  averageRating: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TUTOR' | 'ADMIN';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED';
  createdAt: string;
  lastLogin?: string;
  profile?: any;
}

interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  subjectId: string;
  startAtUTC: string;
  endAtUTC: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED';
  priceCents: number;
  currency: string;
  createdAt: string;
  refundStatus?: 'PENDING' | 'PROCESSED' | 'CLOSED';
  refundReason?: string;
  refundProcessedAt?: string;
  student?: User;
  tutor?: User;
}

const AdminDashboard: React.FC = () => {
  const { logError } = useErrorLogger({ component: 'AdminDashboard' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getDashboard()
  });

  // Handle stats error
  React.useEffect(() => {
    if (statsError) {
      logError(statsError, { action: 'fetch_stats' });
    }
  }, [statsError, logError]);

  // Debug: Log stats data
  React.useEffect(() => {
    console.log('Admin Dashboard Stats:', stats);
  }, [stats]);

  // Fetch all users
  const { data: users, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers()
  });

  // Handle users error
  React.useEffect(() => {
    if (usersError) {
      logError(usersError, { action: 'fetch_users' });
    }
  }, [usersError, logError]);

  // Debug: Log users data
  React.useEffect(() => {
    console.log('Admin Dashboard Users:', users);
  }, [users]);

  // Fetch recent bookings
  const { data: bookings, isLoading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => adminApi.getBookings()
  });

  // Handle bookings error
  React.useEffect(() => {
    if (bookingsError) {
      logError(bookingsError, { action: 'fetch_bookings' });
    }
  }, [bookingsError, logError]);

  // Debug: Log bookings data
  React.useEffect(() => {
    console.log('Admin Dashboard Bookings:', bookings);
  }, [bookings]);

  const handleUserAction = async (userId: string, action: string, reason?: string) => {
    try {
      switch (action) {
        case 'approve':
          await adminApi.approveUser(userId);
          break;
        case 'reject':
          await adminApi.rejectUser(userId, reason);
          break;
        case 'suspend':
          await adminApi.suspendUser(userId, reason);
          break;
        case 'activate':
          await adminApi.activateUser(userId);
          break;
        case 'delete':
          await adminApi.deleteUser(userId);
          break;
        default:
          throw new Error('Invalid action');
      }
      
      refetchUsers();
      refetchStats();
      refetchBookings();
    } catch (error) {
      logError(error, { action, userId });
    }
  };

  const handleBookingAction = async (bookingId: string, status: string, reason?: string) => {
    try {
      await adminApi.updateBookingStatus(bookingId, status, reason);
      refetchBookings();
      refetchStats();
    } catch (error) {
      logError(error, { action: 'update_booking_status', bookingId, status });
    }
  };

  const handleRefundProcess = async (bookingId: string, action: string) => {
    try {
      // This would typically call a separate refund processing API
      console.log(`Processing refund for booking ${bookingId} with action: ${action}`);
      
      // For now, we'll just update the booking with a refund status
      await adminApi.updateBookingStatus(bookingId, 'REFUNDED', `Refund ${action.toLowerCase()}`);
      
      refetchBookings();
      refetchStats();
    } catch (error) {
      logError(error, { action: 'process_refund', bookingId, refundAction: action });
    }
  };

  const generateReport = (type: string) => {
    try {
      let reportData = '';
      let filename = '';

      switch (type) {
        case 'users':
          reportData = generateUsersReport();
          filename = `users-report-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'revenue':
          reportData = generateRevenueReport();
          filename = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'bookings':
          reportData = generateBookingsReport();
          filename = `bookings-report-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'ratings':
          reportData = generateRatingsReport();
          filename = `ratings-report-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'activity':
          reportData = generateActivityReport();
          filename = `activity-report-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'platform':
          reportData = generatePlatformReport();
          filename = `platform-report-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'refunds':
          reportData = generateRefundsReport();
          filename = `refunds-report-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        default:
          return;
      }

      // Create and download CSV
      const blob = new Blob([reportData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      logError(error, { action: 'generate_report', type });
    }
  };

  const generateUsersReport = () => {
    const headers = 'Name,Email,Role,Status,Created At,Last Login\n';
    const rows = users?.map(user => 
      `"${user.name}","${user.email}","${user.role}","${user.status}","${new Date(user.createdAt).toLocaleDateString()}","${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}"`
    ).join('\n') || '';
    return headers + rows;
  };

  const generateRevenueReport = () => {
    const completedBookings = bookings?.filter(b => b.status === 'COMPLETED') || [];
    const headers = 'Date,Student,Tutor,Subject,Amount,Currency\n';
    const rows = completedBookings.map(booking => 
      `"${new Date(booking.createdAt).toLocaleDateString()}","${booking.student?.name || 'Unknown'}","${booking.tutor?.name || 'Unknown'}","${booking.subjectId}","${booking.priceCents / 100}","${booking.currency}"`
    ).join('\n');
    return headers + rows;
  };

  const generateBookingsReport = () => {
    const headers = 'ID,Student,Tutor,Subject,Start Time,End Time,Status,Amount,Created At\n';
    const rows = bookings?.map(booking => 
      `"${booking.id}","${booking.student?.name || 'Unknown'}","${booking.tutor?.name || 'Unknown'}","${booking.subjectId}","${new Date(booking.startAtUTC).toLocaleString()}","${new Date(booking.endAtUTC).toLocaleString()}","${booking.status}","${booking.priceCents / 100}","${new Date(booking.createdAt).toLocaleDateString()}"`
    ).join('\n') || '';
    return headers + rows;
  };

  const generateRatingsReport = () => {
    // This would need to fetch reviews data
    const headers = 'Platform Overview\n';
    const data = `Average Rating,${stats?.averageRating?.toFixed(2) || '0.00'}\n` +
                 `Total Users,${stats?.totalUsers || 0}\n` +
                 `Total Bookings,${stats?.totalBookings || 0}\n` +
                 `Total Revenue,$${(stats?.totalRevenue || 0) / 100}\n`;
    return headers + data;
  };

  const generateActivityReport = () => {
    const headers = 'Metric,Value\n';
    const data = `Active Sessions,${stats?.activeSessions || 0}\n` +
                 `Pending Approvals,${stats?.pendingApprovals || 0}\n` +
                 `Completed Bookings,${bookings?.filter(b => b.status === 'COMPLETED').length || 0}\n` +
                 `Cancelled Bookings,${bookings?.filter(b => b.status === 'CANCELLED').length || 0}\n` +
                 `Success Rate,${Math.round(((bookings?.filter(b => b.status === 'COMPLETED').length || 0) / (bookings?.length || 1)) * 100)}%\n`;
    return headers + data;
  };

  const generatePlatformReport = () => {
    const headers = 'Tutorspool Platform Report\n';
    const summary = `Generated on: ${new Date().toLocaleString()}\n\n` +
                   `USERS\n` +
                   `Total Users: ${stats?.totalUsers || 0}\n` +
                   `Total Tutors: ${stats?.totalTutors || 0}\n` +
                   `Total Students: ${stats?.totalStudents || 0}\n` +
                   `Active Users: ${users?.filter(u => u.status === 'ACTIVE').length || 0}\n` +
                   `Pending Approvals: ${stats?.pendingApprovals || 0}\n\n` +
                   `BOOKINGS\n` +
                   `Total Bookings: ${stats?.totalBookings || 0}\n` +
                   `Completed: ${bookings?.filter(b => b.status === 'COMPLETED').length || 0}\n` +
                   `Confirmed: ${bookings?.filter(b => b.status === 'CONFIRMED').length || 0}\n` +
                   `Pending: ${bookings?.filter(b => b.status === 'PENDING').length || 0}\n` +
                   `Cancelled: ${bookings?.filter(b => b.status === 'CANCELLED').length || 0}\n\n` +
                   `REVENUE\n` +
                   `Total Revenue: $${(stats?.totalRevenue || 0) / 100}\n` +
                   `Average Session Value: $${stats?.totalBookings > 0 ? ((stats.totalRevenue || 0) / stats.totalBookings / 100).toFixed(2) : '0.00'}\n\n` +
                   `PERFORMANCE\n` +
                   `Average Rating: ${stats?.averageRating?.toFixed(2) || '0.00'}\n` +
                   `Success Rate: ${Math.round(((bookings?.filter(b => b.status === 'COMPLETED').length || 0) / (bookings?.length || 1)) * 100)}%\n` +
                   `Active Sessions: ${stats?.activeSessions || 0}\n`;
    return headers + summary;
  };

  const generateRefundsReport = () => {
    const refundedBookings = bookings?.filter(b => b.status === 'REFUNDED') || [];
    const headers = 'ID,Student,Tutor,Subject,Amount,Currency,Refund Status,Refund Reason,Refund Date,Created At\n';
    const rows = refundedBookings.map(booking => 
      `"${booking.id}","${booking.student?.name || 'Unknown'}","${booking.tutor?.name || 'Unknown'}","${booking.subjectId}","${booking.priceCents / 100}","${booking.currency}","${booking.refundStatus || 'PENDING'}","${booking.refundReason || 'N/A'}","${booking.refundProcessedAt ? new Date(booking.refundProcessedAt).toLocaleDateString() : 'N/A'}","${new Date(booking.createdAt).toLocaleDateString()}"`
    ).join('\n');
    return headers + rows;
  };

  const filteredUsers = users?.filter((user: User) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  }) || [];

  // Remove duplicates based on user.id to fix React key warning
  const userMap = new Map();
  filteredUsers.forEach(user => {
    userMap.set(user.id, user);
  });
  const uniqueUsers = Array.from(userMap.values());

  // Debug: Log if there were duplicates
  if (filteredUsers.length !== uniqueUsers.length) {
    console.log(`Removed ${filteredUsers.length - uniqueUsers.length} duplicate users`);
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      ACTIVE: 'default',
      PENDING: 'secondary',
      SUSPENDED: 'destructive',
      REJECTED: 'outline'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'TUTOR': return <GraduationCap className="h-4 w-4" />;
      case 'STUDENT': return <BookOpen className="h-4 w-4" />;
      case 'ADMIN': return <Shield className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  if (statsLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (statsError || usersError) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-red-500">Error loading dashboard data</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TutorsPoolHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage students, tutors, and platform operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            refetchStats();
            refetchUsers();
            refetchBookings();
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.totalRevenue || 0) / 100}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingApprovals || 0}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently online
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users Management</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Users Management Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage all users, approve/reject applications, and monitor activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Roles</SelectItem>
                    <SelectItem value="STUDENT">Students</SelectItem>
                    <SelectItem value="TUTOR">Tutors</SelectItem>
                    <SelectItem value="ADMIN">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <div className="space-y-4">
                {uniqueUsers.map((user: User, index: number) => (
                  <div key={`${user.id}-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role)}
                        <div>
                          <h3 className="font-medium">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(user.status)}
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {user.status === 'PENDING' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'approve')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'reject')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        {user.status === 'ACTIVE' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'suspend')}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            Suspend
                          </Button>
                        )}
                        
                        {user.status === 'SUSPENDED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'activate')}
                            className="text-green-600 hover:text-green-700"
                          >
                            Activate
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'delete')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Management</CardTitle>
              <CardDescription>
                Monitor all booking activities and manage sessions
              </CardDescription>
              <div className="flex gap-2 mt-4">
                <Badge variant="outline" className="text-green-600">
                  Completed: {bookings?.filter(b => b.status === 'COMPLETED').length || 0}
                </Badge>
                <Badge variant="outline" className="text-blue-600">
                  Confirmed: {bookings?.filter(b => b.status === 'CONFIRMED').length || 0}
                </Badge>
                <Badge variant="outline" className="text-yellow-600">
                  Pending: {bookings?.filter(b => b.status === 'PENDING').length || 0}
                </Badge>
                <Badge variant="outline" className="text-red-600">
                  Cancelled: {bookings?.filter(b => b.status === 'CANCELLED').length || 0}
                </Badge>
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  Refunded: {bookings?.filter(b => b.status === 'REFUNDED').length || 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings?.map((booking: Booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium">
                        {booking.tutor?.name} → {booking.student?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                            Subject: {booking.subjectId}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.startAtUTC).toLocaleString()} - {new Date(booking.endAtUTC).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                            Amount: ${booking.priceCents / 100} {booking.currency}
                          </p>
                          {booking.status === 'REFUNDED' && (
                            <div className="mt-2">
                              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                Refunded
                              </Badge>
                              {booking.refundStatus && (
                                <Badge variant="secondary" className="ml-2">
                                  {booking.refundStatus}
                                </Badge>
                              )}
                              {booking.refundReason && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Reason: {booking.refundReason}
                                </p>
                              )}
                              {booking.refundProcessedAt && (
                                <p className="text-xs text-muted-foreground">
                                  Processed: {new Date(booking.refundProcessedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Created: {new Date(booking.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge variant={
                        booking.status === 'COMPLETED' ? 'default' :
                        booking.status === 'CONFIRMED' ? 'secondary' :
                        booking.status === 'PENDING' ? 'outline' :
                        booking.status === 'CANCELLED' ? 'destructive' :
                        booking.status === 'REFUNDED' ? 'outline' :
                        'outline'
                      } className={
                        booking.status === 'REFUNDED' ? 'text-yellow-600 border-yellow-600' : ''
                      }>
                        {booking.status}
                      </Badge>
                      
                      <div className="flex space-x-2">
                        {booking.status === 'PENDING' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBookingAction(booking.id, 'CONFIRMED')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBookingAction(booking.id, 'CANCELLED', 'Cancelled by admin')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        {booking.status === 'CONFIRMED' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBookingAction(booking.id, 'COMPLETED')}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Complete
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBookingAction(booking.id, 'CANCELLED', 'Cancelled by admin')}
                              className="text-red-600 hover:text-red-700"
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        
                        {(booking.status === 'CANCELLED' || booking.status === 'COMPLETED') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBookingAction(booking.id, 'REFUNDED', 'Refunded by admin')}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            Refund
                          </Button>
                        )}
                        
                        {booking.status === 'REFUNDED' && (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBookingAction(booking.id, 'COMPLETED', 'Reopened after refund')}
                              className="text-green-600 hover:text-green-700"
                            >
                              Reopen
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRefundProcess(booking.id, 'PROCESSED')}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Process Refund
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRefundProcess(booking.id, 'CLOSED')}
                              className="text-gray-600 hover:text-gray-700"
                            >
                              Close Case
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!bookings || bookings.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No bookings found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Revenue Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                  <span className="font-bold text-lg">${(stats?.totalRevenue || 0) / 100}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completed Bookings</span>
                  <span className="font-medium">{bookings?.filter(b => b.status === 'COMPLETED').length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. Session Value</span>
                  <span className="font-medium">
                    ${bookings?.filter(b => b.status === 'COMPLETED').length > 0 
                      ? ((stats?.totalRevenue || 0) / bookings.filter(b => b.status === 'COMPLETED').length / 100).toFixed(2)
                      : '0.00'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending Revenue</span>
                  <span className="font-medium text-yellow-600">
                    ${(bookings?.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING')
                      .reduce((sum, booking) => sum + (booking.priceCents || 0), 0) / 100) || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* User Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Users</span>
                  <span className="font-bold text-lg">{stats?.totalUsers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Tutors</span>
                  <span className="font-medium text-green-600">
                    {users?.filter(u => u.role === 'TUTOR' && u.status === 'ACTIVE').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Students</span>
                  <span className="font-medium text-blue-600">
                    {users?.filter(u => u.role === 'STUDENT' && u.status === 'ACTIVE').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending Approvals</span>
                  <span className="font-medium text-yellow-600">{stats?.pendingApprovals || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Suspended Users</span>
                  <span className="font-medium text-red-600">
                    {users?.filter(u => u.status === 'SUSPENDED').length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            {/* Booking Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Bookings</span>
                  <span className="font-bold text-lg">{stats?.totalBookings || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-medium text-green-600">
                    {bookings?.filter(b => b.status === 'COMPLETED').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Confirmed</span>
                  <span className="font-medium text-blue-600">
                    {bookings?.filter(b => b.status === 'CONFIRMED').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="font-medium text-yellow-600">
                    {bookings?.filter(b => b.status === 'PENDING').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cancelled</span>
                  <span className="font-medium text-red-600">
                    {bookings?.filter(b => b.status === 'CANCELLED').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Refunded</span>
                  <span className="font-medium text-yellow-600">
                    {bookings?.filter(b => b.status === 'REFUNDED').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <span className="font-medium text-green-600">
                    {stats?.totalBookings > 0 
                      ? Math.round((bookings?.filter(b => b.status === 'COMPLETED').length / stats.totalBookings) * 100)
                      : 0
                    }%
                  </span>
                </div>
              </CardContent>
            </Card>
            
            {/* Refund Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Refund Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Refunds</span>
                  <span className="font-bold text-lg text-yellow-600">
                    {bookings?.filter(b => b.status === 'REFUNDED').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending Processing</span>
                  <span className="font-medium text-orange-600">
                    {bookings?.filter(b => b.status === 'REFUNDED' && (!b.refundStatus || b.refundStatus === 'PENDING')).length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Processed</span>
                  <span className="font-medium text-blue-600">
                    {bookings?.filter(b => b.refundStatus === 'PROCESSED').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Closed Cases</span>
                  <span className="font-medium text-gray-600">
                    {bookings?.filter(b => b.refundStatus === 'CLOSED').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Refund Amount</span>
                  <span className="font-medium text-red-600">
                    ${(bookings?.filter(b => b.status === 'REFUNDED')
                      .reduce((sum, b) => sum + (b.priceCents || 0), 0) / 100).toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Refund Rate</span>
                  <span className="font-medium text-yellow-600">
                    {stats?.totalBookings > 0 
                      ? Math.round((bookings?.filter(b => b.status === 'REFUNDED').length / stats.totalBookings) * 100)
                      : 0
                    }%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Health */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats?.averageRating?.toFixed(1) || '0.0'}</div>
                  <div className="text-sm text-muted-foreground">Avg. Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats?.activeSessions || 0}</div>
                  <div className="text-sm text-muted-foreground">Active Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats?.totalTutors > 0 && stats?.totalStudents > 0 
                      ? Math.round((stats.totalStudents / stats.totalTutors) * 10) / 10
                      : '0.0'
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Student/Tutor Ratio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {bookings?.length > 0 && users?.length > 0
                      ? Math.round((bookings.length / users.length) * 10) / 10
                      : '0.0'
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Bookings per User</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Reports</CardTitle>
              <CardDescription>
                Create and download various platform reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col"
                  onClick={() => generateReport('users')}
                >
                  <Users className="h-6 w-6 mb-2" />
                  User Report
                  <span className="text-xs text-muted-foreground">
                    {users?.length || 0} users
                  </span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col"
                  onClick={() => generateReport('revenue')}
                >
                  <DollarSign className="h-6 w-6 mb-2" />
                  Revenue Report
                  <span className="text-xs text-muted-foreground">
                    ${(stats?.totalRevenue || 0) / 100} total
                  </span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col"
                  onClick={() => generateReport('bookings')}
                >
                  <BookOpen className="h-6 w-6 mb-2" />
                  Booking Report
                  <span className="text-xs text-muted-foreground">
                    {stats?.totalBookings || 0} bookings
                  </span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col"
                  onClick={() => generateReport('ratings')}
                >
                  <Star className="h-6 w-6 mb-2" />
                  Rating Report
                  <span className="text-xs text-muted-foreground">
                    {stats?.averageRating?.toFixed(1) || '0.0'} avg rating
                  </span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col"
                  onClick={() => generateReport('activity')}
                >
                  <Calendar className="h-6 w-6 mb-2" />
                  Activity Report
                  <span className="text-xs text-muted-foreground">
                    {stats?.activeSessions || 0} active
                  </span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col"
                  onClick={() => generateReport('platform')}
                >
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Platform Report
                  <span className="text-xs text-muted-foreground">
                    Complete overview
                  </span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col"
                  onClick={() => generateReport('refunds')}
                >
                  <DollarSign className="h-6 w-6 mb-2" />
                  Refund Report
                  <span className="text-xs text-muted-foreground">
                    {bookings?.filter(b => b.status === 'REFUNDED').length || 0} refunds
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats for Reports */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{users?.filter(u => u.status === 'PENDING').length || 0}</div>
                  <div className="text-sm text-muted-foreground">Pending Approvals</div>
                  {(users?.filter(u => u.status === 'PENDING').length || 0) > 0 && (
                    <Badge variant="destructive" className="mt-2">Requires Action</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{bookings?.filter(b => b.status === 'PENDING').length || 0}</div>
                  <div className="text-sm text-muted-foreground">Pending Bookings</div>
                  {(bookings?.filter(b => b.status === 'PENDING').length || 0) > 0 && (
                    <Badge variant="secondary" className="mt-2">Needs Review</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${(bookings?.filter(b => b.status === 'COMPLETED').reduce((sum, b) => sum + (b.priceCents || 0), 0) / 100).toFixed(0) || '0'}
                  </div>
                  <div className="text-sm text-muted-foreground">This Month Revenue</div>
                  <Badge variant="outline" className="mt-2">Completed</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(((bookings?.filter(b => b.status === 'COMPLETED').length || 0) / (bookings?.length || 1)) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                  <Badge variant="outline" className="mt-2">Performance</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
