import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { postSchema, type PostSchema } from "../schemas/post";
import type { PostItem, User } from "../types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, Expand } from "lucide-react";

interface PostCardProps {
  post: PostItem;
  currentUser: User | null;
  liked: boolean;
  canInteract: boolean;
  likeLoading?: boolean;
  animationDelayMs?: number;
  onRequireAuth?: () => void;
  onOpenPost?: (postId: number) => void;
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
  animationDelayMs = 0,
  onRequireAuth,
  onOpenPost,
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
    <article
      className="animate-fade-up cursor-pointer border-b border-[var(--tw-border)] px-4 py-4 transition hover:bg-[var(--tw-surface-soft)] md:px-5"
      style={{ animationDelay: `${animationDelayMs}ms` }}
      onClick={() => {
        if (!isEditing) {
          onOpenPost?.(post.id);
        }
      }}
    >
      {isEditing ? (
        <form
          className="space-y-2"
          onSubmit={handleSubmit(async (payload) => {
            await onUpdate(post.id, payload);
            setIsEditing(false);
          })}
        >
          <Input
            {...register("title")}
          />
          {errors.title && <p className="text-xs text-[var(--tw-danger)]">{errors.title.message}</p>}

          <Textarea
            {...register("content")}
            className="h-24"
          />
          {errors.content && <p className="text-xs text-[var(--tw-danger)]">{errors.content.message}</p>}

          <Input
            {...register("image")}
          />
          {errors.image && <p className="text-xs text-[var(--tw-danger)]">{errors.image.message}</p>}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full"
            >
              Salvar
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <>
          <header className="mb-3 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold md:text-lg">{post.title}</h3>
                <Badge variant="secondary" className="text-[11px]">
                  {createdAt}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-[var(--tw-muted)]">por {post.authorName}</p>
            </div>

            {isOwner && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="rounded-full"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(post.id);
                  }}
                >
                  Deletar
                </Button>
              </div>
            )}
          </header>

          <p className="mb-3 text-sm leading-6 text-[var(--tw-text)] md:text-[15px]">{post.content}</p>

          {post.image ? (
            <img src={post.image} alt={post.title} className="mb-3 max-h-72 w-full rounded-2xl object-cover" loading="lazy" />
          ) : null}

          <Button
            variant={liked ? "destructive" : "outline"}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              liked ? "" : "text-[var(--tw-muted)] hover:border-rose-200 hover:text-rose-500"
            } ${likeLoading ? "opacity-70" : ""}`}
            disabled={likeLoading}
            onClick={(event) => {
              event.stopPropagation();

              if (!canInteract) {
                onRequireAuth?.();
                return;
              }

              onToggleLike(post.id, liked);
            }}
          >
            <Heart
              className={`mr-2 h-4 w-4 ${liked ? "animate-heart-pop fill-current" : ""}`}
            />
            {!canInteract ? "Entrar para curtir" : liked ? "Descurtir" : "Curtir"} • {post.likesCount}
          </Button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpenPost?.(post.id);
            }}
            className="ml-2 inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold text-[var(--tw-muted)] transition hover:bg-[var(--tw-surface-soft)]"
          >
            <Expand className="h-3.5 w-3.5" />
            Abrir
          </button>
        </>
      )}
    </article>
  );
};
