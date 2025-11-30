import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, TrendingUp, Upload, User, Home, Shield, Bookmark, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: Home, roles: ['user', 'admin'] },
    { path: '/trending', label: 'Trending', icon: TrendingUp, roles: ['user', 'admin'] },
    { path: '/favorites', label: 'Favorites', icon: Bookmark, roles: ['user', 'admin'] },
    { path: '/upload', label: 'Upload Recipe', icon: Upload, roles: ['user', 'admin'] },
    { path: '/admin', label: 'Admin Panel', icon: Shield, roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role as string)
  );

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl shadow-sm border-b border-neutral-200/50 dark:border-neutral-800/50 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-all group"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <span className="text-white text-xl md:text-2xl">🍽️</span>
            </div>
            <span className="text-lg md:text-xl text-neutral-900 dark:text-white tracking-tight">Halal Bites</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl transition-all duration-500 ease-out ${
                    isActive
                      ? 'bg-green-600 text-white shadow-lg shadow-green-500/30 scale-105'
                      : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:scale-105'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate(`/profile/${user?.id}`)}
              className="flex items-center gap-2.5 px-5 py-3 bg-green-600 hover:bg-green-700 rounded-2xl text-white transition-all duration-500 ease-out"
              title="View and edit your profile"
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-2 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-2xl px-6 py-6 transition-all duration-500 ease-out text-neutral-600 dark:text-neutral-300"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-500 ease-out"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1.5">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all duration-500 ease-out ${
                    isActive
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  <span className="text-sm sm:text-base">{item.label}</span>
                </button>
              );
            })}
            
            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
              <button
                onClick={() => {
                  navigate(`/profile/${user?.id}`);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-all"
              >
                <User className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                <span className="text-sm sm:text-base">Profile</span>
              </button>
              
              <Button 
                variant="outline" 
                className="w-full border-2 border-neutral-300 dark:border-neutral-700 rounded-xl py-4 sm:py-5 text-sm sm:text-base"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}