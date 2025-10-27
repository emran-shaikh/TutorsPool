import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Loader2, User, GraduationCap, Target, DollarSign, Upload, Check } from 'lucide-react';

const studentRegistrationSchema = z.object({
  // Step 1: Basic Info
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  timezone: z.string().optional(),
  
  // Step 2: Academic Info
  gradeLevel: z.string().min(1, 'Grade level is required'),
  learningGoals: z.string().min(10, 'Learning goals must be at least 10 characters'),
  preferredMode: z.enum(['ONLINE', 'OFFLINE']),
  
  // Step 3: Budget & Requirements
  budgetMin: z.number().int().min(0, 'Minimum budget must be positive'),
  budgetMax: z.number().int().min(0, 'Maximum budget must be positive'),
  specialRequirements: z.string().optional(),
});

type StudentRegistrationFormData = z.infer<typeof studentRegistrationSchema>;

// Step-specific validation schemas
const stepSchemas = {
  1: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
    timezone: z.string().optional(),
  }),
  2: z.object({
    gradeLevel: z.string().min(1, 'Grade level is required'),
    preferredMode: z.enum(['ONLINE', 'OFFLINE']),
  }),
  3: z.object({
    learningGoals: z.string().min(10, 'Learning goals must be at least 10 characters'),
  }),
  4: z.object({
    budgetMin: z.number().int().min(0, 'Minimum budget must be positive'),
    budgetMax: z.number().int().min(0, 'Maximum budget must be positive'),
    specialRequirements: z.string().optional(),
  }),
};

type StudentRegistrationForm = z.infer<typeof studentRegistrationSchema>;

const STEPS = [
  { id: 1, title: 'Basic Information', icon: User },
  { id: 2, title: 'Academic Details', icon: GraduationCap },
  { id: 3, title: 'Learning Goals', icon: Target },
  { id: 4, title: 'Budget & Requirements', icon: DollarSign },
];

const GRADE_LEVELS = [
  'Elementary (K-5)',
  'Middle School (6-8)',
  'High School (9-12)',
  'College/University',
  'Graduate School',
  'Professional Development',
];

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
  'France', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway',
  'Denmark', 'Finland', 'Japan', 'South Korea', 'Singapore', 'India',
  'Pakistan', 'Bangladesh', 'UAE', 'Saudi Arabia', 'Egypt', 'Nigeria',
  'South Africa', 'Brazil', 'Mexico', 'Argentina', 'Chile', 'Other'
];

export const StudentRegistrationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const { register: registerUser, user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<StudentRegistrationFormData>({
    resolver: zodResolver(studentRegistrationSchema),
    mode: 'onChange',
  });

  const watchedValues = watch();

  const nextStep = async () => {
    console.log('=== NEXT STEP DEBUG ===');
    console.log('Current step:', currentStep);
    console.log('Total steps:', STEPS.length);
    console.log('All form values:', watchedValues);
    console.log('Form errors:', errors);
    
    // Check if we're trying to validate the wrong step
    if (currentStep === 1) {
      console.log('Step 1 validation - checking basic info fields');
      console.log('Name:', watchedValues.name);
      console.log('Email:', watchedValues.email);
      console.log('Country:', watchedValues.country);
    } else if (currentStep === 2) {
      console.log('Step 2 validation - checking academic fields');
      console.log('Grade Level:', watchedValues.gradeLevel);
    } else if (currentStep === 3) {
      console.log('Step 3 validation - checking learning goals');
      console.log('Learning Goals:', watchedValues.learningGoals);
      console.log('Preferred Mode:', watchedValues.preferredMode);
    } else if (currentStep === 4) {
      console.log('Step 4 validation - checking budget fields');
      console.log('Budget Min:', watchedValues.budgetMin);
      console.log('Budget Max:', watchedValues.budgetMax);
    }
    
    // Validate only the current step's fields
    const currentStepSchema = stepSchemas[currentStep as keyof typeof stepSchemas];
    console.log('Current step schema:', currentStepSchema);
    
    if (currentStepSchema) {
      try {
        // Get only the relevant fields for the current step
        const currentStepData: any = {};
        
        if (currentStep === 1) {
          currentStepData.name = watchedValues.name || '';
          currentStepData.email = watchedValues.email || '';
          currentStepData.phone = watchedValues.phone || '';
          currentStepData.country = watchedValues.country || '';
          currentStepData.timezone = watchedValues.timezone || '';
        } else if (currentStep === 2) {
          currentStepData.gradeLevel = watchedValues.gradeLevel || '';
          currentStepData.preferredMode = watchedValues.preferredMode || '';
        } else if (currentStep === 3) {
          currentStepData.learningGoals = watchedValues.learningGoals || '';
        } else if (currentStep === 4) {
          currentStepData.budgetMin = watchedValues.budgetMin || 0;
          currentStepData.budgetMax = watchedValues.budgetMax || 0;
          currentStepData.specialRequirements = watchedValues.specialRequirements || '';
        }
        
        console.log('Validating current step data:', currentStepData);
        
        const validatedData = currentStepSchema.parse(currentStepData);
        console.log('Current step validation passed:', validatedData);
        
        if (currentStep < STEPS.length) {
          console.log('Moving to next step:', currentStep + 1);
          setCurrentStep(currentStep + 1);
        }
      } catch (error) {
        console.log('Current step validation failed:', error);
        
        // Show specific field errors
        if (error instanceof z.ZodError) {
          const fieldErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
          console.log('Field errors:', fieldErrors);
          toast({
            title: 'Please complete all required fields',
            description: fieldErrors,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Please complete all required fields',
            description: 'Fill in all required information before proceeding.',
            variant: 'destructive',
          });
        }
      }
    } else {
      console.log('No schema found for current step, using full validation');
      // For final step, use full validation
      const isValid = await trigger();
      console.log('Final step validation result:', isValid);
      
      if (isValid && currentStep < STEPS.length) {
        console.log('Moving to next step:', currentStep + 1);
        setCurrentStep(currentStep + 1);
      } else {
        console.log('Validation failed or already at last step');
      }
    }
    console.log('=== END NEXT STEP DEBUG ===');
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    toast({
      title: 'Files uploaded',
      description: `${files.length} file(s) uploaded successfully`,
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: StudentRegistrationForm) => {
    setIsSubmitting(true);
    try {
      // First register the user
      const registerResult = await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        country: data.country,
        timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        role: 'STUDENT',
      });

      if (registerResult.error) {
        toast({
          title: 'Registration failed',
          description: registerResult.error,
          variant: 'destructive',
        });
        return;
      }

      // Then create student profile
      await apiClient.createStudentProfile({
        gradeLevel: data.gradeLevel,
        learningGoals: data.learningGoals,
        preferredMode: data.preferredMode,
        budgetMin: data.budgetMin * 100, // Convert to cents
        budgetMax: data.budgetMax * 100, // Convert to cents
        specialRequirements: data.specialRequirements,
        uploads: uploadedFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          // In production, upload to cloud storage and get URL
          url: URL.createObjectURL(file),
        })),
      });

      toast({
        title: 'Registration successful!',
        description: 'Your student profile has been created successfully.',
      });

      // Redirect to student dashboard
      navigate('/student/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Student Registration
          </CardTitle>
          <CardDescription className="text-center">
            Join Tutorspool and find the perfect tutor for your learning journey
          </CardDescription>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {STEPS.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between mt-6">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center space-y-2 ${
                    isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    isActive ? 'bg-primary text-primary-foreground' : 
                    isCompleted ? 'bg-green-100 text-green-600' : 'bg-muted'
                  }`}>
                    {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className="text-xs font-medium">{step.title}</span>
                </div>
              );
            })}
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Select onValueChange={(value) => setValue('country', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && (
                      <p className="text-sm text-red-500">{errors.country.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Academic Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Academic Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="gradeLevel">Current Grade Level *</Label>
                  <Select onValueChange={(value) => setValue('gradeLevel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.gradeLevel && (
                    <p className="text-sm text-red-500">{errors.gradeLevel.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredMode">Preferred Learning Mode *</Label>
                  <Select onValueChange={(value) => setValue('preferredMode', value as 'ONLINE' | 'OFFLINE')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select learning mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ONLINE">Online (Video calls)</SelectItem>
                      <SelectItem value="OFFLINE">In-person meetings</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.preferredMode && (
                    <p className="text-sm text-red-500">{errors.preferredMode.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Learning Goals */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Learning Goals</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="learningGoals">What are your learning goals? *</Label>
                  <Textarea
                    id="learningGoals"
                    {...register('learningGoals')}
                    placeholder="Describe what you want to achieve through tutoring..."
                    rows={4}
                  />
                  {errors.learningGoals && (
                    <p className="text-sm text-red-500">{errors.learningGoals.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialRequirements">Special Requirements</Label>
                  <Textarea
                    id="specialRequirements"
                    {...register('specialRequirements')}
                    placeholder="Any special learning needs, accessibility requirements, or preferences..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Budget & Requirements */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Budget & Requirements</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budgetMin">Minimum Budget (per hour) *</Label>
                    <Input
                      id="budgetMin"
                      type="number"
                      {...register('budgetMin', { valueAsNumber: true })}
                      placeholder="0"
                    />
                    {errors.budgetMin && (
                      <p className="text-sm text-red-500">{errors.budgetMin.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budgetMax">Maximum Budget (per hour) *</Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      {...register('budgetMax', { valueAsNumber: true })}
                      placeholder="100"
                    />
                    {errors.budgetMax && (
                      <p className="text-sm text-red-500">{errors.budgetMax.message}</p>
                    )}
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label>Upload Documents (Optional)</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="mt-4">
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-semibold text-primary">
                            Upload files
                          </span>
                        </Label>
                        <Input
                          id="file-upload"
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <p className="text-xs text-muted-foreground">
                          PDF, DOC, DOCX, JPG, PNG up to 10MB each
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Files */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label>Uploaded Files:</Label>
                      <div className="space-y-1">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-sm">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              {currentStep < STEPS.length ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
