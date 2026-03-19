import { api } from "../lib/api";
import type { PostPayload, PostsResponse } from "../types/api";

export const postService = {
  list: async (page: number, search: string) => {
    const { data } = await api.get<PostsResponse>("/posts", {
      params: {
        page,
        search: search || undefined,
      },
    });

    return data;
  },

  create: async (payload: PostPayload) => {
    const { data } = await api.post("/posts", payload);
    return data;
  },

  update: async (postId: number, payload: PostPayload) => {
    const { data } = await api.put(`/posts/${postId}`, payload);
    return data;
  },

  delete: async (postId: number) => {
    const { data } = await api.delete(`/posts/${postId}`);
    return data;
  },

  like: async (postId: number) => {
    const { data } = await api.post<{ liked: boolean }>(`/posts/${postId}/like`);
    return data;
  },
};
