import { createContext, useContext, useEffect, useState } from "react";
import type { PropsWithChildren } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");

    if (saved === "light" || saved === "dark") {
      return saved;
    }

    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }

    return "light";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    document.documentElement.classList.add("theme-switching");
    window.setTimeout(() => {
      document.documentElement.classList.remove("theme-switching");
    }, 360);

    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const value = {
    theme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  }
  return context;
};