import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const Account: React.FC = () => {
  const { user, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;
  const valid = password.length >= 6 && password === confirm;

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Account</h1>
      <div className="text-sm text-gray-600 mb-6">Signed in as {user.email}</div>
      <form className="space-y-4" onSubmit={async (e)=>{
        e.preventDefault();
        if (!valid) {
          toast({ title: 'Invalid password', description: 'Ensure at least 6 chars and matches confirmation.' });
          return;
        }
        setSubmitting(true);
        const { error } = await updatePassword(password);
        setSubmitting(false);
        if (error) {
          toast({ title: 'Update failed', description: error });
          return;
        }
        toast({ title: 'Password updated' });
        setPassword(''); setConfirm('');
      }}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
          <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
          <input value={confirm} onChange={(e)=>setConfirm(e.target.value)} type="password" className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md disabled:opacity-60">{submitting ? 'Saving…' : 'Save password'}</button>
      </form>
    </div>
  );
};

export default Account;


