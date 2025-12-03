import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { adminApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  UserCheck, 
  UserX, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const UserApprovals: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionDialog, setActionDialog] = useState<'approve' | 'reject' | 'suspend' | null>(null);
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: pendingUsers, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-pending-users'],
    queryFn: adminApi.getPendingUsers,
    refetchInterval: 5000, // Refetch every 5 seconds to get new registrations
    staleTime: 0, // Always consider data stale
  });

  const handleUserAction = async (action: 'approve' | 'reject' | 'suspend') => {
    if (!selectedUser) return;

    try {
      setIsProcessing(true);
      
      switch (action) {
        case 'approve':
          await adminApi.approveUser(selectedUser.id);
          toast({
            title: 'User Approved',
            description: `${selectedUser.name} has been approved successfully`,
          });
          break;
        case 'reject':
          await adminApi.rejectUser(selectedUser.id, reason);
          toast({
            title: 'User Rejected',
            description: `${selectedUser.name} has been rejected`,
          });
          break;
        case 'suspend':
          await adminApi.suspendUser(selectedUser.id, reason);
          toast({
            title: 'User Suspended',
            description: `${selectedUser.name} has been suspended`,
          });
          break;
      }

      // Invalidate and refetch data
      queryClient.invalidateQueries({ queryKey: ['admin-pending-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      
      setActionDialog(null);
      setSelectedUser(null);
      setReason('');
    } catch (error: any) {
      console.error(`Error ${action}ing user:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action} user: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openActionDialog = (user: any, action: 'approve' | 'reject' | 'suspend') => {
    setSelectedUser(user);
    setActionDialog(action);
    setReason('');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle },
      SUSPENDED: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
      ACTIVE: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load pending users</p>
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
                <UserCheck className="w-8 h-8 text-purple-600" />
                User Approvals
              </h1>
              <p className="text-gray-600 mt-2">
                Review and approve new user registrations
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Pending Users: {pendingUsers?.length || 0}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingUsers?.filter((u: any) => u.status === 'PENDING').length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tutors Pending</CardTitle>
              <User className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingUsers?.filter((u: any) => u.role === 'TUTOR' && u.status === 'PENDING').length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students Pending</CardTitle>
              <User className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingUsers?.filter((u: any) => u.role === 'STUDENT' && u.status === 'PENDING').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Users ({pendingUsers?.length || 0})</CardTitle>
            <CardDescription>
              Users waiting for approval to access the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingUsers && pendingUsers.length > 0 ? (
              <div className="space-y-4">
                {pendingUsers.map((user: any) => (
                  <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{user.name}</h3>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(user.status)}
                              <Badge variant="outline">
                                {user.role}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {user.daysPending} days pending
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          {user.country && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>{user.country}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Registered: {formatDate(user.createdAt)}</span>
                          </div>
                        </div>

                        {/* Profile Information */}
                        {user.profile && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Profile Information:</h4>
                            {user.role === 'TUTOR' && user.profile.headline && (
                              <p className="text-sm text-gray-600 mb-1">
                                <strong>Headline:</strong> {user.profile.headline}
                              </p>
                            )}
                            {user.profile.bio && (
                              <p className="text-sm text-gray-600 mb-1">
                                <strong>Bio:</strong> {user.profile.bio}
                              </p>
                            )}
                            {user.role === 'TUTOR' && user.profile.hourlyRateCents && (
                              <p className="text-sm text-gray-600 mb-1">
                                <strong>Hourly Rate:</strong> ${(user.profile.hourlyRateCents / 100).toFixed(2)}
                              </p>
                            )}
                            {user.profile.subjects && user.profile.subjects.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {user.profile.subjects.map((subject: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {subject}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button 
                          size="sm" 
                          className="text-green-600 hover:text-green-700"
                          onClick={() => openActionDialog(user, 'approve')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => openActionDialog(user, 'reject')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-orange-600 hover:text-orange-700"
                          onClick={() => openActionDialog(user, 'suspend')}
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Suspend
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending users</h3>
                <p className="text-gray-500">All users have been reviewed</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Dialog */}
        <Dialog open={actionDialog !== null} onOpenChange={() => setActionDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionDialog === 'approve' && 'Approve User'}
                {actionDialog === 'reject' && 'Reject User'}
                {actionDialog === 'suspend' && 'Suspend User'}
              </DialogTitle>
              <DialogDescription>
                {actionDialog === 'approve' && `Are you sure you want to approve ${selectedUser?.name}?`}
                {actionDialog === 'reject' && `Are you sure you want to reject ${selectedUser?.name}?`}
                {actionDialog === 'suspend' && `Are you sure you want to suspend ${selectedUser?.name}?`}
              </DialogDescription>
            </DialogHeader>
            
            {(actionDialog === 'reject' || actionDialog === 'suspend') && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={`Enter reason for ${actionDialog}ing this user...`}
                    rows={3}
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setActionDialog(null)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleUserAction(actionDialog!)}
                disabled={isProcessing}
                className={
                  actionDialog === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  actionDialog === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-orange-600 hover:bg-orange-700'
                }
              >
                {isProcessing ? 'Processing...' : 
                 actionDialog === 'approve' ? 'Approve' :
                 actionDialog === 'reject' ? 'Reject' : 'Suspend'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UserApprovals;
