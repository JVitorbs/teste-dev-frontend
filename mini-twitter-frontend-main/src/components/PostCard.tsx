import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { postSchema, type PostSchema } from "../schemas/post";
import type { PostItem, User } from "../types/api";

interface PostCardProps {
  post: PostItem;
  currentUser: User | null;
  liked: boolean;
  canInteract: boolean;
  likeLoading?: boolean;
  onRequireAuth?: () => void;
  onToggleLike: (postId: number, currentLiked: boolean) => void;
  onDelete: (postId: number) => void;
  onUpdate: (postId: number, payload: PostSchema) => Promise<void>;
}

export const PostCard = ({
  post,
  currentUser,
  liked,
  canInteract,
  likeLoading = false,
  onRequireAuth,
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
    <article className="animate-fade-up border-b border-[var(--tw-border)] px-4 py-4 transition hover:bg-[var(--tw-surface-soft)] md:px-5">
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
            className="w-full rounded-2xl border border-[var(--tw-border)] bg-[var(--tw-surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--tw-brand)]"
          />
          {errors.title && <p className="text-xs text-[var(--tw-danger)]">{errors.title.message}</p>}

          <textarea
            {...register("content")}
            className="h-24 w-full rounded-2xl border border-[var(--tw-border)] bg-[var(--tw-surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--tw-brand)]"
          />
          {errors.content && <p className="text-xs text-[var(--tw-danger)]">{errors.content.message}</p>}

          <input
            {...register("image")}
            className="w-full rounded-2xl border border-[var(--tw-border)] bg-[var(--tw-surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--tw-brand)]"
          />
          {errors.image && <p className="text-xs text-[var(--tw-danger)]">{errors.image.message}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-[var(--tw-brand)] px-4 py-2 text-sm font-bold text-white"
            >
              Salvar
            </button>
            <button
              type="button"
              className="rounded-full border border-[var(--tw-border)] px-4 py-2 text-sm"
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <>
          <header className="mb-3 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold md:text-lg">{post.title}</h3>
                <span className="rounded-full bg-[var(--tw-surface-soft)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--tw-muted)]">
                  {createdAt}
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--tw-muted)]">por {post.authorName}</p>
            </div>

            {isOwner && (
              <div className="flex gap-2">
                <button
                  className="rounded-full border border-[var(--tw-border)] px-3 py-1 text-xs font-bold"
                  onClick={() => setIsEditing(true)}
                >
                  Editar
                </button>
                <button
                  className="rounded-full border border-red-300 px-3 py-1 text-xs font-bold text-[var(--tw-danger)]"
                  onClick={() => onDelete(post.id)}
                >
                  Deletar
                </button>
              </div>
            )}
          </header>

          <p className="mb-3 text-sm leading-6 text-[var(--tw-text)] md:text-[15px]">{post.content}</p>

          {post.image ? (
            <img src={post.image} alt={post.title} className="mb-3 max-h-72 w-full rounded-2xl object-cover" loading="lazy" />
          ) : null}

          <button
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              liked
                ? "bg-rose-500 text-white"
                : "border border-[var(--tw-border)] bg-[var(--tw-surface)] text-[var(--tw-muted)] hover:border-rose-200 hover:text-rose-500"
            } ${likeLoading ? "opacity-70" : ""}`}
            disabled={likeLoading}
            onClick={() => {
              if (!canInteract) {
                onRequireAuth?.();
                return;
              }

              onToggleLike(post.id, liked);
            }}
          >
            {!canInteract ? "Entrar para curtir" : liked ? "Descurtir" : "Curtir"} • {post.likesCount}
          </button>
        </>
      )}
    </article>
  );
};
