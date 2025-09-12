import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const Login: React.FC = () => {
  const { signIn, sendPasswordReset, resendEmailConfirmation, getDashboardUrl } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Sign in</h1>
        <p className="text-sm text-gray-600 mb-6">Use your email to access TutorsPool.</p>
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          setSubmitting(true);
          const { error } = await signIn(email, password);
          setSubmitting(false);
          if (error) {
            const lower = String(error).toLowerCase();
            if (lower.includes('email') && lower.includes('confirm')) {
              toast({ title: 'Email not confirmed', description: 'Check your inbox or resend confirmation.' });
            } else {
              toast({ title: 'Login failed', description: error });
            }
            return;
          }
          toast({ title: 'Welcome back!' });
          // Redirect to role-based dashboard or the intended destination
          const redirectTo = from === '/' ? getDashboardUrl() : from;
          navigate(redirectTo, { replace: true });
        }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
          </div>
          <button disabled={submitting || !email.includes('@') || password.length < 6} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md disabled:opacity-60">{submitting ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <div className="text-sm text-gray-600 mt-4 flex items-center justify-between">
          <Link to="/signup" className="text-blue-700">Create account</Link>
          <button onClick={async()=>{ if(!email){ toast({ title: 'Enter your email to reset' }); return;} const { error } = await sendPasswordReset(email); if(error){ toast({ title:'Reset failed', description: error }); } else { toast({ title:'Reset email sent', description:'Check your inbox' }); } }} className="text-blue-700">Forgot password?</button>
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Didn’t get the confirmation email? <button onClick={async()=>{ if(!email){ toast({ title:'Enter your email' }); return; } const { error } = await resendEmailConfirmation(email); if(error){ toast({ title:'Resend failed', description:error }); } else { toast({ title:'Confirmation email sent', description:'Check your inbox' }); } }} className="text-blue-700">Resend</button>
        </div>
      </div>
    </div>
  );
};

export default Login;


