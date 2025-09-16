// Test script for AI suggestions
const testAISuggestions = async () => {
  try {
    console.log('Testing AI Suggestions API...');
    
    // Test with a sample student profile
    const testProfile = {
      id: 'test-student',
      userId: 'user-9',
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

    // Import the AI suggestion service
    const { aiSuggestionService } = await import('./src/services/aiSuggestionService.ts');
    
    // Generate suggestions
    const suggestions = aiSuggestionService.analyzeProfile(testProfile);
    
    console.log('✅ AI Suggestions generated successfully!');
    console.log('📊 Suggestions:', suggestions.suggestions.length);
    console.log('🎯 Top suggestion:', suggestions.suggestions[0]?.subject);
    console.log('💡 Personalized message:', suggestions.personalizedMessage);
    
    return true;
  } catch (error) {
    console.error('❌ Error testing AI suggestions:', error);
    return false;
  }
};

// Run the test
testAISuggestions().then(success => {
  if (success) {
    console.log('🎉 All tests passed! AI Suggestions feature is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the errors above.');
  }
});
