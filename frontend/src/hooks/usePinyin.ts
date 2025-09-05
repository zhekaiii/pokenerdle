import { useEffect, useState } from "react";

type PinyinModule = typeof import("pinyin").default;

interface UsePinyinResult {
  pinyin: PinyinModule | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook for lazy loading the pinyin library
 * Only loads when Chinese language support is needed
 */
export const usePinyin = (needsPinyin: boolean): UsePinyinResult => {
  const [pinyin, setPinyin] = useState<PinyinModule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Only load pinyin if needed and not already loaded/loading
    if (needsPinyin && !pinyin && !isLoading) {
      setIsLoading(true);
      setError(null);

      import("pinyin")
        .then((module) => {
          setPinyin(() => module.default);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load pinyin library:", err);
          setError(err);
          setIsLoading(false);
        });
    }
  }, [needsPinyin, pinyin, isLoading]);

  return {
    pinyin,
    isLoading,
    error,
  };
};
