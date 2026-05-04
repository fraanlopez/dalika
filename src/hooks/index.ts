import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export function useRequireAuth() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  return { isAuthenticated, isLoading, user };
}

export function useRole(allowedRoles: string[]) {
  const { user } = useAuthStore();
  const hasAccess = user ? allowedRoles.includes(user.role) : false;
  return { hasAccess, role: user?.role };
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
