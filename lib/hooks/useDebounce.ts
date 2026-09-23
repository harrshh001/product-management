import { useState, useEffect } from 'react';

/**
 * Hand-crafted debounce hook.
 * Delays updating the debouncedValue until after `delay` milliseconds have elapsed
 * since the last time `value` was changed.
 *
 * @param value The value to debounce (e.g. search query)
 * @param delay Milliseconds to wait (default 400ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timer to update debouncedValue after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel timer if value changes (user is still typing) or component unmounts
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
