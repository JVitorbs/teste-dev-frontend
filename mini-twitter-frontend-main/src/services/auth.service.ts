import { api } from "../lib/api";
import type { LoginPayload, LoginResponse, RegisterPayload } from "../types/api";

export const authService = {
  register: async (payload: RegisterPayload) => {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },

  login: async (payload: LoginPayload) => {
    const { data } = await api.post<LoginResponse>("/auth/login", payload);
    return data;
  },

  logout: async () => {
    const { data } = await api.post("/auth/logout");
    return data;
  },
};
