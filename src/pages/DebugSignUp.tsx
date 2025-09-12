import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const DebugSignUp: React.FC = () => {
  const [name, setName] = useState('Test Student');
  const [email, setEmail] = useState('test.student@example.com');
  const [country, setCountry] = useState('United States');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const { register: registerUser } = useAuth();
  const { toast } = useToast();

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testApiHealth = async () => {
    try {
      addLog('Testing API health...');
      const result = await apiClient.healthCheck();
      addLog(`API Health: ${JSON.stringify(result)}`);
      toast({ title: 'API Health', description: 'API is working!' });
    } catch (error) {
      addLog(`API Health Error: ${error}`);
      toast({ title: 'API Error', description: `${error}`, variant: 'destructive' });
    }
  };

  const testUserRegistration = async () => {
    try {
      addLog('Testing user registration...');
      const result = await registerUser({
        name,
        email: `${Date.now()}.${email}`, // Use unique email
        country,
        role: 'STUDENT',
      });
      
      if (result.error) {
        addLog(`User Registration Error: ${result.error}`);
        toast({ title: 'Registration Error', description: result.error, variant: 'destructive' });
      } else {
        addLog(`User Registration: Success`);
        toast({ title: 'User Registration', description: 'User registered successfully!' });
      }
    } catch (error) {
      addLog(`User Registration Error: ${error}`);
      toast({ title: 'Registration Error', description: `${error}`, variant: 'destructive' });
    }
  };

  const testStudentProfile = async () => {
    try {
      addLog('Testing student profile creation...');
      const result = await apiClient.createStudentProfile({
        gradeLevel: 'High School (9-12)',
        learningGoals: 'I want to improve my math skills and prepare for college',
        preferredMode: 'ONLINE',
        budgetMin: 2000, // $20
        budgetMax: 5000, // $50
        specialRequirements: 'Need help with calculus',
      });
      addLog(`Student Profile: ${JSON.stringify(result)}`);
      toast({ title: 'Student Profile', description: 'Profile created successfully!' });
    } catch (error) {
      addLog(`Student Profile Error: ${error}`);
      toast({ title: 'Profile Error', description: `${error}`, variant: 'destructive' });
    }
  };

  const handleFullRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLogs([]);
    
    try {
      addLog('Starting full registration process...');
      
      // Step 1: Test API health
      await testApiHealth();
      
      // Step 2: Register user
      await testUserRegistration();
      
      // Step 3: Create student profile
      await testStudentProfile();
      
      addLog('Full registration completed successfully!');
      
    } catch (error) {
      addLog(`Full registration failed: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Debug Student Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFullRegistration} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Enter your country"
                    required
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button type="button" onClick={testApiHealth} variant="outline">
                  Test API
                </Button>
                <Button type="button" onClick={testUserRegistration} variant="outline">
                  Test User Registration
                </Button>
                <Button type="button" onClick={testStudentProfile} variant="outline">
                  Test Student Profile
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Testing...' : 'Full Test Registration'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet. Click a test button to start debugging...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))
              )}
            </div>
            <Button 
              onClick={() => setLogs([])} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Clear Logs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DebugSignUp;