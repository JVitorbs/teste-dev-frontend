import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "../AuthContext";

const setTokenMock = vi.fn();
const setUserMock = vi.fn();
const clearSessionMock = vi.fn();

vi.mock("../lib/storage", () => ({
  storage: {
    getToken: () => null,
    getUser: () => null,
    setToken: (...args: unknown[]) => setTokenMock(...args),
    setUser: (...args: unknown[]) => setUserMock(...args),
    clearSession: () => clearSessionMock(),
  },
}));

const Consumer = () => {
  const { isAuthenticated, setSession, clearSession, user } = useAuth();

  return (
    <div>
      <p>{isAuthenticated ? "auth" : "guest"}</p>
      <p>{user?.name ?? "sem-user"}</p>
      <button onClick={() => setSession("token-1", { id: 1, name: "Alice", email: "alice@example.com" })}>login</button>
      <button onClick={clearSession}>logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    setTokenMock.mockReset();
    setUserMock.mockReset();
    clearSessionMock.mockReset();
  });

  it("seta e limpa sessao", async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    expect(screen.getByText("guest")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "login" }));

    expect(screen.getByText("auth")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(setTokenMock).toHaveBeenCalledWith("token-1");
    expect(setUserMock).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "logout" }));

    expect(screen.getByText("guest")).toBeInTheDocument();
    expect(clearSessionMock).toHaveBeenCalled();
  });

  it("lanca erro se useAuth for usado fora do provider", () => {
    const Broken = () => {
      useAuth();
      return null;
    };

    expect(() => render(<Broken />)).toThrow("useAuth deve ser usado dentro de AuthProvider");
  });
});
