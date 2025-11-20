import { ArrowUp, Clock, Bookmark } from 'lucide-react';
import { ImageWithFallback } from './utilities/ImageWithFallback';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { favoriteService, upvotesService } from '@/services/api';
import { Recipe } from '@/types';

interface RecipeCardProps {
  recipe: Recipe;
  onViewDetails: (id: number) => void;
  showBookmark?: boolean;
  isFavorited?: boolean;
  onFavoriteChange?: (recipeId: number, isFavorited: boolean) => void;
}

export default function RecipeCard({ recipe, onViewDetails, showBookmark = true, isFavorited = false, onFavoriteChange }: RecipeCardProps) {
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(isFavorited);
  const [upvoteCount, setUpvoteCount] = useState(recipe.view_count || 0);

  useEffect(() => {
    setIsBookmarked(isFavorited);
  }, [isFavorited]);

  useEffect(() => {
    const fetchUpvoteStatus = async () => {
      try {
        const data = await upvotesService.getCount(recipe.id);
        setUpvoteCount(data.upvoteCount || 0);

        if (localStorage.getItem('token')) {
          const upvotedData = await upvotesService.checkUpvoted(recipe.id);
          setIsUpvoted(upvotedData.isUpvoted || false);
        }
      } catch (error) {
        console.error('Failed to fetch upvote status:', error);
      }
    };

    fetchUpvoteStatus();
  }, [recipe.id]);

  const handleUpvote = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to upvote');
      return;
    }

    try {
      if (isUpvoted) {
        const data = await upvotesService.remove(recipe.id);
        setUpvoteCount(data.upvoteCount || 0);
        setIsUpvoted(false);
      } else {
        const data = await upvotesService.add(recipe.id);
        setUpvoteCount(data.upvoteCount || 0);
        setIsUpvoted(true);
      }
    } catch (error) {
      console.error('Failed to update upvote:', error);
    }
  };

  const handleBookmark = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      if (isBookmarked) {
        await favoriteService.remove(recipe.id);
        setIsBookmarked(false);
      } else {
        await favoriteService.add(recipe.id);
        setIsBookmarked(true);
      }
      if (onFavoriteChange) {
        onFavoriteChange(recipe.id, !isBookmarked);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  return (
    <div 
      onClick={() => onViewDetails(recipe.id)}
      className="group bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer border border-neutral-200/50 dark:border-neutral-800/50 hover:scale-[1.03] hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <ImageWithFallback
          src={recipe.image_url || ''}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out"></div>

        {/* Bookmark Button */}
        {showBookmark && (
          <button
            onClick={handleBookmark}
            className="absolute top-2 left-2 sm:top-4 sm:left-4 p-2 sm:p-2.5 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-full hover:bg-white dark:hover:bg-neutral-900 transition-all duration-700 ease-in-out shadow-xl hover:scale-110"
          >
            <Bookmark 
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-700 ease-in-out ${isBookmarked ? 'fill-amber-500 text-amber-500 scale-110' : 'text-neutral-600 dark:text-neutral-300'}`} 
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 md:p-5">
        <div className="mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base md:text-lg text-neutral-900 dark:text-white mb-1 sm:mb-1.5 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-700 ease-in-out line-clamp-1">
            {recipe.title}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            by {recipe.username}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="text-xs sm:text-sm">{recipe.cook_time || 30} min</span>
          </div>
          <div className="px-2 py-1 sm:px-2.5 sm:py-1 text-xs sm:text-sm bg-stone-100 dark:bg-neutral-800 rounded-full capitalize border border-neutral-200 dark:border-neutral-700">
            {recipe.category}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <Button
            onClick={handleUpvote}
            variant={isUpvoted ? "default" : "outline"}
            size="sm"
            className={`h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-lg sm:rounded-xl ${
              isUpvoted 
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30 scale-105' 
                : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-green-500 dark:hover:border-green-400 hover:text-green-600 dark:hover:text-green-400 hover:scale-105'
            }`}
          >
            <ArrowUp className={`w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5 transition-transform duration-700 ease-in-out ${isUpvoted ? 'fill-current rotate-0' : 'group-hover:rotate-12'}`} />
            {upvoteCount}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              onViewDetails(recipe.id);
            }}
            className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg sm:rounded-xl transition-all duration-700 ease-in-out"
          >
            <span className="hidden sm:inline">View Recipe →</span>
            <span className="sm:hidden">View →</span>
          </Button>
        </div>
      </div>
    </div>
  );
}