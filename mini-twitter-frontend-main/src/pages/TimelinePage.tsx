import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { PostSchema } from "../schemas/post";
import { useAuth } from "../context/AuthContext";
import { getApiError } from "../lib/error";
import type { PostsResponse } from "../types/api";
import { authService } from "../services/auth.service";
import { postService } from "../services/post.service";
import { PostComposer } from "../components/PostComposer";
import { PostCard } from "../components/PostCard";

const queryKey = (page: number, search: string) => ["posts", page, search] as const;

export const TimelinePage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [likedByMe, setLikedByMe] = useState<Record<number, boolean>>({});
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, clearSession } = useAuth();

  const postsQuery = useQuery({
    queryKey: queryKey(page, search),
    queryFn: () => postService.list(page, search),
  });

  const createMutation = useMutation({
    mutationFn: postService.create,
    onSuccess: () => {
      setMessage("Post publicado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => setMessage(getApiError(error, "Erro ao criar post.")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ postId, payload }: { postId: number; payload: PostSchema }) => postService.update(postId, payload),
    onSuccess: () => {
      setMessage("Post atualizado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => setMessage(getApiError(error, "Erro ao atualizar post.")),
  });

  const deleteMutation = useMutation({
    mutationFn: postService.delete,
    onSuccess: () => {
      setMessage("Post deletado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => setMessage(getApiError(error, "Erro ao deletar post.")),
  });

  const likeMutation = useMutation({
    mutationFn: ({ postId }: { postId: number; currentLiked: boolean }) => postService.like(postId),
    onMutate: async ({ postId, currentLiked }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previous = queryClient.getQueryData<PostsResponse>(queryKey(page, search));

      if (previous) {
        queryClient.setQueryData<PostsResponse>(queryKey(page, search), {
          ...previous,
          posts: previous.posts.map((post) => {
            if (post.id !== postId) return post;
            return {
              ...post,
              likesCount: Math.max(0, post.likesCount + (currentLiked ? -1 : 1)),
            };
          }),
        });
      }

      setLikedByMe((state) => ({ ...state, [postId]: !currentLiked }));
      return { previous };
    },
    onSuccess: (response, { postId }) => {
      setLikedByMe((state) => ({ ...state, [postId]: response.liked }));
    },
    onError: (error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey(page, search), context.previous);
      }
      setMessage(getApiError(error, "Erro ao curtir post."));
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clearSession();
      navigate("/auth", { replace: true });
    },
  });

  const totalPages = useMemo(() => {
    if (!postsQuery.data) return 1;
    return Math.max(1, Math.ceil(postsQuery.data.total / postsQuery.data.limit));
  }, [postsQuery.data]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-2 md:px-4">
      <div className="mx-auto grid max-w-4xl grid-cols-1 md:grid-cols-[1fr,2.2fr]">
        <aside className="hidden border-r border-slate-200 px-4 py-6 md:block">
          <p className="text-2xl font-black tracking-tight text-slate-900">Mini Twitter</p>
          <p className="mt-1 text-sm text-slate-500">@{user?.name?.toLowerCase().replace(/\s+/g, "")}</p>
          <button
            onClick={() => logoutMutation.mutate()}
            className="mt-6 w-full rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Sair
          </button>
        </aside>

        <section className="min-h-screen border-x border-slate-200 bg-white">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-slate-900">Pagina inicial</h1>
              <button
                onClick={() => logoutMutation.mutate()}
                className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white md:hidden"
              >
                Sair
              </button>
            </div>
            <div className="mt-3">
              <input
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
                placeholder="Buscar no Mini Twitter"
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition focus:border-sky-500 focus:bg-white"
              />
            </div>
          </header>

          <div className="border-b border-slate-200 p-4">
            <PostComposer
              loading={createMutation.isPending}
              onSubmitPost={async (payload) => {
                await createMutation.mutateAsync(payload);
              }}
            />
          </div>

          {message ? <p className="m-4 rounded-xl bg-slate-100 p-3 text-sm text-slate-700">{message}</p> : null}

          <section>
        {postsQuery.isLoading ? <p>Carregando posts...</p> : null}
        {postsQuery.isError ? <p className="p-4 text-sm text-red-600">{getApiError(postsQuery.error, "Erro ao carregar timeline.")}</p> : null}

        {postsQuery.data?.posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={user}
            liked={likedByMe[post.id] ?? false}
            onToggleLike={(postId, currentLiked) => likeMutation.mutate({ postId, currentLiked })}
            onDelete={(postId) => deleteMutation.mutate(postId)}
            onUpdate={async (postId, payload) => updateMutation.mutateAsync({ postId, payload })}
          />
        ))}
          </section>

          <footer className="flex items-center justify-center gap-3 border-t border-slate-200 p-4">
            <button
              disabled={page <= 1}
              className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium disabled:opacity-50"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Anterior
            </button>
            <span className="text-sm text-slate-700">
              Pagina {page} de {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium disabled:opacity-50"
              onClick={() => setPage((prev) => prev + 1)}
            >
              Proxima
            </button>
          </footer>
        </section>
      </div>
    </main>
  );
};
