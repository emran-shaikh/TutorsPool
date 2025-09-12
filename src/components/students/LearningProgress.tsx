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
  Zap
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
}

interface LearningMilestone {
  id: string;
  goalId: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
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
}

interface LearningProgressProps {
  studentId: string;
}

const CATEGORIES = [
  { value: 'ACADEMIC', label: 'Academic', color: 'bg-blue-100 text-blue-800' },
  { value: 'SKILL', label: 'Skill Development', color: 'bg-green-100 text-green-800' },
  { value: 'CAREER', label: 'Career', color: 'bg-purple-100 text-purple-800' },
  { value: 'PERSONAL', label: 'Personal', color: 'bg-orange-100 text-orange-800' }
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'HIGH', label: 'High', color: 'bg-red-100 text-red-800' }
];

export const LearningProgress: React.FC<LearningProgressProps> = ({ studentId }) => {
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<LearningGoal | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'ACADEMIC' as const,
    priority: 'MEDIUM' as const,
    targetDate: '',
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
  const milestones = learningData?.milestones || [];

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

  const updateGoalProgress = (goalId: string, progress: number) => {
    const newProgress = Math.max(0, Math.min(100, progress));
    updateGoalMutation.mutate({
      goalId,
      updates: { progress: newProgress }
    });
  };

  const completeGoal = (goalId: string) => {
    updateGoalMutation.mutate({
      goalId,
      updates: { progress: 100, status: 'COMPLETED' }
    });
    
    toast({
      title: 'Goal completed!',
      description: 'Congratulations on achieving your learning goal!',
    });
  };

  const deleteGoal = (goalId: string) => {
    // In a real app, this would call a delete API
    toast({
      title: 'Goal deleted',
      description: 'The learning goal has been removed.',
    });
    refetch();
  };

  const getCategoryColor = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.color || 'bg-gray-100 text-gray-800';
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

      {/* Learning Goals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Learning Goals</span>
              </CardTitle>
              <CardDescription>
                Set and track your learning objectives
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
                  <Button variant="outline" onClick={() => setIsAddingGoal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addGoal}>Add Goal</Button>
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
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{goal.title}</h3>
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
                      <p className="text-gray-600 text-sm mb-3">{goal.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                        <span>Progress: {goal.progress}%</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
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
                          onClick={() => completeGoal(goal.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteGoal(goal.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={goal.progress} className="mb-2" />
                  <div className="text-xs text-gray-500">
                    Updated: {new Date(goal.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Learning Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Recent Learning Sessions</span>
          </CardTitle>
          <CardDescription>
            Track your completed tutoring sessions
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
            Insights into your learning patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div>
              <h4 className="font-medium mb-3">Subject Focus</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Mathematics</span>
                  <span>60%</span>
                </div>
                <Progress value={60} />
                <div className="flex justify-between text-sm">
                  <span>Spanish</span>
                  <span>40%</span>
                </div>
                <Progress value={40} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
