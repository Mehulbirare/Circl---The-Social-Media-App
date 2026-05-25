import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  isDark: false,
  setDark: (isDark) => set({ isDark }),
  toggle: () => set((state) => ({ isDark: !state.isDark })),
}));
