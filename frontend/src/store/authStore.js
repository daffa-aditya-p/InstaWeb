import { create } from "zustand";

import { apiError, authApi } from "../services/api";

const storedUser = localStorage.getItem("instaweb_user");
const storedToken = localStorage.getItem("instaweb_token");

const persistSession = (user, token) => {
  localStorage.setItem("instaweb_user", JSON.stringify(user));
  localStorage.setItem("instaweb_token", token);
};

const clearSession = () => {
  localStorage.removeItem("instaweb_user");
  localStorage.removeItem("instaweb_token");
};

export const useAuthStore = create((set, get) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  loading: false,

  isAuthenticated: () => Boolean(get().token),

  login: async (payload) => {
    set({ loading: true });
    try {
      const response = await authApi.login(payload);
      const { token, ...user } = response.data;
      persistSession(user, token);
      set({ user, token, loading: false });
      return response;
    } catch (error) {
      set({ loading: false });
      throw apiError(error);
    }
  },

  register: async (payload) => {
    set({ loading: true });
    try {
      const response = await authApi.register(payload);
      const { token, ...user } = response.data;
      persistSession(user, token);
      set({ user, token, loading: false });
      return response;
    } catch (error) {
      set({ loading: false });
      throw apiError(error);
    }
  },

  logout: async () => {
    try {
      if (get().token) {
        await authApi.logout();
      }
    } catch {
      // The client session is still cleared if the server token is already invalid.
    }
    clearSession();
    set({ user: null, token: null });
  },

  refreshProfile: async () => {
    try {
      const response = await authApi.me();
      const user = response.data;
      localStorage.setItem("instaweb_user", JSON.stringify(user));
      set({ user });
      return user;
    } catch (error) {
      throw apiError(error);
    }
  },

  updateProfile: async (payload) => {
    try {
      const response = await authApi.updateProfile(payload);
      const user = response.data;
      localStorage.setItem("instaweb_user", JSON.stringify(user));
      set({ user });
      return response;
    } catch (error) {
      throw apiError(error);
    }
  },
}));

