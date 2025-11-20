import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Search, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import RecipeCard from '@/components/RecipeCard';
import { favoriteService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Recipe } from '@/types';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    if (user?.id) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await favoriteService.getAll();
      setFavorites(data || []);
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
      setError('Failed to load favorites');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = favorites.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (recipe.ingredients && recipe.ingredients.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-black flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-950/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-amber-200/50 dark:border-amber-800/50">
            <Bookmark className="w-12 h-12 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl text-neutral-900 dark:text-white mb-6 tracking-tight">
            Save Your Favorite Recipes
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-10 leading-relaxed">
            Sign in to bookmark recipes and access them anytime from your favorites page.
          </p>
          <Button
            onClick={() => navigate('/login')}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transition-all rounded-2xl px-10 py-7 text-lg hover:scale-105"
          >
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black transition-colors relative overflow-hidden">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/15 dark:bg-amber-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/15 dark:bg-yellow-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className={`mb-8 sm:mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-950/20 rounded-2xl sm:rounded-3xl border border-amber-200/50 dark:border-amber-800/50 shadow-lg">
              <Bookmark className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-neutral-900 dark:text-white tracking-tight">Saved Recipes</h1>
          </div>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-neutral-600 dark:text-neutral-400">
            Your personally bookmarked halal recipes
          </p>
        </div>

        {/* Search Bar */}
        <div className={`bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl mb-6 sm:mb-8 border border-neutral-200/50 dark:border-neutral-800/50 transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="relative group">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-neutral-400 group-focus-within:text-amber-600 dark:group-focus-within:text-amber-400 transition-colors" />
            <Input
              type="text"
              placeholder="Search your saved recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 sm:pl-12 md:pl-14 bg-stone-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-xl sm:rounded-2xl h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
            />
          </div>
        </div>

        {/* Stats */}
        {!loading && !error && (
          <div className={`grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50">
              <p className="text-neutral-600 dark:text-neutral-400 mb-1 sm:mb-2 text-xs sm:text-sm">Total Saved</p>
              <p className="text-xl sm:text-2xl md:text-3xl text-neutral-900 dark:text-white">{favorites.length}</p>
            </div>
            <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50">
              <p className="text-neutral-600 dark:text-neutral-400 mb-1 sm:mb-2 text-xs sm:text-sm">Categories</p>
              <p className="text-xl sm:text-2xl md:text-3xl text-neutral-900 dark:text-white">
                {new Set(favorites.map(r => r.category)).size}
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader className="w-12 h-12 text-amber-600 dark:text-amber-400 animate-spin" />
            <p className="mt-4 text-neutral-600 dark:text-neutral-400 text-lg">Loading your favorites...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-24 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl">
            <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error}</p>
          </div>
        )}

        {/* Recipes Grid */}
        {!loading && !error && (
          <>
            {filteredRecipes.length > 0 ? (
              <div>
                <div className={`flex items-center justify-between mb-6 sm:mb-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-neutral-900 dark:text-white tracking-tight">
                    {searchQuery ? 'Search Results' : 'All Saved Recipes'}
                  </h2>
                  <span className="text-xs sm:text-sm md:text-base text-neutral-600 dark:text-neutral-400 bg-stone-100 dark:bg-neutral-900 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full border border-neutral-200 dark:border-neutral-800">
                    {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
                  </span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  {filteredRecipes.map((recipe, index) => (
                    <div
                      key={recipe.id}
                      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                      style={{ transitionDelay: `${400 + index * 100}ms` }}
                    >
                      <RecipeCard
                        recipe={recipe}
                        onViewDetails={(id) => navigate(`/recipe/${id}`)}
                        showBookmark={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-24 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-[2.5rem] border border-neutral-200/50 dark:border-neutral-800/50">
                <Bookmark className="w-20 h-20 text-neutral-300 dark:text-neutral-700 mx-auto mb-6" />
                <h3 className="text-2xl text-neutral-900 dark:text-white mb-4">
                  {searchQuery ? 'No recipes found' : 'No saved recipes yet'}
                </h3>
                <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8">
                  {searchQuery 
                    ? 'Try adjusting your search terms' 
                    : 'Start bookmarking recipes to see them here'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => navigate('/dashboard')}
                    variant="outline"
                    className="border-2 border-neutral-300 dark:border-neutral-700 rounded-2xl px-8 py-6 text-lg text-neutral-900 dark:text-neutral-50 hover:scale-105 transition-all"
                  >
                    Browse Recipes
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </div>
  );
}
