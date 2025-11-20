/**
 * Core application types
 */

// ============ Auth Types ============
export interface User {
  id: number;
  email: string;
  username: string;
  role: 'user' | 'admin';
  bio?: string;
  specialty?: string;
  profile_image?: string;
  created_at: string;
}

export interface AuthResponse {
  id: number;
  email: string;
  username: string;
  role: 'user' | 'admin';
  token: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// ============ Recipe Types ============
export interface Recipe {
  id: number;
  title: string;
  description?: string;
  category: string;
  ingredients: string; // JSON string
  instructions: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  image_url?: string;
  user_id: number;
  username: string;
  created_at: string;
  view_count: number;
}

export interface CreateRecipeInput {
  title: string;
  description?: string;
  category: string;
  ingredients: string[];
  instructions: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  image_url?: string;
}

export interface UpdateRecipeInput extends Partial<CreateRecipeInput> {
  id: number;
}

// ============ Comment Types ============
export interface Comment {
  id: number;
  user: string;
  text: string;
  date: string;
  user_id?: number;
  recipe_id?: number;
}

export interface CreateCommentInput {
  text: string;
  recipe_id: number;
}

// ============ API Response Types ============
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// ============ UI State Types ============
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface FormState extends LoadingState {
  isSubmitting: boolean;
}

// ============ Component Props Types ============
export interface PageProps {
  onNavigate?: (page: string, params?: Record<string, any>) => void;
}

export interface RecipeCardProps {
  recipe: Recipe;
  onViewDetails: (id: number) => void;
  showBookmark?: boolean;
  isFavorited?: boolean;
  onFavoriteChange?: (recipeId: number, isFavorited: boolean) => void;
}

export interface FilterOptions {
  searchQuery: string;
  category: string;
  sortBy: 'recent' | 'trending' | 'popular';
  page: number;
  limit: number;
}

// ============ Error Types ============
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends Error {
  constructor(
    public fields: Record<string, string[]>,
    message = 'Validation failed'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
