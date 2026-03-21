import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { postSchema, type PostSchema } from "../schemas/post";

interface PostComposerProps {
  onSubmitPost: (payload: PostSchema) => Promise<void>;
  loading: boolean;
}

export const PostComposer = ({ onSubmitPost, loading }: PostComposerProps) => {
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
      })}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold">Novo post</h2>
        <span className="rounded-full bg-[var(--tw-surface-soft)] px-3 py-1 text-xs font-bold text-[var(--tw-brand)]">Agora</span>
      </div>

      <div className="mb-3">
        <input
          {...register("title")}
          className="w-full rounded-2xl border border-[var(--tw-border)] bg-[var(--tw-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--tw-brand)]"
          placeholder="Titulo do seu post"
        />
        {errors.title && <p className="mt-1 text-xs text-[var(--tw-danger)]">{errors.title.message}</p>}
      </div>

      <div className="mb-3">
        <textarea
          {...register("content")}
          className="h-28 w-full rounded-2xl border border-[var(--tw-border)] bg-[var(--tw-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--tw-brand)]"
          placeholder="Compartilhe uma ideia, dica ou opiniao..."
        />
        {errors.content && <p className="mt-1 text-xs text-[var(--tw-danger)]">{errors.content.message}</p>}
      </div>

      <div className="mb-4">
        <input
          {...register("image")}
          className="w-full rounded-2xl border border-[var(--tw-border)] bg-[var(--tw-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--tw-brand)]"
          placeholder="URL da imagem (opcional)"
        />
        {errors.image && <p className="mt-1 text-xs text-[var(--tw-danger)]">{errors.image.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-[var(--tw-brand)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--tw-brand-strong)] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
      >
        {loading ? "Publicando..." : "Publicar no feed"}
      </button>
    </form>
  );
};
