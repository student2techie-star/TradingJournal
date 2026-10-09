import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      toast.error(error.message);
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      toast.error('This email is already registered. Please sign in.');
    } else {
      if (data.session) {
        toast.success('Registration successful');
        navigate('/dashboard');
      } else {
        toast.success('Please check your email for confirmation');
        navigate('/login');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center sm:justify-end px-4 sm:px-12 lg:px-32 relative overflow-hidden">
      {/* Background Image & Responsive Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${import.meta.env.BASE_URL}login_page.png')` }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b sm:bg-gradient-to-r from-black/60 sm:from-black/20 to-black/90 sm:to-black/80" />
      
      <div className="w-full max-w-md space-y-8 rounded-xl bg-surface/60 backdrop-blur-md p-8 shadow-2xl border border-surfaceHighlight relative z-10">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-textMain">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-textMuted">
            Start tracking your trading discipline
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
             <div>
              <label htmlFor="fullName" className="sr-only">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="block w-full rounded-md border border-surfaceHighlight bg-surface/50 px-3 py-2 text-textMain placeholder-textMuted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm backdrop-blur-sm"
                placeholder="Full Name"
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border border-surfaceHighlight bg-surface/50 px-3 py-2 text-textMain placeholder-textMuted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm backdrop-blur-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border border-surfaceHighlight bg-surface/50 px-3 py-2 text-textMain placeholder-textMuted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm backdrop-blur-sm"
                placeholder="Password (min 6 characters)"
                minLength={6}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryHover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </div>
        </form>
        
        <div className="text-center text-sm">
          <span className="text-textMuted">Already have an account? </span>
          <Link to="/login" className="font-medium text-primary hover:text-primaryHover">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};
