import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { postSchema, type PostSchema } from "../schemas/post";
import type { PostItem, User } from "../types/api";

interface PostCardProps {
  post: PostItem;
  currentUser: User | null;
  liked: boolean;
  onToggleLike: (postId: number, currentLiked: boolean) => void;
  onDelete: (postId: number) => void;
  onUpdate: (postId: number, payload: PostSchema) => Promise<void>;
}

export const PostCard = ({
  post,
  currentUser,
  liked,
  onToggleLike,
  onDelete,
  onUpdate,
}: PostCardProps) => {
  const isOwner = currentUser?.id === post.authorId;
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post.title,
      content: post.content,
      image: post.image ?? "",
    },
  });

  const createdAt = new Date(post.createdAt).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <article className="border-b border-slate-200 p-4 transition hover:bg-slate-50/70">
      {isEditing ? (
        <form
          className="space-y-2"
          onSubmit={handleSubmit(async (payload) => {
            await onUpdate(post.id, payload);
            setIsEditing(false);
          })}
        >
          <input
            {...register("title")}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
          />
          {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}

          <textarea
            {...register("content")}
            className="h-20 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
          />
          {errors.content && <p className="text-xs text-red-600">{errors.content.message}</p>}

          <input
            {...register("image")}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
          />
          {errors.image && <p className="text-xs text-red-600">{errors.image.message}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Salvar
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm"
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <>
          <header className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">{post.title}</h3>
              <p className="text-xs text-slate-500">
                {post.authorName} • {createdAt}
              </p>
            </div>

            {isOwner && (
              <div className="flex gap-2">
                <button
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs"
                  onClick={() => setIsEditing(true)}
                >
                  Editar
                </button>
                <button
                  className="rounded-full border border-red-300 px-3 py-1 text-xs text-red-600"
                  onClick={() => onDelete(post.id)}
                >
                  Deletar
                </button>
              </div>
            )}
          </header>

          <p className="mb-3 text-sm text-slate-700">{post.content}</p>

          {post.image ? (
            <img
              src={post.image}
              alt={post.title}
              className="mb-3 max-h-64 w-full rounded-lg object-cover"
            />
          ) : null}

          <button
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              liked ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-rose-50"
            }`}
            onClick={() => onToggleLike(post.id, liked)}
          >
            {liked ? "Descurtir" : "Curtir"} • {post.likesCount}
          </button>
        </>
      )}
    </article>
  );
};
