import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.email("Informe um e-mail valido"),
  password: z.string().min(4, "Senha deve ter pelo menos 4 caracteres"),
});

export const loginSchema = z.object({
  email: z.email("Informe um e-mail valido"),
  password: z.string().min(1, "Senha obrigatoria"),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
