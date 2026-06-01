import { STORAGE_KEYS } from '@shared/constants/app.constants';
import { tokenService } from '@services/auth/token.service';

describe('tokenService', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('stores remembered sessions in localStorage', () => {
    tokenService.setAccessToken('remembered-token', true);

    expect(window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBe('remembered-token');
    expect(window.sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
  });

  it('stores non-remembered sessions in sessionStorage', () => {
    tokenService.setAccessToken('session-token');

    expect(window.sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBe('session-token');
    expect(window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
  });

  it('clears tokens from both storage locations', () => {
    window.localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'old-local-token');
    window.sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'old-session-token');

    tokenService.clear();

    expect(tokenService.getAccessToken()).toBeNull();
  });
});
