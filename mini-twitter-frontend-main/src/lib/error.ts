import axios from "axios";

export const getApiError = (error: unknown, fallback = "Erro inesperado") => {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error ?? fallback;
  }

  return fallback;
};
