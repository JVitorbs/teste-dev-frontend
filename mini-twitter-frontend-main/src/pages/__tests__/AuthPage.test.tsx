import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthPage } from "../AuthPage";

const navigateMock = vi.fn();
const setSessionMock = vi.fn();
const loginMock = vi.fn();
const registerMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    setSession: setSessionMock,
  }),
}));

vi.mock("../components/ThemeToggleButton", () => ({
  ThemeToggleButton: () => <button type="button">Tema</button>,
}));

vi.mock("../services/auth.service", () => ({
  authService: {
    login: (...args: unknown[]) => loginMock(...args),
    register: (...args: unknown[]) => registerMock(...args),
    logout: vi.fn(),
  },
}));

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("AuthPage", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    setSessionMock.mockReset();
    loginMock.mockReset();
    registerMock.mockReset();
  });

  it("faz login com sucesso e redireciona", async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue({
      token: "jwt-1",
      user: { id: 1, name: "Alice", email: "alice@example.com" },
    });

    renderPage();

    await user.type(screen.getByPlaceholderText("E-mail"), "alice@example.com");
    await user.type(screen.getByPlaceholderText("Senha"), "password123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith(
        {
          email: "alice@example.com",
          password: "password123",
        },
        expect.any(Object),
      );
    });

    expect(setSessionMock).toHaveBeenCalledWith("jwt-1", {
      id: 1,
      name: "Alice",
      email: "alice@example.com",
    });
    expect(navigateMock).toHaveBeenCalledWith("/timeline", { replace: true });
  });

  it("renderiza abas de login e registro", () => {
    renderPage();

    expect(screen.getByRole("tab", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Registrar" })).toBeInTheDocument();
  });
});
