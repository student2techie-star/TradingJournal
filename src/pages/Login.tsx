import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Successfully logged in');
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password reset email sent! Check your inbox.');
    }
    setLoading(false);
  };

  return (
    <div 
      className="flex min-h-screen items-center justify-end px-4 sm:px-12 lg:px-32 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url('/login_page.png')` }}
    >
      {/* Quote Overlay - Hidden on small screens */}
      <div className="absolute bottom-12 left-12 lg:left-24 max-w-lg hidden md:block">
        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
          Master Your Discipline.
        </h1>
        <p className="text-lg text-gray-300 font-medium drop-shadow-md">
          "Trading is 10% strategy and 90% psychology. Track your behavior, conquer your mind, and become consistently profitable."
        </p>
      </div>

      {/* Login Box */}
      <div className="w-full max-w-md space-y-8 rounded-xl bg-surface/60 backdrop-blur-md p-8 shadow-2xl border border-surfaceHighlight relative z-10">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-textMain">
            Trading Journal
          </h2>
          <p className="mt-2 text-center text-sm text-textMuted">
            Sign in to your account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
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
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="sr-only">Password</label>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-sm font-medium text-primary hover:text-primaryHover transition-colors ml-auto"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border border-surfaceHighlight bg-surface/50 px-3 py-2 text-textMain placeholder-textMuted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm backdrop-blur-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-background hover:bg-primaryHover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        
        <div className="text-center text-sm">
          <span className="text-textMuted">Don't have an account? </span>
          <Link to="/register" className="font-medium text-primary hover:text-primaryHover">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
