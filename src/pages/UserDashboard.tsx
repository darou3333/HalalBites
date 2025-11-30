import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Loader, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import RecipeCard from '@/components/RecipeCard';
import { recipeService, favoriteService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Recipe } from '@/types';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isVisible, setIsVisible] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setIsVisible(true);
    // CRITICAL: Clear old favorites FIRST before loading new user's favorites
    setFavoriteIds(new Set());
    
    fetchRecipes();
    if (user?.id) {
      fetchFavorites();
      fetchUserRecipes();
    }
  }, [user?.id]);

  const fetchFavorites = async () => {
    try {
      const favorites = await favoriteService.getAll();
      // Clear old favorites and set new ones
      const newFavoriteIds = new Set(favorites.map((f: any) => f.id));
      setFavoriteIds(newFavoriteIds);
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
      // Clear favorites on error
      setFavoriteIds(new Set());
    }
  };

  const fetchUserRecipes = async () => {
    try {
      const data = await recipeService.getOwnRecipes();
      setUserRecipes(data || []);
    } catch (err) {
      console.error('Failed to fetch user recipes:', err);
    }
  };

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await recipeService.getAll();
      setRecipes(data || []);
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
      setError('Failed to load recipes');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = 
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (recipe.ingredients && recipe.ingredients.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black transition-colors relative overflow-hidden">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/3 w-96 h-96 bg-blue-400/15 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/3 w-96 h-96 bg-purple-400/15 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className={`mb-8 md:mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-neutral-900 dark:text-white mb-2 md:mb-3 tracking-tight">
            Discover Halal Recipes
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-neutral-600 dark:text-neutral-400">
            Browse, search, and upvote delicious halal recipes from our community
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className={`bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50 mb-8 md:mb-12 transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            {/* Search */}
            <div className="flex-1 relative group">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-neutral-400 group-focus-within:text-green-600 dark:group-focus-within:text-green-400 transition-colors duration-500 ease-out" />
              <Input
                type="text"
                placeholder="Search recipes or ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 md:pl-12 bg-stone-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-xl md:rounded-2xl h-12 md:h-14 text-base md:text-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-all duration-500 ease-out"
              />
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-56">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-stone-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-xl md:rounded-2xl h-12 md:h-14">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <SelectValue placeholder="Filter by category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="chicken">Chicken</SelectItem>
                  <SelectItem value="beef">Beef</SelectItem>
                  <SelectItem value="goat">Goat/Lamb</SelectItem>
                  <SelectItem value="seafood">Seafood</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap gap-2 mt-4 md:mt-6 pt-4 md:pt-6 border-t border-neutral-200 dark:border-neutral-800">
            <span className="text-neutral-600 dark:text-neutral-400 py-2 text-xs sm:text-sm md:text-base">Quick filters:</span>
            {['chicken', 'beef', 'goat', 'seafood'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 sm:px-4 md:px-5 py-1 sm:py-1.5 md:py-2 rounded-full capitalize text-xs sm:text-sm md:text-base transition-all duration-500 ease-out ${
                  selectedCategory === category
                    ? 'bg-green-600 text-white shadow-lg shadow-green-500/30 scale-105'
                    : 'bg-stone-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-stone-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700'
                }`}
              >
                {category}
              </button>
            ))}
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="px-3 sm:px-4 md:px-5 py-1 sm:py-1.5 md:py-2 rounded-full bg-stone-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-stone-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-all duration-500 ease-out text-xs sm:text-sm md:text-base"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Guest Notice */}
        {!user && (
          <div className={`bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-8 sm:mb-12 backdrop-blur-xl transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h3 className="text-lg sm:text-xl md:text-2xl text-amber-900 dark:text-amber-200 mb-2 sm:mb-3">
              Browsing as Guest
            </h3>
            <p className="text-amber-800 dark:text-amber-300 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">
              You're currently browsing as a guest. Sign up to upload your own recipes, save favorites, and join the community!
            </p>
            <Button 
              onClick={() => navigate('/signup')}
              className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl transition-all rounded-xl sm:rounded-2xl px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base"
            >
              Sign Up Now
            </Button>
          </div>
        )}

        {/* My Recipes Section (if user is logged in) */}
        {user && userRecipes.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-neutral-900 dark:text-white tracking-tight mb-2">
                My Recipes
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">Recipes you've uploaded</p>
            </div>

            <div className="space-y-4">
              {userRecipes.map((recipe) => {
                const isVerified = recipe.is_verified === 1;
                return (
                  <div 
                    key={recipe.id} 
                    className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl p-4 border border-neutral-200/50 dark:border-neutral-800/50 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-neutral-900 dark:text-white">{recipe.title}</h3>
                          {!isVerified && (
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full font-medium">
                              Pending Verification
                            </span>
                          )}
                          {isVerified && (
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full font-medium">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{recipe.category}</p>
                      </div>
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/recipe/${recipe.id}`)}
                        disabled={!isVerified}
                        className="h-8 px-3 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-700 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        View Recipe →
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recipe Grid */}
        <div className="mb-6">
          {error && (
            <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
              <p className="text-red-800 dark:text-red-200">{error}</p>
              <Button 
                onClick={fetchRecipes}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white"
              >
                Try Again
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader className="w-12 h-12 text-green-600 dark:text-green-400 animate-spin" />
              <p className="mt-4 text-neutral-600 dark:text-neutral-400 text-lg">Loading recipes...</p>
            </div>
          ) : filteredRecipes.length > 0 ? (
            <>
              <div className={`flex items-center justify-between mb-6 sm:mb-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-neutral-900 dark:text-white tracking-tight">
                  {selectedCategory === 'all' ? 'All Recipes' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Recipes`}
                </h2>
                <span className="text-xs sm:text-sm md:text-base text-neutral-600 dark:text-neutral-400 bg-stone-100 dark:bg-neutral-900 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full border border-neutral-200 dark:border-neutral-800">
                  {filteredRecipes.length} recipes
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {filteredRecipes.map((recipe, index) => (
                  <div 
                    key={`${user?.id}-${recipe.id}`}
                    className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${400 + index * 100}ms` }}
                  >
                    <RecipeCard
                      recipe={recipe}
                      onViewDetails={(id) => navigate(`/recipe/${id}`)}
                      showBookmark={!!user}
                      isFavorited={favoriteIds.has(recipe.id)}
                      onFavoriteChange={(recipeId, isFavorited) => {
                        const newFavorites = new Set(favoriteIds);
                        if (isFavorited) {
                          newFavorites.add(recipeId);
                        } else {
                          newFavorites.delete(recipeId);
                        }
                        setFavoriteIds(newFavorites);
                      }}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : !loading ? (
            <div className="text-center py-24 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50">
              <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-6">
                {recipes.length === 0 ? 'No recipes yet. Be the first to upload one!' : 'No recipes found matching your criteria'}
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                variant="outline"
                className="border-neutral-300 dark:border-neutral-700 rounded-2xl px-8 py-6"
              >
                Clear Filters
              </Button>
            </div>
          ) : null}
        </div>
      </div>
      </div>
    </div>
  );
}