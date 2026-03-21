import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(3, "Titulo deve ter pelo menos 3 caracteres"),
  content: z.string().min(1, "Conteudo obrigatorio"),
  image: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => {
      if (!value) return true;
      return value.startsWith("http://") || value.startsWith("https://");
    }, "Imagem invalida. Informe uma URL http(s)."),
});

export type PostSchema = z.infer<typeof postSchema>;
