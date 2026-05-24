import { create } from 'zustand';

export const usePostStore = create((set) => ({
  posts: [],
  addPost: (post) =>
    set((state) => ({ posts: [post, ...state.posts] })),
  toggleLike: (id) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
            }
          : p,
      ),
    })),
}));
