import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Star,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  GraduationCap,
  Users,
  Award
} from 'lucide-react';
import { aiSuggestionService, LearningProfile, SubjectSuggestion, AISuggestionResponse } from '@/services/aiSuggestionService';

interface AISuggestionsProps {
  onSubjectSelect?: (subject: string) => void;
}

export const AISuggestions: React.FC<AISuggestionsProps> = ({ onSubjectSelect }) => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<AISuggestionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      generateSuggestions();
    }
  }, [user]);

  const generateSuggestions = async () => {
    try {
      setLoading(true);
      
      // Get AI suggestions from backend
      const response = await apiClient.getAISuggestions();
      setSuggestions(response.data);
      
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      // Fallback suggestions if API fails
      const fallbackProfile: LearningProfile = {
        id: user?.id || '',
        userId: user?.id || '',
        gradeLevel: 'high-school',
        learningGoals: 'Academic improvement and skill development',
        interests: ['technology', 'science', 'mathematics'],
        academicLevel: 'high-school',
        learningStyle: 'Mixed Learning Style',
        subjectsStudied: [],
        strengths: ['problem-solving', 'analytical thinking'],
        weaknesses: ['time management', 'writing'],
        careerGoals: ['engineering', 'technology'],
        hobbies: ['coding', 'reading', 'sports']
      };
      
      const fallbackSuggestions = aiSuggestionService.analyzeProfile(fallbackProfile);
      setSuggestions(fallbackSuggestions);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await generateSuggestions();
    setRefreshing(false);
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    onSubjectSelect?.(subject);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI-Powered Subject Suggestions
          </CardTitle>
          <CardDescription>
            Analyzing your profile to suggest the best subjects for you...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Generating personalized suggestions...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI-Powered Subject Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Unable to generate suggestions at this time.</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI-Powered Subject Suggestions
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </CardTitle>
            <CardDescription>
              Personalized recommendations based on your learning profile
            </CardDescription>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Personalized Message */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Personalized Recommendation</h4>
              <p className="text-blue-800 text-sm">{suggestions.personalizedMessage}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="suggestions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions">Subject Suggestions</TabsTrigger>
            <TabsTrigger value="analysis">Profile Analysis</TabsTrigger>
            <TabsTrigger value="learning-path">Learning Paths</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-4">
            <div className="grid gap-4">
              {suggestions.suggestions.map((suggestion, index) => (
                <Card 
                  key={suggestion.subject} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedSubject === suggestion.subject ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => handleSubjectSelect(suggestion.subject)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg capitalize">
                            {suggestion.subject.replace('-', ' ')}
                          </h3>
                          <p className="text-sm text-gray-600">{suggestion.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(suggestion.difficulty)}>
                          {suggestion.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          <span className={`text-sm font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                            {Math.round(suggestion.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{suggestion.estimatedHours} hours</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TrendingUp className="h-4 w-4" />
                        <span>{suggestion.relatedSubjects.length} related subjects</span>
                      </div>
                    </div>

                    {suggestion.prerequisites && suggestion.prerequisites.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Prerequisites:</p>
                        <div className="flex flex-wrap gap-1">
                          {suggestion.prerequisites.map((prereq) => (
                            <Badge key={prereq} variant="outline" className="text-xs">
                              {prereq.replace('-', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {suggestion.careerRelevance && suggestion.careerRelevance.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Career Relevance:</p>
                        <div className="flex flex-wrap gap-1">
                          {suggestion.careerRelevance.slice(0, 3).map((career) => (
                            <Badge key={career} variant="secondary" className="text-xs">
                              {career.replace('-', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={suggestion.confidence * 100} 
                          className="w-20 h-2" 
                        />
                        <span className="text-xs text-gray-500">Confidence</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubjectSelect(suggestion.subject);
                        }}
                      >
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Select
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Learning Profile Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Learning Style</h4>
                    <p className="text-sm text-gray-600">{suggestions.profileAnalysis.learningStyle}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Academic Level</h4>
                    <Badge variant="outline">{suggestions.profileAnalysis.academicLevel}</Badge>
                  </div>
                  
                  {suggestions.profileAnalysis.interests.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Interests</h4>
                      <div className="flex flex-wrap gap-1">
                        {suggestions.profileAnalysis.interests.map((interest) => (
                          <Badge key={interest} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {suggestions.profileAnalysis.strengths.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Strengths</h4>
                      <div className="flex flex-wrap gap-1">
                        {suggestions.profileAnalysis.strengths.map((strength) => (
                          <Badge key={strength} className="bg-green-100 text-green-800 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {suggestions.profileAnalysis.areasForImprovement.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Areas for Improvement</h4>
                      <div className="flex flex-wrap gap-1">
                        {suggestions.profileAnalysis.areasForImprovement.map((area) => (
                          <Badge key={area} className="bg-yellow-100 text-yellow-800 text-xs">
                            <Target className="h-3 w-3 mr-1" />
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="learning-path" className="space-y-4">
            <div className="grid gap-4">
              {suggestions.suggestions.slice(0, 3).map((suggestion) => (
                <Card key={suggestion.subject}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {suggestion.subject.replace('-', ' ')} Learning Path
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {suggestion.learningPath && suggestion.learningPath.length > 0 ? (
                      <div className="space-y-2">
                        {suggestion.learningPath.map((step, index) => (
                          <div key={step} className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
                              {index + 1}
                            </div>
                            <span className="text-sm capitalize">{step.replace('-', ' ')}</span>
                            {index < suggestion.learningPath!.length - 1 && (
                              <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Learning path not available for this subject.</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
