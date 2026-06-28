import { useRef, useCallback } from 'react';

/**
 * Returns a stable `debounce(fn, ms)` function.
 * Cancels any pending invocation each time it's called.
 * Also returns `cancel()` to flush pending invocations early.
 */
export function useDebounce() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debounce = useCallback((fn: () => void, ms: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      fn();
    }, ms);
  }, []);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const isPending = useCallback(() => timerRef.current !== null, []);

  return { debounce, cancel, isPending };
}
