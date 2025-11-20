import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use authService to login
      await login(emailOrUsername, password);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email/username or password');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    navigate('/trending');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-black px-4 transition-colors relative overflow-hidden">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-400/15 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-violet-400/15 dark:bg-violet-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-green-600 dark:hover:text-green-400 mb-8 transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-lg">Back to home</span>
        </button>

        {/* Login Card */}
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-[2rem] shadow-2xl p-10 border border-neutral-200/50 dark:border-neutral-800/50">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/30">
              <span className="text-white text-3xl">🍽️</span>
            </div>
            <h1 className="text-3xl text-neutral-900 dark:text-white mb-3 tracking-tight">Welcome Back</h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Sign in to access your recipes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="emailOrUsername" className="text-lg">Email or Username</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-green-600 dark:group-focus-within:text-green-400 transition-colors" />
                <Input
                  id="emailOrUsername"
                  type="text"
                  placeholder="you@example.com or username"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
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
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white shadow-lg hover:shadow-xl rounded-2xl py-7 text-lg transition-all hover:scale-105"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200 dark:border-neutral-800"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-neutral-900 px-4 text-neutral-500 dark:text-neutral-400">
                or
              </span>
            </div>
          </div>

          <Button
            onClick={handleGuestLogin}
            variant="outline"
            className="w-full border-2 border-neutral-300 dark:border-neutral-700 hover:bg-stone-50 dark:hover:bg-neutral-800 rounded-2xl py-7 text-lg transition-all text-neutral-600 dark:text-neutral-300"
          >
            Continue as Guest
          </Button>

          <div className="mt-8 text-center">
            <p className="text-neutral-600 dark:text-neutral-400">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-green-600 dark:text-green-400 hover:underline font-semibold"
              >
                Sign Up
              </button>
            </p>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl backdrop-blur-xl">
            <p className="text-blue-800 dark:text-blue-300 text-center leading-relaxed text-sm">
              <strong>To test:</strong><br/>
              Register a new account first, then login with your credentials
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
