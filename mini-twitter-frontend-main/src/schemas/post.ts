import { z } from "zod";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const getDataUrlSizeBytes = (dataUrl: string) => {
  const base64 = dataUrl.split(",")[1] ?? "";
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
};

const isAcceptedImageUrl = (value?: string) => {
  if (!value) return true;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return true;
  }

  if (value.startsWith("data:image/")) {
    return getDataUrlSizeBytes(value) <= MAX_IMAGE_SIZE_BYTES;
  }

  return false;
};

export const postSchema = z.object({
  title: z.string().min(3, "Titulo deve ter pelo menos 3 caracteres"),
  content: z.string().min(1, "Conteudo obrigatorio"),
  image: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => isAcceptedImageUrl(value), "Imagem invalida. Use URL http(s) ou data URL de imagem ate 5MB."),
});

export type PostSchema = z.infer<typeof postSchema>;
