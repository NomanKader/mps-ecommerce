export const localStorageUtil = {
  get(key: string) {
    return window.localStorage.getItem(key);
  },
  remove(key: string) {
    window.localStorage.removeItem(key);
  },
  set(key: string, value: string) {
    window.localStorage.setItem(key, value);
  },
};
