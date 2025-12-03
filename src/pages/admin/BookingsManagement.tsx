import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { adminApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Search, Filter, Calendar, Clock, DollarSign, User, GraduationCap, CheckCircle, XCircle, Eye, Edit } from 'lucide-react';

const BookingsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [statusUpdateDialog, setStatusUpdateDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: bookingsData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: adminApi.getBookings,
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 0,
  });

  // Handle both array and object response formats
  const bookings = Array.isArray(bookingsData) 
    ? bookingsData 
    : (bookingsData?.bookings || []);

  const handleStatusUpdate = async () => {
    if (!selectedBooking || !newStatus) return;

    try {
      setIsUpdating(true);
      await adminApi.updateBookingStatus(selectedBooking.id, newStatus, statusReason);
      
      toast({
        title: 'Success',
        description: `Booking status updated to ${newStatus}`,
      });

      // Invalidate and refetch data
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      
      setStatusUpdateDialog(false);
      setSelectedBooking(null);
      setNewStatus('');
      setStatusReason('');
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update booking status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const openStatusUpdateDialog = (booking: any, status: string) => {
    setSelectedBooking(booking);
    setNewStatus(status);
    setStatusReason('');
    setStatusUpdateDialog(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setDateFilter('ALL');
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.tutor?.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.subjectId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'ALL') {
      const bookingDate = new Date(booking.startAtUTC);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      switch (dateFilter) {
        case 'TODAY':
          matchesDate = bookingDate >= today && bookingDate < tomorrow;
          break;
        case 'TOMORROW':
          matchesDate = bookingDate >= tomorrow && bookingDate < nextWeek;
          break;
        case 'THIS_WEEK':
          matchesDate = bookingDate >= today && bookingDate < nextWeek;
          break;
        case 'UPCOMING':
          matchesDate = bookingDate > now;
          break;
        case 'PAST':
          matchesDate = bookingDate < now;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'outline';
      case 'CONFIRMED': return 'default';
      case 'COMPLETED': return 'secondary';
      case 'CANCELLED': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-orange-600';
      case 'CONFIRMED': return 'text-blue-600';
      case 'COMPLETED': return 'text-green-600';
      case 'CANCELLED': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load bookings</p>
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
                <BookOpen className="w-8 h-8 text-purple-600" />
                Bookings Management
              </h1>
              <p className="text-gray-600 mt-2">
                Monitor and manage all tutoring sessions and bookings
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Total Bookings: {bookings.length}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookings.filter(b => b.status === 'PENDING').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookings.filter(b => b.status === 'CONFIRMED').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookings.filter(b => b.status === 'COMPLETED').length}
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
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Dates</SelectItem>
                  <SelectItem value="TODAY">Today</SelectItem>
                  <SelectItem value="TOMORROW">Tomorrow</SelectItem>
                  <SelectItem value="THIS_WEEK">This Week</SelectItem>
                  <SelectItem value="UPCOMING">Upcoming</SelectItem>
                  <SelectItem value="PAST">Past</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center gap-2" onClick={clearFilters}>
                <Filter className="w-4 h-4" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
            <CardDescription>
              All tutoring sessions and bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Session</th>
                    <th className="text-left p-4">Student</th>
                    <th className="text-left p-4">Tutor</th>
                    <th className="text-left p-4">Subject</th>
                    <th className="text-left p-4">Date & Time</th>
                    <th className="text-left p-4">Price</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => {
                    const { date, time } = formatDateTime(booking.startAtUTC);
                    return (
                      <tr key={booking.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium">#{booking.id.slice(-8)}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="font-medium">{booking.student?.name}</div>
                              <div className="text-sm text-gray-500">{booking.student?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="font-medium">{booking.tutor?.name || booking.tutor?.user?.name || 'Unknown Tutor'}</div>
                              <div className="text-sm text-gray-500">{booking.tutor?.email || booking.tutor?.user?.email || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{booking.subjectId}</Badge>
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{date}</div>
                            <div className="text-sm text-gray-500">{time}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">
                            {formatCurrency(booking.priceCents, booking.currency)}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={getStatusBadgeVariant(booking.status)}>
                            <span className={getStatusColor(booking.status)}>
                              {booking.status}
                            </span>
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedBooking(booking);
                                // You could add a view details dialog here
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            
                            {booking.status === 'PENDING' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => openStatusUpdateDialog(booking, 'CONFIRMED')}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => openStatusUpdateDialog(booking, 'CANCELLED')}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            
                            {booking.status === 'CONFIRMED' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-blue-600 hover:text-blue-700"
                                onClick={() => openStatusUpdateDialog(booking, 'COMPLETED')}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Complete
                              </Button>
                            )}
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openStatusUpdateDialog(booking, booking.status)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filteredBookings.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </CardContent>
          </Card>
        )}

        {/* Status Update Dialog */}
        <Dialog open={statusUpdateDialog} onOpenChange={setStatusUpdateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Booking Status</DialogTitle>
              <DialogDescription>
                Update the status for booking #{selectedBooking?.id?.slice(-8)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Enter reason for status change..."
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setStatusUpdateDialog(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleStatusUpdate}
                disabled={isUpdating || !newStatus}
              >
                {isUpdating ? 'Updating...' : 'Update Status'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BookingsManagement;