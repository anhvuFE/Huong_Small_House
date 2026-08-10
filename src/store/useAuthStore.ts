import { create } from 'zustand';
import type { User } from '../types';
import { disconnectSocket } from '../lib/socket';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setTokens: (tokens: { accessToken: string | null; refreshToken: string | null }) => void;
}

const ACCESS_TOKEN_KEY = 'hs_access_token';
const REFRESH_TOKEN_KEY = 'hs_refresh_token';
const USER_STORAGE_KEY = 'hs_user';
const LEGACY_TOKEN_KEY = 'token';

const isBrowser = typeof window !== 'undefined';

const storage = {
  get: (key: string): string | null => (isBrowser ? window.localStorage.getItem(key) : null),
  set: (key: string, value: string): void => {
    if (isBrowser) {
      window.localStorage.setItem(key, value);
    }
  },
  remove: (key: string): void => {
    if (isBrowser) {
      window.localStorage.removeItem(key);
    }
  },
};

const parseStoredUser = (): User | null => {
  const raw = storage.get(USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      createdAt: parsed.createdAt ? new Date(parsed.createdAt) : new Date(),
      updatedAt: parsed.updatedAt ? new Date(parsed.updatedAt) : new Date(),
      lastLogin: parsed.lastLogin ? new Date(parsed.lastLogin) : undefined,
      addresses: Array.isArray(parsed.addresses)
        ? parsed.addresses.map((address: Record<string, unknown>) => {
            const createdAt = address?.createdAt ? new Date(address.createdAt as string) : new Date();
            const updatedAt = address?.updatedAt ? new Date(address.updatedAt as string) : new Date();
            const normalized = address as unknown as User['addresses'][number];
            return {
              ...normalized,
              createdAt,
              updatedAt,
            };
          })
        : [],
    } as User;
  } catch {
    return null;
  }
};

const persistUser = (user: User | null): void => {
  if (!user) {
    storage.remove(USER_STORAGE_KEY);
    return;
  }
  storage.set(USER_STORAGE_KEY, JSON.stringify(user));
};

const persistTokens = (accessToken: string | null, refreshToken: string | null): void => {
  if (accessToken) {
    storage.set(ACCESS_TOKEN_KEY, accessToken);
  } else {
    storage.remove(ACCESS_TOKEN_KEY);
  }

  if (refreshToken) {
    storage.set(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    storage.remove(REFRESH_TOKEN_KEY);
  }

  storage.remove(LEGACY_TOKEN_KEY);
};

const migrateLegacyToken = (): string | null => {
  const legacyToken = storage.get(LEGACY_TOKEN_KEY);
  if (legacyToken && !storage.get(ACCESS_TOKEN_KEY)) {
    storage.set(ACCESS_TOKEN_KEY, legacyToken);
    storage.remove(LEGACY_TOKEN_KEY);
    return legacyToken;
  }
  return storage.get(ACCESS_TOKEN_KEY);
};

const initialAccessToken = migrateLegacyToken();
const initialRefreshToken = storage.get(REFRESH_TOKEN_KEY);
const initialUser = parseStoredUser();

export const useAuthStore = create<AuthStore>((set) => ({
  user: initialUser,
  accessToken: initialAccessToken,
  refreshToken: initialRefreshToken,
  isAuthenticated: Boolean(initialUser && initialAccessToken),

  login: (user, accessToken, refreshToken) => {
    persistUser(user);
    persistTokens(accessToken, refreshToken);
    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },

  logout: () => {
    persistUser(null);
    persistTokens(null, null);
    // Tear down the socket so it cannot reconnect with the old auth token.
    disconnectSocket();
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  updateUser: (user) => {
    persistUser(user);
    set({ user });
  },

  setTokens: ({ accessToken, refreshToken }) => {
    persistTokens(accessToken, refreshToken);
    set((state) => ({
      accessToken,
      refreshToken,
      isAuthenticated: state.isAuthenticated && Boolean(accessToken),
    }));
  },
}));
