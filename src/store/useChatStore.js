import { create } from 'zustand';

export const useChatStore = create((set) => ({
  activeChatId: null,
  unreadByChat: {},
  banner: null, // { chatId, text, other: { id, full_name, avatar_url } }
  bumpKey: 0,

  setActiveChat: (id) =>
    set((state) => {
      const next = { ...state.unreadByChat };
      if (id) delete next[id];
      return { activeChatId: id, unreadByChat: next };
    }),
  clearActiveChat: () => set({ activeChatId: null }),

  noteInbound: ({ chatId }) =>
    set((state) => {
      if (state.activeChatId === chatId) {
        return { bumpKey: state.bumpKey + 1 };
      }
      return {
        unreadByChat: {
          ...state.unreadByChat,
          [chatId]: (state.unreadByChat[chatId] || 0) + 1,
        },
        bumpKey: state.bumpKey + 1,
      };
    }),

  showBanner: (banner) => set({ banner }),
  clearBanner: () => set({ banner: null }),

  markChatRead: (chatId) =>
    set((state) => {
      const next = { ...state.unreadByChat };
      delete next[chatId];
      return { unreadByChat: next };
    }),

  resetChatState: () =>
    set({
      activeChatId: null,
      unreadByChat: {},
      banner: null,
      bumpKey: 0,
    }),
}));

export const selectTotalUnread = (state) =>
  Object.values(state.unreadByChat).reduce((sum, n) => sum + (n || 0), 0);
