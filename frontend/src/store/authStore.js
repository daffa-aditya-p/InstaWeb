import { create } from "zustand";

import { apiError, authApi, subscriptionApi } from "../services/api";

const storedUser = localStorage.getItem("instaweb_user");
const storedToken = localStorage.getItem("instaweb_token");
const storedSubscription = localStorage.getItem("instaweb_subscription");

const persistSession = (user, token) => {
  localStorage.setItem("instaweb_user", JSON.stringify(user));
  localStorage.setItem("instaweb_token", token);
};

const clearSession = () => {
  localStorage.removeItem("instaweb_user");
  localStorage.removeItem("instaweb_token");
  localStorage.removeItem("instaweb_subscription");
};

export const useAuthStore = create((set, get) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  loading: false,
  subscription: storedSubscription ? JSON.parse(storedSubscription) : null,

  isAuthenticated: () => Boolean(get().token),

  plan: () => {
    const sub = get().subscription;
    if (!sub || sub.status !== "active") return "free";
    return sub.plan || "free";
  },

  login: async (payload) => {
    set({ loading: true });
    try {
      const response = await authApi.login(payload);
      const { token, ...user } = response.data;
      persistSession(user, token);
      set({ user, token, loading: false });
      // Fetch subscription after login
      get().fetchSubscription();
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
    set({ user: null, token: null, subscription: null });
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

  fetchSubscription: async () => {
    try {
      const response = await subscriptionApi.get();
      const subscription = response.data;
      localStorage.setItem("instaweb_subscription", JSON.stringify(subscription));
      set({ subscription });
      return subscription;
    } catch {
      // Silently fail - user just doesn't have a subscription
      set({ subscription: { plan: "free", status: "active" } });
    }
  },
}));

// Auto-fetch subscription on app start if user is logged in
if (storedToken) {
  useAuthStore.getState().fetchSubscription();
}
