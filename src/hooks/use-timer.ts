import { useCallback, useRef } from 'react';

type MaybePromise<T> = T | Promise<T>;

export function useTimer() {
  const timer = useRef<NodeJS.Timeout>();

  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const resetTimer = useCallback(
    (autoCloseMS: number, callback: () => MaybePromise<void>) => {
      clearTimer();
      timer.current = setTimeout(callback, autoCloseMS);
    },
    [clearTimer]
  );

  return { resetTimer, clearTimer };
}
