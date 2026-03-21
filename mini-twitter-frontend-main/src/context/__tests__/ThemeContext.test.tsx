import { render, screen } from "@testing-library/react";
import { act, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../ThemeContext";

const Consumer = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <p>{theme}</p>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  );
};

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
    document.documentElement.classList.remove("dark", "theme-switching");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("inicia com light e alterna para dark", async () => {
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );

    expect(screen.getByText("light")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "toggle" }));

    expect(screen.getByText("dark")).toBeInTheDocument();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("theme-switching")).toBe(true);

    act(() => {
      vi.advanceTimersByTime(360);
    });

    expect(document.documentElement.classList.contains("theme-switching")).toBe(false);
  });

  it("usa tema salvo no localStorage", () => {
    localStorage.setItem("theme", "dark");

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );

    expect(screen.getByText("dark")).toBeInTheDocument();
  });
});
