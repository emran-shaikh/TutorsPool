import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Target, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Plus,
  BookOpen,
  Award,
  Edit,
  Trash2
} from 'lucide-react';

interface SimpleLearningProgressProps {
  studentId: string;
}

export const SimpleLearningProgress: React.FC<SimpleLearningProgressProps> = ({ studentId }) => {
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM',
    targetDate: ''
  });

  const queryClient = useQueryClient();

  // Fetch learning progress data
  const { data: learningData, isLoading } = useQuery({
    queryKey: ['learning-progress', studentId],
    queryFn: () => apiClient.getLearningProgress(studentId),
    enabled: !!studentId
  });

  // Add goal mutation
  const addGoalMutation = useMutation({
    mutationFn: (goalData: any) => apiClient.createLearningGoal(goalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-progress', studentId] });
      toast.success('Goal added successfully!');
      setIsAddGoalOpen(false);
      setNewGoal({ title: '', description: '', category: '', priority: 'MEDIUM', targetDate: '' });
    },
    onError: () => {
      toast.error('Failed to add goal');
    }
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: ({ goalId, updates }: { goalId: string; updates: any }) => 
      apiClient.updateLearningGoal(goalId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-progress', studentId] });
      toast.success('Goal updated successfully!');
      setEditingGoal(null);
    },
    onError: () => {
      toast.error('Failed to update goal');
    }
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: (goalId: string) => apiClient.deleteLearningGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-progress', studentId] });
      toast.success('Goal deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete goal');
    }
  });

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.category || !newGoal.targetDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    addGoalMutation.mutate(newGoal);
  };

  const handleUpdateGoal = (goalId: string, updates: any) => {
    updateGoalMutation.mutate({ goalId, updates });
  };

  const handleDeleteGoal = (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteGoalMutation.mutate(goalId);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  const overallProgress = learningData?.totalGoals > 0 
    ? Math.round((learningData.completedGoals / learningData.totalGoals) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Learning Progress</h2>
          <p className="text-gray-600">Track your educational journey and achievements</p>
        </div>
        <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Learning Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="Enter goal title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Enter goal description"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  placeholder="e.g., Mathematics, Science, Language"
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newGoal.priority} onValueChange={(value) => setNewGoal({ ...newGoal, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="targetDate">Target Date *</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                />
              </div>
              <Button onClick={handleAddGoal} disabled={addGoalMutation.isPending} className="w-full">
                {addGoalMutation.isPending ? 'Adding...' : 'Add Goal'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-gray-900">{overallProgress}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Learning Goals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {learningData?.completedGoals || 0}/{learningData?.totalGoals || 0}
                </p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Goals completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {learningData?.completedSessions || 0}/{learningData?.totalSessions || 0}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Sessions completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Streak</p>
                <p className="text-2xl font-bold text-gray-900">{learningData?.currentStreak || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Days in a row</p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Learning Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {learningData?.recentGoals?.length > 0 ? (
              learningData.recentGoals.map((goal) => (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={goal.status === 'COMPLETED' ? 'default' : 'secondary'}
                        className={goal.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {goal.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingGoal(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>{goal.category}</span>
                    <span>Due: {new Date(goal.targetDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={goal.progress} className="flex-1" />
                    <span className="text-sm font-medium text-gray-700">{goal.progress}%</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateGoal(goal.id, { progress: Math.min(100, goal.progress + 10) })}
                    >
                      +10%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateGoal(goal.id, { status: 'COMPLETED', progress: 100 })}
                    >
                      Complete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No learning goals yet. Add your first goal to get started!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setIsAddGoalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add New Goal
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                // Refresh data
                queryClient.invalidateQueries({ queryKey: ['learning-progress', studentId] });
                toast.success('Data refreshed!');
              }}
            >
              <TrendingUp className="h-4 w-4" />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
