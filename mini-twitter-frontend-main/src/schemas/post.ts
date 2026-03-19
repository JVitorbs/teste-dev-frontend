import { z } from "zod";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const isAcceptableImagePayload = (value?: string) => {
  if (!value) return true;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return true;
  }

  if (value.startsWith("data:image/")) {
    const bytes = new Blob([value]).size;
    return bytes <= MAX_IMAGE_SIZE;
  }

  return false;
};

export const postSchema = z.object({
  title: z.string().min(3, "Titulo deve ter pelo menos 3 caracteres"),
  content: z.string().min(1, "Conteudo obrigatorio"),
  image: z.string().optional(),
}).refine((payload) => isAcceptableImagePayload(payload.image), {
  message: "Imagem invalida. Use URL http(s) ou data URL com ate 5MB.",
  path: ["image"],
});

export type PostSchema = z.infer<typeof postSchema>;
