export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface PostItem {
  id: number;
  title: string;
  content: string;
  image?: string | null;
  authorId: number;
  authorName: string;
  createdAt: string;
  likesCount: number;
}

export interface PostsResponse {
  posts: PostItem[];
  total: number;
  page: number;
  limit: number;
}

export interface PostPayload {
  title: string;
  content: string;
  image?: string;
}

export interface ApiError {
  error: string;
}
