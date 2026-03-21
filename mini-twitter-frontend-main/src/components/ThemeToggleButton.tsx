import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { Button } from "@/components/ui/button";

interface ThemeToggleButtonProps {
  className?: string;
}

export const ThemeToggleButton = ({ className }: ThemeToggleButtonProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={`group relative overflow-hidden rounded-full ${className ?? ""}`.trim()}
      aria-label={theme === "light" ? "Ativar tema escuro" : "Ativar tema claro"}
      title={theme === "light" ? "Ativar tema escuro" : "Ativar tema claro"}
    >
      <span className="absolute inset-0 rounded-full bg-[var(--tw-brand)]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <Sun
        className={`h-4 w-4 text-amber-500 transition-all duration-500 ${
          theme === "dark" ? "rotate-0 scale-100" : "-rotate-90 scale-0"
        }`}
      />
      <Moon
        className={`absolute h-4 w-4 text-sky-400 transition-all duration-500 ${
          theme === "light" ? "rotate-0 scale-100" : "rotate-90 scale-0"
        }`}
      />
    </Button>
  );
};
