import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Loader } from 'lucide-react';
import RecipeCard from '@/components/RecipeCard';
import { recipeService } from '@/services/api';
import { Recipe } from '@/types';

export default function TrendingPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsVisible(true);
    fetchTrendingRecipes();
  }, []);

  const fetchTrendingRecipes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await recipeService.getTrending();
      setRecipes(data || []);
    } catch (err) {
      console.error('Failed to fetch trending recipes:', err);
      setError('Failed to load trending recipes');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const trendingRecipes = recipes;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black transition-colors relative overflow-hidden">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-orange-400/15 dark:bg-orange-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-rose-400/15 dark:bg-rose-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className={`mb-8 sm:mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-950/20 rounded-2xl sm:rounded-3xl border border-orange-200/50 dark:border-orange-800/50 shadow-lg">
              <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-neutral-900 dark:text-white tracking-tight">Trending Dishes</h1>
          </div>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-neutral-600 dark:text-neutral-400">
            The most popular halal recipes based on community upvotes
          </p>
        </div>

        {/* Stats Bar */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12 transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50">
            <p className="text-neutral-600 dark:text-neutral-400 mb-1 sm:mb-2 text-xs sm:text-sm">Total Recipes</p>
            <p className="text-xl sm:text-2xl md:text-3xl text-neutral-900 dark:text-white">{recipes.length}</p>
          </div>
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50">
            <p className="text-neutral-600 dark:text-neutral-400 mb-1 sm:mb-2 text-xs sm:text-sm">Categories</p>
            <p className="text-xl sm:text-2xl md:text-3xl text-neutral-900 dark:text-white">4</p>
          </div>
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50">
            <p className="text-neutral-600 dark:text-neutral-400 mb-1 sm:mb-2 text-xs sm:text-sm">Community Recipes</p>
            <p className="text-xl sm:text-2xl md:text-3xl text-neutral-900 dark:text-white">100+</p>
          </div>
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50">
            <p className="text-neutral-600 dark:text-neutral-400 mb-1 sm:mb-2 text-xs sm:text-sm">Active Users</p>
            <p className="text-xl sm:text-2xl md:text-3xl text-neutral-900 dark:text-white">50+</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader className="w-12 h-12 text-orange-600 dark:text-orange-400 animate-spin" />
            <p className="mt-4 text-neutral-600 dark:text-neutral-400 text-lg">Loading trending recipes...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-24 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl">
            <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error}</p>
          </div>
        )}

        {/* Top Recipe Highlight */}
        {!loading && !error && trendingRecipes.length > 0 && (
          <div className={`bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/30 dark:via-amber-950/20 dark:to-yellow-950/20 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 lg:p-10 mb-8 sm:mb-12 border-2 border-orange-200 dark:border-orange-800/50 shadow-2xl backdrop-blur-xl transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 bg-orange-600 text-white rounded-full flex items-center gap-1.5 sm:gap-2 md:gap-2.5 shadow-xl">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                <span className="text-xs sm:text-sm md:text-base lg:text-lg">#1 Trending</span>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-neutral-900 dark:text-white mb-3 sm:mb-4 tracking-tight">
              {trendingRecipes[0].title}
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-neutral-700 dark:text-neutral-300 mb-4 sm:mb-6 leading-relaxed">
              {trendingRecipes[0].description}
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm md:text-base lg:text-lg text-neutral-600 dark:text-neutral-400">
              <span className="capitalize">{trendingRecipes[0].category}</span>
              <span>•</span>
              <span>{trendingRecipes[0].cook_time} mins</span>
            </div>
          </div>
        )}

        {/* Recipe Grid */}
        {!loading && !error && (
          <>
            {trendingRecipes.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {trendingRecipes.map((recipe, index) => (
                  <div 
                    key={recipe.id} 
                    className={`relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${300 + index * 100}ms` }}
                  >
                    {/* Ranking Badge */}
                    {index < 3 && (
                      <div className="absolute -top-4 -left-4 z-10 w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white dark:border-black">
                        <span className="text-white text-xl">#{index + 1}</span>
                      </div>
                    )}
                    <RecipeCard
                      recipe={recipe}
                      onViewDetails={(id) => navigate(`/recipe/${id}`)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50">
                <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-6">No trending recipes yet</p>
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </div>
  );
}
