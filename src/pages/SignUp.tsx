import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudentRegistrationForm } from '@/components/forms/StudentRegistrationForm';
import { TutorRegistrationForm } from '@/components/forms/TutorRegistrationForm';
import AdminRegistrationForm from '@/components/forms/AdminRegistrationForm';
import { GraduationCap, User, Shield } from 'lucide-react';

const SignUp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('student');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join Tutorspool
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your role and start your learning journey or teaching career today
          </p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Create Your Account</CardTitle>
            <CardDescription className="text-center">
              Select whether you want to learn or teach
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="student" className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>I'm a Student</span>
                </TabsTrigger>
                <TabsTrigger value="tutor" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>I'm a Tutor</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>I'm an Admin</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student" className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Find Your Perfect Tutor
                  </h3>
                  <p className="text-gray-600">
                    Connect with experienced tutors who can help you achieve your learning goals
                  </p>
                </div>
                <StudentRegistrationForm />
              </TabsContent>

              <TabsContent value="tutor" className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Start Teaching Students
                  </h3>
                  <p className="text-gray-600">
                    Share your knowledge and help students succeed while earning money
                  </p>
                </div>
                <TutorRegistrationForm />
              </TabsContent>

              <TabsContent value="admin" className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Platform Administration
                  </h3>
                  <p className="text-gray-600">
                    Manage tutors, students, and platform operations
                  </p>
                </div>
                <AdminRegistrationForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Button variant="link" className="p-0 h-auto">
              Sign in here
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;