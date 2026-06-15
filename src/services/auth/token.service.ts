import { STORAGE_KEYS } from '@shared/constants/app.constants';

export const tokenService = {
  clear() {
    window.localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    window.sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  },
  getAccessToken() {
    return (
      window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ??
      window.sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    );
  },
  setAccessToken(token: string, rememberMe = false) {
    this.clear();
    const storage = rememberMe ? window.localStorage : window.sessionStorage;
    storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },
  wasRemembered() {
    return Boolean(window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN));
  },
};
