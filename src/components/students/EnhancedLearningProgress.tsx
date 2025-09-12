import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { 
  TrendingUp, 
  Target, 
  BookOpen, 
  Award, 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Star,
  BarChart3,
  Trophy,
  Zap,
  Activity,
  List,
  CheckSquare,
  ArrowRight,
  Users,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Home,
  ArrowLeft,
  Navigation,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  category: 'ACADEMIC' | 'SKILL' | 'CAREER' | 'PERSONAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  targetDate: string;
  progress: number; // 0-100
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  milestones?: LearningMilestone[];
  activities?: ProgressActivity[];
}

interface LearningMilestone {
  id: string;
  goalId: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  weight: number; // How much this milestone contributes to the overall goal (0-100)
}

interface ProgressActivity {
  id: string;
  goalId: string;
  title: string;
  description: string;
  type: 'SESSION' | 'STUDY' | 'PRACTICE' | 'ASSIGNMENT' | 'EXAM' | 'PROJECT';
  duration: number; // in minutes
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  progressContribution: number; // How much this activity contributes to goal progress
}

interface LearningSession {
  id: string;
  bookingId: string;
  tutorName: string;
  subject: string;
  duration: number; // in minutes
  rating?: number;
  notes?: string;
  completedAt: string;
  goalId?: string; // Link session to specific goal
}

interface EnhancedLearningProgressProps {
  studentId: string;
}

const CATEGORIES = [
  { value: 'ACADEMIC', label: 'Academic', color: 'bg-blue-100 text-blue-800', icon: BookOpen },
  { value: 'SKILL', label: 'Skill Development', color: 'bg-green-100 text-green-800', icon: Zap },
  { value: 'CAREER', label: 'Career', color: 'bg-purple-100 text-purple-800', icon: Users },
  { value: 'PERSONAL', label: 'Personal', color: 'bg-orange-100 text-orange-800', icon: Bookmark }
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'HIGH', label: 'High', color: 'bg-red-100 text-red-800' }
];

const ACTIVITY_TYPES = [
  { value: 'SESSION', label: 'Tutoring Session', icon: Users },
  { value: 'STUDY', label: 'Self Study', icon: BookOpen },
  { value: 'PRACTICE', label: 'Practice', icon: Target },
  { value: 'ASSIGNMENT', label: 'Assignment', icon: CheckSquare },
  { value: 'EXAM', label: 'Exam', icon: Award },
  { value: 'PROJECT', label: 'Project', icon: Activity }
];

// Breadcrumb Component
const Breadcrumb: React.FC<{ breadcrumbs: Array<{label: string, path: string, onClick: () => void}> }> = ({ breadcrumbs }) => (
  <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
    <Home className="h-4 w-4" />
    {breadcrumbs.map((crumb, index) => (
      <React.Fragment key={crumb.path}>
        <ChevronRight className="h-4 w-4" />
        <button
          onClick={crumb.onClick}
          className={`hover:text-blue-600 transition-colors ${
            index === breadcrumbs.length - 1 ? 'text-blue-600 font-medium' : 'text-gray-600'
          }`}
        >
          {crumb.label}
        </button>
      </React.Fragment>
    ))}
  </nav>
);

// Navigation Header Component
const NavigationHeader: React.FC<{
  currentView: string;
  canNavigatePrevious: boolean;
  canNavigateNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onOverview: () => void;
  totalItems: number;
  currentIndex: number;
}> = ({ currentView, canNavigatePrevious, canNavigateNext, onPrevious, onNext, onOverview, totalItems, currentIndex }) => (
  <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
    <div className="flex items-center space-x-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onOverview}
        className="flex items-center space-x-2"
      >
        <Home className="h-4 w-4" />
        <span>Overview</span>
      </Button>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!canNavigatePrevious}
          className="flex items-center space-x-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!canNavigateNext}
          className="flex items-center space-x-1"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
    
    <div className="flex items-center space-x-4">
      <div className="text-sm text-gray-600">
        {currentView === 'goal-detail' && `${currentIndex + 1} of ${totalItems} Goals`}
        {currentView === 'milestone-detail' && `${currentIndex + 1} of ${totalItems} Milestones`}
        {currentView === 'activity-detail' && `${currentIndex + 1} of ${totalItems} Activities`}
      </div>
      
      <div className="flex items-center space-x-1">
        <Navigation className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500 capitalize">{currentView.replace('-', ' ')}</span>
      </div>
    </div>
  </div>
);

export const EnhancedLearningProgress: React.FC<EnhancedLearningProgressProps> = ({ studentId }) => {
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [isEditingMilestone, setIsEditingMilestone] = useState(false);
  const [isEditingActivity, setIsEditingActivity] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<LearningGoal | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<LearningMilestone | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ProgressActivity | null>(null);
  
  // Navigation state
  const [currentView, setCurrentView] = useState<'overview' | 'goal-detail' | 'milestone-detail' | 'activity-detail'>('overview');
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{label: string, path: string, onClick: () => void}>>([]);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'ACADEMIC' as const,
    priority: 'MEDIUM' as const,
    targetDate: '',
  });
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    weight: 25,
  });
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    type: 'STUDY' as const,
    duration: 60,
    progressContribution: 10,
  });
  const [editMilestone, setEditMilestone] = useState({
    title: '',
    description: '',
    weight: 25,
  });
  const [editActivity, setEditActivity] = useState({
    title: '',
    description: '',
    type: 'STUDY' as 'SESSION' | 'STUDY' | 'PRACTICE' | 'ASSIGNMENT' | 'EXAM' | 'PROJECT',
    duration: 60,
    progressContribution: 10,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch learning progress data
  const { data: learningData, isLoading, refetch } = useQuery({
    queryKey: ['learning-progress', studentId],
    queryFn: () => apiClient.getLearningProgress(studentId),
    enabled: !!studentId,
  });

  const goals = learningData?.goals || [];
  const sessions = learningData?.sessions || [];

  // Use goals directly since they already contain milestones and activities
  const enhancedGoals = goals;


  // Initialize breadcrumbs
  React.useEffect(() => {
    if (currentView === 'overview') {
      setBreadcrumbs([{ label: 'Learning Progress', path: '/progress', onClick: navigateToOverview }]);
    }
  }, [currentView]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && canNavigatePrevious()) {
        event.preventDefault();
        navigatePrevious();
      } else if (event.key === 'ArrowRight' && canNavigateNext()) {
        event.preventDefault();
        navigateNext();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        navigateToOverview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, currentGoalIndex, currentMilestoneIndex, currentActivityIndex, enhancedGoals, selectedGoal]);

  const addGoalMutation = useMutation({
    mutationFn: (goalData: typeof newGoal) => apiClient.createLearningGoal(goalData),
    onSuccess: () => {
      toast({
        title: 'Goal added',
        description: 'Your learning goal has been added successfully.',
      });
      setNewGoal({
        title: '',
        description: '',
        category: 'ACADEMIC',
        priority: 'MEDIUM',
        targetDate: '',
      });
      setIsAddingGoal(false);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to add goal',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ goalId, updates }: { goalId: string; updates: any }) => 
      apiClient.updateLearningGoal(goalId, updates),
    onSuccess: () => {
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update goal',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const addGoal = () => {
    if (!newGoal.title || !newGoal.description || !newGoal.targetDate) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    addGoalMutation.mutate(newGoal);
  };

  const addMilestoneMutation = useMutation({
    mutationFn: ({ goalId, milestoneData }: { goalId: string; milestoneData: typeof newMilestone }) => 
      apiClient.createMilestone(goalId, milestoneData),
    onSuccess: () => {
      toast({
        title: 'Milestone added',
        description: 'Your milestone has been added successfully.',
      });
      setNewMilestone({
        title: '',
        description: '',
        weight: 25,
      });
      setIsAddingMilestone(false);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to add milestone',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const addMilestone = () => {
    if (!selectedGoal || !newMilestone.title || !newMilestone.description) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    addMilestoneMutation.mutate({
      goalId: selectedGoal.id,
      milestoneData: newMilestone
    });
  };

  const addActivityMutation = useMutation({
    mutationFn: ({ goalId, activityData }: { goalId: string; activityData: typeof newActivity }) => 
      apiClient.createActivity(goalId, activityData),
    onSuccess: () => {
      toast({
        title: 'Activity added',
        description: 'Your activity has been added successfully.',
      });
      setNewActivity({
        title: '',
        description: '',
        type: 'STUDY',
        duration: 60,
        progressContribution: 10,
      });
      setIsAddingActivity(false);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to add activity',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const addActivity = () => {
    if (!selectedGoal || !newActivity.title || !newActivity.description) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    addActivityMutation.mutate({
      goalId: selectedGoal.id,
      activityData: newActivity
    });
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    const newProgress = Math.max(0, Math.min(100, progress));
    updateGoalMutation.mutate({
      goalId,
      updates: { progress: newProgress }
    });
  };

  const completeMilestoneMutation = useMutation({
    mutationFn: (milestoneId: string) => 
      apiClient.updateMilestone(milestoneId, { completed: true }),
    onSuccess: () => {
      toast({
        title: 'Milestone completed!',
        description: 'Great job on completing this milestone.',
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to complete milestone',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const completeActivityMutation = useMutation({
    mutationFn: (activityId: string) => 
      apiClient.updateActivity(activityId, { completed: true }),
    onSuccess: () => {
      toast({
        title: 'Activity completed!',
        description: 'Keep up the great work!',
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to complete activity',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const completeMilestone = (milestoneId: string, goalId: string) => {
    completeMilestoneMutation.mutate(milestoneId);
  };

  const completeActivity = (activityId: string, goalId: string) => {
    completeActivityMutation.mutate(activityId);
  };

  const deleteGoalMutation = useMutation({
    mutationFn: (goalId: string) => 
      apiClient.request(`/students/learning-goals/${goalId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({
        title: 'Goal deleted',
        description: 'The learning goal has been removed.',
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete goal',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteGoal = (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      deleteGoalMutation.mutate(goalId);
    }
  };

  const deleteMilestoneMutation = useMutation({
    mutationFn: (milestoneId: string) => 
      apiClient.deleteMilestone(milestoneId),
    onSuccess: () => {
      toast({
        title: 'Milestone deleted',
        description: 'The milestone has been removed.',
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete milestone',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: (activityId: string) => 
      apiClient.deleteActivity(activityId),
    onSuccess: () => {
      toast({
        title: 'Activity deleted',
        description: 'The activity has been removed.',
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete activity',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const editMilestoneMutation = useMutation({
    mutationFn: ({ milestoneId, updates }: { milestoneId: string; updates: any }) => 
      apiClient.updateMilestone(milestoneId, updates),
    onSuccess: () => {
      toast({
        title: 'Milestone updated',
        description: 'Your milestone has been updated successfully.',
      });
      setIsEditingMilestone(false);
      setSelectedMilestone(null);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update milestone',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const editActivityMutation = useMutation({
    mutationFn: ({ activityId, updates }: { activityId: string; updates: any }) => 
      apiClient.updateActivity(activityId, updates),
    onSuccess: () => {
      toast({
        title: 'Activity updated',
        description: 'Your activity has been updated successfully.',
      });
      setIsEditingActivity(false);
      setSelectedActivity(null);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update activity',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteMilestone = (milestoneId: string) => {
    if (window.confirm('Are you sure you want to delete this milestone? This action cannot be undone.')) {
      deleteMilestoneMutation.mutate(milestoneId);
    }
  };

  const deleteActivity = (activityId: string) => {
    if (window.confirm('Are you sure you want to delete this activity? This action cannot be undone.')) {
      deleteActivityMutation.mutate(activityId);
    }
  };

  const handleEditMilestone = (milestone: LearningMilestone) => {
    setSelectedMilestone(milestone);
    setEditMilestone({
      title: milestone.title,
      description: milestone.description,
      weight: milestone.weight,
    });
    setIsEditingMilestone(true);
  };

  const handleEditActivity = (activity: ProgressActivity) => {
    setSelectedActivity(activity);
    setEditActivity({
      title: activity.title,
      description: activity.description,
      type: activity.type,
      duration: activity.duration,
      progressContribution: activity.progressContribution,
    });
    setIsEditingActivity(true);
  };

  const saveMilestoneEdit = () => {
    if (!selectedMilestone || !editMilestone.title || !editMilestone.description) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    editMilestoneMutation.mutate({
      milestoneId: selectedMilestone.id,
      updates: editMilestone
    });
  };

  const saveActivityEdit = () => {
    if (!selectedActivity || !editActivity.title || !editActivity.description) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    editActivityMutation.mutate({
      activityId: selectedActivity.id,
      updates: editActivity
    });
  };

  const getCategoryColor = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.color || 'bg-gray-100 text-gray-800';
  };

  // Navigation functions
  const navigateToOverview = () => {
    setCurrentView('overview');
    setBreadcrumbs([{ label: 'Learning Progress', path: '/progress', onClick: navigateToOverview }]);
  };

  const navigateToGoal = (goal: LearningGoal, index: number) => {
    setCurrentView('goal-detail');
    setCurrentGoalIndex(index);
    setSelectedGoal(goal);
    setBreadcrumbs([
      { label: 'Learning Progress', path: '/progress', onClick: navigateToOverview },
      { label: goal.title, path: `/progress/goal/${goal.id}`, onClick: () => navigateToGoal(goal, index) }
    ]);
  };

  const navigateToMilestone = (milestone: LearningMilestone, goal: LearningGoal, index: number) => {
    setCurrentView('milestone-detail');
    setCurrentMilestoneIndex(index);
    setSelectedMilestone(milestone);
    setBreadcrumbs([
      { label: 'Learning Progress', path: '/progress', onClick: navigateToOverview },
      { label: goal.title, path: `/progress/goal/${goal.id}`, onClick: () => navigateToGoal(goal, currentGoalIndex) },
      { label: milestone.title, path: `/progress/milestone/${milestone.id}`, onClick: () => navigateToMilestone(milestone, goal, index) }
    ]);
  };

  const navigateToActivity = (activity: ProgressActivity, goal: LearningGoal, index: number) => {
    setCurrentView('activity-detail');
    setCurrentActivityIndex(index);
    setSelectedActivity(activity);
    setBreadcrumbs([
      { label: 'Learning Progress', path: '/progress', onClick: navigateToOverview },
      { label: goal.title, path: `/progress/goal/${goal.id}`, onClick: () => navigateToGoal(goal, currentGoalIndex) },
      { label: activity.title, path: `/progress/activity/${activity.id}`, onClick: () => navigateToActivity(activity, goal, index) }
    ]);
  };

  const navigatePrevious = () => {
    if (currentView === 'goal-detail') {
      if (currentGoalIndex > 0) {
        const prevGoal = enhancedGoals[currentGoalIndex - 1];
        navigateToGoal(prevGoal, currentGoalIndex - 1);
      } else {
        navigateToOverview();
      }
    } else if (currentView === 'milestone-detail' && selectedGoal) {
      const milestones = selectedGoal.milestones || [];
      if (currentMilestoneIndex > 0) {
        const prevMilestone = milestones[currentMilestoneIndex - 1];
        navigateToMilestone(prevMilestone, selectedGoal, currentMilestoneIndex - 1);
      } else {
        navigateToGoal(selectedGoal, currentGoalIndex);
      }
    } else if (currentView === 'activity-detail' && selectedGoal) {
      const activities = selectedGoal.activities || [];
      if (currentActivityIndex > 0) {
        const prevActivity = activities[currentActivityIndex - 1];
        navigateToActivity(prevActivity, selectedGoal, currentActivityIndex - 1);
      } else {
        navigateToGoal(selectedGoal, currentGoalIndex);
      }
    }
  };

  const navigateNext = () => {
    if (currentView === 'goal-detail') {
      if (currentGoalIndex < enhancedGoals.length - 1) {
        const nextGoal = enhancedGoals[currentGoalIndex + 1];
        navigateToGoal(nextGoal, currentGoalIndex + 1);
      }
    } else if (currentView === 'milestone-detail' && selectedGoal) {
      const milestones = selectedGoal.milestones || [];
      if (currentMilestoneIndex < milestones.length - 1) {
        const nextMilestone = milestones[currentMilestoneIndex + 1];
        navigateToMilestone(nextMilestone, selectedGoal, currentMilestoneIndex + 1);
      }
    } else if (currentView === 'activity-detail' && selectedGoal) {
      const activities = selectedGoal.activities || [];
      if (currentActivityIndex < activities.length - 1) {
        const nextActivity = activities[currentActivityIndex + 1];
        navigateToActivity(nextActivity, selectedGoal, currentActivityIndex + 1);
      }
    }
  };

  const canNavigatePrevious = () => {
    if (currentView === 'overview') return false;
    if (currentView === 'goal-detail') return currentGoalIndex > 0;
    if (currentView === 'milestone-detail') return currentMilestoneIndex > 0;
    if (currentView === 'activity-detail') return currentActivityIndex > 0;
    return false;
  };

  const canNavigateNext = () => {
    if (currentView === 'goal-detail') return currentGoalIndex < enhancedGoals.length - 1;
    if (currentView === 'milestone-detail' && selectedGoal) {
      const milestones = selectedGoal.milestones || [];
      return currentMilestoneIndex < milestones.length - 1;
    }
    if (currentView === 'activity-detail' && selectedGoal) {
      const activities = selectedGoal.activities || [];
      return currentActivityIndex < activities.length - 1;
    }
    return false;
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITIES.find(p => p.value === priority)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityTypeIcon = (type: string) => {
    return ACTIVITY_TYPES.find(a => a.value === type)?.icon || Activity;
  };

  const activeGoals = goals.filter(goal => goal.status === 'ACTIVE');
  const completedGoals = goals.filter(goal => goal.status === 'COMPLETED');
  const totalSessions = sessions.length;
  const averageRating = sessions.reduce((sum, session) => sum + (session.rating || 0), 0) / totalSessions || 0;
  const totalStudyTime = sessions.reduce((sum, session) => sum + session.duration, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading learning progress...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb breadcrumbs={breadcrumbs} />
      
      {/* Navigation Header */}
      {currentView !== 'overview' && (
        <NavigationHeader
          currentView={currentView}
          canNavigatePrevious={canNavigatePrevious()}
          canNavigateNext={canNavigateNext()}
          onPrevious={navigatePrevious}
          onNext={navigateNext}
          onOverview={navigateToOverview}
          totalItems={
            currentView === 'goal-detail' ? enhancedGoals.length :
            currentView === 'milestone-detail' ? (selectedGoal?.milestones?.length || 0) :
            currentView === 'activity-detail' ? (selectedGoal?.activities?.length || 0) : 0
          }
          currentIndex={
            currentView === 'goal-detail' ? currentGoalIndex :
            currentView === 'milestone-detail' ? currentMilestoneIndex :
            currentView === 'activity-detail' ? currentActivityIndex : 0
          }
        />
      )}

      {/* Progress Indicator */}
      {currentView !== 'overview' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-blue-900">Navigation Progress</h3>
            <span className="text-sm text-blue-700">
              {currentView === 'goal-detail' && `${currentGoalIndex + 1} of ${enhancedGoals.length} Goals`}
              {currentView === 'milestone-detail' && `${currentMilestoneIndex + 1} of ${selectedGoal?.milestones?.length || 0} Milestones`}
              {currentView === 'activity-detail' && `${currentActivityIndex + 1} of ${selectedGoal?.activities?.length || 0} Activities`}
            </span>
          </div>
          <Progress 
            value={
              currentView === 'goal-detail' ? ((currentGoalIndex + 1) / enhancedGoals.length) * 100 :
              currentView === 'milestone-detail' ? ((currentMilestoneIndex + 1) / (selectedGoal?.milestones?.length || 1)) * 100 :
              currentView === 'activity-detail' ? ((currentActivityIndex + 1) / (selectedGoal?.activities?.length || 1)) * 100 : 0
            }
            className="h-2"
          />
          <div className="flex justify-between text-xs text-blue-600 mt-1">
            <span>Start</span>
            <span>End</span>
          </div>
        </div>
      )}

      {/* Quick Navigation Panel */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-medium mb-3 flex items-center space-x-2">
          <Navigation className="h-5 w-5" />
          <span>Quick Navigation</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Goals ({enhancedGoals.length})</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {enhancedGoals.map((goal, index) => (
                <button
                  key={goal.id}
                  onClick={() => navigateToGoal(goal, index)}
                  className={`w-full text-left p-2 rounded text-sm transition-colors ${
                    currentView === 'goal-detail' && currentGoalIndex === index
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{goal.title}</span>
                    <span className="text-xs text-gray-500">{goal.progress}%</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Milestones ({selectedGoal?.milestones?.length || 0})</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {selectedGoal?.milestones?.map((milestone, index) => (
                <button
                  key={milestone.id}
                  onClick={() => navigateToMilestone(milestone, selectedGoal, index)}
                  className={`w-full text-left p-2 rounded text-sm transition-colors ${
                    currentView === 'milestone-detail' && currentMilestoneIndex === index
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{milestone.title}</span>
                    {milestone.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                </button>
              )) || <p className="text-xs text-gray-500">No milestones</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Activities ({selectedGoal?.activities?.length || 0})</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {selectedGoal?.activities?.map((activity, index) => (
                <button
                  key={activity.id}
                  onClick={() => navigateToActivity(activity, selectedGoal, index)}
                  className={`w-full text-left p-2 rounded text-sm transition-colors ${
                    currentView === 'activity-detail' && currentActivityIndex === index
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{activity.title}</span>
                    {activity.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                </button>
              )) || <p className="text-xs text-gray-500">No activities</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{activeGoals.length}</p>
                <p className="text-sm text-gray-600">Active Goals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{completedGoals.length}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{totalSessions}</p>
                <p className="text-sm text-gray-600">Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{Math.round(totalStudyTime / 60)}h</p>
                <p className="text-sm text-gray-600">Study Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Goals with Enhanced Progress Tracking */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Learning Goals & Progress</span>
              </CardTitle>
              <CardDescription>
                Set goals, track milestones, and monitor your learning progress
              </CardDescription>
            </div>
            <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Learning Goal</DialogTitle>
                  <DialogDescription>
                    Set a new learning objective to track your progress.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Goal Title</Label>
                    <Input
                      id="title"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      placeholder="e.g., Master Calculus"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      placeholder="Describe what you want to achieve..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newGoal.category}
                        onValueChange={(value: any) => setNewGoal({ ...newGoal, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newGoal.priority}
                        onValueChange={(value: any) => setNewGoal({ ...newGoal, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITIES.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              {priority.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="targetDate">Target Date</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingGoal(false)} disabled={addGoalMutation.isPending}>
                    Cancel
                  </Button>
                  <Button onClick={addGoal} disabled={addGoalMutation.isPending}>
                    {addGoalMutation.isPending ? 'Adding...' : 'Add Goal'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No learning goals set yet</p>
              <p className="text-sm">Add your first goal to start tracking progress</p>
            </div>
          ) : (
            <div className="space-y-6">
              {enhancedGoals.map((goal, index) => (
                <div 
                  key={goal.id} 
                  className="border rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigateToGoal(goal, index)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg">{goal.title}</h3>
                        <Badge className={getCategoryColor(goal.category)}>
                          {CATEGORIES.find(c => c.value === goal.category)?.label}
                        </Badge>
                        <Badge className={getPriorityColor(goal.priority)}>
                          {PRIORITIES.find(p => p.value === goal.priority)?.label}
                        </Badge>
                        <Badge className={getStatusColor(goal.status)}>
                          {goal.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{goal.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                        <span>Progress: {goal.progress}%</span>
                        <span>Milestones: {goal.milestones?.length || 0}</span>
                      </div>
                      <Progress value={goal.progress} className="mb-3" />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedGoal(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateGoalProgress(goal.id, goal.progress + 10)}
                        disabled={goal.status !== 'ACTIVE'}
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                      {goal.status === 'ACTIVE' && goal.progress >= 90 && (
                        <Button
                          size="sm"
                          onClick={() => updateGoalMutation.mutate({
                            goalId: goal.id,
                            updates: { progress: 100, status: 'COMPLETED' }
                          })}
                          disabled={updateGoalMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteGoal(goal.id)}
                        disabled={deleteGoalMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Milestones and Activities */}
                  <Tabs defaultValue="milestones" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="milestones">Milestones</TabsTrigger>
                      <TabsTrigger value="activities">Activities</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="milestones" className="mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Milestones</h4>
                        <Dialog open={isAddingMilestone} onOpenChange={setIsAddingMilestone}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedGoal(goal)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Milestone
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Milestone</DialogTitle>
                              <DialogDescription>
                                Break down your goal into smaller, achievable milestones.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="milestone-title">Milestone Title</Label>
                                <Input
                                  id="milestone-title"
                                  value={newMilestone.title}
                                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                                  placeholder="e.g., Complete derivatives chapter"
                                />
                              </div>
                              <div>
                                <Label htmlFor="milestone-description">Description</Label>
                                <Textarea
                                  id="milestone-description"
                                  value={newMilestone.description}
                                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                                  placeholder="Describe what this milestone involves..."
                                  rows={2}
                                />
                              </div>
                              <div>
                                <Label htmlFor="milestone-weight">Weight (% of goal)</Label>
                                <Input
                                  id="milestone-weight"
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={newMilestone.weight}
                                  onChange={(e) => setNewMilestone({ ...newMilestone, weight: parseInt(e.target.value) || 25 })}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsAddingMilestone(false)} disabled={addMilestoneMutation.isPending}>
                                Cancel
                              </Button>
                              <Button onClick={addMilestone} disabled={addMilestoneMutation.isPending}>
                                {addMilestoneMutation.isPending ? 'Adding...' : 'Add Milestone'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      {goal.milestones && goal.milestones.length > 0 ? (
                        <div className="space-y-2">
                          {goal.milestones.map((milestone, milestoneIndex) => (
                            <div 
                              key={milestone.id} 
                              className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => navigateToMilestone(milestone, goal, milestoneIndex)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  milestone.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                }`}>
                                  {milestone.completed && <CheckCircle className="h-4 w-4 text-white" />}
                                </div>
                                <div>
                                  <p className="font-medium">{milestone.title}</p>
                                  <p className="text-sm text-gray-600">{milestone.description}</p>
                                  <p className="text-xs text-gray-500">Weight: {milestone.weight}%</p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditMilestone(milestone)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteMilestone(milestone.id)}
                                  disabled={deleteMilestoneMutation.isPending}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                {!milestone.completed && (
                                  <Button
                                    size="sm"
                                    onClick={() => completeMilestone(milestone.id, goal.id)}
                                    disabled={completeMilestoneMutation.isPending}
                                  >
                                    {completeMilestoneMutation.isPending ? 'Completing...' : 'Complete'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <List className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No milestones yet</p>
                          <p className="text-xs">Add milestones to break down your goal</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="activities" className="mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Activities</h4>
                        <Dialog open={isAddingActivity} onOpenChange={setIsAddingActivity}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedGoal(goal)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Activity
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Activity</DialogTitle>
                              <DialogDescription>
                                Track specific activities that contribute to your goal.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="activity-title">Activity Title</Label>
                                <Input
                                  id="activity-title"
                                  value={newActivity.title}
                                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                                  placeholder="e.g., Study derivatives for 2 hours"
                                />
                              </div>
                              <div>
                                <Label htmlFor="activity-description">Description</Label>
                                <Textarea
                                  id="activity-description"
                                  value={newActivity.description}
                                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                                  placeholder="Describe what you'll do in this activity..."
                                  rows={2}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="activity-type">Type</Label>
                                  <Select
                                    value={newActivity.type}
                                    onValueChange={(value: any) => setNewActivity({ ...newActivity, type: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {ACTIVITY_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                          {type.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="activity-duration">Duration (minutes)</Label>
                                  <Input
                                    id="activity-duration"
                                    type="number"
                                    value={newActivity.duration}
                                    onChange={(e) => setNewActivity({ ...newActivity, duration: parseInt(e.target.value) || 60 })}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="activity-contribution">Progress Contribution (%)</Label>
                                <Input
                                  id="activity-contribution"
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={newActivity.progressContribution}
                                  onChange={(e) => setNewActivity({ ...newActivity, progressContribution: parseInt(e.target.value) || 10 })}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsAddingActivity(false)} disabled={addActivityMutation.isPending}>
                                Cancel
                              </Button>
                              <Button onClick={addActivity} disabled={addActivityMutation.isPending}>
                                {addActivityMutation.isPending ? 'Adding...' : 'Add Activity'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      {goal.activities && goal.activities.length > 0 ? (
                        <div className="space-y-2">
                          {goal.activities.map((activity, activityIndex) => (
                            <div 
                              key={activity.id} 
                              className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => navigateToActivity(activity, goal, activityIndex)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  activity.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                }`}>
                                  {activity.completed && <CheckCircle className="h-4 w-4 text-white" />}
                                </div>
                                <div>
                                  <p className="font-medium">{activity.title}</p>
                                  <p className="text-sm text-gray-600">{activity.description}</p>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span>{activity.type}</span>
                                    <span>{activity.duration} min</span>
                                    <span>{activity.progressContribution}% contribution</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditActivity(activity)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteActivity(activity.id)}
                                  disabled={deleteActivityMutation.isPending}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                {!activity.completed && (
                                  <Button
                                    size="sm"
                                    onClick={() => completeActivity(activity.id, goal.id)}
                                    disabled={completeActivityMutation.isPending}
                                  >
                                    {completeActivityMutation.isPending ? 'Completing...' : 'Complete'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No activities yet</p>
                          <p className="text-xs">Add activities to track your learning progress</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Milestone Dialog */}
      <Dialog open={isEditingMilestone} onOpenChange={setIsEditingMilestone}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
            <DialogDescription>
              Update the milestone details and progress.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-milestone-title">Milestone Title</Label>
              <Input
                id="edit-milestone-title"
                value={editMilestone.title}
                onChange={(e) => setEditMilestone({ ...editMilestone, title: e.target.value })}
                placeholder="e.g., Complete derivatives chapter"
              />
            </div>
            <div>
              <Label htmlFor="edit-milestone-description">Description</Label>
              <Textarea
                id="edit-milestone-description"
                value={editMilestone.description}
                onChange={(e) => setEditMilestone({ ...editMilestone, description: e.target.value })}
                placeholder="Describe what needs to be accomplished..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-milestone-weight">Weight (%)</Label>
              <Input
                id="edit-milestone-weight"
                type="number"
                min="1"
                max="100"
                value={editMilestone.weight}
                onChange={(e) => setEditMilestone({ ...editMilestone, weight: parseInt(e.target.value) || 25 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingMilestone(false)} disabled={editMilestoneMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={saveMilestoneEdit} disabled={editMilestoneMutation.isPending}>
              {editMilestoneMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Activity Dialog */}
      <Dialog open={isEditingActivity} onOpenChange={setIsEditingActivity}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
            <DialogDescription>
              Update the activity details and progress contribution.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-activity-title">Activity Title</Label>
              <Input
                id="edit-activity-title"
                value={editActivity.title}
                onChange={(e) => setEditActivity({ ...editActivity, title: e.target.value })}
                placeholder="e.g., Study derivatives for 2 hours"
              />
            </div>
            <div>
              <Label htmlFor="edit-activity-description">Description</Label>
              <Textarea
                id="edit-activity-description"
                value={editActivity.description}
                onChange={(e) => setEditActivity({ ...editActivity, description: e.target.value })}
                placeholder="Describe what you'll do in this activity..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-activity-type">Type</Label>
                <Select
                  value={editActivity.type}
                  onValueChange={(value: any) => setEditActivity({ ...editActivity, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <type.icon className="h-4 w-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-activity-duration">Duration (minutes)</Label>
                <Input
                  id="edit-activity-duration"
                  type="number"
                  value={editActivity.duration}
                  onChange={(e) => setEditActivity({ ...editActivity, duration: parseInt(e.target.value) || 60 })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-activity-contribution">Progress Contribution (%)</Label>
              <Input
                id="edit-activity-contribution"
                type="number"
                min="1"
                max="100"
                value={editActivity.progressContribution}
                onChange={(e) => setEditActivity({ ...editActivity, progressContribution: parseInt(e.target.value) || 10 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingActivity(false)} disabled={editActivityMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={saveActivityEdit} disabled={editActivityMutation.isPending}>
              {editActivityMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recent Learning Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Recent Learning Sessions</span>
          </CardTitle>
          <CardDescription>
            Track your completed tutoring sessions and link them to goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sessions completed yet</p>
              <p className="text-sm">Book a session to start your learning journey</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{session.subject} with {session.tutorName}</h4>
                      <p className="text-sm text-gray-600">
                        {session.duration} minutes • {new Date(session.completedAt).toLocaleDateString()}
                      </p>
                      {session.notes && (
                        <p className="text-sm text-gray-500 mt-1">{session.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {session.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{session.rating}</span>
                      </div>
                    )}
                    <Button size="sm" variant="outline">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Link to Goal
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Learning Analytics</span>
          </CardTitle>
          <CardDescription>
            Insights into your learning patterns and goal progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Goal Progress Distribution</h4>
              <div className="space-y-2">
                {enhancedGoals.map((goal) => (
                  <div key={goal.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="truncate">{goal.title}</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Study Consistency</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>This Week</span>
                  <span>3 sessions</span>
                </div>
                <Progress value={60} />
                <div className="flex justify-between text-sm">
                  <span>This Month</span>
                  <span>12 sessions</span>
                </div>
                <Progress value={80} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
