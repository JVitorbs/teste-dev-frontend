import type { Page, Route } from "@playwright/test";

type User = {
  id: number;
  name: string;
  email: string;
};

type Post = {
  id: number;
  title: string;
  content: string;
  image?: string | null;
  authorId: number;
  authorName: string;
  createdAt: string;
  likesCount: number;
};

type SetupMockApiOptions = {
  loginShouldFail?: boolean;
  currentUser?: User;
  token?: string;
  initialPosts?: Post[];
};

const defaultUser: User = {
  id: 1,
  name: "Joao Teste",
  email: "joao@teste.com",
};

const defaultPosts: Post[] = [
  {
    id: 1,
    title: "Meu post inicial",
    content: "Conteudo do meu post de teste.",
    image: null,
    authorId: 1,
    authorName: "Joao Teste",
    createdAt: new Date("2026-03-20T10:30:00.000Z").toISOString(),
    likesCount: 0,
  },
  {
    id: 2,
    title: "Post da comunidade",
    content: "Topico sobre frontend e DX.",
    image: null,
    authorId: 2,
    authorName: "Maria Dev",
    createdAt: new Date("2026-03-20T12:00:00.000Z").toISOString(),
    likesCount: 2,
  },
];

const extractIdFromPath = (url: string): number | null => {
  const match = url.match(/\/posts\/(\d+)(?:\/like)?$/);
  return match ? Number(match[1]) : null;
};

const parseJsonBody = async (route: Route): Promise<Record<string, unknown>> => {
  const raw = route.request().postData();
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
};

export const setupMockApi = async (page: Page, options: SetupMockApiOptions = {}) => {
  const token = options.token ?? "e2e-token";
  const currentUser = options.currentUser ?? defaultUser;
  const pageSize = 10;
  let nextPostId = 10;
  let posts = [...(options.initialPosts ?? defaultPosts)];
  const likedByMe = new Set<number>();

  await page.route("**/auth/register", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ message: "Conta criada com sucesso." }),
    });
  });

  await page.route("**/auth/login", async (route) => {
    if (options.loginShouldFail) {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Credenciais invalidas." }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        token,
        user: currentUser,
      }),
    });
  });

  await page.route("**/auth/logout", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.route("**/posts?*", async (route) => {
    const url = new URL(route.request().url());
    const pageParam = Number(url.searchParams.get("page") ?? "1");
    const searchParam = (url.searchParams.get("search") ?? "").trim().toLowerCase();

    const filtered = searchParam
      ? posts.filter((post) => {
          return (
            post.title.toLowerCase().includes(searchParam) ||
            post.content.toLowerCase().includes(searchParam)
          );
        })
      : posts;

    const start = Math.max(0, (pageParam - 1) * pageSize);
    const end = start + pageSize;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        posts: filtered.slice(start, end),
        total: filtered.length,
        page: pageParam,
        limit: pageSize,
      }),
    });
  });

  await page.route("**/posts", async (route) => {
    const method = route.request().method();

    if (method !== "POST") {
      await route.fallback();
      return;
    }

    const authHeader = route.request().headerValue("authorization");
    if (!authHeader) {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Nao autorizado." }),
      });
      return;
    }

    const body = await parseJsonBody(route);
    const newPost: Post = {
      id: nextPostId,
      title: String(body.title ?? "Sem titulo"),
      content: String(body.content ?? ""),
      image: body.image ? String(body.image) : null,
      authorId: currentUser.id,
      authorName: currentUser.name,
      createdAt: new Date().toISOString(),
      likesCount: 0,
    };

    nextPostId += 1;
    posts = [newPost, ...posts];

    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(newPost),
    });
  });

  await page.route("**/posts/*", async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    const postId = extractIdFromPath(url);

    if (!postId) {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: "Post nao encontrado." }),
      });
      return;
    }

    const postIndex = posts.findIndex((post) => post.id === postId);
    if (postIndex < 0) {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: "Post nao encontrado." }),
      });
      return;
    }

    const selectedPost = posts[postIndex];

    if (url.endsWith("/like") && method === "POST") {
      if (likedByMe.has(postId)) {
        likedByMe.delete(postId);
        selectedPost.likesCount = Math.max(0, selectedPost.likesCount - 1);
      } else {
        likedByMe.add(postId);
        selectedPost.likesCount += 1;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ liked: likedByMe.has(postId) }),
      });
      return;
    }

    if (selectedPost.authorId !== currentUser.id) {
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({ error: "Acao nao permitida." }),
      });
      return;
    }

    if (method === "PUT") {
      const body = await parseJsonBody(route);
      posts[postIndex] = {
        ...selectedPost,
        title: String(body.title ?? selectedPost.title),
        content: String(body.content ?? selectedPost.content),
        image: body.image ? String(body.image) : null,
      };

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(posts[postIndex]),
      });
      return;
    }

    if (method === "DELETE") {
      posts = posts.filter((post) => post.id !== postId);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
      return;
    }

    await route.fallback();
  });
};

export const seedAuthenticatedSession = async (page: Page, user: User = defaultUser, token = "e2e-token") => {
  await page.addInitScript(
    ({ storageUser, storageToken }) => {
      localStorage.setItem("mini-twitter-token", storageToken);
      localStorage.setItem("mini-twitter-user", JSON.stringify(storageUser));
    },
    { storageUser: user, storageToken: token },
  );
};
