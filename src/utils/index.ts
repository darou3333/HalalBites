/**
 * Utility Functions
 */

// ============ Validation Utils ============

export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  username: (username: string): boolean => {
    return username.length >= 3 && username.length <= 30 && /^[a-zA-Z0-9_-]+$/.test(username);
  },

  password: (password: string): boolean => {
    return password.length >= 8;
  },

  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};

export interface ValidationErrors {
  [field: string]: string | undefined;
}

export const validateRegisterForm = (data: {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!data.email || !validators.email(data.email)) {
    errors.email = 'Invalid email address';
  }

  if (!data.username || !validators.username(data.username)) {
    errors.username = 'Username must be 3-30 characters and contain only letters, numbers, hyphens, or underscores';
  }

  if (!data.password || !validators.password(data.password)) {
    errors.password = 'Password must be at least 8 characters';
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

export const validateLoginForm = (data: {
  emailOrUsername: string;
  password: string;
}): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!data.emailOrUsername) {
    errors.emailOrUsername = 'Email or username is required';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  }

  return errors;
};

export const validateRecipeForm = (data: {
  title: string;
  category: string;
  ingredients: string[];
  instructions: string;
}): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Recipe title is required';
  }

  if (!data.category) {
    errors.category = 'Category is required';
  }

  if (!data.ingredients || data.ingredients.length === 0) {
    errors.ingredients = 'At least one ingredient is required';
  }

  if (!data.instructions || data.instructions.trim().length === 0) {
    errors.instructions = 'Instructions are required';
  }

  return errors;
};

// ============ Format Utils ============

export const format = {
  date: (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
    return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
  },

  time: (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  },

  number: (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  },
};

// ============ Error Utils ============

export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'An unexpected error occurred';
};

// ============ Local Storage Utils ============

export const storage = {
  get: <T = any>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  },
};

// ============ Array Utils ============

export const array = {
  chunk: <T,>(arr: T[], size: number): T[][] => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );
  },

  unique: <T,>(arr: T[]): T[] => {
    return Array.from(new Set(arr));
  },

  flatten: <T,>(arr: (T | T[])[]): T[] => {
    return arr.reduce<T[]>((acc, val) => {
      if (Array.isArray(val)) return acc.concat(val as T[]);
      return acc.concat(val as T);
    }, []);
  },
};

// ============ String Utils ============

export const string = {
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  truncate: (str: string, length: number): string => {
    return str.length > length ? str.slice(0, length) + '...' : str;
  },

  slug: (str: string): string => {
    return str
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/-+/g, '-')
      .trim();
  },
};

// ============ Cookie Utils ============

export const cookie = {
  set: (name: string, value: string, days: number = 7): void => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  },

  get: (name: string): string | null => {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length);
      }
    }
    return null;
  },

  delete: (name: string): void => {
    cookie.set(name, '', -1);
  },
};
