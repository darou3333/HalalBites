/**
 * API Service Layer
 * Centralized API calls with error handling
 */

import { ApiError, AuthResponse, Recipe, Comment, User } from '../types';

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

  async getTrending(limit = 10): Promise<Recipe[]> {
    return apiCall(`/recipes/trending?limit=${limit}`);
  },

  async getById(id: number): Promise<Recipe> {
    return apiCall(`/recipes/${id}`);
  },

  async getByUserId(userId: number): Promise<Recipe[]> {
    return apiCall(`/recipes/user/${userId}`);
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

  async deactivate(id: number): Promise<{ message: string }> {
    return apiCall(`/users/${id}/deactivate`, {
      method: 'PUT',
    });
  },

  async delete(id: number): Promise<{ message: string }> {
    return apiCall(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};
