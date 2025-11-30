/**
 * API Service Layer
 * Centralized API calls with error handling
 */

import { ApiError, AuthResponse, Recipe, Comment, User, Report, CreateReportInput } from '../types';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

// ============ Request/Response Interceptors ============

interface RequestOptions extends RequestInit {
  skipErrorHandling?: boolean;
}

async function apiCall<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipErrorHandling = false, ...fetchOptions } = options;

  try {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (!skipErrorHandling) {
        throw new ApiError(
          response.status,
          data?.error || data?.message || `HTTP Error ${response.status}`,
          data
        );
      }
      return data;
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError(
      500,
      error instanceof Error ? error.message : 'Network error',
      error
    );
  }
}

// ============ Auth Service ============

export const authService = {
  async register(email: string, username: string, password: string): Promise<AuthResponse> {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
  },

  async login(emailOrUsername: string, password: string): Promise<AuthResponse> {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        [emailOrUsername.includes('@') ? 'email' : 'username']: emailOrUsername,
        password,
      }),
    });
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ============ Recipe Service ============

export const recipeService = {
  async getAll(): Promise<Recipe[]> {
    return apiCall('/recipes');
  },

  async getAllForAdmin(): Promise<Recipe[]> {
    return apiCall('/recipes/admin/all');
  },

  async getTrending(limit = 10): Promise<Recipe[]> {
    return apiCall(`/recipes/trending?limit=${limit}`);
  },

  async getById(id: number): Promise<Recipe> {
    return apiCall(`/recipes/${id}`);
  },

  async getByUserId(userId: number): Promise<Recipe[]> {
    return apiCall(`/recipes/user/${userId}`);
  },

  async getOwnRecipes(): Promise<Recipe[]> {
    return apiCall('/recipes/own');
  },

  async create(recipe: any): Promise<Recipe> {
    return apiCall('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipe),
    });
  },

  async update(id: number, recipe: any): Promise<Recipe> {
    return apiCall(`/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recipe),
    });
  },

  async delete(id: number): Promise<{ message: string }> {
    return apiCall(`/recipes/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleArchive(id: number, isArchive: boolean): Promise<Recipe> {
    return apiCall(`/recipes/${id}/archive`, {
      method: 'PUT',
      body: JSON.stringify({ isArchive }),
    });
  },
};

// ============ Favorites Service ============

export const favoriteService = {
  async getAll(): Promise<Recipe[]> {
    return apiCall('/favorites');
  },

  async add(recipeId: number): Promise<{ message: string }> {
    return apiCall(`/favorites/${recipeId}`, {
      method: 'POST',
    });
  },

  async remove(recipeId: number): Promise<{ message: string }> {
    return apiCall(`/favorites/${recipeId}`, {
      method: 'DELETE',
    });
  },
};

// ============ Upvotes Service ============

export const upvotesService = {
  async getCount(recipeId: number): Promise<{ upvoteCount: number }> {
    return apiCall(`/upvotes/${recipeId}`);
  },

  async checkUpvoted(recipeId: number): Promise<{ isUpvoted: boolean }> {
    return apiCall(`/upvotes/${recipeId}/check`);
  },

  async add(recipeId: number): Promise<{ upvoteCount: number }> {
    return apiCall(`/upvotes/${recipeId}`, {
      method: 'POST',
    });
  },

  async remove(recipeId: number): Promise<{ upvoteCount: number }> {
    return apiCall(`/upvotes/${recipeId}`, {
      method: 'DELETE',
    });
  },
};

// ============ Comments Service ============

export const commentService = {
  async getAll(recipeId: number): Promise<Comment[]> {
    return apiCall(`/comments/${recipeId}`);
  },

  async create(recipeId: number, text: string): Promise<Comment> {
    return apiCall(`/comments/${recipeId}`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  async delete(commentId: number): Promise<{ message: string }> {
    return apiCall(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  },
};

// ============ Users Service ============

export const userService = {
  async getAll(): Promise<User[]> {
    return apiCall('/users');
  },

  async getById(id: number): Promise<User> {
    return apiCall(`/users/${id}`);
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiCall('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deactivate(id: number): Promise<{ message: string; data?: any }> {
    return apiCall(`/users/${id}/deactivate`, {
      method: 'PUT',
    });
  },

  async reactivate(id: number): Promise<{ message: string; data?: any }> {
    return apiCall(`/users/${id}/reactivate`, {
      method: 'PUT',
    });
  },

  async delete(id: number): Promise<{ message: string }> {
    return apiCall(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============ Reports Service ============

export const reportService = {
  async create(recipeId: number, data: CreateReportInput): Promise<Report> {
    return apiCall(`/reports/${recipeId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAll(status?: string, recipeId?: number): Promise<Report[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (recipeId) params.append('recipeId', recipeId.toString());
    return apiCall(`/reports?${params.toString()}`);
  },

  async getByRecipeId(recipeId: number): Promise<Report[]> {
    return apiCall(`/reports/recipe/${recipeId}`);
  },

  async updateStatus(reportId: number, status: string, adminNotes?: string): Promise<Report> {
    return apiCall(`/reports/${reportId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes }),
    });
  },

  async delete(reportId: number): Promise<{ message: string }> {
    return apiCall(`/reports/${reportId}`, {
      method: 'DELETE',
    });
  },
};

// ============ Haram Ingredients Service ============

export const haramIngredientsService = {
  async getAll(): Promise<{ id: number; ingredient_name: string; reason?: string }[]> {
    return apiCall('/haram-ingredients');
  },

  async add(ingredient_name: string, reason?: string): Promise<{ id: number; ingredient_name: string; reason?: string }> {
    return apiCall('/haram-ingredients', {
      method: 'POST',
      body: JSON.stringify({ ingredient_name, reason }),
    });
  },

  async delete(id: number): Promise<{ message: string }> {
    return apiCall(`/haram-ingredients/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============ Recipe Verification Service ============

export const recipeVerificationService = {
  async getPending(): Promise<Recipe[]> {
    return apiCall('/recipes/admin/pending');
  },

  async verify(recipeId: number, action: 'approve' | 'reject', reason?: string): Promise<Recipe> {
    return apiCall(`/recipes/${recipeId}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ action, reason }),
    });
  },
};

// ============ Stats Service ============

export const statsService = {
  async getStats(): Promise<{
    totalRecipes: number;
    totalCategories: number;
    communityRecipes: number;
    activeUsers: number;
  }> {
    return apiCall('/stats');
  },
};
