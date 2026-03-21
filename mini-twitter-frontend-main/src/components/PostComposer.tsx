import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ImagePlus } from "lucide-react";
import { postSchema, type PostSchema } from "../schemas/post";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface PostComposerProps {
  onSubmitPost: (payload: PostSchema) => Promise<void>;
  loading: boolean;
}

export const PostComposer = ({ onSubmitPost, loading }: PostComposerProps) => {
  const [showImageField, setShowImageField] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      image: "",
    },
  });

  return (
    <form
      className="surface animate-fade-up rounded-3xl p-4 md:p-5"
      onSubmit={handleSubmit(async (values) => {
        await onSubmitPost(values);
        reset({ title: "", content: "", image: "" });
        setShowImageField(false);
      })}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold">Novo post</h2>
        <Badge variant="secondary" className="text-[var(--tw-brand)]">Agora</Badge>
      </div>

      <div className="mb-3">
        <Input
          {...register("title")}
          placeholder="Titulo do seu post"
        />
        {errors.title && <p className="mt-1 text-xs text-[var(--tw-danger)]">{errors.title.message}</p>}
      </div>

      <div className="mb-3">
        <Textarea
          {...register("content")}
          className="h-28"
          placeholder="Compartilhe uma ideia, dica ou opiniao..."
        />
        {errors.content && <p className="mt-1 text-xs text-[var(--tw-danger)]">{errors.content.message}</p>}
      </div>

      {showImageField || errors.image ? (
        <div className="mb-4">
          <Input
            {...register("image")}
            placeholder="URL da imagem (opcional)"
          />
          {errors.image && <p className="mt-1 text-xs text-[var(--tw-danger)]">{errors.image.message}</p>}
        </div>
      ) : null}

      <div className="mt-2 flex items-end justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full text-[var(--tw-brand)] hover:bg-[var(--tw-surface-soft)]"
          aria-label="Anexar imagem"
          onClick={() => setShowImageField((prev) => !prev)}
        >
          <ImagePlus className="h-6 w-6" />
        </Button>

        <Button
          type="submit"
          disabled={loading}
          className="rounded-2xl"
        >
          {loading ? "Publicando..." : "Postar"}
        </Button>
      </div>
    </form>
  );
};
