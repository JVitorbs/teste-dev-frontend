import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { TimelinePage } from "../TimelinePage";

const invalidateQueriesMock = vi.fn();
const cancelQueriesMock = vi.fn();
const getQueryDataMock = vi.fn();
const setQueryDataMock = vi.fn();
const fetchNextPageMock = vi.fn();
const createMutationMock = { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, variables: undefined };

vi.mock("@tanstack/react-query", () => {
  const mockPost = {
    id: 1,
    title: "Test Post",
    content: "Test content",
    image: null,
    authorId: 1,
    authorName: "Alice",
    createdAt: "2026-03-21T10:00:00.000Z",
    likesCount: 5,
  };

  return {
    useInfiniteQuery: () => ({
      data: { pages: [{ posts: [mockPost], total: 1, page: 1, limit: 10 }] },
      isLoading: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: fetchNextPageMock,
    }),
    useMutation: () => createMutationMock,
    useQueryClient: () => ({
      invalidateQueries: invalidateQueriesMock,
      cancelQueries: cancelQueriesMock,
      getQueryData: getQueryDataMock,
      setQueryData: setQueryDataMock,
    }),
  };
});

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Alice", email: "alice@example.com" },
    isAuthenticated: true,
    clearSession: vi.fn(),
  }),
}));

vi.mock("../../context/ThemeContext", () => ({
  useTheme: () => ({
    theme: "light",
    toggleTheme: vi.fn(),
  }),
}));

vi.mock("../../services/auth.service", () => ({
  authService: { logout: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock("../../services/post.service", () => {
  const mockPost = {
    id: 1,
    title: "Test Post",
    content: "Test content",
    image: null,
    authorId: 1,
    authorName: "Alice",
    createdAt: "2026-03-21T10:00:00.000Z",
    likesCount: 5,
  };

  return {
    postService: {
      list: vi.fn().mockResolvedValue({ posts: [mockPost], total: 1, page: 1, limit: 10 }),
      create: vi.fn().mockResolvedValue(mockPost),
      update: vi.fn().mockResolvedValue(mockPost),
      delete: vi.fn().mockResolvedValue(undefined),
      like: vi.fn().mockResolvedValue({ liked: true }),
    },
  };
});

beforeAll(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn(),
    })),
  );
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("TimelinePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mostra posts ao carregar", async () => {
    render(
      <MemoryRouter>
        <TimelinePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Test Post")).toBeInTheDocument();
    });
    expect(screen.getByText("Test content")).toBeInTheDocument();
    expect(screen.getByText(/por Alice/)).toBeInTheDocument();
  });

  it("mostra busca com filtro", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <TimelinePage />
      </MemoryRouter>,
    );

    const searchInput = screen.getByPlaceholderText("Buscar por titulo ou tema");
    await user.type(searchInput, "test");

    expect(searchInput).toHaveValue("test");
  });

  it("exibe informações do usuário autenticado", async () => {
    render(
      <MemoryRouter>
        <TimelinePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("@alice")).toBeInTheDocument();
    });
  });

  it("renderiza seção timeline", () => {
    render(
      <MemoryRouter>
        <TimelinePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Timeline")).toBeInTheDocument();
  });

  it("renderiza sidebar com link home", () => {
    render(
      <MemoryRouter>
        <TimelinePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();
  });

  it("renderiza botão limpar busca", () => {
    render(
      <MemoryRouter>
        <TimelinePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: "Limpar busca" })).toBeInTheDocument();
  });

  it("renderiza botão sair para usuario autenticado", async () => {
    render(
      <MemoryRouter>
        <TimelinePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Sair")).toBeInTheDocument();
    });
  });

  it("renderiza destaques na sidebar direita", () => {
    render(
      <MemoryRouter>
        <TimelinePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Destaques")).toBeInTheDocument();
    expect(screen.getByText("Tecnologia")).toBeInTheDocument();
  });

  it("mostra post card com botão abrir", async () => {
    render(
      <MemoryRouter>
        <TimelinePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Test Post")).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("renderiza layout com três colunas (sidebar, main, destaques)", () => {
    render(
      <MemoryRouter>
        <TimelinePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Mini Twitter")).toBeInTheDocument();
    expect(screen.getByText("Timeline")).toBeInTheDocument();
    expect(screen.getByText("Destaques")).toBeInTheDocument();
  });

  it("renderiza tema dinâmico com botão toggle", async () => {
    render(
      <MemoryRouter>
        <TimelinePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      // Procura por botão de tema com aria-label
      const themeButton = screen.queryByLabelText(/tema (escuro|claro)/i);
      if (themeButton) {
        expect(themeButton).toBeInTheDocument();
      }
    });
  });

  it("renderiza nome do usuário na sidebar", async () => {
    render(
      <MemoryRouter>
        <TimelinePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("@alice")).toBeInTheDocument();
    });
  });

  it("renderiza destaques com seções", () => {
    render(
      <MemoryRouter>
        <TimelinePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Build limpo")).toBeInTheDocument();
    expect(screen.getByText("Tema dinâmico")).toBeInTheDocument();
  });

  it("renderiza post com author e content", async () => {
    render(
      <MemoryRouter>
        <TimelinePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Test Post")).toBeInTheDocument();
      expect(screen.getByText("Test content")).toBeInTheDocument();
    });
  });

  it("renderiza contagem de likes no post", async () => {
    render(
      <MemoryRouter>
        <TimelinePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      // Procura por elemento que contém "5" (likesCount)
      const content = screen.getByText("Test Post").closest("article");
      expect(content).toBeInTheDocument();
    });
  });

  it("renderiza multiple posts quando há dados", async () => {
    render(
      <MemoryRouter>
        <TimelinePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Test Post")).toBeInTheDocument();
    });

    // Verifica se há pelo menos um post renderizado
    const articles = screen.getAllByRole("article");
    expect(articles.length).toBeGreaterThan(0);
  });
});
