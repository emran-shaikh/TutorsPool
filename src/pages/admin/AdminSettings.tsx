import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Shield, 
  Bell, 
  Globe, 
  Database, 
  Mail, 
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { toast } from '@/components/ui/use-toast';

const AdminSettings: React.FC = () => {
  const { logError } = useErrorLogger({ component: 'AdminSettings' });
  const [isSaving, setIsSaving] = useState(false);

  // Platform Settings
  const [platformSettings, setPlatformSettings] = useState({
    siteName: 'Tutorspool',
    siteDescription: 'Professional tutoring platform',
    siteUrl: 'https://tutorspool.com',
    supportEmail: 'support@tutorspool.com',
    adminEmail: 'admin@tutorspool.com',
    maxFileSize: '10MB',
    allowedFileTypes: 'pdf,doc,docx,jpg,png,mp4',
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    enableRegistration: true,
    requireEmailVerification: true,
    enableTwoFactor: false,
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    adminAlerts: true,
    userAlerts: true,
    systemAlerts: true,
    maintenanceAlerts: true,
    securityAlerts: true,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    enableAuditLog: true,
    enableIpWhitelist: false,
    enableRateLimiting: true,
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@tutorspool.com',
    fromName: 'Tutorspool',
    enableSsl: true,
    enableTls: true,
  });

  const handleSave = async (section: string) => {
    setIsSaving(true);
    try {
      // TODO: Implement actual save functionality
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: 'Settings saved successfully',
        description: `${section} settings have been updated.`,
      });
    } catch (error) {
      logError(error as Error, { action: 'save_settings', section });
      toast({
        title: 'Error saving settings',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = (section: string) => {
    // TODO: Implement reset functionality
    toast({
      title: 'Settings reset',
      description: `${section} settings have been reset to defaults.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground">Configure platform settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="platform" className="space-y-4">
        <TabsList>
          <TabsTrigger value="platform">Platform</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        {/* Platform Settings */}
        <TabsContent value="platform" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Configuration</CardTitle>
              <CardDescription>Basic platform settings and information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={platformSettings.siteName}
                    onChange={(e) => setPlatformSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={platformSettings.siteUrl}
                    onChange={(e) => setPlatformSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={platformSettings.supportEmail}
                    onChange={(e) => setPlatformSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={platformSettings.adminEmail}
                    onChange={(e) => setPlatformSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={platformSettings.siteDescription}
                  onChange={(e) => setPlatformSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to register on the platform
                  </p>
                </div>
                <Switch
                  checked={platformSettings.enableRegistration}
                  onCheckedChange={(checked) => setPlatformSettings(prev => ({ ...prev, enableRegistration: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Users must verify their email before accessing the platform
                  </p>
                </div>
                <Switch
                  checked={platformSettings.requireEmailVerification}
                  onCheckedChange={(checked) => setPlatformSettings(prev => ({ ...prev, requireEmailVerification: checked }))}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleSave('platform')} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Platform Settings
                </Button>
                <Button variant="outline" onClick={() => handleReset('platform')}>
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure notification settings for the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via SMS
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send push notifications to mobile devices
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Admin Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Send alerts to administrators
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.adminAlerts}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, adminAlerts: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Send security-related alerts
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.securityAlerts}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, securityAlerts: checked }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleSave('notifications')} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Notification Settings
                </Button>
                <Button variant="outline" onClick={() => handleReset('notifications')}>
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
              <CardDescription>Configure security settings and policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    value={securitySettings.lockoutDuration}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, lockoutDuration: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Special Characters</Label>
                    <p className="text-sm text-muted-foreground">
                      Passwords must contain special characters
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.requireSpecialChars}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireSpecialChars: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Numbers</Label>
                    <p className="text-sm text-muted-foreground">
                      Passwords must contain numbers
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.requireNumbers}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireNumbers: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Uppercase</Label>
                    <p className="text-sm text-muted-foreground">
                      Passwords must contain uppercase letters
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.requireUppercase}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireUppercase: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Audit Log</Label>
                    <p className="text-sm text-muted-foreground">
                      Log all administrative actions
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.enableAuditLog}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, enableAuditLog: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">
                      Limit API requests per user
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.enableRateLimiting}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, enableRateLimiting: checked }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleSave('security')} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
                </Button>
                <Button variant="outline" onClick={() => handleReset('security')}>
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure SMTP settings for email notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={emailSettings.smtpHost}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    value={emailSettings.smtpUser}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable SSL</Label>
                    <p className="text-sm text-muted-foreground">
                      Use SSL encryption for SMTP
                    </p>
                  </div>
                  <Switch
                    checked={emailSettings.enableSsl}
                    onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, enableSsl: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable TLS</Label>
                    <p className="text-sm text-muted-foreground">
                      Use TLS encryption for SMTP
                    </p>
                  </div>
                  <Switch
                    checked={emailSettings.enableTls}
                    onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, enableTls: checked }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleSave('email')} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Email Settings
                </Button>
                <Button variant="outline" onClick={() => handleReset('email')}>
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Settings */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Maintenance</CardTitle>
              <CardDescription>System maintenance and cleanup operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Clear Cache</h3>
                    <p className="text-sm text-muted-foreground">
                      Clear application cache to free up memory
                    </p>
                  </div>
                  <Button variant="outline">
                    Clear Cache
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Clean Logs</h3>
                    <p className="text-sm text-muted-foreground">
                      Remove old log files to free up disk space
                    </p>
                  </div>
                  <Button variant="outline">
                    Clean Logs
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Optimize Database</h3>
                    <p className="text-sm text-muted-foreground">
                      Optimize database tables for better performance
                    </p>
                  </div>
                  <Button variant="outline">
                    Optimize DB
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Backup Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Create a backup of all platform data
                    </p>
                  </div>
                  <Button variant="outline">
                    Create Backup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
