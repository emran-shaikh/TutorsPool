import React, { useState } from 'react';
import { createTutor } from '@/lib/data';
import { toast } from '@/components/ui/use-toast';

const TutorRegister: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subjects, setSubjects] = useState('');
  const [bio, setBio] = useState('');
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white border rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Tutor Registration</h1>
        <p className="text-sm text-gray-600 mb-6">Collect basic tutor details. This is a placeholder; backend integration will be added later.</p>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          if (!fullName.trim() || !email.trim()) {
            toast({ title: 'Missing information', description: 'Full name and email are required.' });
            return;
          }
          setSubmitting(true);
          try {
            const payload = { fullName: fullName.trim(), email: email.trim(), subjects: subjects.split(',').map(s=>s.trim()).filter(Boolean), bio };
            await createTutor(payload);
            toast({ title: 'Tutor registered', description: 'Your tutor profile has been created.' });
            setFullName(''); setEmail(''); setSubjects(''); setBio('');
          } catch (err: any) {
            toast({ title: 'Registration failed', description: err?.message || 'Please try again.' });
          } finally {
            setSubmitting(false);
          }
        }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input value={fullName} onChange={(e)=>setFullName(e.target.value)} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Subjects</label>
            <input value={subjects} onChange={(e)=>setSubjects(e.target.value)} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Math, Physics" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea value={bio} onChange={(e)=>setBio(e.target.value)} className="w-full border rounded-md px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2">
            <button disabled={submitting} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-md disabled:opacity-60">{submitting ? 'Submitting…' : 'Create account'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TutorRegister;


