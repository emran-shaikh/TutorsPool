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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Loader2, User, GraduationCap, DollarSign, Calendar, Upload, Check, Plus, X } from 'lucide-react';

const tutorRegistrationSchema = z.object({
  // Step 1: Basic Info
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  timezone: z.string().optional(),
  
  // Step 2: Professional Info
  headline: z.string().min(10, 'Headline must be at least 10 characters'),
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  yearsExperience: z.number().int().min(0, 'Experience must be positive'),
  
  // Step 3: Subjects & Pricing
  subjects: z.array(z.string()).min(1, 'Select at least one subject'),
  levels: z.array(z.string()).min(1, 'Select at least one level'),
  hourlyRateCents: z.number().int().min(100, 'Rate must be at least $1'),
  currency: z.string().default('USD'),
  
  // Step 4: Availability & Verification
  availabilityBlocks: z.array(z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTimeUTC: z.string(),
    endTimeUTC: z.string(),
    isRecurring: z.boolean().default(true),
  })).min(1, 'Set at least one availability block'),
});

// Step-specific validation schemas
const tutorStepSchemas = {
  1: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
    timezone: z.string().optional(),
  }),
  2: z.object({
    headline: z.string().min(10, 'Headline must be at least 10 characters'),
    bio: z.string().min(50, 'Bio must be at least 50 characters'),
    yearsExperience: z.number().int().min(0, 'Experience must be positive'),
  }),
  3: z.object({
    subjects: z.array(z.string()).min(1, 'Select at least one subject'),
    levels: z.array(z.string()).min(1, 'Select at least one level'),
    hourlyRateCents: z.number().int().min(1, 'Rate must be at least $1'),
    currency: z.string().default('USD'),
  }),
  4: z.object({
    availabilityBlocks: z.array(z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTimeUTC: z.string(),
      endTimeUTC: z.string(),
      isRecurring: z.boolean().default(true),
    })).min(1, 'Set at least one availability block'),
  }),
};

type TutorRegistrationForm = z.infer<typeof tutorRegistrationSchema>;

const STEPS = [
  { id: 1, title: 'Basic Information', icon: User },
  { id: 2, title: 'Professional Details', icon: GraduationCap },
  { id: 3, title: 'Subjects & Pricing', icon: DollarSign },
  { id: 4, title: 'Availability', icon: Calendar },
];

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Literature',
  'History', 'Geography', 'Economics', 'Business Studies', 'Computer Science',
  'Programming', 'Art', 'Music', 'Spanish', 'French', 'German', 'Arabic',
  'Urdu', 'Psychology', 'Sociology', 'Political Science', 'Philosophy',
  'Statistics', 'Accounting', 'Finance', 'Marketing', 'Engineering',
];

const LEVELS = [
  'Elementary (K-5)', 'Middle School (6-8)', 'High School (9-12)',
  'College/University', 'Graduate School', 'Professional Development',
];

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00'
];

export const TutorRegistrationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [availabilityBlocks, setAvailabilityBlocks] = useState<Array<{
    dayOfWeek: number;
    startTimeUTC: string;
    endTimeUTC: string;
    isRecurring: boolean;
  }>>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<TutorRegistrationForm>({
    mode: 'onChange',
  });

  const watchedValues = watch();

  const nextStep = async () => {
    console.log('Next step clicked, current step:', currentStep);
    console.log('Form values:', watchedValues);
    console.log('Form errors:', errors);
    
    // Validate only the current step's fields
    const currentStepSchema = tutorStepSchemas[currentStep as keyof typeof tutorStepSchemas];
    if (currentStepSchema) {
      try {
        // Get only the relevant fields for the current step
        const currentStepData: any = {};
        
        if (currentStep === 1) {
          currentStepData.name = watchedValues.name;
          currentStepData.email = watchedValues.email;
          currentStepData.phone = watchedValues.phone;
          currentStepData.country = watchedValues.country;
          currentStepData.timezone = watchedValues.timezone;
        } else if (currentStep === 2) {
          currentStepData.headline = watchedValues.headline;
          currentStepData.bio = watchedValues.bio;
          currentStepData.yearsExperience = watchedValues.yearsExperience;
        } else if (currentStep === 3) {
          currentStepData.subjects = watchedValues.subjects;
          currentStepData.levels = watchedValues.levels;
          // Convert dollars to cents for validation
          currentStepData.hourlyRateCents = watchedValues.hourlyRateCents ? watchedValues.hourlyRateCents * 100 : 0;
          currentStepData.currency = watchedValues.currency;
        } else if (currentStep === 4) {
          currentStepData.availabilityBlocks = availabilityBlocks;
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
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
    setValue('subjects', selectedSubjects.includes(subject) 
      ? selectedSubjects.filter(s => s !== subject)
      : [...selectedSubjects, subject]
    );
  };

  const toggleLevel = (level: string) => {
    setSelectedLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
    setValue('levels', selectedLevels.includes(level) 
      ? selectedLevels.filter(l => l !== level)
      : [...selectedLevels, level]
    );
  };

  const addAvailabilityBlock = () => {
    setAvailabilityBlocks(prev => [...prev, {
      dayOfWeek: 0,
      startTimeUTC: '09:00',
      endTimeUTC: '17:00',
      isRecurring: true,
    }]);
  };

  const removeAvailabilityBlock = (index: number) => {
    setAvailabilityBlocks(prev => prev.filter((_, i) => i !== index));
  };

  const updateAvailabilityBlock = (index: number, field: string, value: any) => {
    setAvailabilityBlocks(prev => prev.map((block, i) => 
      i === index ? { ...block, [field]: value } : block
    ));
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

  const onSubmit = async (data: TutorRegistrationForm) => {
    console.log('=== FORM SUBMISSION STARTED ===');
    console.log('Form data:', data);
    console.log('Selected subjects:', selectedSubjects);
    console.log('Selected levels:', selectedLevels);
    console.log('Availability blocks:', availabilityBlocks);
    console.log('Uploaded files:', uploadedFiles);
    
    // Manual validation
    if (!data.name || !data.email || !data.phone || !data.country) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all basic information fields.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!data.headline || !data.bio || !data.yearsExperience) {
      toast({
        title: 'Missing professional details',
        description: 'Please fill in all professional information fields.',
        variant: 'destructive',
      });
      return;
    }
    
    if (selectedSubjects.length === 0 || selectedLevels.length === 0 || !data.hourlyRateCents) {
      toast({
        title: 'Missing subjects and pricing',
        description: 'Please select at least one subject, level, and set your hourly rate.',
        variant: 'destructive',
      });
      return;
    }
    
    if (availabilityBlocks.length === 0) {
      toast({
        title: 'Missing availability',
        description: 'Please add at least one availability block.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // First register the user
      const registerResult = await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        country: data.country,
        timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        role: 'TUTOR',
      });

      if (registerResult.error) {
        toast({
          title: 'Registration failed',
          description: registerResult.error,
          variant: 'destructive',
        });
        return;
      }

      // Generate slug from name
      const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      // Then create tutor profile
      await apiClient.createTutorProfile({
        headline: data.headline,
        bio: data.bio,
        hourlyRateCents: data.hourlyRateCents * 100, // Convert dollars to cents
        currency: data.currency,
        yearsExperience: data.yearsExperience,
        subjects: selectedSubjects,
        levels: selectedLevels,
        slug,
        certifications: uploadedFiles.map(file => ({
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file),
        })),
        availabilityBlocks: availabilityBlocks,
      });

      toast({
        title: 'Registration successful!',
        description: 'Your tutor profile has been created successfully.',
      });

      // Redirect to dashboard
      navigate('/tutor/dashboard');
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
            Tutor Registration
          </CardTitle>
          <CardDescription className="text-center">
            Join Tutorspool as a tutor and start teaching students worldwide
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
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.country && (
                      <p className="text-sm text-red-500">{errors.country.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Professional Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Professional Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="headline">Professional Headline *</Label>
                  <Input
                    id="headline"
                    {...register('headline')}
                    placeholder="e.g., Experienced Math Tutor with 5+ Years"
                  />
                  {errors.headline && (
                    <p className="text-sm text-red-500">{errors.headline.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio *</Label>
                  <Textarea
                    id="bio"
                    {...register('bio')}
                    placeholder="Tell students about your teaching experience, qualifications, and approach..."
                    rows={4}
                  />
                  {errors.bio && (
                    <p className="text-sm text-red-500">{errors.bio.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Years of Teaching Experience *</Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    {...register('yearsExperience', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.yearsExperience && (
                    <p className="text-sm text-red-500">{errors.yearsExperience.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Subjects & Pricing */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Subjects & Pricing</h3>
                
                <div className="space-y-2">
                  <Label>Subjects You Teach *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {SUBJECTS.map((subject) => (
                      <div key={subject} className="flex items-center space-x-2">
                        <Checkbox
                          id={subject}
                          checked={selectedSubjects.includes(subject)}
                          onCheckedChange={() => toggleSubject(subject)}
                        />
                        <Label htmlFor={subject} className="text-sm">
                          {subject}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.subjects && (
                    <p className="text-sm text-red-500">{errors.subjects.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Grade Levels You Teach *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {LEVELS.map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox
                          id={level}
                          checked={selectedLevels.includes(level)}
                          onCheckedChange={() => toggleLevel(level)}
                        />
                        <Label htmlFor={level} className="text-sm">
                          {level}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.levels && (
                    <p className="text-sm text-red-500">{errors.levels.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRateCents">Hourly Rate ($) *</Label>
                    <Input
                      id="hourlyRateCents"
                      type="number"
                      {...register('hourlyRateCents', { valueAsNumber: true })}
                      placeholder="25"
                      min="1"
                    />
                    {errors.hourlyRateCents && (
                      <p className="text-sm text-red-500">{errors.hourlyRateCents.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select onValueChange={(value) => setValue('currency', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* File Upload for Certifications */}
                <div className="space-y-2">
                  <Label>Upload Certifications (Optional)</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="mt-4">
                        <Label htmlFor="cert-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-semibold text-primary">
                            Upload certifications
                          </span>
                        </Label>
                        <Input
                          id="cert-upload"
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

            {/* Step 4: Availability */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Availability Schedule</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Availability Blocks *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addAvailabilityBlock}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Time Block
                    </Button>
                  </div>

                  {availabilityBlocks.map((block, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Time Block {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAvailabilityBlock(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label>Day of Week</Label>
                          <Select
                            value={block.dayOfWeek.toString()}
                            onValueChange={(value) => updateAvailabilityBlock(index, 'dayOfWeek', parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DAYS_OF_WEEK.map((day, dayIndex) => (
                                <SelectItem key={dayIndex} value={dayIndex.toString()}>
                                  {day}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Start Time</Label>
                          <Select
                            value={block.startTimeUTC}
                            onValueChange={(value) => updateAvailabilityBlock(index, 'startTimeUTC', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_SLOTS.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>End Time</Label>
                          <Select
                            value={block.endTimeUTC}
                            onValueChange={(value) => updateAvailabilityBlock(index, 'endTimeUTC', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_SLOTS.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {availabilityBlocks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="mx-auto h-12 w-12 mb-4" />
                      <p>No availability blocks added yet.</p>
                      <p className="text-sm">Click "Add Time Block" to set your availability.</p>
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
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  onClick={() => {
                    console.log('=== COMPLETE REGISTRATION BUTTON CLICKED ===');
                    console.log('isSubmitting:', isSubmitting);
                  }}
                >
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
              
              {/* Debug info */}
              <div className="text-xs text-gray-500 mt-2">
                Debug: Current step: {currentStep}, Total steps: {STEPS.length}, 
                Availability blocks: {availabilityBlocks.length}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
