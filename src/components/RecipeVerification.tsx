import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import { Recipe } from '@/types';
import { recipeVerificationService } from '@/services/api';

interface RecipeVerificationProps {
  onRefresh?: () => void;
}

export default function RecipeVerification({ onRefresh }: RecipeVerificationProps) {
  const [pendingRecipes, setPendingRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectionReasons, setRejectionReasons] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchPendingRecipes();
  }, []);

  const fetchPendingRecipes = async () => {
    try {
      setIsLoading(true);
      setError('');
      const recipes = await recipeVerificationService.getPending();
      setPendingRecipes(recipes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending recipes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (recipeId: number) => {
    setProcessingId(recipeId);
    try {
      await recipeVerificationService.verify(recipeId, 'approve');
      setPendingRecipes(prev => prev.filter(r => r.id !== recipeId));
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve recipe');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (recipeId: number) => {
    setProcessingId(recipeId);
    try {
      const reason = rejectionReasons[recipeId] || '';
      await recipeVerificationService.verify(recipeId, 'reject', reason);
      setPendingRecipes(prev => prev.filter(r => r.id !== recipeId));
      setRejectionReasons(prev => {
        const updated = { ...prev };
        delete updated[recipeId];
        return updated;
      });
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject recipe');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recipe Verification Queue</CardTitle>
          <CardDescription>Approve or reject pending recipes</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Recipe Verification Queue
          </CardTitle>
          <CardDescription>
            {pendingRecipes.length} recipe{pendingRecipes.length !== 1 ? 's' : ''} pending verification
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {pendingRecipes.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-neutral-500">
            No pending recipes to verify
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingRecipes.map((recipe) => (
            <Card key={recipe.id} className="overflow-hidden">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Recipe Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold truncate">{recipe.title}</h3>
                        <Badge variant="outline">{recipe.category}</Badge>
                      </div>
                      <p className="text-sm text-neutral-600">By {recipe.username}</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Uploaded: {new Date(recipe.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {recipe.image_url && (
                      <img
                        src={recipe.image_url}
                        alt={recipe.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                  </div>

                  {/* Recipe Details */}
                  <div className="border-t pt-4">
                    {recipe.description && (
                      <div className="mb-3">
                        <p className="text-sm font-medium mb-1">Description</p>
                        <p className="text-sm text-neutral-600">{recipe.description}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Prep Time</p>
                        <p className="text-neutral-600">{recipe.prep_time || '-'} min</p>
                      </div>
                      <div>
                        <p className="font-medium">Cook Time</p>
                        <p className="text-neutral-600">{recipe.cook_time || '-'} min</p>
                      </div>
                      <div>
                        <p className="font-medium">Servings</p>
                        <p className="text-neutral-600">{recipe.servings || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Instructions</p>
                        <p className="text-neutral-600 truncate">{recipe.instructions.substring(0, 30)}...</p>
                      </div>
                    </div>
                  </div>

                  {/* Rejection Reason (if applicable) */}
                  {processingId !== recipe.id && (
                    <div className="border-t pt-4">
                      <label className="text-sm font-medium block mb-2">
                        Rejection reason (if rejecting)
                      </label>
                      <Textarea
                        placeholder="Explain why this recipe is being rejected..."
                        value={rejectionReasons[recipe.id] || ''}
                        onChange={(e) =>
                          setRejectionReasons(prev => ({
                            ...prev,
                            [recipe.id]: e.target.value,
                          }))
                        }
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="border-t pt-4 flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => handleReject(recipe.id)}
                      disabled={processingId === recipe.id}
                      size="sm"
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      {processingId === recipe.id ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </>
                      )}
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => handleApprove(recipe.id)}
                      disabled={processingId === recipe.id}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {processingId === recipe.id ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
