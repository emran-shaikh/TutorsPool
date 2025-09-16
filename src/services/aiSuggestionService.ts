// AI-based subject suggestion service
export interface LearningProfile {
  id: string;
  userId: string;
  gradeLevel?: string;
  learningGoals?: string;
  preferredMode?: 'ONLINE' | 'OFFLINE';
  budgetMin?: number;
  budgetMax?: number;
  specialRequirements?: string;
  interests?: string[];
  academicLevel?: string;
  learningStyle?: string;
  timeAvailability?: string;
  subjectsStudied?: string[];
  strengths?: string[];
  weaknesses?: string[];
  careerGoals?: string[];
  hobbies?: string[];
}

export interface SubjectSuggestion {
  subject: string;
  confidence: number;
  reason: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedHours: number;
  prerequisites?: string[];
  relatedSubjects?: string[];
  careerRelevance?: string[];
  learningPath?: string[];
}

export interface AISuggestionResponse {
  suggestions: SubjectSuggestion[];
  profileAnalysis: {
    learningStyle: string;
    academicLevel: string;
    interests: string[];
    strengths: string[];
    areasForImprovement: string[];
  };
  personalizedMessage: string;
}

class AISuggestionService {
  private subjectsDatabase = {
    'mathematics': {
      prerequisites: [],
      difficulty: 'INTERMEDIATE',
      relatedSubjects: ['physics', 'chemistry', 'statistics', 'computer-science'],
      careerRelevance: ['engineering', 'data-science', 'finance', 'research'],
      learningPath: ['algebra', 'geometry', 'calculus', 'statistics']
    },
    'physics': {
      prerequisites: ['mathematics'],
      difficulty: 'INTERMEDIATE',
      relatedSubjects: ['mathematics', 'chemistry', 'engineering'],
      careerRelevance: ['engineering', 'research', 'medicine', 'technology'],
      learningPath: ['mechanics', 'thermodynamics', 'electromagnetism', 'quantum-physics']
    },
    'chemistry': {
      prerequisites: ['mathematics'],
      difficulty: 'INTERMEDIATE',
      relatedSubjects: ['mathematics', 'physics', 'biology'],
      careerRelevance: ['medicine', 'pharmacy', 'research', 'engineering'],
      learningPath: ['general-chemistry', 'organic-chemistry', 'physical-chemistry', 'biochemistry']
    },
    'biology': {
      prerequisites: [],
      difficulty: 'BEGINNER',
      relatedSubjects: ['chemistry', 'medicine', 'environmental-science'],
      careerRelevance: ['medicine', 'research', 'environmental-science', 'pharmacy'],
      learningPath: ['cell-biology', 'genetics', 'ecology', 'human-biology']
    },
    'computer-science': {
      prerequisites: ['mathematics'],
      difficulty: 'INTERMEDIATE',
      relatedSubjects: ['mathematics', 'engineering', 'data-science'],
      careerRelevance: ['software-development', 'data-science', 'cybersecurity', 'research'],
      learningPath: ['programming', 'algorithms', 'data-structures', 'software-engineering']
    },
    'english': {
      prerequisites: [],
      difficulty: 'BEGINNER',
      relatedSubjects: ['literature', 'communication', 'writing'],
      careerRelevance: ['journalism', 'education', 'marketing', 'law'],
      learningPath: ['grammar', 'literature', 'writing', 'communication']
    },
    'history': {
      prerequisites: [],
      difficulty: 'BEGINNER',
      relatedSubjects: ['geography', 'political-science', 'sociology'],
      careerRelevance: ['education', 'research', 'law', 'journalism'],
      learningPath: ['ancient-history', 'world-history', 'modern-history', 'specialized-topics']
    },
    'geography': {
      prerequisites: [],
      difficulty: 'BEGINNER',
      relatedSubjects: ['environmental-science', 'history', 'political-science'],
      careerRelevance: ['environmental-science', 'urban-planning', 'research', 'education'],
      learningPath: ['physical-geography', 'human-geography', 'environmental-geography', 'regional-studies']
    },
    'economics': {
      prerequisites: ['mathematics'],
      difficulty: 'INTERMEDIATE',
      relatedSubjects: ['mathematics', 'business', 'political-science'],
      careerRelevance: ['finance', 'business', 'policy', 'research'],
      learningPath: ['microeconomics', 'macroeconomics', 'international-economics', 'applied-economics']
    },
    'psychology': {
      prerequisites: [],
      difficulty: 'BEGINNER',
      relatedSubjects: ['biology', 'sociology', 'philosophy'],
      careerRelevance: ['counseling', 'research', 'education', 'healthcare'],
      learningPath: ['general-psychology', 'developmental-psychology', 'social-psychology', 'clinical-psychology']
    }
  };

  private interestKeywords = {
    'technology': ['computer-science', 'mathematics', 'physics', 'engineering'],
    'medicine': ['biology', 'chemistry', 'physics', 'psychology'],
    'business': ['economics', 'mathematics', 'english', 'psychology'],
    'arts': ['english', 'history', 'psychology', 'geography'],
    'science': ['mathematics', 'physics', 'chemistry', 'biology'],
    'engineering': ['mathematics', 'physics', 'computer-science', 'chemistry'],
    'education': ['english', 'history', 'psychology', 'mathematics'],
    'research': ['mathematics', 'physics', 'chemistry', 'biology', 'psychology'],
    'environment': ['biology', 'chemistry', 'geography', 'environmental-science'],
    'communication': ['english', 'psychology', 'history', 'geography']
  };

  private gradeLevelMapping = {
    'elementary': ['mathematics', 'english', 'science', 'history', 'geography'],
    'middle-school': ['mathematics', 'english', 'science', 'history', 'geography', 'biology'],
    'high-school': ['mathematics', 'physics', 'chemistry', 'biology', 'english', 'history', 'geography', 'economics'],
    'college': ['mathematics', 'physics', 'chemistry', 'biology', 'computer-science', 'economics', 'psychology'],
    'graduate': ['mathematics', 'physics', 'chemistry', 'biology', 'computer-science', 'economics', 'psychology']
  };

  analyzeProfile(profile: LearningProfile): AISuggestionResponse {
    const suggestions: SubjectSuggestion[] = [];
    const profileAnalysis = this.generateProfileAnalysis(profile);
    
    // Generate suggestions based on multiple factors
    const interestBasedSuggestions = this.generateInterestBasedSuggestions(profile);
    const gradeBasedSuggestions = this.generateGradeBasedSuggestions(profile);
    const careerBasedSuggestions = this.generateCareerBasedSuggestions(profile);
    const weaknessBasedSuggestions = this.generateWeaknessBasedSuggestions(profile);
    
    // Combine and deduplicate suggestions
    const allSuggestions = [
      ...interestBasedSuggestions,
      ...gradeBasedSuggestions,
      ...careerBasedSuggestions,
      ...weaknessBasedSuggestions
    ];
    
    // Remove duplicates and calculate confidence scores
    const uniqueSuggestions = this.deduplicateAndScoreSuggestions(allSuggestions, profile);
    
    // Sort by confidence and take top suggestions
    suggestions.push(...uniqueSuggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 6));
    
    const personalizedMessage = this.generatePersonalizedMessage(profile, suggestions);
    
    return {
      suggestions,
      profileAnalysis,
      personalizedMessage
    };
  }

  private generateProfileAnalysis(profile: LearningProfile) {
    return {
      learningStyle: this.determineLearningStyle(profile),
      academicLevel: profile.gradeLevel || 'high-school',
      interests: profile.interests || [],
      strengths: profile.strengths || [],
      areasForImprovement: profile.weaknesses || []
    };
  }

  private determineLearningStyle(profile: LearningProfile): string {
    if (profile.preferredMode === 'ONLINE') {
      return 'Digital Learner - Prefers online learning with interactive content';
    }
    if (profile.specialRequirements?.toLowerCase().includes('visual')) {
      return 'Visual Learner - Benefits from diagrams, charts, and visual aids';
    }
    if (profile.specialRequirements?.toLowerCase().includes('hands-on')) {
      return 'Kinesthetic Learner - Learns best through hands-on activities';
    }
    return 'Mixed Learning Style - Adapts to various learning methods';
  }

  private generateInterestBasedSuggestions(profile: LearningProfile): SubjectSuggestion[] {
    const suggestions: SubjectSuggestion[] = [];
    const interests = profile.interests || [];
    
    interests.forEach(interest => {
      const relatedSubjects = this.interestKeywords[interest.toLowerCase()] || [];
      relatedSubjects.forEach(subject => {
        suggestions.push({
          subject,
          confidence: 0.8,
          reason: `Based on your interest in ${interest}`,
          difficulty: this.subjectsDatabase[subject]?.difficulty || 'INTERMEDIATE',
          estimatedHours: this.calculateEstimatedHours(subject, profile.gradeLevel),
          prerequisites: this.subjectsDatabase[subject]?.prerequisites || [],
          relatedSubjects: this.subjectsDatabase[subject]?.relatedSubjects || [],
          careerRelevance: this.subjectsDatabase[subject]?.careerRelevance || [],
          learningPath: this.subjectsDatabase[subject]?.learningPath || []
        });
      });
    });
    
    return suggestions;
  }

  private generateGradeBasedSuggestions(profile: LearningProfile): SubjectSuggestion[] {
    const suggestions: SubjectSuggestion[] = [];
    const gradeLevel = profile.gradeLevel || 'high-school';
    const subjects = this.gradeLevelMapping[gradeLevel] || [];
    
    subjects.forEach(subject => {
      suggestions.push({
        subject,
        confidence: 0.7,
        reason: `Appropriate for your ${gradeLevel} level`,
        difficulty: this.subjectsDatabase[subject]?.difficulty || 'INTERMEDIATE',
        estimatedHours: this.calculateEstimatedHours(subject, gradeLevel),
        prerequisites: this.subjectsDatabase[subject]?.prerequisites || [],
        relatedSubjects: this.subjectsDatabase[subject]?.relatedSubjects || [],
        careerRelevance: this.subjectsDatabase[subject]?.careerRelevance || [],
        learningPath: this.subjectsDatabase[subject]?.learningPath || []
      });
    });
    
    return suggestions;
  }

  private generateCareerBasedSuggestions(profile: LearningProfile): SubjectSuggestion[] {
    const suggestions: SubjectSuggestion[] = [];
    const careerGoals = profile.careerGoals || [];
    
    careerGoals.forEach(career => {
      const careerLower = career.toLowerCase();
      let relatedSubjects: string[] = [];
      
      if (careerLower.includes('engineer') || careerLower.includes('technology')) {
        relatedSubjects = ['mathematics', 'physics', 'computer-science'];
      } else if (careerLower.includes('doctor') || careerLower.includes('medical')) {
        relatedSubjects = ['biology', 'chemistry', 'physics'];
      } else if (careerLower.includes('business') || careerLower.includes('finance')) {
        relatedSubjects = ['economics', 'mathematics', 'english'];
      } else if (careerLower.includes('teacher') || careerLower.includes('education')) {
        relatedSubjects = ['english', 'mathematics', 'psychology'];
      } else if (careerLower.includes('research') || careerLower.includes('scientist')) {
        relatedSubjects = ['mathematics', 'physics', 'chemistry', 'biology'];
      }
      
      relatedSubjects.forEach(subject => {
        suggestions.push({
          subject,
          confidence: 0.75,
          reason: `Essential for your career goal in ${career}`,
          difficulty: this.subjectsDatabase[subject]?.difficulty || 'INTERMEDIATE',
          estimatedHours: this.calculateEstimatedHours(subject, profile.gradeLevel),
          prerequisites: this.subjectsDatabase[subject]?.prerequisites || [],
          relatedSubjects: this.subjectsDatabase[subject]?.relatedSubjects || [],
          careerRelevance: this.subjectsDatabase[subject]?.careerRelevance || [],
          learningPath: this.subjectsDatabase[subject]?.learningPath || []
        });
      });
    });
    
    return suggestions;
  }

  private generateWeaknessBasedSuggestions(profile: LearningProfile): SubjectSuggestion[] {
    const suggestions: SubjectSuggestion[] = [];
    const weaknesses = profile.weaknesses || [];
    
    weaknesses.forEach(weakness => {
      const weaknessLower = weakness.toLowerCase();
      let suggestedSubjects: string[] = [];
      
      if (weaknessLower.includes('math') || weaknessLower.includes('mathematics')) {
        suggestedSubjects = ['mathematics'];
      } else if (weaknessLower.includes('science')) {
        suggestedSubjects = ['physics', 'chemistry', 'biology'];
      } else if (weaknessLower.includes('english') || weaknessLower.includes('writing')) {
        suggestedSubjects = ['english'];
      } else if (weaknessLower.includes('history') || weaknessLower.includes('social')) {
        suggestedSubjects = ['history', 'geography'];
      }
      
      suggestedSubjects.forEach(subject => {
        suggestions.push({
          subject,
          confidence: 0.6,
          reason: `Help improve your ${weakness} skills`,
          difficulty: this.subjectsDatabase[subject]?.difficulty || 'INTERMEDIATE',
          estimatedHours: this.calculateEstimatedHours(subject, profile.gradeLevel),
          prerequisites: this.subjectsDatabase[subject]?.prerequisites || [],
          relatedSubjects: this.subjectsDatabase[subject]?.relatedSubjects || [],
          careerRelevance: this.subjectsDatabase[subject]?.careerRelevance || [],
          learningPath: this.subjectsDatabase[subject]?.learningPath || []
        });
      });
    });
    
    return suggestions;
  }

  private deduplicateAndScoreSuggestions(suggestions: SubjectSuggestion[], profile: LearningProfile): SubjectSuggestion[] {
    const subjectMap = new Map<string, SubjectSuggestion>();
    
    suggestions.forEach(suggestion => {
      const existing = subjectMap.get(suggestion.subject);
      if (existing) {
        // Increase confidence for multiple reasons
        existing.confidence = Math.min(0.95, existing.confidence + 0.1);
        existing.reason += `; ${suggestion.reason}`;
      } else {
        subjectMap.set(suggestion.subject, { ...suggestion });
      }
    });
    
    return Array.from(subjectMap.values());
  }

  private calculateEstimatedHours(subject: string, gradeLevel?: string): number {
    const baseHours = {
      'mathematics': 120,
      'physics': 100,
      'chemistry': 100,
      'biology': 80,
      'computer-science': 150,
      'english': 60,
      'history': 60,
      'geography': 50,
      'economics': 80,
      'psychology': 70
    };
    
    const multiplier = {
      'elementary': 0.5,
      'middle-school': 0.7,
      'high-school': 1.0,
      'college': 1.5,
      'graduate': 2.0
    };
    
    return Math.round((baseHours[subject] || 80) * (multiplier[gradeLevel] || 1.0));
  }

  private generatePersonalizedMessage(profile: LearningProfile, suggestions: SubjectSuggestion[]): string {
    const topSubjects = suggestions.slice(0, 3).map(s => s.subject).join(', ');
    const interests = profile.interests?.join(', ') || 'your interests';
    const careerGoals = profile.careerGoals?.join(', ') || 'your career goals';
    
    return `Based on your interests in ${interests} and career goals in ${careerGoals}, I recommend focusing on ${topSubjects}. These subjects align with your learning style and will help you achieve your academic and professional objectives.`;
  }
}

export const aiSuggestionService = new AISuggestionService();
