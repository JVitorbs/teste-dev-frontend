import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";

vi.mock("../pages/AuthPage", () => ({
  AuthPage: () => <div>Auth Page Mock</div>,
}));

vi.mock("../pages/TimelinePage", () => ({
  TimelinePage: () => <div>Timeline Page Mock</div>,
}));

vi.mock("../components/ProtectedRoute", () => ({
  ProtectedRoute: () => <>{"Protected Outlet Mock"}</>,
}));

describe("App routes", () => {
  it("protege a rota raiz com ProtectedRoute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText("Protected Outlet Mock")).toBeInTheDocument();
  });

  it("renderiza auth na rota /auth", () => {
    render(
      <MemoryRouter initialEntries={["/auth"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText("Auth Page Mock")).toBeInTheDocument();
  });
});
