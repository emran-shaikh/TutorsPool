import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator, 
  Atom, 
  Zap, 
  Microscope, 
  PenTool, 
  Code, 
  Globe, 
  BookOpen,
  Plus,
  Search
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Subject {
  name: string;
  icon: React.ReactNode;
  studentCount: number;
  tutorCount: number;
  levels: string[];
}

interface CustomSubjectRequest {
  subjectName: string;
  description: string;
  level: string;
}

const SubjectsSection: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState('O Levels');
  const [customSubjectRequest, setCustomSubjectRequest] = useState<CustomSubjectRequest>({
    subjectName: '',
    description: '',
    level: 'O Levels'
  });
  const [showCustomRequest, setShowCustomRequest] = useState(false);

  // Fetch all tutors to analyze subjects
  const { data: tutorsData, isLoading } = useQuery({
    queryKey: ['tutors-subjects'],
    queryFn: () => apiClient.searchTutors({ limit: 100 }),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Process tutors data to extract subjects with counts
  const subjectsData = React.useMemo(() => {
    if (!tutorsData?.items) {
      return [];
    }

    const subjectMap = new Map<string, {
      name: string;
      tutorCount: number;
      studentCount: number;
      levels: Set<string>;
    }>();

    // Count tutors and students for each subject
    tutorsData.items.forEach(tutor => {
      const subjects = tutor.subjects || [];
      const levels = tutor.levels || [];
      
      
      subjects.forEach(subject => {
        if (!subjectMap.has(subject)) {
          subjectMap.set(subject, {
            name: subject,
            tutorCount: 0,
            studentCount: 0,
            levels: new Set()
          });
        }
        
        const subjectData = subjectMap.get(subject)!;
        subjectData.tutorCount += 1;
        subjectData.studentCount += Math.floor(Math.random() * 1000) + 500; // Simulate student count
        levels.forEach(level => subjectData.levels.add(level));
      });
    });

    // Convert to array and sort by tutor count
    const result = Array.from(subjectMap.values())
      .map(subject => ({
        ...subject,
        levels: Array.from(subject.levels)
      }))
      .sort((a, b) => b.tutorCount - a.tutorCount)
      .slice(0, 8); // Show top 8 subjects

    return result;
  }, [tutorsData]);

  // Get subject icon
  const getSubjectIcon = (subjectName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Mathematics': <Calculator className="h-6 w-6 text-orange-500" />,
      'Chemistry': <Atom className="h-6 w-6 text-orange-500" />,
      'Physics': <Zap className="h-6 w-6 text-orange-500" />,
      'Biology': <Microscope className="h-6 w-6 text-orange-500" />,
      'English': <PenTool className="h-6 w-6 text-orange-500" />,
      'Computer Science': <Code className="h-6 w-6 text-orange-500" />,
      'Geography': <Globe className="h-6 w-6 text-orange-500" />,
      'Additional Math': <Calculator className="h-6 w-6 text-orange-500" />,
    };
    
    return iconMap[subjectName] || <BookOpen className="h-6 w-6 text-orange-500" />;
  };

  // Filter subjects by level
  const filteredSubjects = subjectsData.filter(subject => 
    subject.levels.includes(selectedLevel) || subject.levels.includes('All Levels')
  );

  // Handle custom subject request
  const handleCustomSubjectRequest = async () => {
    try {
      const response = await apiClient.submitCustomSubjectRequest({
        subjectName: customSubjectRequest.subjectName,
        description: customSubjectRequest.description,
        level: customSubjectRequest.level,
        studentId: undefined // Could get from auth context
      });
      
      alert(`Custom subject request submitted successfully! Request ID: ${response.requestId}`);
      
      // Reset form
      setCustomSubjectRequest({
        subjectName: '',
        description: '',
        level: 'O Levels'
      });
      setShowCustomRequest(false);
    } catch (error) {
      console.error('Error submitting custom subject request:', error);
      alert('Failed to submit request. Please try again.');
    }
  };

  if (isLoading) {
  return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse Subjects</h2>
            <p className="text-xl text-gray-600">Find tutors for your academic subjects</p>
        </div>

          <div className="flex justify-center mb-8">
            <div className="flex space-x-2 bg-gray-200 rounded-lg p-1">
              {['O Levels', 'IGCSE', 'A Levels'].map((level) => (
                <div key={level} className="px-6 py-2 rounded-md bg-gray-300 text-gray-600">
                {level}
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-32 bg-gray-300"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse Subjects</h2>
          <p className="text-xl text-gray-600">Find tutors for your academic subjects</p>
        </div>

        {/* Level Tabs */}
        <div className="flex justify-center mb-8">
          <Tabs value={selectedLevel} onValueChange={setSelectedLevel} className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="O Levels" className="text-sm">
                O Levels
              </TabsTrigger>
              <TabsTrigger value="IGCSE" className="text-sm">
                IGCSE
              </TabsTrigger>
              <TabsTrigger value="A Levels" className="text-sm">
                A Levels
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {(filteredSubjects.length > 0 ? filteredSubjects : subjectsData).map((subject, index) => (
            <Card key={subject.name} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                {getSubjectIcon(subject.name)}
                  </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{subject.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {subject.tutorCount} tutors
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {subject.studentCount.toLocaleString()}+ students learning
                </p>
                <Link 
                  to={`/search?subject=${encodeURIComponent(subject.name)}&level=${encodeURIComponent(selectedLevel)}`}
                  className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center"
                >
                  Find Tutors →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Subject Request */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Can't find your subject?</p>
          <Button 
            onClick={() => setShowCustomRequest(true)}
            className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg"
          >
            Request Custom Subject
          </Button>
        </div>

        {/* Custom Subject Request Modal */}
        {showCustomRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4">Request Custom Subject</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    value={customSubjectRequest.subjectName}
                    onChange={(e) => setCustomSubjectRequest(prev => ({
                      ...prev,
                      subjectName: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Advanced Calculus"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level
                  </label>
                  <select
                    value={customSubjectRequest.level}
                    onChange={(e) => setCustomSubjectRequest(prev => ({
                      ...prev,
                      level: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="O Levels">O Levels</option>
                    <option value="IGCSE">IGCSE</option>
                    <option value="A Levels">A Levels</option>
                    <option value="University">University</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={customSubjectRequest.description}
                    onChange={(e) => setCustomSubjectRequest(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe what you're looking for..."
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button
                  onClick={handleCustomSubjectRequest}
                  className="flex-1 bg-blue-900 hover:bg-blue-800 text-white"
                >
                  Submit Request
                </Button>
                <Button
                  onClick={() => setShowCustomRequest(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SubjectsSection;