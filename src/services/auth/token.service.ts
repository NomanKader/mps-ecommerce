import { STORAGE_KEYS } from '@shared/constants/app.constants';
import { storageService } from '@services/storage/storage.service';

export const tokenService = {
  clear() {
    storageService.remove(STORAGE_KEYS.ACCESS_TOKEN);
  },
  getAccessToken() {
    return storageService.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
  },
  setAccessToken(token: string) {
    storageService.set(STORAGE_KEYS.ACCESS_TOKEN, token);
  },
};
