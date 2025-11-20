import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, X, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { recipeService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

// List of haram ingredients
const haramIngredients = ['pork', 'alcohol', 'shellfish', 'lard', 'gelatin'];

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

const quantityUnits = ['kg', 'g', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'packs', 'pieces', 'bunch', 'cloves', 'pinch', 'oz'];

export default function UploadRecipe() {
  const navigate = useNavigate();
  useAuth(); // Ensure user is authenticated
  const [dishName, setDishName] = useState('');
  const [category, setCategory] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', quantity: '', unit: 'kg' }]);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'checking' | 'approved' | 'rejected'>('idle');
  const [rejectedIngredients, setRejectedIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: 'kg' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
    setVerificationStatus('idle');
    setRejectedIngredients([]);
  };

  const updateIngredient = (index: number, field: 'name' | 'quantity' | 'unit', value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
    setVerificationStatus('idle');
    setRejectedIngredients([]);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const verifyIngredients = () => {
    setVerificationStatus('checking');
    
    // Simulate verification process
    setTimeout(() => {
      const foundHaram = ingredients
        .filter(ing => ing.name.trim())
        .filter(ing => 
          haramIngredients.some(haram => 
            ing.name.toLowerCase().includes(haram.toLowerCase())
          )
        )
        .map(ing => ing.name);

      if (foundHaram.length > 0) {
        setRejectedIngredients(foundHaram);
        setVerificationStatus('rejected');
      } else {
        setVerificationStatus('approved');
      }
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Verify ingredients first
    if (verificationStatus !== 'approved') {
      verifyIngredients();
      return;
    }

    // Validate form
    if (!dishName.trim()) {
      setError('Dish name is required');
      return;
    }
    if (!category) {
      setError('Category is required');
      return;
    }
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    if (ingredients.some(ing => !ing.name.trim())) {
      setError('All ingredients must have a name');
      return;
    }
    if (instructions.some(inst => !inst.trim())) {
      setError('All instructions must be filled');
      return;
    }

    setLoading(true);
    try {
      const ingredientsArray = ingredients
        .filter(ing => ing.name.trim())
        .map(ing => ({
          name: ing.name.trim(),
          quantity: ing.quantity?.trim() || '',
          unit: ing.unit || 'kg'
        }));

      await recipeService.create({
        title: dishName,
        description: description,
        category: category,
        ingredients: ingredientsArray,
        instructions: instructions.filter(i => i.trim()).join('\n'),
        image_url: imagePreview || imageUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
        prep_time: parseInt(prepTime) || 0,
        cook_time: parseInt(cookingTime) || 0
      });

      setSuccess('Recipe uploaded successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError('Failed to upload recipe');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black py-12 transition-colors relative overflow-hidden">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-teal-400/15 dark:bg-teal-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-400/15 dark:bg-cyan-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-neutral-900 dark:text-white mb-2 sm:mb-3 tracking-tight">Upload New Recipe</h1>
          <p className="text-base sm:text-lg md:text-xl text-neutral-600 dark:text-neutral-400">
            Share your delicious halal recipe with the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Main Info Card */}
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 md:p-8 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50">
            <h2 className="text-lg sm:text-xl md:text-2xl text-neutral-900 dark:text-white mb-4 sm:mb-6 md:mb-8 tracking-tight">Basic Information</h2>
            
            <div className="space-y-4 sm:space-y-6">
              {/* Dish Name */}
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="dishName" className="text-sm sm:text-base md:text-lg">Dish Name *</Label>
                <Input
                  id="dishName"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="e.g., Chicken Biryani"
                  className="bg-stone-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-xl sm:rounded-2xl h-11 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg"
                  required
                />
              </div>

              {/* Category and Times */}
              <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="category" className="text-sm sm:text-base md:text-lg">Category *</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger id="category" className="bg-stone-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-xl sm:rounded-2xl h-11 sm:h-12 md:h-14 text-neutral-900 dark:text-neutral-50">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                      <SelectItem value="appetizers">Appetizers</SelectItem>
                      <SelectItem value="main-courses">Main Courses</SelectItem>
                      <SelectItem value="side-dishes">Side Dishes</SelectItem>
                      <SelectItem value="salads">Salads</SelectItem>
                      <SelectItem value="soups">Soups</SelectItem>
                      <SelectItem value="rice-dishes">Rice Dishes</SelectItem>
                      <SelectItem value="meat-dishes">Meat Dishes</SelectItem>
                      <SelectItem value="seafood">Seafood</SelectItem>
                      <SelectItem value="vegetable-dishes">Vegetable Dishes</SelectItem>
                      <SelectItem value="breads">Breads & Pastries</SelectItem>
                      <SelectItem value="desserts">Desserts</SelectItem>
                      <SelectItem value="beverages">Beverages</SelectItem>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="kebabs">Kebabs & Grilled</SelectItem>
                      <SelectItem value="curries">Curries & Stews</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="prepTime" className="text-sm sm:text-base md:text-lg">Prep Time (mins) *</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    placeholder="e.g., 30"
                    className="bg-stone-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-xl sm:rounded-2xl h-11 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg"
                    required
                  />
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="cookingTime" className="text-sm sm:text-base md:text-lg">Cooking Time (mins) *</Label>
                  <Input
                    id="cookingTime"
                    type="number"
                    value={cookingTime}
                    onChange={(e) => setCookingTime(e.target.value)}
                    placeholder="e.g., 60"
                    className="bg-stone-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-xl sm:rounded-2xl h-11 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="description" className="text-sm sm:text-base md:text-lg">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your recipe..."
                  rows={3}
                  className="bg-stone-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-xl sm:rounded-2xl text-sm sm:text-base md:text-lg resize-none"
                  required
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="photo" className="text-sm sm:text-base md:text-lg">Recipe Photo *</Label>
                <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-3xl p-12 text-center hover:border-green-500 dark:hover:border-green-400 transition-all bg-stone-50 dark:bg-neutral-800">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-80 mx-auto rounded-2xl object-cover shadow-2xl"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setImagePreview(null)}
                        className="mt-6 border-2 border-neutral-300 dark:border-neutral-700 rounded-2xl px-6 py-5"
                      >
                        Change Photo
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-16 h-16 mx-auto mb-4 text-neutral-400" />
                      <label htmlFor="photo" className="cursor-pointer">
                        <span className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-lg">
                          Click to upload
                        </span>
                        <span className="text-neutral-600 dark:text-neutral-400 text-lg"> or drag and drop</span>
                      </label>
                      <p className="text-neutral-500 dark:text-neutral-500 mt-2">
                        PNG, JPG up to 10MB
                      </p>
                      <input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients Card */}
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 md:p-8 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50">
            <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-lg sm:text-xl md:text-2xl text-neutral-900 dark:text-white tracking-tight">Ingredients</h2>
              <Button type="button" onClick={addIngredient} variant="outline" size="sm" className="border-2 border-neutral-300 dark:border-neutral-700 rounded-xl sm:rounded-2xl px-3 py-4 sm:px-4 sm:py-5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Add Ingredient</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2 sm:gap-3">
                  <div className="flex-1">
                    <Input
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      placeholder={`Ingredient ${index + 1} (e.g., Chicken)`}
                      className="bg-stone-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-xl sm:rounded-2xl h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg"
                      required
                    />
                  </div>
                  <div className="w-24 sm:w-28">
                    <Input
                      value={ingredient.quantity}
                      onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="bg-stone-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-xl sm:rounded-2xl h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg"
                      type="number"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className="w-28 sm:w-32">
                    <Select value={ingredient.unit} onValueChange={(value) => updateIngredient(index, 'unit', value)}>
                      <SelectTrigger className="bg-stone-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-xl sm:rounded-2xl h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-xl sm:rounded-2xl">
                        {quantityUnits.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {ingredients.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                      className="shrink-0 border-2 border-neutral-300 dark:border-neutral-700 rounded-xl sm:rounded-2xl w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-neutral-600 dark:text-neutral-300"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Verification Status */}
            {verificationStatus !== 'idle' && (
              <div className="mt-8">
                {verificationStatus === 'checking' && (
                  <Alert className="border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/20 rounded-2xl backdrop-blur-xl">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-800 dark:text-blue-300 text-lg">
                      Checking ingredients for halal compliance...
                    </AlertDescription>
                  </Alert>
                )}

                {verificationStatus === 'approved' && (
                  <Alert className="border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-900/20 rounded-2xl backdrop-blur-xl">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-300 text-lg">
                      ✓ All ingredients are halal verified! Your recipe is ready to submit.
                    </AlertDescription>
                  </Alert>
                )}

                {verificationStatus === 'rejected' && (
                  <Alert className="border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 rounded-2xl backdrop-blur-xl">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <AlertDescription className="text-red-800 dark:text-red-300 text-lg">
                      <p className="mb-2">
                        <strong>Recipe Declined:</strong> The following ingredients are not halal:
                      </p>
                      <ul className="list-disc list-inside">
                        {rejectedIngredients.map((ing, idx) => (
                          <li key={idx}>{ing}</li>
                        ))}
                      </ul>
                      <p className="mt-2">Please remove these ingredients to continue.</p>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {verificationStatus === 'idle' && (
              <Button
                type="button"
                onClick={verifyIngredients}
                variant="outline"
                className="mt-6 w-full border-2 border-green-600 text-green-600 hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-900/20 rounded-2xl py-5 sm:py-6 text-sm sm:text-base md:text-lg"
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="hidden sm:inline">Verify Ingredients for Halal Compliance</span>
                <span className="sm:hidden">Verify Halal Compliance</span>
              </Button>
            )}
          </div>

          {/* Instructions Card */}
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 md:p-8 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50">
            <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-lg sm:text-xl md:text-2xl text-neutral-900 dark:text-white tracking-tight">Cooking Instructions</h2>
              <Button type="button" onClick={addInstruction} variant="outline" size="sm" className="border-2 border-neutral-300 dark:border-neutral-700 rounded-xl sm:rounded-2xl px-3 py-4 sm:px-4 sm:py-5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Add Step</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2 sm:gap-3">
                  <div className="flex items-center justify-center w-8 h-10 sm:w-10 sm:h-12 md:w-12 md:h-14 shrink-0 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-xl sm:rounded-2xl border border-green-200 dark:border-green-800 text-sm sm:text-base md:text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <Textarea
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      placeholder={`Step ${index + 1}`}
                      rows={3}
                      className="bg-stone-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-xl sm:rounded-2xl text-sm sm:text-base md:text-lg resize-none"
                      required
                    />
                  </div>
                  {instructions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeInstruction(index)}
                      className="shrink-0 border-2 border-neutral-300 dark:border-neutral-700 rounded-xl sm:rounded-2xl w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-neutral-600 dark:text-neutral-300"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-2xl">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
            </div>
          )}

          {/* Image URL (Optional) */}
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 md:p-8 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50">
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="imageUrl" className="text-sm sm:text-base md:text-lg">Image URL (Optional)</Label>
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="bg-stone-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-xl sm:rounded-2xl h-11 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg"
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400">If not provided, a default image will be used</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1 border-2 border-neutral-300 dark:border-neutral-700 rounded-2xl py-5 sm:py-6 text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={verificationStatus !== 'approved' || loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white disabled:cursor-not-allowed shadow-lg hover:shadow-xl rounded-2xl py-5 sm:py-6 text-sm sm:text-base md:text-lg transition-all hover:scale-105"
            >
              {loading ? 'Uploading...' : verificationStatus !== 'approved' ? 'Verify Ingredients First' : 'Submit Recipe'}
            </Button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}