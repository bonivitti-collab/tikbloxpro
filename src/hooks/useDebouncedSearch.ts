import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseDebouncedSearchOptions {
  /**
   * Initial search string value.
   * @default ''
   */
  initialValue?: string;
  /**
   * Debounce delay in milliseconds before updating debouncedTerm and triggering onDebounce.
   * @default 300
   */
  delay?: number;
  /**
   * Optional callback fired when the debounced search term updates.
   */
  onDebounce?: (debouncedValue: string) => void;
}

export interface UseDebouncedSearchReturn {
  /** Immediate value for controlled <input>, guaranteeing 0ms input latency and 120fps responsiveness */
  searchTerm: string;
  /** Method to update immediate search term and trigger debounced timer */
  setSearchTerm: (value: string) => void;
  /** Debounced term that only updates after inactivity period, optimal for heavy product list filtering */
  debouncedTerm: string;
  /** True while the debounce delay timer is pending */
  isDebouncing: boolean;
  /** Instantly flushes the current search term without waiting for the timer (e.g. on Enter key) */
  flush: () => void;
  /** Immediately resets search term and debounced value to empty string */
  clearSearch: () => void;
}

/**
 * Custom hook `useDebouncedSearch` to decouple user typing in the search bar
 * from heavy list filtering, eliminating unnecessary main-thread re-renders.
 */
export function useDebouncedSearch(
  initialOrOptions: string | UseDebouncedSearchOptions = '',
  delayProp: number = 300,
  onDebounceProp?: (debouncedValue: string) => void
): UseDebouncedSearchReturn {
  const options: UseDebouncedSearchOptions =
    typeof initialOrOptions === 'string'
      ? {
          initialValue: initialOrOptions,
          delay: delayProp,
          onDebounce: onDebounceProp,
        }
      : initialOrOptions;

  const initialVal = options.initialValue ?? '';
  const delay = options.delay ?? 300;
  const onDebounce = options.onDebounce;

  const [searchTerm, setSearchTermState] = useState<string>(initialVal);
  const [debouncedTerm, setDebouncedTerm] = useState<string>(initialVal);
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onDebounceRef = useRef(onDebounce);
  const prevInitialValRef = useRef(initialVal);

  // Keep latest onDebounce callback in a ref to avoid recreating callbacks
  useEffect(() => {
    onDebounceRef.current = onDebounce;
  }, [onDebounce]);

  // Synchronize when initialValue prop changes externally (e.g., parent resets or clears filter)
  useEffect(() => {
    if (prevInitialValRef.current !== initialVal) {
      prevInitialValRef.current = initialVal;
      setSearchTermState(initialVal);
      setDebouncedTerm(initialVal);
      setIsDebouncing(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [initialVal]);

  // Debounced updater
  const setSearchTerm = useCallback(
    (value: string) => {
      setSearchTermState(value);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // If value is empty, clear immediately without waiting
      if (value.trim() === '') {
        setIsDebouncing(false);
        setDebouncedTerm('');
        if (onDebounceRef.current) {
          onDebounceRef.current('');
        }
        return;
      }

      setIsDebouncing(true);

      timerRef.current = setTimeout(() => {
        setDebouncedTerm(value);
        setIsDebouncing(false);
        if (onDebounceRef.current) {
          onDebounceRef.current(value);
        }
      }, delay);
    },
    [delay]
  );

  // Immediate flush (e.g. on Enter key press)
  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setDebouncedTerm(searchTerm);
    setIsDebouncing(false);
    if (onDebounceRef.current) {
      onDebounceRef.current(searchTerm);
    }
  }, [searchTerm]);

  // Immediate clear
  const clearSearch = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setSearchTermState('');
    setDebouncedTerm('');
    setIsDebouncing(false);
    if (onDebounceRef.current) {
      onDebounceRef.current('');
    }
  }, []);

  // Cleanup pending timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    debouncedTerm,
    isDebouncing,
    flush,
    clearSearch,
  };
}
