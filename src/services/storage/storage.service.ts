export const storageService = {
  get<T>(key: string): T | null {
    const value = window.localStorage.getItem(key);

    return value ? (JSON.parse(value) as T) : null;
  },
  remove(key: string) {
    window.localStorage.removeItem(key);
  },
  set(key: string, value: unknown) {
    window.localStorage.setItem(key, JSON.stringify(value));
  },
};
