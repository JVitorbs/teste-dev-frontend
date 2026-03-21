import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../ProtectedRoute";

const useAuthMock = vi.fn();

vi.mock("../context/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

describe("ProtectedRoute", () => {
  it("redireciona para /auth quando nao autenticado", () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false });

    render(
      <MemoryRouter initialEntries={["/timeline"]}>
        <Routes>
          <Route path="/auth" element={<div>Auth</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/timeline" element={<div>Timeline</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Auth")).toBeInTheDocument();
  });

  it("renderiza conteudo quando autenticado", () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true });

    render(
      <MemoryRouter initialEntries={["/timeline"]}>
        <Routes>
          <Route path="/auth" element={<div>Auth</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/timeline" element={<div>Timeline</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Timeline")).toBeInTheDocument();
  });
});
