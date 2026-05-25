import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  isLoggedIn: false,
  user: null,
  hydrating: true,
  login: (user) => set({ isLoggedIn: true, user }),
  logout: () => set({ isLoggedIn: false, user: null }),
  updateUser: (patch) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...patch } : { ...patch },
    })),
  setHydrated: () => set({ hydrating: false }),
}));
