import { useEffect, useState } from 'react';


const withErrorHandling = <T>(
  fetch: () => Promise<T>
): [T | undefined, boolean, () => void] => {
  const [value, setValue] = useState<T | undefined>(undefined);
  const [error, setError] = useState<boolean>(false);

  const update = () => fetch().then(v => setValue(v)).catch(() => setError(true));

  useEffect(() => {
    void update();
  }, []);

  return [value, error, () => { void update() }];
};


export const withCachedValue = <T>(
  cacheKey: string,
  fetch: () => Promise<T>
): [T | undefined, unknown, () => void] => {
  const [value, valueError, refresh] = withErrorHandling(fetch);
  const [cachedValue, setCachedValue] = useState<T | undefined>(undefined);

  useEffect(() => {
    void (async () => {
      const cacheValue = (await chrome.storage.local.get())[cacheKey];
      setCachedValue(cacheValue);
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ [cacheKey]: value });
  }, [value]);

  return [value ?? cachedValue, valueError, refresh];
}
