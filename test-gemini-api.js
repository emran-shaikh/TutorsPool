// Quick test script to verify Gemini API key works
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyAkeA7LykGr9ckcT50JH7Ie2kUUU5s7T4M';

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API...\n');
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = "Say 'Hello from TutorsPool!' in one sentence.";
    
    console.log('📤 Sending request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ SUCCESS! Gemini API is working!\n');
    console.log('📥 Response:', text);
    console.log('\n✨ Your Gemini API key is valid and working!');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\n🔍 Full error:', error);
  }
}

testGeminiAPI();

