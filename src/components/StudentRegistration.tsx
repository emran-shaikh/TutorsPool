import React, { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { submitStudentRegistration } from '@/lib/api';
import { User, Mail, MapPin, Calendar, BookOpen, DollarSign, Upload } from 'lucide-react';

const StudentRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    address: '',
    age: '',
    gradeLevel: '',
    subjects: [],
    learningMode: 'online',
    timeSlots: [],
    goals: '',
    budget: '',
    language: '',
    requirements: ''
  });

  const subjects = ['Mathematics', 'Chemistry', 'Physics', 'Biology', 'English', 'Computer Science'];
  const timeSlots = ['Morning (6-12)', 'Afternoon (12-18)', 'Evening (18-24)'];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Student Registration</h2>
        <p className="text-gray-600">Join thousands of successful students worldwide</p>
      </div>

      <form className="space-y-6" onSubmit={async (e) => {
        e.preventDefault();
        try {
          // Optimistically show toast; in a real app handle validation and errors
          const res = await submitStudentRegistration(formData);
          toast({ title: 'Registration submitted', description: 'We will contact you shortly.' });
          setFormData({
            fullName: '', email: '', phone: '', country: '', address: '', age: '', gradeLevel: '', subjects: [], learningMode: 'online', timeSlots: [], goals: '', budget: '', language: '', requirements: ''
          });
        } catch (err: any) {
          toast({ title: 'Submission failed', description: err?.message || 'Please try again later.' });
        }
      }}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <select 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
            >
              <option value="">Select country...</option>
              <option value="UK">United Kingdom</option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="SG">Singapore</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
            <select 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={formData.gradeLevel}
              onChange={(e) => setFormData({...formData, gradeLevel: e.target.value})}
            >
              <option value="">Select grade...</option>
              <option value="O Levels">O Levels</option>
              <option value="IGCSE">IGCSE</option>
              <option value="A Levels">A Levels</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Subjects</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {subjects.map((subject) => (
              <label key={subject} className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">{subject}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Learning Goals</label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={4}
            placeholder="Describe your learning goals and what you want to achieve..."
            value={formData.goals}
            onChange={(e) => setFormData({...formData, goals: e.target.value})}
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
          >
            Create Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentRegistration;