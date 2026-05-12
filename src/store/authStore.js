import { create } from "zustand";

const USER_STORAGE_KEY = "gnama_user";
const TOKEN_STORAGE_KEY = "gnama_access_token";

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
};

const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
  } catch (_error) {
    return null;
  }
};

const useAuthStore = create((set) => ({
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthReady: false,

  setSession: ({ user, token }) => {
    try {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }

      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch (_error) {}

    set({
      user: user || null,
      token: token || null,
      isAuthReady: true,
    });
  },

  updateUser: (user) => {
    try {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (_error) {}

    set((state) => ({
      ...state,
      user: user || null,
    }));
  },

  setToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch (_error) {}

    set((state) => ({
      ...state,
      token: token || null,
    }));
  },

  setAuthReady: (isAuthReady) => {
    set((state) => ({
      ...state,
      isAuthReady,
    }));
  },

  clearSession: () => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (_error) {}

    set({
      user: null,
      token: null,
      isAuthReady: true,
    });
  },
}));

export default useAuthStore;