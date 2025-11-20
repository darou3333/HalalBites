/**
 * Custom Hooks
 * Reusable logic hooks
 */

import { useState, useCallback, useEffect } from 'react';
import { ApiError } from '../types';

// ============ useFetch Hook ============

interface UseFetchOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseFetchOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(500, String(err));
      setError(apiError);
      options.onError?.(apiError);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, options]);

  const retry = useCallback(() => execute(), [execute]);

  return { data, isLoading, error, execute, retry };
}

// ============ useAsync Hook ============

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  immediate?: boolean;
}

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  options: UseAsyncOptions<T> = { immediate: true }
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(options.immediate ?? true);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await asyncFn();
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(500, String(err));
      setError(apiError);
      options.onError?.(apiError);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, [asyncFn, options]);

  return { data, isLoading, error, execute };
}

// ============ useForm Hook ============

interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  validate?: (values: T) => Record<string, string>;
}

export function useForm<T extends Record<string, any>>(options: UseFormOptions<T>) {
  const [values, setValues] = useState(options.initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
      setValues((prev) => ({ ...prev, [name]: newValue }));
    },
    []
  );

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate
      if (options.validate) {
        const newErrors = options.validate(values);
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;
      }

      try {
        setIsSubmitting(true);
        await options.onSubmit(values);
        options.onSuccess?.();
        setValues(options.initialValues);
        setTouched({});
      } catch (error) {
        options.onError?.(error instanceof Error ? error : new Error('Unknown error'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, options]
  );

  const setFieldValue = useCallback((name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name: string, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const reset = useCallback(() => {
    setValues(options.initialValues);
    setErrors({});
    setTouched({});
  }, [options.initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    reset,
  };
}

// ============ useDebounce Hook ============

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// ============ useLocalStorage Hook ============

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}
