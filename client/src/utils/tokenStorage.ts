const ACCESS_TOKEN_KEY = 'chat_access_token';
const REFRESH_TOKEN_KEY = 'chat_refresh_token';
const USER_KEY = 'chat_current_user';

export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string): void => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string): void => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getUser: (): any | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (user: any): void => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  isLoggedIn: (): boolean => !!localStorage.getItem(ACCESS_TOKEN_KEY),
};
