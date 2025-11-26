import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Shield, Eye, EyeOff } from 'lucide-react';

const AdminRegistrationForm: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    timezone: 'America/New_York',
    adminCode: '', // Special admin verification code
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        timezone: formData.timezone,
        role: 'ADMIN',
        adminCode: formData.adminCode,
      });

      if (error) {
        toast({
          title: 'Registration Failed',
          description: error,
          variant: 'destructive',
        });
        setSubmitting(false);
      } else {
        toast({
          title: 'Admin Account Created!',
          description: 'Welcome to the admin panel. Redirecting...',
        });
        // Wait longer to ensure token is persisted and auth context updates
        setTimeout(() => {
          console.log('Redirecting to admin dashboard');
          navigate('/admin/dashboard', { replace: true });
        }, 1000);
      }
    } catch (error) {
      console.error('Admin registration error:', error);
      toast({
        title: 'Registration Failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="admin-name">Full Name *</Label>
          <Input
            id="admin-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-email">Email Address *</Label>
          <Input
            id="admin-email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="admin@tutorspool.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="admin-phone">Phone Number</Label>
          <Input
            id="admin-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+92 (345) 3284 284"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-country">Country *</Label>
          <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USA">United States</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="UK">United Kingdom</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
              <SelectItem value="Germany">Germany</SelectItem>
              <SelectItem value="France">France</SelectItem>
              <SelectItem value="India">India</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-timezone">Timezone</Label>
        <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your timezone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
            <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
            <SelectItem value="Europe/London">London (GMT)</SelectItem>
            <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
            <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
            <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-code">Admin Verification Code *</Label>
        <div className="relative">
          <Input
            id="admin-code"
            type={showPassword ? 'text' : 'password'}
            value={formData.adminCode}
            onChange={(e) => handleInputChange('adminCode', e.target.value)}
            placeholder="Enter admin verification code"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Contact the platform administrator for the verification code.
        </p>
      </div>

      <Button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        disabled={submitting || !formData.name || !formData.email || !formData.country || !formData.adminCode}
      >
        {submitting ? (
          'Creating Admin Account...'
        ) : (
          <>
            <Shield className="w-4 h-4 mr-2" />
            Create Admin Account
          </>
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Admin accounts have full access to platform management features.
        </p>
      </div>
    </form>
  );
};

export default AdminRegistrationForm;
