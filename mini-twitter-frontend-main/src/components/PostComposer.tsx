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
      className="rounded-2xl border border-slate-200 bg-white p-4"
      onSubmit={handleSubmit(async (values) => {
        await onSubmitPost(values);
        reset({ title: "", content: "", image: "" });
      })}
    >
      <h2 className="mb-3 text-lg font-bold text-slate-900">Postar</h2>

      <div className="mb-3">
        <input
          {...register("title")}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-sky-500"
          placeholder="Titulo"
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div className="mb-3">
        <textarea
          {...register("content")}
          className="h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-sky-500"
          placeholder="No que voce esta pensando?"
        />
        {errors.content && <p className="mt-1 text-xs text-red-600">{errors.content.message}</p>}
      </div>

      <div className="mb-3">
        <input
          {...register("image")}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-sky-500"
          placeholder="URL da imagem (opcional)"
        />
        {errors.image && <p className="mt-1 text-xs text-red-600">{errors.image.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Publicando..." : "Publicar"}
      </button>
    </form>
  );
};
