import { create } from 'zustand';

export const usePostStore = create((set) => ({
  refreshKey: 0,
  bumpRefresh: () => set((s) => ({ refreshKey: s.refreshKey + 1 })),

  // Per-post count overrides so screens (e.g. the detail view) can reflect a
  // fresh comment count back onto the feed without a full reload.
  postStats: {},
  setPostComments: (postId, comments) =>
    set((s) => ({
      postStats: {
        ...s.postStats,
        [postId]: { ...s.postStats[postId], comments },
      },
    })),
}));
