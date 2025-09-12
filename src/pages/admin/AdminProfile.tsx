import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Key, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Save,
  Edit,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { toast } from '@/components/ui/use-toast';

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  lastLogin?: string;
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    weeklyReports: boolean;
    securityAlerts: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    loginAttempts: number;
  };
}

const AdminProfile: React.FC = () => {
  const { logError } = useErrorLogger({ component: 'AdminProfile' });
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch admin profile
  const { data: profile, isLoading, error, refetch: refetchProfile } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5174/api/admin/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
  });

  // Handle errors separately
  React.useEffect(() => {
    if (error) {
      logError(error as Error, { action: 'fetch_profile' });
    }
  }, [error, logError]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<AdminProfile>) => {
      const response = await fetch('http://localhost:5174/api/admin/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profile'] });
      toast({ title: 'Profile updated successfully' });
      setIsEditing(false);
    },
    onError: (error) => {
      logError(error, { action: 'update_profile' });
      toast({ title: 'Failed to update profile', variant: 'destructive' });
    }
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await fetch('http://localhost:5174/api/admin/profile/password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update password');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Password updated successfully' });
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    },
    onError: (error) => {
      logError(error, { action: 'update_password' });
      toast({ title: 'Failed to update password', variant: 'destructive' });
    }
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: any) => {
      const response = await fetch('http://localhost:5174/api/admin/profile/preferences', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(preferences)
      });
      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profile'] });
      toast({ title: 'Preferences updated successfully' });
    },
    onError: (error) => {
      logError(error, { action: 'update_preferences' });
      toast({ title: 'Failed to update preferences', variant: 'destructive' });
    }
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone
    });
  };

  const handleUpdatePassword = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    updatePasswordMutation.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    });
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    updatePreferencesMutation.mutate({
      [key]: value
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading profile...</div>;
  }

  const profileData = profile as any;

  if (error) {
    return <div className="flex items-center justify-center h-64 text-red-500">Error loading profile</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Profile</h1>
          <p className="text-muted-foreground">Manage your admin account settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchProfile()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={isEditing ? formData.name : profileData?.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={isEditing ? formData.email : profileData?.email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={isEditing ? formData.phone : profileData?.phone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Administrator</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">Active</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Last Login</Label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {profileData?.lastLogin ? new Date(profileData.lastLogin).toLocaleString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
              <Button 
                onClick={handleUpdatePassword}
                disabled={updatePasswordMutation.isPending || !formData.currentPassword || !formData.newPassword}
              >
                <Key className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch 
                  checked={profileData?.security?.twoFactorEnabled || false}
                  disabled
                />
              </div>
              <div className="space-y-0.5">
                <Label>Last Password Change</Label>
                <p className="text-sm text-muted-foreground">
                  {profileData?.security?.lastPasswordChange ? 
                    new Date(profileData.security.lastPasswordChange).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about platform activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch 
                  checked={profileData?.preferences?.emailNotifications || false}
                  onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via SMS
                  </p>
                </div>
                <Switch 
                  checked={profileData?.preferences?.smsNotifications || false}
                  onCheckedChange={(checked) => handlePreferenceChange('smsNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly platform reports
                  </p>
                </div>
                <Switch 
                  checked={profileData?.preferences?.weeklyReports || false}
                  onCheckedChange={(checked) => handlePreferenceChange('weeklyReports', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Security Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive security-related alerts
                  </p>
                </div>
                <Switch 
                  checked={profileData?.preferences?.securityAlerts || true}
                  onCheckedChange={(checked) => handlePreferenceChange('securityAlerts', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                View your recent admin activities and actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Profile updated</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">User approved</p>
                    <p className="text-sm text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Settings className="h-4 w-4 text-yellow-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">System settings updated</p>
                    <p className="text-sm text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminProfile;
