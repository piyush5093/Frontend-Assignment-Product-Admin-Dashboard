import { useState, useEffect } from 'react';

/**
 * useDebounce — returns a debounced version of the given value.
 * The debounced value only updates after the specified delay has passed
 * without the input value changing.
 *
 * Used for the search input to avoid firing an API call on every keystroke.
 */
export function useDebounce<T>(value: T, delay: number = 450): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear the timer on every value change — this is the debounce mechanism.
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
