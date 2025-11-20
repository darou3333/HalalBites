import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Upload, TrendingUp, ChefHat, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleEnterSite = () => {
    setShowAuthModal(true);
  };

  const handleGuestContinue = () => {
    setShowAuthModal(false);
    navigate('/trending');
  };

  const handleLoginClick = () => {
    setShowAuthModal(false);
    navigate('/login');
  };

  const handleSignUpClick = () => {
    setShowAuthModal(false);
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient Background - Apple-inspired */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-amber-50 dark:from-neutral-950 dark:via-black dark:to-neutral-900"></div>
        
        {/* Animated Glow */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-green-400/20 dark:bg-green-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-amber-400/20 dark:bg-amber-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-20 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/30">
              <span className="text-white text-4xl">🍽️</span>
            </div>
            <h1 className="text-neutral-900 dark:text-white tracking-tight">Halal Bites</h1>
          </div>
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 bg-green-100/80 dark:bg-green-900/30 backdrop-blur-xl text-green-700 dark:text-green-300 px-5 py-2.5 rounded-full mb-10 border border-green-200/50 dark:border-green-800/50 shadow-lg animate-fade-in-up delay-100">
            <Shield className="w-4 h-4" />
            <span className="text-sm">100% Halal Certified Recipes</span>
          </div>
          
          {/* Hero Heading */}
          <h2 className="text-5xl sm:text-6xl lg:text-7xl text-neutral-900 dark:text-white mb-8 tracking-tight leading-tight animate-fade-in-up delay-200">
            Discover & Share<br />
            <span className="bg-gradient-to-r from-green-600 to-green-500 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent">
              Authentic Halal Recipes
            </span>
          </h2>
          
          <p className="text-xl sm:text-2xl text-neutral-600 dark:text-neutral-400 mb-16 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-300">
            Join a global community of food lovers. Browse verified recipes, share family favorites, and explore dishes from every cuisine.
          </p>

          {/* CTA Button */}
          <div className="animate-fade-in-up delay-400">
            <Button 
              size="lg"
              onClick={handleEnterSite}
              className="bg-green-600 hover:bg-green-700 text-white shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-500 ease-out text-lg px-10 py-7 rounded-2xl hover:scale-105"
            >
              <ChefHat className="w-6 h-6 mr-3" />
              Enter the Site
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-stone-50 dark:bg-neutral-950 py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl text-neutral-900 dark:text-white mb-6 tracking-tight">
              Why Choose Halal Bites?
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Everything you need to discover, share, and enjoy halal recipes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group text-center p-10 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl rounded-3xl hover:bg-white dark:hover:bg-neutral-900 transition-all duration-500 border border-neutral-200/50 dark:border-neutral-800/50 hover:shadow-2xl hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-950/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-green-200/50 dark:border-green-800/50 group-hover:shadow-lg group-hover:shadow-green-500/20 transition-all duration-500">
                <Shield className="w-10 h-10 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-2xl text-neutral-900 dark:text-white mb-4">Halal Verified</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                All recipes are automatically checked for haram ingredients to ensure they meet halal standards
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group text-center p-10 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl rounded-3xl hover:bg-white dark:hover:bg-neutral-900 transition-all duration-500 border border-neutral-200/50 dark:border-neutral-800/50 hover:shadow-2xl hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-950/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-amber-200/50 dark:border-amber-800/50 group-hover:shadow-lg group-hover:shadow-amber-500/20 transition-all duration-500">
                <Upload className="w-10 h-10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-2xl text-neutral-900 dark:text-white mb-4">Share Your Recipes</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Upload your favorite halal dishes with step-by-step instructions and inspire the community
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group text-center p-10 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl rounded-3xl hover:bg-white dark:hover:bg-neutral-900 transition-all duration-500 border border-neutral-200/50 dark:border-neutral-800/50 hover:shadow-2xl hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-950/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-orange-200/50 dark:border-orange-800/50 group-hover:shadow-lg group-hover:shadow-orange-500/20 transition-all duration-500">
                <TrendingUp className="w-10 h-10 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-2xl text-neutral-900 dark:text-white mb-4">Discover Trending</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Explore the most popular recipes voted by our community and find new favorites
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 dark:bg-black text-neutral-400 py-16 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">🍽️</span>
            </div>
            <span className="text-white text-xl">Halal Bites</span>
          </div>
          <p className="mb-3 text-lg">Bringing halal food lovers together, one recipe at a time.</p>
          <p className="text-neutral-500">&copy; 2024 Halal Bites. All rights reserved.</p>
        </div>
      </footer>

      {/* Authentication Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 overflow-hidden [&>button]:hidden">
          {/* Modal Content */}
          <div className="p-2 sm:p-4">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white text-2xl">🍽️</span>
              </div>
              <h3 className="text-2xl text-neutral-900 dark:text-white mb-2">Welcome to Halal Bites</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Choose how you'd like to continue
              </p>
            </div>

            <div className="space-y-3">
              {/* Login Button */}
              <Button
                onClick={handleLoginClick}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 ease-out"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Login
              </Button>

              {/* Sign Up Button */}
              <Button
                onClick={handleSignUpClick}
                variant="outline"
                className="w-full border-2 border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 py-6 text-lg rounded-xl transition-all duration-500 ease-out"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Sign Up
              </Button>

              {/* Guest Button */}
              <Button
                onClick={handleGuestContinue}
                variant="ghost"
                className="w-full text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 py-6 text-lg rounded-xl transition-all duration-500 ease-out"
              >
                Continue as Guest
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scroll {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
        .delay-100 {
          animation-delay: 100ms;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
        .delay-400 {
          animation-delay: 400ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
        .animate-scroll {
          animation: scroll 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}