import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggleButton } from "../ThemeToggleButton";

const useThemeMock = vi.fn();

vi.mock("../../context/ThemeContext", () => ({
  useTheme: () => useThemeMock(),
}));

describe("ThemeToggleButton", () => {
  it("mostra label de acao para tema escuro quando tema atual e claro", () => {
    useThemeMock.mockReturnValue({ theme: "light", toggleTheme: vi.fn() });

    render(<ThemeToggleButton />);

    expect(screen.getByRole("button", { name: "Ativar tema escuro" })).toBeInTheDocument();
  });

  it("chama toggleTheme ao clicar", async () => {
    const user = userEvent.setup();
    const toggleTheme = vi.fn();
    useThemeMock.mockReturnValue({ theme: "dark", toggleTheme });

    render(<ThemeToggleButton />);

    await user.click(screen.getByRole("button", { name: "Ativar tema claro" }));

    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });
});
