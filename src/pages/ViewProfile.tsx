import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Award, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/utilities/ImageWithFallback';
import { userService, recipeService } from '@/services/api';
import { Recipe } from '@/types';

interface UserProfile {
  id: number;
  username: string;
  bio?: string;
  specialty?: string;
  profile_image?: string;
}

type RecipeByUser = Recipe;

export default function ViewProfile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recipes, setRecipes] = useState<RecipeByUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    if (userId) {
      fetchProfileAndRecipes();
    }
  }, [userId]);

  const fetchProfileAndRecipes = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError('');

      // Fetch user profile
      const profileData = await userService.getById(parseInt(userId));
      setProfile(profileData);

      // Fetch user's recipes
      try {
        const recipesData = await recipeService.getByUserId(parseInt(userId));
        setRecipes(recipesData || []);
      } catch (err) {
        console.error('Failed to fetch user recipes:', err);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Profile not found'}</p>
          <Button onClick={() => navigate('/dashboard')} className="bg-green-600 hover:bg-green-700">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black transition-colors relative overflow-hidden">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime-400/15 dark:bg-lime-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-emerald-400/15 dark:bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className={`flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-green-600 dark:hover:text-green-400 mb-8 transition-all group ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
          }`}
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-lg">Back</span>
        </button>

        {/* Profile Header */}
        <div
          className={`bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50 mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Profile Image */}
          <div className="flex justify-center mb-8">
            {profile.profile_image ? (
              <img
                src={profile.profile_image}
                alt={profile.username}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl object-cover shadow-2xl border-4 border-green-600"
              />
            ) : (
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-2xl border-4 border-green-600">
                <User className="w-16 h-16 sm:w-24 sm:h-24 text-white" />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-white mb-3">
              {profile.username}
            </h1>

            {profile.specialty && (
              <div className="flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-300 mb-4">
                <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-lg font-medium">{profile.specialty}</span>
              </div>
            )}

            {profile.bio && (
              <p className="text-neutral-600 dark:text-neutral-400 text-lg leading-relaxed max-w-3xl mx-auto mb-6">
                {profile.bio}
              </p>
            )}

            {/* Recipe Count Badge */}
            <div className="inline-flex items-center gap-2 bg-green-100/80 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-6 py-3 rounded-full border border-green-200/50 dark:border-green-800/50 backdrop-blur-xl">
              <Utensils className="w-5 h-5" />
              <span className="text-lg font-semibold">
                {recipes.length} {recipes.length === 1 ? 'Recipe' : 'Recipes'} Posted
              </span>
            </div>
          </div>
        </div>

        {/* Recipes Section */}
        {recipes.length > 0 ? (
          <div
            className={`transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-2">
              Posted Recipes
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8 text-lg">
              {recipes.length} delicious {recipes.length === 1 ? 'recipe' : 'recipes'} shared by {profile.username}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => navigate(`/recipe/${recipe.id}`)}
                  className="group bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-neutral-200/50 dark:border-neutral-800/50 hover:scale-105 flex flex-col h-full"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <ImageWithFallback
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-4 py-2 bg-green-600/90 backdrop-blur-xl rounded-full text-white font-semibold text-sm shadow-lg">
                      {recipe.view_count} views
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {recipe.title}
                    </h3>
                    <div className="mt-auto">
                      <span className="inline-block px-4 py-2 bg-stone-100 dark:bg-neutral-800 rounded-full capitalize text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {recipe.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <Utensils className="w-20 h-20 text-neutral-300 dark:text-neutral-700 mx-auto mb-6" />
            <p className="text-neutral-600 dark:text-neutral-400 text-xl font-medium mb-2">
              No recipes yet
            </p>
            <p className="text-neutral-500 dark:text-neutral-500">
              {profile.username} hasn't shared any recipes yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
