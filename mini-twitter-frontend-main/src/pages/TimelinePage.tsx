import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import type { PostSchema } from "../schemas/post";
import type { PostsResponse } from "../types/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getApiError } from "../lib/error";
import { authService } from "../services/auth.service";
import { postService } from "../services/post.service";
import { PostComposer } from "../components/PostComposer";
import { PostCard } from "../components/PostCard";

const queryKey = (search: string) => ["posts", search] as const;

export const TimelinePage = () => {
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [likedByMe, setLikedByMe] = useState<Record<number, boolean>>({});
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, isAuthenticated, clearSession } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const postsQuery = useInfiniteQuery({
    queryKey: queryKey(search),
    queryFn: ({ pageParam = 1 }) => postService.list(pageParam, search),
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      const currentPage = allPages.length;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
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
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setMessage("Voce nao pode editar este post.");
        return;
      }

      setMessage(getApiError(error, "Erro ao atualizar post."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: postService.delete,
    onSuccess: () => {
      setMessage("Post deletado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setMessage("Voce nao pode deletar este post.");
        return;
      }

      setMessage(getApiError(error, "Erro ao deletar post."));
    },
  });

  const likeMutation = useMutation({
    mutationFn: ({ postId }: { postId: number; currentLiked: boolean }) => postService.like(postId),
    onMutate: async ({ postId, currentLiked }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previous = queryClient.getQueryData<{ pages: PostsResponse[]; pageParams: number[] }>(queryKey(search));

      if (previous) {
        queryClient.setQueryData(queryKey(search), {
          ...previous,
          pages: previous.pages.map((page) => ({
            ...page,
            posts: page.posts.map((post) => {
              if (post.id !== postId) return post;
              return {
                ...post,
                likesCount: Math.max(0, post.likesCount + (currentLiked ? -1 : 1)),
              };
            }),
          })),
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
        queryClient.setQueryData(queryKey(search), context.previous);
      }
      setMessage(getApiError(error, "Erro ao curtir post."));
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      clearSession();
      navigate("/auth", { replace: true });
    },
    onError: (error) => {
      setMessage(getApiError(error, "Nao foi possivel sair agora."));
    },
  });

  const allPosts = useMemo(() => postsQuery.data?.pages.flatMap((page) => page.posts) ?? [], [postsQuery.data]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !postsQuery.hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !postsQuery.isFetchingNextPage) {
          postsQuery.fetchNextPage();
        }
      },
      { rootMargin: "220px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [postsQuery.hasNextPage, postsQuery.isFetchingNextPage, postsQuery.fetchNextPage]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-2 py-2 md:px-4 md:py-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[260px,1fr,280px]">
        <aside className="surface sticky top-4 hidden h-[calc(100vh-2rem)] rounded-3xl p-5 md:block">
          <p className="text-2xl font-extrabold">Mini Twitter</p>
          <p className="mt-1 text-sm text-[var(--tw-muted)]">{user ? `@${user.name.toLowerCase().replace(/\s+/g, "")}` : "Comunidade aberta"}</p>

          <div className="mt-6 space-y-2">
            <button
              onClick={() => navigate("/")}
              className="w-full rounded-2xl bg-[var(--tw-surface-soft)] px-4 py-2 text-left text-sm font-bold"
            >
              Home
            </button>
            <button
              onClick={() => setSearch("")}
              className="w-full rounded-2xl border border-[var(--tw-border)] px-4 py-2 text-left text-sm font-bold"
            >
              Limpar busca
            </button>
          </div>

          <div className="mt-auto pt-8">
            {isAuthenticated ? (
              <button
                onClick={() => logoutMutation.mutate()}
                className="w-full rounded-2xl border border-[var(--tw-border)] px-4 py-2 text-sm font-bold"
              >
                {logoutMutation.isPending ? "Saindo..." : "Sair"}
              </button>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="w-full rounded-2xl bg-[var(--tw-brand)] px-4 py-2 text-sm font-bold text-white"
              >
                Entrar
              </button>
            )}
          </div>
        </aside>

        <section className="surface twitter-scroll min-h-screen overflow-hidden rounded-3xl">
          <header className="surface-soft sticky top-0 z-10 border-x-0 border-t-0 px-4 py-3 backdrop-blur md:px-5">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-xl font-extrabold">Timeline</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="rounded-full border border-[var(--tw-border)] bg-[var(--tw-surface)] px-3 py-1 text-xs font-bold"
                >
                  {theme === "light" ? "Escuro" : "Claro"}
                </button>
                {!isAuthenticated ? (
                  <button
                    onClick={() => navigate("/auth")}
                    className="rounded-full bg-[var(--tw-brand)] px-3 py-1 text-xs font-bold text-white"
                  >
                    Entrar
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-3">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por titulo ou tema"
                className="w-full rounded-2xl border border-[var(--tw-border)] bg-[var(--tw-surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--tw-brand)]"
              />
            </div>
          </header>

          {isAuthenticated ? (
            <div className="p-4 md:p-5">
              <PostComposer
                loading={createMutation.isPending}
                onSubmitPost={async (payload) => {
                  await createMutation.mutateAsync(payload);
                }}
              />
            </div>
          ) : (
            <div className="border-b border-[var(--tw-border)] p-4 text-sm text-[var(--tw-muted)] md:p-5">
              Entre na sua conta para publicar, editar, deletar e curtir posts.
            </div>
          )}

          {message ? (
            <p className="mx-4 my-3 rounded-2xl border border-[var(--tw-border)] bg-[var(--tw-surface-soft)] p-3 text-sm md:mx-5">
              {message}
            </p>
          ) : null}

          <section>
            {postsQuery.isLoading ? <p className="p-5 text-sm text-[var(--tw-muted)]">Carregando posts...</p> : null}
            {postsQuery.isError ? <p className="p-5 text-sm text-[var(--tw-danger)]">{getApiError(postsQuery.error, "Erro ao carregar timeline.")}</p> : null}

            {allPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={user}
                canInteract={isAuthenticated}
                likeLoading={likeMutation.isPending && likeMutation.variables?.postId === post.id}
                liked={likedByMe[post.id] ?? false}
                onRequireAuth={() => navigate("/auth")}
                onToggleLike={(postId, currentLiked) => likeMutation.mutate({ postId, currentLiked })}
                onDelete={(postId) => deleteMutation.mutate(postId)}
                onUpdate={async (postId, payload) => updateMutation.mutateAsync({ postId, payload })}
              />
            ))}

            <div ref={sentinelRef} className="h-12" />

            {postsQuery.isFetchingNextPage ? (
              <p className="p-4 text-center text-sm text-[var(--tw-muted)]">Carregando mais posts...</p>
            ) : null}
          </section>
        </section>

        <aside className="surface sticky top-4 hidden h-[calc(100vh-2rem)] rounded-3xl p-5 lg:block">
          <h2 className="text-lg font-extrabold">Destaques</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="surface-soft rounded-2xl p-3">
              <p className="font-bold text-[var(--tw-brand)]">Tecnologia</p>
              <p className="mt-1 text-[var(--tw-muted)]">Conversas sobre React, Bun e TypeScript.</p>
            </div>
            <div className="surface-soft rounded-2xl p-3">
              <p className="font-bold text-[var(--tw-brand)]">Build limpo</p>
              <p className="mt-1 text-[var(--tw-muted)]">Feed com carregamento infinito e UI fluida.</p>
            </div>
            <div className="surface-soft rounded-2xl p-3">
              <p className="font-bold text-[var(--tw-brand)]">Tema dinâmico</p>
              <p className="mt-1 text-[var(--tw-muted)]">Troca de claro e escuro com persistencia.</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};
