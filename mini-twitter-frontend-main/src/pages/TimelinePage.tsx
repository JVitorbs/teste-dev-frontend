import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import type { PostSchema } from "../schemas/post";
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
      const previous = queryClient.getQueryData(queryKey(search));

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

  const allPosts = useMemo(() => {
    return postsQuery.data?.pages.flatMap((page) => page.posts) ?? [];
  }, [postsQuery.data]);

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
    <main className="mx-auto min-h-screen w-full max-w-6xl px-2 md:px-4">
      <div className="mx-auto grid max-w-4xl grid-cols-1 md:grid-cols-[1fr,2.2fr]">
        <aside className="hidden border-r border-slate-200 px-4 py-6 md:block dark:border-slate-700">
          <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Mini Twitter</p>
          {user ? (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">@{user.name.toLowerCase().replace(/\s+/g, "")}</p>
          ) : (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Explore a timeline sem login.</p>
          )}

          {isAuthenticated ? (
            <button
              onClick={() => logoutMutation.mutate()}
              className="mt-6 w-full rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {logoutMutation.isPending ? "Saindo..." : "Sair"}
            </button>
          ) : (
            <div className="mt-6 space-y-2">
              <button
                onClick={() => navigate("/auth")}
                className="w-full rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
              >
                Entrar
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Criar conta
              </button>
            </div>
          )}
        </aside>

        <section className="min-h-screen border-x border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Pagina inicial</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="rounded-full bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {theme === "light" ? "🌙" : "☀️"}
                </button>
                {isAuthenticated ? (
                  <button
                    onClick={() => logoutMutation.mutate()}
                    className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white md:hidden"
                  >
                    Sair
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/auth")}
                    className="rounded-full bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white md:hidden"
                  >
                    Entrar
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar no Mini Twitter"
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition focus:border-sky-500 focus:bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-700"
              />
            </div>
          </header>

          {isAuthenticated ? (
            <div className="border-b border-slate-200 p-4">
              <PostComposer
                loading={createMutation.isPending}
                onSubmitPost={async (payload) => {
                  await createMutation.mutateAsync(payload);
                }}
              />
            </div>
          ) : (
            <div className="border-b border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
              Faça login para publicar, editar, deletar e curtir posts.
            </div>
          )}

          {message ? <p className="m-4 rounded-xl bg-slate-100 p-3 text-sm text-slate-700">{message}</p> : null}

          <section>
            {postsQuery.isLoading ? <p className="p-4">Carregando posts...</p> : null}
            {postsQuery.isError ? <p className="p-4 text-sm text-red-600">{getApiError(postsQuery.error, "Erro ao carregar timeline.")}</p> : null}

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
              <p className="p-4 text-center text-sm text-slate-500">Carregando mais posts...</p>
            ) : null}
          </section>
        </section>
      </div>
    </main>
  );
};
