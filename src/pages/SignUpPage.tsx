import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/api';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const validateForm = () => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Use authService to register
      await authService.register(email, username, password);
      
      // Use AuthContext to register
      await register(email, username, password);
      
      setSuccess('Account created successfully! Redirecting...');
      
      // Navigate to dashboard after brief delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Email might already be registered.');
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-black px-4 transition-colors">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-green-400/10 dark:bg-green-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-amber-400/10 dark:bg-amber-600/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-green-600 dark:hover:text-green-400 mb-8 transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-lg">Back</span>
        </button>

        {/* Sign Up Card */}
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-[2rem] shadow-2xl p-10 border border-neutral-200/50 dark:border-neutral-800/50">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/30">
              <span className="text-white text-3xl">🍽️</span>
            </div>
            <h1 className="text-3xl text-neutral-900 dark:text-white mb-3 tracking-tight">Create Account</h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Join our halal recipe community
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="username" className="text-lg">Username</Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-green-600 dark:group-focus-within:text-green-400 transition-colors" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-12 bg-stone-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-2xl h-14 text-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-lg">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-green-600 dark:group-focus-within:text-green-400 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 bg-stone-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-2xl h-14 text-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-lg">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-green-600 dark:group-focus-within:text-green-400 transition-colors" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 bg-stone-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-2xl h-14 text-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                  required
                />
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">At least 6 characters</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-lg">Confirm Password</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-green-600 dark:group-focus-within:text-green-400 transition-colors" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-12 bg-stone-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-2xl h-14 text-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white shadow-lg hover:shadow-xl rounded-2xl py-7 text-lg transition-all hover:scale-105"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-neutral-600 dark:text-neutral-400">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-green-600 dark:text-green-400 hover:underline font-semibold"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
