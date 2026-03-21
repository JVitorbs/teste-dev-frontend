import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";

vi.mock("./pages/AuthPage", () => ({
  AuthPage: () => <div>Auth Page Mock</div>,
}));

vi.mock("./pages/TimelinePage", () => ({
  TimelinePage: () => <div>Timeline Page Mock</div>,
}));

vi.mock("./components/ProtectedRoute", () => ({
  ProtectedRoute: () => <>{"Protected Outlet Mock"}</>,
}));

describe("App routes", () => {
  it("renderiza timeline na rota raiz", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText("Timeline Page Mock")).toBeInTheDocument();
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
