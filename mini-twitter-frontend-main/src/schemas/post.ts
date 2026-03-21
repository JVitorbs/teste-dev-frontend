import { z } from "zod";

const isAcceptedImageUrl = (value?: string) => {
  if (!value) return true;

  return value.startsWith("http://") || value.startsWith("https://");
};

export const postSchema = z.object({
  title: z.string().min(3, "Titulo deve ter pelo menos 3 caracteres"),
  content: z.string().min(1, "Conteudo obrigatorio"),
  image: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => isAcceptedImageUrl(value), "Imagem invalida. Use apenas URL iniciando com http:// ou https://."),
});

export type PostSchema = z.infer<typeof postSchema>;
