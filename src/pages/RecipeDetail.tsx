import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUp, User, Calendar, Clock, MessageCircle, Send, Bookmark, Loader, Trash2, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ImageWithFallback } from '@/components/utilities/ImageWithFallback';
import { recipeService, upvotesService, commentService, favoriteService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import ReportModal from '@/components/ReportModal';

interface Recipe {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  category: string;
  ingredients: string;
  instructions: string;
  prep_time?: number;
  cook_time?: number;
  username: string;
  user_id: number;
  created_at: string;
  view_count: number;
}

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const recipeId = id ? parseInt(id) : null;
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Array<{ id: number; user: string; text: string; date: string }>>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isOwnRecipe, setIsOwnRecipe] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const fetchComments = async (id: number) => {
    try {
      const data = await commentService.getAll(id);
      setComments(data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  useEffect(() => {
    if (!recipeId) {
      setLoading(false);
      return;
    }
    
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const data = await recipeService.getById(recipeId);
        setRecipe(data);
        
        // Fetch upvote count from server
        const upvoteData = await upvotesService.getCount(recipeId);
        setUpvoteCount(upvoteData.upvoteCount || 0);
        
        // Check if user has upvoted
        if (user) {
          const upvotedData = await upvotesService.checkUpvoted(recipeId);
          setIsUpvoted(upvotedData.isUpvoted || false);
          
          // Check if user has bookmarked
          try {
            const favorites = await favoriteService.getAll();
            setIsBookmarked(favorites.some((f: any) => f.id === recipeId));
          } catch (err) {
            console.error('Failed to check bookmarks:', err);
          }
        }
        
        setIsOwnRecipe(user?.id === data.user_id);
        await fetchComments(recipeId);
      } catch (err) {
        console.error('Failed to fetch recipe:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-green-600 dark:text-green-400 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400 text-xl">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-black flex items-center justify-center">
        <p className="text-neutral-600 dark:text-neutral-400 text-xl">Recipe not found</p>
      </div>
    );
  }

  const handleUpvote = async () => {
    if (!user?.id) {
      alert('Please login to upvote');
      return;
    }

    if (!recipeId) return;

    try {
      if (isUpvoted) {
        const data = await upvotesService.remove(recipeId);
        setUpvoteCount(data.upvoteCount || 0);
        setIsUpvoted(false);
      } else {
        const data = await upvotesService.add(recipeId);
        setUpvoteCount(data.upvoteCount || 0);
        setIsUpvoted(true);
      }
    } catch (error) {
      console.error('Failed to update upvote:', error);
    }
  };

  const handleBookmark = async () => {
    if (!user?.id || !recipeId) return;

    try {
      if (isBookmarked) {
        await favoriteService.remove(recipeId);
      } else {
        await favoriteService.add(recipeId);
      }
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDeleteRecipe = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return;
    }

    if (!user?.id || !recipeId) return;

    try {
      setDeleting(true);
      await recipeService.delete(recipeId);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      alert('Error deleting recipe');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() && recipeId) {
      try {
        const comment = await commentService.create(recipeId, newComment);
        setComments([comment, ...comments]);
        setNewComment('');
      } catch (error) {
        console.error('Failed to add comment:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black transition-colors relative overflow-hidden">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-400/15 dark:bg-emerald-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-lime-400/15 dark:bg-lime-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className={`flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-green-600 dark:hover:text-green-400 mb-8 transition-all group ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-lg">Back to recipes</span>
        </button>

        {/* Hero Image */}
        <div className={`bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl mb-8 border border-neutral-200/50 dark:border-neutral-800/50 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative aspect-[21/9] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            <ImageWithFallback
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
        </div>

        {/* Recipe Header */}
        <div className={`bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-xl mb-8 border border-neutral-200/50 dark:border-neutral-800/50 transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl text-neutral-900 dark:text-white mb-4 tracking-tight">{recipe.title}</h1>
              <div className="flex flex-wrap items-center gap-5 text-neutral-600 dark:text-neutral-400 text-lg">
                <button
                  onClick={() => navigate(`/profile/${recipe.user_id}`)}
                  className="flex items-center gap-2 hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer"
                >
                  <User className="w-5 h-5" />
                  <span className="hover:underline">{recipe.username || 'Anonymous'}</span>
                </button>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{new Date(recipe.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)} mins</span>
                </div>
                <div className="px-4 py-2 bg-stone-100 dark:bg-neutral-800 rounded-full capitalize border border-neutral-200 dark:border-neutral-700">
                  {recipe.category}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={handleBookmark}
                variant={isBookmarked ? "default" : "outline"}
                size="lg"
                className={`rounded-2xl transition-all duration-200 ${
                  isBookmarked 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/30 scale-105' 
                    : 'border-2 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-50 hover:border-amber-500 dark:hover:border-amber-400 hover:scale-105'
                }`}
              >
                <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>

              <Button
                onClick={handleUpvote}
                variant={isUpvoted ? "default" : "outline"}
                size="lg"
                className={`rounded-2xl transition-all duration-200 ${
                  isUpvoted 
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-500/30 scale-105' 
                    : 'border-2 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-green-500 dark:hover:border-green-400 hover:text-green-600 dark:hover:text-green-400 hover:scale-105'
                }`}
              >
                <ArrowUp className={`w-6 h-6 mr-2 ${isUpvoted ? 'fill-current' : ''}`} />
                <span className="text-xl">{upvoteCount}</span>
              </Button>

              {!isOwnRecipe && (
                <Button
                  onClick={() => setIsReportModalOpen(true)}
                  variant="outline"
                  size="lg"
                  className="rounded-2xl transition-all duration-200 border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500 hover:scale-105"
                >
                  <AlertCircle className="w-6 h-6" />
                </Button>
              )}

              {isOwnRecipe && (
                <Button
                  onClick={handleDeleteRecipe}
                  disabled={deleting}
                  size="lg"
                  className="rounded-2xl transition-all duration-200 bg-red-600 hover:bg-red-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50"
                >
                  <Trash2 className="w-6 h-6" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Ingredients */}
            <div className={`bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h2 className="text-3xl text-neutral-900 dark:text-white mb-8 tracking-tight">Ingredients</h2>
              <ul className="space-y-4">
                {(() => {
                  try {
                    const ingredients = JSON.parse(recipe.ingredients);
                    return ingredients.map((ingredient: any, index: number) => (
                      <li 
                        key={index}
                        className="flex items-start gap-4 text-lg text-neutral-700 dark:text-neutral-300 group"
                      >
                        <div className="w-2.5 h-2.5 bg-green-600 rounded-full mt-2.5 shrink-0 group-hover:scale-150 transition-transform"></div>
                        <span className="capitalize">
                          {typeof ingredient === 'object' ? `${ingredient.name}${ingredient.quantity ? ` - ${ingredient.quantity}` : ''}` : ingredient}
                        </span>
                      </li>
                    ));
                  } catch {
                    return recipe.ingredients.split(',').map((ingredient: string, index: number) => (
                      <li 
                        key={index}
                        className="flex items-start gap-4 text-lg text-neutral-700 dark:text-neutral-300 group"
                      >
                        <div className="w-2.5 h-2.5 bg-green-600 rounded-full mt-2.5 shrink-0 group-hover:scale-150 transition-transform"></div>
                        <span className="capitalize">{ingredient.trim()}</span>
                      </li>
                    ));
                  }
                })()}
              </ul>
            </div>

            {/* Instructions */}
            <div className={`bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h2 className="text-3xl text-neutral-900 dark:text-white mb-8 tracking-tight">Cooking Instructions</h2>
              <div className="space-y-6">
                {recipe.instructions.split('\n').filter((i: string) => i.trim()).map((instruction: string, index: number) => (
                  <div key={index} className="flex gap-5 group">
                    <div className="flex items-center justify-center w-12 h-12 shrink-0 bg-green-600 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform text-xl">
                      {index + 1}
                    </div>
                    <p className="flex-1 text-lg text-neutral-700 dark:text-neutral-300 pt-2 leading-relaxed">
                      {instruction.trim()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className={`bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="flex items-center gap-3 mb-8">
                <MessageCircle className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
                <h2 className="text-3xl text-neutral-900 dark:text-white tracking-tight">
                  Comments ({comments.length})
                </h2>
              </div>

              {/* Add Comment */}
              {user?.id ? (
                <div className="mb-8">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts about this recipe..."
                    rows={4}
                    className="mb-4 bg-stone-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-2xl text-lg resize-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-2xl px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Post Comment
                  </Button>
                </div>
              ) : (
                <div className="mb-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl">
                  <p className="text-lg text-amber-800 dark:text-amber-300">
                    Sign in to leave a comment
                  </p>
                </div>
              )}

              {/* Comments List */}
              {comments.length > 0 ? (
                <div className="space-y-5">
                  {comments.map((comment) => (
                    <div 
                      key={comment.id}
                      className="p-6 bg-stone-50 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-3 gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Profile Image */}
                          {comment.profile_image ? (
                            <img
                              src={comment.profile_image}
                              alt={comment.user}
                              onClick={() => comment.user_id && navigate(`/profile/${comment.user_id}`)}
                              className="w-10 h-10 rounded-full object-cover shrink-0 cursor-pointer hover:opacity-80 transition-opacity shadow-md"
                              title={`View ${comment.user}'s profile`}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center shrink-0 shadow-md">
                              <User className="w-5 h-5 text-white" />
                            </div>
                          )}
                          
                          {/* Username - Clickable */}
                          <button
                            onClick={() => comment.user_id && navigate(`/profile/${comment.user_id}`)}
                            className="text-lg text-neutral-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer font-semibold truncate"
                            title={`View ${comment.user}'s profile`}
                          >
                            {comment.user}
                          </button>
                        </div>
                        <span className="text-neutral-500 dark:text-neutral-400 shrink-0 text-sm">
                          {new Date(comment.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed ml-13">
                        {comment.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-neutral-500 dark:text-neutral-400 py-12 text-lg">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Info */}
            <div className={`bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl sticky top-24 border border-neutral-200/50 dark:border-neutral-800/50 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h3 className="text-2xl text-neutral-900 dark:text-white mb-6 tracking-tight">Quick Info</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-lg text-neutral-700 dark:text-neutral-300">
                  <span>Category:</span>
                  <span className="capitalize">{recipe.category}</span>
                </div>
                <div className="flex justify-between text-lg text-neutral-700 dark:text-neutral-300">
                  <span>Prep Time:</span>
                  <span>{recipe.prep_time} mins</span>
                </div>
                <div className="flex justify-between text-lg text-neutral-700 dark:text-neutral-300">
                  <span>Cook Time:</span>
                  <span>{recipe.cook_time} mins</span>
                </div>
                <div className="flex justify-between text-lg text-neutral-700 dark:text-neutral-300">
                  <span>Views:</span>
                  <span>{recipe.view_count}</span>
                </div>
                <div className="flex justify-between text-lg text-neutral-700 dark:text-neutral-300">
                  <span>Upvotes:</span>
                  <span>{upvoteCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Report Modal */}
      {recipe && (
        <ReportModal
          isOpen={isReportModalOpen}
          recipeId={recipe.id}
          recipeName={recipe.title}
          onClose={() => setIsReportModalOpen(false)}
          onSuccess={() => {
            // Show success toast or notification here
            setIsReportModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
